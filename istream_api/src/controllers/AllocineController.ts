import { Router, Request, Response } from 'express';

import {AlloCineApi, AllDebridApi} from "../Utils"

const router: Router = Router();

router.get('/hosts', (req: Request, res: Response) => {
    AllDebridApi.getSupportedHost().then(result => {
        res.send(result.data)
    }).catch(err => {
        console.log(err)
        res.status(500).send("fail to get supported hosts")
    })
})

// route get /search?q="your search"
router.get('/', (req: Request, res: Response) => {
    let q = req.query.q;
    let filter = req.query.filter;
    console.log('get !!')
    if (filter == undefined)
        filter = "movie"
    console.log(filter)
    if (q != null && q != undefined) {
        AlloCineApi.searchMovies(q, filter,function(error, resultsApi) {
            if(error) {
                console.log('Error : '+ error); 
                res.status(500).send("Fail to search in allocine api")
                return;
            }
            console.log('Voici les données retournées par l\'API Allociné:');
            var results = []
            if (resultsApi.feed != undefined && resultsApi.feed.movie != undefined) {
                resultsApi.feed.movie.forEach(video => {
                    let videoRes:any = new Object;
                    console.log(video)
                    // utiliser pour recuperer que 1 seul video quand on post avec la meme api
                    videoRes.code = video.code;
                    if (video.title != undefined)
                        videoRes.title = video.title;
                    else
                        videoRes.title = video.originalTitle;
                    videoRes.originalTitle = video.originalTitle;
                    videoRes.productionYear = video.productionYear
                    videoRes.statistics = video.statistics
                    videoRes.castingShort = video.castingShort
                    videoRes.poster = video.poster

                    if (video.castingShort != undefined && video.castingShort.directors != undefined)
                        videoRes.label = videoRes.title + ' (' + video.productionYear + ', ' + video.castingShort.directors + ')';
                    else
                        videoRes.label = videoRes.title + ' (' + video.productionYear + ')';
                    results.push(videoRes);
               });
            }
            res.status(200).send(results);
        });
    } else {
        res.status(500).send("missing q parameter in request")
    }
});

export const AllocineController: Router = router;