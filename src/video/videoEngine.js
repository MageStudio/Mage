export class VideoEngine {

    constructor() {}

    load() { return Promise.resolve('video'); }
}

export default new VideoEngine();
