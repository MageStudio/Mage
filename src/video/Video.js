class Video {

    constructor() {}

    load() { return Promise.resolve('video'); }
}

const engine = new Video();

export default engine;
