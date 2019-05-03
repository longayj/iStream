import {

    GLOBAL_DISPLAY_LOAD_MASK,
    GLOBAL_DISMISS_LOAD_MASK,

    GLOBAL_DISPLAY_NOTIFICATION_SNACKBAR,
    GLOBAL_DISMISS_NOTIFICATION_SNACKBAR,

    GLOBAL_DISPLAY_ALERT_DIALOG,
    GLOBAL_DISMISS_ALERT_DIALOG,

    GLOBAL_DISPLAY_CONFIRM_DIALOG,
    GLOBAL_DISMISS_CONFIRM_DIALOG,

    GLOBAL_DISPLAY_CREATE_PLAYLIST_MODAL,
    GLOBAL_DISMISS_CREATE_PLAYLIST_MODAL,

    GLOBAL_DISPLAY_ADD_VIDEO_MODAL,
    GLOBAL_DISMISS_ADD_VIDEO_MODAL,
    GLOBAL_ADD_VIDEO_MODAL_SET_VIDEO_TITLE,
    GLOBAL_ADD_VIDEO_MODAL_SET_SUGGESTIONS,
    GLOBAL_ADD_VIDEO_MODAL_SET_SUGGESTIONS_POSSIBLE,
    GLOBAL_ADD_VIDEO_MODAL_SET_CURRENT_VIDEO,
    GLOBAL_ADD_VIDEO_MODAL_SET_VIDEO_URL,

    GLOBAL_AUTH_SUCCESS,
    GLOBAL_AUTH_FAILURE,

    GLOBAL_SETTINGS_SET_LANGUAGE,
    GLOBAL_SETTINGS_SET_USERNAME,
    GLOBAL_SETTINGS_SET_EMAIL,

    GLOBAL_SETTINGS_SET_DARK_MODE,
    GLOBAL_SETTINGS_SET_PREFERRED_STREAM_LANGUAGE,
    GLOBAL_SETTINGS_SET_PREFERRED_STREAM_QUALITY,
    GLOBAL_SETTINGS_SET_PRINCIPAL_COLOR,
    GLOBAL_SETTINGS_SET_SECONDARY_COLOR,

    GLOBAL_RESET_SETTINGS_CHANGES,
    GLOBAL_APPLY_SETTINGS_CHANGES,

    GLOBAL_SET_NAVIGATION,
    GLOBAL_SET_MOBILE_DRAWER_IS_OPEN,

    GLOBAL_PLAYLISTS_IS_LOAD,
    GLOBAL_HOME_IS_LOAD,
    GLOBAL_MY_VIDEOS_IS_LOAD,

    GLOBAL_RESET

} from "../types"

import Languages from "../../constants/Languages";
import VideoQualities from "../../constants/VideoQualities";

import Validator from "../../utils/Validator";

const initialState = {
    showLoadMask: false,

    showNotificationSnackbar: false,
    notificationSnackbarText: "",

    showAlert: false,
    alertTitle: "",
    alertText: "",

    showConfirm: false,
    confirmTitle: "",
    confirmText: "",
    confirmTarget: "",
    confirmCallBackFunc: function () {},
    confirmCallBackProps: {},

    showCreatePlaylistModal: false,

    showAddVideoModal: false,
    addVideoModalVideoTitle: "",
    addVideoModalVideoTitleError: true,
    addVideoModalSuggestions: [],
    addVideoModalSuggestionsPossible: true,
    addVideoModalVideoUrl: "",
    addVideoModalVideoUrlError: true,

    addVideoModalCurrentVideoCode: -1,
    addVideoModalCurrentVideoTitle: "",
    addVideoModalCurrentVideoProductionYear: -1,
    addVideoModalCurrentVideoDirectors: "",
    addVideoModalCurrentVideoActors: "",
    addVideoModalCurrentVideoPoster: "",

    profile: {
        id: -1,
        auth: false,
        isAdmin: true,
        username: "Macubix",
        email: "macubix@gmail.com",
        pictureUrl: "",
        darkMode: false,
        primaryColor: "#338ABD",
        secondaryColor: "#F1580A",
        languageString: Languages.French,
        preferredStreamLanguage: Languages.French,
        preferredStreamQuality: VideoQualities.p360
    },

    settingsProfile: {
        username: "Macubix",
        email: "macubix@gmail.com",
        pictureUrl: "",
        darkMode: false,
        primaryColor: "#338ABD",
        secondaryColor: "#F1580A",
        languageString: Languages.French,
        preferredStreamLanguage: Languages.French,
        preferredStreamQuality: VideoQualities.p360
    },

    mobileDrawerOpen: false,
    selectedRoute: "",
    keepPrevRouteSettings: "",
    settingsToggleActive: false,

    homeIsLoad: false,
    myVideosIsLoad: false,
    playlistsIsLoad: false
};

export default (state = initialState, action) => {

    let error;

    switch (action.type) {
        case GLOBAL_DISPLAY_LOAD_MASK:
            return {
                ...state,
                showLoadMask: true
            };
        case GLOBAL_DISMISS_LOAD_MASK:
            return {
                ...state,
                showLoadMask: false
            };
        case GLOBAL_DISPLAY_NOTIFICATION_SNACKBAR:
            return {
                ...state,
                showNotificationSnackbar: true,
                notificationSnackbarText: action.payload
            };
        case GLOBAL_DISMISS_NOTIFICATION_SNACKBAR:
            return {
                ...state,
                showNotificationSnackbar: false,
                notificationSnackbarText: initialState.notificationSnackbarText
            };
        case GLOBAL_DISPLAY_ALERT_DIALOG:
            return {
                ...state,
                showAlert: true,
                alertTitle: action.payload.title,
                alertText: action.payload.text
            };
        case GLOBAL_DISMISS_ALERT_DIALOG:
            return {
                ...state,
                showAlert: false,
                alertTitle: "",
                alertText: ""
            };
        case GLOBAL_DISPLAY_CONFIRM_DIALOG:
            return {
                ...state,
                showConfirm: true,
                confirmTitle: action.payload.title,
                confirmText: action.payload.text,
                confirmTarget: action.payload.target,
                confirmCallBackFunc: action.payload.callback,
                confirmCallBackProps: action.payload.props
            };
        case GLOBAL_DISMISS_CONFIRM_DIALOG:
            return {
                ...state,
                showConfirm: false,
                confirmTitle: initialState.confirmTitle,
                confirmText: initialState.confirmText,
                confirmTarget: initialState.confirmTarget,
                confirmCallBackFunc: initialState.confirmCallBackFunc,
                confirmCallBackProps: initialState.confirmCallBackProps
            };

        case GLOBAL_DISPLAY_CREATE_PLAYLIST_MODAL:
            return {
                ...state,
                showCreatePlaylistModal: true
            };
        case GLOBAL_DISMISS_CREATE_PLAYLIST_MODAL:
            return {
                ...state,
                showCreatePlaylistModal: false
            };

        case GLOBAL_DISPLAY_ADD_VIDEO_MODAL:
            return {
                ...state,
                showAddVideoModal: true,
                addVideoModalVideoTitle: initialState.addVideoModalVideoTitle,
                addVideoModalVideoTitleError: initialState.addVideoModalVideoTitleError,
                addVideoModalSuggestions: initialState.addVideoModalSuggestions,
                addVideoModalSuggestionsPossible: initialState.addVideoModalSuggestionsPossible,
                addVideoModalVideoUrl: initialState.addVideoModalVideoUrl,
                addVideoModalVideoUrlError: initialState.addVideoModalVideoUrlError
            };
        case GLOBAL_DISMISS_ADD_VIDEO_MODAL:
            return {
                ...state,
                showAddVideoModal: false,
                addVideoModalVideoTitle: initialState.addVideoModalVideoTitle,
                addVideoModalVideoTitleError: initialState.addVideoModalVideoTitleError,
                addVideoModalSuggestions: initialState.addVideoModalSuggestions,
                addVideoModalSuggestionsPossible: initialState.addVideoModalSuggestionsPossible,
                addVideoModalVideoUrl: initialState.addVideoModalVideoUrl,
                addVideoModalVideoUrlError: initialState.addVideoModalVideoUrlError,

                addVideoModalCurrentVideoCode: initialState.addVideoModalCurrentVideoCode,
                addVideoModalCurrentVideoTitle: initialState.addVideoModalCurrentVideoTitle,
                addVideoModalCurrentVideoProductionYear: initialState.addVideoModalCurrentVideoProductionYear,
                addVideoModalCurrentVideoDirectors: initialState.addVideoModalCurrentVideoDirectors,
                addVideoModalCurrentVideoActors: initialState.addVideoModalCurrentVideoActors,
                addVideoModalCurrentVideoPoster: initialState.addVideoModalCurrentVideoPoster
            };

        case GLOBAL_ADD_VIDEO_MODAL_SET_VIDEO_TITLE:

            error = !Validator.videoTitle(action.payload);
            return {
                ...state,
                addVideoModalVideoTitle: action.payload,
                addVideoModalVideoTitleError: error
            };
        case GLOBAL_ADD_VIDEO_MODAL_SET_SUGGESTIONS:
            return {
                ...state,
                addVideoModalSuggestions: action.payload
            };
        case GLOBAL_ADD_VIDEO_MODAL_SET_SUGGESTIONS_POSSIBLE:
            return {
                ...state,
                addVideoModalSuggestionsPossible: action.payload
            };
        case GLOBAL_ADD_VIDEO_MODAL_SET_CURRENT_VIDEO:

            return {
                ...state,
                addVideoModalCurrentVideoCode: action.payload.code,
                addVideoModalCurrentVideoTitle: action.payload.title,
                addVideoModalCurrentVideoProductionYear: action.payload.productionYear,
                addVideoModalCurrentVideoDirectors: action.payload.directors,
                addVideoModalCurrentVideoActors: action.payload.actors,
                addVideoModalCurrentVideoPoster: action.payload.poster
            };
        case GLOBAL_ADD_VIDEO_MODAL_SET_VIDEO_URL:

            error = !Validator.url(action.payload);
            return {
                ...state,
                addVideoModalVideoUrl: action.payload,
                addVideoModalVideoUrlError: error
            };

        case GLOBAL_AUTH_SUCCESS:
            return {
                ...state,
                profile: {
                    id: action.payload.id,
                    auth: true,
                    isAdmin: action.payload.isAdmin,
                    username: action.payload.username,
                    email: action.payload.email,
                    pictureUrl: action.payload.pictureUrl,
                    darkMode: action.payload.darkMode,
                    primaryColor: action.payload.primaryColor,
                    secondaryColor: action.payload.secondaryColor,
                    languageString: action.payload.languageString,
                    preferredStreamLanguage: action.payload.preferredStreamLanguage,
                    preferredStreamQuality: action.payload.preferredStreamQuality
                },
                settingsProfile: {
                    username: action.payload.username,
                    email: action.payload.email,
                    pictureUrl: action.payload.pictureUrl,
                    darkMode: action.payload.darkMode,
                    primaryColor: action.payload.primaryColor,
                    secondaryColor: action.payload.secondaryColor,
                    languageString: action.payload.languageString,
                    preferredStreamLanguage: action.payload.preferredStreamLanguage,
                    preferredStreamQuality: action.payload.preferredStreamQuality
                }
            };
        case GLOBAL_AUTH_FAILURE:
            return {
                ...state,
                profile: initialState.profile,
                settingsProfile: initialState.settingsProfile
            };
        case GLOBAL_SETTINGS_SET_LANGUAGE:
            return {
                ...state,
                settingsProfile: {
                    ...state.settingsProfile,
                    languageString: action.payload
                }
            };
        case GLOBAL_SETTINGS_SET_USERNAME:
            return {
                ...state,
                settingsProfile: {
                    ...state.settingsProfile,
                    username: action.payload
                }
            };
        case GLOBAL_SETTINGS_SET_EMAIL:
            return {
                ...state,
                settingsProfile: {
                    ...state.settingsProfile,
                    email: action.payload
                }
            };
        case GLOBAL_SETTINGS_SET_DARK_MODE:
            return {
                ...state,
                settingsProfile: {
                    ...state.settingsProfile,
                    darkMode: action.payload
                }
            };
        case GLOBAL_SETTINGS_SET_PRINCIPAL_COLOR:
            return {
                ...state,
                settingsProfile: {
                    ...state.settingsProfile,
                    primaryColor: action.payload
                }
            };
        case GLOBAL_SETTINGS_SET_SECONDARY_COLOR:
            return {
                ...state,
                settingsProfile: {
                    ...state.settingsProfile,
                    secondaryColor: action.payload
                }
            };
        case GLOBAL_SETTINGS_SET_PREFERRED_STREAM_LANGUAGE:
            return {
                ...state,
                settingsProfile: {
                    ...state.settingsProfile,
                    preferredStreamLanguage: action.payload
                }
            };
        case GLOBAL_SETTINGS_SET_PREFERRED_STREAM_QUALITY:
            return {
                ...state,
                settingsProfile: {
                    ...state.settingsProfile,
                    preferredStreamQuality: action.payload
                }
            };
        case GLOBAL_RESET_SETTINGS_CHANGES:
            return {
                ...state,
                settingsProfile: {
                    ...state.settingsProfile,
                    username: state.profile.username,
                    email: state.profile.email,
                    pictureUrl: state.profile.pictureUrl,
                    darkMode: state.profile.darkMode,
                    primaryColor: state.profile.primaryColor,
                    secondaryColor: state.profile.secondaryColor,
                    languageString: state.profile.languageString,
                    preferredStreamLanguage: state.profile.preferredStreamLanguage,
                    preferredStreamQuality: state.profile.preferredStreamQuality
                },
            };
        case GLOBAL_APPLY_SETTINGS_CHANGES:
            return {
                ...state,
                profile: {
                    ...state.profile,
                    username: state.settingsProfile.username,
                    email: state.settingsProfile.email,
                    pictureUrl: state.settingsProfile.pictureUrl,
                    darkMode: state.settingsProfile.darkMode,
                    primaryColor: state.settingsProfile.primaryColor,
                    secondaryColor: state.settingsProfile.secondaryColor,
                    languageString: state.settingsProfile.languageString,
                    preferredStreamLanguage: state.settingsProfile.preferredStreamLanguage,
                    preferredStreamQuality: state.settingsProfile.preferredStreamQuality
                },
            };
        case GLOBAL_SET_NAVIGATION:
            return {
                ...state,
                selectedRoute: action.payload.selectedRoute,
                keepPrevRouteSettings: action.payload.keepPrevRouteSettings,
                settingsToggleActive: action.payload.settingsToggleActive,
                mobileDrawerOpen: (action.payload.mobileDrawerOpen === undefined ?
                    state.mobileDrawerOpen : action.payload.mobileDrawerOpen)
            };
        case GLOBAL_SET_MOBILE_DRAWER_IS_OPEN:
            return {
                ...state,
                mobileDrawerOpen: action.payload
            };
        case GLOBAL_HOME_IS_LOAD:
            return {
                ...state,
                homeIsLoad: true
            };
        case GLOBAL_MY_VIDEOS_IS_LOAD:
            return {
                ...state,
                myVideosIsLoad: true
            };
        case GLOBAL_PLAYLISTS_IS_LOAD:
            return {
                ...state,
                playlistsIsLoad: true
            };
        case GLOBAL_RESET:
            return initialState;
        default:
            return state;
    }
}