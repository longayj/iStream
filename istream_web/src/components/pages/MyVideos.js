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

import {
    myVideosSetVideos
} from "../../redux/actions/myVideosActions";
import {withRouter} from "react-router-dom";

import {Button, InputBase, Toolbar} from "@material-ui/core/es/index";
import SearchIcon from '@material-ui/icons/Search';
import AddToQueueIcon from '@material-ui/icons/AddToQueue';
import {fade} from "@material-ui/core/es/styles/colorManipulator";

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

class MyVideos extends React.Component {

    componentDidMount() {
        if (this.props.myVideosIsLoad === false) {
            this.getMyVideos();
        }
    }

    getMyVideos() {
        let params = {};

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.USER + "/" + this.props.profile.id + Paths.VIDEOS, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    let videos = [];

                    console.log(response.data);

                    response.data.videos.forEach(function (item) {
                        videos.push(new Video(item,
                            me.props.profile.preferredStreamLanguage,
                            me.props.profile.preferredStreamQuality));
                    });

                    me.props.myVideosSetVideos(videos);

                    me.props.globalMyVideosIsLoad();

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

    handleAddVideoClick() {
        this.props.globalDisplayAddVideoModal();
    }

    render() {

        const { classes } = this.props;

        return (
            <div>

                <Toolbar className={classes.root}>
                    <Button
                        variant={"contained"}
                        color={"primary"}
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

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.global.profile,

        myVideosIsLoad: state.global.myVideosIsLoad,
    };
}

export default withRouter(connect(mapStateToProps, {
    globalMyVideosIsLoad,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAlertDialog,
    globalDisplayAddVideoModal,

    globalReset,

    myVideosSetVideos
})(withStyles(styles)(MyVideos)));