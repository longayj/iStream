import {

    GLOBAL_DISPLAY_LOAD_MASK,
    GLOBAL_DISMISS_LOAD_MASK,

    GLOBAL_DISPLAY_NOTIFICATION_SNACKBAR,
    GLOBAL_DISMISS_NOTIFICATION_SNACKBAR,

    GLOBAL_DISPLAY_ALERT_DIALOG,
    GLOBAL_DISMISS_ALERT_DIALOG,

    GLOBAL_DISPLAY_CONFIRM_DIALOG,
    GLOBAL_DISMISS_CONFIRM_DIALOG,

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

    GLOBAL_FAVORITE_IS_LOAD,
    GLOBAL_HOME_IS_LOAD,

    GLOBAL_RESET

} from "../types"

export const globalDisplayLoadMask = () => {
    return {
        type: GLOBAL_DISPLAY_LOAD_MASK
    };
};

export const globalDismissLoadMask = () => {
    return {
        type: GLOBAL_DISMISS_LOAD_MASK
    };
};

export const globalDisplayNotificationSnackbar = (snackbar_info) => {
    return {
        type: GLOBAL_DISPLAY_NOTIFICATION_SNACKBAR,
        payload: snackbar_info
    };
};

export const globalDismissNotificationSnackbar = () => {
    return {
        type: GLOBAL_DISMISS_NOTIFICATION_SNACKBAR
    };
};


export const globalDisplayAlertDialog = (alertInfo) => {
    return {
        type: GLOBAL_DISPLAY_ALERT_DIALOG,
        payload: alertInfo
    };
};

export const globalDismissAlertDialog = () => {
    return {
        type: GLOBAL_DISMISS_ALERT_DIALOG
    };
};

export const globalDisplayConfirmDialog = (confirmInfo) => {
    return {
        type: GLOBAL_DISPLAY_CONFIRM_DIALOG,
        payload: confirmInfo
    };
};

export const globalDismissConfirmDialog = () => {
    return {
        type: GLOBAL_DISMISS_CONFIRM_DIALOG
    };
};

export const globalDisplayAddVideoModal = (modalInfo) => {
    return {
        type: GLOBAL_DISPLAY_ADD_VIDEO_MODAL,
        payload: modalInfo
    };
};

export const globalDismissAddVideoModal = () => {
    return {
        type: GLOBAL_DISMISS_ADD_VIDEO_MODAL
    };
};

export const globalAddVideoModalSetVideoTitle = (value) => {
    return {
        type: GLOBAL_ADD_VIDEO_MODAL_SET_VIDEO_TITLE,
        payload: value
    };
};

export const globalAddVideoModalSetSuggestions = (suggestions) => {
    return {
        type: GLOBAL_ADD_VIDEO_MODAL_SET_SUGGESTIONS,
        payload: suggestions
    };
};

export const globalAddVideoModalSetSuggestionsPossible = (possible) => {
    return {
        type: GLOBAL_ADD_VIDEO_MODAL_SET_SUGGESTIONS_POSSIBLE,
        payload: possible
    };
};

export const globalAddVideoModalSetCurrentVideo = (video_infos) => {
    return {
        type: GLOBAL_ADD_VIDEO_MODAL_SET_CURRENT_VIDEO,
        payload: video_infos
    };
};

export const globalAddVideoModalSetVideoUrl = (value) => {
    return {
        type: GLOBAL_ADD_VIDEO_MODAL_SET_VIDEO_URL,
        payload: value
    };
};

export const globalAuthSuccess = (profile) => {
    return {
        type: GLOBAL_AUTH_SUCCESS,
        payload: profile
    };
};

export const globalAuthFailure = () => {
    return {
        type: GLOBAL_AUTH_FAILURE
    };
};

export const globalSettingsSetLanguage = (value) => {
    return {
        type: GLOBAL_SETTINGS_SET_LANGUAGE,
        payload: value
    };
};

export const globalSettingsSetUsername = (value) => {
    return {
        type: GLOBAL_SETTINGS_SET_USERNAME,
        payload: value
    };
};

export const globalSettingsSetEmail = (value) => {
    return {
        type: GLOBAL_SETTINGS_SET_EMAIL,
        payload: value
    };
};

export const globalSettingsSetDarkMode = (value) => {
    return {
        type: GLOBAL_SETTINGS_SET_DARK_MODE,
        payload: value
    };
};

export const globalSettingsSetPrincipalColor = (value) => {
    return {
        type: GLOBAL_SETTINGS_SET_PRINCIPAL_COLOR,
        payload: value
    };
};

export const globalSettingsSetSecondaryColor = (value) => {
    return {
        type: GLOBAL_SETTINGS_SET_SECONDARY_COLOR,
        payload: value
    };
};

export const globalSettingsSetPreferredStreamLanguage = (value) => {
    return {
        type: GLOBAL_SETTINGS_SET_PREFERRED_STREAM_LANGUAGE,
        payload: value
    };
};

export const globalSettingsSetPreferredStreamQuality = (value) => {
    return {
        type: GLOBAL_SETTINGS_SET_PREFERRED_STREAM_QUALITY,
        payload: value
    };
};

export const globalResetSettingsChanges = () => {
    return {
        type: GLOBAL_RESET_SETTINGS_CHANGES
    };
};

export const globalApplySettingsChanges = () => {
    return {
        type: GLOBAL_APPLY_SETTINGS_CHANGES
    };
};

export const globalSetNavigation = (navigationInfos) => {
    return {
        type: GLOBAL_SET_NAVIGATION,
        payload: navigationInfos
    };
};

export const globalSetMobileDrawerIsOpen = (value) => {
    return {
        type: GLOBAL_SET_MOBILE_DRAWER_IS_OPEN,
        payload: value
    };
};

export const globalHomeIsLoad = () => {
    return {
        type: GLOBAL_HOME_IS_LOAD
    };
};

export const globalFavoriteIsLoad = () => {
    return {
        type: GLOBAL_FAVORITE_IS_LOAD
    };
};

export const globalReset = () => {
    return {
        type: GLOBAL_RESET
    };
};