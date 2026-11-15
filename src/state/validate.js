const hasOwn = Object.prototype.hasOwnProperty;

// Containers this module has already validated and frozen. Anything in here is
// known to be JSON-safe and acyclic, so it can be reused without being walked.
const trusted = new WeakSet();

export const isTrusted = value => trusted.has(value);

export const markTrusted = value => {
    trusted.add(value);

    return value;
};

// Assigning with `obj[key] = v` would change the prototype for the key "__proto__".
export const setOwn = (target, key, value) =>
    Object.defineProperty(target, key, {
        value,
        enumerable: true,
        writable: true,
        configurable: true,
    });

const describe = value => {
    if (value === undefined) return "undefined";
    if (typeof value === "number") return Number.isNaN(value) ? "NaN" : String(value);
    if (typeof value === "function") return "function";
    if (typeof value === "object") {
        const proto = Object.getPrototypeOf(value);
        const name = proto && proto.constructor && proto.constructor.name;

        return name || "object with a custom prototype";
    }

    return typeof value;
};

const fail = (method, path, found) => {
    throw new TypeError(
        `mage.state.${method}: value at "${path}" is not JSON-safe (found ${found})`,
    );
};

const walk = (value, path, method, ancestors) => {
    if (value === null) return value;

    switch (typeof value) {
        case "boolean":
        case "string":
            return value;
        case "number":
            return Number.isFinite(value) ? value : fail(method, path, describe(value));
        case "object":
            break;
        default:
            return fail(method, path, describe(value));
    }

    if (trusted.has(value)) return value;
    if (ancestors.has(value)) return fail(method, path, "a cycle");

    ancestors.add(value);

    let out;

    if (Array.isArray(value)) {
        out = new Array(value.length);
        for (let i = 0; i < value.length; i++) {
            // `i in value` is false for holes, which would otherwise read as undefined.
            out[i] = walk(i in value ? value[i] : undefined, `${path}.${i}`, method, ancestors);
        }
    } else {
        const proto = Object.getPrototypeOf(value);

        if (proto !== Object.prototype && proto !== null) {
            return fail(method, path, describe(value));
        }

        out = Object.create(proto);
        const keys = Object.keys(value);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            setOwn(out, key, walk(value[key], `${path}.${key}`, method, ancestors));
        }
    }

    ancestors.delete(value);

    return markTrusted(Object.freeze(out));
};

/**
 * Checks that `value` is JSON-safe and returns a deep-frozen copy of it.
 * Cost is proportional to the size of `value`. Containers that came out of the
 * store are reused as they are (they were validated when they went in).
 */
export const validateAndFreeze = (value, path, method = "set") =>
    walk(value, path, method, new Set());

export { hasOwn };
