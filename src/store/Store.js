// creates the store
import * as redux from 'redux';
import thunk from 'redux-thunk';

import {
    info,
    storage,
    createRootReducer
} from './reducers';

import { STORE_DOESNT_EXIST } from '../lib/messages';

let store;
const DEFAULT_REDUCERS = {
    info,
    storage
};
let unsubscribe;
const subscribers = {};

const applyMiddlewares = (mdws, debug) => {
    if (debug) {
        return redux.compose(
            redux.applyMiddleware(...mdws),
            window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
        );
    }
    return redux.applyMiddleware(...mdws);
}

const defaultMiddleware = () => [thunk];

export const combineReducers = (reducers) => (
    redux.combineReducers({
        ...reducers,
        ...DEFAULT_REDUCERS
    })
);

export const getState = () => {
    if (store) {
        return store.getState();
    } else {
        console.log(STORE_DOESNT_EXIST);
    }
};

export const getStore = () => store;

const handleSubscriptions = () => (
    Object
        .keys(subscribers)
        .forEach((path) => {
            if (subscribers[path] && subscribers[path].onStateChange) {
                subscribers[path].onStateChange(getState());
            }
        })
)

export const createStore = (reducers = {}, initialState = {}, debug = false) => {
    if (!store) {
        store = redux.createStore(
            createRootReducer(reducers),
            initialState,
            applyMiddlewares(defaultMiddleware(), debug)
        );
        unsubscribe = store.subscribe(handleSubscriptions);
    }
};

export const subscribeScene = (path, scene) => subscribers[path] = scene;
export const unsubScribeScene = (path) => delete subscribers[path];
export const unsubscribeAll = () => unsubscribe();

export const dispatch = (action) => {
    if (store && action) {
        store.dispatch(action);
    }
}
