import VideoTypes from "../constants/VideoTypes";
import VideoQualities from "../constants/VideoQualities";
import Languages from "../constants/Languages";
import Paths from "../constants/Paths";

const defaultState = {
    id: -1,
    currentUserId: -1,
    title: "",
    originalTitle: "",
    description: "",
    synopsis: "",
    url: "",
    downloadLink: "",
    filename: "",
    saison: -1,
    episode: -1,
    productionYear: -1,
    releaseDate: "",
    statistics: {
        id: -1,
        pressRating: 0,
        userRating: 0
    },
    streaming: {
        id: -1,
        fr360p: "",
        fr480p: "",
        fr720p: "",
        fr1080p: "",
        en360p: "",
        en480p: "",
        en720p: "",
        en1080p: "",
    },
    castingShort: {
        directors: "",
        actors: ""
    },
    posterUrl: "",
    total_likes: 0,
    liked: false,
    like_id: -1,
    likes: [],
    type: VideoTypes.MOVIE,
    currentBestStreamingQuality: "",
    currentBestStreamingLanguage: "",
    currentBestStreaming: ""
};

let identity = [];

identity["fr360p"] = { quality: VideoQualities.p360, language: Languages.French};
identity["fr480p"] = { quality: VideoQualities.p480, language: Languages.French};
identity["fr720p"] = { quality: VideoQualities.p720, language: Languages.French};
identity["fr1080p"] = { quality: VideoQualities.p1080, language: Languages.French};

identity["en360p"] = { quality: VideoQualities.p360, language: Languages.English};
identity["en480p"] = { quality: VideoQualities.p480, language: Languages.English};
identity["en720p"] = { quality: VideoQualities.p720, language: Languages.English};
identity["en1080p"] = { quality: VideoQualities.p1080, language: Languages.English};

let delta = [];

delta[VideoQualities.p360] = [];
delta[VideoQualities.p360][VideoQualities.p360] = 0;
delta[VideoQualities.p360][VideoQualities.p480] = 1;
delta[VideoQualities.p360][VideoQualities.p720] = 2;
delta[VideoQualities.p360][VideoQualities.p1080] = 3;

delta[VideoQualities.p480] = [];
delta[VideoQualities.p480][VideoQualities.p360] = 1;
delta[VideoQualities.p480][VideoQualities.p480] = 0;
delta[VideoQualities.p480][VideoQualities.p720] = 1;
delta[VideoQualities.p480][VideoQualities.p1080] = 2;

delta[VideoQualities.p720] = [];
delta[VideoQualities.p720][VideoQualities.p360] = 2;
delta[VideoQualities.p720][VideoQualities.p480] = 1;
delta[VideoQualities.p720][VideoQualities.p720] = 0;
delta[VideoQualities.p720][VideoQualities.p1080] = 1;

delta[VideoQualities.p1080] = [];
delta[VideoQualities.p1080][VideoQualities.p360] = 3;
delta[VideoQualities.p1080][VideoQualities.p480] = 2;
delta[VideoQualities.p1080][VideoQualities.p720] = 1;
delta[VideoQualities.p1080][VideoQualities.p1080] = 0;

delta[Languages.French] = [];
delta[Languages.French][Languages.French] = 0;
delta[Languages.French][Languages.English] = 1;

delta[Languages.English] = [];
delta[Languages.English][Languages.French] = 1;
delta[Languages.English][Languages.English] = 0;

class Video {

    constructor(state = defaultState,
                preferredStreamLanguage = Languages.French,
                preferredStreamQuality = VideoQualities.p360,
                currentUserId = -1) {

        this.set(state, preferredStreamLanguage, preferredStreamQuality, currentUserId);
    }

    set(state = defaultState,
        preferredStreamLanguage = Languages.French,
        preferredStreamQuality = VideoQualities.p360,
        currentUserId = -1) {

        this.id = (
            (state.id === undefined || state.id === null) ?
                defaultState.id
                :
                state.id
        );

        this.title = (
            (state.title === undefined || state.title === null) ?
                defaultState.title
                :
                state.title
        );

        this.originalTitle = (
            (state.originalTitle === undefined || state.originalTitle === null) ?
                defaultState.originalTitle
                :
                state.originalTitle
        );

        this.description = (
            (state.description === undefined || state.description === null) ?
                defaultState.description
                :
                state.description
        );

        this.synopsis = (
            (state.synopsis === undefined || state.synopsis === null) ?
                defaultState.synopsis
                :
                state.synopsis
        );

        this.url = (
            (state.url === undefined || state.url === null) ?
                defaultState.url
                :
                state.url
        );

        this.downloadLink = (
            (state.downloadLink === undefined || state.downloadLink === null) ?
                defaultState.downloadLink
                :
                state.downloadLink
        );

        this.filename = (
            (state.filename === undefined || state.filename === null) ?
                defaultState.filename
                :
                state.filename
        );

        this.saison = (
            (state.saison === undefined || state.saison === null) ?
                defaultState.saison
                :
                state.saison
        );

        this.episode = (
            (state.episode === undefined || state.episode === null) ?
                defaultState.episode
                :
                state.episode
        );

        this.productionYear = (
            (state.productionYear === undefined || state.productionYear === null) ?
                defaultState.productionYear
                :
                state.productionYear
        );

        this.releaseDate = (
            (state.releaseDate === undefined || state.releaseDate === null) ?
                defaultState.releaseDate
                :
                state.releaseDate
        );

        this.statistics = (
            (state.statistics === undefined || state.statistics === null) ?
                defaultState.statistics
                :
                state.statistics
        );

        this.streaming = (
            (state.streaming === undefined || state.streaming === null) ?
                defaultState.streaming
                :
                state.streaming
        );

        this.castingShort = (
            (state.castingShort === undefined || state.castingShort === null) ?
                defaultState.castingShort
                :
                state.castingShort
        );

        this.posterUrl = (
            (state.posterUrl === undefined || state.posterUrl === null) ?
                defaultState.posterUrl
                :
                state.posterUrl
        );

        this.total_likes = (
            (state.total_likes === undefined || state.total_likes === null) ?
                defaultState.total_likes
                :
                state.total_likes
        );

        this.likes = (
            (state.likes === undefined || state.likes === null) ?
                defaultState.likes
                :
                state.likes
        );

        this.like_id = (
            (state.like_id === undefined || state.like_id === null) ?
                defaultState.like_id
                :
                state.like_id
        );

        this.liked = (
            (state.liked === undefined || state.liked === null) ?
                defaultState.liked
                :
                state.liked
        );

        this.currentUserId = currentUserId;

        if (this.currentUserId != -1) {
            let me = this;
            this.likes.forEach(function (item) {
                if (item.userId == me.currentUserId &&
                    (item.value == 1 || item.value == "1" || item.value == true)) {

                    me.liked = true;
                    me.like_id = item.id;
                }
            });
        }

        this.type = (
            (this.saison === defaultState.saison || this.episode === defaultState.episode) ?
                VideoTypes.MOVIE
                :
                VideoTypes.SERIE
        );

        this.findBestStream(preferredStreamLanguage, preferredStreamQuality);
    }

    getStreamUrl() {
        const STREAM_PATH = Paths.HOST + Paths.STREAMS + "/";
        const STREAM_PARAM = "?resolution=";

        return STREAM_PATH + this.streaming.id + STREAM_PARAM +
            this.currentBestStreamingLanguage + this.currentBestStreamingQuality + "&token=" + localStorage.getItem('token');
    }

    setCurrentBestStreamingLanguage(value) {

        this.currentBestStreamingLanguage = value;
        this.currentBestStreaming = this.getStreamUrl();
    }

    setCurrentBestStreamingQuality(value) {

        this.currentBestStreamingQuality = value;
        this.currentBestStreaming = this.getStreamUrl();
    }

    getAvailable() {
        let qualities = [];
        let languages = [];
        let keepLanguages = [];
        let keepQualities = [];
        let me = this;

        Object.keys(me.streaming).forEach(function (key) {

            if (identity[key] !== undefined &&
                    me.streaming[key] !== "" &&
                    keepLanguages.indexOf(identity[key].language) === -1) {

                languages.push({
                    value: identity[key].language,
                    label: identity[key].language
                });
                keepLanguages.push(identity[key].language);

            }
            if (identity[key] !== undefined &&
                me.streaming[key] !== "" &&
                keepQualities.indexOf(identity[key].quality) === -1) {

                qualities.push({
                    value: identity[key].quality,
                    label: identity[key].quality
                });
                keepQualities.push(identity[key].quality);

            }
        });
        return {
            languages: languages,
            qualities: qualities
        };
    }

    findBestStream(preferredStreamLanguage, preferredStreamQuality) {

        let me = this;

        let keepBestLanguage = preferredStreamLanguage;
        let keepBestLanguageDelta = 100000;
        let keepBestQuality = preferredStreamQuality;
        let keepBestQualityDelta = 100000;

        Object.keys(me.streaming).forEach(function (key) {

            if (identity[key] !== undefined &&
                me.streaming[key] !== "") {

                if (delta[preferredStreamLanguage][identity[key].language] < keepBestLanguageDelta) {
                    keepBestLanguage = identity[key].language;
                    keepBestLanguageDelta = delta[preferredStreamLanguage][identity[key].language];
                }

                if (delta[preferredStreamQuality][identity[key].quality] < keepBestQualityDelta) {
                    keepBestQuality = identity[key].quality;
                    keepBestQualityDelta = delta[preferredStreamQuality][identity[key].quality];
                }
            }

        });

        this.currentBestStreamingLanguage = keepBestLanguage;
        this.currentBestStreamingQuality = keepBestQuality;
        this.currentBestStreaming = this.getStreamUrl();
    }

    toString() {
        return (`Video [ 
            id = ${this.id},  
            title = ${this.title}, 
            description = ${this.description}, 
            synopsis = ${this.synopsis}, 
            url = ${this.url}, 
            type = ${this.type}, 
            saison = ${this.saison}, 
            episode = ${this.episode} ]`
        );
    }

}

export default Video;