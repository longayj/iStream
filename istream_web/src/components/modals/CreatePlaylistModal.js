import React from 'react';
import { connect } from 'react-redux';

import {
    globalDisplayLoadMask,
    globalDismissLoadMask,

    globalDisplayNotificationSnackbar,

    globalDisplayAlertDialog,

    globalDismissCreatePlaylistModal,

    globalReset
} from "../../redux/actions/globalActions";

import {
    playlistsAddPlaylist
} from "../../redux/actions/playlistsActions";

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
import {Checkbox, FormControlLabel} from "@material-ui/core/es/index";
import Playlist from "../../models/Playlist";
import {withRouter} from "react-router-dom";

class CreatePlaylistModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: "",
            name_error: false,
            shared: false
        };
    }

    handleClose() {
        this.props.globalDismissCreatePlaylistModal();
    };

    handleAdd() {
        if (this.state.name_error) {

            this.props.globalDisplayAlertDialog({
                title: Texts.ERROR[this.props.profile.languageString],
                text: Texts.PLEASE_FILL_ALL_THE_FIELDS_CORRECTLY[this.props.profile.languageString]
            });

            return;
        }

        this.createPlaylist();
    }

    createPlaylist() {
        let params = {};

        params[Fields.NAME] = this.state.name;
        params[Fields.SHARED] = this.state.shared ? 1 : 0;

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.POST, Paths.HOST + Paths.USER + "/" + this.props.profile.id + Paths.PLAYLISTS, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    me.props.playlistsAddPlaylist(
                        new Playlist(response.data)
                    );

                    me.props.globalDisplayNotificationSnackbar(Texts.PLAYLIST_CREATED[me.props.profile.languageString]);

                    me.props.globalDismissCreatePlaylistModal();

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

    handleNameChange(event) {
        let error = true;

        if (Validator.name(event.target.value)) {
            error = false;
        }

        this.setState({
            name: event.target.value,
            name_error: error
        });
    }

    handleSharedChange(event) {
        this.setState({
            shared: event.target.checked
        });
    }

    render() {
        return (
            <div>

                <Dialog
                    open={this.props.showCreatePlaylistModal}
                    disableBackdropClick={true}
                    maxWidth={"sm"}
                    fullWidth={true}
                    onClose={this.handleClose.bind(this)}
                >
                    <DialogTitle>
                        {
                            Texts.CREATE_PLAYLIST[this.props.profile.languageString]
                        }
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            onChange={this.handleNameChange.bind(this)}
                            value={this.state.name}
                            autoFocus
                            margin="dense"
                            label={Texts.NAME[this.props.profile.languageString]}
                            type="text"
                            fullWidth
                            required
                            error={this.state.name_error}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.shared}
                                    onChange={this.handleSharedChange.bind(this)}
                                />
                            }
                            label={
                                Texts.SHARE[this.props.profile.languageString]
                            }
                        />
                    </DialogContent>
                    <DialogActions>

                        <Button onClick={this.handleClose.bind(this)} color="secondary" variant={"contained"}>
                            {Texts.CANCEL[this.props.profile.languageString]}
                        </Button>

                        <Button onClick={this.handleAdd.bind(this)} color="primary" variant={"contained"} autoFocus >
                            {Texts.CREATE[this.props.profile.languageString]}
                        </Button>

                    </DialogActions>
                </Dialog>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        showCreatePlaylistModal: state.global.showCreatePlaylistModal,

        profile: state.global.profile
    };
}

export default withRouter(connect(mapStateToProps, {
    //GLOBAL
    globalDisplayLoadMask,
    globalDismissLoadMask,

    globalDisplayNotificationSnackbar,

    globalDisplayAlertDialog,

    globalDismissCreatePlaylistModal,

    globalReset,

    //PLAYLISTS

    playlistsAddPlaylist
})(CreatePlaylistModal));