import React, {Component} from 'react';
import {header, dayCounter, friendNotifications} from '../styles/header.scss';
import ksBubble from '!!file!../assets/ks_bubble_light_blue.png';
import friendsIcon from '!!file!../assets/friends-icon.png';

export default class Header extends Component {
    render() {
        return(
            <div className={header}>
                <FriendNotifications/>
                <DayCounter/>
            </div>
        );
    }
}

class FriendNotifications extends Component {
    render() {
        return(
            <div className={friendNotifications}>
                <img src={friendsIcon}/>
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
