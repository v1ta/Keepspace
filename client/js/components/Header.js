import React, {Component} from 'react';
import {header, dayCounter} from '../styles/header.scss';
import ksBubble from 'file!../assets/ks_bubble_light_blue.png';

export default class Header extends Component {
    render() {
        return(
            <div className={header}>
                <DayCounter/>
            </div>
        );
    }
}

class DayCounter extends Component {
    render() {
        return (
            <div className={dayCounter}>
                <img src={ksBubble}/>
            </div>
        );
    }
}
