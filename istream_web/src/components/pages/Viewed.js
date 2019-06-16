import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import Texts from "../../constants/Texts"
import CommunicationApi from "../../utils/CommunicationApi";
import HttpMethods from "../../constants/HttpMethods";
import Paths from "../../constants/Paths";
import Video from "../../models/Video";
import Status from "../../constants/Status";

import {
    globalMyVideosIsLoad,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAlertDialog,
    globalDisplayAddVideoModal,

    globalReset
} from "../../redux/actions/globalActions";

import {withRouter} from "react-router-dom";

import {Button, Grid, InputBase, Toolbar, Typography} from "@material-ui/core/es/index";

import SearchIcon from '@material-ui/icons/Search';
import PrevIcon from '@material-ui/icons/SkipPrevious';
import NextIcon from '@material-ui/icons/SkipNext';

import {fade} from "@material-ui/core/es/styles/colorManipulator";
import VideoCard from "../VideoCard";
import Fields from "../../constants/Fields";

const styles = theme => ({
    root: {
        display: 'flex',
    },
    grow: {
        flexGrow: 1,
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.primary.main, 0.50),
        '&:hover': {
            backgroundColor: fade(theme.palette.primary.main, 0.75),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing.unit,
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing.unit * 9,
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        paddingTop: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        paddingLeft: theme.spacing.unit * 10,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 120,
            '&:focus': {
                width: 200,
            },
        },
    },
});

class Viewed extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currently_wiewing: [],
            updateGrid: false,
            page: 1,
            per_page: 10,
            total_page: 1
        };
    }
    componentDidMount() {
        this.getVideos(this.state.page);
    }

    getVideos(page) {
        let params = {};

        params[Fields.PAGE] = page;
        params[Fields.PER_PAGE] = this.state.per_page;

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.USER + "/" + this.props.profile.id + Paths.VIEWED, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    let videos = [];

                    response.data.viewing.forEach(function (item) {
                        videos.push(new Video(item.video,
                            me.props.profile.preferredStreamLanguage,
                            me.props.profile.preferredStreamQuality,
                            me.props.profile.id));
                    });

                    me.setState({
                        total_page: response.data.total_page,
                        currently_wiewing: videos,
                        updateGrid: !me.state.updateGrid
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

    render() {

        const { classes } = this.props;

        return (
            <div>

                <Grid container spacing={24} style={{padding: 24}}>
                    {
                        (this.state.updateGrid === false || this.state.updateGrid === true) &&

                        this.state.currently_wiewing.map(currentVideo => (
                            <Grid key={currentVideo.id} item xs={12} sm={6} lg={4} xl={3}>
                                <VideoCard video={currentVideo} sourceInterface={"home"}/>
                            </Grid>
                        ))
                    }
                </Grid>

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.global.profile,

        videos: state.myvideos.videos
    };
}

export default withRouter(connect(mapStateToProps, {
    globalMyVideosIsLoad,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAlertDialog,
    globalDisplayAddVideoModal,

    globalReset
})(withStyles(styles)(Viewed)));