import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

class ConfirmDialog extends React.Component {

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
                            { this.props.text }
                            <br />
                            <br />
                            <span style={{textAlign: "center"}}>
                                { this.props.target }
                            </span>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>

                        <Button onClick={this.props.onFalseClick} color="secondary" variant={"contained"}>
                            {this.props.buttonFalseText}
                        </Button>

                        <Button onClick={this.props.onTrueClick} color="primary" variant={"contained"} autoFocus>
                            {this.props.buttonTrueText}
                        </Button>

                    </DialogActions>
                </Dialog>

            </div>
        );
    }
}

ConfirmDialog.defaultProps = {
    open: false,
    title: "",
    text: "",
    target: "",
    buttonTrueText: "OK",
    buttonFalseText: "Cancel",
};


ConfirmDialog.propTypes = {
    open: PropTypes.bool,
    title: PropTypes.string,
    text: PropTypes.string,
    target: PropTypes.string,
    buttonTrueText: PropTypes.string,
    buttonFalseText: PropTypes.string,
    onTrueClick: PropTypes.func,
    onFalseClick: PropTypes.func
};

export default ConfirmDialog;