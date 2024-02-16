export const serializeMap = map => {
    const reducer = m =>
        [...m].reduce((a, v) => {
            a[v[0]] = v[1];
            return a;
        }, {});
    const replacer = (key, value) => (value instanceof Map ? reducer(value) : value);

    return JSON.stringify(map, replacer);
};

export const deserialiseMap = o => {
    const json = JSON.parse(o);
    const m = new Map();

    Object.keys(json).forEach(k => {
        m.set(k, json[k]);
    });

    return m;
};

export const populateMap = (map, data) => {
    Object.keys(data).forEach(k => {
        map.set(k, data[k]);
    });

    return map;
};
