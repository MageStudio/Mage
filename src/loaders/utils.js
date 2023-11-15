export const isAbsoluteURL = url => {
    return /^(?:\w+:)\/\//.test(url);
};
