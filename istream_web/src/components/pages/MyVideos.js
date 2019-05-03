import React from 'react';
import { connect } from 'react-redux';

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
    globalDisplayAlertDialog
} from "../../redux/actions/globalActions";

import {
    myVideosSetVideos
} from "../../redux/actions/myVideosActions";

class MyVideos extends React.Component {

    componentDidMount() {
        if (this.props.myVideosIsLoad === false) {
            this.getMyVideos();
        }
    }

    getMyVideos() {
        let params = {};

        let me = this;

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

    render() {
        return (
            <div>

                <div>
                    {Texts.MY_VIDEOS[this.props.profile.languageString]}
                </div>
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

export default connect(mapStateToProps, {
    globalMyVideosIsLoad,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAlertDialog,

    myVideosSetVideos
})(MyVideos);