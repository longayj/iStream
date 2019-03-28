import React from 'react';
import { connect } from 'react-redux';

import Texts from "../../constants/Texts"

class Favorites extends React.Component {

    render() {
        return (
            <div>

                <div>
                    {Texts.FAVORITES[this.props.profile.languageString]}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        profile: state.global.profile
    };
}

export default connect(mapStateToProps, {

})(Favorites);