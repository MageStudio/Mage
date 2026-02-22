export class Universe {
    constructor() {
        this.reality = {}; // uuid -> element (primary storage)
        this.nameIndex = {}; // name -> uuid[] (reverse index for name lookups)
        this.worker = undefined;
    }

    get(id) {
        // Primary: lookup by UUID
        if (this.reality[id]) {
            return this.reality[id];
        }
        // Fallback: lookup by name (backward compat for user scripts)
        return this.getByName(id);
    }

    getByName(name) {
        const uuids = this.nameIndex[name];
        if (uuids && uuids.length > 0) {
            return this.reality[uuids[0]];
        }
    }

    getByUUID(uuid) {
        return this.reality[uuid];
    }

    find(element) {
        if (!element) return;

        // Traverse up the THREE.js parent chain to find the closest Mage entity.
        // This ensures that when clicking on a child mesh that's nested inside
        // a parent entity's body, we find the child entity (not the parent).
        let current = element;
        while (current) {
            // Check if any entity's body IS this object directly
            let found;
            this.forEach(el => {
                if (!found && el.hasBody() && el.getBody() === current) {
                    found = el;
                }
            });
            if (found) {
                return found;
            }
            current = current.parent;
        }

        // Fallback: use the original has() check for edge cases
        let fallback;
        this.forEach(el => {
            if (el.has(element) && !fallback) {
                fallback = el;
            }
        });

        return fallback;
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

    set(uuid, element) {
        this.reality[uuid] = element;

        // Maintain name index
        const name = element.getName ? element.getName() : undefined;
        if (name) {
            if (!this.nameIndex[name]) {
                this.nameIndex[name] = [];
            }
            if (!this.nameIndex[name].includes(uuid)) {
                this.nameIndex[name].push(uuid);
            }
        }
    }

    reset = () => {
        this.reality = {};
        this.nameIndex = {};
    };

    updateNameIndex(uuid, oldName, newName) {
        // Remove from old name's list
        if (oldName && this.nameIndex[oldName]) {
            this.nameIndex[oldName] = this.nameIndex[oldName].filter(u => u !== uuid);
            if (this.nameIndex[oldName].length === 0) {
                delete this.nameIndex[oldName];
            }
        }
        // Add to new name's list
        if (newName) {
            if (!this.nameIndex[newName]) {
                this.nameIndex[newName] = [];
            }
            if (!this.nameIndex[newName].includes(uuid)) {
                this.nameIndex[newName].push(uuid);
            }
        }
    }

    // @deprecated - indexing is now handled inside set()
    storeUUIDToElementNameReference(uuid, name) {
        // no-op: set() handles name indexing
    }

    // @deprecated - use updateNameIndex() instead
    replaceUUIDToElementNameReference(uuid, newName) {
        // no-op: use updateNameIndex() instead
    }

    remove(uuid) {
        const element = this.reality[uuid];
        if (element) {
            const name = element.getName ? element.getName() : undefined;
            if (name && this.nameIndex[name]) {
                this.nameIndex[name] = this.nameIndex[name].filter(u => u !== uuid);
                if (this.nameIndex[name].length === 0) {
                    delete this.nameIndex[name];
                }
            }
        }
        delete this.reality[uuid];
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
