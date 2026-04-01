import { PerspectiveCamera, Vector3, CameraHelper } from "three";
import config from "../core/config";
import Scene from "../core/Scene";
import { ENTITY_TYPES } from "./constants";
import Entity from "./Entity";
import HelperSprite from "./base/HelperSprite";
import { TAGS } from "../lib/constants";

export default class Camera extends Entity {
    constructor(options = {}) {
        const {
            name = "Main PerspectiveCamera",
            fov = config.camera().fov,
            ratio = config.screen().ratio,
            near = config.camera().near,
            far = config.camera().far,
            serializable = true,
        } = options;

        super({ name, serializable });

        this.extendOptions(options);
        const body = new PerspectiveCamera(fov, ratio, near, far);

        this.setBody({ body });
        this.setEntityType(ENTITY_TYPES.CAMERA.TYPE);
        this.setEntitySubtype(ENTITY_TYPES.CAMERA.SUBTYPES.MAIN);
        this.setName(name);

        // Helper body for this camera
        this.isUsingHelper = false;
        // Holder body representing the camera (for selection in editor)
        this.holder = null;
        // THREE.js CameraHelper for visual feedback
        this.helper = null;
    }

    hasHolder() {
        return !!this.holder;
    }

    usingHelper() {
        return this.isUsingHelper;
    }

    addHolder(name = "cameraholder", size = 0.05) {
        const holderSprite = new HelperSprite(size, size, name, { name });

        if (holderSprite) {
            holderSprite.setSizeAttenuation(false);
            holderSprite.setDepthTest(false);
            holderSprite.setDepthWrite(false);
            holderSprite.setSerializable(false);
            holderSprite.setPosition(this.getPosition());
            holderSprite.addTags([TAGS.HELPER, TAGS.CAMERA_HELPER, name]);

            holderSprite.setHelperTarget(this);

            this.holder = holderSprite;

            return true;
        }

        console.warn("[Mage] Camera holder texture not found");
        return false;
    }

    addHelpers({ holderName = "cameraholder", holderSize = 0.05 } = {}) {
        // Add THREE.js CameraHelper for visual feedback
        this.helper = new CameraHelper(this.getBody());

        // Set to layer 1 ONLY so mirrors don't render camera helper
        this.helper.layers.set(1);

        // Disable depth test so helper always renders on top of sky/water
        this.helper.renderOrder = 999;

        // Helper function to set depth properties on materials
        const setMaterialDepth = material => {
            if (!material) return;
            const mats = Array.isArray(material) ? material : [material];
            mats.forEach(mat => {
                mat.depthTest = false;
                mat.depthWrite = false;
                mat.transparent = true;
                mat.needsUpdate = true;
            });
        };

        setMaterialDepth(this.helper.material);

        // Also apply to all children
        this.helper.traverse(child => {
            child.layers.set(1);
            child.renderOrder = 999;
            setMaterialDepth(child.material);
        });

        Scene.add(this.helper, null, false);

        // Add holder sprite for selection
        this.addHolder(holderName, holderSize);

        this.isUsingHelper = true;
    }

    getPosition() {
        return {
            x: this.body.position.x,
            y: this.body.position.y,
            z: this.body.position.z,
        };
    }

    getDirection() {
        const vector = new Vector3();
        const { x, y, z } = this.getBody().getWorldDirection(vector);

        return {
            x,
            y,
            z,
        };
    }

    lookAt(position = {}) {
        const { x = 0, y = 0, z = 0 } = position;
        this.body.lookAt(x, y, z);
    }

    setPosition(where, { updateHolder = true } = {}) {
        const currentPos = this.getPosition();
        const position = {
            x: currentPos.x,
            y: currentPos.y,
            z: currentPos.z,
            ...where,
        };

        const { x, y, z } = position;

        if (this.hasBody()) {
            this.body.position.set(x, y, z);
        }

        if (this.hasHolder() && updateHolder) {
            this.holder.setPosition({ x, y, z });
        }
    }

    update(dt) {
        super.update && super.update(dt);

        // Update the THREE.js CameraHelper
        if (this.usingHelper() && this.helper) {
            this.helper.update();
        }

        // Sync camera position from holder (when user drags the holder)
        if (this.hasHolder()) {
            // Read directly from the holder's THREE.js body position
            const holderBody = this.holder.getBody();
            const holderPos = {
                x: holderBody.position.x,
                y: holderBody.position.y,
                z: holderBody.position.z,
            };
            const cameraPos = this.getPosition();
            // Only update if positions differ significantly
            const threshold = 0.001;
            if (
                Math.abs(holderPos.x - cameraPos.x) > threshold ||
                Math.abs(holderPos.y - cameraPos.y) > threshold ||
                Math.abs(holderPos.z - cameraPos.z) > threshold
            ) {
                this.setPosition(holderPos, { updateHolder: false });
            }
        }
    }

    getFov() {
        return this.getBody().fov;
    }

    setFov(fov) {
        const num = Number(fov);
        const numericFov = Number.isFinite(num) ? num : 75;
        this.getBody().fov = numericFov;
        this.getBody().updateProjectionMatrix();
    }

    getNear() {
        return this.getBody().near;
    }

    setNear(near) {
        const num = Number(near);
        const numericNear = Number.isFinite(num) ? num : 0.1;
        this.getBody().near = numericNear;
        this.getBody().updateProjectionMatrix();
    }

    getFar() {
        return this.getBody().far;
    }

    setFar(far) {
        const num = Number(far);
        const numericFar = Number.isFinite(num) ? num : 3000000;
        this.getBody().far = numericFar;
        this.getBody().updateProjectionMatrix();
    }

    toJSON(parseJSON = false) {
        if (this.isSerializable()) {
            // Sync position from holder before serializing to ensure the
            // serialized position matches the holder (which the user drags).
            // Without this, the camera body can lag the holder by one frame.
            if (this.hasHolder()) {
                const holderBody = this.holder.getBody();
                this.setPosition(
                    {
                        x: holderBody.position.x,
                        y: holderBody.position.y,
                        z: holderBody.position.z,
                    },
                    { updateHolder: false },
                );
            }

            return {
                ...super.toJSON(parseJSON),
                fov: this.getFov(),
                near: this.getNear(),
                far: this.getFar(),
            };
        }
    }
}
