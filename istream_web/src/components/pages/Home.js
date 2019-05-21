import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';

import {
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAddVideoModal,
    globalDisplayAlertDialog,
    globalHomeIsLoad,

    globalReset
} from "../../redux/actions/globalActions";

import {
    homeSetVideos
} from "../../redux/actions/homeActions";

import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import SearchIcon from '@material-ui/icons/Search';
import AddToQueueIcon from '@material-ui/icons/AddToQueue';
import PrevIcon from '@material-ui/icons/SkipPrevious';
import NextIcon from '@material-ui/icons/SkipNext';

import VideoCard from "../VideoCard";

import CommunicationApi from "../../utils/CommunicationApi";

import Video from "../../models/Video";

import HttpMethods from "../../constants/HttpMethods";
import Paths from "../../constants/Paths";
import Status from "../../constants/Status";
import Texts from "../../constants/Texts";
import {withRouter} from "react-router-dom";
import {fade} from "@material-ui/core/es/styles/colorManipulator";
import {IconButton, InputBase, Typography} from "@material-ui/core/es/index";
import Fields from "../../constants/Fields";

const styles = theme => ({
    root: {
        display: 'flex',
    },
    grow: {
        flexGrow: 1,
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.primary.main, 0.50),
        '&:hover': {
            backgroundColor: fade(theme.palette.primary.main, 0.75),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing.unit,
            width: 'auto',
        },
    },
    searchIcon: {
        width: theme.spacing.unit * 9,
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '100%',
    },
    inputInput: {
        paddingTop: theme.spacing.unit,
        paddingRight: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        paddingLeft: theme.spacing.unit * 10,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: 120,
            '&:focus': {
                width: 200,
            },
        },
    },
});

class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            search_text: "",
            page: 1,
            per_page: 10,
            total_page: 1
        }
    }

    componentDidMount() {
        /*if (this.props.homeIsLoad === false) {
            this.getVideos();
        }*/
        this.getVideos(this.state.page);
    }

    getVideos(page, q) {
        let params = {};

        if (q != null && q != undefined && q != "") {
            params[Fields.Q] = q;
        }

        params[Fields.PAGE] = page;
        params[Fields.PER_PAGE] = this.state.per_page;

        let me = this;

        if (!CommunicationApi.checkToken()) {
            this.props.history.push('/auth');
            this.props.globalReset();
        }

        this.props.globalDisplayLoadMask();
        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.VIDEOS, params);
        communication.sendRequest(
            function (response) {

                me.props.globalDismissLoadMask();

                if (response.status === 200) {

                    let videos = [];

                    response.data.videos.forEach(function (item) {
                        videos.push(new Video(item,
                            me.props.profile.preferredStreamLanguage,
                            me.props.profile.preferredStreamQuality,
                            me.props.profile.id));
                    });

                    me.setState({
                        total_page: response.data.total_page
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

    onSearchTextChange(event) {
        this.setState({
            search_text: event.target.value
        });
    }

    handlePressEnterSearch(ev) {

        if (ev.key === 'Enter') {
            ev.preventDefault();

            this.getVideos(1, this.state.search_text);
        }
    }

    handleAddVideoClick() {
        this.props.globalDisplayAddVideoModal();
    }

    handlePrevPageClick() {
        let new_page = this.state.page - 1;
        this.setState({
            page: new_page
        });
        this.getVideos(new_page, this.state.search_text);
    }

    handleNextPageClick() {
        let new_page = this.state.page + 1;
        this.setState({
            page: new_page
        });
        this.getVideos(new_page, this.state.search_text);
    }

    render() {

        const { classes } = this.props;

        return (
            <div>

                <Toolbar className={classes.root}>
                    <Button
                        color={"primary"}
                        variant={"contained"}
                        onClick={this.handleAddVideoClick.bind(this)}
                    >
                        <AddToQueueIcon />&nbsp;
                        {Texts.ADD_A_VIDEO[this.props.profile.languageString]}
                    </Button>
                    <div className={classes.grow} />
                    <div className={classes.search}>
                        <div className={classes.searchIcon}>
                            <SearchIcon />
                        </div>
                        <InputBase
                            onKeyPress={this.handlePressEnterSearch.bind(this)}
                            onChange={this.onSearchTextChange.bind(this)}
                            placeholder={Texts.SEARCH[this.props.profile.languageString]}
                            value={this.state.search_text}
                            classes={{
                                root: classes.inputRoot,
                                input: classes.inputInput,
                            }}
                        />
                    </div>
                </Toolbar>

                <br/>

                <Grid container spacing={24} style={{padding: 24}}>
                    {
                        (this.props.updateGrid === false || this.props.updateGrid === true) &&

                        this.props.videos.map(currentVideo => (
                            <Grid key={currentVideo.id} item xs={12} sm={6} lg={4} xl={3}>
                                <VideoCard video={currentVideo} sourceInterface={"home"}/>
                            </Grid>
                        ))
                    }
                </Grid>
                {
                    this.props.homeIsLoad == true &&

                    <Grid container justify="center">
                        {
                            this.state.page > 1 &&

                            <Button
                                color={"primary"}
                                variant={"contained"}
                                onClick={this.handlePrevPageClick.bind(this)}
                            >
                                <PrevIcon />&nbsp;
                                {Texts.PREVIOUS_PAGE[this.props.profile.languageString]}
                            </Button>
                        }
                        &nbsp;
                        <Typography style={{textAlign: "center"}} variant="h6">
                            {Texts.PAGE[this.props.profile.languageString] + " " + this.state.page + " / " + this.state.total_page}
                        </Typography>
                        &nbsp;
                        {
                            this.state.page < this.state.total_page &&

                            <Button
                                color={"primary"}
                                variant={"contained"}
                                onClick={this.handleNextPageClick.bind(this)}
                            >
                                <NextIcon />&nbsp;
                                {Texts.NEXT_PAGE[this.props.profile.languageString]}
                            </Button>
                        }
                    </Grid>
                }
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

export default withRouter(connect(mapStateToProps, {
    //GLOBAL
    globalDisplayLoadMask,
    globalDismissLoadMask,
    globalDisplayAddVideoModal,
    globalDisplayAlertDialog,
    globalHomeIsLoad,

    globalReset,

    //HOME
    homeSetVideos

})(withStyles(styles)(Home)));