import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import AddIcon from '@material-ui/icons/Add';

import CommunicationApi from "../utils/CommunicationApi";
import HttpMethods from "../constants/HttpMethods";
import Paths from "../constants/Paths";
import Status from "../constants/Status";
import Texts from "../constants/Texts";
import Fields from "../constants/Fields";

import {
    globalDisplayAlertDialog,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayNotificationSnackbar,
    globalDisplayConfirmDialog,
    globalReset

} from "../redux/actions/globalActions";

import "../styles/VideoCard.css";

const styles = {
    card: {
        maxWidth: 220,
        //maxHeight: 400,
    },
    media: {
        height: 250,
    },
};

class ZoneItemCard extends React.Component {

    addVideo(props) {

        let params = {};

        params[Fields.URL] = props.item.link;
        params[Fields.TITLE] = props.item.title;
        params[Fields.IMAGE_URL] = props.item.imageUrl;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.POST, Paths.HOST + Paths.ZONE, params);
        communication.sendRequest(
            function (response) {

                props.globalDismissLoadMask();

                if (response.status === 200) {

                    props.globalDisplayNotificationSnackbar(Texts.VIDEO_ADDED[props.profile.languageString]);

                } else {

                    props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[props.profile.languageString],
                        text: Status[response.status][props.profile.languageString]
                    });

                }
            },
            function (error) {

                props.globalDismissLoadMask();

                if (error.response === undefined || error.response.status === undefined || !(error.response.status in Status)) {

                    props.globalDisplayAlertDialog({
                        title: Texts.NETWORK_ERROR[props.profile.languageString],
                        text: Texts.A_NETWORK_ERROR_OCCURED[props.profile.languageString]
                    });

                } else {

                    props.globalDisplayAlertDialog({
                        title: Texts.ERROR_OCCURED[props.profile.languageString],
                        text: Status[error.response.status][props.profile.languageString]
                    });

                }
            },
            true
        );
    }

    handleAddClick() {
        let item = this.props.video;

        this.props.globalDisplayConfirmDialog({
            title: Texts.ADD_A_VIDEO[this.props.profile.languageString],
            text: Texts.DO_REALLY_WANT_TO_ADD_THIS_VIDEO[this.props.profile.languageString],
            target: item.title +
            (" " + item.quality + " " + item.lang),
            callback: this.addVideo,
            props: {
                globalDisplayLoadMask: this.props.globalDisplayLoadMask,
                globalDismissLoadMask: this.props.globalDismissLoadMask,
                globalDisplayAlertDialog: this.props.globalDisplayAlertDialog,
                profile: this.props.profile,
                item: item,
                globalDisplayNotificationSnackbar: this.props.globalDisplayNotificationSnackbar
            }
        });
    }

    render() {
        const { classes } = this.props;

        return (
            <Card className={classes.card}>
                <CardActionArea onClick={this.handleAddClick.bind(this)}>
                    <CardMedia
                        className={classes.media}
                        image={this.props.video.imageUrl}
                        title={this.props.video.title}
                    >
                    </CardMedia>
                    <CardContent>
                        <Typography noWrap gutterBottom>
                            {this.props.video.title}<br />
                            {this.props.video.quality + " " + this.props.video.lang}
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions>
                    <Button onClick={this.handleAddClick.bind(this)} color={"primary"} variant={"contained"}>
                        <AddIcon/>
                        {Texts.ADD[this.props.profile.languageString]}
                    </Button>
                </CardActions>
            </Card>
        )
    }
}

ZoneItemCard.defaultProps = {
    video: {
        title: "",
        type: "",
        description: ""
    }
};


ZoneItemCard.propTypes = {
    classes: PropTypes.object.isRequired,
    video: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    return {
        profile: state.global.profile
    };
}

export default withRouter(connect(mapStateToProps, {

    globalDisplayAlertDialog,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayNotificationSnackbar,
    globalDisplayConfirmDialog,
    globalReset

})(withStyles(styles, { withTheme: true })(ZoneItemCard)));