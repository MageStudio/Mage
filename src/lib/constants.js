import {
    BasicDepthPacking,
    GammaEncoding,
    LinearEncoding,
    RGBADepthPacking,
    RGBDEncoding,
    RGBEEncoding,
    RGBM16Encoding,
    RGBM7Encoding,
    sRGBEncoding,
    Vector3,
    Quaternion,
} from "three";

export const ALMOST_ZERO = 0.00001;

export const UP = "UP";
export const DOWN = "DOWN";
export const LEFT = "LEFT";
export const RIGHT = "RIGHT";
export const FRONT = "FRONT";
export const BACK = "BACK";

export const VECTOR_UP = { type: UP, vector: new Vector3(0, 1, 0) };
export const VECTOR_DOWN = { type: DOWN, vector: new Vector3(0, -1, 0) };
export const VECTOR_LEFT = { type: LEFT, vector: new Vector3(1, 0, 0) };
export const VECTOR_RIGHT = { type: RIGHT, vector: new Vector3(-1, 0, 0) };
export const VECTOR_FRONT = { type: FRONT, vector: new Vector3(0, 0, 1) };
export const VECTOR_BACK = { type: BACK, vector: new Vector3(0, 0, -1) };

export const ORIGIN = new Vector3(0, 0, 0);
export const ZERO_QUATERNION = new Quaternion().identity();

export const MATERIALS = {
    BASIC: "BASIC",
    LAMBERT: "LAMBERT",
    PHONG: "PHONG",
    DEPTH: "DEPTH",
    STANDARD: "STANDARD",
    TOON: "TOOM",
    THREE_TOON: "THREE_TOON",
};

export const TEXTURES = {
    ALPHA: "alphaMap",
    AO: "aoMap",
    ENV: "envMap",
    MAP: "map",
    LIGHT: "lightMap",
    SPECULAR: "specularMap",
    EMISSIVE: "emissiveMap",
    BUMP: "bumpMap",
    DISPLACEMENT: "displacementMap",
    NORMAL: "normalMap",
    METALNESS: "metalnessMap",
    ROUGHNESS: "roughnessMap",
    GRADIENT: "gradientMap",
};

export const EFFECTS = {
    SEPIA: "SEPIAEFFECT",
    HUE_SATURATION: "HUESATURATIONEFFECT",
    BLOOM: "BLOOM",
    DEPTH_OF_FIELD: "DOF",
    SELECTIVE_OUTLINE: "SELECTIVEOUTLINE",
    OUTLINE: "OUTLINE",
    GLITCH: "GLITCH",
    PIXEL: "PIXEL",
};

export const COLLISION_EVENT = "COLLISION_EVENT";

export const COLORS = {
    WHITE: "#ffffff",
    BLACK: "#000000",
};

export const ASSETS_TYPES = {
    AUDIO: "audio",
    VIDEO: "video",
    IMAGES: "images",
    TEXTURES: "textures",
    CUBETEXTURES: "cubetextures",
    MODELS: "models",
    PARTICLES: "particles",
    SCRIPTS: "scripts",
    SHADERS: "shaders",
};

export const OUTPUT_ENCODINGS = {
    LINEAR: LinearEncoding,
    SRGB: sRGBEncoding,
    GAMMA: GammaEncoding,
    RGBE: RGBEEncoding,
    RGBM7: RGBM7Encoding,
    RGBM16: RGBM16Encoding,
    RGBD: RGBDEncoding,
    BASICDEPTH: BasicDepthPacking,
    RGBADEPTH: RGBADepthPacking,
};

export const DEFAULT_OUTPUT_ENCODING = OUTPUT_ENCODINGS.LINEAR;

export const ROOT = "/";
export const DIVIDER = "/";
export const HASH = "#";
export const EMPTY = "";
export const QUERY_START = "?";

export const DEFAULT_SELECTOR = "#gameContainer";

export const BEFORE_UNLOAD = "beforeunload";
export const HASH_CHANGE = "hashchange";

export const TAGS = {
    LIGHTS: {
        HOLDER: "TAGS.LIGHTS.HOLDER",
        HELPER: "TAGS.LIGHTS.HELPER",
        TARGET: "TAGS.LIGHTS.TARGET",
    },
};
