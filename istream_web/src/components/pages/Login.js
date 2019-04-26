import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect, Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';

import DoneIcon from '@material-ui/icons/Done';

import Texts from "../../constants/Texts";
import Languages from "../../constants/Languages";

import Validator from "../../utils/Validator";
import CommunicationApi from "../../utils/CommunicationApi";
import HttpMethods from "../../constants/HttpMethods";
import Paths from "../../constants/Paths";
import Status from "../../constants/Status";
import Fields from "../../constants/Fields";

import {
    globalAuthSuccess,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAlertDialog
} from "../../redux/actions/globalActions";

import VideoQualities from "../../constants/VideoQualities";

const styles = theme => ({
    paper: {
        position: 'absolute',
        width: theme.spacing.unit * 50,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4,
    },
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    chip: {
        margin: theme.spacing.unit,
    }
});

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: true,

            login: "",
            loginError: false,
            password: "",
            passwordError: false,
            languageString: (props.location.state === undefined ?
                Languages.English : props.location.state.languageString)
        }
    }

    handleLoginChange(event) {
        this.setState({
            login: event.target.value,
            loginError: !Validator.username(event.target.value)
        });
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value,
            passwordError: !Validator.password(event.target.value)
        });
    }

    handleFrenchClick() {
        this.setState({
            languageString: Languages.French
        });
    }

    handleEnglishClick() {
        this.setState({
            languageString: Languages.English
        });
    }

    handleRegistrationClick() {
        this.setState({
            open: false
        });
        this.props.history.push('/register', {
            languageString: this.state.languageString
        });
    }

    login() {
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

                    localStorage.setItem('token', response.data);

                    me.props.globalAuthSuccess({
                        isAdmin: true,
                        username: "Macubix",
                        email: "macubix@gmail.com",
                        pictureUrl: "",
                        darkMode: false,
                        primaryColor: "#338ABD",
                        secondaryColor: "#F1580A",
                        languageString: Languages.French,
                        preferredStreamLanguage: Languages.French,
                        preferredStreamQuality: VideoQualities.p360
                    });

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

    handleSignInClick() {
        console.log(this.state);
        //if (!this.state.loginError && !this.state.passwordError) {
            this.login();
        //}
    }

    render() {
        const { classes } = this.props;

        if (this.props.profile.auth === true) {

            return <Redirect to={"/"} />;

        } else {

            return (
                <div>

                    <Dialog
                        open={this.state.open}
                        disableBackdropClick={true}
                        maxWidth={"sm"}
                        fullWidth={true}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {
                                Texts.SIGN_IN_TO_ISTREAM[this.state.languageString]
                            }
                        </DialogTitle>
                        <DialogContent>
                            <br/>
                            <Typography style={{textAlign: "center"}}>
                                {Texts.SELECT_YOUR_LANGUAGE[this.state.languageString]}
                            </Typography>
                            <div className={classes.root}>
                                <Chip
                                    avatar={<Avatar><img alt="French flag" src={"/img/france.png"}/></Avatar>}
                                    label={Texts.FRENCH[this.state.languageString]}
                                    onClick={this.handleFrenchClick.bind(this)}
                                    className={classes.chip}
                                />
                                <Chip
                                    avatar={<Avatar><img alt="United Kingdom flag"
                                                         src={"/img/united-kingdom.png"}/></Avatar>}
                                    label={Texts.ENGLISH[this.state.languageString]}
                                    onClick={this.handleEnglishClick.bind(this)}
                                    className={classes.chip}
                                />
                            </div>

                            <br/>

                            <TextField
                                onChange={this.handleLoginChange.bind(this)}
                                value={this.state.login}
                                autoFocus
                                margin="dense"
                                label={Texts.LOGIN[this.state.languageString]}
                                type="text"
                                fullWidth
                                required
                                error={this.state.loginError}
                                helperText={Texts.LOGIN_AUTHENTICATION_RULE[this.state.languageString]}
                            />

                            <TextField
                                onChange={this.handlePasswordChange.bind(this)}
                                value={this.state.password}
                                margin="dense"
                                label={Texts.PASSWORD[this.state.languageString]}
                                type="password"
                                fullWidth
                                required
                                error={this.state.passwordError}
                            />

                            <Link to={{
                                pathname: "/passwordLost",
                                state: {
                                    languageString: this.state.languageString
                                }
                            }}  replace style={{ textDecoration: 'none' }}>
                                <Typography>
                                    {Texts.FORGOT_PASSWORD[this.state.languageString] + " ?"}
                                </Typography>
                            </Link>
                        </DialogContent>
                        <DialogActions>

                            <Button onClick={this.handleRegistrationClick.bind(this)} variant={"contained"}>
                                {Texts.REGISTRATION[this.state.languageString]}
                            </Button>

                            <Button onClick={this.handleSignInClick.bind(this)} color="primary" variant={"contained"} autoFocus>
                                <DoneIcon/> {Texts.SIGN_IN[this.state.languageString]}
                            </Button>

                        </DialogActions>
                    </Dialog>

                </div>
            );
        }
    }
}

function mapStateToProps(state) {
    return {
        profile: state.global.profile
    };
}

export default withRouter(connect(mapStateToProps, {
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalAuthSuccess,
    globalDisplayAlertDialog
})(withStyles(styles, { withTheme: true })(Login)));