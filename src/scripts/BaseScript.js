export default class BaseScript {
    __check() {
        return true;
    }

    __isStatic() {
        return false;
    }

    __hasStarted() {
        return this.hasStarted;
    }

    __isDisposed() {
        return this.isDisposed;
    }

    __setStartedFlag(flag) {
        this.hasStarted = flag;
    }

    __setDisposedFlag(flag) {
        this.isDisposed = flag;
    }

    constructor(name) {
        this.__name = name || this.constructor.name;
        this.hasStarted = false;
        this.isDisposed = false;
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
            name: this.name(),
        };
    }
}
