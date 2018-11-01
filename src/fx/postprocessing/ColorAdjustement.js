import {
    ScreenNode,
    FloatNode,
    ColorAdjustmentNode
} from './nodes';

export default ({
    hue = 0,
    vibrance = 0,
    brightness = 0,
    contrast = 0,
    saturation = 0
}) => {
    const screen = new ScreenNode();

    const hueNode = new ColorAdjustmentNode(screen, new FloatNode(hue), ColorAdjustmentNode.HUE);
    const satNode = new ColorAdjustmentNode(hueNode, new FloatNode(saturation), ColorAdjustmentNode.SATURATION);
    const vibranceNode = new ColorAdjustmentNode(satNode, new FloatNode(vibrance), ColorAdjustmentNode.VIBRANCE);
    const brightnessNode = new ColorAdjustmentNode(vibranceNode, new FloatNode(brightness), ColorAdjustmentNode.BRIGHTNESS);
    const contrastNode = new ColorAdjustmentNode(brightnessNode, new FloatNode(contrast), ColorAdjustmentNode.CONTRAST);


    return contrastNode;
}
