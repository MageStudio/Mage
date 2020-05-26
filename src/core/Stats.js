/**
 * @author mrdoob / http://mrdoob.com/
 */
import { Subject } from 'rxjs';

class Stats {

    constructor() {
        this.beginTime = (performance || Date).now();
        this.prevTime = this.beginTime;

        this.frames = 0;
        this._fps = 0;
        this._fpsMax = 100;
        this.fps = new Subject();

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
            this._fps =  (this.frames * 1000)/(time - this.prevTime);
            this.prevTime = time;
            this.frames = 0;
            this.fps.next(this._fps);
        }

        this.beginTime = time;

        return this._fps;
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
