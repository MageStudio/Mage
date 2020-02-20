export default class BaseScript {

    __check() { return true; }

    __hasStarted(flag) { this.hasStarted = flag; }

    constructor(name) {
        if (name) {
            this.__name = name;
        } else {
            // this.__name = `${DEFAULT_NAME}_${Math.floor(Math.random() * 100)}`;
            this.__name = this.contructor.name;
        }

        this.hasStarted = false;
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
