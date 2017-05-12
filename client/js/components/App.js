import React, {Component} from 'react';
import TopBar from './TopBar';
import Feed from './Feed';

export default class App extends Component {
    render() {
        return (
            <div>
                <TopBar/>
                <Feed/>
                <Feed/>
            </div>
        );
    }
}
