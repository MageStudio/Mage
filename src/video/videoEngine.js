class VideoEngine {

    constructor() {}

    load() { return Promise.resolve('video'); }
}

const engine = new VideoEngine();

export default engine;
