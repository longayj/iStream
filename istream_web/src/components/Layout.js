import React from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {
    globalSetMobileDrawerIsOpen
} from "../redux/actions/globalActions";

import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import Divider from '@material-ui/core/Divider';

import MenuIcon from '@material-ui/icons/Menu';

const drawerWidth = 175;

const styles = theme => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    grow: {
        flexGrow: 1,
    },
    appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.up('sm')]: {
            width: `calc(100% - ${drawerWidth}px)`,
        },
    },
    menuButton: {
        marginRight: 20,
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing.unit * 3,
    },
});

class Layout extends React.Component {

    constructor(props) {
        super(props);

        this.props.globalSetMobileDrawerIsOpen(false);
    }

    handleDrawerToggle() {
        this.props.globalSetMobileDrawerIsOpen(!this.props.mobileDrawerOpen);
    }

    render() {
        const { classes, theme } = this.props;

        const drawer = (
            <div>
                <div className={classes.toolbar} />
                <Divider />
                {this.props.navigationMenu}
            </div>
        );

        return (
            <div className={classes.root}>

                <CssBaseline />

                <AppBar position="fixed" className={classes.appBar}>

                    <Toolbar>

                        <IconButton
                            aria-label="Open drawer"
                            onClick={this.handleDrawerToggle.bind(this)}
                            className={classes.menuButton}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h4" color={"inherit"} noWrap>
                            {this.props.brand}
                        </Typography>

                        <div className={classes.grow} />

                        {this.props.appBarRight}

                        {this.props.logoutButton}

                    </Toolbar>

                </AppBar>

                <nav className={classes.drawer}>

                    <Hidden smUp implementation="css">

                        <Drawer
                            container={this.props.container}
                            variant="temporary"
                            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                            open={this.props.mobileDrawerOpen}
                            onClose={this.handleDrawerToggle.bind(this)}
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                            ModalProps={{
                                keepMounted: true,
                            }}
                        >
                            {drawer}
                        </Drawer>

                    </Hidden>

                    <Hidden xsDown implementation="css">

                        <Drawer
                            classes={{
                                paper: classes.drawerPaper,
                            }}
                            variant="permanent"
                            open
                        >
                            {drawer}
                        </Drawer>

                    </Hidden>

                </nav>
                <main className={classes.content}>

                    <div className={classes.toolbar} />
                    {this.props.children}

                </main>
            </div>
        );
    }
}

Layout.defaultProps = {
    brand: "",
    appBarRight: null,
    logoutButton: null,
    navigationMenu: null
};


Layout.propTypes = {
    classes: PropTypes.object.isRequired,
    container: PropTypes.object,
    theme: PropTypes.object.isRequired,
    brand: PropTypes.string,
    appBarRight: PropTypes.object,
    logoutButton: PropTypes.object,
    navigationMenu: PropTypes.object
};

function mapStateToProps(state) {
    return {
        mobileDrawerOpen: state.global.mobileDrawerOpen,
        profile: state.global.profile
    };
}

export default connect(mapStateToProps, {
    globalSetMobileDrawerIsOpen

})(withStyles(styles, { withTheme: true })(Layout));

