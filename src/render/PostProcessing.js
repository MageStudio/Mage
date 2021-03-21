import EffectComposer from '../fx/postprocessing/passes/EffectComposer';
import RenderPass from '../fx/postprocessing/passes/RenderPass';
import HueSaturationEffect from '../fx/postprocessing/HueSaturationEffect';
import SepiaEffect from '../fx/postprocessing/SepiaEffect';
import BloomPass from '../fx/postprocessing/BloomPass';
import DepthOfField from '../fx/postprocessing/DepthOfField';
import SelectiveOutline from '../fx/postprocessing/SelectiveOutline';
import GlitchEffect from '../fx/postprocessing/GlitchEffect';
import { EFFECTS } from '../lib/constants';
import {
    EFFECT_COULD_NOT_BE_CREATED,
    EFFECT_UNAVAILABLE
} from '../lib/messages';
import PixelEffect from '../fx/postprocessing/PixelEffect';

export class PostProcessing {

    constructor() {
        this.map = {
            [EFFECTS.SEPIA]: {
                effect: SepiaEffect,
                isClass: false
            },
            [EFFECTS.HUE_SATURATION]: {
                effect: HueSaturationEffect,
                isClass: false
            },
            [EFFECTS.BLOOM]: {
                effect: BloomPass,
                isClass: true
            },
            [EFFECTS.DEPTH_OF_FIELD]: {
                effect: DepthOfField,
                isClass: true
            },
            [EFFECTS.SELECTIVE_OUTLINE]: {
                effect: SelectiveOutline,
                isClass: true
            },
            [EFFECTS.GLITCH]: {
                effect: GlitchEffect,
                isClass: true
            },
            [EFFECTS.PIXEL]: {
                effect: PixelEffect,
                isClass: true
            }
        };

        this.effects = [];
        this.customs = [];
    }

    isEnabled = () => !!this.effects.length || !!this.customs.length;

    init = (renderer, scene, camera) => {
        this.composer = new EffectComposer(renderer);
        this.composer.addPass(new RenderPass(scene, camera));
    }

    onResize = (h, w, ratio, devicePixelRatio) => {
        this.composer.setSize(w, h);

        this.effects.forEach(effect => {
            if (effect.onResize) {
                effect.onResize(h, w, ratio, devicePixelRatio);
            }
        })
    }

    get(id) {
        return this.map[id] || null;
    }

    static createEffect({ effect, isClass }, options) {
        let pass;
        if (effect && !isClass) {
            pass = effect(options);
        } else if (effect && isClass) {
            pass = new effect(options);
        }

        return pass;
    }

    addEffectToComposer = (effect) => {
        this.composer.addPass(effect);
        this.effects.push(effect);
        this.composer.ensureLastPassIsRendered();
    }

    addEffectToCustomEffects = (effect) => {
        this.customs.push(effect);
    }

    add = (desiredEffect, options = {}) => {
        let effect;
        if (typeof desiredEffect === 'string') {
            const effectDescription = this.get(desiredEffect);
            if (effectDescription) {
                effect = PostProcessing.createEffect(effectDescription, options);
            } else {
                console.error(EFFECT_UNAVAILABLE);
                return;
            }
        } else {
            effect = PostProcessing.createEffect(desiredEffect, options);
        }

        if (effect) {
            if (effect.isPass) {
                this.addEffectToComposer(effect);
            } else {
                this.addEffectToCustomEffects(effect);
            }

            return effect;
        } else {
            console.error(EFFECT_COULD_NOT_BE_CREATED);
        }
    };

    render = (dt) => {
        this.composer.render(dt);
        this.customs.forEach(e => e.render());
    }
}

export default PostProcessing;
