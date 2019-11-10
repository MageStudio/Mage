import { render } from 'inferno';
import BaseUI from './BaseUI';

export const renderUI = (Component, options = {}) => {

    const {
        root = '#ui',
        ...props
    } = options;

    const UI = Component || BaseUI;
    render(<UI {...props} />, document.querySelector(root));
}
