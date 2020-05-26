import { AnimationMixer, AnimationClip } from 'three';
import { ANIMATION_NOT_FOUND } from '../../lib/messages';

export default class AnimationHandler {

    constructor(mesh, animations = []) {
        this.mixer = new AnimationMixer(mesh);
        this.animations = animations;
    }

    playAnimation(id) {
        let action;

        if (typeof id === 'number') {
            action = this.animations[id];
        } else if (typeof id === 'string') {
            action = AnimationClip.findByName(this.animations, id);
        }

        if (action) {
            this.mixer.clipAction(action).play();
        } else {
            console.warn(ANIMATION_NOT_FOUND);
        }
    }

    update(dt) {
        console.log('updating', dt);
        this.mixer.update(dt);
    }
}