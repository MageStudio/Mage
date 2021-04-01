import { LOCATION_PATH_CHANGE } from "./types";

export const locationPathChange = path => ({
    type: LOCATION_PATH_CHANGE,
    path
});