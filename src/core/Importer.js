import { fetch } from "whatwg-fetch";
import { getWindow } from "./window";
import env from "../env";
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
    Sprite,
} from "../entities";
import Models from "../models/Models";
import PointLight from "../lights/pointLight";
import AmbientLight from "../lights/ambientLight";
import SpotLight from "../lights/spotLight";
import HemisphereLight from "../lights/hemisphereLight";
import SunLight from "../lights/sunLight";
import Sound from "../audio/sound";
import AmbientSound from "../audio/ambientSound";
import DirectionalSound from "../audio/directionalSound";
import { difference } from "../lib/array";
import { omit } from "../lib/object";
import { MATERIAL_PROPERTIES_MAP, TEXTURES } from "../lib/constants";
import Scripts from "../scripts/Scripts";
import {
    SCRIPT_NOT_FOUND,
    NO_VALID_LEVEL_DATA_PROVIDED,
    IMPORTER_ERROR_ELEMENT_CREATION,
    IMPORTER_ERROR_UNKNOWN_ELEMENT_SUBTYPE,
    IMPORTER_ERROR_LIGHT_CREATION,
    IMPORTER_ERROR_SOUND_CREATION,
} from "../lib/messages";
import Sky from "../fx/scenery/Sky";
import Element from "../entities/Element";
import { Object3D } from "three";
import Universe from "./Universe";
import Images from "../images/Images";

// class responsible for importing level data from a file
export class Importer {
    // Importer gets config, containing either a level or a url
    static importLevelSnapshot({ url, data, options = {} } = {}) {
        if (getWindow() && url) {
            return fetch(url)
                .then(res => res.json())
                .then(data => data || {})
                .then(data => Importer.parseLevelData(data, options))
                .catch(() => Promise.resolve());
        } else if (data) {
            return Promise.resolve(Importer.parseLevelData(data, options));
        }

        console.warn(NO_VALID_LEVEL_DATA_PROVIDED);
        return Promise.resolve();
    }

    static completeCommonCreationSteps(element, elementData, options = {}) {
        const {
            skipPosition = false,
            skipRotation = false,
            skipQuaternion = false,
            skipScale = false,
            skipOpacity = false,
            skipName = false,
            skipWorldTransform = false,
            skipTags = false,
        } = options;

        /// position
        if (!skipPosition) element.setPosition(elementData.position);

        // rotation
        if (!skipRotation) element.setRotation(elementData.rotation);

        // quaternion
        if (!skipQuaternion) element.setQuaternion(elementData.quaternion);

        // scale
        if (!skipScale) element.setScale(elementData.scale);

        // opacity
        if (!skipOpacity) element.setOpacity(elementData.opacity);

        // name
        if (!skipName) {
            element.setUuid(elementData.uuid);
            element.setName(elementData.name);
        }

        // world transform
        if (!skipWorldTransform && elementData.worldTransform) {
            element.setWorldTransform(elementData.worldTransform);
        }

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

        // setting tags
        if (!skipTags && elementData.tags) {
            element.addTags(elementData.tags);
        }
    }

    static async completeElementCreation(element, elementData, options) {
        Importer.completeCommonCreationSteps(element, elementData, options);

        // setting material
        if (elementData.materials && elementData.materials.length) {
            const defaultMaterialOptionKeys = MATERIAL_PROPERTIES_MAP[elementData.materialType];
            const disallowedMaterialOptions = difference(
                Object.keys(elementData.materials[0]),
                defaultMaterialOptionKeys,
            );
            const materialOptions = omit(disallowedMaterialOptions, elementData.materials[0]);
            element.setMaterialFromName(elementData.materialType, materialOptions);
        }

        // setting textures
        if (elementData.textures) {
            const parsedTextures = JSON.parse(elementData.textures);
            element.setNormalScale();

            // Use for...of loop to properly await texture loading before applying
            for (const textureType of Object.keys(parsedTextures)) {
                const { id, options, assetPath } = parsedTextures[textureType];

                // If texture not already loaded and we have an assetPath, load it first
                // assetPath is relative like "textures/mytexture.png"
                // Images.loadAssetByPath will resolve the path using MAGE_ASSETS_BASE_URL
                if (!Images.get(id) && assetPath) {
                    try {
                        // Pass the relative assetPath - resolveAssetPath in Images will add the base URL
                        await Images.loadAssetByPath(assetPath, id, Images.currentLevel);
                    } catch (e) {
                        console.warn(`[Mage] Failed to load texture: ${id} from ${assetPath}`);
                    }
                }

                element.setTexture(id, textureType, { ...options, assetPath });
            }
        }

        // setting shadow properties
        if (elementData.shadow) {
            const castShadow = elementData.shadow.cast;
            const receiveShadow = elementData.shadow.receive;

            if (castShadow !== undefined) {
                element.getBody().castShadow = castShadow;
            }
            if (receiveShadow !== undefined) {
                element.getBody().receiveShadow = receiveShadow;
            }

            // For models, also traverse children
            if (element.isModel()) {
                element.getBody().traverse(child => {
                    if (castShadow !== undefined) {
                        child.castShadow = castShadow;
                    }
                    if (receiveShadow !== undefined) {
                        child.receiveShadow = receiveShadow;
                    }
                });
            }
        }
    }

    static completeLightCreation(light, lightData, options) {
        // always setting skipOpacity to true
        Importer.completeCommonCreationSteps(light, lightData, { ...options, skipOpacity: true });

        // setting color and intensity
        light.setColor(lightData.color);
        light.setIntensity(lightData.intensity);

        // setting castShadow
        if (lightData.castShadow !== undefined) {
            light.setCastShadow(lightData.castShadow);
        }

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
            const targetElement = new Element({ body: new Object3D() });
            Importer.completeCommonCreationSteps(targetElement, lightData.target, options);
            light.setTarget(targetElement);
        }
    }

    static completeSkyCreation(sky, skyData, options) {
        // calling completeElementCreation to set position, rotation, quaternion, scale, opacity, name, material, textures, scripts, and data
        Importer.completeCommonCreationSteps(sky, skyData, { ...options, skipScale: true });

        const {
            turbidity,
            rayleigh,
            luminance,
            mieCoefficient,
            mieDirectionalG,
            sunInclination,
            sunAzimuth,
            sunDistance,
        } = skyData.options;

        if (turbidity !== undefined) {
            sky.setTurbidity(turbidity);
        }
        if (rayleigh !== undefined) {
            sky.setRayleigh(rayleigh);
        }
        if (luminance !== undefined) {
            sky.setLuminance(luminance);
        }
        if (mieCoefficient !== undefined) {
            sky.setMieCoefficient(mieCoefficient);
        }
        if (mieDirectionalG !== undefined) {
            sky.setMieDirectionalG(mieDirectionalG);
        }
        if (sunInclination !== undefined && sunAzimuth !== undefined && sunDistance !== undefined) {
            sky.setSun(sunInclination, sunAzimuth, sunDistance);
        }
    }

    static async completeSpriteCreation(sprite, spriteData, options) {
        // calling completeElementCreation to set position, rotation, quaternion, scale, opacity, name, material, textures, scripts, and data
        await Importer.completeElementCreation(sprite, spriteData, options);

        const { width, height, spriteTexture, anisotropy, sizeAttenuation, depthTest, depthWrite } =
            spriteData;

        if (width !== undefined) {
            sprite.setWidth(width);
        }
        if (height !== undefined) {
            sprite.setHeight(height);
        }
        if (spriteTexture !== undefined) {
            sprite.setTexture(spriteTexture, TEXTURES.MAP);
        }
        if (anisotropy !== undefined) {
            sprite.setAnisotropy(anisotropy);
        }
        if (sizeAttenuation !== undefined) {
            sprite.setSizeAttenuation(sizeAttenuation);
        }
        if (depthTest !== undefined) {
            sprite.setDepthTest(depthTest);
        }
        if (depthWrite !== undefined) {
            sprite.setDepthWrite(depthWrite);
        }
    }

    static completeSoundCreation(sound, soundData, options) {
        Importer.completeCommonCreationSteps(sound, soundData, { ...options, skipOpacity: true, skipScale: true });

        // setting sound-specific properties
        if (soundData.volume !== undefined) {
            sound.setVolume(soundData.volume);
        }
        if (soundData.detune !== undefined) {
            sound.detune(soundData.detune);
        }
    }

    static async parseLevelData(data = {}, options = {}) {
        const { elements = [], lights = [], audio = [], sounds = [] } = data;
        // Support both 'audio' and 'sounds' keys for backwards compatibility
        const allSounds = [...audio, ...sounds];

        // Use for...of to properly await async completeElementCreation calls
        for (const elementData of elements) {
            try {
                if (elementData.entitySubType === ENTITY_TYPES.MODEL.TYPE) {
                    const { options: modelOptions } = elementData;
                    const { name, ...rest } = modelOptions;

                    await Importer.completeElementCreation(Models.create(name, rest), elementData, options);
                } else {
                    switch (elementData.entitySubType) {
                        case ENTITY_TYPES.MESH.SUBTYPES.CUBE:
                            await Importer.completeElementCreation(Cube.create(elementData), elementData, options);
                            break;
                        case ENTITY_TYPES.MESH.SUBTYPES.LINE:
                            await Importer.completeElementCreation(Line.create(elementData), elementData, options);
                            break;
                        case ENTITY_TYPES.MESH.SUBTYPES.SPHERE:
                            await Importer.completeElementCreation(Sphere.create(elementData), elementData, options);
                            break;
                        case ENTITY_TYPES.MESH.SUBTYPES.CYLINDER:
                            await Importer.completeElementCreation(Cylinder.create(elementData), elementData, options);
                            break;
                        case ENTITY_TYPES.MESH.SUBTYPES.CONE:
                            await Importer.completeElementCreation(Cone.create(elementData), elementData, options);
                            break;
                        case ENTITY_TYPES.MESH.SUBTYPES.BOX:
                            await Importer.completeElementCreation(Box.create(elementData), elementData, options);
                            break;
                        case ENTITY_TYPES.MESH.SUBTYPES.CURVE_LINE:
                            await Importer.completeElementCreation(CurveLine.create(elementData), elementData, options);
                            break;
                        case ENTITY_TYPES.MESH.SUBTYPES.PLANE:
                            await Importer.completeElementCreation(Plane.create(elementData), elementData, options);
                            break;
                        case ENTITY_TYPES.SPRITE.SUBTYPES.DEFAULT:
                            await Importer.completeSpriteCreation(Sprite.create(elementData), elementData, options);
                            break;
                        case ENTITY_TYPES.SCENERY.SUBTYPES.SKY:
                            Importer.completeSkyCreation(Sky.create(elementData), elementData, options);
                            break;
                        default:
                            console.warn(
                                IMPORTER_ERROR_UNKNOWN_ELEMENT_SUBTYPE,
                                elementData.entitySubType,
                            );
                    }
                }
            } catch (error) {
                console.error(
                    IMPORTER_ERROR_ELEMENT_CREATION,
                    elementData.name,
                    elementData.entitySubType,
                    error,
                );
            }
        }

        // adding children to elements
        for (const elementData of elements) {
            if (elementData.children && elementData.children.length) {
                // parent already exists in universe
                const parent = Universe.getByUUID(elementData.uuid);
                for (const uuid of elementData.children) {
                    const child = Universe.getByUUID(uuid);
                    if (child) {
                        parent.add(child);
                        const childData = elements.find(e => e.uuid === uuid);
                        Importer.completeCommonCreationSteps(child, childData, options);
                    }
                }
            }
        }

        lights.forEach(data => {
            try {
                switch (data.entitySubType) {
                    case ENTITY_TYPES.LIGHT.SUBTYPES.POINT:
                        Importer.completeLightCreation(PointLight.create(data), data, options);
                        break;
                    case ENTITY_TYPES.LIGHT.SUBTYPES.AMBIENT:
                        Importer.completeLightCreation(AmbientLight.create(data), data, options);
                        break;
                    case ENTITY_TYPES.LIGHT.SUBTYPES.SPOT:
                        Importer.completeLightCreation(SpotLight.create(data), data, options);
                        break;
                    case ENTITY_TYPES.LIGHT.SUBTYPES.HEMISPHERE:
                        Importer.completeLightCreation(HemisphereLight.create(data), data, options);
                        break;
                    case ENTITY_TYPES.LIGHT.SUBTYPES.SUN:
                        Importer.completeLightCreation(SunLight.create(data), data, options);
                        break;
                    default:
                        console.warn(IMPORTER_ERROR_UNKNOWN_ELEMENT_SUBTYPE, data.entitySubType);
                }
            } catch (error) {
                console.error(
                    IMPORTER_ERROR_LIGHT_CREATION,
                    data.name,
                    data.entitySubType,
                    error.stack,
                );
            }
        });

        // processing sounds
        allSounds.forEach(data => {
            try {
                switch (data.entitySubType) {
                    case ENTITY_TYPES.AUDIO.SUBTYPES.DEFAULT:
                        Importer.completeSoundCreation(Sound.create(data), data, options);
                        break;
                    case ENTITY_TYPES.AUDIO.SUBTYPES.AMBIENT:
                        Importer.completeSoundCreation(AmbientSound.create(data), data, options);
                        break;
                    case ENTITY_TYPES.AUDIO.SUBTYPES.DIRECTIONAL:
                        Importer.completeSoundCreation(DirectionalSound.create(data), data, options);
                        break;
                    default:
                        // Try to create as basic Sound if entitySubType not recognized
                        Importer.completeSoundCreation(Sound.create(data), data, options);
                }
            } catch (error) {
                console.error(
                    IMPORTER_ERROR_SOUND_CREATION,
                    data.name,
                    data.entitySubType,
                    error.stack,
                );
            }
        });
    }
}
