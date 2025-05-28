import { CubeTexture, RGBFormat, MeshBasicMaterial, BoxGeometry, BackSide } from "three";

import { generateRandomName, generateUUID } from "../../lib/uuid";
import Images from "../../images/Images";
import Element from "../../entities/Element";
import { ENTITY_TYPES } from "../../entities/constants";

export default class Skybox extends Element {
    constructor(options) {
        const { name = generateRandomName("Skybox"), texture = "skybox", ...rest } = options;

        super({ name, texture, ...rest });

        this.cubeMap = typeof texture === "string" ? Images.get(texture) : texture;

        const material = new MeshBasicMaterial({
            envMap: this.cubeMap,
            side: BackSide,
        });
        const geometry = new BoxGeometry(1000000, 1000000, 1000000);

        this.setBody({ material, geometry });
        this.setEntityType(ENTITY_TYPES.SCENERY.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.SCENERY.SUBTYPES.SKYBOX);
    }
}
