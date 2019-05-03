import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';

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
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';

import DoneIcon from '@material-ui/icons/Done';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import Texts from "../../constants/Texts";
import Languages from "../../constants/Languages";

import Validator from "../../utils/Validator";
import Status from "../../constants/Status";
import CommunicationApi from "../../utils/CommunicationApi";
import Fields from "../../constants/Fields";
import Paths from "../../constants/Paths";
import HttpMethods from "../../constants/HttpMethods";

import {
    globalDisplayAlertDialog,
    globalDisplayLoadMask,
    globalDismissLoadMask
} from "../../redux/actions/globalActions";

const styles = theme => ({
    paper: {
        position: 'absolute',
        width: theme.spacing.unit * 50,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4,
    },
    root_chip: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    chip: {
        margin: theme.spacing.unit,
    },
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing.unit,
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    }
});

class Register extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: true,

            username: "",
            usernameError: false,

            email: "",
            emailError: false,

            password: "",
            passwordError: false,

            confirmPassword: "",
            confirmPasswordError: false,

            language: (props.location.state === undefined ?
                Languages.English : props.location.state.languageString),
            languageError: false,

            debridUsername: "",
            debridPassword: "",

            languageString: (props.location.state === undefined ?
                Languages.English : props.location.state.languageString)
        }
    }

    handleUsernameChange(event) {
        this.setState({
            username: event.target.value,
            usernameError: !Validator.username(event.target.value)
        });
    }

    handleEmailChange(event) {
        this.setState({
            email: event.target.value,
            emailError: !Validator.email(event.target.value)
        });
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value,
            passwordError: !Validator.password(event.target.value)
        });
    }

    handleConfirmPasswordChange(event) {
        this.setState({
            confirmPassword: event.target.value,
            confirmPasswordError: (!Validator.password(event.target.value) ||
                (this.state.password !== event.target.value))
        });
    }

    handleLanguageChange(event) {
        this.setState({
            language: event.target.value
        });
    }

    handleDebridUsernameChange(event) {
        this.setState({
            debridUsername: event.target.value
        });
    }

    handleDebridPasswordChange(event) {
        this.setState({
            debridPassword: event.target.value
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

    handleConnectionClick() {
        this.setState({
            open: false
        });
        this.props.history.push('/auth', {
            languageString: this.state.languageString
        });
    }

    register() {
        let params = {};

        let me = this;

        params[Fields.USERNAME] = this.state.username;
        params[Fields.EMAIL] = this.state.email;
        params[Fields.PASSWORD] = this.state.password;
        params[Fields.LANGUAGE] = this.state.language;

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.POST, Paths.HOST + Paths.REGISTER, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    me.props.history.push('/auth', {
                        languageString: me.state.languageString
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
                        text: Status[error.response.status][me.props.profile.languageString] +
                        " " + (error.response.data.message != undefined ? error.response.data.message : "")
                    });

                }
            }
        );
    }

    handleRegisterClick() {
        console.log(this.state);

        if (!this.state.usernameError &&
            !this.state.passwordError &&
            !this.state.emailError) {

            this.register();
        }
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
                                Texts.REGISTER_TO_ISTREAM[this.state.languageString]
                            }
                        </DialogTitle>
                        <DialogContent>
                            <br/>
                            <Typography style={{textAlign: "center"}}>
                                {Texts.SELECT_YOUR_LANGUAGE[this.state.languageString]}
                            </Typography>
                            <div className={classes.root_chip}>
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

                            <form className={classes.root} autoComplete="off">
                                <FormControl component="fieldset" className={classes.formControl} fullWidth>
                                    <FormControl
                                        className={classes.formControl}
                                        fullWidth
                                    >
                                        <TextField
                                            onChange={this.handleUsernameChange.bind(this)}
                                            value={this.state.username}
                                            autoFocus
                                            margin="dense"
                                            label={Texts.USERNAME[this.state.languageString]}
                                            type="text"
                                            fullWidth
                                            required
                                            error={this.state.usernameError}
                                        />
                                    </FormControl>

                                    <FormControl
                                        className={classes.formControl}
                                        fullWidth
                                    >
                                        <TextField
                                            onChange={this.handleEmailChange.bind(this)}
                                            value={this.state.email}
                                            margin="dense"
                                            label={Texts.EMAIL[this.state.languageString]}
                                            type="text"
                                            fullWidth
                                            required
                                            error={this.state.emailError}
                                        />
                                    </FormControl>

                                    <FormControl
                                        className={classes.formControl}
                                        fullWidth
                                    >
                                        <TextField
                                            onChange={this.handlePasswordChange.bind(this)}
                                            value={this.state.password}
                                            margin="dense"
                                            label={Texts.PASSWORD[this.state.languageString]}
                                            type="password"
                                            fullWidth
                                            required
                                            error={this.state.passwordError}
                                            helperText={Texts.PASSWORD_RULE[this.state.languageString]}
                                        />
                                    </FormControl>

                                    <FormControl
                                        className={classes.formControl}
                                        fullWidth
                                    >
                                        <TextField
                                            onChange={this.handleConfirmPasswordChange.bind(this)}
                                            value={this.state.confirmPassword}
                                            margin="dense"
                                            label={Texts.CONFIRM_PASSWORD[this.state.languageString]}
                                            type="password"
                                            required
                                            error={this.state.confirmPasswordError}
                                        />
                                    </FormControl>

                                    <FormControl
                                        className={classes.formControl}
                                        fullWidth={true}
                                    >
                                        <InputLabel htmlFor="register-language">
                                            {
                                                Texts.LANGUAGE[this.state.languageString]
                                            }
                                        </InputLabel>
                                        <Select
                                            value={this.state.language}
                                            onChange={this.handleLanguageChange.bind(this)}
                                            inputProps={{
                                                id: 'register-language'
                                            }}
                                        >
                                            <MenuItem value={Languages.French}>{Texts.FRENCH[this.state.languageString]}</MenuItem>
                                            <MenuItem value={Languages.English}>{Texts.ENGLISH[this.state.languageString]}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </FormControl>

                                {/*<FormControl component="fieldset" className={classes.formControl} fullWidth>

                                    <Typography style={{textAlign: "center"}}>
                                        IDENTTIFIANT DE CONNECTION DEBRIDEUR
                                    </Typography>

                                    <FormControl
                                        className={classes.formControl}
                                        fullWidth
                                    >
                                        <TextField
                                            onChange={this.handleDebridUsernameChange.bind(this)}
                                            value={this.state.debridUsername}
                                            margin="dense"
                                            label={Texts.USERNAME[this.state.languageString]}
                                            type="text"
                                            fullWidth
                                        />
                                    </FormControl>

                                    <FormControl
                                        className={classes.formControl}
                                        fullWidth
                                    >
                                        <TextField
                                            onChange={this.handleDebridPasswordChange.bind(this)}
                                            value={this.state.debridPassword}
                                            margin="dense"
                                            label={Texts.PASSWORD[this.state.languageString]}
                                            type="password"
                                            fullWidth
                                        />
                                    </FormControl>

                                </FormControl>*/}
                            </form>


                        </DialogContent>
                        <DialogActions>

                            <Button onClick={this.handleConnectionClick.bind(this)} variant={"contained"}>
                                <ArrowBackIosIcon /> {Texts.CONNECTION[this.state.languageString]}
                            </Button>

                            <Button onClick={this.handleRegisterClick.bind(this)} color="primary" variant={"contained"} autoFocus>
                                <DoneIcon/> {Texts.REGISTER[this.state.languageString]}
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
    globalDisplayAlertDialog

})(withStyles(styles, { withTheme: true })(Register)));