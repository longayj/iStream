

var allocine = require('allocine-api');

export class AlloCineApi {

    static searchMovies(q: string, filter: string, callback) {
        return allocine.api('search', {q: q, filter: filter}, callback);
    }

    static searchMovie(code: string, callback) {
        return allocine.api('movie', {code: code, profile: 'large'}, callback);
    }
}