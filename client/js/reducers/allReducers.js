import {combineReducers} from 'redux';
import bubbleReducer from './bubblesReducer';

export default combineReducers({
    bubbles: bubbleReducer
});
