import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';

const styles = theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    placeholder: {
        position: "absolute",
        top: "30%",
        left: "50%",
        height: 40
    },
});

class LoadMask extends React.Component {

    render() {

        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <div className={classes.placeholder}>

                    <Fade
                        in={this.props.show}
                        style={{
                            transitionDelay: this.props.show ? '800ms' : '0ms',
                        }}
                        unmountOnExit
                    >
                        <CircularProgress />
                    </Fade>

                </div>
            </div>
        );
    }
}

LoadMask.defaultProps = {
    show: false
};

LoadMask.propTypes = {
    classes: PropTypes.object.isRequired,
    show: PropTypes.bool
};

export default withStyles(styles, { withTheme: true })(LoadMask);