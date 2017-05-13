import React, {Component, PropTypes} from 'react';
import { feed, feedName } from '../styles/feed.scss';

export default class Feed extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className={feed}>
                <div className={feedName}>{this.props.feedName}</div>
            </div>
        );
    }
}

Feed.propTypes = {
    feedName: PropTypes.string.isRequired
};
