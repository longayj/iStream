import axios from 'axios';
import HttpMethods from '../constants/HttpMethods';

class Communication {
    constructor(method, path, params) {
        this.method = method;
        this.path = path;
        this.params = params;
    }

    sendRequest(thenFunc, catchFunc) {
        let method = this.method;
        let path = this.path;
        let params = this.params;

        if (method === HttpMethods.GET || method === HttpMethods.DELETE) {

            axios({
                method: method,
                url: path,
                params: params
            })
            .then(thenFunc)
            .catch(catchFunc);

        } else if (method === HttpMethods.POST || method === HttpMethods.PUT) {

            axios({
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