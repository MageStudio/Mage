import { METHOD_NOT_SUPPORTED } from '../lib/messages';
import Sound from './sound';

export default class BackgroundSound extends Sound {

    update(dt) {}

    createPannerNode() {
        console.log(METHOD_NOT_SUPPORTED);
    }

    hasPannerNode() {
        console.log(METHOD_NOT_SUPPORTED);
    }

    hasTarget() {
        console.log(METHOD_NOT_SUPPORTED);
    }

    getTarget() {
        console.log(METHOD_NOT_SUPPORTED);
    }

    setTarget() {
        console.log(METHOD_NOT_SUPPORTED);
    }


}
