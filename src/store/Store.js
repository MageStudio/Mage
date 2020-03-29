// creates the store
import * as redux from 'redux';
import stats from './reducers/stats';

import {
    NEW_REDUCER_ERROR,
    STORE_DOESNT_EXIST
} from '../lib/messages';

let store;
const reducers = {
    stats
};
let unsubscribe;
const subscribers = {};

const combineReducers = () => {
    return redux.combineReducers(reducers);
}

export const addReducer = (name, reducer) => {
    if (name && reducer) {
        reducers[name] = reducer;
    } else {
        console.log(NEW_REDUCER_ERROR, name, reducer);
    }
};

export const getState = () => {
    if (store) {
        return store.getState();
    } else {
        console.log(STORE_DOESNT_EXIST);
    }
};

export const getStore = () => store;

const handleSubscriptions = () => {
    Object
        .keys(subscribers)
        .forEach((path) => {
            if (subscribers[path] && subscribers[path].onStateChange) {
                subscribers[path].onStateChange(getState());
            }
        })
}

export const createStore = (initialState = {}) => {
    if (!store) {
        store = redux.createStore(combineReducers(), initialState);
        unsubscribe = store.subscribe(handleSubscriptions);
    }
};

export const subscribeScene = (path, scene) => {
    if (store) {
        subscribers[path] = scene;
    }
}

export const unsubScribeScene = (path) => {
    delete subscribers[path];
}

export const unsubscribeAll = () => unsubscribe();

export const dispatch = (action) => {
    if (store && action) {
        store.dispatch(action);
    }
}
