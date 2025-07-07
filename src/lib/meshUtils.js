import {
    MeshBasicMaterial,
    MeshLambertMaterial,
    MeshPhongMaterial,
    MeshDepthMaterial,
    MeshStandardMaterial,
    MeshToonMaterial,
} from "three";

import * as vivify from "vivifyjs";
import { omit } from "./object";
import Config from "../core/config";
import Lights from "../lights/Lights";
import ToonMaterial from "../materials/Toon";
import { MATERIALS, TEXTURES, UNDESIRED_SERIALISED_MATERIAL_PROPERTIES } from "./constants";

export const setUpLightsAndShadows = mesh => {
    const { textureAnisotropy, shadows } = Config.lights();

    mesh.castShadow = Boolean(shadows);
    mesh.receiveShadow = Boolean(shadows);

    if (hasMaterial(mesh)) {
        const setUpMaterial = material => {
            if (Lights.isUsingCascadeShadowMaps()) {
                Lights.csm.setupMaterial(material);
            }

            if (material.map) {
                material.map.anisotropy = textureAnisotropy;
            }

            return material;
        };

        mesh.material = processMaterial(mesh.material, setUpMaterial);
    }
};

export const isMesh = mesh => mesh.isMesh;
export const isSprite = mesh => mesh.isSprite;
export const isLine = mesh => mesh.isLine;
export const isScene = mesh => mesh.isScene;

export const notAScene = mesh => !mesh.isScene;

const isMeshOrSkinnedMesh = mesh => mesh.isMesh || mesh.isSkinnedMesh;
export const hasMaterial = mesh => Boolean(mesh.material);
export const hasGeometry = mesh => Boolean(mesh.geometry);
export const hasTexture = mesh => hasMaterial(mesh) && mesh.material.map;

export const applyMaterialChange = (elementBody, changeCallback) => {
    if (hasMaterial(elementBody)) {
        processMaterial(elementBody.material, changeCallback);
    } else {
        elementBody.traverse(child => {
            if (hasMaterial(child)) {
                processMaterial(child.material, changeCallback);
            }
        });
    }
};

export const extractMaterialProperty = (elementBody, property) => {
    if (hasMaterial(elementBody)) {
        return vivify.get(property, elementBody.material);
    } else {
        let found;
        elementBody.traverse(child => {
            if (hasMaterial(child) && !found) {
                found = vivify.get(child.material, property);
            }
        });
        return found;
    }
};

export const serialiseMaterial = material =>
    omit(UNDESIRED_SERIALISED_MATERIAL_PROPERTIES, material?.toJSON());

export const processMaterial = (material, callback) =>
    Array.isArray(material) ? material.map(callback) : callback(material);

export const replaceMaterialByName = (name, mesh, materialOptions) => {
    if (!hasMaterial(mesh)) return;

    switch (name) {
        case MATERIALS.LAMBERT:
            return replaceMaterial(MeshLambertMaterial, mesh, materialOptions);
        case MATERIALS.PHONG:
            return replaceMaterial(MeshPhongMaterial, mesh, materialOptions);
        case MATERIALS.DEPTH:
            return replaceMaterial(MeshDepthMaterial, mesh, materialOptions);
        case MATERIALS.STANDARD:
            return replaceMaterial(MeshStandardMaterial, mesh, materialOptions);
        case MATERIALS.TOON:
            return replaceMaterial(ToonMaterial, mesh, materialOptions);
        case MATERIALS.THREE_TOON:
            return replaceMaterial(MeshToonMaterial, mesh, materialOptions);
        case MATERIALS.BASIC:
        default:
            return replaceMaterial(MeshBasicMaterial, mesh, materialOptions);
    }
};

const replaceMaterial = (MeshMaterial, mesh, options = {}) => {
    const _replaceMaterial = material => {
        const clone = material.clone();
        const newMaterial = new MeshMaterial({
            map: clone.map,
            color: clone.color,
            ...options,
        });

        newMaterial.skinning = true;
        return newMaterial;
    };

    mesh.material = processMaterial(mesh.material, _replaceMaterial);

    setUpLightsAndShadows(mesh);

    return mesh.material;
};

export const disposeTextures = mesh => {
    if (hasMaterial(mesh)) {
        const _disposeTexture = material => {
            Object.values(TEXTURES).forEach(key => {
                if (material[key]) {
                    material[key].dispose();
                }
            });
        };
        processMaterial(mesh.material, _disposeTexture);
    }
};

export const disposeMaterial = mesh => {
    if (hasMaterial(mesh)) {
        mesh.material.dispose && mesh.material.dispose();
    }
};

export const disposeGeometry = mesh => {
    if (hasGeometry(mesh)) {
        mesh.geometry.dispose && mesh.geometry.dispose();
    }
};

export const prepareModel = model => {
    setUpLightsAndShadows(model);

    model.traverse(mesh => {
        setUpLightsAndShadows(mesh);
    });

    return model;
};

export const findFirstInScene = (scene, filter) => {
    let found = false;
    let toReturn;

    scene.traverse(element => {
        if (filter(element) && !found) {
            found = true;
            toReturn = element;
        }
    });

    return toReturn;
};

export const serializeVector = vector =>
    vector && {
        x: vector.x,
        y: vector.y,
        z: vector.z,
    };

export const serializeQuaternion = quaternion =>
    quaternion && {
        x: quaternion.x,
        y: quaternion.y,
        z: quaternion.z,
        w: quaternion.w,
    };

export const serializeColor = color =>
    color && {
        r: color.r,
        g: color.g,
        b: color.b,
    };
