import { AnimationMixer, AnimationClip, LoopRepeat, EventDispatcher } from 'three';
import { ENTITY_EVENTS } from '../constants';
import { ANIMATION_NOT_FOUND } from '../../lib/messages';

export default class AnimationHandler extends EventDispatcher {

    constructor(mesh, animations = []) {
        super();
        this.mixer = new AnimationMixer(mesh);
        this.animations = animations;
        this.addEventsListeners();
    }

    addEventsListeners() {
        this.mixer.addEventListener('loop', this.getAnimationEventHandler(ENTITY_EVENTS.ANIMATION.LOOP));
        this.mixer.addEventListener('finished', this.getAnimationEventHandler(ENTITY_EVENTS.ANIMATION.FINISHED));
    }

    getAnimationEventHandler = (type) => ({ action, direction }) => {
        this.dispatchEvent({
            type,
            action,
            direction
        })
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

    stopAll() {
        this.mixer.stopAllAction();
    }

    stopCurrentAnimation() {
        if (this.currentAction) {
            this.currentAction.stop();
        }
    }

    playAnimation(id, options) {
        const action = this.getAction(id);
        const { loop = LoopRepeat } = options;

        if (this.currentAction) {
            this.fadeToAnimation(action, options);
        } else if (action) {
            this.currentAction = this.mixer
                .clipAction(action)
                .setLoop(loop)
                .play();
        } else {
            console.warn(ANIMATION_NOT_FOUND);
        }
    }

    fadeToAnimation(action, { duration = 0.2, loop = LoopRepeat } = {}) {
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
            .setLoop(loop)
            .play();
    }

    update(dt) {
        this.mixer.update(dt);
    }
}