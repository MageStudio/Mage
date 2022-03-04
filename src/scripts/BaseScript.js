export default class BaseScript {

    __check() { return true; }

    __hasStarted(flag) { this.hasStarted = flag; }

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
