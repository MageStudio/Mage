import Assets from "./Assets";
import Universe from "./Universe";
import Scene from "./Scene";
import Stats from "./Stats";
import Audio from "../audio/Audio";
import PostProcessing from "../fx/postprocessing/PostProcessing";
import Particles from "../fx/particles/Particles";
import Input from "./input/Input";
import Lights from "../lights/Lights";
import Controls from "../controls/Controls";
import Physics from "../physics";
import { EventDispatcher } from "three";
import { ONCREATE_NOT_AVAILABLE } from "../lib/messages";
import Camera from "../entities/camera";

export const author = {
    name: "Marco Stagni",
    email: "mrc.stagni@gmail.com",
    website: "http://mage.studio",
};

export class Level extends EventDispatcher {
    constructor(props) {
        super();

        this.props = props;
        this.name = this.constructor.name;
        this.debug = true;
        this.inputListenersAreSet = false;

        this.render = this.render.bind(this);
    }

    getName() {
        return this.name;
    }

    getPath() {
        return this.props.path;
    }

    prepareScene() {}

    onStateChange = state => {};
    onCreate() {}
    onUpdate() {}

    onBeforeDispose() {}
    onDispose() {}

    // parseLevelData = () => {};

    // getLevelDataURL() {
    //     return config.getLevelData(this.getPath())?.url;
    // }

    // load = (url = this.getLevelDataURL()) => {
    //     if (getWindow() && url) {
    //         return fetch(url)
    //             .then(res => res.json())
    //             .then(this.parseLevelData)
    //             .catch(() => Promise.resolve());
    //     }
    //     return Promise.resolve();
    // };

    requestNextAnimationFrame() {
        this.requestAnimationFrameId = requestNextFrame(this.render);
    }

    cancelNextAnimationFrame = () => cancelAnimationFrame(this.requestAnimationFrameId);

    render() {
        const dt = Scene.clock.getDelta();

        if (PostProcessing.isEnabled()) {
            PostProcessing.render(dt);
        } else {
            Scene.render(dt);
        }

        Particles.update(dt);
        this.onUpdate(dt);
        Scene.update(dt);
        Assets.update(dt);
        Stats.update(dt);
        Controls.update(dt);
        Input.update(dt);

        this.requestNextAnimationFrame();
    }

    init = () => {
        Scene.create(this.getName());
        Scene.createCamera(new Camera());

        Physics.init().then(() => {
            Particles.init();
            PostProcessing.init();
            Stats.init();

            this.render();

            if (this.onCreate instanceof Function) {
                this.onCreate();
            } else {
                console.log(ONCREATE_NOT_AVAILABLE);
            }
        });
    };

    dispose = () => {
        this.onBeforeDispose();

        Physics.dispose();
        Audio.dispose();
        Particles.dispose();
        PostProcessing.dispose();
        Universe.bigfreeze();
        Scene.dispose();
        Controls.dispose();
        this.cancelNextAnimationFrame();

        this.onDispose();
    };

    toJSON(parseJSON = true) {
        return {
            ...Lights.toJSON(parseJSON),
            ...Universe.toJSON(parseJSON),
            ...Audio.toJSON(parseJSON),
        };
    }
}

export default Level;
