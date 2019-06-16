
import Axios from "axios";

var defaultToken:string = "";
var private_config = require('../../private.json');

export class AllDebridApi {

    static setDefaultToken(token:string) {
        console.log("setDefaultToken : " + token)
        defaultToken = token;
    }

    static getToken(username: string = private_config.alldebrid.defaultUser, password: string = private_config.alldebrid.defaultPassword) {
        console.log("try to get token with username : " + username + " and password : " + password)
        return Axios.get("https://api.alldebrid.com/user/login?agent=iStream&token=c23c9c06f729801be164627d744bb6ce22gg5")
    }

    static getSupportedHost() {
        return Axios.get("https://api.alldebrid.com/hosts")
    }

    static getUnlockLink(link: string, token: string = defaultToken) {
        return Axios.get("https://api.alldebrid.com/link/unlock?agent=iStream&token=" + token + "&link=" + link)
    }

    static async getSynchroneUnlockLink(link: string, token: string = defaultToken) {
        return await Axios.get("https://api.alldebrid.com/link/unlock?agent=iStream&token=" + token + "&link=" + link)
    }

    static async getSynchroneProtectLink(link: string, token: string = defaultToken) {
        return await Axios.get("https://api.alldebrid.com/link/redirector?agent=iStream&token=" + token + "&link=" + link)
    }

    static getProtectLink(link: string, token: string = defaultToken) {
        return Axios.get("https://api.alldebrid.com/link/redirector?agent=iStream&token=" + token + "&link=" + link)
    }

    static getInfoLink(link: string, token = defaultToken) {
        return Axios.get("https://api.alldebrid.com/link/infos?agent=iStream&token=" + token + "&link=" + link)
    }
}