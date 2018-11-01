import SceneManager from '../../base/SceneManager';
import {
    ScreenNode,
    FloatNode,
    RTTNode,
    Math3Node
} from './nodes';

export default (options) => {
    const size = SceneManager.renderer.getDrawingBufferSize();
    const screen = new ScreenNode();
    const previousFrame = new RTTNode(size.width, size.height, screen);
    const motionBlur = new Math3Node(
        previousFrame,
        screen,
        new FloatNode( .5 ),
        Math3Node.MIX
    );
    const currentFrame = new RTTNode(size.width, size.height, motionBlur);

    currentFrame.saveTo = previousFrame;

    return currentFrame;
}
