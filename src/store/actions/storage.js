import {
    SAVE_STARTED,
    SAVE_COMPLETED,
    SAVE_ERROR,
    LOAD_STARTED,
    LOAD_COMPLETED,
    LOAD_ERROR,
    RESET
} from './types';

import storage from '../../storage/storage';

export const saveStarted = () => ({
    type: SAVE_STARTED
});

export const saveCompleted = (sceneName, currentPath, timestamp) => ({
    type: SAVE_COMPLETED,
    timestamp,
    sceneName,
    currentPath
});

export const saveError = (errorDetails) => ({
    type: SAVE_ERROR,
    errorDetails
});

export const loadStarted = () => ({
    type: LOAD_STARTED
});

export const loadCompleted = () => ({
    type: LOAD_COMPLETED
});

export const loadError = (errorDetails) => ({
    type: LOAD_ERROR,
    errorDetails
});

export const resetState = (state) => ({
    type: RESET,
    state
});

export const saveGame = () => (dispatch) => {
    dispatch(saveStarted());

    storage
        .save()
        .then(({ sceneName, currentPath, timestamp }) =>
            dispatch(saveCompleted(sceneName, currentPath, timestamp))
        )
        .catch((e) => dispatch(saveError(e)));
};

export const loadGame = () => (dispatch) => {
    dispatch(loadStarted());

    storage
        .loadState()
        .then(state => dispatch(resetState(state)))
        .catch((e) => dispatch(loadError(e)));

    storage
        .loadCurrentPath()
        .then(currentPath => Router.goTo(currentPath, { loading: true }))
        .then(() => dispatch(loadCompleted()))
        .catch((e) => dispatch(loadError(e)));
}
