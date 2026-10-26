/**
 * @author mrdoob / http://mrdoob.com/
 */
import { Subject } from "rxjs";
import features, { FEATURES } from "../lib/features";

const ONE_MB = 1048576;

class Stats {
    constructor() {
        this.beginTime = (performance || Date).now();
        this.prevTime = this.beginTime;

        this.frames = 0;
        this._fps = 0;
        this._fpsMax = 100;
        this.fps = new Subject();
        this.render = new Subject();
        this._calls = 0;
        this._triangles = 0;
        this.memory = new Subject();
        this.memoryMax = new Subject();
    }

    init() {
        this.beginTime = (performance || Date).now();
    }

    getFPS() {
        this.frames++;
        const time = (performance || Date).now();

        if (time >= this.prevTime + 1000) {
            this._fps = (this.frames * 1000) / (time - this.prevTime);
            this.prevTime = time;
            this.frames = 0;
            this.fps.next(this._fps);
            // instanced* are filled in once instancing exists; 0 while it is off
            this.render.next({
                calls: this._calls,
                triangles: this._triangles,
                instancedGroups: 0,
                instancedMeshes: 0,
            });
        }

        this.beginTime = time;

        return this._fps;
    }

    subscribe(handler) {
        this.fps.subscribe(handler);

        return () => this.fps.unsubscribe(handler);
    }

    getMemoryUsage() {
        if (features.isFeatureSupported(FEATURES.MEMORY)) {
            this.memory.next(performance.memory.usedJSHeapSize / ONE_MB);
            this.memoryMax.next(performance.memory.jsHeapSizeLimit / ONE_MB);
        }
    }

    update(dt, info) {
        // info is the renderer's WebGLInfo; it holds the last completed frame's totals
        this._calls = info?.render?.calls ?? 0;
        this._triangles = info?.render?.triangles ?? 0;
        this.getFPS();
    }
}

export default new Stats();
