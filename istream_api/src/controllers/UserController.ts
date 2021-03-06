import { Router, Request, Response } from 'express';
import { createConnection, Any } from 'typeorm';
import {User} from '../entity/User'
import { checkJwt } from "../middlewares/checkJwt";
import { Video } from '../entity';
import { Playlist } from '../entity/Playlist';
import { TimeVideo } from '../entity/TimeVideo';

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
            videoRes.total_videos = count
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
        let shared = req.body.shared || 0
        let name = req.body.name || undefined
        if (req.body.shared == "true")
            shared = 1
        else if (req.body.shared == "false")
            shared = 0
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
            
        if (isNaN(Number.parseInt(shared)) 
        || isNaN(Number.parseInt(req.params.idPlaylist)) 
        || isNaN(Number.parseInt(req.params.id)))
            return res.status(400).send("Bad request")

        if (!name)
            return res.status(400).send("Bad request, missing name in body")
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

    // get current viewing video sort by updated At
    router.get("/:id/viewing", [checkJwt],  (req: Request, res: Response) => {
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
        if (res.locals.jwtPayload.userId != req.params.id)
            return res.status(401).send("It's not your token !");
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
            console.log("good user")
            connection.getRepository(TimeVideo)
            .find({
                where: {
                    ownerId: res.locals.jwtPayload.userId,
                    ended: 0
                },
                order: {
                    updatedAt: "DESC"
                },
                skip: per_page * page,
                take: per_page
            }).then(async viewing => {
                console.log("viewing info : ", viewing)
                let viewingRes:any = new Object
                let timeVideo = new Object
                let result = await connection.getRepository(TimeVideo)
                .findAndCount({
                    where: {
                        ownerId : req.params.id
                    }
                })
                let count = result[1]
                if (count == undefined)
                    count = 0
                console.log(count)
                viewingRes.per_page = per_page
                viewingRes.page = page + 1
                if (count / per_page < 1)
                    viewingRes.total_page = 1
                else
                    viewingRes.total_page = Math.ceil(count / per_page)
                timeVideo = viewing
                for (let i = 0; i < viewing.length; i++) {
                    timeVideo[i].video = await connection.getRepository(Video).findOne({where: {
                        id : timeVideo[i].videoId
                    }})
                }
                viewingRes.viewing = viewing
                return res.send(viewingRes)
                // modifier et retourner les video et pas juste les objet viewing
            }).catch(err => {
                console.log(err)
                return res.status(500).send('Fail to get TimeVideo')
            })
        }).catch(err => {
            console.log(err)
            res.status(500).send('Fail to get User')
        })
    })

    // get current viewing video sort by updated At
    router.get("/:id/viewed", [checkJwt],  (req: Request, res: Response) => {
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
        if (res.locals.jwtPayload.userId != req.params.id)
            return res.status(401).send("It's not your token !");
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
            console.log("good user")
            connection.getRepository(TimeVideo)
            .find({
                where: {
                    ownerId: res.locals.jwtPayload.userId,
                    ended: 1
                },
                order: {
                    updatedAt: "DESC"
                },
                skip: per_page * page,
                take: per_page
            }).then(async viewing => {
                console.log("viewing info : ", viewing)
                let viewingRes:any = new Object
                let timeVideo = new Object
                let result = await connection.getRepository(TimeVideo)
                .findAndCount({
                    where: {
                        ownerId : req.params.id
                    }
                })
                let count = result[1]
                if (count == undefined)
                    count = 0
                console.log(count)
                viewingRes.per_page = per_page
                viewingRes.page = page + 1
                if (count / per_page < 1)
                    viewingRes.total_page = 1
                else
                    viewingRes.total_page = Math.ceil(count / per_page)
                timeVideo = viewing
                for (let i = 0; i < viewing.length; i++) {
                    timeVideo[i].video = await connection.getRepository(Video).findOne({where: {
                        id : timeVideo[i].videoId
                    }})
                }
                viewingRes.viewing = viewing
                return res.send(viewingRes)
                // modifier et retourner les video et pas juste les objet viewing
            }).catch(err => {
                console.log(err)
                return res.status(500).send('Fail to get TimeVideo')
            })
        }).catch(err => {
            console.log(err)
            res.status(500).send('Fail to get User')
        })
    })

    // add viewing video
    router.post("/:id/viewing/:idVideo", [checkJwt],  (req: Request, res: Response) => {
        let currentTime = req.body.currentTime || 0
        let duration = req.body.duration || 0
        if (isNaN(Number.parseInt(req.params.idVideo)) ||
            isNaN(Number.parseInt(req.params.id)))
            return res.status(400).send({
                message: "bad request"
            })
        if (res.locals.jwtPayload.userId != req.params.id)
            return res.status(401).send("It's not your token !");
        connection.getRepository(User).findOne({ 
            select: ["id"],
            where: {
                id: req.params.id
            }
        }).then(async user => {
            if (user == undefined || user == null) {
                return res.status(404).send({message: "Id not found"});;
            }
            // check video id
            let video = await connection.getRepository(Video)
            .findOne({
                where: {
                    id: req.params.idVideo
                }
            })
            if (video == undefined || video == null)
                return res.status(404).send({
                    message: 'Id Video not found'
                })

            connection.getRepository(TimeVideo).findOne({ 
                where: {
                    ownerId: req.params.id,
                    videoId: req.params.idVideo
                }
            }).then(async viewing => {
                if (viewing != undefined && viewing != null)
                {
                    console.log('update video ', req.params.idVideo)
                    viewing.currentTime = currentTime
                    viewing.duration = duration
                    viewing.ended = 0
                    connection.manager.save(viewing)
                    .then(viewing => {
                        let result:any = new Object
                        result = viewing
                        result.video = video
                        console.log('timeVideo update ', viewing)
                        return res.send(result)
                    }).catch(err => {
                        console.log(err)
                        return res.status(500).send({
                            message: 'fail to edit timeVideo'
                        })
                    })
                    return
                }
                console.log("User ", res.locals.jwtPayload.userId, " add video in viewing list, videoId : ", req.params.idVideo)
                let timeVideo = new TimeVideo;
                timeVideo.currentTime = currentTime
                timeVideo.duration = duration
                timeVideo.videoId = req.params.idVideo
                timeVideo.ownerId = req.params.id
                // save new time video
                connection.manager.save(timeVideo)
                .then(timeVideo => {
                    console.log("new timevideo ", timeVideo)
                    let result:any = new Object
                    result = timeVideo
                    result.video = video
                    return res.send(result)
                }).catch(err => {
                    console.log(err)
                    return res.status(500).send({
                        message: "fail to save timeVideo"
                    })
                })
            }).catch(err => {
                console.log(err)
                return res.status(500).send('Fail to get TimeVideo')
            })

        }).catch(err => {
            console.log(err)
            res.status(500).send('Fail to get User')
        })
    })

    router.get("/:id/viewing/:idVideo", [checkJwt],  (req: Request, res: Response) => {
        if (isNaN(Number.parseInt(req.params.id)) || isNaN(Number.parseInt(req.params.idVideo)))
            return res.status(400).send({
                message: 'bad request'
            })
        if (res.locals.jwtPayload.userId != req.params.id)
            return res.status(401).send("It's not your token !");
        connection.getRepository(TimeVideo).findOne({
            where: {
                videoId: req.params.idVideo,
                ownerId: req.params.id
            }
        }).then(viewing => {
            console.log("get Viewing list ", viewing)
            if (viewing == undefined)
                {
                    let result = new TimeVideo
                    result.currentTime = 0
                    result.duration = 0
                    return res.send(result)
                }
            return res.send(viewing)
        }).catch(err => {
            console.log(err)
            return res.status(500).send({
                message: 'fail to get timeVideo'
            })
        })
    })

    // update viewing video
    router.put("/:id/viewing/:idVideo", [checkJwt],  (req: Request, res: Response) => {
        let currentTime = req.body.currentTime || 0
        let duration = req.body.duration || 0
    })

    // add video in playlist
    router.post("/:id/playlists/:idPlaylist/videos/:idVideo", [checkJwt],  (req: Request, res: Response) => {
        if (isNaN(Number.parseInt(req.params.idPlaylist)) 
        || isNaN(Number.parseInt(req.params.id)) 
        || isNaN(Number.parseInt(req.params.idVideo)))
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
            console.log("try to get playlist id : ", req.params.idPlaylist, " owner : " + req.params.id)
            connection.getRepository(Playlist).findOne({
                where: {
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
                where: {
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
                    let inPlaylist = false
                    for (let i = 0; i < playlist.videos.length; i++) {
                        //console.log("check video : ", playlist.videos[0].id, " video id :", video.id)
                        if (playlist.videos[i].id == video.id) {
                            // supprimer 
                            inPlaylist = true
                            playlist.videos.splice(playlist.videos.indexOf(playlist.videos[i]), 1)
                            connection.manager.save(playlist)
                            .then(playlist => {
                                console.log(playlist)
                                res.status(200).send({
                                    message: "delete successfull"
                                });
                            }).catch(err => {
                                console.log(err)
                                res.status(500).send({message: "Fail to save video in playlists"});
                            })
                        }
                    }
                    if (!inPlaylist) {
                        return res.status(404).send({message: "Videos not in playlist"})
                    }
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
                id: req.params.idPlaylist
            };
            if (userId != req.params.id) {
                myWhere = {
                    ...myWhere,
                    shared: 1
                }
            }

            connection.getRepository(Playlist).findOne({
                where:myWhere,
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

    // get video in playlist
    router.get("/:id/playlists/:idPlaylist/videos2", [checkJwt],  (req: Request, res: Response) => {
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
                id:req.params.idPlaylist
            };
            if (userId != req.params.id) {
                myWhere = {
                    ...myWhere,
                    shared: 1
                }
            }

            let query = connection.getRepository(Playlist).createQueryBuilder('playlist')
            .leftJoinAndSelect("playlist.videos", "video")
            .offset(per_page)
            .skip(per_page * page)
            .getQuery();

            console.log("query : ", query)
            res.send('Test')
            // let videoRes:any = new Object
            // videoRes.per_page = playlist.videos.length
            // videoRes.page = 1
            // videoRes.total_video = playlist.videos.length;
            // videoRes.videos = playlist.videos
            // res.send(videoRes)
        }).catch(err => {
            console.log(err)
            res.send("Err !")
        })
    })

}).catch(error => {
    console.log("Fail to init connection in usercontroller.ts");
    console.log(error)
})

export const Usercontroller: Router = router;
