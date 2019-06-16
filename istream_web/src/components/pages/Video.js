import React from 'react';
import { connect } from 'react-redux';

import { withRouter } from 'react-router-dom';

import {
    globalDisplayAlertDialog,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalReset,
    globalDisplayNotificationSnackbar
} from "../../redux/actions/globalActions";

import {
    videoSetVideo,
    videoUnsetVideo,
    videoSetCurrentBestStreamingQuality,
    videoSetCurrentBestStreamingLanguage,
    videoLikeVideo,
    videoAddComment
} from "../../redux/actions/videoActions";

import {
    homeSetVideo
} from "../../redux/actions/homeActions";

import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

import { withStyles } from "@material-ui/core/styles";

import GetAppIcon from "@material-ui/icons/GetApp";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import SendIcon from "@material-ui/icons/Send";
import PrevIcon from "@material-ui/icons/SkipPrevious";
import NextIcon from "@material-ui/icons/SkipNext";
import RefreshIcon from "@material-ui/icons/Refresh";

import VideoPlayer from "../VideoPlayer";

import CommunicationApi from "../../utils/CommunicationApi";

import HttpMethods from "../../constants/HttpMethods";
import Paths from "../../constants/Paths";
import Status from "../../constants/Status";
import Texts from "../../constants/Texts";
import Fields from "../../constants/Fields";

import "../../styles/Video.css"
import Validator from "../../utils/Validator";
import {Grid, Paper, Tooltip} from "@material-ui/core/es/index";
import VideoM from "../../models/Video";
import Dates from "../../utils/Dates";

const styles = theme => ({
    root: {
        flexGrow: 1
    },
    paper: {
        padding: 20,
        textAlign: 'left',
        color: theme.palette.text.secondary,
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    }
});

class Video extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            comment: "",
            comment_error: false,
            video_time: 0
        };
    }

    componentWillMount() {
        if (this.props.video.id === -1) {
            this.props.history.push('/home');
        }
    }

    refreshVideo() {
        let params = {};

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.VIDEOS + "/" + this.props.video.id, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    me.props.homeSetVideo({
                        video: response.data,
                        preferredStreamLanguage: me.props.profile.preferredStreamLanguage,
                        preferredStreamQuality: me.props.profile.preferredStreamQuality
                    });

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

    handlePreviousPageClick() {
        //this.props.videoUnsetVideo();
        this.props.history.push(this.props.originInterfaceRoute);
    }

    handleCurrentStreamQualityChange(event) {
        this.props.videoSetCurrentBestStreamingQuality(event.target.value);
    }

    handleCurrentStreamLanguageChange(event) {
        this.props.videoSetCurrentBestStreamingLanguage(event.target.value);
    }

    handleDownloadClick() {
        //window.open(this.props.video.downloadLink, '_blank');
    }

    handleCommentChange(event) {
        let error = true;

        if (Validator.name(event.target.value)) {
            error = false;
        }

        this.setState({
            comment: event.target.value,
            comment_error: error
        });
    }

    addComment() {
        let params = {};

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        params[Fields.VALUE] = this.state.comment;

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.POST, Paths.HOST + Paths.VIDEOS + "/" + this.props.video.id + Paths.COMMENT, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    me.props.videoAddComment({
                        username: me.props.profile.username,
                        createdAt: new Date(),
                        value: me.state.comment
                    });
                    me.setState({
                        comment: "",
                        comment_error: false
                    });

                    me.props.globalDisplayNotificationSnackbar(Texts.COMMENT_ADDED[me.props.profile.languageString]);

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

    handleSendCommentClick() {
        this.addComment();
    }

    handleLikeClick() {
        let params = {};

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.POST, Paths.HOST + Paths.VIDEOS + "/" + this.props.video.id + Paths.LIKES, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    me.props.videoLikeVideo({
                        id: me.props.video.id,
                        liked: true,
                        like_id: response.data.id
                    });

                    me.props.globalDisplayNotificationSnackbar(Texts.VIDEO_LIKED[me.props.profile.languageString]);

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

    handleDislikeClick() {
        let params = {};

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.DELETE, Paths.HOST + Paths.VIDEOS + "/" + this.props.video.id + Paths.LIKES + "/" + me.props.video.like_id, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    me.props.videoLikeVideo({
                        id: me.props.video.id,
                        liked: false
                    });

                    me.props.globalDisplayNotificationSnackbar(Texts.VIDEO_DISLIKED[me.props.profile.languageString]);

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

    getVideo(id, index) {
        let params = {};

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.VIDEOS + "/" + id, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    me.props.videoSetVideo({
                        video: new VideoM(response.data,
                            me.props.profile.preferredStreamLanguage,
                            me.props.profile.preferredStreamQuality,
                            me.props.profile.id),
                        originInterfaceRoute: me.props.originInterfaceRoute,
                        is_playlist: true,
                        videos: me.props.videos,
                        playlist_name: me.props.playlist_name,
                        playlist_index: index
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

    handleRefreshClick() {
        this.refreshVideo();
    }

    handlePrevVideoClick() {
        let ok = false;
        let videos = this.props.videos.slice().reverse();
        let me = this;

        console.log(this.props.video);

        videos.forEach(function (item, index) {
            if (me.props.video.id == item.id) {
                ok = true;
            } else if (ok == true) {
                me.getVideo(item.id, (videos.lenth - 1 - index));
            }
        });
    }

    handleNextVideoClick() {
        let ok = false;
        let videos = this.props.videos;
        let me = this;

        videos.forEach(function (item, index) {
            if (me.props.video.id == item.id) {
                ok = true;
            } else if (ok == true) {
                me.getVideo(item.id, index);
            }
        });
    }

    render() {

        const me = this;
        let available = {
            languages: [],
            qualities: []
        };

        available = this.props.video.getAvailable();

        const { classes } = this.props;

        return (
            <div>

                <div>
                    <Typography variant="h4" noWrap style={{textAlign: "center"}}>
                        {this.props.video.title}
                    </Typography>

                    {
                        this.props.is_playlist == true &&

                        <Typography variant="h4" noWrap style={{textAlign: "center"}}>
                            {"( " + this.props.playlist_name + " )"}
                        </Typography>
                    }

                    <br />

                    <div style={{textAlign: "center"}}>

                        {
                            false && this.props.profile.isAdmin === true &&


                                <Button onClick={this.handleRefreshClick.bind(this)} color="primary" variant={"contained"}>
                                    <RefreshIcon /> {Texts.REFRESH[me.props.profile.languageString]}
                                </Button>
                        }

                        {
                            this.props.video.liked == false &&

                            <Tooltip
                                title={Texts.LIKE[this.props.profile.languageString]}
                                aria-label={Texts.LIKE[this.props.profile.languageString]}
                            >
                                <Button
                                    onClick={this.handleLikeClick.bind(this)}
                                    color={"secondary"}
                                    variant={"contained"}
                                >
                                    <FavoriteBorderIcon/>&nbsp;
                                    {this.props.video.total_likes}
                                </Button>
                            </Tooltip>
                        }

                        {
                            this.props.video.liked == true &&

                            <Tooltip
                                title={Texts.LIKE[this.props.profile.languageString]}
                                aria-label={Texts.LIKE[this.props.profile.languageString]}
                            >
                                <Button
                                    onClick={this.handleDislikeClick.bind(this)}
                                    color={"secondary"}
                                    variant={"contained"}
                                >
                                    <FavoriteIcon/>&nbsp;
                                    {this.props.video.total_likes}
                                </Button>
                            </Tooltip>
                        }
                    </div>

                    <br />
                    {
                        this.props.is_playlist == true &&

                        <Grid container justify="center">
                            <Button
                                color={"primary"}
                                variant={"contained"}
                                onClick={this.handlePrevVideoClick.bind(this)}
                            >
                                <PrevIcon />&nbsp;
                                {Texts.PREVIOUS_VIDEO[this.props.profile.languageString]}
                            </Button>
                            &nbsp;
                            <Button
                                color={"primary"}
                                variant={"contained"}
                                onClick={this.handleNextVideoClick.bind(this)}
                            >
                                <NextIcon />&nbsp;
                                {Texts.NEXT_VIDEO[this.props.profile.languageString]}
                            </Button>
                        </Grid>
                    }
                    <br />

                    {
                        me.props.video.currentBestStreaming !== "" &&
                        (this.props.updateUrl === false || this.props.updateUrl === true) &&

                        <VideoPlayer
                            poster={me.props.video.posterUrl}
                            src={this.props.video.currentBestStreaming}
                            videoId={this.props.video.id}
                            userId={this.props.profile.id}
                            languageString={me.props.profile.languageString}
                            currentLanguage={this.props.video.currentBestStreamingLanguage}
                            onCurrentLanguageChange={this.handleCurrentStreamLanguageChange.bind(this)}
                            currentQuality={this.props.video.currentBestStreamingQuality}
                            onCurrentQualityChange={this.handleCurrentStreamQualityChange.bind(this)}
                            availableLanguages={available.languages}
                            availableQualities={available.qualities}
                        />
                    }

                    {
                        me.props.video.currentBestStreaming === "" &&
                        me.props.video.posterUrl !== "" &&

                        <div style={{textAlign: "center"}}>
                            <img src={me.props.video.posterUrl} alt={me.props.video.title} height={400} />
                        </div>
                    }

                    <br />
                    <br />

                    {
                        false && me.props.video.downloadLink !== "" &&

                        <div style={{textAlign: "center"}}>
                            <Button onClick={this.handleDownloadClick.bind(this)} color="primary" variant={"contained"}>
                                <GetAppIcon /> {Texts.DOWNLOAD[me.props.profile.languageString]}
                            </Button>
                        </div>
                    }

                    <br />

                    <Typography style={{textAlign: "center"}}>
                        <span style={{fontWeight: "bold"}}>
                            {Texts.PRESS_RATING[this.props.profile.languageString] + " : "}
                        </span>
                        {me.props.video.statistics.pressRating.toFixed(2) + " / 5"}
                    </Typography>

                    <Typography style={{textAlign: "center"}}>
                        <span style={{fontWeight: "bold"}}>
                            {Texts.USER_RATING[this.props.profile.languageString] + " : "}
                        </span>
                        {me.props.video.statistics.userRating.toFixed(2) + " / 5"}
                    </Typography>

                    <Typography style={{textAlign: "center"}}>
                        <span style={{fontWeight: "bold"}}>
                            {Texts.PRODUCTION_YEAR[this.props.profile.languageString] + " : "}
                        </span>
                        {me.props.video.productionYear}
                    </Typography>

                    <Typography style={{textAlign: "center"}}>
                        <span style={{fontWeight: "bold"}}>
                            {Texts.DIRECTORS[this.props.profile.languageString] + " : "}
                        </span>
                        {me.props.video.castingShort.directors}
                    </Typography>

                    <Typography style={{textAlign: "center"}}>
                        <span style={{fontWeight: "bold"}}>
                            {Texts.ACTORS[this.props.profile.languageString] + " : "}
                        </span>
                        {me.props.video.castingShort.actors}
                    </Typography>

                    <br />

                    <Typography component={"div"} style={{textAlign: "center"}}>
                        <span style={{fontWeight: "bold"}}>
                            {Texts.SYNOPSIS[this.props.profile.languageString] + " : "}
                        </span>
                        <br />
                        <div dangerouslySetInnerHTML={{__html: me.props.video.synopsis}} />
                    </Typography>

                </div>

                <br/>

                <div>
                    <TextField
                        variant="outlined"
                        label={Texts.LEAVE_A_COMMENT[this.props.profile.languageString]}
                        multiline={true}
                        onChange={this.handleCommentChange.bind(this)}
                        value={this.state.comment}
                        margin="dense"
                        fullWidth
                        error={this.state.comment_error}
                    />
                    <Button
                        onClick={this.handleSendCommentClick.bind(this)}
                        variant={"contained"}
                        color={"primary"}
                    >
                        <SendIcon/>
                        {Texts.SEND[this.props.profile.languageString]}
                    </Button>
                </div>

                <div className={classes.root}>
                    <Grid container spacing={8}>
                        {
                            (this.props.updateComments == true ||
                            this.props.updateComments == false) &&

                            this.props.video.comments.map((item) => (
                                <Grid item xs={12}>
                                    <Paper className={classes.paper}>
                                        <Typography variant="h6">
                                            {item.username + " (" + Dates.format(new Date(item.createdAt).getTime()) + " )"}
                                        </Typography>
                                        <br/>
                                        <Typography>
                                            {item.value}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))
                        }
                    </Grid>
                </div>


            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.global.profile,

        video: state.video.video,
        updateUrl: state.video.updateUrl,
        originInterfaceRoute: state.video.originInterfaceRoute,
        is_playlist: state.video.is_playlist,
        playlist_name: state.video.playlist_name,
        videos: state.video.videos,
        updateComments: state.video.updateComments
    };
}

export default withRouter(connect(mapStateToProps, {
    //GLOBAL
    globalDisplayAlertDialog,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalReset,
    globalDisplayNotificationSnackbar,

    //VIDEO
    videoSetVideo,
    videoUnsetVideo,
    videoSetCurrentBestStreamingQuality,
    videoSetCurrentBestStreamingLanguage,
    videoLikeVideo,
    videoAddComment,

    //HOME
    homeSetVideo

})(withStyles(styles, { withTheme: true })(Video)));