class Validator {

    static username(text) {
        return text.length > 0;
    }

    static email(text) {
        /* Trouver mieux ! */
        let regex = new RegExp('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$');
        return regex.test(text);
    }

    static password(text) {
        let regex = new RegExp('^(?=.*\\d)(?=.*[!@#\\$%_\\-\\(\\)\\{\\}\\[\\];,/&\\*\\+\\?\\.:])(?=.*[a-z])(?=.*[A-Z]).{8,}$','g');
        return regex.test(text);
    }

    static videoTitle(text) {
        return text.length > 0;
    }

    static url(text) {
        return text.length > 5;
    }

    static name(text) {
        return text != null && text != "" && text.length > 0;
    }
}

export default Validator;