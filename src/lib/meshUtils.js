import {
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	MeshDepthMaterial,
	MeshStandardMaterial
} from 'three';

import Config from '../core/config';
import Lights from '../lights/Lights';
import { MATERIALS } from './constants';

export const setUpLightsAndShadows = (mesh) => {
    const shadowsEnabled = Config.lights().shadows;

    mesh.castShadow = Boolean(shadowsEnabled);
    mesh.receiveShadow = Boolean(shadowsEnabled);

    if (Lights.isUsingCSM() && hasMaterial(mesh)) {
        Lights.csm.setupMaterial(mesh.material);
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
        case MATERIALS.BASIC:
        default:
            return cloneMaterial(MeshBasicMaterial, mesh, materialOptions);
    }
}

const cloneMaterial = (MeshMaterial, mesh, options = {}) => {
    const clone = mesh.material.clone();
    mesh.material = new MeshMaterial({
        map: clone.map,
        color: clone.color,
        ...options
    });

    setUpLightsAndShadows(mesh);
}

export const disposeTextures = mesh => {
    if (hasTexture(mesh)) {
        mesh.material.map.dispose();
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