import React from 'react';
import { connect } from 'react-redux';

import {
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAddVideoModal,
    globalDisplayAlertDialog,
    globalHomeIsLoad
} from "../../redux/actions/globalActions";

import {
    homeSetVideos
} from "../../redux/actions/homeActions";

import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';

import AddToQueueIcon from '@material-ui/icons/AddToQueue';

import VideoCard from "../VideoCard";

import CommunicationApi from "../../utils/CommunicationApi";

import Video from "../../models/Video";

import HttpMethods from "../../constants/HttpMethods";
import Paths from "../../constants/Paths";
import Status from "../../constants/Status";
import Texts from "../../constants/Texts";

class Home extends React.Component {

    componentDidMount() {
        if (this.props.homeIsLoad === false) {
            this.getVideos();
        }
    }

    getVideos() {
        let params = {};

        let me = this;

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

    handleAddVideoClick() {
        this.props.globalDisplayAddVideoModal();
    }

    render() {

        return (
            <div>

                <Toolbar>
                    <IconButton
                        onClick={this.handleAddVideoClick.bind(this)}
                    >
                        <AddToQueueIcon />
                    </IconButton>
                </Toolbar>

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

export default connect(mapStateToProps, {
    //GLOBAL
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAddVideoModal,
    globalDisplayAlertDialog,
    globalHomeIsLoad,

    //HOME
    homeSetVideos

})(Home);