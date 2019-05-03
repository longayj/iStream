import {
    MY_VIDEOS_SET_VIDEOS
} from "../types"

export const myVideosSetVideos = (videos) => {
    return {
        type: MY_VIDEOS_SET_VIDEOS,
        payload: videos
    };
};