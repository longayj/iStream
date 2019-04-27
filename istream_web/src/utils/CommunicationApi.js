import axios from 'axios';
import HttpMethods from '../constants/HttpMethods';

class Communication {
    constructor(method, path, params) {
        this.method = method;
        this.path = path;
        this.params = params;
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