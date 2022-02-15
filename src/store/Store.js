// creates the store
import * as redux from 'redux';
import thunk from 'redux-thunk';

import createRootReducer, * as DEFAULT_REDUCERS from './reducers';

import { STORE_DOESNT_EXIST } from '../lib/messages';
import { NOOP } from '../lib/functions';

let store,
    latestAction;

let unsubscribe = NOOP;
let subscribers = [];

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

const combineReducers = (reducers = {}) => (
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

const handleSubscriptions = (...args) => (
    subscribers
        .forEach((subscriber) => {
            if (subscriber.onStateChange) {
                subscriber.onStateChange(getState(), latestAction);
            }
        })
)

export const createStore = (reducers, initialState = {}, debug = false) => {
    const storeReducers = combineReducers(reducers);

    if (!store) {
        store = redux.createStore(
            createRootReducer(storeReducers),
            initialState,
            applyMiddlewares(defaultMiddleware(), debug)
        );
        unsubscribe = store.subscribe(handleSubscriptions);
    }
};

export const subscribe = subscriber => subscribers.push(subscriber);
export const unsubscribeAll = () => {
    unsubscribe();
    subscribers = [];
}

export const dispatch = (action) => {
    if (store && action) {
        store.dispatch(action);
        latestAction = action;
    }
}
