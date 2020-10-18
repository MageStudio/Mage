import GameRunner from '../runner/GameRunner';
import Assets from "../core/Assets";
import Features from '../lib/features';
import * as network from '../lib/network';
import Config from "../core/config";

import { toQueryString, parseQuery } from '../lib/query';
import { FEATURE_NOT_SUPPORTED } from '../lib/messages';
import {
    ROOT,
    DIVIDER,
    HASH,
    EMPTY,
    BEFORE_UNLOAD,
    HASH_CHANGE, DEFAULT_SELECTOR
} from '../lib/constants';

import * as UI from '../ui';
import { dispatch } from '../store';
import { showLoadingScreen, hideLoadingScreen } from '../store/actions/ui';

class Router {

    constructor() {
        this.routes = [];
        this.currentLevel = ROOT;
    }

    storeConfiguration(configuration) {
        this.configuration = configuration;
    }

    getConfiguration() {
        return this.configuration;
    }

    storeSelector(selector) {
        this.selector = selector;
    }

    getSelector() {
        return this.selector;
    }

    static hasLocation() {
        return !!window &&
            !!window.location;
    }

    static extractLocationHash() {
        if (Router.hasLocation()) {
            return Router.cleanRoute(location.hash);
        }

        return Router.cleanRoute(ROOT);
    }

    static extractQuery() {
        if (Router.hasLocation()) {
            return parseQuery(location.search);
        }
    }

    static cleanRoute(route = HASH) {
        if (!route.length) {
            return ROOT;
        }
        const cleaned = route.split(HASH)[1];

        return DIVIDER.concat(cleaned);
    }

    setCurrentLevel = hash => {
        this.currentLevel = hash;

        Assets.setCurrentLevel(this.currentLevel);
    };

    getCurrentLevel = () => this.currentLevel; 

    isValidRoute = (route) => this.routes.includes(route);

    handleHashChange = () => {
        dispatch(showLoadingScreen());
        this.startLevel();
    };

    on(route, classname) {
        const path = Router.cleanRoute(route.replace(DIVIDER, HASH));
        if (GameRunner.register(path, classname)) {
            this.routes.push(route);
        }
    }

    goTo(path, options) {
        if (window &&
            window.location &&
            window.location.hash) {
                const { query } = options;
                if (query) {
                    window.location.search = toQueryString(query);
                }
                window.location.hash = path.replace(DIVIDER, EMPTY);
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
        window,removeEventListener(BEFORE_UNLOAD, this.stop);
    }

    stop = () => {
        this.removeGlobaWindowEventsListeners();

        UI.unmount();
    }

    startLevel = () => {
        const hash = Router.extractLocationHash();
        const query = Router.extractQuery();

        if (this.isValidRoute(hash)) {
            this.setCurrentLevel(hash);
            return Assets
                .load(hash)
                .then(() => GameRunner.start(hash, query))
                .then(() => dispatch(hideLoadingScreen()));
        } else {
            return Assets
                .load(ROOT)
                .then(() => GameRunner.start(ROOT, query))
                .then(() => dispatch(hideLoadingScreen()));
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

        this.storeConfiguration(config);
        this.storeSelector(selector);
        this.setGlobalWindowEventsListeners();

        Config.setConfig(config);
        Config.setContainer(selector);

        dispatch(showLoadingScreen());

        UI.mount();

        Features.setUpPolyfills();
        Assets.setAssets(assets);

        Features
            .checkSupportedFeatures()
            .then(Assets.load)
            .then(this.startLevel)
            .catch(this.handleStartError);
    }
}

export default new Router();
