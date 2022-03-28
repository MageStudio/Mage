import { MATERIALS, TEXTURES } from "../lib/constants";

const MATERIAL_TEXTURE_MAP = {
    [MATERIALS.BASIC]: [
        TEXTURES.ALPHA,
        TEXTURES.AO,
        TEXTURES.ENV,
        TEXTURES.LIGHT,
        TEXTURES.MAP,
        TEXTURES.SPECULAR
    ],
    [MATERIALS.LAMBERT]: [
        TEXTURES.ALPHA,
        TEXTURES.AO,
        TEXTURES.ENV,
        TEXTURES.LIGHT,
        TEXTURES.MAP,
        TEXTURES.SPECULAR,
        TEXTURES.EMISSIVE
    ],
    [MATERIALS.PHONG]: [
        TEXTURES.ALPHA,
        TEXTURES.AO,
        TEXTURES.ENV,
        TEXTURES.LIGHT,
        TEXTURES.MAP,
        TEXTURES.SPECULAR,
        TEXTURES.EMISSIVE,
        TEXTURES.BUMP,
        TEXTURES.DISPLACEMENT,
        TEXTURES.NORMAL
    ],
    [MATERIALS.DEPTH]: [
        TEXTURES.ALPHA,
        TEXTURES.MAP,
        TEXTURES.DISPLACEMENT
    ],
    [MATERIALS.STANDARD]: [
        TEXTURES.ALPHA,
        TEXTURES.AO,
        TEXTURES.ENV,
        TEXTURES.LIGHT,
        TEXTURES.MAP,
        TEXTURES.EMISSIVE,
        TEXTURES.BUMP,
        TEXTURES.DISPLACEMENT,
        TEXTURES.NORMAL,
        TEXTURES.METALNESS,
        TEXTURES.ROUGHNESS
    ],
    [MATERIALS.THREE_TOON]: [
        TEXTURES.ALPHA,
        TEXTURES.AO,
        TEXTURES.BUMP,
        TEXTURES.DISPLACEMENT,
        TEXTURES.EMISSIVE,
        TEXTURES.GRADIENT,
        TEXTURES.LIGHT,
        TEXTURES.MAP,
        TEXTURES.NORMAL
    ]
};


export const isTextureMapAllowedForMaterial = (materialType, textureType) => (
    MATERIAL_TEXTURE_MAP[materialType] &&
    MATERIAL_TEXTURE_MAP[materialType].includes(textureType)
)