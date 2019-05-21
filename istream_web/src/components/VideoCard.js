import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';

import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import MovieIcon from '@material-ui/icons/Movie';
import TvIcon from '@material-ui/icons/Tv';
import ClearIcon from '@material-ui/icons/Clear';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';

import CommunicationApi from "../utils/CommunicationApi";
import HttpMethods from "../constants/HttpMethods";
import Paths from "../constants/Paths";
import Status from "../constants/Status";
import Texts from "../constants/Texts";

import VideoTypes from "../constants/VideoTypes";

import {
    globalDisplayConfirmDialog,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAlertDialog,
    globalDisplayNotificationSnackbar,
    globalDisplayAddVideoToPlaylistModal,

    globalSetNavigation,

    globalReset
} from "../redux/actions/globalActions";

import {
    videoSetVideo
} from "../redux/actions/videoActions";

import {
    myVideosDeleteVideo,
    myVideosSetVideoLike
} from "../redux/actions/myVideosActions";

import {
    homeDeleteVideo,
    homeSetVideoLike
} from "../redux/actions/homeActions";

import "../styles/VideoCard.css";
import {Button, Tooltip} from "@material-ui/core/es/index";

const styles = {
    card: {
        maxWidth: 320,
        maxHeight: 650,
    },
    media: {
        height: 400,
    },
};

class VideoCard extends React.Component {

    handleOnClick() {
        this.props.videoSetVideo({
            video: this.props.video,
            originInterfaceRoute: this.props.location.pathname
        });
        this.props.history.push('/video');
        this.props.globalSetNavigation({
            selectedRoute: "/video",
            keepPrevRouteSettings: this.props.location.pathname,
            settingsToggleActive: false
        });
    }

    deleteVideo(props) {

        if (!CommunicationApi.checkToken()) {
            props.history.push('/auth');
            props.globalReset();
        }

        props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.DELETE, Paths.HOST + Paths.VIDEOS + "/" + props.video.id, {});
        communication.sendRequest(
            function (response) {

                props.globalDismissLoadMask();

                if (response.status === 200) {

                    if (props.sourceInterface == "myVideos") {
                        props.myVideosDeleteVideo(props.video.id);
                    } else if (props.sourceInterface == "home") {
                        props.homeDeleteVideo(props.video.id);
                    }

                } else {

                    props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[props.profile.languageString],
                        text: Status[response.status][props.profile.languageString]
                    });

                }
            },
            function (error) {

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

    handleDeleteClick(event) {
        event.stopPropagation();
        this.props.globalDisplayConfirmDialog({
            title: Texts.DELETE_A_VIDEO[this.props.profile.languageString],
            text: Texts.DO_REALLY_WANT_TO_DELETE_THIS_VIDEO[this.props.profile.languageString],
            target: this.props.video.title +
            (" ( " + this.props.video.productionYear + ", " +
                        this.props.video.castingShort.directors + " ) "),
            callback: this.deleteVideo,
            props: {
                globalDisplayLoadMask: this.props.globalDisplayLoadMask,
                video: this.props.video,
                globalDismissLoadMask: this.props.globalDismissLoadMask,
                globalDisplayAlertDialog: this.props.globalDisplayAlertDialog,
                profile: this.props.profile,
                homeDeleteVideo: this.props.homeDeleteVideo,
                globalReset: this.props.globalReset,
                history: this.props.history,
                sourceInterface: this.props.sourceInterface,
                myVideosDeleteVideo: this.props.myVideosDeleteVideo
            }
        });
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

                    if (me.props.sourceInterface == "myVideos") {
                        me.props.myVideosSetVideoLike({
                            id: me.props.video.id,
                            liked: true
                        });
                    } else if (me.props.sourceInterface == "home") {
                        me.props.homeSetVideoLike({
                            id: me.props.video.id,
                            liked: true
                        });
                    }

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

    handleDislikeClick() {
        let params = {};

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.DELETE, Paths.HOST + Paths.VIDEOS + "/" + this.props.video.id + Paths.LIKES, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    if (me.props.sourceInterface == "myVideos") {
                        me.props.myVideosSetVideoLike({
                            id: me.props.video.id,
                            liked: false
                        });
                    } else if (me.props.sourceInterface == "home") {
                        me.props.homeSetVideoLike({
                            id: me.props.video.id,
                            liked: false
                        });
                    }

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

    handleAddToAPlayistClick() {
        this.props.globalDisplayAddVideoToPlaylistModal({
            title: this.props.video.title + ", " + this.props.video.castingShort.directors + " (" + this.props.video.productionYear + ")",
            id: this.props.video.id
        });
    }

    render() {
        const { classes } = this.props;

        return (
            <Card className={classes.card}>
                <CardActionArea onClick={this.handleOnClick.bind(this)}>
                    <CardMedia
                        className={classes.media}
                        image={this.props.video.posterUrl}
                        title={this.props.video.title}
                    >
                        {
                            this.props.profile.isAdmin === true &&

                            <div>
                                <div onClick={this.handleDeleteClick.bind(this)} style={{
                                    color: "red",
                                    position: "absolute",
                                    top: "0%",
                                    left: "89%"
                                }}>
                                    <ClearIcon fontSize={"large"} />
                                </div>
                            </div>
                        }
                    </CardMedia>
                    <CardContent>
                        <Typography gutterBottom variant="h6">
                            {this.props.video.title + ", " + this.props.video.productionYear + " "}
                            <br/>
                            {
                                this.props.video.type === VideoTypes.MOVIE &&

                                <Chip
                                    icon={<MovieIcon/>}
                                    label={Texts.MOVIE[this.props.profile.languageString]}
                                    variant="default"
                                />
                            }

                            {
                                this.props.video.type === VideoTypes.SERIE &&

                                <Chip
                                    icon={<TvIcon/>}
                                    label={Texts.SERIE[this.props.profile.languageString]}
                                    variant="default"
                                />
                            }
                        </Typography>
                        <Typography>
                            {Texts.DIRECTORS[this.props.profile.languageString] + " : "}
                            {this.props.video.castingShort.directors}
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>

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

                    <Tooltip
                        title={Texts.ADD_TO_A_PLAYLIST[this.props.profile.languageString]}
                        aria-label={Texts.ADD_TO_A_PLAYLIST[this.props.profile.languageString]}
                    >
                        <IconButton
                            onClick={this.handleAddToAPlayistClick.bind(this)}
                            color={"primary"}
                            variant={"contained"}
                        >
                            <PlaylistAddIcon />
                        </IconButton>
                    </Tooltip>
                </CardActions>
            </Card>
        )
    }
}

VideoCard.defaultProps = {
    video: {
        title: "",
        type: "",
        description: ""
    },
    sourceInterface: ""
};


VideoCard.propTypes = {
    classes: PropTypes.object.isRequired,
    video: PropTypes.object.isRequired,
    sourceInterface: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        profile: state.global.profile,

        selectedRoute: state.global.selectedRoute,
        keepPrevRouteSettings: state.global.keepPrevRouteSettings,
        settingsToggleActive: state.global.settingsToggleActive,
    };
}

export default withRouter(connect(mapStateToProps, {
    //GLOBAL
    globalDisplayConfirmDialog,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAlertDialog,
    globalDisplayNotificationSnackbar,

    globalDisplayAddVideoToPlaylistModal,

    globalSetNavigation,

    globalReset,

    //VIDEO
    videoSetVideo,

    //HOME
    homeDeleteVideo,
    homeSetVideoLike,

    //MYVIDEOS
    myVideosDeleteVideo,
    myVideosSetVideoLike

})(withStyles(styles, { withTheme: true })(VideoCard)));