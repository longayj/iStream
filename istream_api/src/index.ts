import "reflect-metadata";
import {createConnection} from "typeorm";
import {User} from "./entity/User";

import * as express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser';
var cors = require('cors');

import { VideoController, AllocineController, StreamController, ZoneTelechargementController, AuthController } from './controllers';
import { AllDebridApi } from "./Utils";
import { Usercontroller } from "./controllers/UserController";
import { Playlistcontroller } from "./controllers/PlaylistController";
import { Playlist } from "./entity/Playlist";
import { Video } from "./entity";

var port = 3001;

createConnection()
.then(async connection => {

    console.log("Inserting a new user into the database...");
    const user = new User();
    user.id = 1;
    user.username = "admin";
    user.email = "test@test.com";
    user.firstName = "Joe";
    user.lastName = "LeBanjo";
    user.allDebridUsername = "";
    user.allDebridPassword = "";
    user.role = "ADMIN"
    user.age = 25;
    user.password = "password";
    user.hashPassword()
    await connection.manager.save(user);
    
    const user2 = new User();
    user2.id = 2;
    user2.username = "john";
    user2.email = "test@test.com";
    user2.firstName = "John";
    user2.lastName = "Doe";
    user2.allDebridUsername = "";
    user2.allDebridPassword = "";
    user2.role = "USERS"
    user2.age = 15;
    user2.password = "password";
    user2.hashPassword()
    await connection.manager.save(user2);

    console.log("Saved a new user with id: " + user.id);
/*
    let playlist = new Playlist();
    playlist.id = 1;
    playlist.name = "First Playlist"
    playlist.shared = 0
    playlist.owner = user
    await connection.manager.save(playlist);
    playlist = new Playlist();
    playlist.id = 2;
    playlist.name = "Second Playlist"
    playlist.shared = 1
    playlist.owner = user
    await connection.manager.save(playlist);

    let video = new Video();
    video.id = 1;
    video.title = "The Best Movie"
    video.url = "http://....."
    video.synopsis = "The Storie of best movie"
    video.description = "The Best description"
    video.filename = "Filename of the BestMovie"
    video.productionYear = 1900
    await connection.manager.save(video)
    video = new Video();
    video.id = 2;
    video.title = "The Best Movie 2"
    video.url = "http://....."
    video.synopsis = "The Storie of best movie 2"
    video.description = "The Best description 2"
    video.filename = "Filename of the BestMovie 2"
    video.productionYear = 1903
    await connection.manager.save(video)
    */
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

    //console.log("Loading users from the database...");
    //const users = await connection.manager.find(User);
    //console.log("Loaded users: ", users);
    
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
    app.use('/users', Usercontroller)
    app.use('/playlists', Playlistcontroller)

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
