export const getWindow = () => {
    try {
        const win = window || global.window;

        return win;
    } catch {
        return null;
    }
};
