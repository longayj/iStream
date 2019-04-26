import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import {
    globalSettingsSetLanguage,
    globalSettingsSetUsername,
    globalSettingsSetEmail,
    globalSettingsSetDarkMode,
    globalSettingsSetPreferredStreamLanguage,
    globalSettingsSetPreferredStreamQuality,
    globalSettingsSetPrincipalColor,
    globalSettingsSetSecondaryColor,
    globalResetSettingsChanges,
    globalApplySettingsChanges
} from "../../redux/actions/globalActions";

import {
    homeSetVideosStreamPreferences
} from "../../redux/actions/homeActions";

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

import SaveIcon from '@material-ui/icons/Save';
import HistoryIcon from '@material-ui/icons/History';

import { SketchPicker } from 'react-color';

import Languages from "../../constants/Languages";
import VideoQualities from "../../constants/VideoQualities";
import Texts from "../../constants/Texts"
import Fields from "../../constants/Fields";
import CommunicationApi from "../../utils/CommunicationApi";
import HttpMethods from "../../constants/HttpMethods";
import Paths from "../../constants/Paths";
import Status from "../../constants/Status";

const styles = theme => ({
    root: {
        display: 'flex',
    },
    grow: {
        flexGrow: 1,
    },
    containerColor: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    containerColorPicker: {
        margin: theme.spacing.unit * 2,
    },
    formControl: {
        margin: theme.spacing.unit * 2,
    },
});

class Settings extends React.Component {

    handleUsernameChange(event) {
        this.props.globalSettingsSetUsername(event.target.value);
    }

    handleEmailChange(event) {
        this.props.globalSettingsSetEmail(event.target.value);
    }

    handleDarkModeChange(event) {
        this.props.globalSettingsSetDarkMode(event.target.checked);
    }

    handleLanguageChange(event) {
        this.props.globalSettingsSetLanguage(event.target.value);
    }

    handlePreferredStreamLanguageChange(event) {
        this.props.globalSettingsSetPreferredStreamLanguage(event.target.value);
    }

    handlePreferredStreamQualityChange(event) {
        this.props.globalSettingsSetPreferredStreamQuality(event.target.value);
    }

    handlePrimaryColorChange(event) {
        this.props.globalSettingsSetPrincipalColor(event.hex);

    }

    handleSecondaryColorChange(event) {
        this.props.globalSettingsSetSecondaryColor(event.hex);
    }

    handleResetClick() {
        this.props.globalResetSettingsChanges();
    }

    applySettings() {
        let params = {};

        let me = this;

        params[Fields.USERNAME] = this.state.login;
        params[Fields.PASSWORD] = this.state.password;

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.POST, Paths.HOST + Paths.LOGIN, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {



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

    handleApplyClick() {
        if (this.props.settingsProfile.preferredStreamLanguage !== this.props.profile.preferredStreamLanguage ||
            this.props.settingsProfile.preferredStreamQuality !== this.props.profile.preferredStreamQuality) {

            this.props.homeSetVideosStreamPreferences({
                language: this.props.settingsProfile.preferredStreamLanguage,
                quality: this.props.settingsProfile.preferredStreamQuality
            });

        }
        this.props.globalApplySettingsChanges();
    }

    settingsHasChanges() {
        return (
            this.props.settingsProfile.languageString !== this.props.profile.languageString ||
            this.props.settingsProfile.username !== this.props.profile.username ||
            this.props.settingsProfile.email !== this.props.profile.email ||
            this.props.settingsProfile.darkMode !== this.props.profile.darkMode ||
            this.props.settingsProfile.preferredStreamLanguage !== this.props.profile.preferredStreamLanguage ||
            this.props.settingsProfile.preferredStreamQuality !== this.props.profile.preferredStreamQuality ||
            this.props.settingsProfile.primaryColor !== this.props.profile.primaryColor ||
            this.props.settingsProfile.secondaryColor !== this.props.profile.secondaryColor
        );
    }

    render() {

        const { classes } = this.props;

        return (
            <div>

                <div className={classes.root}>

                    <form className={classes.grow}>

                        <FormControl
                            component="fieldset"
                            className={classes.formControl}
                            fullWidth
                        >
                            <Typography variant="h5" noWrap style={{textAlign: "center"}}>
                                {Texts.SETTINGS[this.props.profile.languageString]}
                            </Typography>

                            <br />

                            <Typography variant="h6" noWrap style={{textAlign: "center"}}>
                                {Texts.ACCOUNT[this.props.profile.languageString]}
                            </Typography>

                            <FormControl>
                                <TextField
                                    onChange={this.handleUsernameChange.bind(this)}
                                    value={this.props.settingsProfile.username}
                                    margin="dense"
                                    label={Texts.USERNAME[this.props.profile.languageString]}
                                    type="text"
                                    fullWidth
                                    required
                                />
                            </FormControl>

                            <FormControl>
                                <TextField
                                    onChange={this.handleEmailChange.bind(this)}
                                    value={this.props.settingsProfile.email}
                                    margin="dense"
                                    label={Texts.EMAIL[this.props.profile.languageString]}
                                    type="text"
                                    fullWidth
                                    required
                                />
                            </FormControl>

                            <FormControl>
                                <InputLabel htmlFor="settings-language">
                                    {Texts.LANGUAGE[this.props.profile.languageString]}
                                </InputLabel>
                                <Select
                                    value={this.props.settingsProfile.languageString}
                                    onChange={this.handleLanguageChange.bind(this)}
                                    inputProps={{
                                        id: 'settings-language'
                                    }}
                                >
                                    <MenuItem value={Languages.French}>{Texts.FRENCH[this.props.profile.languageString]}</MenuItem>
                                    <MenuItem value={Languages.English}>{Texts.ENGLISH[this.props.profile.languageString]}</MenuItem>
                                </Select>
                            </FormControl>

                            <br />

                            <Typography variant="h6" noWrap style={{textAlign: "center"}}>
                                {Texts.CUSTOMISATION[this.props.profile.languageString]}
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={this.props.settingsProfile.darkMode}
                                        onChange={this.handleDarkModeChange.bind(this)}
                                    />
                                }
                                label={
                                    Texts.ENABLE_DARK_MODE[this.props.profile.languageString]
                                }
                            />

                            <FormControl>
                                <InputLabel htmlFor="settings-preferred-stream-language">
                                    {Texts.PREFERRED_STREAM_LANGUAGE[this.props.profile.languageString]}
                                </InputLabel>
                                <Select
                                    value={this.props.settingsProfile.preferredStreamLanguage}
                                    onChange={this.handlePreferredStreamLanguageChange.bind(this)}
                                    inputProps={{
                                        id: 'settings-preferred-stream-language'
                                    }}
                                >
                                    <MenuItem value={Languages.French}>{Texts.FRENCH[this.props.profile.languageString]}</MenuItem>
                                    <MenuItem value={Languages.English}>{Texts.ENGLISH[this.props.profile.languageString]}</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <InputLabel htmlFor="settings-preferred-stream-quality">
                                    {Texts.PREFERRED_STREAM_QUALITY[this.props.profile.languageString]}
                                </InputLabel>
                                <Select
                                    value={this.props.settingsProfile.preferredStreamQuality}
                                    onChange={this.handlePreferredStreamQualityChange.bind(this)}
                                    inputProps={{
                                        id: 'settings-preferred-stream-quality'
                                    }}
                                >
                                    <MenuItem value={VideoQualities.p360}>{VideoQualities.p360}</MenuItem>
                                    <MenuItem value={VideoQualities.p480}>{VideoQualities.p480}</MenuItem>
                                    <MenuItem value={VideoQualities.p720}>{VideoQualities.p720}</MenuItem>
                                    <MenuItem value={VideoQualities.p1080}>{VideoQualities.p1080}</MenuItem>
                                </Select>
                            </FormControl>

                            <Grid
                                container
                                spacing={0}
                                direction="column"
                                alignItems="center"
                                justify="center"
                            >

                                <Grid item xs={6} sm={6} md={12} lg={12}>
                                    <div className={classes.containerColor}>
                                        <FormControl className={classes.containerColorPicker}>
                                            <Typography style={{textAlign: "center"}}>
                                                {Texts.PRINCIPAL_COLOR[this.props.profile.languageString]}
                                            </Typography>
                                            <SketchPicker
                                                color={this.props.settingsProfile.primaryColor}
                                                onChange={this.handlePrimaryColorChange.bind(this)}
                                            />

                                        </FormControl>

                                        <FormControl className={classes.containerColorPicker}>
                                            <Typography style={{textAlign: "center"}}>
                                                {Texts.SECONDARY_COLOR[this.props.profile.languageString]}
                                            </Typography>
                                            <SketchPicker
                                                color={this.props.settingsProfile.secondaryColor}
                                                onChange={this.handleSecondaryColorChange.bind(this)}
                                            />

                                        </FormControl>
                                    </div>
                                </Grid>

                            </Grid>

                        </FormControl>

                        <br />

                        <Button
                            onClick={this.handleResetClick.bind(this)}
                            variant={"contained"}
                            color={"secondary"}
                            disabled={!this.settingsHasChanges()}
                        >
                            <HistoryIcon />
                            {Texts.RESET[this.props.profile.languageString]}
                        </Button>
                        &nbsp;
                        <Button
                            onClick={this.handleApplyClick.bind(this)}
                            variant={"contained"}
                            color={"primary"}
                            disabled={!this.settingsHasChanges()}
                        >
                            <SaveIcon/>
                            {Texts.APPLY[this.props.profile.languageString]}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.global.profile,
        settingsProfile: state.global.settingsProfile
    };
}

export default connect(mapStateToProps, {
    globalSettingsSetLanguage,
    globalSettingsSetUsername,
    globalSettingsSetEmail,
    globalSettingsSetDarkMode,
    globalSettingsSetPreferredStreamLanguage,
    globalSettingsSetPreferredStreamQuality,
    globalSettingsSetPrincipalColor,
    globalSettingsSetSecondaryColor,
    globalResetSettingsChanges,
    globalApplySettingsChanges,

    homeSetVideosStreamPreferences
})(withStyles(styles)(Settings));