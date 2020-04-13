import {
    SAVE_STARTED,
    SAVE_ERROR,
    SAVE_COMPLETED,
    LOAD_STARTED,
    LOAD_COMPLETED,
    LOAD_ERROR
} from '../actions/types';

const DEFAULT_STATE = {
    error: false,
    saving: false,
    loading: false,
    errorDetails: '',
    sceneName: '',
    currentPath: '/',
    timestamp: ''
}

export default (state = DEFAULT_STATE, action = {}) => {
    switch(action.type) {
        case SAVE_STARTED:
            return {
                ...state,
                saving: true
            };
        case SAVE_COMPLETED:
            return {
                ...state,
                saving: false,
                error: false,
                sceneName: action.currentScene,
                currentPath: action.currentPath,
                timestamp: action.timestamp
            }
        case SAVE_ERROR:
            return {
                ...state,
                saving: false,
                error: true,
                errorDetails: action.errorDetails
            };
        case LOAD_STARTED:
            return {
                ...state,
                loading: true
            };
        case LOAD_COMPLETED:
            return {
                ...state,
                loading: false,
                error: false
            };
        case LOAD_ERROR:
            return {
                ...state,
                loading: false,
                error: true,
                errorDetails: action.errorDetails
            }
        default:
            return state;
    }
}
