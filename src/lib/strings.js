export const upperCaseFirst = (sentence = "") =>
    sentence && typeof sentence === "string" && sentence.length
        ? `${sentence[0].toUpperCase()}${sentence.slice(1, sentence.length)}`
        : "";

export const removeFirst = sentence => sentence.slice(1, sentence.length);

export const template = (strings, ...keys) => {
    return (...values) => {
        const dict = values[values.length - 1] || {};
        const result = [strings[0]];
        keys.forEach((key, i) => {
            const value = Number.isInteger(key) ? values[key] : dict[key];
            result.push(value, strings[i + 1]);
        });
        return result.join("");
    };
};
