import GameRunner from '../runner/GameRunner';
import Assets from "../core/Assets";
import util from '../lib/util';
import Config from "../core/config";

import { toQueryString, parseQuery } from '../lib/query';

const ROOT = '/';
const DIVIDER = '/';
const HASH = '#';
const EMPTY = '';

class Router {

    constructor() {
        this.routes = [];
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

    isValidRoute = (route) => this.routes.includes(route);

    handleFailure() {
        console.error('[Mage] Error when initialising app');
    }
    handleSuccess() {}

    handleHashChange = () => {
        const hash = Router.extractLocationHash();
        const query = Router.extractQuery();

        if (this.isValidRoute(hash)) {
            GameRunner.start(hash, query);
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
            window.addEventListener('hashchange', this.handleHashChange, false);
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

    start(config, assets, selector) {
        return new Promise((resolve, reject) => {
            Config.setConfig(config);
            Config.setContainer(selector);

            util.start();
            Assets.setAssets(assets);

            util.checker
                .checkFeatures(this.handleSuccess, this.handleFailure)
                .then(Assets.load)
                .then(() => {
                    this.setHashChangeListener();
                    this.storeConfiguration(config);
                    this.storeSelector(selector);

                    const currentHash = Router.extractLocationHash();
                    const query = Router.extractQuery();

                    if (this.isValidRoute(currentHash)) {
                        GameRunner
                            .start(currentHash, query)
                            .then(resolve);
                    } else {
                        GameRunner
                            .start(ROOT, query)
                            .then(resolve);
                    }
                });
        });
    }
}

export default new Router();
