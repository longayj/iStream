import { Router, Request, Response } from 'express';
import Axios from '../../node_modules/axios';
import { Streaming } from '../entity';
import { createConnection } from '../../node_modules/typeorm';
import { URL } from 'url';
import { checkJwt } from '../middlewares/checkJwt';
import { checkRole } from '../middlewares/checkRole';

const https = require('https');
const fs = require('fs');

const router: Router = Router();

createConnection().then(async connection => {
// route get /stream/:id 
/**
 * get /streams/id
 * @params (opt) resolution (ex: fr360p, fr1080p) (if link exist)
 */
router.get('/:id', [checkJwt], (req: Request, res: Response) => {
    let id = req.params.id
    let resolution = "fr360p";
    let myurl = "";
    let range = req.headers.range
   
    connection.getRepository(Streaming).findOne({
        where: {id: id}
    }).then(stream => {
        console.log("stream : ", stream)

        if (stream[req.query.resolution] != undefined)
            myurl = stream[req.query.resolution];
        else if (stream[resolution] != undefined)
            myurl = stream[resolution];
        else {
            return res.status(404).send("stream resolution not found")
        }
        let url: URL = new URL(myurl);
        console.log('url : ' + url.host + ' pathname : ' + url.pathname)
        const request = https.get({
            host: url.host,
            path: url.pathname,
            headers: {
                'Range': range
            }
        }, function(response) {
            // type de la video (mp4, mkv, avi, etc ...)
            console.log(response.headers)
            console.log(response.headers['content-type'])
            console.log(response.headers['content-length'])
            //console.log(range)
            //res.setHeader('Content-Type', contentType);
            if (range && response.headers['content-length'] != undefined) {
                // change start et end 
                const file = response
                const head = {
                  'Content-Range': response.headers['content-range'],
                  'Accept-Ranges': response.headers['accept-ranges'],
                  'Content-Length': response.headers['content-length'],
                  'Content-Type': response.headers['content-type'],
                }
                res.writeHead(206, head);
                file.pipe(res);
            } else {
                response.pipe(res);
            }
        });
        request.on('error', function(e) {
            console.error(e);
            res.status(500).send("sorry, can't stream the link")
        });
    }).catch(err => {
        console.log(err)
        res.status(404).send('Stream not found')
    })

    //const src = fs.createReadStream('./Videos/Duck.Duck.Goose.2018.FRENCH.720p.WEBRip.x264-BRiNK.Zone-Telechargement1.WS.mkv');
    //const stream = makeStream("")
    //stream.pipe(res);
    // const request = https.get(url, function(response) {
    //     const contentType = response.headers['content-type'];
    //     // type de la video (mp4, mkv, avi, etc ...)
    //     console.log(contentType);
    //     res.setHeader('Content-Type', contentType);
    //     response.pipe(res);
    // });

    // request.on('error', function(e){
    //     console.error(e);
    //     res.status(500).send("sorry, can't stream the link")
    // });
});

/**
* route pour ajouter des stream avec un file en param genre 
* 1- telecharge le fichier 
* 2- enregistre le fichier dans un dosier
* 3- l'enregistre dans un objet video avec ses lien local de stream
*/
router.post('/', (req: Request, res: Response) => {

});

/**
 * permet de supprimer un stream avec fichier correspondant
 */
router.delete('/:id', [checkJwt, checkRole(["ADMIN"])], (req: Request, res: Response) => {

});



}).catch(err => {
    console.log("fail to start stream controller connection")
})

var makeStream = function(url) { 
    var stream = require('stream')
    var rs = new stream.PassThrough()
    var request = Axios.get(url)
    .then((res :any) => {
      res.pipe(rs)
    }).catch(err => {
        console.log(err)
    })
    return rs
  }

export const StreamController: Router = router;