import GameRunner from '../runner/GameRunner';
import Assets from "../core/Assets";
import Features from '../lib/features';
import * as network from '../lib/network';
import Config from "../core/config";

import { toQueryString, parseQuery } from '../lib/query';
import { FEATURE_NOT_SUPPORTED } from '../lib/messages';
import {
    ROOT,
    HASH,
    BEFORE_UNLOAD,
    HASH_CHANGE,
    DEFAULT_SELECTOR
} from '../lib/constants';

import * as UI from '../ui';
import {
    setLocationHash,
    getLocationHash,
    getLocationSearch,
    setLocationSearch
} from '../lib/location';

class Router {

    constructor() {
        this.routes = [];
        this.currentLevel = ROOT;
    }

    static extractLocationHash() {
        return Router.cleanRoute(getLocationHash());
    }

    static extractQuery() {
        return parseQuery(getLocationSearch());
    }

    static areRoutesIdentical = (routeA, routeB) => (
        routeA === routeB
    );

    static cleanRoute(route = HASH) {
        if (!route.length) {
            return ROOT;
        }
        
        return route.split(HASH)[1];
    }

    setCurrentLevel = hash => {
        this.currentLevel = hash;

        Assets.setCurrentLevel(this.currentLevel);
    };

    getCurrentLevel = () => this.currentLevel; 

    isValidRoute = (route) => this.routes.includes(route);

    handleHashChange = () => {
        UI.requestLoadingScreen();
        this.startLevel();
    };

    on(route, classname) {
        if (GameRunner.register(route, classname)) {
            this.routes.push(route);
        }
    }

    goTo(path, options, origin = this.getCurrentLevel()) {
        if (!Router.areRoutesIdentical(origin, path)) {
            if (options) {
                setLocationSearch(toQueryString(options));
            }
            setLocationHash(path);
        }
    }

    setGlobalWindowEventsListeners() {
        network.listenToNetworkChanges();

        window.addEventListener(HASH_CHANGE, this.handleHashChange, false);
        window.addEventListener(BEFORE_UNLOAD, this.stop);
    }

    removeGlobaWindowEventsListeners() {
        network.stopListeningToNetworkChanges();

        window.removeEventListener(HASH_CHANGE, this.handleHashChange);
        window.removeEventListener(BEFORE_UNLOAD, this.stop);
    }

    stop = () => {
        this.removeGlobaWindowEventsListeners();

        UI.unmount();
    }

    startLevel = () => {
        const hash = Router.extractLocationHash();
        const query = Router.extractQuery();

        UI.dispatchLocationPathChange(hash);

        if (this.isValidRoute(hash)) {
            this.setCurrentLevel(hash);

            return Assets
                .load(hash)
                .then(() => GameRunner.start(hash, query))
                .then(level => {
                    UI.removeLoadingScreen();
                    return Promise.resolve(level);
                });
        } else {
            this.goTo(ROOT, query, hash);
            return Promise.resolve(null);
        }
    }

    handleStartError = (e) => {
        if (e instanceof Array) {
            const features = e.map(({ name }) => name);
            console.error(FEATURE_NOT_SUPPORTED.concat(features))
        } else {
            console.error(e);
        }
    }

    start(config, assets) {
        const {
            selector = DEFAULT_SELECTOR
        } = config;

        const hash = Router.extractLocationHash();
        if (!this.isValidRoute(hash)) {
            setLocationHash(ROOT);
        }

        this.setGlobalWindowEventsListeners();

        Config.setConfig(config);
        Config.setContainer(selector);

        UI.requestLoadingScreen();
        UI.mount();

        Features.setUpPolyfills();
        Assets.setAssets(assets);

        return Features
            .checkSupportedFeatures()
            .then(() => Assets.load(hash))
            .then(this.startLevel)
            .catch(this.handleStartError);
    }
}

export default new Router();
