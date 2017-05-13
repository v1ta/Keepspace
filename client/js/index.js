import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import allReducers from './reducers/allReducers';
import App from './components/App';
import Splash from './components/Splash';

const loggedIn = false;

let page = loggedIn ? (<App/>) : (<Splash/>);

ReactDOM.render(
    <Provider store={createStore(allReducers)}>
        {page}
    </Provider>,
    document.getElementById('main')
);
