import {
    PLAYLISTS_SET_PLAYLISTS,
    PLAYLISTS_ADD_PLAYLIST,
    PLAYLISTS_UPDATE_PLAYLIST
} from "../types"

export const playlistsSetPlaylists = (playlists) => {
    return {
        type: PLAYLISTS_SET_PLAYLISTS,
        payload: playlists
    };
};

export const playlistsAddPlaylist = (playlist) => {
    return {
        type: PLAYLISTS_ADD_PLAYLIST,
        payload: playlist
    };
};

export const playlistsUpdatePlaylist = (playlist) => {
    return {
        type: PLAYLISTS_UPDATE_PLAYLIST,
        payload: playlist
    };
};