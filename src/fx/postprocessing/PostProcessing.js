import EffectComposer from './passes/EffectComposer';
import RenderPass from './passes/RenderPass';
import Scene from '../../core/Scene';
import HueSaturationEffect from './HueSaturationEffect';
import SepiaEffect from './SepiaEffect';
import BloomPass from './BloomPass';
import DepthOfField from './DepthOfField';
import SelectiveOutline from './SelectiveOutline';
import GlitchEffect from './GlitchEffect';
import { EFFECTS } from '../../lib/constants';
import {
    EFFECT_COULD_NOT_BE_CREATED,
    EFFECT_UNAVAILABLE
} from '../../lib/messages';

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
            }
        };

        this.effects = [];
        this.customs = [];
    }

    isEnabled = () => !!this.effects.length || !!this.customs.length;

    init = () => {
        window.addEventListener( 'resize', this.onWindowResize, false );

        this.composer = new EffectComposer(Scene.renderer);
        this.composer.addPass(new RenderPass(Scene.scene, Scene.getCameraObject()));
    }

    onWindowResize = () => {
        this.composer.setSize(window.innerWidth, window.innerHeight);
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

export default new PostProcessing();
