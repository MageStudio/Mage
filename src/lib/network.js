import { dispatch } from "../store/Store";
import { networkChanged } from "../store/actions/network";

const ONLINE_EVENT = 'online';
const OFFLINE_EVENT = 'offline';

const handleOnline = () => dispatch(networkChanged(true));
const handleOffline = () => dispatch(networkChanged(false));

export const listenToNetworkChanges = () => {
    window.addEventListener(ONLINE_EVENT, handleOnline);
    window.addEventListener(OFFLINE_EVENT, handleOffline);
};

export const stopListeningToNetworkChanges = () => {
    window.removeEventListener(ONLINE_EVENT, handleOnline);
    window.removeEventListener(OFFLINE_EVENT, handleOffline);
};