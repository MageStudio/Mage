import { AnimationMixer, AnimationClip, LoopRepeat, LoopOnce, EventDispatcher } from "three";
import { ENTITY_EVENTS } from "../constants";
import { ANIMATION_NOT_FOUND } from "../../lib/messages";

const DEFAULT_BLEND_DURATION = 0.3;

export default class AnimationHandler extends EventDispatcher {
    constructor(mesh, animations = []) {
        super();
        this.mixer = new AnimationMixer(mesh);
        this.animations = animations;
        this.isPlaying = false;
        this.currentAction = null;
        this.activeActions = new Map(); // Track multiple active actions for layered blending
        this.addEventsListeners();
    }

    addEventsListeners() {
        this.mixer.addEventListener(
            "loop",
            this.getAnimationEventHandler(ENTITY_EVENTS.ANIMATION.LOOP),
        );
        this.mixer.addEventListener(
            "finished",
            this.getAnimationEventHandler(ENTITY_EVENTS.ANIMATION.FINISHED),
        );
    }

    getAnimationEventHandler =
        type =>
        ({ action, direction }) => {
            this.dispatchEvent({
                type,
                action,
                direction,
            });
        };

    getAction(id) {
        let action;

        if (typeof id === "number") {
            action = this.animations[id];
        } else if (typeof id === "string") {
            action = AnimationClip.findByName(this.animations, id);
        }

        return action;
    }

    getAvailableAnimations() {
        return this.animations.map(({ name }) => name);
    }

    stopAll() {
        this.mixer.stopAllAction();
        this.isPlaying = false;
    }

    stopCurrentAnimation() {
        if (this.currentAction) {
            this.currentAction.stop();
        }

        this.isPlaying = false;
    }

    /**
     * Stop a specific animation by name/index with optional fade out
     * @param {string|number} id - Animation name or index
     * @param {number} fadeOutDuration - Duration to fade out (0 for immediate stop)
     */
    stopAnimation(id, fadeOutDuration = 0) {
        const clip = this.getAction(id);
        if (!clip) return;

        const action = this.mixer.clipAction(clip);
        if (fadeOutDuration > 0) {
            action.fadeOut(fadeOutDuration);
        } else {
            action.stop();
        }

        this.activeActions.delete(id);
        if (this.currentAction === action) {
            this.currentAction = null;
            this.isPlaying = false;
        }
    }

    /**
     * Play an animation with optional blending from current animation
     * @param {string|number} id - Animation name or index
     * @param {Object} options - Playback options
     * @param {number} options.loop - Loop mode (LoopRepeat, LoopOnce, etc.)
     * @param {number} options.blendDuration - Duration to blend from previous animation
     * @param {number} options.timeScale - Playback speed (1 = normal, 2 = double speed)
     * @param {number} options.weight - Animation weight for layered blending (0-1)
     * @param {boolean} options.clampWhenFinished - Keep last frame when finished (for LoopOnce)
     */
    playAnimation(id, options = {}) {
        const clip = this.getAction(id);
        if (!clip) {
            console.warn(ANIMATION_NOT_FOUND);
            return null;
        }

        const {
            loop = LoopRepeat,
            blendDuration = DEFAULT_BLEND_DURATION,
            timeScale = 1,
            weight = 1,
            clampWhenFinished = true,
        } = options;

        this.isPlaying = true;

        if (this.currentAction) {
            return this.crossFadeTo(id, { ...options, blendDuration });
        } else {
            const action = this.mixer.clipAction(clip);
            this.currentAction = action;
            this.activeActions.set(id, action);

            action
                .reset()
                .setLoop(loop)
                .setEffectiveTimeScale(timeScale)
                .setEffectiveWeight(weight);

            if (loop === LoopOnce) {
                action.clampWhenFinished = clampWhenFinished;
            }

            action.play();
            return action;
        }
    }

    /**
     * Crossfade from current animation to a new animation
     * @param {string|number} id - Target animation name or index
     * @param {Object} options - Blend options
     * @param {number} options.blendDuration - Duration of the crossfade
     * @param {number} options.loop - Loop mode for the new animation
     * @param {number} options.timeScale - Playback speed
     * @param {boolean} options.warp - Whether to warp time scales during blend
     */
    crossFadeTo(id, options = {}) {
        const clip = this.getAction(id);
        if (!clip) {
            console.warn(ANIMATION_NOT_FOUND);
            return null;
        }

        const {
            blendDuration = DEFAULT_BLEND_DURATION,
            loop = LoopRepeat,
            timeScale = 1,
            warp = false,
            clampWhenFinished = true,
        } = options;

        const previousAction = this.currentAction;
        const newAction = this.mixer.clipAction(clip);

        if (previousAction === newAction) {
            return newAction; // Already playing this animation
        }

        this.currentAction = newAction;
        this.activeActions.set(id, newAction);

        newAction.reset().setLoop(loop).setEffectiveTimeScale(timeScale).setEffectiveWeight(1);

        if (loop === LoopOnce) {
            newAction.clampWhenFinished = clampWhenFinished;
        }

        newAction.play();

        if (previousAction) {
            if (warp) {
                // Synchronize time scales during crossfade
                previousAction.crossFadeTo(newAction, blendDuration, true);
            } else {
                // Standard crossfade
                previousAction.fadeOut(blendDuration);
                newAction.fadeIn(blendDuration);
            }
        }

        return newAction;
    }

    /**
     * Legacy method - kept for backwards compatibility
     */
    fadeToAnimation(action, { duration = DEFAULT_BLEND_DURATION, loop = LoopRepeat } = {}) {
        const previousAction = this.currentAction;
        this.currentAction = this.mixer.clipAction(action);

        if (previousAction && previousAction !== this.currentAction) {
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

    /**
     * Set the weight of an animation for layered blending
     * @param {string|number} id - Animation name or index
     * @param {number} weight - Weight value (0-1)
     * @param {number} fadeDuration - Optional fade duration to reach target weight
     */
    setAnimationWeight(id, weight, fadeDuration = 0) {
        const clip = this.getAction(id);
        if (!clip) return;

        const action = this.mixer.clipAction(clip);

        if (fadeDuration > 0) {
            // Gradually change weight
            const startWeight = action.getEffectiveWeight();
            const startTime = this.mixer.time;

            const updateWeight = () => {
                const elapsed = this.mixer.time - startTime;
                const t = Math.min(elapsed / fadeDuration, 1);
                action.setEffectiveWeight(startWeight + (weight - startWeight) * t);
            };

            // This will be called in the update loop
            action._weightUpdateFn = updateWeight;
        } else {
            action.setEffectiveWeight(weight);
        }
    }

    /**
     * Set the time scale (speed) of an animation
     * @param {string|number} id - Animation name or index
     * @param {number} timeScale - Speed multiplier (1 = normal)
     */
    setAnimationTimeScale(id, timeScale) {
        const clip = this.getAction(id);
        if (!clip) return;

        const action = this.mixer.clipAction(clip);
        action.setEffectiveTimeScale(timeScale);
    }

    /**
     * Get the current time of an animation
     * @param {string|number} id - Animation name or index
     * @returns {number} Current time in seconds
     */
    getAnimationTime(id) {
        const clip = this.getAction(id);
        if (!clip) return 0;

        const action = this.mixer.clipAction(clip);
        return action.time;
    }

    /**
     * Set the current time of an animation
     * @param {string|number} id - Animation name or index
     * @param {number} time - Time in seconds
     */
    setAnimationTime(id, time) {
        const clip = this.getAction(id);
        if (!clip) return;

        const action = this.mixer.clipAction(clip);
        action.time = time;
    }

    /**
     * Check if a specific animation is currently playing
     * @param {string|number} id - Animation name or index
     * @returns {boolean}
     */
    isAnimationPlaying(id) {
        const clip = this.getAction(id);
        if (!clip) return false;

        const action = this.mixer.clipAction(clip);
        return action.isRunning();
    }

    /**
     * Get the duration of an animation clip
     * @param {string|number} id - Animation name or index
     * @returns {number} Duration in seconds
     */
    getAnimationDuration(id) {
        const clip = this.getAction(id);
        return clip ? clip.duration : 0;
    }

    update(dt) {
        this.mixer.update(dt);
    }
}
