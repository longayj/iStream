import React from 'react';
import { connect } from 'react-redux';

import Texts from "../../constants/Texts"
import CommunicationApi from "../../utils/CommunicationApi";
import HttpMethods from "../../constants/HttpMethods";
import Paths from "../../constants/Paths";
import Status from "../../constants/Status";

import AddIcon from '@material-ui/icons/PlaylistAdd';
import AddToQueueIcon from '@material-ui/icons/AddToQueue';
import VideoIcon from '@material-ui/icons/PlayArrow';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import PlaylistIcon from '@material-ui/icons/PlaylistPlay';

import Playlist from "../../models/Playlist";

import {
    globalMyVideosIsLoad,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAlertDialog,
    globalPlaylistsIsLoad,

    globalDisplayCreatePlaylistModal
} from "../../redux/actions/globalActions";

import {
    playlistsSetPlaylists,
    playlistsUpdatePlaylist
} from "../../redux/actions/playlistsActions";
import Toolbar from "@material-ui/core/es/Toolbar/Toolbar";
import Button from "@material-ui/core/es/Button/Button";
import Grid from "@material-ui/core/es/Grid/Grid";
import List from "@material-ui/core/es/List/List";
import {
    Checkbox,
    FormControlLabel, IconButton, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, TextField, Tooltip,
    Typography
} from "@material-ui/core/es/index";
import Validator from "../../utils/Validator";
import Fields from "../../constants/Fields";
import Video from "../../models/Video";


class Playlists extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            playlist_id: -1,
            playlist_name: "",
            playlist_shared: false,
            playlist_name_error: false,
            playlist_videos: []
        };
    }

    getVideos(id) {
        let params = {};

        let me = this;

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.USER + "/" + this.props.profile.id + Paths.PLAYLISTS + "/" + id + Paths.VIDEOS, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    let videos = [];

                    response.data.videos.forEach(function (item) {
                        videos.push(new Video(item,
                            me.props.profile.preferredStreamLanguage,
                            me.props.profile.preferredStreamQuality));
                    });

                    me.setState({
                        playlist_videos: videos
                    });

                } else {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[me.props.profile.languageString],
                        text: Status[response.status][me.props.profile.languageString]
                    });

                }
            },
            function (error) {

                me.props.globalDismissLoadMask();

                if (error.response === undefined || error.response.status === undefined || !(error.response.status in Status)) {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.NETWORK_ERROR[me.props.profile.languageString],
                        text: Texts.A_NETWORK_ERROR_OCCURED[me.props.profile.languageString]
                    });

                } else {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[me.props.profile.languageString],
                        text: Status[error.response.status][me.props.profile.languageString]
                    });

                }
            },
            true
        );
    }

    updatePlaylist() {
        let params = {};

        params[Fields.NAME] = this.state.playlist_name;
        params[Fields.SHARED] = this.state.playlist_shared;

        let me = this;

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.PUT, Paths.HOST + Paths.USER + "/" + this.props.profile.id + Paths.PLAYLISTS + "/" + this.state.playlist_id, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    me.props.playlistsUpdatePlaylist({
                        id: me.state.playlist_id,
                        name: me.state.playlist_name,
                        shared: me.state.playlist_shared
                    });

                    me.props.globalDisplayNotificationSnackbar(Texts.PLAYLIST_UPDATED[me.props.profile.languageString]);

                } else {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[me.props.profile.languageString],
                        text: Status[response.status][me.props.profile.languageString]
                    });

                }
            },
            function (error) {

                me.props.globalDismissLoadMask();

                if (error.response === undefined || error.response.status === undefined || !(error.response.status in Status)) {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.NETWORK_ERROR[me.props.profile.languageString],
                        text: Texts.A_NETWORK_ERROR_OCCURED[me.props.profile.languageString]
                    });

                } else {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[me.props.profile.languageString],
                        text: Status[error.response.status][me.props.profile.languageString]
                    });

                }
            },
            true
        );
    }

    componentDidMount() {
        if (this.props.playlistsIsLoad === false) {
            this.getMyPlaylists();
        }
    }

    getMyPlaylists() {
        let params = {};

        let me = this;

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.USER + "/" + this.props.profile.id + Paths.PLAYLISTS, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    let playlists = [];

                    response.data.playlists.forEach(function (item) {
                        playlists.push(new Playlist(item));
                    });

                    me.props.playlistsSetPlaylists(playlists);

                    me.props.globalPlaylistsIsLoad();

                } else {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[me.props.profile.languageString],
                        text: Status[response.status][me.props.profile.languageString]
                    });

                }
            },
            function (error) {
                console.log(error);

                me.props.globalDismissLoadMask();

                if (error.response === undefined || error.response.status === undefined || !(error.response.status in Status)) {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.NETWORK_ERROR[me.props.profile.languageString],
                        text: Texts.A_NETWORK_ERROR_OCCURED[me.props.profile.languageString]
                    });

                } else {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[me.props.profile.languageString],
                        text: Status[error.response.status][me.props.profile.languageString]
                    });

                }
            },
            true
        );
    }

    handleAddPlaylistClick() {
        this.props.globalDisplayCreatePlaylistModal();
    }

    handlePlaylistClick(item) {
        let error = true;

        if (Validator.name(item.name)) {
            error = false;
        }

        this.setState({
            playlist_id: item.id,
            playlist_name: item.name,
            playlist_shared: item.shared,
            playlist_name_error: error
        });

        this.getVideos(item.id);
    }

    handleNameChange(event) {
        let error = true;

        if (Validator.name(event.target.value)) {
            error = false;
        }

        this.setState({
            playlist_name: event.target.value,
            playlist_name_error: error
        });
    }

    handleSharedChange(event) {
        this.setState({
            playlist_shared: event.target.checked
        })
    }

    handleDeletePlaylistClick() {

    }

    handleDeleteVideoClick() {

    }

    handleAddVideoClick() {

    }

    handlePlayClick() {

    }

    handleSaveClick() {
        if (this.state.playlist_name_error) {

            this.props.globalDisplayAlertDialog({
                title: Texts.ERROR[this.props.profile.languageString],
                text: Texts.PLEASE_FILL_ALL_THE_FIELDS_CORRECTLY[this.props.profile.languageString]
            });

            return;
        }

        this.updatePlaylist();
    }

    render() {
        return (
            <div>

                <Toolbar>
                    <Button
                        variant={"contained"}
                        onClick={this.handleAddPlaylistClick.bind(this)}
                    >
                        <AddIcon />&nbsp;
                        {Texts.CREATE_PLAYLIST[this.props.profile.languageString]}
                    </Button>
                </Toolbar>

                <br/>

                <div>
                    <Grid container spacing={24}>
                        <Grid item md={4} lg={4} style={{borderRight: "groove", borderBottom: "groove"}}>
                            <List component="nav">
                                {
                                    this.props.playlists.map((item) => (

                                        <ListItem
                                            button
                                            onClick={this.handlePlaylistClick.bind(this, item)}
                                            selected={this.state.playlist_id == item.id}
                                            key={item.id}
                                        >
                                            <ListItemIcon>
                                                <PlaylistIcon />
                                            </ListItemIcon>
                                            <ListItemText primary={item.name} />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    aria-label="Delete"
                                                    onClick={this.handleDeletePlaylistClick.bind()}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))
                                }
                            </List>
                        </Grid>
                        <Grid item md={8} lg={8}>
                            {
                                this.state.playlist_id !== -1 &&

                                    <div>
                                        <Typography
                                            variant={"h4"}
                                        >
                                            {Texts.PLAYLIST[this.props.profile.languageString] + " \"" + this.state.playlist_name + "\""}
                                        </Typography>

                                        <TextField
                                            onChange={this.handleNameChange.bind(this)}
                                            value={this.state.playlist_name}
                                            margin="dense"
                                            label={Texts.NAME[this.state.languageString]}
                                            type="text"
                                            fullWidth
                                            required
                                            error={this.state.playlist_name_error}
                                        />

                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={this.state.playlist_shared}
                                                    onChange={this.handleSharedChange.bind(this)}
                                                />
                                            }
                                            label={
                                                Texts.SHARE[this.props.profile.languageString]
                                            }
                                        />

                                        <Button
                                            onClick={this.handleAddVideoClick.bind(this)}
                                            variant={"contained"}
                                            color={"secondary"}
                                        >
                                            <AddToQueueIcon/>&nbsp;
                                            {Texts.ADD_A_VIDEO[this.props.profile.languageString]}
                                        </Button>

                                        &nbsp;

                                        <Button
                                            onClick={this.handleSaveClick.bind(this)}
                                            variant={"contained"}
                                            color={"primary"}
                                        >
                                            <SaveIcon/>&nbsp;
                                            {Texts.SAVE[this.props.profile.languageString]}
                                        </Button>

                                        &nbsp;

                                        <Button
                                            onClick={this.handlePlayClick.bind(this)}
                                            variant={"contained"}
                                            color={"secondary"}
                                        >
                                            <VideoIcon/>&nbsp;
                                            {Texts.PLAY[this.props.profile.languageString]}
                                        </Button>

                                        <br/>
                                        <br/>

                                        <Typography
                                            variant={"h6"}
                                        >
                                            {Texts.VIDEOS[this.props.profile.languageString] + " " + Texts.OF[this.props.profile.languageString] + " \"" + this.state.playlist_name + "\""}
                                        </Typography>

                                        <List>
                                            {
                                                this.state.playlist_videos.map((item) => (
                                                    <ListItem button key={item.id}>
                                                        <ListItemIcon>
                                                            <VideoIcon />
                                                        </ListItemIcon>
                                                        <ListItemText primary={item.title + ", " + item.castingShort.directors + " (" + item.releaseDate + ")"} />
                                                        <ListItemSecondaryAction>
                                                            <IconButton
                                                                aria-label="Delete"
                                                                onClick={this.handleDeleteVideoClick.bind()}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                ))
                                            }
                                        </List>

                                    </div>
                            }
                        </Grid>
                    </Grid>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.global.profile,

        playlistsIsLoad: state.global.playlistsIsLoad,

        playlists: state.playlists.playlists
    };
}

export default connect(mapStateToProps, {
    globalMyVideosIsLoad,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAlertDialog,
    globalPlaylistsIsLoad,
    globalDisplayCreatePlaylistModal,

    playlistsSetPlaylists,
    playlistsUpdatePlaylist
})(Playlists);