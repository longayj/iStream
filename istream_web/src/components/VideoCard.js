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
import Button from '@material-ui/core/Button';

import MovieIcon from '@material-ui/icons/Movie';
import TvIcon from '@material-ui/icons/Tv';
import ClearIcon from '@material-ui/icons/Clear';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

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

    globalSetNavigation
} from "../redux/actions/globalActions";

import {
    videoSetVideo
} from "../redux/actions/videoActions";

import {
    homeDeleteVideo
} from "../redux/actions/homeActions";

import "../styles/VideoCard.css";

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

        props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.DELETE, Paths.HOST + Paths.VIDEOS + "/" + props.video.id, {});
        communication.sendRequest(
            function (response) {

                props.globalDismissLoadMask();

                if (response.status === 200) {

                    props.homeDeleteVideo(props.video.id);

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
            }
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
                homeDeleteVideo: this.props.homeDeleteVideo
            }
        });
    }

    handleLikeClick() {

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
                    <Button onClick={this.handleLikeClick.bind(this)} color={"primary"} variant={"contained"}>
                        <FavoriteBorderIcon/>
                        {Texts.LIKE[this.props.profile.languageString]}
                    </Button>
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
    }
};


VideoCard.propTypes = {
    classes: PropTypes.object.isRequired,
    video: PropTypes.object.isRequired
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

    globalSetNavigation,

    //VIDEO
    videoSetVideo,

    //HOME
    homeDeleteVideo

})(withStyles(styles, { withTheme: true })(VideoCard)));