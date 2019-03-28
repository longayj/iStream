import { Router, Request, Response } from 'express';
import { ZoneTelechargementApi, AllDebridApi } from '../Utils';
import { Streaming, Video } from '../entity';
import { VideoController } from './VideoController';
import { createConnection } from 'typeorm';

const router: Router = Router();

createConnection(/*...*/).then(async connection => {
    
// route get /search?q="your search"
router.get('/', (req: Request, res: Response) => {
    let q = req.query.q;
    let filter = req.query.filter;
    console.log('get !!')
    if (filter == undefined)
        filter = "movie"
    console.log(filter)
    if (q != null && q != undefined) {
        ZoneTelechargementApi.search(q)
        .then(results => {
            //console.log(results)
            res.status(200).send(results);
        }).catch(err => {
            res.status(500).send("Error Server, Fail to do zone telechargement search");
        })
    } else {
        res.status(500).send("missing q parameter in request")
    }
});

router.post('/',  (req: Request, res: Response) => {
    // add un films a partir d'un lien zone telechargement si il contient bien un lien debridable alldebrid
    let urlZone = req.body.url;
    let title = req.body.title
    let imageUrl = req.body.imageUrl;
    if (urlZone != undefined) {
        ZoneTelechargementApi.getDetails(urlZone)
        .then(results => {
            let found = false;
            let debridLink = null;
            console.log(results)
            if (results.links.length == 1) {
                console.log("no stream link, on va regarder si on peut creer une serie")
                // link serie
                let i = 0
                results.linksSerie.forEach((link) => {
                    if (found) {
                        console.log('you have already find a link Serie !!')
                        return
                    }
                    console.log('try to get link to protect link : ' + link)
                    AllDebridApi.getSynchroneProtectLink(link)
                    .then(resultAllDebrid => {
                        if (resultAllDebrid.status != 200
                            || !resultAllDebrid.data.success
                            || (resultAllDebrid.data.links != undefined
                                && resultAllDebrid.data.links.length > 1)
                            || resultAllDebrid.data.error != undefined) {
                            console.log('Fail to get your link with url ' + link)
                            console.log(resultAllDebrid.data.error);
                            found = false
                            console.log(i + " links length : " + results.links.length)
                            if (i == results.links.length)
                                return res.status(400).send("Sorry, No streaming links with your serie url :(")
                        } else if (!found) {
                            found = true;
                            console.log("Streming link found !!!") // found debrid link 
                            //console.log(resultsUnlock.data.infos)
                            console.log(resultAllDebrid.data.links)
                            debridLink = resultAllDebrid.data.links[0]

                            // si links > 1 je pense que c'est une saison complete surment
                            if (resultAllDebrid.data.links.length > 2) {
                                console.log("link nomber > 1")
                                return res.status(500).send("Sorry, les series entières ne sont pas encore suporté ^^")
                            }
                            AllDebridApi.getSynchroneUnlockLink(debridLink)
                            .then(resultsUnlock => {
                                console.log("result Unlock ::::: ")
                                if (resultsUnlock.status != 200 || !resultsUnlock.data.success) {
                                    console.log(resultsUnlock.data)
                                    found = false
                                    return res.status(400).send("Sorry, No streaming links with your url :(")
                                    //return;
                                } else {
                                    console.log("link found !!!!!!!!!! for " + title)
                                    console.log(resultsUnlock.data.infos)
                                    found = true;
                                    // on a des lien normalement
                                    let streaming = new Streaming
                                    StreamingLinkToStreaming(resultsUnlock.data.infos.streaming, streaming);
                                    if (isEmpty(streaming)) {
                                        // try link video
                                        found = false; //
                                        return res.status(500).send('Sorry, no streaming link found')
                                    } else {
                                        saveVideoAndResponse(streaming, title, debridLink, imageUrl, res);
                                    }
                                }
                            }).catch(err => {
                                console.log(err)
                                return res.status(500).send('Error to unlock your link sorry :(')
                            })
                        }
                    }).catch(err => {
                        console.log(err)
                        return res.status(500).send("Sorry, Error in debrid proteck link")
                    })
                    ++i;
                });
                //console.log("OLOLOLOLO, No streaming link et deja en desous du else 1")
                //return res.send("OLOLOLOLO, No streaming link");
            } else if (results.links.length > 0) {
                // link films
                let i = 0;
                results.links.forEach(link => {
                    if (found) {
                        console.log('you have already find a link')
                        return
                    }
                    console.log('try to get link to protect link : ' + link)
                    AllDebridApi.getSynchroneProtectLink(link)
                    .then(resultAllDebrid => {
                        if (resultAllDebrid.status != 200
                            || !resultAllDebrid.data.success
                            || (resultAllDebrid.data.links != undefined
                                && resultAllDebrid.data.links.length == 0)
                            || resultAllDebrid.data.error != undefined) {
                            console.log('Fail to get your link with url ! ' + link)
                            console.log(resultAllDebrid.data.error);
                            
                        } else if (!found) {
                            console.log('link found !')
                            console.log(resultAllDebrid.data.links)
                            debridLink = resultAllDebrid.data.links[0]
                            found = true;
                            // on a le bon lien normalement on essaie de le debrider avec alldebrid pour creer une nouvelle video
                            AllDebridApi.getSynchroneUnlockLink(debridLink)
                            .then(resultsUnlock => {
                                console.log("result Unlock ::::: ")

                                if (resultsUnlock.status != 200 || !resultsUnlock.data.success) {
                                    console.log(resultsUnlock.data)
                                    found = false
                                    console.log(i + " links length : " + results.links.length)
                                    if (i == results.links.length)
                                        return res.status(400).send("Sorry, No streaming links with your url :(")
                                    //return;
                                } else {
                                    console.log("link found !!!!!!!!!! for " + title)
                                    console.log(resultsUnlock.data.infos)
                                    found = true;
                                    // on a des lien normalement
                                    let streaming = new Streaming
                                    StreamingLinkToStreaming(resultsUnlock.data.infos.streaming, streaming);
                                    if (isEmpty(streaming)) {
                                        // try link video
                                        found = false;
                                        return res.status(500).send('Sorry, no streaming link found')
                                    } else {
                                        saveVideoAndResponse(streaming, title, debridLink, imageUrl, res);
                                    }
                                }
                            }).catch(err => {
                                console.log(err)
                                return res.status(500).send('Error to unlock your link sorry :(')
                            })
                        }
                    }).catch(err => {
                        console.log(err)
                        return res.status(500).send('error in server search')
                    })
                    ++i;
                });
                //console.log("OLOLOLOLO, No streaming link et deja en desous du else 2")
                //return res.send("OLOLOLOLO, No streaming link");
            } else {
                console.log("OLOLOLOLOALALALAL")
                return res.send("OLOLOLOLO, No streaming link");
            }
            //return res.send("OLOLOLOLO, No streaming link");

        }).catch(err => {
            console.log(err)
            return res.status(400).send('Bad url')
        })
    } else {
        return res.status(400).send('missing url body param {url: \'\', (title: \'\', posterUrl: \'\')')
    }

})


function saveVideoAndResponse(streaming:Streaming, title, debridLink, imageUrl, res: Response) {
    connection.manager.save(streaming)
    .then(streaming => {
        let video = new Video
        video.streaming = streaming
        // peut etre recuperer des infos la a voir
        video.title = title
        video.url = debridLink
        if (imageUrl != undefined)
            video.posterUrl = imageUrl;
        connection.manager.save(video)
        .then(video => {
            console.log(video)
            return res.status(200).send(video)
        }).catch(err => {
            console.log(err)
            return res.status(500).send('Error, cannot save new video sorry :(')
        })
    }).catch(err => {
        console.log(err)
        return res.status(500).send('Error, cannot save new streaming sorry :(')
    })
}

router.get("/detail", (req: Request, res: Response) => {
    let url = null;

    if (req.query.url != undefined) {
        url = req.query.url;
        console.log('try to get detail of link ' + req.query.url)
        ZoneTelechargementApi.getDetails(url)
        .then(results => {
            //console.log(results)
            res.status(200).send(results);
        }).catch(err => {
            console.log(err)
            res.status(500).send("Error Server, Fail to get detail of your url");
        })

    } else {
        res.status(400).send("missing url in your request")
    }

});

/**
 * GET /zone/news?path=/exclus&pagelimit=3
 * param :
 *      path = /exclus, /series-vf, /series-vostfr, /nouveaute
 *      (optionnal) pagelimit = [1:100] (nombre de page dans lesquels on fais la recherche) 
 */
router.get("/news", (req: Request, res: Response) => {
    //console.log('try to get news ')
    let path = "/exclus";
    
    if (req.query.path != undefined)
        path = req.query.path;

        console.log(path)
    let pageLimit = 1;
    if (req.query.pagelimit != undefined && req.query.pagelimit > 1)
        pageLimit = req.query.pagelimit
    ZoneTelechargementApi.getNews(path, pageLimit)
    .then(results => {
        //console.log(results)
        res.status(200).send(results);
    }).catch(err => {
        console.log(err)
        res.status(500).send("Error Server, Fail to get detail of your url");
    })
});

router.get('/unlock', (req: Request, res: Response) => {
    let url = null; // dlprotec url 

    if (req.query.url != undefined) {
        url = req.query.url;
        console.log('try to debrid link ' + req.query.url)
        AllDebridApi.getProtectLink(url)
        .then(results => {
            if (results.data != undefined && results.data.links != undefined) {
                //console.log(results.data)
                res.status(200).send(results.data.links);
            } else {
                console.log(results)
                res.status(404).send('No link found');
            }
        }).catch(err => {
            console.log(err)
            res.status(500).send("Error Server, Fail to get detail of your url");
        })

    } else {
        res.status(400).send("missing url in your request")
    }

});

}).catch(error => {
    console.log(error)
});

export const ZoneTelechargementController: Router = router;

function isEmpty(streaming:Streaming) {
    let ret = true;
    if (streaming.fr360p.length > 0 || streaming.fr480p.length > 0
        || streaming.fr720p.length > 0 || streaming.fr1080p.length > 0
        || streaming.en360p.length > 0 || streaming.en480p.length > 0
        || streaming.en720p.length > 0 || streaming.en1080p.length > 0) {
        ret = false;
    }
    return ret;
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