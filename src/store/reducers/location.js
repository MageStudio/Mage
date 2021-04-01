import { LOCATION_PATH_CHANGE } from "../actions/types";

const DEFAULT_STATE = {
    path: '/'
};

export default (state = DEFAULT_STATE, action = {}) => {
    switch(action.type) {
        case LOCATION_PATH_CHANGE:
            return {
                ...state,
                path: action.path
            };
        default:
            return state;
    }
}