import {
    RESET
} from '../actions/types';

export const createRootReducer = (combinedReducer) => (state, action) => {
    switch (action.type) {
        case RESET:
            if (Object.keys(action.state).length > 0) {
                return {
                    ...state,
                    ...action.state
                };
            } else {
                return state;
            }
        default:
            return combinedReducer(state, action);
    }
};
