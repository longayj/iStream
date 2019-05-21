import { combineReducers } from 'redux';
import GlobalReducer from './globalReducer';
import HomeReducer from './homeReducer';
import VideoReducer from './videoReducer';
import MyVideosReducer from './myVideosReducer';
import PlaylistsReducer from './playlistsReducer';

export default combineReducers({
    global: GlobalReducer,
    home: HomeReducer,
    video: VideoReducer,
    myvideos: MyVideosReducer,
    playlists: PlaylistsReducer
});