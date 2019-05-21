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
import PrevIcon from '@material-ui/icons/SkipPrevious';
import NextIcon from '@material-ui/icons/SkipNext';

import Playlist from "../../models/Playlist";

import {
    globalMyVideosIsLoad,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAlertDialog,
    globalPlaylistsIsLoad,
    globalDisplayNotificationSnackbar,
    globalDisplayConfirmDialog,

    globalReset,

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
import {withRouter} from "react-router-dom";


class Playlists extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            playlist_id: -1,
            playlist_name: "",
            playlist_shared: false,
            playlist_name_error: false,
            playlist_videos: [],

            playlist_page: 1,
            playlist_per_page: 10,
            playlist_total_page: 1,

            video_page: 1,
            video_per_page: 10,
            video_total_page: 1
        };
    }

    componentDidMount() {
        /*if (this.props.playlistsIsLoad === false) {
            this.getMyPlaylists();
        }*/
        this.getMyPlaylists(this.state.playlist_page);
    }

    getMyPlaylists(page) {
        let params = {};

        let me = this;

        params[Fields.PAGE] = page;
        params[Fields.PER_PAGE] = this.state.playlist_per_page;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

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

                    me.setState({
                        playlist_total_page: response.data.total_page
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

    getVideos(page, id) {
        let params = {};

        let me = this;

        params[Fields.PER_PAGE] = this.state.video_per_page;
        params[Fields.PAGE] = page;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

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
                        playlist_videos: videos,
                        video_total_page: 1 //TODO WTF ALEXIS response.data.total_page
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
        params[Fields.SHARED] = this.state.playlist_shared ? 1 : 0;

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

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

    deleteVideoFromPlaylist(props) {
        let params = {};

        if (!CommunicationApi.checkToken()) {
            props.history.push('/auth');
            props.globalReset();
        }

        props.globalDisplayLoadMask();
        let communication = new CommunicationApi(
            HttpMethods.DELETE, Paths.HOST + Paths.USER + "/" + props.profile.id +
            Paths.PLAYLISTS + "/" + props.playlist_id + Paths.VIDEOS + "/" + props.video.id, params);
        communication.sendRequest(
            function (response) {

                props.globalDismissLoadMask();

                if (response.status === 200) {

                    let videos = props.playlist_videos;
                    let index = videos.findIndex(function (item) {
                        return item.id === props.video.id;
                    });
                    videos.splice(index, 1);
                    props.me.setState({
                        playlist_videos: videos
                    });

                    props.globalDisplayNotificationSnackbar(Texts.VIDEO_REMOVED_FROM_THE_PLAYLIST[props.profile.languageString]);

                } else {

                    props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[props.profile.languageString],
                        text: Status[response.status][props.profile.languageString]
                    });

                }
            },
            function (error) {

                console.log(error);

                props.globalDismissLoadMask();

                if (error.response === undefined || error.response.status === undefined || !(error.response.status in Status)) {

                    props.globalDisplayAlertDialog({
                        title: Texts.NETWORK_ERROR[props.profile.languageString],
                        text: Texts.A_NETWORK_ERROR_OCCURED[props.profile.languageString]
                    });

                } else {

                    props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[props.profile.languageString],
                        text: Status[error.response.status][props.profile.languageString]
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

        this.getVideos(this.state.video_page, item.id);
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

    handlePrevPagePlaylistClick() {
        let new_page = this.state.playlist_page - 1;
        this.setState({
            playlist_page: new_page
        });
        this.getMyPlaylists(new_page, this.state.search_text);
    }

    handleNextPagePlaylistClick() {
        let new_page = this.state.playlist_page + 1;
        this.setState({
            playlist_page: new_page
        });
        this.getMyPlaylists(new_page, this.state.search_text);
    }

    handlePrevPageVideoClick() {
        let new_page = this.state.video_page - 1;
        this.setState({
            video_page: new_page
        });
        this.getVideos(new_page, this.state.playlist_id);
    }

    handleNextPageVideoClick() {
        let new_page = this.state.video_page + 1;
        this.setState({
            video_page: new_page
        });
        this.getVideos(new_page, this.state.playlist_id);
    }

    handleDeleteVideoClick(item) {
        this.props.globalDisplayConfirmDialog({
            title: Texts.REMOVE_A_VIDEO_FROM_THIS_PLAYLIST[this.props.profile.languageString],
            text: Texts.DO_REALLY_WANT_TO_REMOVE_THIS_VIDEO_FROM_THIS_PLAYLIST[this.props.profile.languageString],
            target: item.title +
            (" ( " + item.productionYear + ", " +
                item.castingShort.directors + " ) "),
            callback: this.deleteVideoFromPlaylist,
            props: {
                globalDisplayLoadMask: this.props.globalDisplayLoadMask,
                video: item,
                globalDismissLoadMask: this.props.globalDismissLoadMask,
                globalDisplayAlertDialog: this.props.globalDisplayAlertDialog,
                profile: this.props.profile,
                history: this.props.history,
                globalReset: this.props.globalReset,
                playlist_id: this.state.playlist_id,
                globalDisplayNotificationSnackbar: this.props.globalDisplayNotificationSnackbar,
                playlist_videos: this.state.playlist_videos,
                me: this
            }
        });
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
                        color={"primary"}
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
                                                    onClick={this.handleDeletePlaylistClick.bind(this)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))
                                }
                            </List>
                            {
                                this.props.playlistsIsLoad == true &&

                                <Grid container justify="center">
                                    {
                                        this.state.playlist_page > 1 &&

                                        <Button
                                            color={"primary"}
                                            variant={"contained"}
                                            onClick={this.handlePrevPagePlaylistClick.bind(this)}
                                        >
                                            <PrevIcon />&nbsp;
                                        </Button>
                                    }
                                    &nbsp;
                                    <Typography style={{textAlign: "center"}} variant="h6">
                                        {Texts.PAGE[this.props.profile.languageString] + " " + this.state.playlist_page + " / " + this.state.playlist_total_page}
                                    </Typography>
                                    &nbsp;
                                    {
                                        this.state.playlist_page < this.state.playlist_total_page &&

                                        <Button
                                            color={"primary"}
                                            variant={"contained"}
                                            onClick={this.handleNextPagePlaylistClick.bind(this)}
                                        >
                                            <NextIcon />&nbsp;
                                        </Button>
                                    }
                                </Grid>
                            }
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
                                                        <ListItemText primary={item.title + ", " + item.castingShort.directors + " (" + item.productionYear + ")"} />
                                                        <ListItemSecondaryAction>
                                                            <IconButton
                                                                aria-label="Delete"
                                                                onClick={this.handleDeleteVideoClick.bind(this, item)}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                ))
                                            }
                                            {
                                                this.props.playlist_id != -1 &&

                                                <Grid container justify="center">
                                                    {
                                                        this.state.video_page > 1 &&

                                                        <Button
                                                            color={"primary"}
                                                            variant={"contained"}
                                                            onClick={this.handlePrevPageVideoClick.bind(this)}
                                                        >
                                                            <PrevIcon />&nbsp;
                                                        </Button>
                                                    }
                                                    &nbsp;
                                                    <Typography style={{textAlign: "center"}} variant="h6">
                                                        {Texts.PAGE[this.props.profile.languageString] + " " + this.state.video_page + " / " + this.state.video_total_page}
                                                    </Typography>
                                                    &nbsp;
                                                    {
                                                        this.state.video_page < this.state.video_total_page &&

                                                        <Button
                                                            color={"primary"}
                                                            variant={"contained"}
                                                            onClick={this.handleNextPageVideoClick.bind(this)}
                                                        >
                                                            <NextIcon />&nbsp;
                                                        </Button>
                                                    }
                                                </Grid>
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

export default withRouter(connect(mapStateToProps, {
    globalMyVideosIsLoad,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAlertDialog,
    globalPlaylistsIsLoad,
    globalDisplayCreatePlaylistModal,
    globalDisplayConfirmDialog,
    globalDisplayNotificationSnackbar,

    globalReset,

    playlistsSetPlaylists,
    playlistsUpdatePlaylist
})(Playlists));