import React from 'react';
import { connect } from 'react-redux';

import {
    globalDisplayAlertDialog,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayConfirmDialog,
    globalDisplayNotificationSnackbar
} from "../../redux/actions/globalActions";

import {

} from "../../redux/actions/homeActions";

import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import SearchIcon from '@material-ui/icons/Search';
import LinkIcon from '@material-ui/icons/Link';
import AddCircleIcon from '@material-ui/icons/AddCircleOutline';
import CancelIcon from '@material-ui/icons/Cancel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ZoneItemCard from "../ZoneItemCard";

import CommunicationApi from "../../utils/CommunicationApi";

import HttpMethods from "../../constants/HttpMethods";
import Paths from "../../constants/Paths";
import Status from "../../constants/Status";
import Texts from "../../constants/Texts";
import Fields from "../../constants/Fields";

import ZoneItem from "../../models/ZoneItem";

const styles = theme => ({
    root: {
        width: '100%',
    },
    grow: {
        flexGrow: 1,
    },
    colorated: {
        color: theme.palette.primary.main
    },
    progress: {
        margin: theme.spacing.unit * 2,
    }
});

class Zone extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            search: "",
            last_search: "",
            results: [],

            exclus: [],
            series_vf: [],
            series_vostfr: [],
            nouveautes: []
        };
    }

    componentWillMount() {
        this.props.globalDisplayLoadMask();

        this.getZoneNews("/exclus");
        this.getZoneNews("/series-vf");
        this.getZoneNews("/series-vostfr");
        this.getZoneNews("/nouveaute");
    }

    getZoneNews(path) {
        let params = {};

        params[Fields.PATH] = path;

        let me = this;
        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.ZONE_NEWS, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    let results = [];

                    response.data.forEach(function (item, index) {
                        if (index < 5) {
                            results.push(new ZoneItem(item));
                        }
                    });

                    let newState;

                    if (path === "/exclus") {
                        newState = {exclus: results};
                    } else if (path === "/series-vf") {
                        newState = {series_vf: results};
                    } else if (path === "/series-vostfr") {
                        newState = {series_vostfr: results};
                    } else if (path === "/nouveaute") {
                        newState = {nouveautes: results};
                    }

                    me.setState(newState);

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

    searchZone() {
        let params = {};

        params[Fields.Q] = this.state.search;

        let me = this;

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.ZONE, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    let results = [];

                    response.data.forEach(function (item) {
                        results.push(new ZoneItem(item));
                    });

                    me.setState({
                        results: results,
                        last_search: me.state.search
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

    addVideo(props) {

        let params = {};

        params[Fields.URL] = props.item.link;
        params[Fields.TITLE] = props.item.title;
        params[Fields.IMAGE_URL] = props.item.imageUrl;

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
            }
        );
    }

    handleAddClick(item) {
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

    handleSearchChange(event) {
        this.setState({
            search: event.target.value
        });
    }

    handleSearchClick() {
        if (this.state.last_search !== this.state.search) {
            this.searchZone();
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleSearchClick();
        }
    }

    handleResetClick() {
        this.setState({
            results: [],
            search: "",
            last_search: ""
        });
    }

    render() {

        const { classes } = this.props;

        return (
            <div>

                <div className={classes.root}>
                    <Toolbar>
                        <FormControl className={classes.grow}>
                            <InputLabel htmlFor="zone-search">
                                {Texts.SEARCH_ON_ZONE_TELECHARGEMENT[this.props.profile.languageString]}
                            </InputLabel>
                            <Input
                                fullWidth={true}
                                id="zone-search"
                                type={'text'}
                                value={this.state.search}
                                onChange={this.handleSearchChange.bind(this)}
                                onKeyPress={this.handleKeyPress.bind(this)}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Search button"
                                            onClick={this.handleSearchClick.bind(this)}
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                        <IconButton>
                            <CancelIcon
                                aria-label="Reset button"
                                onClick={this.handleResetClick.bind(this)}
                            />
                        </IconButton>
                    </Toolbar>
                </div>

                {
                    this.state.last_search !== "" &&

                    <List>
                        {
                            this.state.results.map((item) => (
                                <ListItem button key={item.link}>
                                    <ListItemIcon>
                                        <LinkIcon/>
                                    </ListItemIcon>
                                    <ListItemText primary={item.title} secondary={item.quality + " / " + item.lang}/>
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            aria-label="Add"
                                            className={classes.colorated}
                                            onClick={this.handleAddClick.bind(this, item)}
                                        >
                                            <AddCircleIcon/>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        }
                    </List>
                }

                {
                    this.state.last_search === "" &&

                    <div>
                        <ExpansionPanel defaultExpanded={true}>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Exclus</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={24} style={{padding: 24}}>
                                    {
                                        this.state.exclus.map(currentVideo => (
                                            <Grid key={currentVideo.link} item xs={12} sm={4} lg={3} xl={2}>
                                                <ZoneItemCard video={currentVideo} />
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Serie VF</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={24} style={{padding: 24}}>
                                    {
                                        this.state.series_vf.map(currentVideo => (
                                            <Grid key={currentVideo.link} item xs={12} sm={4} lg={3} xl={2}>
                                                <ZoneItemCard video={currentVideo} />
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Serie VOSTFR</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={24} style={{padding: 24}}>
                                    {
                                        this.state.series_vostfr.map(currentVideo => (
                                            <Grid key={currentVideo.link} item xs={12} sm={4} lg={3} xl={2}>
                                                <ZoneItemCard video={currentVideo} />
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>

                        <ExpansionPanel>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>Nouveautes</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Grid container spacing={24} style={{padding: 24}}>
                                    {
                                        this.state.nouveautes.map(currentVideo => (
                                            <Grid key={currentVideo.link} item xs={12} sm={4} lg={3} xl={2}>
                                                <ZoneItemCard video={currentVideo} />
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    </div>
                }

            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.global.profile
    };
}

export default connect(mapStateToProps, {
    //GLOBAL
    globalDisplayAlertDialog,
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayConfirmDialog,
    globalDisplayNotificationSnackbar

})(withStyles(styles, { withTheme: true })(Zone));