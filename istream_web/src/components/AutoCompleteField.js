import React from 'react';
import PropTypes from 'prop-types';
import Downshift from 'downshift';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: 260,
    },
    container: {
        flexGrow: 1,
        position: 'relative',
    },
    paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0,
    },
    chip: {
        margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
    },
    inputRoot: {
        flexWrap: 'wrap',
    },
    inputInput: {
        width: 'auto',
        flexGrow: 1,
    },
    divider: {
        height: theme.spacing.unit * 2,
    },
});

class AutoCompleteField extends React.Component {

    renderInput(inputProps) {
        const { InputProps, classes, ref, ...other } = inputProps;

        return (
            <TextField
                InputProps={{
                    inputRef: ref,
                    classes: {
                        root: classes.inputRoot,
                        input: classes.inputInput,
                    },
                    ...InputProps,
                }}
                {...other}
            />
        );
    }

    renderSuggestion({ suggestion, index, itemProps, highlightedIndex, selectedItem }) {
        const isHighlighted = highlightedIndex === index;
        const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1;

        return (
            <MenuItem
                {...itemProps}
                key={suggestion.label}
                selected={isHighlighted}
                component="div"
                style={{
                    fontWeight: isSelected ? 500 : 400,
                }}
            >
                {suggestion.label}
            </MenuItem>
        );
    }

    getSuggestions(value) {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;
        let count = 0;

        if (this.props.filterSuggestions === true) {

            return inputLength === 0
                ? []
                : this.props.suggestions.filter(suggestion => {
                    const keep =
                        count < 5 && suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

                    if (keep) {
                        count += 1;
                    }

                    return keep;
                });

        } else {

            //TODO BOSSER CA
            return inputLength === 0
                ? []
                : this.props.suggestions.filter(suggestion => {
                    const keep =
                        count < 5;

                    if (keep) {
                        count += 1;
                    }

                    return keep;
                });
        }
    }

    render() {

        const { classes } = this.props;

        this.renderSuggestion.propTypes = {
            highlightedIndex: PropTypes.number,
            index: PropTypes.number,
            itemProps: PropTypes.object,
            selectedItem: PropTypes.string,
            suggestion: PropTypes.shape({ label: PropTypes.string }).isRequired,
        };

        return (
            <div className={classes.root}>
                <Downshift id="downshift-simple" onChange={this.props.onChange} value={this.props.value}>
                    {({
                          getInputProps,
                          getItemProps,
                          getMenuProps,
                          highlightedIndex,
                          inputValue,
                          isOpen,
                          selectedItem,
                      }) => (
                        <div className={classes.container}>
                            {this.renderInput({
                                fullWidth: true,
                                classes,
                                label: this.props.label,
                                required: this.props.required,
                                error: this.props.error,
                                InputProps: getInputProps({
                                    placeholder: this.props.placeholder,
                                    onChange: this.props.inputOnChange
                                }),
                            })}
                            <div {...getMenuProps()}>
                                {
                                    isOpen ? (
                                        <Paper className={classes.paper} square>
                                            {
                                                this.getSuggestions(inputValue).map((suggestion, index) =>
                                                    this.renderSuggestion({
                                                        suggestion,
                                                        index,
                                                        itemProps: getItemProps({ item: suggestion.label }),
                                                        highlightedIndex,
                                                        selectedItem,
                                                    }),
                                                )
                                            }
                                        </Paper>
                                    ) : (

                                        <div>
                                            {this.props.children}
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    )}
                </Downshift>
            </div>
        );
    }
}

AutoCompleteField.defaultProps = {
    filterSuggestions: true,
    suggestions: [],
    value: "",
    label: "",
    required: false,
    error: false,
    placeholder: ""
};

AutoCompleteField.propTypes = {
    classes: PropTypes.object.isRequired,
    filterSuggestions: PropTypes.bool,
    suggestions: PropTypes.array,
    value: PropTypes.string,
    label: PropTypes.string,
    required: PropTypes.bool,
    error: PropTypes.bool,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    inputOnChange: PropTypes.func
};

export default withStyles(styles, { withTheme: true })(AutoCompleteField);