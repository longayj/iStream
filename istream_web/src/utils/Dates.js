class Dates {
    static format(timestamp) {
        if (timestamp === undefined || timestamp === null || timestamp === "") {
            return "oo/oo/oo";
        }
        let today = new Date(timestamp);
        let dd = today.getDate();
        let mm = today.getMonth() + 1;
        let yyyy = today.getFullYear();
        let hh = today.getHours();
        let mn = today.getMinutes();
        let ss = today.getSeconds();
        return (dd > 9 ? dd : ('0' + dd)) + "/" +
            (mm > 9 ? mm : ('0' + mm)) + "/" +
            yyyy + " " +
            (hh > 9 ? hh : ('0' + hh)) + ":" +
            (mn > 9 ? mn : ('0' + mn)) + ":" +
            (ss > 9 ? ss : ('0' + ss));
    }

    static formatDateOnly(timestamp) {
        if (timestamp === undefined || timestamp === null || timestamp === "") {
            return "oo/oo/oo";
        }
        let today = new Date(timestamp);
        let dd = today.getDate();
        let mm = today.getMonth() + 1;
        let yyyy = today.getFullYear();
        return (dd > 9 ? dd : ('0' + dd)) + "/" +
            (mm > 9 ? mm : ('0' + mm)) + "/" +
            yyyy;
    }

    static formatYYYYmmDD(timestamp) {
        if (timestamp === undefined || timestamp === null || timestamp === "") {
            return "oo/oo/oo";
        }
        let today = new Date(timestamp);
        let dd = today.getDate();
        let mm = today.getMonth() + 1;
        let yyyy = today.getFullYear();
        return yyyy + "-" + (mm > 9 ? mm : ('0' + mm)) + "-" + (dd > 9 ? dd : ('0' + dd));
    }

    static formatMinutesDuration(duration) {
        let hours = parseInt(duration / 3600, 10);
        let minutes = parseInt(duration / 60 % 60, 10);
        let secondes = parseInt(duration % 60, 10);

        return (hours === 0 ? "" : (hours + " h ")) +
            (minutes === 0 ? "" : ((minutes < 10 ? minutes : minutes) + " min ")) +
            (secondes === 0 ? "" : ((secondes < 10 ? secondes : secondes) + " sec "));
    }
}

export default Dates;