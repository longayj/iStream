import axios from 'axios';
import jwt from 'jsonwebtoken';
import HttpMethods from '../constants/HttpMethods';

class Communication {
    constructor(method, path, params) {
        this.method = method;
        this.path = path;
        this.params = params;
    }

    static checkToken() {
        let token = localStorage.getItem('token');

        if (token == null || token == "") {
            return false;
        }

        let decoded;
        try {
            decoded = jwt.verify(token, "@QEGTUI");
        } catch (e) {
            return false;
        }

        if (decoded == null || (new Date().getTime() / 1000) > decoded.exp) {
            return false;
        }
        return true;
    }

    static getTokenId() {
        let token = localStorage.getItem('token');
        let decoded = jwt.verify(token, "@QEGTUI");
        return decoded.userId;
    }

    sendRequest(thenFunc, catchFunc, auth) {
        let method = this.method;
        let path = this.path;
        let params = this.params;
        let headers = {};

        if (method === HttpMethods.GET || method === HttpMethods.DELETE) {

            if (auth == true) {
                headers["Authorization"] = "Bearer " + localStorage.getItem('token');
            }

            axios({
                headers: headers,
                method: method,
                url: path,
                params: params
            })
            .then(thenFunc)
            .catch(catchFunc);

        } else if (method === HttpMethods.POST || method === HttpMethods.PUT) {

            if (auth == true) {
                headers["Authorization"] = "Bearer " + localStorage.getItem('token');
            }

            axios({
                headers: headers,
                method: method,
                url: path,
                data: params
            })
            .then(thenFunc)
            .catch(catchFunc);
        }
    }

}

export default Communication;