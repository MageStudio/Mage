import { AnimationMixer, AnimationClip } from 'three';
import { ANIMATION_NOT_FOUND } from '../../lib/messages';

export default class AnimationHandler {

    constructor(mesh, animations = []) {
        this.mixer = new AnimationMixer(mesh);
        this.animations = animations;
    }

    getAction(id) {
        let action;

        if (typeof id === 'number') {
            action = this.animations[id];
        } else if (typeof id === 'string') {
            action = AnimationClip.findByName(this.animations, id);
        }

        return action;
    }

    getAvailableAnimations() {
        return this.animations.map(({ name }) => name);
    }

    playAnimation(id, options) {
        const action = this.getAction(id);

        if (this.currentAction) {
            this.fadeToAnimation(action, options);
        } else if (action) {
            this.currentAction = this.mixer.clipAction(action).play();
        } else {
            console.warn(ANIMATION_NOT_FOUND);
        }
    }

    fadeToAnimation(action, { duration = 0.2 }) {
        const previousAction = this.currentAction;
        this.currentAction = this.mixer.clipAction(action);

        if (previousAction !== this.currentAction) {
            previousAction.fadeOut(duration);
        }

        this.currentAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();
    }

    update(dt) {
        this.mixer.update(dt);
    }
}