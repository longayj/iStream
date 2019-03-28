const Xray = require('x-ray');

const makeDriver = require('request-x-ray');

const Promise = require('bluebird');

var x = Xray({
    filters: {
        trim: function (value) {
            //console.log(value)
            return typeof value === 'string' ? value.trim() : value
        }
    }
});

function decryptDlProtecteUrl(url) {
    let words = [['https://www.dl-protecte.com/', ''],
    ['http://www.dl-protecte.com/', ''],
    ['123455600', 'http://'],
    ['123455601', 'https://'],
    ['123455602', 'uptobox'],
    //['123455603', '1fichier'],
    ['123455604', 'uploaded'],
    ['123455605', 'ul.to'],
    ['123455606', 'rapidgator'],
    //['23455607', 'turbobit'],
    ['123455608', 'nitroflare'],
    ['123455609', 'uplea'],
    ['123455610', '.com'],
    ['123455611', '.net'],
    ['123455611', '.org'],
    ['123455613', 'video'],
    ['123455614', 'embed'],
    ['123455615', '/'],
    ['123455616', '#'],
    ['123455617', '?']];

    for (var i = 0; i < words.length; i++) {
        url = url.replace(words[i][0], words[i][1]);
    }
    return url;
}
// https://www.annuaire-telechargement.com/
let zoneUrl = 'https://www.annuaire-telechargement.com/' //"https://www.zone-telechargement.world"

export class ZoneTelechargementApi {
    static getNews(path = "/nouveaute", pageLimit = 1): any {
        
        let url = zoneUrl + path;

        return Promise.fromCallback(x(url, '.cover_global', [{
            title: '.cover_infos_title > a@text | trim',
            link: '.cover_infos_title > a@href | trim',
            quality: '.detail_release span@text | trim',
            lang: '.detail_release span:nth-child(2)@text | trim',
            genre: '.cover_infos_genre@text | trim',
            year: '.cover_infos_release_date@text | trim',
            imageUrl: '.mainimg@src | trim'
        }])
            .paginate('.navigation > a:contains(Suivant)@href')
            .limit(pageLimit));
    }

    static search(query, pageLimit = 1) {

        query = encodeURI(query);

        let url = zoneUrl + '/index.php?' +
            'do=search&subaction=search&search_start=1&full_search=1&result_from=1&story=' + query +
            '&all_word_seach=1&titleonly=3&searchuser=&replyless=0&replylimit=0&searchdate=0&beforeafter=after&sortby=date&resorder=desc&showposts=0&catlist%5B%5D=0';

        return Promise.fromCallback(x(url, '.cover_global', [{
            title: '.cover_infos_title > a@text | trim',
            link: '.cover_infos_title > a@href | trim',
            quality: '.detail_release span@text | trim',
            lang: '.detail_release span:nth-child(2)@text | trim',
            genre: '.cover_infos_genre@text | trim',
            year: '.cover_infos_release_date@text | trim',
            imageUrl: '.mainimg@src | trim'
        }])
            .paginate('.navigation > a:contains(Suivant)@href')
            .limit(pageLimit));
    };

    static getLast(query, pageLimit = 1) {

        query = encodeURI(query);

        let url = zoneUrl + '/index.php';

        return Promise.fromCallback(x(url, '.cover_global', [{
            title: '.cover_infos_title > a@text | trim',
            link: '.cover_infos_title > a@href | trim',
            quality: '.detail_release span@text | trim',
            lang: '.detail_release span:nth-child(2)@text | trim',
            genre: '.cover_infos_genre@text | trim',
            year: '.cover_infos_release_date@text | trim',
            imageUrl: '.mainimg@src | trim'
        }])
            .paginate('.navigation > a:contains(Suivant)@href')
            .limit(pageLimit));
    };

    static getDetails(url) {
        console.log("get url info : " + url)
        return Promise.fromCallback(x(url, 'body', {
            links: ['a:contains(Télécharger)@href'],
            linksSerie: ['a:contains(Episode)@href'],
            detail: '.corps > center > center@html'
        })).then(r => {
                r.links = r.links.map(l => decryptDlProtecteUrl(l.replace('\r', '')));
                return r;
            });
    };

}