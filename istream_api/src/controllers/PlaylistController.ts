import { Router, Request, Response } from 'express';
import {Video, Statistics, CastingShort, Streaming, User} from '../entity'
import { createConnection } from 'typeorm';
import { AlloCineApi, AllDebridApi } from '../Utils';
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import { Playlist } from '../entity/Playlist';


const router: Router = Router();


createConnection(/*...*/).then(async connection => {

// return all playlist shared!!
router.get("/", [checkJwt], (req: Request, res: Response) => {
    // return all playlist
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
    // check user id
    connection.getRepository(Playlist).find({
        where: {
            shared: 1
        },
        take: per_page,
        skip: page * per_page
    }).then(playlists => {
        let playlistRes:any = new Object
        playlistRes.per_page = per_page
        playlistRes.page = page + 1
        playlistRes.playlist = playlists
        res.send(playlistRes)
    }).catch(err => {
        console.log(err)
        res.status(500).send()
    })
})




}).catch(error => {
    console.log("Fail to init connection in playlistcontroller.ts");
    console.log(error)
})

export const Playlistcontroller: Router = router;