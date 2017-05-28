import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import allReducers from './reducers/allReducers';
import { Router, Route, browserHistory } from 'react-router';
import App from './components/App';
import Splash from './components/Splash';

const loggedIn = () => {
    return true;
};

const requireAuth = (nextState, replace) => {
    if (loggedIn()) {
        replace({
            pathname: '/login'
        });
    }
};

const routes = (
    <Provider store={createStore(allReducers)}>
        <Router history={browserHistory}>
            <Route path="/" component={App} onEnter={requireAuth}/>
            <Route path="login" component={Splash}/>
        </Router>
    </Provider>
);

ReactDOM.render(routes, document.getElementById('main'));
