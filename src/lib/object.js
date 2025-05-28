// returns a copy of the original map without the specified keys
// export const omit = (keys, map) => {
//     return keys.reduce((o, k) => (({ [k]: _, ...r } = o), r), map);
// };

export const omit = (keys, map) =>
    keys.reduce((acc, key) => {
        const { [key]: value, ...rest } = acc;
        return rest;
    }, map);
