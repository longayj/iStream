import React from 'react';
import { connect } from 'react-redux';

import {
    globalDisplayLoadMask,
    globalDismissLoadMask,

    globalDisplayNotificationSnackbar,

    globalDisplayAlertDialog,

    globalDismissAddVideoToPlaylistModal,

    globalReset,
    globalPlaylistsIsLoad
} from "../../redux/actions/globalActions";

import {
    playlistsAddPlaylist,
    playlistsSetPlaylists
} from "../../redux/actions/playlistsActions";

import PlaylistIcon from '@material-ui/icons/PlaylistPlay';
import PrevIcon from '@material-ui/icons/SkipPrevious';
import NextIcon from '@material-ui/icons/SkipNext';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';

import CommunicationApi from "../../utils/CommunicationApi";
import Validator from "../../utils/Validator";

import Video from "../../models/Video";

import HttpMethods from "../../constants/HttpMethods";
import Paths from "../../constants/Paths";
import Fields from "../../constants/Fields";
import Status from "../../constants/Status";
import Texts from "../../constants/Texts";
import {
    Checkbox, FormControlLabel, List, ListItem, ListItemIcon, ListItemText,
    Typography
} from "@material-ui/core/es/index";
import Playlist from "../../models/Playlist";
import {withRouter} from "react-router-dom";

class AddVideoToPlaylistModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            checked_playlist: -1,

            page: 1,
            per_page: 10,
            total_page: 1
        };
    }

    componentDidMount() {
        /*if (this.props.playlistsIsLoad === false) {
            this.getMyPlaylists();
        }*/
        this.getMyPlaylists(this.state.page);
    }

    getMyPlaylists(page) {
        let params = {};

        params[Fields.PER_PAGE] = this.state.per_page;
        params[Fields.PAGE] = page;

        let me = this;

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
                        total_page: response.data.total_page
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

    handleClose() {
        this.setState({
            checked_playlist: -1
        });
        this.props.globalDismissAddVideoToPlaylistModal();
    };

    handleAdd() {
        if (this.state.checked_playlist != -1) {
            this.addVideoToPlaylist();
        }
    }

    addVideoToPlaylist() {
        let params = {};

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(
            HttpMethods.POST, Paths.HOST + Paths.USER + "/" + this.props.profile.id +
            Paths.PLAYLISTS + "/" + this.state.checked_playlist + Paths.VIDEOS + "/" + this.props.addVideoToPlaylistModalVideoId, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    me.props.globalDisplayNotificationSnackbar(Texts.VIDEO_ADDED_TO_PLAYLIST[me.props.profile.languageString]);

                    me.setState({
                        checked_playlist: -1
                    });

                    me.props.globalDismissAddVideoToPlaylistModal();

                } else {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[me.props.profile.languageString],
                        text: Status[response.status][me.props.profile.languageString]
                    });

                }
            },
            function (error) {

                me.props.globalDismissLoadMask();

                console.log(error);

                if (error.response != undefined &&
                    error.response.data != undefined &&
                    error.response.data.message != undefined &&
                    error.response.data.message != null &&
                    error.response.data.message != "") {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.ERROR[me.props.profile.languageString],
                        text: error.response.data.message
                    });

                } else if (error.response === undefined || error.response.status === undefined || !(error.response.status in Status)) {

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

    handlePlaylistClick(item) {
        this.setState({
            checked_playlist: item.id
        })
    }

    handlePrevPageClick() {
        let new_page = this.state.page - 1;
        this.setState({
            page: new_page,
            checked_playlist: -1
        });
        this.getMyPlaylists(new_page);
    }

    handleNextPageClick() {
        let new_page = this.state.page + 1;
        this.setState({
            page: new_page,
            checked_playlist: -1
        });
        this.getMyPlaylists(new_page);
    }

    render() {
        return (
            <div>

                <Dialog
                    open={this.props.showAddVideoToPlaylistModal}
                    disableBackdropClick={true}
                    maxWidth={"sm"}
                    fullWidth={true}
                    onClose={this.handleClose.bind(this)}
                >
                    <DialogTitle>
                        {
                            Texts.ADD_A_VIDEO_TO_A_PLAYLIST[this.props.profile.languageString]
                        }
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {Texts.SELECT_A_PLAYLIST_TO_ADD_THIS_VIDEO_TO[this.props.profile.languageString] + " : "}
                            <br/>
                            <br/>
                            {this.props.addVideoToPlaylistModalVideoTitle}
                            <br/>
                            <br/>
                        </DialogContentText>
                        <List component="nav">
                            {
                                this.props.playlists.map((item) => (

                                    <ListItem
                                        button
                                        onClick={this.handlePlaylistClick.bind(this, item)}
                                        key={item.id}
                                    >
                                        <ListItemIcon>
                                            <PlaylistIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={item.name} />
                                        <Checkbox
                                            checked={this.state.checked_playlist === item.id}
                                            disableRipple
                                        />
                                    </ListItem>
                                ))
                            }
                            {
                                this.props.playlistsIsLoad == true &&

                                <Grid container justify="center">
                                    {
                                        this.state.page > 1 &&

                                        <Button
                                            color={"primary"}
                                            variant={"contained"}
                                            onClick={this.handlePrevPageClick.bind(this)}
                                        >
                                            <PrevIcon />&nbsp;
                                            {Texts.PREVIOUS_PAGE[this.props.profile.languageString]}
                                        </Button>
                                    }
                                    &nbsp;
                                    <Typography style={{textAlign: "center"}} variant="h6">
                                        {Texts.PAGE[this.props.profile.languageString] + " " + this.state.page + " / " + this.state.total_page}
                                    </Typography>
                                    &nbsp;
                                    {
                                        this.state.page < this.state.total_page &&

                                        <Button
                                            color={"primary"}
                                            variant={"contained"}
                                            onClick={this.handleNextPageClick.bind(this)}
                                        >
                                            <NextIcon />&nbsp;
                                            {Texts.NEXT_PAGE[this.props.profile.languageString]}
                                        </Button>
                                    }
                                </Grid>
                            }
                        </List>
                    </DialogContent>
                    <DialogActions>

                        <Button onClick={this.handleClose.bind(this)} color="secondary" variant={"contained"}>
                            {Texts.CANCEL[this.props.profile.languageString]}
                        </Button>

                        <Button onClick={this.handleAdd.bind(this)} color="primary" variant={"contained"} autoFocus >
                            {Texts.ADD[this.props.profile.languageString]}
                        </Button>

                    </DialogActions>
                </Dialog>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        showAddVideoToPlaylistModal: state.global.showAddVideoToPlaylistModal,
        addVideoToPlaylistModalVideoTitle: state.global.addVideoToPlaylistModalVideoTitle,
        addVideoToPlaylistModalVideoId: state.global.addVideoToPlaylistModalVideoId,

        profile: state.global.profile,
        playlistsIsLoad: state.global.playlistsIsLoad,

        playlists: state.playlists.playlists
    };
}

export default withRouter(connect(mapStateToProps, {
    //GLOBAL
    globalDisplayLoadMask,
    globalDismissLoadMask,

    globalDisplayNotificationSnackbar,

    globalDisplayAlertDialog,

    globalDismissAddVideoToPlaylistModal,

    globalReset,
    globalPlaylistsIsLoad,

    //PLAYLISTS

    playlistsAddPlaylist,
    playlistsSetPlaylists
})(AddVideoToPlaylistModal));