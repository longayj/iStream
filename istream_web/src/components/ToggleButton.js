import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

const styles = theme => {
    //TODO TROUVER COMMENT AVOIR BLANC OU NOIR EN FONCTION
    return {
        active: {
            backgroundColor: theme.palette.type === "dark" ?
                theme.palette.common.white : theme.palette.common.black,
            color: theme.palette.primary.main
        },
        inactive: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.type === "dark" ?
                theme.palette.common.white : theme.palette.common.black
        }
    };
};

class ToggleButton extends React.Component {

    handleOnClick() {
        if (this.props.onStateChange !== undefined) {
            this.props.onStateChange(!this.props.isActive);
        }
    }

    render() {

        const { classes } = this.props;

        const AdaptedButton = this.props.icon ? IconButton : Button;

        return (
            <AdaptedButton
                onClick={this.handleOnClick.bind(this)}
                className={this.props.isActive ? classes.active : classes.inactive}
            >
                {this.props.children}
            </AdaptedButton>
        )
    }
}

ToggleButton.defaultProps = {
    icon: false,
    isActive: false
};

ToggleButton.propTypes = {
    classes: PropTypes.object.isRequired,
    onStateChange: PropTypes.func,
    icon: PropTypes.bool,
    isActive: PropTypes.bool
};

export default withStyles(styles, { withTheme: true })(ToggleButton);