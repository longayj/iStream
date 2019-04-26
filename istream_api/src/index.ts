import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entity/User";

import * as express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser';
var cors = require('cors');

import { VideoController, AllocineController, StreamController, ZoneTelechargementController, AuthController } from './controllers';
import { AllDebridApi } from "./Utils";

var port = 3001;

createConnection()
.then(async connection => {

    console.log("Inserting a new user into the database...");
    const user = new User();
    user.id = 1;
    user.username = "john";
    user.email = "test@test.com";
    user.firstName = "John";
    user.lastName = "Doe";
    user.allDebridUsername = "";
    user.allDebridPassword = "";
    user.role = "ADMIN"
    user.age = 25;
    user.password = "password";
    user.hashPassword()
    await connection.manager.save(user);
    
    console.log("Saved a new user with id: " + user.id);
    
    AllDebridApi.getToken()
    .then(result => {
        if (result.data.success == false)
            return
        AllDebridApi.setDefaultToken(result.data.token);
        return true;
    }).catch(res => {
        console.log(res.response.statusText)
        console.log("you can't add new movie, verify your file ./configs/private.json")
        return false;
    })

    console.log("Loading users from the database...");
    const users = await connection.manager.find(User);
    console.log("Loaded users: ", users);
    
    var app = require('express')();
    var server = require('http').createServer(app);

    app.options('*', cors());

    //app.use(cookieParser());

    // dossier public
    app.use(express.static(path.join(__dirname, 'public')));

    // ne pas enlever bodyParser ^^
    app.use(bodyParser.json({  }));
    app.use(bodyParser.urlencoded({ extended: false }));

    app.all('/*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); 
        res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
        res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept, Authorization");
        next();
    });

    app.use('/videos', VideoController);
    app.use('/search', AllocineController);
    app.use('/streams', StreamController);
    app.use('/zone', ZoneTelechargementController)
    app.use('/auth', AuthController)

    app.get('/', function(req:any, res:express.Response){
        res.send('Welcome To iStream Api');
    });

    server.listen(port, () => {
        //Logger.info('Start Server on port ' + port + " ip : " + ip.address())
        console.log(`Listening at http://localhost:${port}/`);
    });

}).catch(error => {
	console.log(error)
});
