// Lightweight mock of THREE.js for unit tests.
// Only stubs the APIs actually used by src/lib/ modules.
// Grow this file incrementally as more tests need additional THREE APIs.

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    clone() { return new Vector3(this.x, this.y, this.z); }
    add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
    normalize() {
        const len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (len > 0) { this.x /= len; this.y /= len; this.z /= len; }
        return this;
    }
    multiplyScalar(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
    lerp(v, t) {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        this.z += (v.z - this.z) * t;
        return this;
    }
}

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

const MathUtils = {
    lerp: (x, y, t) => x + (y - x) * t,
};

class Color {
    constructor(color) {
        this.value = color;
    }
}

class AnimationMixer {
    constructor() {
        this.time = 0;
    }
    clipAction() {
        return {
            reset: function() { return this; },
            setLoop: function() { return this; },
            setEffectiveTimeScale: function() { return this; },
            setEffectiveWeight: function() { return this; },
            play: function() {},
            stop: function() {},
            fadeIn: function() { return this; },
            fadeOut: function() { return this; },
            isRunning: function() { return false; },
            time: 0,
        };
    }
    stopAllAction() {}
    addEventListener() {}
    update() {}
}

class AnimationClip {
    static findByName(clips, name) {
        return clips.find(c => c.name === name);
    }
}

class EventDispatcher {
    constructor() {
        this._listeners = {};
    }
    addEventListener(type, listener) {
        if (!this._listeners[type]) this._listeners[type] = [];
        this._listeners[type].push(listener);
    }
    removeEventListener(type, listener) {
        if (this._listeners[type]) {
            this._listeners[type] = this._listeners[type].filter(l => l !== listener);
        }
    }
    dispatchEvent(event) {
        if (this._listeners[event.type]) {
            this._listeners[event.type].forEach(l => l(event));
        }
    }
}

class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x; this.y = y; this.z = z; this.w = w;
    }
    identity() { this.x = 0; this.y = 0; this.z = 0; this.w = 1; return this; }
    copy(q) { this.x = q.x; this.y = q.y; this.z = q.z; this.w = q.w; return this; }
    clone() { return new Quaternion(this.x, this.y, this.z, this.w); }
}

class Euler {
    constructor(x = 0, y = 0, z = 0, order = "XYZ") {
        this.x = x; this.y = y; this.z = z; this.order = order;
    }
}

class Matrix4 {
    constructor() {
        this.elements = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
    }
    identity() { this.elements = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; return this; }
    getInverse() { return this; }
    multiplyMatrices() { return this; }
    setFromMatrixScale() { return this; }
}

// Material stubs
class MeshBasicMaterial { constructor(opts) { Object.assign(this, opts); } }
class MeshLambertMaterial { constructor(opts) { Object.assign(this, opts); } }
class MeshPhongMaterial { constructor(opts) { Object.assign(this, opts); } }
class MeshDepthMaterial { constructor(opts) { Object.assign(this, opts); } }
class MeshStandardMaterial { constructor(opts) { Object.assign(this, opts); } }
class MeshToonMaterial { constructor(opts) { Object.assign(this, opts); } }

// Encoding constants
const LinearEncoding = 3000;
const sRGBEncoding = 3001;
const GammaEncoding = 3007;
const RGBEEncoding = 3002;
const RGBM7Encoding = 3004;
const RGBM16Encoding = 3005;
const RGBDEncoding = 3006;
const BasicDepthPacking = 3200;
const RGBADepthPacking = 3201;

// Side constants
const FrontSide = 0;
const BackSide = 1;
const DoubleSide = 2;

const LoopRepeat = 2201;
const LoopOnce = 2200;

module.exports = {
    Vector3,
    Vector2,
    Quaternion,
    Euler,
    Matrix4,
    MathUtils,
    Color,
    AnimationMixer,
    AnimationClip,
    EventDispatcher,
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    MeshDepthMaterial,
    MeshStandardMaterial,
    MeshToonMaterial,
    LinearEncoding,
    sRGBEncoding,
    GammaEncoding,
    RGBEEncoding,
    RGBM7Encoding,
    RGBM16Encoding,
    RGBDEncoding,
    BasicDepthPacking,
    RGBADepthPacking,
    FrontSide,
    BackSide,
    DoubleSide,
    LoopRepeat,
    LoopOnce,
};
