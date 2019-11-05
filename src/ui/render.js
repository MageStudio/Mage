import { render } from 'inferno';
import BaseUI from './BaseUI';

export const renderUI = (Component, options = {}) => {

    const root = options.root || '#ui';
    const scene = options.scene;

    const UI = Component || BaseUI;
    render(<UI scene={scene} />, document.querySelector(root));
}
