import { BasicShadowMap, PCFShadowMap, PCFSoftShadowMap } from "three";
import { DEFAULT_SHADOWTYPE, SHADOW_TYPES } from "./constants";

export const mapShadowTypeToShadowMap = (shadowType = DEFAULT_SHADOWTYPE) => ({
    [SHADOW_TYPES.BASIC]: BasicShadowMap,
    [SHADOW_TYPES.SOFT]: PCFSoftShadowMap,
    [SHADOW_TYPES.HARD]: PCFShadowMap
})[shadowType] || BasicShadowMap;