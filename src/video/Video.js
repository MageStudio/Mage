class Video {

    constructor() {}

    load() { return Promise.resolve(); }
}

const engine = new Video();

export default engine;
