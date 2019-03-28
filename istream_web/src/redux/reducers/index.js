import { combineReducers } from 'redux';
import GlobalReducer from './globalReducer';
import HomeReducer from './homeReducer';
import VideoReducer from './videoReducer';

export default combineReducers({
    global: GlobalReducer,
    home: HomeReducer,
    video: VideoReducer
});