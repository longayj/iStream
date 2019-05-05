import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class AlertDialog extends React.Component {

    render() {
        return (
            <div>

                <Dialog
                    open={this.props.open}
                    disableBackdropClick={true}
                    maxWidth={"sm"}
                    fullWidth={true}
                    onClose={this.props.onClose}
                >
                    <DialogTitle>
                        {
                            this.props.title
                        }
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {
                                this.props.text
                            }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>

                        <Button onClick={this.props.onClose} color="primary" variant={"contained"} autoFocus>
                            {this.props.buttonText}
                        </Button>

                    </DialogActions>
                </Dialog>

            </div>
        );
    }
}

AlertDialog.defaultProps = {
    open: false,
    title: "",
    text: "",
    buttonText: "OK"
};


AlertDialog.propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    text: PropTypes.string,
    buttonText: PropTypes.string,
    onClose: PropTypes.func
};

export default AlertDialog;