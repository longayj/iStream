import { Router, Request, Response } from 'express';

import {Video, Statistics, CastingShort, Streaming} from '../entity'
import { createConnection } from 'typeorm';
import { AlloCineApi, AllDebridApi } from '../Utils';
import Axios from '../../node_modules/axios';
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";


const router: Router = Router();


createConnection(/*...*/).then(async connection => {
    
// route get /videos
router.get('/', (req: Request, res: Response) => {
    connection.getRepository(Video).find({relations: ["statistics", "streaming", "castingShort"]})
    .then(videos => {
        if (videos == undefined || videos == null) {
            res.status(404).send("No videos sorry :(");
            return;
        }
       res.send(videos);
    }).catch(err => {
        console.log(err);
        res.send("Error to find videos");
    })
});


//{
//  title: 'titleVideo',
//  url: 'urlVideo'
//}
// route post /videos
router.post('/', (req: Request, res: Response) => {
    let bodyUrl = req.body.url;
    let bodyCode = req.body.code;
    console.log("Try to post new video")
    console.log(req.body)
    console.log(req.code)
    if (bodyUrl != null && bodyUrl != undefined
        && bodyCode != null && bodyCode != undefined) {

        let newVideo = new Video
        // need to debrid url and change it
        newVideo.url = bodyUrl;
        // pour les autre champs, 
        // utiliser une api allociné et alldebrid et save ensuite 
        console.log(" Allocine")
        AlloCineApi.searchMovie(bodyCode, (err, result) => {
            if (err || result.movie == undefined) {
                console.log('Error : '+ err);
                res.status(400).send("Bad movie code");
                return;
            }
            let movie = result.movie;
            
            //console.log("Result Allocine API : ")
            //console.log(result);
            if (movie.synopsis != undefined) {
                newVideo.synopsis = movie.synopsis;
            }
            if (movie.synopsisShort != undefined) {
                newVideo.description = movie.synopsisShort;
            }
            //console.log(movie)
            if (movie.title != undefined)
                newVideo.title = movie.title;
            else
                newVideo.title = movie.originalTitle;
            newVideo.originalTitle = movie.originalTitle;
            newVideo.productionYear = movie.productionYear
            if (movie.poster != undefined && movie.poster.href != undefined)
                newVideo.posterUrl = movie.poster.href;
            if (movie.release != undefined && movie.release.releaseDate != undefined)
                newVideo.releaseDate = new Date(movie.release.releaseDate);
     
            // si casting short create !!
            if (movie.castingShort != undefined) {
                let castingShort = new CastingShort
                castingShort.actors = movie.castingShort.actors
                castingShort.directors = movie.castingShort.directors
                connection.manager.save(castingShort)
                .then(castingShort => {
                
                    newVideo.castingShort = castingShort;
                    
                }).catch(err => {
                    res.status(500).send("fail to save castingShort")
                    return
                })

                // regarde si ya des stat
                if (movie.statistics != undefined) {
                    let statistics = new Statistics;
                    if (movie.statistics.pressRating != undefined)
                        statistics.pressRating = movie.statistics.pressRating;
                    if (movie.statistics.userRating != undefined)
                        statistics.userRating = movie.statistics.userRating;
                    // save Statistic
                    connection.manager.save(statistics)
                    .then(statistic => {
                        newVideo.statistics = statistic

                        // continue de save la video    
                        console.log(" AllDebrid")
                        //  alldebrid to get more information
                        AllDebridApi.getUnlockLink(bodyUrl)
                        .then(result => {
                            //
                            if (!result.data.success || result.data.error) {
                                console.log(result.data)
                                console.log("fail to get information on this link")
                                res.status(400).send(result.data.error)
                                return
                            }
                            if (result.data.infos != undefined &&  result.data.infos.streaming != undefined) {
                                let streaming = new Streaming
                                let receivedStreaming = result.data.infos.streaming;

                                if (result.data.infos.link != undefined) {
                                    newVideo.downloadLink = result.data.infos.link;
                                    newVideo.filename = result.data.infos.filename;
                                }

                                console.log(receivedStreaming)

                                StreamingLinkToStreaming(receivedStreaming, streaming);

                                //newVideo.streaming = streaming;
                                //streaming.video = newVideo;
                                connection.manager.save(streaming)
                                .then(streaming => {
                                     console.log("Streaming save !!")
                                    newVideo.streaming = streaming;
                                     console.log("try to save this video : ")
                                     console.log(newVideo);
                                     connection.manager.save(newVideo)
                                     .then((video) => {
                                         console.log('new video add');
                                         console.log(video);
                                         res.status(200).send(video);
                                     }).catch(err => {
                                         console.log(err)
                                         res.status(500).send("Fail to save new video")
                                     })
                                 }).catch(err => {
                                     console.log(err);
                                     console.log("fail to save Streaming")
                                     res.status(500).send("Fail to save Streaming 2")
                                 });

                            } else {
                                res.status(500).send("No streaming link with your url sorry :(")
                            }

                        }).catch(err => {
                            res.status(500).send("Fail to getUnlock")
                        })

                    }).catch(err => {
                        res.status(500).send("fail to save Statistics")
                        // error 
                        console.log(err)
                    })
                } else {
                    // create movie sans statistic
                    console.log(" AllDebrid")
                    //  alldebrid to get more information
                    AllDebridApi.getUnlockLink(bodyUrl)
                    .then(result => {
                        //
                        if (!result.data.success || result.data.error) {
                            console.log(result.data)
                            console.log("fail to get information on this link")
                            res.status(400).send(result.data.error)
                            return
                        }
                        if (result.data.infos != undefined &&  result.data.infos.streaming != undefined) {
                            if (result.data.infos.link != undefined) {
                                newVideo.downloadLink = result.data.infos.link;
                                newVideo.filename = result.data.infos.filename;
                            }
                            
                            let streaming = new Streaming
                            StreamingLinkToStreaming(result.data.infos.streaming, streaming);
                            //
                            //streaming.video = newVideo;
                            connection.manager.save(streaming).then(streaming => {
                                console.log("Streaming save !!")
                                newVideo.streaming = streaming;
                                console.log("try to save this video : ")
                                console.log(newVideo);
                                connection.manager.save(newVideo)
                                .then((video) => {
                                    console.log('new video add');
                                    console.log(video);
                                    res.status(200).send(video);
                                }).catch(err => {
                                    console.log(err)
                                    res.status(500).send("Fail to save new video")
                                })
                            }).catch(err => {
                                console.log(err);
                                console.log("fail to save Streaming 3")
                            });
                        }

                    }).catch(err => {
                        res.status(500).send("Fail to getUnlock")
                    })
                }   
            } else {
                // create movie sans castingShort
                console.log(" AllDebrid")
                //  alldebrid to get more information
                AllDebridApi.getUnlockLink(bodyUrl)
                .then(result => {
                    //
                    if (!result.data.success || result.data.error) {
                        console.log(result.data)
                        console.log("fail to get information on this link")
                        res.status(400).send(result.data.error)
                        return
                    }
                    if (result.data.infos != undefined &&  result.data.infos.streaming != undefined) {
                        if (result.data.infos.link != undefined) {
                            newVideo.downloadLink = result.data.infos.link;
                            newVideo.filename = result.data.infos.filename;
                        }
                        
                        let streaming = new Streaming
                        StreamingLinkToStreaming(result.data.infos.streaming, streaming);
                        //newVideo.streaming = streaming;
                        //streaming.video = newVideo;
                        connection.manager.save(streaming).then(streaming => {
                            console.log("Streaming save !!")

                            // streaming save !!

                            console.log("try to save this video : ")
                            console.log(newVideo);
                            connection.manager.save(newVideo)
                            .then((video) => {
                                console.log('new video add');
                                console.log(video);
                                res.status(200).send(video);
                            }).catch(err => {
                                console.log(err)
                                res.status(500).send("Fail to save new video")
                            })

                        }).catch(err => {
                            console.log(err);
                            console.log("fail to save Streaming")
                            res.status(500).send("Fail to save Streaming")
                        });
                    } else {
                        res.status(400).send("No Streaming link with your url :( sorry")
                    }

                }).catch(err => {
                    res.status(500).send("Fail to getUnlock")
                })
            }
        });
    } else {
        res.status(400).send("Invalid model video : { title: '', url: '', code: 'code return by /'}")
    }
});

/**
 * Get one movie by id
 *  @param id the movie id
 *  GET /videos/:id
 */
router.get('/:id', (req: Request, res: Response) => {
    let id = req.params.id;

    connection.getRepository(Video)
    .findOne({where: {id: id}, relations: ["statistics", "streaming", "castingShort"]})
    .then(video => {
        console.log(video)
        if (video == undefined || video == null) {
            console.log("Video not found " + id)
            res.status(404).send("Video not found")
            return;
        }

        // refresh a chaque get /video/:id
        AllDebridApi.getUnlockLink(video.url).then((result) => {
            if (!result.data.success || result.data.error) {
                console.log(result.data)
                console.log("fail to get information on this link")
                res.status(400).send(result.data.error)
                return
            }
            if (result.data.infos != undefined &&  result.data.infos.streaming != undefined) {
                if (result.data.infos != undefined &&  result.data.infos.streaming != undefined) {
                    if (result.data.infos.link != undefined) {
                        video.downloadLink = result.data.infos.link;
                        video.filename = result.data.infos.filename;
                    }
                    let streaming = new Streaming
                    StreamingLinkToStreaming(result.data.infos.streaming, streaming);
                    //newVideo.streaming = streaming;
                    //streaming.video = newVideo;
                    connection.manager.save(streaming)
                    .then(streaming => {
                        console.log("Streaming save !!")
                        video.streaming = streaming;
                        console.log("try to update this video : " + video.id)
                        console.log(video);
                        connection.manager.save(video)
                        .then((video) => {
                            console.log('video updated');
                            console.log(video);
                            res.status(200).send(video);
                        }).catch(err => {
                            console.log(err)
                            res.status(500).send("Fail to update new video")
                        })
                    }).catch(err => {
                        console.log(err);
                        console.log("fail to save Streaming")
                        res.status(500).send("Fail to save Streaming In Get")
                    });
                } else {
                    res.status(500).send("No streaming link with your url sorry :(")
                }
            } else {
                res.status(500).send("Fail to refresh data :(")
            }
        }).catch(err => {
            res.status(500).send("fail to refresh data")
        })
        // fin du refresh a chaque get /video/:id

        // pour juste return la video 
        //res.status(200).send(video);

        // fin du return juste video 

        // essai test link avant de le refresh
        // Axios.get(video.streaming.p360).then(result => {
        //     console.log(result)
        //     res.send(video);
        // }).catch(err => {
        //     console.log(err)
        //     console.log("error to get 360p streaming ling try to refresh it")
        //     // si un des lien streaming est down, les regenerer avec le lien de la video de base
        //     // penser a res quelque chose
        // })
        // fais du test pour tester le lien avant refresh
    }).catch(err => {
        console.log(err)
        res.status(500).send("Fail to get video :(")
    })

});

/**
 * Delete one movie by id
 * @param id the movie id
 * DELETE /videos/:id
 */
router.delete('/:id', [checkJwt, checkRole(["ADMIN"])], (req: Request, res: Response) => {
    let id = req.params.id;
    connection.getRepository(Video).findOne({where: {id: id}, relations: ["statistics", "streaming", "castingShort"]}).then(video => {
        if (video == undefined || video == null) {
            console.log("Video not found " + id)
            res.status(404).send("Video not found")
            return;
        }
        console.log("delete video : ")
        console.log(video)
        connection.getRepository(Video).remove(video)
        .then((videoRemoved) => {
            console.log("result video : ")
            console.log(video)
            if (video.streaming != null)
                connection.getRepository(Streaming).remove(video.streaming).then().catch();
            if (video.castingShort != null)
                connection.getRepository(CastingShort).remove(video.castingShort).then().catch();
            if (video.statistics != null)
                connection.getRepository(Statistics).remove(video.statistics).then().catch();
            res.status(200).send("Delete Ok")
            return;
        }).catch(err => {
            res.status(500).send("Fail to delete this video sorry :(")
            return;
        })
    }).catch(err => {
        console.log(err);
        res.status(500).send("fail to findById during delete video " + id);
    })
});

}).catch(error => {
    console.log(error)
});

export const VideoController: Router = router;


function StreamingLinkToStreaming(receivedStreaming:any, streaming:Streaming) {
    if (receivedStreaming["360p unknown 0"] != undefined) {
        streaming.fr360p = receivedStreaming["360p unknown 0"];
    }
    if (receivedStreaming["480p unknown 0"] != undefined) {
        streaming.fr480p = receivedStreaming["480p unknown 0"];
    }
    if (receivedStreaming["720p unknown 0"] != undefined) {
        streaming.fr720p = receivedStreaming["720p unknown 0"];
    }
    if (receivedStreaming["1080p unknown 0"] != undefined) {
        streaming.fr1080p = receivedStreaming["1080p unknown 0"];
    }
    // 720p fre / 720p en 
    if (receivedStreaming["360p fre"] != undefined) {
        streaming.fr360p = receivedStreaming["360p fre"];
    }
    if (receivedStreaming["480p fre"] != undefined) {
        streaming.fr480p = receivedStreaming["480p fre"];
    }
    if (receivedStreaming["720p fre"] != undefined) {
        streaming.fr720p = receivedStreaming["720p fre"];
    }
    if (receivedStreaming["1080p fre"] != undefined) {
        streaming.fr1080p = receivedStreaming["1080p fre"];
    }

    if (receivedStreaming["360p French"] != undefined) {
        streaming.fr360p = receivedStreaming["360p French"];
    }
    if (receivedStreaming["480p French"] != undefined) {
        streaming.fr480p = receivedStreaming["480p French"];
    }
    if (receivedStreaming["720p French"] != undefined) {
        streaming.fr720p = receivedStreaming["720p French"];
    }
    if (receivedStreaming["1080p French"] != undefined) {
        streaming.fr1080p = receivedStreaming["1080p French"];
    }

    if (receivedStreaming["360p eng"] != undefined) {
        streaming.en360p = receivedStreaming["360p eng"];
    }
    if (receivedStreaming["480p eng"] != undefined) {
        streaming.en480p = receivedStreaming["480p eng"];
    }
    if (receivedStreaming["720p eng"] != undefined) {
        streaming.en720p = receivedStreaming["720p eng"];
    }
    if (receivedStreaming["1080p eng"] != undefined) {
        streaming.en1080p = receivedStreaming["1080p eng"];
    }
}