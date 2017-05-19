import React, {Component} from 'react';
import Header from './Header';
import Feed from './Feed';

export default class App extends Component {
    render() {
        return (
            <div>
                <Header/>
                <Feed feedName="World"/>
                <Feed feedName="User"/>
            </div>
        );
    }
}
