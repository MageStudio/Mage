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
    DoubleSide,
    FrontSide,
    BackSide,
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

export const PROPERTIES = {
    OPACITY: "opacity", // float
    TRANSPARENT: "transparent", // boolean
    VISIBLE: "visible", // boolean
    SIDE: "side", // FRONTSIZE, BACKSIDE, DOUBLE
    COLOR: "color", // color // done
    DEPTH_WRITE: "depthWrite", // bolean // done
    DEPTH_TEST: "depthTest", // boolean // done
    FOG: "fog", // boolean NOT SUPPORTED BY MAGE // done
    REFLECTIVITY: "reflectivity", // float // done
    WIREFRAME: "wireframe", //boolean // done
    COMBINE: "combine", // integer // done
    FLAT_SHADING: "flatShading", // boolean // done
    SHININESS: "shininess", // float
    SPECULAR: "specular", // color
    NORMAL_SCALE: "normalScale", // Vector2
    METALNESS: "metalness", // float
    ROUGHNESS: "roughness", // float
    EMISSIVE: "emissive", // color
    EMISSIVE_INTENSITY: "emissiveIntensity", // float
    LIGHT_MAP_INTENSITY: "lightMapIntensity", // float
    AO_MAP_INTENSITY: "aoMapIntensity", // float
    BUMP_SCALE: "bumpScale", // float
    DISPLACEMENT_SCALE: "displacementScale", // float
    DISPLACEMENT_BIAS: "displacementBias", // float
    REFRACTION_RATIO: "refractionRatio", // float // done
    ENV_MAP_INTENSITY: "envMapIntensity", // float
};

export const MATERIAL_PROPERTIES_DEFAULT_VALUES = {
    [PROPERTIES.OPACITY]: 1.0, // float
    [PROPERTIES.TRANSPARENT]: false, // boolean
    [PROPERTIES.VISIBLE]: true, // boolean
    [PROPERTIES.SIDE]: FrontSide, // FRONTSIZE, BACKSIDE, DOUBLE
    [PROPERTIES.COLOR]: "#ffffff", // color
    [PROPERTIES.DEPTH_WRITE]: false, // bolean
    [PROPERTIES.DEPTH_TEST]: false, // boolean
    [PROPERTIES.FOG]: false, // booleani put
    [PROPERTIES.REFLECTIVITY]: 1.0, // float
    [PROPERTIES.WIREFRAME]: false, //boolean
    [PROPERTIES.COMBINE]: 1, // integer
    [PROPERTIES.FLAT_SHADING]: false, // boolean
    [PROPERTIES.SHININESS]: 30, // float
    [PROPERTIES.SPECULAR]: "#111111", // color
    [PROPERTIES.NORMAL_SCALE]: { x: 1, y: 1 }, // Vector2
    [PROPERTIES.METALNESS]: 0.0, // float
    [PROPERTIES.ROUGHNESS]: 1.0, // float
    [PROPERTIES.EMISSIVE]: "#000000", // color
    [PROPERTIES.EMISSIVE_INTENSITY]: 1.0, // float
    [PROPERTIES.LIGHT_MAP_INTENSITY]: 1.0, // float
    [PROPERTIES.AO_MAP_INTENSITY]: 1.0, // float
    [PROPERTIES.BUMP_SCALE]: 1.0, // float
    [PROPERTIES.DISPLACEMENT_SCALE]: 1.0, // float
    [PROPERTIES.DISPLACEMENT_BIAS]: 0, // float
    [PROPERTIES.REFRACTION_RATIO]: 0.98, // float
    [PROPERTIES.ENV_MAP_INTENSITY]: 1.0, // float
};

export const DEFAULT_MATERIAL_PROPERTIES = {
    OPACITY: "opacity", // float
    SIDE: "side", // FRONTSIZE, BACKSIDE, DOUBLE
    TRANSPARENT: "transparent", // boolean
    VISIBLE: "visible", // boolean
};

export const MATERIAL_PROPERTIES_MAP = {
    [MATERIALS.BASIC]: [
        PROPERTIES.COLOR,
        PROPERTIES.COMBINE,
        // PROPERTIES.FOG,
        PROPERTIES.LIGHT_MAP_INTENSITY, // float
        PROPERTIES.REFLECTIVITY,
        PROPERTIES.WIREFRAME,
        PROPERTIES.REFRACTION_RATIO,
    ],
    [MATERIALS.LAMBERT]: [
        PROPERTIES.AO_MAP_INTENSITY, // DONE
        PROPERTIES.BUMP_SCALE, // DONE
        PROPERTIES.COLOR, // DONE
        PROPERTIES.COMBINE, // DONE
        PROPERTIES.DISPLACEMENT_SCALE, // DONE
        PROPERTIES.DISPLACEMENT_BIAS, // DONE
        PROPERTIES.EMISSIVE, // DONE
        PROPERTIES.EMISSIVE_INTENSITY, // DONE
        // PROPERTIES.FOG, // DONE
        PROPERTIES.LIGHT_MAP_INTENSITY, // DONE
        PROPERTIES.NORMAL_SCALE,
        PROPERTIES.REFLECTIVITY, // DONE
        PROPERTIES.REFRACTION_RATIO, // DONE
        PROPERTIES.WIREFRAME, // DONE
    ],
    [MATERIALS.PHONG]: [
        PROPERTIES.AO_MAP_INTENSITY, // DONE
        PROPERTIES.BUMP_SCALE, // DONE
        PROPERTIES.COLOR, // DONE
        PROPERTIES.COMBINE, // DONE
        PROPERTIES.DISPLACEMENT_SCALE, // DONE
        PROPERTIES.DISPLACEMENT_BIAS, // DONE
        PROPERTIES.EMISSIVE, // DONE
        PROPERTIES.EMISSIVE_INTENSITY, // DONE
        PROPERTIES.FLAT_SHADING, // DONE
        // PROPERTIES.FOG, // DONE
        PROPERTIES.LIGHT_MAP_INTENSITY, // DONE
        PROPERTIES.NORMAL_SCALE, // DONE
        PROPERTIES.REFLECTIVITY, // DONE
        PROPERTIES.REFRACTION_RATIO, // DONE
        PROPERTIES.SHININESS, // DONE
        PROPERTIES.SPECULAR, // DONE
        PROPERTIES.WIREFRAME, // DONE
    ],
    [MATERIALS.DEPTH]: [
        PROPERTIES.DISPLACEMENT_SCALE, // DONE
        PROPERTIES.DISPLACEMENT_BIAS, // DONE
        // PROPERTIES.FOG, // DONE
        PROPERTIES.WIREFRAME, // DONE
    ],
    [MATERIALS.STANDARD]: [
        PROPERTIES.AO_MAP_INTENSITY, // DONE
        PROPERTIES.BUMP_SCALE, // DONE
        PROPERTIES.COLOR, // DONE
        PROPERTIES.COMBINE, // DONE
        PROPERTIES.DISPLACEMENT_SCALE, // DONE
        PROPERTIES.DISPLACEMENT_BIAS, // DONE
        PROPERTIES.EMISSIVE, // DONE
        PROPERTIES.EMISSIVE_INTENSITY, // DONE
        PROPERTIES.ENV_MAP_INTENSITY, // done
        PROPERTIES.FLAT_SHADING, // DONE
        // PROPERTIES.FOG, // DONE
        PROPERTIES.LIGHT_MAP_INTENSITY, // DONE
        PROPERTIES.METALNESS, // done
        PROPERTIES.NORMAL_SCALE, // DONE
        PROPERTIES.ROUGHNESS, // DONE
        PROPERTIES.WIREFRAME, // DONE
    ],
    [MATERIALS.THREE_TOON]: [
        PROPERTIES.AO_MAP_INTENSITY, // DONE
        PROPERTIES.BUMP_SCALE, // DONE
        PROPERTIES.COLOR, // DONE
        PROPERTIES.DISPLACEMENT_SCALE, // DONE
        PROPERTIES.DISPLACEMENT_BIAS, // DONE
        PROPERTIES.EMISSIVE, // DONE
        PROPERTIES.EMISSIVE_INTENSITY, // DONE
        // PROPERTIES.FOG, // DONE
        PROPERTIES.LIGHT_MAP_INTENSITY, // DONE
        PROPERTIES.NORMAL_SCALE, // done
        PROPERTIES.WIREFRAME, // DONE
    ],
};

export const MATERIAL_TEXTURE_MAP = {
    [MATERIALS.BASIC]: [
        TEXTURES.ALPHA,
        TEXTURES.AO,
        TEXTURES.ENV,
        TEXTURES.LIGHT,
        TEXTURES.MAP,
        TEXTURES.SPECULAR,
    ],
    [MATERIALS.LAMBERT]: [
        TEXTURES.ALPHA, // DONE
        TEXTURES.AO, // DONE
        TEXTURES.ENV, // DONE
        TEXTURES.LIGHT, // DONE
        TEXTURES.MAP, // DONE
        TEXTURES.SPECULAR, // DONE
        TEXTURES.EMISSIVE, // DONE
        TEXTURES.BUMP,
    ],
    [MATERIALS.PHONG]: [
        TEXTURES.ALPHA, // DONE
        TEXTURES.AO, // DONE
        TEXTURES.ENV, // DONE
        TEXTURES.LIGHT, // DONE
        TEXTURES.MAP, // DONE
        TEXTURES.SPECULAR, // DONE
        TEXTURES.EMISSIVE, // DONE
        TEXTURES.BUMP, // DONE
        TEXTURES.DISPLACEMENT, // DONE
        TEXTURES.NORMAL, // DONE
    ],
    [MATERIALS.DEPTH]: [
        TEXTURES.ALPHA, // DONE
        TEXTURES.MAP, // DONE
        TEXTURES.DISPLACEMENT, // DONE
    ],
    [MATERIALS.STANDARD]: [
        TEXTURES.ALPHA, // DONE
        TEXTURES.AO, // DONE
        TEXTURES.ENV, // DONE
        TEXTURES.LIGHT, // DONE
        TEXTURES.MAP, // DONE
        TEXTURES.EMISSIVE, // DONE
        TEXTURES.BUMP, // DONE
        TEXTURES.DISPLACEMENT, // DONE
        TEXTURES.NORMAL, // DONE
        TEXTURES.METALNESS, // DONE
        TEXTURES.ROUGHNESS, // DONE
    ],
    [MATERIALS.THREE_TOON]: [
        TEXTURES.ALPHA, // DONE
        TEXTURES.AO, // DONE
        TEXTURES.BUMP, // DONE
        TEXTURES.DISPLACEMENT,
        TEXTURES.EMISSIVE, // DONE
        TEXTURES.GRADIENT, // DONE
        TEXTURES.LIGHT, // DONE
        TEXTURES.MAP, // DONE
        TEXTURES.NORMAL, // DONE
    ],
};

// removing images when serialising materials because the json becomes too big
export const UNDESIRED_SERIALISED_MATERIAL_PROPERTIES = ["images", ...Object.values(TEXTURES)];

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
    HELPER: "TAGS.HELPER",
    LIGHTS: {
        HOLDER: "TAGS.LIGHTS.HOLDER",
        HELPER: "TAGS.LIGHTS.HELPER",
        TARGET: "TAGS.LIGHTS.TARGET",
    },
    SOUNDS: {
        HELPER: "TAGS.SOUNDS.HELPER",
        HOLDER: "TAGS.SOUNDS.HOLDER",
    },
};
