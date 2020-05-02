import EffectComposer from './effects/EffectComposer';

import RenderPass from './effects/RenderPass';

import Scene from '../../base/Scene';
import HueSaturationEffect from './HueSaturationEffect';
import SepiaEffect from './SepiaEffect';
import BloomPass from './BloomPass';
import DepthOfField from './DepthOfField';

export class PostProcessing {

    constructor() {
        this.map = {
            SepiaEffect: {
                effect: SepiaEffect,
                isClass: false
            },
            HueSaturationEffect: {
                effect: HueSaturationEffect,
                isClass: false
            },
            BloomPass: {
                effect: BloomPass,
                isClass: true
            },
            DepthOfField: {
                effect: DepthOfField,
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
        this.composer.addPass(new RenderPass(Scene.scene, Scene.camera.object));
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
                console.error('[Mage] Requested effect is not available');
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
        } else {
            console.error('[Mage] Could not create requested effect');
        }
    };

    render = (dt) => {
        this.composer.render(dt);
        this.customs.forEach(e => e.render());
    }
}

export default new PostProcessing();
