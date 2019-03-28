import React from 'react';

import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { BrowserRouter } from 'react-router-dom';

import reducers from '../redux/reducers';

import App from "./App";

const store = createStore(reducers);

class AppContainer extends React.Component {

    render() {
        return (
            <Provider store={store}>

                    <BrowserRouter>

                        <App />

                    </BrowserRouter>

            </Provider>
        );
    }
}

export default AppContainer;