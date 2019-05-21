import React from 'react';
import PropTypes from 'prop-types';

import {
    Player, BigPlayButton
} from 'video-react';

import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import VideoQualities from "../constants/VideoQualities";
import Languages from "../constants/Languages";
import Texts from "../constants/Texts";

import "../../node_modules/video-react/dist/video-react.css";
import CommunicationApi from "../utils/CommunicationApi";
import HttpMethods from "../constants/HttpMethods";
import Paths from "../constants/Paths";
import Fields from "../constants/Fields";

class VideoPlayer extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            interval_id: -1,
            currentTime: 0
        };
    }

    componentDidMount() {
        this.refs.player.subscribeToStateChange(this.handleStateChange.bind(this));
        this.getVideoTime();
    }

    sendCurrentTime(me) {
        const player = me.refs.player;

        if (player != null && player != undefined) {
            const state = me.refs.player.getState();

            if (state != null && state != undefined) {

                const time = state.player.currentTime;
                const duration = state.player.duration;

                me.setVideoTime(time, duration);
            }
        }
    }

    setVideoTime(currentTime, duration) {
        let params = {};

        let me = this;

        params[Fields.CURRENT_TIME] = currentTime;
        params[Fields.DURATION] = duration;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        let communication = new CommunicationApi(HttpMethods.POST, Paths.HOST + Paths.USER + "/" +
            this.props.userId + Paths.VIEWING + "/" + this.props.videoId, params);
        communication.sendRequest(
            function (response) {

                if (response.status === 200) {



                } else {

                    console.log(response);

                }
            },
            function (error) {

                console.log(error);
            },
            true
        );
    }

    getVideoTime() {
        let params = {};

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.USER + "/" +
            this.props.userId + Paths.VIEWING + "/" + this.props.videoId, params);
        communication.sendRequest(
            function (response) {

                if (response.status === 200) {

                    const { player } = me.refs.player.getState();
                    me.refs.player.seek(player.currentTime + response.data.currentTime);

                    me.setState({
                        currentTime: response.data.currentTime
                    });

                } else {

                    console.log(response);

                }
            },
            function (error) {

                console.log(error);
            },
            true
        );
    }

    handleStateChange(state, prevState) {

        // if (state.currentTime == state.duration)
        //      this.setNextVideo();

        if (state.hasStarted && !state.paused) {

            if (this.state.interval_id == -1) {
                let intervalID = window.setInterval(this.sendCurrentTime, 30000, this);

                this.setState({
                    interval_id: intervalID
                });
            }

        } else {

            window.clearInterval(this.state.interval_id);

            this.setState({
                interval_id: -1
            });
        }
    }

    onCurrentLanguageChange(event) {
        this.props.onCurrentLanguageChange(event);
        this.refs.player.load();
    }

    onCurrentQualityChange(event) {
        this.props.onCurrentQualityChange(event);
        this.refs.player.load();
    }

    render() {

        return (
            <div>
            <Player
                ref={"player"}
                playsInline
                poster={this.props.poster}
                fluid={true}
            >
                <BigPlayButton position="center" />
                <source src={this.props.src} type="video/mp4" />
            </Player>
            {
                this.props.src !== "" &&

                <form style={{textAlign: "center"}}>
                    <FormControl
                        fullWidth={true}
                    >
                        <InputLabel htmlFor="video-language">
                            {
                                Texts.LANGUAGE[this.props.languageString]
                            }
                        </InputLabel>
                        <Select
                            value={this.props.currentLanguage}
                            onChange={this.onCurrentLanguageChange.bind(this)}
                            inputProps={{
                                id: 'video-language'
                            }}
                        >
                            {
                                this.props.availableLanguages.map((item) => (
                                    <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                    <FormControl
                        fullWidth={true}
                    >
                        <InputLabel htmlFor="video-resolution">
                            {
                                Texts.RESOLUTION[this.props.languageString]
                            }
                        </InputLabel>
                        <Select
                            value={this.props.currentQuality}
                            onChange={this.onCurrentQualityChange.bind(this)}
                            inputProps={{
                                id: 'video-resolution'
                            }}
                        >
                            {
                                this.props.availableQualities.map((item) => (
                                    <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </form>
            }
            </div>
        )
    }
}

VideoPlayer.defaultProps = {
    poster: "",
    src: "",
    languageString: Languages.English,
    currentLanguage: Languages.French,
    currentQuality: VideoQualities.p1080,
    availableLanguages: [],
    availableQualities: []
};


VideoPlayer.propTypes = {
    poster: PropTypes.string,
    src: PropTypes.string,
    languageString: PropTypes.string,
    currentLanguage: PropTypes.string,
    currentQuality: PropTypes.string,
    onCurrentLanguageChange: PropTypes.func,
    onCurrentQualityChange: PropTypes.func,
    availableLanguages: PropTypes.array,
    availableQualities: PropTypes.array
};


export default VideoPlayer;