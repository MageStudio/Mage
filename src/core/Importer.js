import config from "./config";
import { fetch } from "whatwg-fetch";
import { getWindow } from "./window";
import {
    Line,
    Cube,
    ENTITY_TYPES,
    Sphere,
    Cylinder,
    Cone,
    Box,
    CurveLine,
    Plane,
} from "../entities";
import Models from "../models/Models";

// class responsible for importing level data from a file
export class Importer {
    // Importer gets config, containing either a level or a url
    static importLevelSnapshot(url) {
        if (getWindow() && url) {
            return fetch(url)
                .then(res => res.json())
                .then(Importer.parseLevelData)
                .catch(() => Promise.resolve());
        }
        return Promise.resolve();
    }

    static completeElementCreation(element, elementData) {
        // position
        element.setPosition(elementData.position);

        // rotation
        element.setRotation(elementData.rotation);

        // quaternion
        element.setQuaternion(elementData.quaternion);

        // scale
        element.setScale(elementData.scale);

        // opacity
        element.setOpacity(elementData.opacity);

        // name
        element.setUuid(elementData.uuid);
        element.setName(elementData.name);

        // setting material
        if (elementData.materials.length) {
            const defaultMaterialOptionKeys = MATERIAL_PROPERTIES_MAP[elementData.materialType];
            const disallowedMaterialOptions = difference(
                Object.keys(elementData.materials[0]),
                defaultMaterialOptionKeys,
            );
            const materialOptions = omit(disallowedMaterialOptions, elementData.materials[0]);
            element.setMaterialFromName(elementData.materialType, materialOptions);
        }

        // setting textures
        const parsedTextures = JSON.parse(elementData.textures);
        element.setNormalScale();
        Object.keys(parsedTextures).forEach(textureType => {
            const { id, options } = parsedTextures[textureType];
            element.setTexture(id, textureType, options);
        });

        // adding scripts

        // setting data
        Object.keys(elementData.data).forEach(k => {
            element.setData(k, elementData.data[k]);
        });
    }

    static parseLevelData(data = {}) {
        const { elements = [] } = data;

        elements.forEach(data => {
            if (data.entitySubType === ENTITY_TYPES.MODEL.TYPE) {
                const { options } = data;
                const { name, rest } = options;

                Importer.completeElementCreation(Models.create(name, rest), data);
            } else {
                switch (data.entitySubType) {
                    case ENTITY_TYPES.MESH.SUBTYPES.CUBE:
                        Importer.completeElementCreation(Cube.create(data), data);
                        break;
                    case ENTITY_TYPES.MESH.SUBTYPES.LINE:
                        Importer.completeElementCreation(Line.create(data), data);
                        break;
                    case ENTITY_TYPES.MESH.SUBTYPES.SPHERE:
                        Importer.completeElementCreation(Sphere.create(data), data);
                        break;
                    case ENTITY_TYPES.MESH.SUBTYPES.CYLINDER:
                        Importer.completeElementCreation(Cylinder.create(data), data);
                        break;
                    case ENTITY_TYPES.MESH.SUBTYPES.CONE:
                        Importer.completeElementCreation(Cone.create(data), data);
                        break;
                    case ENTITY_TYPES.MESH.SUBTYPES.BOX:
                        Importer.completeElementCreation(Box.create(data), data);
                        break;
                    case ENTITY_TYPES.MESH.SUBTYPES.CURVE_LINE:
                        Importer.completeElementCreation(CurveLine.create(data), data);
                        break;
                    case ENTITY_TYPES.MESH.SUBTYPES.PLANE:
                        Importer.completeElementCreation(Plane.create(data), data);
                        break;
                }
            }
        });
    }
}
