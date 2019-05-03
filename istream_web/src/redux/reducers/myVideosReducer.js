import {
    MY_VIDEOS_SET_VIDEOS
} from "../types"

const initialState = {
    videos: []
};

export default (state = initialState, action) => {

    switch (action.type) {
        case MY_VIDEOS_SET_VIDEOS:
            return {
                ...state,
                videos: action.payload
            };
        default:
            return state;
    }
}