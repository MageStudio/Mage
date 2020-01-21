import App from '../base/App';

export default class GameRunner {

    constructor() {
        this.store = {};
        this.running = null;
    }

    has(path) {
        return Object.keys(this.store).includes(path);
    }

    get(path) {
        return this.store[path];
    }

    static isValidClassname(classname) {
        return typeof classname === 'function';
    }

    register(path, classname) {
        // check if classname is a function and if extends App
        try {
            if (GameRunner.isValidClassname(classname)) {
                this.store[path] = classname;
            } else {
                this.store[path] = App;
            }
            return true;
        } catch(e) {
            return false;
        }
    }

    start(path, config, selector) {
        return new Promise((resolve, reject) => {
            if (!this.has(path)) {
                return false;
            }

            if (this.running) {
                // do something with the current running instance
                this.running.stop();
            }
            // starting the right classname
            const classname = this.get(path);
            this.running = new classname(config, selector);

            // replicate what happens in the start method inside App
            this.running.preload()
                .then(() => {
                    this.running.prepareScene();
                    this.running.load();
                    // app is ready
                    resolve(this.running);
                })
                .catch((e) => console.log(e));
        })
    }
}


