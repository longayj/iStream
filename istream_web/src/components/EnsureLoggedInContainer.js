import React from 'react';
import { connect } from 'react-redux';
import {Redirect, withRouter} from 'react-router-dom';
import CommunicationApi from "../utils/CommunicationApi";

import {
    globalSetNavigation,
    globalAuthSuccess,
    globalAuthFailure
} from "../redux/actions/globalActions";
import HttpMethods from "../constants/HttpMethods";
import Paths from "../constants/Paths";

class EnsureLoggedInContainer extends React.Component {

    componentWillMount() {
        if (CommunicationApi.checkToken()) {
            this.getUserProfile(CommunicationApi.getTokenId());
        } else {
            this.props.globalAuthFailure();
        }
    }

    getUserProfile(id) {
        let params = {};

        let me = this;

        let communication = new CommunicationApi(HttpMethods.GET, Paths.HOST + Paths.USER + "/" + id, params);
        communication.sendRequest(
            function (response) {

                if (response.status === 200) {

                    me.props.globalSetNavigation({
                        selectedRoute: "/",
                        keepPrevRouteSettings: "/",
                        settingsToggleActive: false
                    });

                    me.props.globalAuthSuccess({
                        id: response.data.id,
                        isAdmin: response.data.isAdmin,
                        username: response.data.username,
                        email: response.data.email,
                        pictureUrl: response.data.pictureUrl,
                        darkMode: response.data.darkMode,
                        primaryColor: response.data.primaryColor,
                        secondaryColor: response.data.secondaryColor,
                        languageString: response.data.language,
                        preferredStreamLanguage: response.data.preferredStreamLanguage,
                        preferredStreamQuality: response.data.preferredStreamQuality
                    });

                } else {

                    localStorage.removeItem("token");
                    me.props.globalReset();
                    me.props.history.push('/auth');

                }
            },
            function (error) {
                console.log(error);

                localStorage.removeItem("token");
                me.props.globalReset();
                me.props.history.push('/auth');
            },
            true
        );
    }

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

export default withRouter(connect(mapStateToProps, {
    globalSetNavigation,
    globalAuthSuccess,
    globalAuthFailure
})(EnsureLoggedInContainer));