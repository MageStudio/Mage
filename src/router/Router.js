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
    HASH_CHANGE
} from '../lib/constants';


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
        const hash = Router.extractLocationHash();
        const query = Router.extractQuery();

        if (this.isValidRoute(hash)) {
            this.setCurrentLevel(hash);
            if (!Assets.areLevelAssetsLoaded(hash)) {
                Assets
                    .load(hash)
                    .then(() => GameRunner.start(hash, query))
            } else {
                GameRunner.start(hash, query);
            }
        }
    };

    on(route, classname) {
        const path = Router.cleanRoute(route.replace(DIVIDER, HASH));
        if (GameRunner.register(path, classname)) {
            this.routes.push(route);
        }
    }

    setHashChangeListener = () => {
        if (window) {
            window.addEventListener(HASH_CHANGE, this.handleHashChange, false);
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
        window.addEventListener(BEFORE_UNLOAD, this.stop);
    }

    stop() {
        network.stopListeningToNetworkChanged();

        window.removeEventListener(HASH_CHANGE, this.handleHashChange);
    }

    start(config, assets, selector) {
        this.setGlobalWindowEventsListeners();

        return new Promise((resolve, reject) => {
            Config.setConfig(config);
            Config.setContainer(selector);

            network.listenToNetworkChanges();

            Features.setUpPolyfills();
            Assets.setAssets(assets);

            Features
                .checkSupportedFeatures()
                .then(Assets.load)
                .then(() => {
                    this.setHashChangeListener();
                    this.storeConfiguration(config);
                    this.storeSelector(selector);

                    const currentHash = Router.extractLocationHash();
                    const query = Router.extractQuery();

                    if (this.isValidRoute(currentHash)) {
                        this.setCurrentLevel(currentHash);
                        Assets
                            .load(currentHash)
                            .then(() => {
                                GameRunner
                                    .start(currentHash, query)
                                    .then(resolve);
                            });
                    } else {
                        Assets
                            .load(ROOT)
                            .then(() => {
                                GameRunner
                                    .start(ROOT, query)
                                    .then(resolve);
                            });
                    }
                })
                .catch((e) => {
                    if (e instanceof Array) {
                        const features = e.map(({ name }) => name);
                        console.error(FEATURE_NOT_SUPPORTED.concat(features))
                    } else {
                        console.error(e);
                    }
                    
                });
        });
    }
}

export default new Router();
