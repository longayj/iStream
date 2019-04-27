import { Router, Request, Response } from 'express';
import { createConnection, Any } from 'typeorm';
import {User} from '../entity/User'
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

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
            res.send(user)
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
                res.status(200).send(saveUser)
            }).catch(err => {
                console.log(err)
                res.status(500).send({message: 'user update error'})
            })
        }).catch(err => {
            console.log(err)
            res.send({message: "Error to find Users"})
        })
    })

}).catch(error => {
    console.log("Fail to init connection in usercontroller.ts");
    console.log(error)
})

export const Usercontroller: Router = router;
