import {
    VIDEO_SET_VIDEO,
    VIDEO_UNSET_VIDEO,
    VIDEO_SET_CURRENT_BEST_STREAMING_LANGUAGE,
    VIDEO_SET_CURRENT_BEST_STREAMING_QUALITY
} from "../types"

import Video from "../../models/Video";

const initialState = {
    video: new Video(),
    originInterfaceRoute: "",
    updateUrl: false
};

export default (state = initialState, action) => {

    let video;

    switch (action.type) {
        case VIDEO_SET_VIDEO:
            return {
                ...state,
                video: action.payload.video,
                originInterfaceRoute: action.payload.originInterfaceRoute
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
        default:
            return state;
    }
}