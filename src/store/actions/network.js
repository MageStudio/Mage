import {
    NETWORK_CHANGED
} from './types';

export const networkChanged = isOnline => ({
    type: NETWORK_CHANGED,
    isOnline
});