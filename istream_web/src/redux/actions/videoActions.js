import {
    VIDEO_SET_VIDEO,
    VIDEO_UNSET_VIDEO,
    VIDEO_SET_CURRENT_BEST_STREAMING_LANGUAGE,
    VIDEO_SET_CURRENT_BEST_STREAMING_QUALITY
} from "../types"

export const videoSetVideo = (video_info) => {
    return {
        type: VIDEO_SET_VIDEO,
        payload: video_info
    };
};

export const videoUnsetVideo = () => {
    return {
        type: VIDEO_UNSET_VIDEO
    };
};

export const videoSetCurrentBestStreamingLanguage = (value) => {
    return {
        type: VIDEO_SET_CURRENT_BEST_STREAMING_LANGUAGE,
        payload: value
    };
};

export const videoSetCurrentBestStreamingQuality = (value) => {
    return {
        type: VIDEO_SET_CURRENT_BEST_STREAMING_QUALITY,
        payload: value
    };
};