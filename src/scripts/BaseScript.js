export default class BaseScript {

    __check() { return true; }

    __hasStarted(flag) { this.hasStarted = flag; }

    constructor(name) {
        this.__name = name || this.contructor.name;
        this.hasStarted = false;
    }

    name() {
        return this.__name;
    }

    start() {}

    update(dt) {}

    onDispose() {}

    toJSON() {
        return {
            name: this.name()
        }
    }
}
