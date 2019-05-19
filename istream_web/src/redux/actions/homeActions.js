import {
    HOME_SET_VIDEOS,
    HOME_SET_VIDEO_LIKE,
    HOME_SET_VIDEO,
    HOME_SET_VIDEOS_STREAM_PREFERENCES,
    HOME_ADD_VIDEO,
    HOME_DELETE_VIDEO
} from "../types"

export const homeSetVideos = (videos) => {
    return {
        type: HOME_SET_VIDEOS,
        payload: videos
    };
};

export const homeSetVideoLike = (info) => {
    return {
        type: HOME_SET_VIDEO_LIKE,
        payload: info
    };
};

export const homeSetVideo = (video) => {
    return {
        type: HOME_SET_VIDEO,
        payload: video
    };
};

export const homeSetVideosStreamPreferences = (preferences) => {
    return {
        type: HOME_SET_VIDEOS_STREAM_PREFERENCES,
        payload: preferences
    };
};

export const homeAddVideo = (video) => {
    return {
        type: HOME_ADD_VIDEO,
        payload: video
    };
};

export const homeDeleteVideo = (id) => {
    return {
        type: HOME_DELETE_VIDEO,
        payload: id
    };
};