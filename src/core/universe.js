export class Universe {
    constructor() {
        this.reality = {};
        this.realityUUID = {};
        this.worker = undefined;
    }

    get(id) {
        return this.reality[id];
    }

    find(element) {
        if (!element) return;

        let found;
        this.forEach(el => {
            if (el.has(element) && !found) {
                found = el;
            }
        });

        return found;
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
    };

    storeUUIDToElementNameReference(uuid, name) {
        this.realityUUID[uuid] = name;
    }

    replaceUUIDToElementNameReference(uuid, newName) {
        delete this.realityUUID[uuid];
        this.realityUUID[uuid] = newName;
    }

    remove(id) {
        delete this.reality[id];
    }

    forEach = callback => {
        Object.keys(this.reality).forEach(k => callback(this.reality[k], k));
    };

    forEachAsync = callback => {
        const keys = Object.keys(this.reality);

        return new Promise(resolve => {
            Promise.all(keys.map(k => callback(this.reality[k], k))).then(resolve);
        });
    };

    update(dt) {
        Object.keys(this.reality).forEach(k => this.reality[k].update(dt));
    }

    onPhysicsUpdate(dt) {
        Object.keys(this.reality).forEach(k => this.reality[k].onPhysicsUpdate(dt));
    }

    bigfreeze = () => {
        this.forEach(o => {
            o && o.dispose && o.dispose();
        });
        this.reset();
    };

    toJSON(parseJSON = false) {
        const elements = Object.keys(this.reality)
            .map(k => this.get(k))
            .filter(
                element =>
                    element.isSerializable() &&
                    (element.isMesh() ||
                        element.isModel() ||
                        element.isScenery() ||
                        element.isParticle()),
            )
            .map(element => element.toJSON(parseJSON));

        return { elements };
    }
}

export default new Universe();
