import { HASH, EMPTY } from "./constants";

export const hasLocation = () => window && window.location;

export const getLocationSearch = () => (
    hasLocation() ?
        location.search :
        EMPTY
)

export const setLocationSearch = search => {
    if (hasLocation()) {
        location.search = search;
    }
};

export const getLocationHash = () => (
    hasLocation() ?
        location.hash :
        HASH
);

export const setLocationHash = hash => {
    if (hasLocation()) {
        location.hash = hash;
    }
}