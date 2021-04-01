import info from './info';
import storage from './storage';
import input from './input';
import network from './network';
import ui from './ui';
import location from './location';
import { createRootReducer } from './root';

export {
    info,
    input,
    storage,
    network,
    ui,
    location,
};

export default createRootReducer;
