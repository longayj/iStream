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

class VideoPlayer extends React.Component {

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