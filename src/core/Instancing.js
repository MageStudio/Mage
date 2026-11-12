import { InstancedMesh, Matrix4 } from "three";
import Scene from "./Scene";

const EDITOR_LAYERS_MASK = (1 << 1) | (1 << 2);
// Built on first use so that importing this module never needs a full THREE.Matrix4.
let zeroScaleMatrix = null;
const getZeroScaleMatrix = () => {
    if (!zeroScaleMatrix) zeroScaleMatrix = new Matrix4().makeScale(0, 0, 0);
    return zeroScaleMatrix;
};

const groupKey = mesh =>
    `${mesh.geometry.uuid}|${mesh.material.uuid}|${Boolean(mesh.castShadow)}|${Boolean(
        mesh.receiveShadow,
    )}`;

const hasHiddenAncestor = mesh => {
    let current = mesh.parent;
    while (current) {
        if (current.visible === false) return true;
        current = current.parent;
    }
    return false;
};

const isEligible = mesh => {
    if (!mesh.isMesh || mesh.isSkinnedMesh || mesh.isInstancedMesh) return false;
    // Only leaf meshes: a mesh with children would be hidden together with them.
    if (mesh.children.length > 0) return false;
    // Hidden by someone else: leave it alone (a mesh hidden by instancing was already shown).
    if (mesh.visible === false) return false;
    if (!mesh.geometry || !mesh.material) return false;
    if (Array.isArray(mesh.material) || mesh.material.transparent) return false;
    if ((mesh.layers.mask & EDITOR_LAYERS_MASK) !== 0) return false;
    if (mesh.userData.mageInstancingEjected === true) return false;
    return true;
};

// Hidden source meshes must serialise as if they were visible: `Object3D.toJSON` writes
// `visible: false`, and element bodies are embedded in saves and in the hierarchy.
const hideMesh = mesh => {
    const serialise = mesh.toJSON;

    mesh.visible = false;
    // userData is copied by Object3D.clone, so a clone of a batched mesh stays recognisable
    // as hidden by us (and not by the user).
    mesh.userData.mageInstancingHidden = true;
    mesh.toJSON = function (meta) {
        const visible = this.visible;
        this.visible = true;
        try {
            const output = serialise.call(this, meta);
            const object = output && output.object;

            // Object3D.toJSON embeds userData by reference: copy it without our tag, and drop
            // it when empty, exactly as the untouched mesh would have serialised.
            if (object && object.userData) {
                // eslint-disable-next-line no-unused-vars
                const { mageInstancingHidden, ...userData } = object.userData;
                if (Object.keys(userData).length > 0) {
                    object.userData = userData;
                } else {
                    delete object.userData;
                }
            }

            return output;
        } finally {
            this.visible = visible;
        }
    };
};

const showMesh = mesh => {
    mesh.visible = true;
    delete mesh.userData.mageInstancingHidden;
    delete mesh.toJSON;
};

/**
 * Draws repeated identical meshes of model elements as one THREE.InstancedMesh each, without
 * touching the elements themselves. Only drawing is redirected: the source meshes stay in the
 * scene (hidden), so picking, physics, scripts and serialisation are unchanged.
 */
export class Instancing {
    constructor() {
        this.enabled = false;
        this.dirty = false;
        this.elementsVersion = -1;
        this.groups = [];
    }

    isEnabled() {
        return this.enabled;
    }

    setEnabled(flag) {
        const enabled = Boolean(flag);

        if (enabled === this.enabled) return;

        this.enabled = enabled;

        if (enabled) {
            this.dirty = true;
        } else {
            this.clear();
            const scene = Scene.getScene();
            if (scene) scene.autoUpdate = true;
            this.dirty = false;
            this.elementsVersion = -1;
        }
    }

    markDirty() {
        this.dirty = true;
    }

    getStats() {
        return {
            groups: this.groups.length,
            meshes: this.groups.reduce((total, group) => total + group.members.length, 0),
        };
    }

    update() {
        if (!this.enabled) return;

        const scene = Scene.getScene();
        if (!scene) return;

        // Scene.add/remove bump elementsVersion: a changed counter means the elements changed.
        if (Scene.elementsVersion !== this.elementsVersion) {
            this.elementsVersion = Scene.elementsVersion;
            this.dirty = true;
        }

        // The instance matrices copied below must be this frame's, not last frame's.
        scene.autoUpdate = false;
        scene.updateMatrixWorld();

        if (this.dirty) this.regroup();

        // An ejection during sync marks the instancer dirty; rebuild before returning.
        // Each pass ejects at least one mesh or ends, so this terminates.
        while (!this.sync() && this.enabled) {
            this.regroup();
        }
    }

    /**
     * Writes changed matrices and ejects invalid members.
     * Returns true when nothing was ejected.
     */
    sync() {
        const elements = new Set(Scene.elements);
        let ejected = false;

        this.groups.forEach(group => {
            let changed = false;

            group.members.forEach((member, index) => {
                const { mesh, element } = member;

                if (member.ejected) return;

                if (
                    mesh.geometry !== group.geometry ||
                    mesh.material !== group.material ||
                    Boolean(mesh.castShadow) !== group.castShadow ||
                    Boolean(mesh.receiveShadow) !== group.receiveShadow ||
                    !elements.has(element)
                ) {
                    this.eject(member);
                    ejected = true;
                    return;
                }

                const matrix = hasHiddenAncestor(mesh) ? getZeroScaleMatrix() : mesh.matrixWorld;

                if (!member.matrix || !member.matrix.equals(matrix)) {
                    member.matrix = (member.matrix || new Matrix4()).copy(matrix);
                    group.instancedMesh.setMatrixAt(index, matrix);
                    changed = true;
                }
            });

            if (changed) group.instancedMesh.instanceMatrix.needsUpdate = true;
        });

        return !ejected;
    }

    eject(member) {
        member.ejected = true;
        showMesh(member.mesh);
        member.mesh.userData.mageInstancingEjected = true;
        this.dirty = true;
    }

    /** Rebuilds every group from the current scene elements. */
    regroup() {
        this.clear();
        this.dirty = false;

        const scene = Scene.getScene();
        const buckets = new Map();
        const seen = new Set();

        Scene.elements.forEach(element => {
            if (!element.hasBody() || !element.isModel() || element.hasAnimationHandler()) return;

            const body = element.getBody();

            body.traverse(mesh => {
                // A clone of a batched mesh inherits visible=false and our flag but is in no
                // group: show it again so it is judged like any other mesh.
                if (mesh.userData.mageInstancingHidden) showMesh(mesh);
                if (mesh === body || seen.has(mesh) || !isEligible(mesh)) return;

                seen.add(mesh);
                const key = groupKey(mesh);

                if (!buckets.has(key)) buckets.set(key, []);
                buckets.get(key).push({ mesh, element, matrix: null, ejected: false });
            });
        });

        buckets.forEach(members => {
            if (members.length < 2) return;

            const { mesh: first } = members[0];
            const instancedMesh = new InstancedMesh(first.geometry, first.material, members.length);

            instancedMesh.castShadow = Boolean(first.castShadow);
            instancedMesh.receiveShadow = Boolean(first.receiveShadow);
            instancedMesh.frustumCulled = false;
            // Picks must always land on the real element, never on the batch.
            instancedMesh.raycast = () => {};
            instancedMesh.userData.mageInstancing = true;

            members.forEach(({ mesh }) => hideMesh(mesh));

            scene.add(instancedMesh);
            this.groups.push({
                geometry: first.geometry,
                material: first.material,
                castShadow: instancedMesh.castShadow,
                receiveShadow: instancedMesh.receiveShadow,
                instancedMesh,
                members,
            });
        });
    }

    /**
     * Removes every InstancedMesh and shows the source meshes again. Only the InstancedMesh is
     * disposed: geometry and material belong to the asset cache and the live elements.
     */
    clear() {
        this.groups.forEach(({ instancedMesh, members }) => {
            members.forEach(({ mesh, ejected }) => {
                if (!ejected) showMesh(mesh);
            });

            if (instancedMesh.parent) instancedMesh.parent.remove(instancedMesh);
            instancedMesh.dispose();
        });

        this.groups = [];
    }
}

export default new Instancing();
