import { OFFSCREEN_INIT } from "./events";

class OffscreenScene {

    init(config) {
        this.config = config;
    }

};

const offscreenScene = new OffscreenScene();

onmessage = ({ data }) => {
    const { event } = data;

    switch(event) {
        case OFFSCREEN_INIT:
            offscreenScene.init(data);
            break;
    }
};

