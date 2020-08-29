import {
    NETWORK_CHANGED
} from '../actions/types';

const DEFAULT_STATE = {
    isOnline: true
};

export default (state = DEFAULT_STATE, action) => {
    switch(action.type) {
        case NETWORK_CHANGED:
            return {
                ...state,
                isOnline: action.isOnline
            }
        default:
            return state;
    }
};