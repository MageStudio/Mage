// returns a copy of the original map without the specified keys
// export const omit = (keys, map) => {
//     return keys.reduce((o, k) => (({ [k]: _, ...r } = o), r), map);
// };

export const omit = (keys, map) =>
    keys.reduce((acc, key) => {
        const { [key]: value, ...rest } = acc;
        return rest;
    }, map);

const isSerializable = value =>
    !(value === null || value === undefined || typeof value !== "object");

const deepSerialize = obj => {
    if (!isSerializable(obj)) {
        return obj;
    }
    if (obj?.toJSON && typeof obj.toJSON === "function") {
        return obj.toJSON();
    }
    if (Array.isArray(obj)) {
        return obj.map(item => deepSerialize(item));
    }
    const result = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Serialize and parse each property
            const value = deepSerialize(obj[key]);
            result[key] = isSerializable(value) ? JSON.parse(JSON.stringify(value)) : value;
        }
    }
    return result;
};
