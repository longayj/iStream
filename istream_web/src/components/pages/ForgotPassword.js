import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Redirect } from 'react-router-dom';

import {
    globalDisplayAlertDialog
} from '../../redux/actions/globalActions';

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
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import Texts from "../../constants/Texts";
import Languages from "../../constants/Languages";

import Validator from "../../utils/Validator";

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

class ForgotPassword extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: true,

            login: "",
            loginError: true,
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

    handleSendNewPasswordClick() {
        console.log(this.state);
        this.props.globalDisplayAlertDialog({
            title: Texts.PASSWORD_RESET[this.state.languageString],
            text: Texts.AN_EMAIL_HAS_BEEN_SENT_TO_YOU_WITH_YOUR_NEW_PASSWORD[this.state.languageString]
        });
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
                                Texts.FORGOT_PASSWORD[this.state.languageString]
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

                        </DialogContent>
                        <DialogActions>

                            <Button onClick={this.handleConnectionClick.bind(this)} variant={"contained"}>
                                <ArrowBackIosIcon /> {Texts.CONNECTION[this.state.languageString]}
                            </Button>

                            <Button onClick={this.handleSendNewPasswordClick.bind(this)} color="primary" variant={"contained"} autoFocus>
                                <DoneIcon/> {Texts.RESET_MY_PASSWORD[this.state.languageString]}
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
    globalDisplayAlertDialog

})(withStyles(styles, { withTheme: true })(ForgotPassword)));