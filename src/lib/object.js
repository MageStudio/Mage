// returns a copy of the original map without the specified keys
// export const omit = (keys, map) => {
//     return keys.reduce((o, k) => (({ [k]: _, ...r } = o), r), map);
// };

export const omit = (keys, map) =>
    keys.reduce((acc, key) => {
        const { [key]: _value, ...rest } = acc;
        return rest;
    }, map);

const isPlainObject = value => value !== null && typeof value === "object" && !Array.isArray(value);

export const deepMerge = (base, override) => {
    if (!isPlainObject(base) || !isPlainObject(override)) {
        return override === undefined ? base : override;
    }

    const result = { ...base };
    for (const key of Object.keys(override)) {
        const baseValue = base[key];
        const overrideValue = override[key];
        result[key] =
            isPlainObject(baseValue) && isPlainObject(overrideValue)
                ? deepMerge(baseValue, overrideValue)
                : overrideValue;
    }
    return result;
};
