import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

class EnsureLoggedInContainer extends React.Component {

    render() {
        if (this.props.profile.auth === true) {

            return this.props.children;

        } else {

            return <Redirect to={"/auth"} />;

        }
    }
}

function mapStateToProps(state) {
    return {
        profile: state.global.profile
    };
}

export default connect(mapStateToProps, {

})(EnsureLoggedInContainer);