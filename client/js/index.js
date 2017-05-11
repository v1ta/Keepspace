import React from 'React';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import allReducers from './reducers/allReducers';
import App from './components/App.jsx';

ReactDOM.render(
    <Provider store={createStore(allReducers)}>
        <App></App>
    </Provider>,
    document.getElementById('main')
)