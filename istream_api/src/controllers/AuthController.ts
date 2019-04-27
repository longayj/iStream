import { Router, Request, Response } from 'express';
import Axios from '../../node_modules/axios';
import { Streaming } from '../entity';
import { createConnection } from '../../node_modules/typeorm';
import { URL } from 'url';
import {User} from "../entity/User"
import config from "../config/config";
import { checkJwt } from "../middlewares/checkJwt";
import * as jwt from "jsonwebtoken";

const https = require('https');
const fs = require('fs');

const router: Router = Router();

createConnection(/*...*/).then(async connection => {

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

router.post('/register', (req: Request, res: Response) => {
    console.log("try to register")
    let {username, password, email} = req.body
    if (!(username && password && email))
        return res.status(401).send()
        
    if (password.length < 8)
        return res.status(400).send({
            message: "Passord minimun lenght = 8"
        })

    if (!validateEmail(email)) {
        return res.status(400).send({
            message: "Bad email format"
        })
    }

    // check if new username is already taken
    if (username.length > 0) {
        console.log("check username : ", username)
        connection.getRepository(User)//.findOne(User)
            .findOne({
                where: {
                    username: username
                }
            }).then(tmpUser => {
                if (tmpUser != undefined && tmpUser != null) {
                    res.status(400).send({
                        message: "username already exist"
                    })
                    return
                }

            }).catch(err => {
                console.log(err)
                res.status(500).send({
                    message: "Fail to get user"
                })
                return
            })
        
    } else {
        return res.status(400).send({
            message: "Bad username"
        })
    }

    let newUser = new User
    let reqUser = {
        ...newUser,
        ...req.body
    }
    newUser.language = reqUser.language
    newUser.lastName = reqUser.lastName
    newUser.firstName = reqUser.firstName
    newUser.pictureUrl = reqUser.pictureUrl
    newUser.password = password
    newUser.hashPassword();
    newUser.age = reqUser.age
    newUser.username = reqUser.username
    newUser.email = reqUser.email
    connection.manager.save(newUser)
    .then(user => {
        res.status(200).send(user)
    }).catch(err => {
        res.status(500).send({message: "fail to save new user"})
    })
});

router.post('/login', async (req: Request, res: Response) => {
    // try to get access token
    let { username, password } = req.body;
    console.log(username, ":", password)
    if (!(username && password)) {
        res.status(400).send();
    }
    //Get user from database
    const userRepository = connection.getRepository(User);
    let user: User;
    try {
        user = await userRepository.findOneOrFail({ where: { username: username } });
    } catch (error) {
        console.log(error)
        res.status(401).send();
    }
    
    //Check if encrypted password match
    if (user == undefined || !user.checkIfUnencryptedPasswordIsValid(password)) {
        console.log("user : ", user)
        res.status(401).send();
        return;
    }

    //Sing JWT, valid for 1 hour
    const token = jwt.sign(
      { userId: user.id, username: user.username },
        config.jwtSecret,
      { expiresIn: "1h" }
    );
    delete user.password
    delete user.isVerify
    delete user.isDisable
    delete user.allDebridPassword
    delete user.age
    delete user.allDebridUsername

    //Send the jwt in the response
    res.send({
        ...user,
        token: token,
        isAdmin: user.role == "ADMIN"
    });
})

router.get('/refresh-token', [checkJwt], (req: Request, res: Response) => {
    let jsonwebtoken = res.locals.jwtPayload
    const { userId, username } = jsonwebtoken;
    console.log(username, " try to refresh-token userId : ", userId)
    //Sing JWT, valid for 1 hour
    const token = jwt.sign(
        { userId: userId, username: username },
        config.jwtSecret,
        { expiresIn: "1h" }
    );
    //Send the jwt in the response
    res.send({token: token});        
})

}).catch(err => {
    console.log("fail to start auth controller connection")
})

export const AuthController: Router = router;