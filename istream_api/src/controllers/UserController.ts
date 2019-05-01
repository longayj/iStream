import { Router, Request, Response } from 'express';
import { createConnection, Any } from 'typeorm';
import {User} from '../entity/User'
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import { Video } from '../entity';
import { Playlist } from '../entity/Playlist';

const router: Router = Router();

createConnection(/*...*/).then(async connection => {

    // route get users
    router.get('/', [checkJwt], (req: Request, res: Response) => {
        let page = req.query.page || 0
        let per_page = req.query.per_page || 10

        if (per_page > 100)
            per_page = 100
        if (per_page <= 0)
            per_page = 1
        if (page <= 0)
            page = 1
        --page
        
        connection.getRepository(User).find({
            take : per_page,
            skip: per_page * page,
            select: ["id", "language", "username", "role"],
            where : {
                isDisable: false
            }
            //relations: ["statistics", "streaming", "castingShort"]
        }).then(users => {
            if (users == undefined || users == null) {
                res.status(404).send({message: "No Users sorry"});
                return;
            }
            let usersAny:any = new Object
            usersAny.per_page = per_page
            usersAny.page = page + 1
            usersAny.users = users
            users.forEach(user => {
                delete user.isDisable
                delete user.language
                delete user.pictureUrl
                delete user.language
                delete user.password
                delete user.firstName
                delete user.lastName
                delete user.email
                delete user.preferredStreamLanguage
                delete user.preferredStreamQuality
                delete user.darkMode
                delete user.primaryColor
                delete user.secondaryColor
            })
            res.send(usersAny)
        }).catch(err => {
            console.log(err)
            res.status(500).send({message: "Error to find Users"})
        })
    })

    // return one user
    router.get('/:id', [checkJwt], (req: Request, res: Response) => {
        connection.getRepository(User).findOne({ 
            select: ["id", "language", "username", "email", "role", "primaryColor", "secondaryColor", "darkMode", "preferredStreamLanguage", "preferredStreamQuality"],
            where: {
                id: req.params.id,
                isDisable: false
            }
            //relations: ["statistics", "streaming", "castingShort"]
        }).then(user => {
            console.log(user)
            if (user == undefined || user == null) {
                res.status(404).send({message: "Id not found"});
                return;
            }
            delete user.pictureUrl
            delete user.isDisable
            delete user.password
            delete user.firstName
            delete user.lastName
            let resUser = {
                ...user,
                isAdmin: user.role == "ADMIN"
            }
            res.send(resUser)
        }).catch(err => {
            console.log(err)
            res.send({message: "Error to find Users"})
        })
    })

    // edit user
    router.put('/:id', [checkJwt], (req: Request, res: Response) => {
        let jwttoken = res.locals.jwtPayload

        connection.getRepository(User).findOne({ 
            where: {
                id: req.params.id,
                isDisable: false
            }
        }).then(async user => {
            let userToken = undefined
            
            if (user == undefined || user == null) {
                res.status(404).send({message: "Id not found"});
                return;
            }

            try {
                userToken = await connection.getRepository(User).findOneOrFail(jwttoken.userId)
                console.log(userToken, " ", user)
            } catch(userToken) {
                res.status(500).send({message: "Fail to get user"})
                return
            }
            // check if token is yours
            if (jwttoken == null || (jwttoken.userId != req.params.id
                && userToken.role != "ADMIN")) {
                res.status(401).send('');
                return
            }
            console.log("........")
            delete req.body.password
            delete req.body.isDisable

            let reqUser = {
                  ...user,
                  ...req.body
            }

            // check if new username is already taken
            if (reqUser.username.length > 0 && reqUser.username != user.username) {
                try {
                    let tmpUser = await connection.getRepository(User).findOne({
                        where: {
                            username: reqUser.username
                        } 
                    })
                    if (tmpUser != undefined && tmpUser != null) {
                        res.status(400).send({message: "username already exist"})
                        return
                    }
                } catch(userToken) {
                    res.status(500).send({message: "Fail to get user"})
                    return
                }
            }
            // replace field
            user.firstName = reqUser.firstName
            user.lastName = reqUser.lastName
            user.age = reqUser.age
            user.language = reqUser.language
            user.pictureUrl = reqUser.pictureUrl
            user.darkMode = reqUser.darkMode
            user.primaryColor = reqUser.primaryColor
            user.secondaryColor = reqUser.secondaryColor
            user.email = reqUser.email
            user.preferredStreamLanguage = reqUser.preferredStreamLanguage
            user.preferredStreamQuality = reqUser.preferredStreamQuality
            
            user.username = reqUser.username

            if (userToken.role.toUpperCase() == "ADMIN")
                user.role = reqUser.role

            connection.manager
            .save(user)
            .then(saveUser => {
                console.log("User has been updated. User id is ", saveUser.id);
                delete saveUser.pictureUrl
                delete saveUser.isDisable
                delete saveUser.password
                delete saveUser.firstName
                delete saveUser.lastName
                let resUser = {
                    ...saveUser,
                    isAdmin: user.role == "ADMIN"
                }
                res.status(200).send(resUser)
            }).catch(err => {
                console.log(err)
                res.status(500).send({message: 'user update error'})
            })
        }).catch(err => {
            console.log(err)
            res.send({message: "Error to find Users"})
        })
    })

    // get /user/id/videos retourne les videos d'un users par ordre d'ajout
    // param encour / fini / jamais visionné 
    router.get("/:id/videos", [checkJwt], (req: Request, res: Response) => {
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
        connection.getRepository(User).findOne({ 
            select: ["id"],
            where: {
                id: req.params.id
            }
        }).then(async user => {
            if (user == undefined || user == null) {
                res.status(404).send({message: "Id not found"});
                return;
            }
            // subquery => permet de limiter par page les souffle en 
            // fonction d'un id user !!!!! => limite de relation one to many
            const builder =  connection.getRepository(Video)
            .createQueryBuilder("video")
            .where(qb => {
                const subQuery = qb.subQuery()
                    .select("usr.id")
                    .from(User, "usr")
                    .where("usr.id = " + req.params.id)
                    .getQuery();
                return "video.user_id IN " + subQuery;
            })
            const videos = await builder
            .offset(per_page * page)
            .limit(per_page)
            .getMany();

            let videoRes:any = new Object
            videoRes.per_page = per_page
            videoRes.page = page + 1
            let count = await builder.getCount()
            if (count / per_page < 1)
                videoRes.total_page = 1
            else
                videoRes.total_page = Math.ceil(count / per_page)
            videoRes.videos = videos
            res.send(videoRes)
        }).catch(err => {
            console.log(err)
            res.status(500).send({message: "Error to find Users"})
        })

    })

    router.get("/:id/playlists", [checkJwt],  (req: Request, res: Response) => {
        let userId = res.locals.jwtPayload.userId
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
 
        connection.getRepository(User).findOne({ 
            select: ["id"],
            where: {
                id: req.params.id
            }
        }).then(async user => {
            if (user == undefined || user == null) {
                res.status(404).send({message: "Id not found"});
                return;
            }
            // subquery => permet de limiter par page les souffle en 
            // fonction d'un id user !!!!! => limite de relation one to many
            console.log(user)

            let myWhere:any = {
                ownerId:user.id
            };
            if (userId != req.params.id) {
                myWhere = {
                    ...myWhere,
                    shared: 1
                }
            }

            connection.getRepository(Playlist)
            .findAndCount({
                where: myWhere,
                take:per_page,
                skip: page * per_page
            }).then(async result => {
                console.log(result)
                let playlists = result[0]
                console.log(result)
                let count = result[1]
                let playlistRes:any = new Object
                playlistRes.per_page = per_page
                playlistRes.page = page + 1
                if (count / per_page < 1)
                    playlistRes.total_page = 1
                else
                    playlistRes.total_page = Math.ceil(count / per_page)
                playlistRes.playlists = playlists
                console.log(playlistRes)
                res.send(playlistRes)
            }).catch(err => {
                console.log(err)
                res.send("Error Putain !!!!")
            })
            
        }).catch(err => {
            console.log(err)
            res.status(500).send({message: "Error to find Users"})
        })
    })

    router.post("/:id/playlists", [checkJwt],  (req: Request, res: Response) => {
        let shared = req.body.shared || false
        let name = req.body.name || undefined
        if (!name)
            return res.status(400).send("Bad request")
        if (res.locals.jwtPayload.userId != req.params.id)
            return res.status(401).send("It's not your playlist !");
        connection.getRepository(User).findOne({ 
            select: ["id"],
            where: {
                id: req.params.id
            }
        }).then(async user => {
            if (user == undefined || user == null) {
                res.status(404).send({message: "Id not found"});
                return;
            }
            let playlist = new Playlist()
            playlist.name = name
            playlist.owner = user
            playlist.shared = shared
            connection.manager.save(playlist)
            .then(playlist => {
                delete playlist.owner
                res.send(playlist)
            })
        }).catch(err => {
            console.log(err)
            res.status(500).send()
        })
    })

    router.put("/:id/playlists/:idPlaylist", [checkJwt],  (req: Request, res: Response) => {
        let shared = req.body.shared || 0
        let name = req.body.name || undefined

        if (req.body.shared == "true")
            shared = 1
        else if (req.body.shared == "false")
            shared = 0
            
        if (isNaN(Number.parseInt(shared)) || isNaN(req.params.idPlaylist) || isNaN(req.params.id))
            return res.status(400).send("Bad request")

        if (!name)
            return res.status(400).send("Bad request")
        if (res.locals.jwtPayload.userId != req.params.id)
            return res.status(401).send("It's not your playlist !");
        connection.getRepository(User).findOne({ 
            select: ["id"],
            where: {
                id: req.params.id
            }
        }).then(async user => {
            if (user == undefined || user == null) {
                res.status(404).send({message: "Id not found"});
                return;
            }
            connection.getRepository(Playlist).findOne({
                where:{
                    id: req.params.idPlaylist,
                    ownerId: req.params.id
                }
            }).then(playlist => {
                if (playlist == undefined || playlist == null) {
                    res.status(404).send({message: "Playlist id not found"});
                    return;
                }
                playlist.name = name
                playlist.owner = user
                playlist.shared = Number.parseInt(shared)
                connection.manager.save(playlist)
                .then(playlist => {
                    delete playlist.owner
                    res.send(playlist)
                }).catch(err => {
                    console.log(err)
                    res.status(500).send('Fail to save playlist')
                })
            }).catch(err => {
                console.log(err)
                res.status(500).send('Fail to get playlist')
            })

        }).catch(err => {
            console.log(err)
            res.status(500).send()
        })



    })

    // add video in playlist
    router.post("/:id/playlists/:idPlaylist/videos/:idVideo", [checkJwt],  (req: Request, res: Response) => {
        if (isNaN(req.params.idPlaylist) || isNaN(req.params.id) || isNaN(req.params.idVideo))
            return res.status(400).send("Bad request")
        if (res.locals.jwtPayload.userId != req.params.id)
            return res.status(401).send("It's not your token");

        connection.getRepository(User).findOne({ 
            select: ["id"],
            where: {
                id: req.params.id
            }
        }).then(async user => {
            if (user == undefined || user == null) {
                res.status(404).send({message: "Id not found"});
                return;
            }
            connection.getRepository(Playlist).findOne(1, {
                where:{
                    id: req.params.idPlaylist,
                    ownerId: req.params.id
                },
                relations:["videos"]
            }).then(playlist => {
                if (playlist == undefined || playlist == null) {
                    res.status(404).send({message: "Playlist id not found"});
                    return;
                }
                connection.getRepository(Video).findOne({
                    where: {
                        id: req.params.idVideo
                    }
                }).then(video =>{
                    console.log("playlist !!  : ", playlist)
                    if (video == undefined || video == null) {
                        res.status(404).send({message: "Video id not found"});
                        return;
                    }
                    for (let i = 0; i < playlist.videos.length; i++) {
                        //console.log("check video : ", playlist.videos[0].id, " video id :", video.id)
                        if (playlist.videos[i].id == video.id) {
                            return res.status(400).send({message: "Video Already in playlist"});
                        }
                    }
                    playlist.videos.push(video)
                    connection.manager.save(playlist)
                    .then(playlist => {
                        console.log(playlist)
                        res.status(200).send(video);
                    }).catch(err => {
                        console.log(err)
                        res.status(500).send({message: "Fail to save video in playlists"});
                    })
                }).catch(err => {
                    console.log(err)
                    res.status(500).send('Fail to get video')
                })

            }).catch(err => {
                console.log(err)
                res.status(500).send('Fail to get playlist')
            })

        }).catch(err => {
            console.log(err)
            res.status(500).send()
        })
    })

    // remove video in playlist
    router.delete("/:id/playlists/:idPlaylist/videos/:idVideo", [checkJwt],  (req: Request, res: Response) => {

    })

    // get video in playlist
    router.get("/:id/playlists/:idPlaylist/videos", [checkJwt],  (req: Request, res: Response) => {
        if (isNaN(req.params.idPlaylist) || isNaN(req.params.id))
            return res.status(400).send("Bad request")
        let userId = res.locals.jwtPayload.userId
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

        connection.getRepository(User).findOne({ 
            select: ["id"],
            where: {
                id: req.params.id
            }
        }).then(async user => {
            if (user == undefined || user == null) {
                res.status(404).send({message: "Id not found"});
                return;
            }
            // subquery => permet de limiter par page les souffle en 
            // fonction d'un id user !!!!! => limite de relation one to many
            console.log(user)

            let myWhere:any = {
                ownerId:user.id
            };
            if (userId != req.params.id) {
                myWhere = {
                    ...myWhere,
                    shared: 1
                }
            }

            connection.getRepository(Playlist).findOne(1, {
                where:{
                    id: req.params.idPlaylist,
                    ownerId: req.params.id
                },
                relations:["videos"]
            }).then(async playlist => {
                if (playlist == undefined || playlist == null) {
                    res.status(404).send({message: "Playlist id not found"});
                    return;
                }

                let videoRes:any = new Object
                videoRes.per_page = playlist.videos.length
                videoRes.page = 1
                videoRes.total_video = playlist.videos.length;
                videoRes.videos = playlist.videos
                res.send(videoRes)
            }).catch(err => {
                console.log(err)
                res.status(500).send('Fail to get video')
            })
            
        }).catch(err => {
            console.log(err)
            res.status(500).send({message: "Error to find Users"})
        })

    })

}).catch(error => {
    console.log("Fail to init connection in usercontroller.ts");
    console.log(error)
})

export const Usercontroller: Router = router;
