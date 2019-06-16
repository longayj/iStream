import React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, Switch, Route } from 'react-router-dom';

import {
    globalDismissNotificationSnackbar,
    globalDismissAlertDialog,
    globalDismissConfirmDialog,

    globalSetNavigation,
    globalSetMobileDrawerIsOpen,

    globalReset
} from "../redux/actions/globalActions";

/* PAGES */

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Home from "./pages/Home";
import Zone from "./pages/Zone";
import Playlists from "./pages/Playlists";
import MyVideos from "./pages/MyVideos";
import Viewing from "./pages/Viewing";
import Viewed from "./pages/Viewed";

import Video from "./pages/Video";
import Settings from "./pages/Settings";

/* COMPONENTS */

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import HomeIcon from '@material-ui/icons/Home';
import PlaylistIcon from '@material-ui/icons/PlaylistPlay';
import VideoIcon from '@material-ui/icons/VideoLibrary';
import PlayArrayIcon from '@material-ui/icons/PlayArrow';
import SettingsIcon from '@material-ui/icons/Settings';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import SearchIcon from '@material-ui/icons/Search';

/* CUSTOM COMPONENTS */

import EnsureLoggedInContainer from "./EnsureLoggedInContainer";

import Layout from "./Layout";

import LoadMask from "./LoadMask";

import AlertDialog from "./modals/AlertDialog";
import ConfirmDialog from "./modals/ConfirmDialog";
import AddVideoModal from "./modals/AddVideoModal";
import CreatePlaylistModal from "./modals/CreatePlaylistModal";
import AddVideoToPlaylistModal from "./modals/AddVideoToPlaylistModal";

import NotificationSnackbar from "./NotificationSnackbar";

import ToggleButton from "./ToggleButton";

/* CONSTANTS */

import Texts from "../constants/Texts";

/* STYLES */

import '../styles/App.css';
import {IconButton, Tooltip} from "@material-ui/core/es/index";


class App extends React.Component {

    constructor(props) {
        super(props);

        this.props.globalSetNavigation({
            selectedRoute: this.props.location.pathname,
            keepPrevRouteSettings: this.props.location.pathname,
            settingsToggleActive: (this.props.location.pathname === "/settings")
        });
    }

    handleSelectChange(route) {
        this.props.globalSetNavigation({
            selectedRoute: route,
            keepPrevRouteSettings: "",
            settingsToggleActive: false,
            mobileDrawerOpen: false
        });
    }

    handleCloseAlert() {
        this.props.globalDismissAlertDialog();
    }

    handleCloseNotificationSnackbar() {
        this.props.globalDismissNotificationSnackbar();
    }

    handleConfirmConfirm() {
        this.props.confirmCallBackFunc(this.props.confirmCallBackProps);
        this.props.globalDismissConfirmDialog();
    }

    handleCancelConfirm() {
        this.props.globalDismissConfirmDialog();
    }

    hangleSettingsStateChange(state) {
        if (state) {
            this.props.history.push('/settings', {
                originInterfaceRoute: this.props.selectedRoute
            });
            this.props.globalSetNavigation({
                selectedRoute: '/settings',
                keepPrevRouteSettings: this.props.selectedRoute,
                settingsToggleActive: state
            });
        } else {
            let route = this.props.keepPrevRouteSettings === "/settings" ?
                "/home" : this.props.keepPrevRouteSettings;
            this.props.history.push(route);

            this.props.globalSetNavigation({
                selectedRoute: route,
                keepPrevRouteSettings: "",
                settingsToggleActive: state
            });
        }
    }

    handleLogoutClick() {
        localStorage.removeItem("token");
        this.props.globalReset();
    }

    render() {

        const theme = createMuiTheme({
            typography: {
                useNextVariants: true,
                fontFamily: '"Helvetica Neue"'
            },
            palette: {
                type: (this.props.profile.darkMode ? 'dark' : 'light'),
                primary: {
                    main: this.props.profile.primaryColor
                },
                secondary: {
                    main: this.props.profile.secondaryColor
                }
            }
        });

        const tabs = [
            {
                name: Texts.HOME[this.props.profile.languageString],
                component: Home,
                route: "/home",
                icon: <HomeIcon/>,
                display: true
            },
            {
                name: Texts.ZONE[this.props.profile.languageString],
                component: Zone,
                route: "/zone",
                icon: <SearchIcon/>,
                display: this.props.profile.isAdmin
            },
            {
                name: Texts.MY_VIDEOS[this.props.profile.languageString],
                component: MyVideos,
                route: "/myvideos",
                icon: <VideoIcon/>,
                display: true
            },
            {
                name: Texts.VIEWING[this.props.profile.languageString],
                component: Viewing,
                route: "/viewing",
                icon: <VideoIcon/>,
                display: true
            },
            {
                name: Texts.VIEWED[this.props.profile.languageString],
                component: Viewed,
                route: "/viewed",
                icon: <VideoIcon/>,
                display: true
            },
            {
                name: Texts.PLAYLISTS[this.props.profile.languageString],
                component: Playlists,
                route: "/playlists",
                icon: <PlaylistIcon/>,
                display: true
            },
            {
                name: Texts.VIDEO[this.props.profile.languageString],
                component: Video,
                route: "/video",
                icon: <PlayArrayIcon/>,
                display: this.props.video.id !== -1
            },
            {
                name: Texts.SETTINGS[this.props.profile.languageString],
                component: Settings,
                route: "/settings",
                icon: <SettingsIcon/>,
                display: this.props.selectedRoute === "/settings"
            }
        ];

        const menu = (
            <List>
                {tabs.map((item, index) => (

                    item.display &&

                    <Link key={item.name} to={item.route} replace style={{ textDecoration: 'none' }}>
                        <ListItem
                            button
                            selected={
                                (item.route === this.props.selectedRoute ||
                                    (item.route === '/home' && this.props.selectedRoute === "/") ||
                                    (item.route === '/home' && this.props.selectedRoute === "/register") ||
                                    (item.route === '/home' && this.props.selectedRoute === "/auth"))
                            }
                            onClick={this.handleSelectChange.bind(this, item.route)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText>
                                {item.name}
                            </ListItemText>
                        </ListItem>
                    </Link>
                ))}
            </List>
        );

        const appBarButton = (
            <Tooltip
                title={Texts.SETTINGS[this.props.profile.languageString]}
                aria-label={Texts.SETTINGS[this.props.profile.languageString]}
            >
                <ToggleButton
                    icon={true}
                    onStateChange={this.hangleSettingsStateChange.bind(this)}
                    isActive={this.props.settingsToggleActive}
                >
                    <SettingsIcon />
                </ToggleButton>
            </Tooltip>
        );

        const logoutButton = (
            <Tooltip
                title={Texts.LOGOUT[this.props.profile.languageString]}
                aria-label={Texts.LOGOUT[this.props.profile.languageString]}
            >
                <IconButton
                    aria-label="Logout"
                    onClick={this.handleLogoutClick.bind(this)}
                >
                    <LogoutIcon />
                </IconButton>
            </Tooltip>
        );

        return (
            <MuiThemeProvider theme = { theme }>

                <Switch>

                    <Route path="/auth" component={Login} />
                    <Route path="/register" component={Register} />
                    <Route path="/passwordLost" component={ForgotPassword} />
                    <Route>
                        <EnsureLoggedInContainer>
                            <Route path="/">

                                <Layout
                                  brand={"iStream"}
                                  appBarRight={appBarButton}
                                  logoutButton={logoutButton}
                                  navigationMenu={menu}
                                >
                                    <Route exact path={"/"} component={Home} />
                                    <Route path="/home" component={Home} />
                                    <Route path="/zone" component={Zone}/>
                                    <Route path="/myvideos" component={MyVideos} />
                                    <Route path="/viewing" component={Viewing} />
                                    <Route path="/viewed" component={Viewed} />
                                    <Route path="/playlists" component={Playlists} />

                                    <Route path="/video" component={Video} />
                                    <Route path="/settings" component={Settings} />

                                    <AddVideoModal/>
                                    <CreatePlaylistModal/>
                                    <AddVideoToPlaylistModal/>

                                    <LoadMask
                                        show={this.props.showLoadMask}
                                    />

                                    <NotificationSnackbar
                                        open={this.props.showNotificationSnackbar}
                                        text={this.props.notificationSnackbarText}
                                        onClose={this.handleCloseNotificationSnackbar.bind(this)}
                                    />
                                </Layout>

                            </Route>
                        </EnsureLoggedInContainer>
                    </Route>

                </Switch>

                <AlertDialog
                    open={this.props.showAlert}
                    title={this.props.alertTitle}
                    text={this.props.alertText}
                    buttonText={Texts.OK[this.props.profile.languageString]}
                    onClose={this.handleCloseAlert.bind(this)}
                />

                <ConfirmDialog
                    open={this.props.showConfirm}
                    title={this.props.confirmTitle}
                    text={this.props.confirmText}
                    target={this.props.confirmTarget}
                    buttonTrueText={Texts.CONFIRM[this.props.profile.languageString]}
                    buttonFalseText={Texts.CANCEL[this.props.profile.languageString]}
                    onTrueClick={this.handleConfirmConfirm.bind(this)}
                    onFalseClick={this.handleCancelConfirm.bind(this)}
                />

            </MuiThemeProvider>
        );
  }
}

function mapStateToProps(state) {
    return {
        showLoadMask: state.global.showLoadMask,

        showNotificationSnackbar: state.global.showNotificationSnackbar,
        notificationSnackbarText: state.global.notificationSnackbarText,

        showAlert: state.global.showAlert,
        alertTitle: state.global.alertTitle,
        alertText: state.global.alertText,

        showConfirm: state.global.showConfirm,
        confirmTitle: state.global.confirmTitle,
        confirmText: state.global.confirmText,
        confirmTarget: state.global.confirmTarget,
        confirmCallBackFunc: state.global.confirmCallBackFunc,
        confirmCallBackProps: state.global.confirmCallBackProps,

        profile: state.global.profile,

        selectedRoute: state.global.selectedRoute,
        keepPrevRouteSettings: state.global.keepPrevRouteSettings,
        settingsToggleActive: state.global.settingsToggleActive,

        video: state.video.video
    };
}

export default withRouter(connect(mapStateToProps, {

    globalDismissNotificationSnackbar,
    globalDismissAlertDialog,
    globalDismissConfirmDialog,

    globalSetNavigation,
    globalSetMobileDrawerIsOpen,

    globalReset
})(App));