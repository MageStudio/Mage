import { MATERIAL_TEXTURE_MAP } from "./constants";

export const isTextureMapAllowedForMaterial = (materialType, textureType) =>
    MATERIAL_TEXTURE_MAP[materialType] && MATERIAL_TEXTURE_MAP[materialType].includes(textureType);
