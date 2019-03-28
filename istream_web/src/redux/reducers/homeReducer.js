import {
    HOME_SET_VIDEOS,
    HOME_SET_VIDEO,
    HOME_SET_VIDEOS_STREAM_PREFERENCES,
    HOME_ADD_VIDEO,
    HOME_DELETE_VIDEO
} from "../types"

const initialState = {
    videos: [],
    updateGrid: false
};

export default (state = initialState, action) => {

    let video;
    let videos;
    let index;

    switch (action.type) {
        case HOME_SET_VIDEOS:
            return {
                ...state,
                videos: action.payload
            };
        case HOME_SET_VIDEO:

            videos = state.videos;

            index = videos.findIndex(function (item) {
                return item.id === action.payload.video.id;
            });

            videos[index].set(action.payload.video,
                action.payload.preferredStreamLanguage,
                action.payload.preferredStreamQuality);

            return {
                ...state,
                videos: videos
            };
        case HOME_SET_VIDEOS_STREAM_PREFERENCES:
            videos = state.videos;

            videos.forEach((item, index) =>{
                videos[index].findBestStream(action.payload.language, action.payload.quality);
            });

            return {
                ...state,
                videos: videos
            };
        case HOME_ADD_VIDEO:

            video = state.videos;
            video.push(action.payload);

            return {
                ...state,
                videos: video,
                updateGrid: !state.updateGrid
            };
        case HOME_DELETE_VIDEO:
            videos = state.videos;
            index = videos.findIndex(function (item) {
                return item.id === action.payload;
            });
            videos.splice(index, 1);
            return {
                ...state,
                videos: videos,
                updateGrid: !state.updateGrid
            };
        default:
            return state;
    }
}