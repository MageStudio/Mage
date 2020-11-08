export class Universe {

    constructor() {
        this.reality = {};
        this.realityUUID = {};
        this.worker = undefined;
    }

    get(id) {
        return this.reality[id];
    }

    getByUUID(uuid) {
        const id = this.realityUUID[uuid.toString()];

        if (id) {
            return this.get(id);
        }
    }

    getByTag(tagName) {
        const elements = [];
        this.forEach(element => {
            if (element.hasTag(tagName)) {
                elements.push(element);
            }
        });

        return elements;
    }

    set(id, value) {
        this.reality[id] = value;
    }

    reset = () => {
        this.reality = {};
        this.realityUUID = {};
    }

    storeUUIDToElementNameReference(uuid, name) {
        this.realityUUID[uuid] = name;
    }

    remove(id) {
        delete this.reality[id];
    }

    forEach = (callback) => {
        const keys = Object.keys(this.reality);

        keys.forEach(k => callback(this.reality[k]));
    };

    forEachAsync = (callback) => {
        const keys = Object.keys(this.reality);

        return new Promise(resolve => {
            Promise
                .all(keys.map(k => callback(this.reality[k])))
                .then(resolve);
        });
    };

    update(dt) {
        return new Promise(resolve => {
            Object
                .keys(this.reality)
                .forEach(k => this.reality[k].update(dt))
            resolve();
        });
    }

    bigfreeze = () => {
        this.forEach(o => o.dispose());
        this.reset();
    }

    toJSON() {
        const elements = Object.keys(this.reality)
            .map(k => this.get(k))
            .filter(element => element.serializable && element.isMesh())
            .map(element => element.toJSON());

        return { elements }
    }
}

export default new Universe();
