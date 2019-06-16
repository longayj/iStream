import { Router, Request, Response } from 'express';
import {Like as MyLike} from '../entity/Like'
import {Video, Statistics, CastingShort, Streaming, Like, Comment} from '../entity'
import {User as MyUser} from '../entity/User'
import { createConnection} from 'typeorm';
import {Like as like} from 'typeorm'
import { AlloCineApi, AllDebridApi } from '../Utils';
import Axios from '../../node_modules/axios';
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";


const router: Router = Router();


createConnection(/*...*/).then(async connection => {
    
// route get /videos
router.get('/', (req: Request, res: Response) => {
    let page = req.query.page || 0
    let per_page = req.query.per_page || 10
    // limit superieur du nombre par page
    if (per_page > 100)
        per_page = 100
    // limit inferieur du nombre par page
    if (per_page <= 0)
        per_page = 1
    // limit inferieur des page
    if (page <= 0)
        page = 1
    // les page commence a 0 donc -- 
    --page

    let mywhere:any = {
    }
    let q = req.query.q || undefined
    if (q != undefined) {
        mywhere = [
            {originalTitle: like("%" + q + "%")},
            {title: like("%" + q + "%")},
            {description: like("%" + q + "%")},
            {actors: like("%" + q + "%")},
            {directors: like("%" + q + "%")}
        ]
        //console.log("mywhere set !")
    }
    connection.getRepository(Video)
    .findAndCount({
        relations: ["statistics", "streaming", "castingShort", "likes", "comments"],
        where: mywhere,
        skip: page * per_page,
        take: per_page
    })
    .then(videos => {
        let testvideos: [any[], Number] = videos
        console.log(videos)
        if (videos[0] == undefined || videos[0] == null) {
            res.status(404).send("No videos sorry :(");
            return;
        }
        let videoRes:any = new Object
        videoRes.per_page = per_page
        videoRes.page = page + 1
        let count = videos[1]
        if (count / per_page < 1)
            videoRes.total_page = 1
        else
            videoRes.total_page = Math.ceil(count / per_page)
        videoRes.total_videos = count
        for (let i = 0; i < testvideos[0].length; i++) {
            testvideos[0][i].total_likes = testvideos[0][i].likes.length
        }
        videoRes.videos = testvideos[0]
        res.send(videoRes);
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
router.post('/', [checkJwt], (req: Request, res: Response) => {
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
        AlloCineApi.searchMovie(bodyCode, async (err, result) => {
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
            newVideo.actors = movie.castingShort.actors
            newVideo.directors = movie.castingShort.directors
            let user = await connection.getRepository(MyUser).findOne(res.locals.jwtPayload.userId)
            //newVideo.userId = res.locals.jwtPayload.userId
            newVideo.user = user
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
                                NewStreamingLingToStreamin(result.data.infos.streams, streaming);
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
                            NewStreamingLingToStreamin(result.data.infos.streams, streaming);
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
                        NewStreamingLingToStreamin(result.data.infos.streams, streaming);
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
    .findOne({where: {id: id}, relations: ["statistics", "streaming", "castingShort", "likes", "comments"]})
    .then(video => {
        console.log(video)
        if (video == undefined || video == null) {
            console.log("Video not found " + id)
            res.status(404).send("Video not found")
            return;
        }
        /*
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
        */
        // fin du refresh a chaque get /video/:id

        // pour juste return la video
        let testVideo:any = video
        testVideo.total_likes = video.likes.length 
        res.status(200).send(testVideo);

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

router.get("/:id/comment", (req: Request, res: Response) => {

})

router.post("/:id/comment", [checkJwt], (req: Request, res: Response) => {
    let jwttoken = res.locals.jwtPayload
    console.log("User ", jwttoken.userId, " try to post comment to video id ", req.params.id)
    if (isNaN(Number.parseInt(req.params.id))) {
        return res.status(400).send({
            message: "Bad request"
        })
    }
    let value = req.body.value
    console.log("Value : ", value, " body ", req.body)
    if (value == undefined)
        return res.status(400).send('Bad Request')
    let idVideo = req.params.id
    let userId = jwttoken.userId

    let newComment = new Comment
    connection.getRepository(MyUser).findOne({
        where: {
            id : jwttoken.userId
        }
    }).then(user => {
        console.log(user)
        let username = user.username
        console.log("username ", username)
        newComment.value = value
        newComment.userId = userId;
        newComment.videoId = idVideo
        newComment.username = username
        console.log("Comment to add ", newComment)
        connection.manager.save(newComment).then(comment => {
            return res.send(comment)
        }).catch( err => {
            console.log(err)
            return res.status(500).send('Fail to add Comment');
        })
    }).catch(err => {
        console.log(err)
        return res.status(500).send({message: "Fail to get user"})
    })
})

router.post('/:id/likes', [checkJwt], (req: Request, res: Response) => {
    let jwttoken = res.locals.jwtPayload
    console.log("User ", jwttoken.userId, " try to like video id ", req.params.id)
    if (isNaN(Number.parseInt(req.params.id))) {
        return res.status(400).send({
            message: "Bad request"
        })
    }
    
    connection.getRepository(Video)
    .findOne({where: {id: req.params.id}, relations: ["statistics", "streaming", "castingShort", "likes"]})
    .then(async video => {
        console.log(video)
        if (video == undefined || video == null)
            return res.status(404).send({
                message: "Video id " + req.params.id + " not found"
            })
        if (video.likes.length > 0) {
            console.log("verifie si le mec a pas deja like la photo")
            var alreadyAdd = false;
            video.likes.forEach(like => {
                if (like.userId == jwttoken.userId)
                    alreadyAdd = true;
            })
            if (alreadyAdd) {
                res.status(403).send({
                    message : "Picture " + video.id + " already like by " + req.params.id
                })
            }  else {
                let newLike = new MyLike;
                newLike.userId = jwttoken.userId;
                // on met ce qu'on veut c'est genre le type de like
                newLike.value = "1";
                newLike.video = video;
                newLike = await connection.manager.save(newLike)
                delete newLike.video
                return res.send(newLike)
            }
        } else {
            let newLike = new MyLike;
            newLike.userId = jwttoken.userId;
            newLike.value = "1";
            newLike.video = video;
            newLike = await connection.manager.save(newLike)
            delete newLike.video
            return res.send(newLike)
        }
    }).catch(err => {
        console.log(err)
        return res.status(500).send({
            message: "Fail to get videos"
        })
    })
})

router.delete('/:id/likes/:idLike', [checkJwt], (req: Request, res: Response) => {
    let jwttoken = res.locals.jwtPayload
    console.log("User ", jwttoken.userId, " try to delete like on video id ", req.params.id)
    if (isNaN(Number.parseInt(req.params.id))
        || isNaN(Number.parseInt(req.params.idLike))) {
        return res.status(400).send({
            message: "Bad request"
        })
    }
    connection.getRepository(Video).findOne({
        where:{
            id: req.params.id
        },
        relations:["likes"]
    }).then(video => {
        if (video == undefined || video == null)
            return res.status(404).send({
                message: "video id not found"
            })
        for (let i = 0; i < video.likes.length; i++) {
            if (video.likes[i].userId == jwttoken.userId)
            {
                // il a bien like la video 
                // essai de suppression
                connection.getRepository(MyLike).findOne({
                    where: {
                        id: req.params.idLike
                    }
                }).then(like => {
                    if (like == undefined || like == null)
                        return res.status(404).send({
                            message: "id like not found"
                        })
                    connection.getRepository(MyLike).remove(like)
                    .then(like => {
                        console.log("like delete ", like)
                        return res.send({
                            message: 'like delete'
                        })
                    }).catch(err => {
                        console.log(err)
                        return res.status(500).send({
                            message: 'fail to delete like'
                        })
                    })
                }).catch(err => {
                    console.log(err)
                    return res.status(500).send({
                        message: "fail to get like"
                    })
                })
            }
        }
        if (video.likes.length == 0)
            return res.status(404).send({
                message: "id like not found"
            })
    }).catch(err => {
        console.log(err)
        return res.status(500).send("fail to get video")
    })
    
})

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

function NewStreamingLingToStreamin(receivedStreaming:any, streaming:Streaming) {
    receivedStreaming.forEach(stream => {
        if (stream.quality == 360)
            streaming.fr360p = stream.link
        if (stream.quality == 480)
            streaming.fr480p = stream.link
        if (stream.quality == 720)
            streaming.fr720p = stream.link
        if (stream.quality == 1080)
            streaming.fr1080p = stream.link
    })
}

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