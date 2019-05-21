import {
    MY_VIDEOS_SET_VIDEOS,
    MY_VIDEOS_SET_VIDEO_LIKE,
    MY_VIDEOS_DELETE_VIDEO
} from "../types"

export const myVideosSetVideos = (videos) => {
    return {
        type: MY_VIDEOS_SET_VIDEOS,
        payload: videos
    };
};

export const myVideosSetVideoLike = (info) => {
    return {
        type: MY_VIDEOS_SET_VIDEO_LIKE,
        payload: info
    };
};

export const myVideosDeleteVideo = (info) => {
    return {
        type: MY_VIDEOS_DELETE_VIDEO,
        payload: info
    };
};