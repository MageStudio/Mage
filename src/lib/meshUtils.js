import {
	MeshBasicMaterial,
	MeshLambertMaterial,
	MeshPhongMaterial,
	MeshDepthMaterial,
	MeshStandardMaterial
} from 'three';

import Config from '../core/config';
import { MATERIALS } from './constants';

const setUpLightsAndShadows = (mesh) => {
    mesh.castShadow = Config.lights().shadows;
    mesh.receiveShadow = Config.lights().shadows;
} 

export const isMesh = mesh => mesh.isMesh;
export const isSprite = mesh => mesh.isSprite;
export const isLine = mesh => mesh.isLine;

const isMeshOrSkinnedMesh = (mesh) => mesh.isMesh || mesh.isSkinnedMesh;
export const hasMaterial = mesh => Boolean(mesh.material);
export const hasGeometry = mesh => Boolean(mesh.geometry);

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
}

export const prepareModel = (model) => {
    setUpLightsAndShadows(model);

    model.traverse(mesh => {
        setUpLightsAndShadows(mesh);
    });

    return model;
}