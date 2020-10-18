import {
    UI_LOADING_SCREEN
} from '../actions/types';

export const DEFAULT_STATE = {
    loadingScreenVisible: false
};

export default (state = DEFAULT_STATE, action = {}) => {
    switch(action.type) {
        case UI_LOADING_SCREEN:
            return {
                ...state,
                loadingScreenVisible: action.loadingScreenVisible
            };
        default:
            return state;
    }
};