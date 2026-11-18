// GameRunner is referenced only inside functions: GameRunner imports State, so a top-level
// use would be a circular-import hazard.
import GameRunner from "../runner/GameRunner";

const SAVE_VERSION = 1;
const KEY_PREFIX = "mage:save:";
const DEFAULT_SLOT = "default";
const ADAPTER_METHODS = ["getItem", "setItem", "removeItem", "keys"];

const unavailable = () => new Error("mage.state.save: localStorage is not available");

const getLocalStorage = () => {
    try {
        if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
    } catch {
        // Access to localStorage can throw (blocked site data); treat it as unavailable.
    }

    throw unavailable();
};

export const createLocalStorageAdapter = () => ({
    getItem: key => getLocalStorage().getItem(key),
    setItem: (key, value) => getLocalStorage().setItem(key, value),
    removeItem: key => getLocalStorage().removeItem(key),
    keys: () => {
        const storage = getLocalStorage();
        const keys = [];

        for (let i = 0; i < storage.length; i++) {
            keys.push(storage.key(i));
        }

        return keys;
    },
});

export const assertAdapter = adapter => {
    ADAPTER_METHODS.forEach(method => {
        if (!adapter || typeof adapter[method] !== "function") {
            throw new TypeError(`mage.state.setStorage: adapter is missing "${method}"`);
        }
    });
};

const keyFor = slot => `${KEY_PREFIX}${slot}`;

const parseRecord = raw => {
    const record = JSON.parse(raw);

    if (!record || record.version !== SAVE_VERSION) {
        throw new Error(`mage.state.load: unsupported save version ${record && record.version}`);
    }

    return record;
};

export const save = (state, slot = DEFAULT_SLOT) => {
    const record = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        path: GameRunner.getCurrentPath(),
        game: state.get("game"),
    };

    state._storage.setItem(keyFor(slot), JSON.stringify(record));

    return record;
};

export const load = (state, slot = DEFAULT_SLOT) => {
    const raw = state._storage.getItem(keyFor(slot));

    if (raw === null || raw === undefined) return null;

    const record = parseRecord(raw);

    state.hydrate({ version: 1, game: record.game, level: {} });

    return { path: record.path, timestamp: record.timestamp };
};

export const listSaves = state => {
    const storage = state._storage;

    return storage
        .keys()
        .filter(key => typeof key === "string" && key.startsWith(KEY_PREFIX))
        .map(key => {
            try {
                const { path, timestamp } = JSON.parse(storage.getItem(key));

                return { slot: key.slice(KEY_PREFIX.length), path, timestamp };
            } catch {
                return null;
            }
        })
        .filter(Boolean)
        .sort((a, b) => b.timestamp - a.timestamp);
};

export const deleteSave = (state, slot) => {
    state._storage.removeItem(keyFor(slot));
};
