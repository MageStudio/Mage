/**
 * @author mrdoob / http://mrdoob.com/
 */
import { Subject } from 'rxjs';
import features, { FEATURES } from '../lib/features';

const ONE_MB = 1048576;

class Stats {

    constructor() {
        this.beginTime = (performance || Date).now();
        this.prevTime = this.beginTime;

        this.frames = 0;
        this._fps = 0;
        this._fpsMax = 100;
        this.fps = new Subject();

        this.hasMemoryUsage = features.isFeatureSupported(FEATURES.MEMORY);

        if (this.hasMemoryUsage) {
            this.collectMemoryUsage();
        }
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

    collectMemoryUsage() {
        this.memory = performance.memory.usedJSHeapSize / ONE_MB;
        this.memoryMax = performance.memory.jsHeapSizeLimit / ONE_MB;
    }

    getMemory() {
        this.frames++;
        const time = (performance || Date).now();

        if (time >= this.prevTime + 1000) {
            this.prevTime = time;
            this.frames = 0;
            this.collectMemoryUsage();
        }

        this.beginTime = time;
    }

    update() {
        this.getFPS();
        if (this.hasMemoryUsage) {
            this.getMemory();
        }
    }
}

export default new Stats();
