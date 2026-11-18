import { hasOwn, markTrusted, setOwn, validateAndFreeze } from "./validate";

const SCOPES = ["game", "level"];
const INDEX = /^(0|[1-9]\d*)$/;

export const pathToString = segments => segments.join(".");

/**
 * Turns a dotted string or an array of segments into an array of string segments.
 * The first segment must be "game" or "level".
 */
export const parsePath = path => {
    let segments;

    if (typeof path === "string") {
        segments = path === "" ? [] : path.split(".");
    } else if (Array.isArray(path)) {
        segments = path.map(String);
    } else {
        throw new TypeError("mage.state: path must be a string or an array of segments");
    }

    if (segments.length === 0) {
        throw new Error("mage.state: path must not be empty");
    }

    if (segments.some(segment => segment === "")) {
        throw new Error("mage.state: path must not contain empty segments");
    }

    if (!SCOPES.includes(segments[0])) {
        throw new Error(
            `mage.state: path must start with "game" or "level" (got "${pathToString(segments)}")`,
        );
    }

    return segments;
};

const own = (node, key) => (hasOwn.call(node, key) ? node[key] : undefined);

const isContainer = value => value !== null && typeof value === "object";

const typeName = value => {
    if (value === null) return "null";

    return `a ${typeof value}`;
};

// Reads `key` of `node`. Arrays only expose canonical numeric indexes.
const child = (node, key) => {
    if (Array.isArray(node)) {
        return INDEX.test(key) && Number(key) < node.length ? node[Number(key)] : undefined;
    }

    return own(node, key);
};

export const getIn = (root, segments) => {
    let node = root;

    for (let i = 0; i < segments.length; i++) {
        if (!isContainer(node)) return undefined;
        node = child(node, segments[i]);
    }

    return node;
};

const withChild = (node, key, value) => {
    if (Array.isArray(node)) {
        const copy = node.slice();
        copy[Number(key)] = value;

        return markTrusted(Object.freeze(copy));
    }

    const copy = Object.create(Object.getPrototypeOf(node));
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
        setOwn(copy, keys[i], node[keys[i]]);
    }
    setOwn(copy, key, value);

    return markTrusted(Object.freeze(copy));
};

const write = (node, segments, depth, value, method) => {
    const key = segments[depth];

    if (Array.isArray(node)) {
        if (!INDEX.test(key)) {
            throw new Error(
                `mage.state.${method}: "${pathToString(segments.slice(0, depth))}" is an array, can't set "${key}" on it`,
            );
        }

        if (Number(key) > node.length) {
            throw new Error(
                `mage.state.${method}: index ${key} is past the end of "${pathToString(segments.slice(0, depth))}" (length ${node.length})`,
            );
        }
    }

    const current = child(node, key);
    let next;

    if (depth === segments.length - 1) {
        next = value;
    } else {
        let below = current;

        if (below === undefined) {
            below = {};
        } else if (!isContainer(below)) {
            throw new Error(
                `mage.state.${method}: "${pathToString(segments.slice(0, depth + 1))}" is ${typeName(below)}, can't set "${segments[depth + 1]}" on it`,
            );
        }

        next = write(below, segments, depth + 1, value, method);
    }

    if (
        next === current &&
        (Array.isArray(node) ? Number(key) < node.length : hasOwn.call(node, key))
    ) {
        return node;
    }

    return withChild(node, key, next);
};

/**
 * Returns a new root with `value` stored at `segments`. Untouched branches are
 * shared with `root`. Returns `root` itself when nothing changes.
 * `segments` must already have been through `parsePath`.
 */
export const setIn = (root, segments, value, method = "set") => {
    const frozen = validateAndFreeze(value, pathToString(segments), method);

    return write(root, segments, 0, frozen, method);
};

const erase = (node, segments, depth) => {
    const key = segments[depth];
    const last = depth === segments.length - 1;

    if (Array.isArray(node)) {
        if (!INDEX.test(key) || Number(key) >= node.length) return node;
    } else if (!hasOwn.call(node, key)) {
        return node;
    }

    if (last) {
        if (Array.isArray(node)) {
            const copy = node.slice();
            copy.splice(Number(key), 1);

            return markTrusted(Object.freeze(copy));
        }

        const copy = Object.create(Object.getPrototypeOf(node));
        const keys = Object.keys(node);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] !== key) setOwn(copy, keys[i], node[keys[i]]);
        }

        return markTrusted(Object.freeze(copy));
    }

    const current = child(node, key);

    if (!isContainer(current)) return node;

    const result = erase(current, segments, depth + 1);

    return result === current ? node : withChild(node, key, result);
};

/**
 * Returns a new root without the value at `segments`, or `root` itself when the
 * path is missing. Removing a scope itself throws.
 */
export const removeIn = (root, segments, method = "remove") => {
    if (segments.length === 1) {
        throw new Error(`mage.state.${method}: can't remove "${segments[0]}"`);
    }

    return erase(root, segments, 0);
};
