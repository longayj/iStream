import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import {
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAddVideoModal,
    globalDisplayAlertDialog,
    globalHomeIsLoad,

    globalReset
} from "../../redux/actions/globalActions";

import {
    homeSetVideos
} from "../../redux/actions/homeActions";

import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import SearchIcon from '@material-ui/icons/Search';
import AddToQueueIcon from '@material-ui/icons/AddToQueue';

import VideoCard from "../VideoCard";

import CommunicationApi from "../../utils/CommunicationApi";

import Video from "../../models/Video";

import HttpMethods from "../../constants/HttpMethods";
import Paths from "../../constants/Paths";
import Status from "../../constants/Status";
import Texts from "../../constants/Texts";
import {withRouter} from "react-router-dom";
import {fade} from "@material-ui/core/es/styles/colorManipulator";
import {IconButton, InputBase} from "@material-ui/core/es/index";

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

class Home extends React.Component {

    componentDidMount() {
        if (this.props.homeIsLoad === false) {
            this.getVideos();
        }
    }

    getVideos() {
        let params = {};

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.VIDEOS, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    let videos = [];

                    response.data.forEach(function (item) {
                        videos.push(new Video(item,
                            me.props.profile.preferredStreamLanguage,
                            me.props.profile.preferredStreamQuality));
                    });

                    me.props.homeSetVideos(videos);

                    me.props.globalHomeIsLoad();

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

    handleSearchClick() {

    }

    handleAddVideoClick() {
        this.props.globalDisplayAddVideoModal();
    }

    render() {

        const { classes } = this.props;

        return (
            <div>

                <Toolbar className={classes.root}>
                    <Button
                        color={"primary"}
                        variant={"contained"}
                        onClick={this.handleAddVideoClick.bind(this)}
                    >
                        <AddToQueueIcon />&nbsp;
                        {Texts.ADD_A_VIDEO[this.props.profile.languageString]}
                    </Button>
                    <div className={classes.grow} />
                    <div className={classes.search}>
                        <div className={classes.searchIcon}>
                            <SearchIcon />
                        </div>
                        <InputBase
                            placeholder={Texts.SEARCH[this.props.profile.languageString]}
                            classes={{
                                root: classes.inputRoot,
                                input: classes.inputInput,
                            }}
                        />
                    </div>
                </Toolbar>

                <br/>

                <Grid container spacing={24} style={{padding: 24}}>
                    {
                        (this.props.updateGrid === false || this.props.updateGrid === true) &&

                        this.props.videos.map(currentVideo => (
                            <Grid key={currentVideo.id} item xs={12} sm={6} lg={4} xl={3}>
                                <VideoCard video={currentVideo} />
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

        homeIsLoad: state.global.homeIsLoad,

        videos: state.home.videos,
        updateGrid: state.home.updateGrid
    };
}

export default withRouter(connect(mapStateToProps, {
    //GLOBAL
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAddVideoModal,
    globalDisplayAlertDialog,
    globalHomeIsLoad,

    globalReset,

    //HOME
    homeSetVideos

})(withStyles(styles)(Home)));