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
import PointLight from "../lights/pointLight";
import AmbientLight from "../lights/ambientLight";
import SpotLight from "../lights/spotLight";
import HemisphereLight from "../lights/hemisphereLight";
import SunLight from "../lights/sunLight";
import { difference } from "../lib/array";
import { omit } from "../lib/object";
import { MATERIAL_PROPERTIES_MAP } from "../lib/constants";
import Scripts from "../scripts/Scripts";
import { SCRIPT_NOT_FOUND, NO_VALID_LEVEL_DATA_PROVIDED } from "../lib/messages";

// class responsible for importing level data from a file
export class Importer {
    // Importer gets config, containing either a level or a url
    static importLevelSnapshot({ url, data }) {
        if (getWindow() && url) {
            return fetch(url)
                .then(res => res.json())
                .then(data => data || {})
                .then(Importer.parseLevelData)
                .catch(() => Promise.resolve());
        } else if (data) {
            return Promise.resolve(Importer.parseLevelData(data));
        }

        console.warn(NO_VALID_LEVEL_DATA_PROVIDED);
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
        if (elementData.scripts && elementData.scripts.length) {
            elementData.scripts.forEach(scriptData => {
                if (Scripts.has(scriptData.name)) {
                    const { name, options } = scriptData;
                    element.addScript(name, options);
                } else {
                    console.warn(SCRIPT_NOT_FOUND, scriptData.name);
                }
            });
        }

        // setting data
        Object.keys(elementData.data).forEach(k => {
            element.setData(k, elementData.data[k]);
        });
    }

    static completeLightCreation(light, lightData) {
        // position
        light.setPosition(lightData.position);

        // rotation
        light.setRotation(lightData.rotation);

        // quaternion
        light.setQuaternion(lightData.quaternion);

        // scale
        light.setScale(lightData.scale);

        // opacity
        light.setOpacity(lightData.opacity);

        // name
        light.setUuid(lightData.uuid);
        light.setName(lightData.name);

        // setting color and intensity
        light.setColor(lightData.color);
        light.setIntensity(lightData.intensity);

        // setting light-specific properties
        if (lightData.distance !== undefined) {
            light.setDistance(lightData.distance);
        }

        if (lightData.decay !== undefined) {
            light.setDecay(lightData.decay);
        }

        if (lightData.angle !== undefined) {
            light.setAngle(lightData.angle);
        }

        if (lightData.penumbra !== undefined) {
            light.setPenumbra(lightData.penumbra);
        }

        // setting ground color for hemisphere lights
        if (lightData.ground !== undefined && lightData.sky !== undefined) {
            light.setColor({ sky: lightData.sky, ground: lightData.ground });
        }

        // setting shadow properties
        if (lightData.shadowCamera) {
            const { near, far } = lightData.shadowCamera;
            light.setShadowCameraNearFar(near, far);
        }

        if (lightData.bias !== undefined) {
            light.setBias(lightData.bias);
        }

        if (lightData.mapSize !== undefined) {
            light.setMapSize(lightData.mapSize);
        }

        // setting target for directional/sun lights
        if (lightData.target !== undefined) {
            light.setTarget(lightData.target);
        }

        // adding scripts
        if (lightData.scripts && lightData.scripts.length) {
            lightData.scripts.forEach(scriptData => {
                if (Scripts.has(scriptData.name)) {
                    const { name, options } = scriptData;
                    light.addScript(name, options);
                } else {
                    console.warn(SCRIPT_NOT_FOUND, scriptData.name);
                }
            });
        }

        // setting data
        Object.keys(lightData.data || {}).forEach(k => {
            light.setData(k, lightData.data[k]);
        });
    }

    static parseLevelData(data = {}) {
        const { elements = [], lights = [] } = data;

        elements.forEach(data => {
            if (data.entitySubType === ENTITY_TYPES.MODEL.TYPE) {
                const { options } = data;
                const { name, ...rest } = options;

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

        lights.forEach(data => {
            switch (data.entitySubType) {
                case ENTITY_TYPES.LIGHT.SUBTYPES.POINT:
                    Importer.completeLightCreation(PointLight.create(data), data);
                    break;
                case ENTITY_TYPES.LIGHT.SUBTYPES.AMBIENT:
                    Importer.completeLightCreation(AmbientLight.create(data), data);
                    break;
                case ENTITY_TYPES.LIGHT.SUBTYPES.SPOT:
                    Importer.completeLightCreation(SpotLight.create(data), data);
                    break;
                case ENTITY_TYPES.LIGHT.SUBTYPES.HEMISPHERE:
                    Importer.completeLightCreation(HemisphereLight.create(data), data);
                    break;
                case ENTITY_TYPES.LIGHT.SUBTYPES.SUN:
                    Importer.completeLightCreation(SunLight.create(data), data);
                    break;
            }
        });
    }
}
