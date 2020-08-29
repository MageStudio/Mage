import { dispatch } from "../store/Store";
import { networkChanged } from "../store/actions/network";

const handleOnline = () => dispatch(networkChanged(true));
const handleOffline = () => dispatch(networkChanged(false));

export const listenToNetworkChanges = () => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
};

export const stopListeningToNetworkChanged = () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
};