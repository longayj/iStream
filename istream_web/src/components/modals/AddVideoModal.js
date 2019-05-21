import React from 'react';
import { connect } from 'react-redux';

import {
    globalDisplayLoadMask,
    globalDismissLoadMask,

    globalDisplayNotificationSnackbar,

    globalDisplayAlertDialog,

    globalDismissAddVideoModal,
    globalAddVideoModalSetVideoTitle,
    globalAddVideoModalSetSuggestions,
    globalAddVideoModalSetSuggestionsPossible,
    globalAddVideoModalSetCurrentVideo,
    globalAddVideoModalSetVideoUrl,

    globalReset
} from "../../redux/actions/globalActions";

import {
    homeAddVideo
} from "../../redux/actions/homeActions";

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

import AutoCompleteField from "../AutoCompleteField";
import {withRouter} from "react-router-dom";

class AddVideoModal extends React.Component {

    handleClose() {
        this.props.globalDismissAddVideoModal();
    };

    handleAdd() {
        if (!Validator.videoTitle(this.props.addVideoModalVideoTitle) ||
            !Validator.url(this.props.addVideoModalVideoUrl)) {

            this.props.globalDisplayAlertDialog({
                title: Texts.ERROR[this.props.profile.languageString],
                text: Texts.PLEASE_FILL_ALL_THE_FIELDS_CORRECTLY[this.props.profile.languageString]
            });

            return;
        }

        if (this.props.addVideoModalCurrentVideoTitle === "" ||
            this.props.addVideoModalCurrentVideoProductionYear === -1 ||
            this.props.addVideoModalCurrentVideoDirectors === "") {

            this.props.globalDisplayAlertDialog({
                title: Texts.ERROR[this.props.profile.languageString],
                text: "Erreur api allo cine"
            });

            return;
        }

        this.addVideo();
    }

    addVideo() {
        let params = {};

        params[Fields.TITLE] = this.props.addVideoModalCurrentVideoTitle;
        params[Fields.URL] = this.props.addVideoModalVideoUrl;
        params[Fields.CODE] = this.props.addVideoModalCurrentVideoCode;

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.POST, Paths.HOST + Paths.VIDEOS, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    me.props.homeAddVideo(
                        new Video(response.data,
                            me.props.profile.preferredStreamLanguage,
                            me.props.profile.preferredStreamQuality,
                            me.props.profile.id)
                    );

                    me.props.globalDisplayNotificationSnackbar(Texts.VIDEO_ADDED[me.props.profile.languageString]);

                    me.props.globalDismissAddVideoModal();

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

    getSuggestions(value) {
        let params = {};

        params[Fields.Q] = value;

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        me.props.globalAddVideoModalSetSuggestionsPossible(false);
        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.SEARCH, params);
        communication.sendRequest(
            function (response) {

                me.props.globalAddVideoModalSetSuggestionsPossible(true);

                if (response.status === 200) {

                    me.props.globalAddVideoModalSetSuggestions(response.data);

                } else {

                    me.props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[me.props.profile.languageString],
                        text: Status[response.status][me.props.profile.languageString]
                    });

                }
            },
            function (error) {

                me.props.globalAddVideoModalSetSuggestionsPossible(true);

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
            }
        );
    }

    handleTitleChange(value) {
        this.props.globalAddVideoModalSetVideoTitle(value);
        if (value !== null && value !== "" && value.length > 0) {

            let result = {
                title: "",
                productionYear: -1,
                castingShort: {},
                poster: ""
            };
            this.props.addVideoModalSuggestions.forEach(function (item) {
                if (item.label === value) {
                    result = item;
                    return false;
                }
                return true;
            });

            this.props.globalAddVideoModalSetCurrentVideo({
                code: result.code,
                title: result.title,
                productionYear: result.productionYear,
                directors: result.castingShort.directors,
                actors: result.castingShort.actors,
                poster: (result.poster === undefined ? "" : result.poster.href)
            });
        }
    }

    handleTitleTextWritten(event) {
        let value = event.target.value;
        if (this.props.addVideoModalSuggestionsPossible === true &&
            value !== null && value !== "" && value.length > 1) {

            this.getSuggestions(value);
        }
    }


    handleUrlChange(event) {
        this.props.globalAddVideoModalSetVideoUrl(event.target.value);
    }

    render() {
        return (
            <div>

                <Dialog
                    open={this.props.showAddVideoModal}
                    disableBackdropClick={true}
                    maxWidth={"sm"}
                    fullWidth={true}
                    onClose={this.handleClose.bind(this)}
                >
                    <DialogTitle>
                        {
                            Texts.ADD_A_VIDEO[this.props.profile.languageString]
                        }
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            onChange={this.handleUrlChange.bind(this)}
                            value={this.props.addVideoModalVideoUrl}
                            autoFocus
                            margin="dense"
                            label={Texts.URL[this.props.profile.languageString]}
                            type="text"
                            fullWidth
                            required
                            error={this.props.addVideoModalVideoUrlError}
                        />
                        <AutoCompleteField
                            onChange={this.handleTitleChange.bind(this)}
                            value={this.props.addVideoModalVideoTitle}
                            label={Texts.TYPE_MOVIE_OR_SERIE_TITLE[this.props.profile.languageString]}
                            error={this.props.addVideoModalVideoTitleError}
                            suggestions={this.props.addVideoModalSuggestions}
                            inputOnChange={this.handleTitleTextWritten.bind(this)}
                            filterSuggestions={false}
                            required
                        >
                            <Grid container spacing={24}>
                                <Grid item xs={6}>

                                    <br />
                                    {
                                        this.props.addVideoModalCurrentVideoTitle !== "" &&

                                        <DialogContentText>
                                            <FormLabel style={{fontWeight: "bold"}}>{Texts.TITLE[this.props.profile.languageString] + " : "}</FormLabel>
                                            {this.props.addVideoModalCurrentVideoTitle}
                                        </DialogContentText>
                                    }
                                    {
                                        this.props.addVideoModalCurrentVideoProductionYear !== -1 &&

                                        <DialogContentText>
                                            <FormLabel style={{fontWeight: "bold"}}>{Texts.YEAR[this.props.profile.languageString] + " : "}</FormLabel>
                                            {this.props.addVideoModalCurrentVideoProductionYear}
                                        </DialogContentText>
                                    }
                                    {
                                        this.props.addVideoModalCurrentVideoDirectors !== "" &&

                                        <DialogContentText>
                                            <FormLabel style={{fontWeight: "bold"}}>{Texts.DIRECTORS[this.props.profile.languageString] + " : "}</FormLabel>
                                            {this.props.addVideoModalCurrentVideoDirectors}
                                        </DialogContentText>
                                    }
                                    {
                                        this.props.addVideoModalCurrentVideoActors !== "" &&

                                        <DialogContentText>
                                            <FormLabel style={{fontWeight: "bold"}}>{Texts.ACTORS[this.props.profile.languageString] + " : "}</FormLabel>
                                            {this.props.addVideoModalCurrentVideoActors}
                                        </DialogContentText>
                                    }

                                </Grid>
                                <Grid item xs={6}>

                                    {
                                        this.props.addVideoModalCurrentVideoPoster !== "" &&

                                        <img
                                            alt={this.props.addVideoModalCurrentVideoTitle}
                                            src={this.props.addVideoModalCurrentVideoPoster}
                                            style={{margin: 10, textAlign: "right"}}
                                            width={140}
                                            height={200}
                                        />
                                    }

                                </Grid>
                            </Grid>
                        </AutoCompleteField>
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
        showAddVideoModal: state.global.showAddVideoModal,
        addVideoModalVideoTitle: state.global.addVideoModalVideoTitle,
        addVideoModalVideoTitleError: state.global.addVideoModalVideoTitleError,
        addVideoModalSuggestions: state.global.addVideoModalSuggestions,
        addVideoModalSuggestionsPossible: state.global.addVideoModalSuggestionsPossible,
        addVideoModalVideoUrl: state.global.addVideoModalVideoUrl,
        addVideoModalVideoUrlError: state.global.addVideoModalVideoUrlError,

        addVideoModalCurrentVideoCode: state.global.addVideoModalCurrentVideoCode,
        addVideoModalCurrentVideoTitle: state.global.addVideoModalCurrentVideoTitle,
        addVideoModalCurrentVideoProductionYear: state.global.addVideoModalCurrentVideoProductionYear,
        addVideoModalCurrentVideoDirectors: state.global.addVideoModalCurrentVideoDirectors,
        addVideoModalCurrentVideoActors: state.global.addVideoModalCurrentVideoActors,
        addVideoModalCurrentVideoPoster: state.global.addVideoModalCurrentVideoPoster,

        profile: state.global.profile
    };
}

export default withRouter(connect(mapStateToProps, {
    //GLOBAL
    globalDisplayLoadMask,
    globalDismissLoadMask,

    globalDisplayNotificationSnackbar,

    globalDisplayAlertDialog,

    globalDismissAddVideoModal,
    globalAddVideoModalSetVideoTitle,
    globalAddVideoModalSetSuggestions,
    globalAddVideoModalSetSuggestionsPossible,
    globalAddVideoModalSetCurrentVideo,
    globalAddVideoModalSetVideoUrl,

    globalReset,

    //HOME
    homeAddVideo
})(AddVideoModal));