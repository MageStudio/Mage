import {
    UI_LOADING_SCREEN
} from './types';

export const showLoadingScreen = () => ({
    type: UI_LOADING_SCREEN,
    loadingScreenVisible: true
});

export const hideLoadingScreen = () => ({
    type: UI_LOADING_SCREEN,
    loadingScreenVisible: false
});