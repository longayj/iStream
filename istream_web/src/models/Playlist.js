
const defaultState = {
    id: -1,
    name: "",
    shared: false,
    videos_id: []
};

class Playlist {

    constructor(state = defaultState) {

        this.set(state);
    }

    set(state = defaultState) {

        this.id = (
            (state.id === undefined || state.id === null) ?
                defaultState.id
                :
                state.id
        );

        this.name = (
            (state.name === undefined || state.name === null) ?
                defaultState.name
                :
                state.name
        );

        this.shared = (
            (state.shared === undefined || state.shared === null) ?
                defaultState.shared
                :
                state.shared
        );

        if (Number.isInteger(this.shared)) {
            this.shared = (this.shared === 1);
        }

        this.videos_id = (
            (state.videos_id === undefined || state.videos_id === null) ?
                defaultState.videos_id
                :
                state.videos_id
        );
    }

    toString() {
        return (`Playlist [ 
            id = ${this.id},  
            name = ${this.name} ]`
        );
    }

}

export default Playlist;