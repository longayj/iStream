import VideoQualities from "../constants/VideoQualities";
import Languages from "../constants/Languages";

const defaultState = {
    imageUrl: "https://www.zone-image.com/uploads/jQZTv.jpg",
    lang: "(VOSTFR)",
    link: "https://w1w.zone-telechargement1.org/exclus/51902-telecharger-the-walking-dead-saison-9-hdtv-vostfr.html",
    quality: "HDTV",
    title: "The Walking Dead - Saison 9"
};

class Video {

    constructor(state = defaultState,
                preferredStreamLanguage = Languages.French,
                preferredStreamQuality = VideoQualities.p360) {

        this.set(state);
    }

    set(state = defaultState) {

        this.imageUrl = (
            (state.imageUrl === undefined || state.imageUrl === null) ?
                defaultState.imageUrl
                :
                state.imageUrl
        );

        this.lang = (
            (state.lang === undefined || state.lang === null) ?
                defaultState.lang
                :
                state.lang
        );

        this.link = (
            (state.link === undefined || state.link === null) ?
                defaultState.link
                :
                state.link
        );

        this.quality = (
            (state.quality === undefined || state.quality === null) ?
                defaultState.quality
                :
                state.quality
        );

        this.title = (
            (state.title === undefined || state.title === null) ?
                defaultState.title
                :
                state.title
        );

    }

    toString() {
        return (`Video [ 
            imageUrl = ${this.imageUrl},  
            lang = ${this.lang},  
            link = ${this.link},  
            quality = ${this.quality},  
            title = ${this.title} ]`
        );
    }

}

export default Video;