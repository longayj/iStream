import { Router, Request, Response } from 'express';
import Axios from '../../node_modules/axios';
import { Streaming, User } from '../entity';
import { createConnection } from '../../node_modules/typeorm';
import { URL } from 'url';
const https = require('https');
const fs = require('fs');

const router: Router = Router();

createConnection(/*...*/).then(async connection => {

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

router.post('/register', (req: Request, res: Response) => {
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
        connection.getRepository(User)
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
    connection.manager.save(newUser)
    .then(user => {
        res.status(200).send(user)
    }).catch(err => {
        res.status(500).send({message: "fail to save new user"})
    })
});


}).catch(err => {
    console.log("fail to start auth controller connection")
})

export const AuthController: Router = router;