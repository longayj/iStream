import React from 'react';
import { connect } from 'react-redux';

import { withRouter } from 'react-router-dom';

import {
    globalDisplayAlertDialog,
    globalDisplayLoadMask,
    globalDismissLoadMask
} from "../../redux/actions/globalActions";

import {
    videoUnsetVideo,
    videoSetCurrentBestStreamingQuality,
    videoSetCurrentBestStreamingLanguage
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
import SendIcon from "@material-ui/icons/Send";
import RefreshIcon from "@material-ui/icons/Refresh";

import VideoPlayer from "../VideoPlayer";

import CommunicationApi from "../../utils/CommunicationApi";

import HttpMethods from "../../constants/HttpMethods";
import Paths from "../../constants/Paths";
import Status from "../../constants/Status";
import Texts from "../../constants/Texts";

import "../../styles/Video.css"
import Validator from "../../utils/Validator";

const styles = theme => ({
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
            comment_error: false
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
            }
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
        })
    }

    handleSendCommentClick() {

    }

    handleLikeClick() {

    }

    handleRefreshClick() {
        this.refreshVideo();
    }

    render() {

        const me = this;

        const available = this.props.video.getAvailable();

        return (
            <div>

                <div>
                    <Typography variant="h4" noWrap style={{textAlign: "center"}}>
                        {this.props.video.title}
                    </Typography>

                    <br />

                    <div style={{textAlign: "center"}}>

                        {
                            this.props.profile.isAdmin === true &&


                                <Button onClick={this.handleRefreshClick.bind(this)} color="primary" variant={"contained"}>
                                    <RefreshIcon /> {Texts.REFRESH[me.props.profile.languageString]}
                                </Button>
                        }

                        <Button onClick={this.handleLikeClick.bind(this)} color={"primary"} variant={"contained"}>
                            <FavoriteBorderIcon/>
                            {Texts.LIKE[this.props.profile.languageString]}
                        </Button>
                    </div>

                    <br />
                    <br />

                    {
                        me.props.video.currentBestStreaming !== "" &&
                        (this.props.updateUrl === false || this.props.updateUrl === true) &&

                        <VideoPlayer
                            poster={me.props.video.posterUrl}
                            src={this.props.video.currentBestStreaming}
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
                        me.props.video.downloadLink !== "" &&

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

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.global.profile,

        video: state.video.video,
        updateUrl: state.video.updateUrl,
        originInterfaceRoute: state.video.originInterfaceRoute
    };
}

export default withRouter(connect(mapStateToProps, {
    //GLOBAL
    globalDisplayAlertDialog,
    globalDisplayLoadMask,
    globalDismissLoadMask,

    //VIDEO
    videoUnsetVideo,
    videoSetCurrentBestStreamingQuality,
    videoSetCurrentBestStreamingLanguage,

    //HOME
    homeSetVideo

})(withStyles(styles, { withTheme: true })(Video)));