import {
    VIDEO_SET_VIDEO,
    VIDEO_UNSET_VIDEO,
    VIDEO_SET_CURRENT_BEST_STREAMING_LANGUAGE,
    VIDEO_SET_CURRENT_BEST_STREAMING_QUALITY,
    VIDEO_LIKE_VIDEO,
    VIDEO_ADD_COMMENT,
    VIDEO_SET_COMMENTS
} from "../types"

import Video from "../../models/Video";

const initialState = {
    video: new Video(),
    is_playlist: false,
    playlist_name: "",
    videos: [],
    originInterfaceRoute: "",
    updateUrl: false,
    updateComments: false
};

export default (state = initialState, action) => {

    let video;

    switch (action.type) {
        case VIDEO_SET_VIDEO:
            return {
                ...state,
                video: action.payload.video,
                originInterfaceRoute: action.payload.originInterfaceRoute,
                is_playlist: action.payload.is_playlist,
                videos: action.payload.videos,
                playlist_name: action.payload.playlist_name,
                playlist_index: action.payload.playlist_index
            };
        case VIDEO_UNSET_VIDEO:
            return {
                ...state,
                video: initialState.video,
                originInterfaceRoute: initialState.originInterfaceRoute
            };
        case VIDEO_SET_CURRENT_BEST_STREAMING_LANGUAGE:

            video = state.video;
            video.setCurrentBestStreamingLanguage(action.payload);

            return {
                ...state,
                video: video,
                updateUrl: !state.updateUrl
            };
        case VIDEO_SET_CURRENT_BEST_STREAMING_QUALITY:

            video = state.video;
            video.setCurrentBestStreamingQuality(action.payload);

            return {
                ...state,
                video: video,
                updateUrl: !state.updateUrl
            };
        case VIDEO_LIKE_VIDEO:

            video = state.video;

            if (video.liked != action.payload.liked && action.payload.liked == true) {
                video.liked = true;
                video.like_id = action.payload.like_id;
                video.total_likes = video.total_likes + 1;
            } else if (video.liked != action.payload.liked && action.payload.liked == false) {
                video.liked = false;
                video.like_id = -1;
                video.total_likes = video.total_likes - 1;
            }

            return {
                ...state,
                video: video
            };
        case VIDEO_ADD_COMMENT:

            video = state.video;
            video.comments.push(action.payload);

            return {
                ...state,
                video: video,
                updateComments: !state.updateComments
            };
        default:
            return state;
    }
}