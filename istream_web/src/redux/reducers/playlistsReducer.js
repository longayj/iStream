import {
    PLAYLISTS_SET_PLAYLISTS,
    PLAYLISTS_ADD_PLAYLIST,
    PLAYLISTS_UPDATE_PLAYLIST
} from "../types"

const initialState = {
    playlists: []
};

export default (state = initialState, action) => {

    let playlists;
    let index;

    switch (action.type) {
        case PLAYLISTS_SET_PLAYLISTS:
            return {
                ...state,
                playlists: action.payload
            };
        case PLAYLISTS_ADD_PLAYLIST:
            playlists = state.playlists;
            playlists.push(action.payload);

            return {
                ...state,
                playlists: playlists
            };
        case PLAYLISTS_UPDATE_PLAYLIST:

            playlists = state.playlists;
            index = playlists.findIndex(function (item) {
                return item.id === action.payload.id;
            });
            if (index !== -1) {
                playlists[index].name = action.payload.name;
                playlists[index].shared = action.payload.shared;
            }
            return {
                ...state,
                playlists: playlists
            };
        default:
            return state;
    }
}