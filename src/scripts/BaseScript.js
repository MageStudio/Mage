export default class BaseScript {

    __check() { return true; }

    __hasStarted() { return this.hasStarted; }
    __isDisposed() { return this.isDisposed; }
    __setStartedFlag(flag) { this.hasStarted = flag; }
    __setDisposedFlag(flag) { this.isDisposed = flag; }

    constructor(name) {
        this.__name = name || this.contructor.name;
        this.hasStarted = false;
        this.options = {};
    }

    getName() {
        return this.__name;
    }

    start(element, options) {}

    update(dt) {}

    physicsUpdate(dt) {}

    onDispose() {}

    toJSON() {
        return {
            name: this.name()
        }
    }
}
