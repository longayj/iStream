import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
    close: {
        padding: theme.spacing.unit / 2,
    },
});

class NotificationSnackbar extends React.Component {

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Snackbar
                    anchorOrigin={{
                        vertical: this.props.verticalAnchorOrigin,
                        horizontal: this.props.horizontalAnchorOrigin,
                    }}
                    open={this.props.open}
                    autoHideDuration={this.props.autoHideDuration}
                    onClose={this.props.onClose}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={
                        <span id="message-id">{this.props.text}</span>
                    }
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            className={classes.close}
                            onClick={this.props.onClose}
                        >
                            <CloseIcon />
                        </IconButton>
                    ]}
                />
            </div>
        );
    }
}

NotificationSnackbar.defaultProps = {
    open: false,
    autoHideDuration: 6000,
    text: "",
    verticalAnchorOrigin: "bottom",
    horizontalAnchorOrigin: "right"
};

NotificationSnackbar.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool,
    autoHideDuration: PropTypes.number,
    text: PropTypes.string,
    verticalAnchorOrigin: PropTypes.string,
    horizontalAnchorOrigin: PropTypes.string,
    onClose: PropTypes.func
};

export default withStyles(styles, { withTheme: true })(NotificationSnackbar);