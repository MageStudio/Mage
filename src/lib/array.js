export const difference = (a, b) => {
    const s = new Set(b);
    return a.filter(x => !s.has(x));
};
