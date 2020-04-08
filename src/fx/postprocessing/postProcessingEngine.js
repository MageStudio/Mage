import EffectComposer from './effects/EffectComposer';

import RenderPass from './effects/RenderPass';

import SceneManager from '../../base/SceneManager';
import HueSaturationEffect from './HueSaturationEffect';
import SepiaEffect from './SepiaEffect';
import BloomPass from './BloomPass';
import DepthOfField from './DepthOfField';

export class PostProcessingEngine {

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
    }

    isEnabled() {
        return !!this.effects.length;
    }

    init = () => {
        window.addEventListener( 'resize', this.onWindowResize, false );

        this.composer = new EffectComposer(SceneManager.renderer);
        this.composer.addPass(new RenderPass(SceneManager.scene, SceneManager.camera.object));
    }

    onWindowResize = () => {
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    get(id) {
        return this.map[id] || null;
    }

    static createPass({ effect, isClass }, options) {
        let pass;
        if (effect && !isClass) {
            pass = effect(options);
        } else if (effect && isClass) {
            pass = new effect(options);
        }

        return pass;
    }

    add = (effect, options = {}) => {
        let pass;
        if (typeof effect === 'string') {
            const effectDescription = this.get(effect);
            if (effectDescription) {
                pass = PostProcessingEngine.createPass(effectDescription, options);
            } else {
                console.error('[Mage] Requested effect is not available');
                return;
            }
        } else {
            pass = PostProcessingEngine.createPass(effect, options);
        }

        if (pass) {
            this.composer.addPass(pass);
            this.effects.push(pass);
            this.composer.ensureLastPassIsRendered();
        } else {
            console.error('[Mage] Could not create requested effect');
        }
    };

    render = (dt) => {
        this.composer.render(dt);
    }
}

export default new PostProcessingEngine();
