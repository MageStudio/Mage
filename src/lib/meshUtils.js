import {
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	MeshDepthMaterial,
	MeshStandardMaterial,
    MeshToonMaterial
} from 'three';

import Config from '../core/config';
import Lights from '../lights/Lights';
import ToonMaterial from '../materials/Toon';
import { MATERIALS } from './constants';

export const setUpLightsAndShadows = (mesh) => {
    const {
        textureAnisotropy,
        shadows
    } = Config.lights();

    mesh.castShadow = Boolean(shadows);
    mesh.receiveShadow = Boolean(shadows);

    if (hasMaterial(mesh)) {
        const setUpMaterial = material => {
            if (Lights.isUsingCSM()) {
                Lights.csm.setupMaterial(material);
            }
    
            if (material.map) {
                material.map.anisotropy = textureAnisotropy;
            }

            return material;
        }

        mesh.material = processMaterial(mesh.material, setUpMaterial);
    }
} 

export const isMesh = mesh => mesh.isMesh;
export const isSprite = mesh => mesh.isSprite;
export const isLine = mesh => mesh.isLine;
export const isScene = mesh => mesh.isScene;

export const notAScene = mesh => !mesh.isScene;

const isMeshOrSkinnedMesh = (mesh) => mesh.isMesh || mesh.isSkinnedMesh;
export const hasMaterial = mesh => Boolean(mesh.material);
export const hasGeometry = mesh => Boolean(mesh.geometry);
export const hasTexture = mesh => hasMaterial(mesh) && mesh.material.map;

export const processMaterial = (material, callback) => Array.isArray(material) ? material.map(callback) : callback(material);

export const changeMaterialByName = (name, mesh, materialOptions) => {

    if (!hasMaterial(mesh)) return;

    switch(name) {
        case MATERIALS.LAMBERT:
            return cloneMaterial(MeshLambertMaterial, mesh, materialOptions);
        case MATERIALS.PHONG:
            return cloneMaterial(MeshPhongMaterial, mesh, materialOptions);
        case MATERIALS.DEPTH:
            return cloneMaterial(MeshDepthMaterial, mesh, materialOptions);
        case MATERIALS.STANDARD:
            return cloneMaterial(MeshStandardMaterial, mesh, materialOptions);
        case MATERIALS.TOON:
            return cloneMaterial(ToonMaterial, mesh, materialOptions);
        case MATERIALS.THREE_TOON:
            return cloneMaterial(MeshToonMaterial, mesh, materialOptions);
        case MATERIALS.BASIC:
        default:
            return cloneMaterial(MeshBasicMaterial, mesh, materialOptions);
    }
}

const cloneMaterial = (MeshMaterial, mesh, options = {}) => {
    const _cloneMaterial = material => {
        const clone = material.clone();
        const newMaterial = new MeshMaterial({
            map: clone.map,
            color: clone.color,
            ...options
        });

        newMaterial.skinning = true;
        return newMaterial;
    }

    mesh.material = processMaterial(mesh.material, _cloneMaterial);

    setUpLightsAndShadows(mesh);
}

export const disposeTextures = mesh => {
    if (hasMaterial(mesh)) {
        const _disposeTexture = (material) => {
            material.map && material.dispose();
        }
        processMaterial(mesh.material, _disposeTexture);
    }
};

export const disposeMaterial = mesh => {
    if (hasMaterial(mesh)) {
        mesh.material.dispose();
    }
};

export const disposeGeometry = mesh => {
    if (hasGeometry(mesh)) {
        mesh.geometry.dispose();
    }
};

export const prepareModel = (model) => {
    setUpLightsAndShadows(model);

    model.traverse(mesh => {
        setUpLightsAndShadows(mesh);
    });

    return model;
}

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
}