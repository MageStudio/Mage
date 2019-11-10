/**
 * @author mrdoob / http://mrdoob.com/
 */

class Stats {

    constructor() {
        this.beginTime = (performance || Date).now();
        this.prevTime = this.beginTime;

        this.frames = 0;
        this.fps = 0;
        this.fpsMax = 100;

        this.memory = performance.memory.usedJSHeapSize / 1048576;
        this.memoryMax = performance.memory.jsHeapSizeLimit / 1048576;
    }

    init() {
        this.beginTime = (performance || Date).now();
    }

    getFPS() {
        this.frames++;
        const time = (performance || Date).now();

        if (time >= this.prevTime + 1000) {
            this.fps =  (this.frames * 1000)/(time - this.prevTime);
            this.prevTime = time;
            this.frames = 0;
        }

        this.beginTime = time;
    }

    getMemory() {
        this.frames++;
        const time = (performance || Date).now();

        if (time >= this.prevTime + 1000) {
            this.prevTime = time;
            this.frames = 0;
            this.memory = performance.memory.usedJSHeapSize / 1048576;
            this.memoryMax = performance.memory.jsHeapSizeLimit / 1048576;
        }

        this.beginTime = time;
    }

    update() {
        this.getFPS();
        this.getMemory();
    }
}

export default new Stats();
