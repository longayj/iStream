import {
    MY_VIDEOS_SET_VIDEOS,
    MY_VIDEOS_SET_VIDEO_LIKE,
    MY_VIDEOS_DELETE_VIDEO
} from "../types"

const initialState = {
    videos: []
};

export default (state = initialState, action) => {

    let videos;
    let index;

    switch (action.type) {
        case MY_VIDEOS_SET_VIDEOS:
            return {
                ...state,
                videos: action.payload
            };
        case MY_VIDEOS_SET_VIDEO_LIKE:
            videos = state.videos;
            index = videos.findIndex(function (item) {
                return item.id === action.payload.id;
            });
            if (index !== -1 && videos[index].liked != action.payload.liked) {
                videos[index].liked = action.payload.liked;
            }
            return {
                ...state,
                videos: videos
            };
        case MY_VIDEOS_DELETE_VIDEO:
            videos = state.videos;
            index = videos.findIndex(function (item) {
                return item.id === action.payload;
            });
            videos.splice(index, 1);
            return {
                ...state,
                videos: videos
            };
        default:
            return state;
    }
}