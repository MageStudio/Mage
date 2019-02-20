const DEFAULT_NAME = 'defaultScript';

export default class BaseScript {

    constructor(name) {
        if (name) {
            this.__name = name;
        } else {
            this.__name = `${DEFAULT_NAME}_${Math.floor(Math.random() * 100)}`;
        }
    }

    name() {
        return this.__name;
    }

    start() {}

    update(dt) {}

    toJSON() {
        return {
            name: this.name()
        }
    }
}
