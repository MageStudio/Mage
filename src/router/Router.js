import GameRunner from '../runner/GameRunner';
import AssetsManager from "../base/AssetsManager";
import util from '../base/util';
import Config from "../base/config";

const ROOT = '/';
const DIVIDER = '/';
const HASH = '#';

class Router {

    constructor() {
        // create new GameRunner
        this.runner = new GameRunner();
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

    static extractLocationHash() {
        if (location) {
            return Router.cleanRoute(location.hash);
        }

        return Router.cleanRoute(ROOT);
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

        if (this.isValidRoute(hash)) {
            this.runner.start(hash, this.getConfiguration(), this.getSelector());
        }
    }

    on(route, classname) {
        // call regitser on runner
        const path = Router.cleanRoute(route.replace('/', '#'));
        if (this.runner.register(path, classname)) {
            this.routes.push(route);
        }
    }

    start(config, assets, selector) {
        return new Promise((resolve, reject) => {
            // we should get all assets first then do the rest
            Config.setConfig(config);
            Config.setContainer(selector);

            util.start();
            AssetsManager.setAssets(assets);

            util.checker
                .check(this.handleSuccess, this.handleFailure)
                .then(() => AssetsManager.load())
                .then(() => {
                    // starts listening
                    if (window) {
                        window.addEventListener('hashchange', this.handleHashChange, false);
                    }
                    // store configuration
                    this.storeConfiguration(config);
                    this.storeSelector(selector);

                    // check current path
                    const currentHash = Router.extractLocationHash();

                    if (this.isValidRoute(currentHash)) {
                        // if path is matching something starts that
                        this.runner.start(currentHash, this.getConfiguration(), this.getSelector())
                            .then(resolve);
                    } else {
                        this.runner.start('/', this.getConfiguration(), this.getSelector())
                            .then(resolve);
                    }
                });
        });
    }
}

export default new Router();