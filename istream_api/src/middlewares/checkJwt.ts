import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
    //Get the jwt token from the head
    //console.log(req.headers)
    let token = <string>req.headers["authorization"] || req.query.token;
    if (token != undefined && token.startsWith("Bearer "))
        token = token.replace("Bearer ", "")
    let jwtPayload;
    //Try to validate the token and get data
    try {
        jwtPayload = <any>jwt.verify(token, config.jwtSecret);
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        //If token is not valid, respond with 401 (unauthorized)
        //console.log("catch error : ", error)        
        res.status(401).send();
        return;
    }

    const { userId, username } = jwtPayload;
    //console.log("check token : ", userId, " ", username)
    //console.log("token exp : ", jwtPayload.exp)
    
    //The token is valid for 1 hour
    //We want to send a new token on every request
    //let newToken = jwt.sign({ userId, username }, config.jwtSecret, {
    //    expiresIn: "1h"
    //});
    //res.setHeader("token", newToken);

    //Call the next middleware or controller
    next();
};