import { HASH } from "./constants";

export const hasLocation = () => window && window.location;

export const getLocationHash = () => (
    hasLocation() ?
        location.hash :
        HASH
);

export const setLocationHash = (hash = '', options = '') => {
    if (hasLocation()) {
        location.hash =`${hash}${options}`;
    }
}