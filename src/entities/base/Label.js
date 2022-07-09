import { toPng } from 'html-to-image';
import { SpriteMaterial, Texture, Sprite } from 'three';
import Images from '../../images/Images';
import Element from '../Element';
import { render } from 'inferno';
import { createElement } from 'inferno-create-element';
import { getUIContainer, unmount } from '../../ui';
import { ENTITY_TYPES } from '../constants';


export default class Label extends Element {

    constructor({ Component, format = 'png', width, height, ...options }) {
        super(options);
        const { name } = this.options;

        this.Component = Component;
        this.format = format;
        this.width = width;
        this.height = height;

        this.setName(name);
        this.render(Component);
    }

    buildContainerId = () => `#${this.getName()}`;

    createSprite = element => (map) => {
        const material = new SpriteMaterial({ map });
        const {
            offsetWidth,
            offsetHeight
        } = element;

        const body = new Sprite(material);
        body.scale.x = this.width || offsetHeight;
        body.scale.y = this.height || offsetWidth;

        this.setBody({ body });
        this.setEntityType(ENTITY_TYPES.LABEL);
    }

    onLabelUpdate = (domElement) => (
        this.convertToPng(this.getName(), domElement)
            .then(this.updateTexture(this.getName(), domElement))
            .catch(console.log)
    )

    onLabelMount = (domElement) => (
        this.convertToPng(this.getName(), domElement)
            .then(this.updateTexture(this.getName(), domElement))
            .then(this.createSprite(domElement))
            .catch(console.log)
    )

    onLabelUnmount = () => (
        Images.disposeTexture(this.getName())
    )

    updateTexture = (id, element) => dataUrl => {
        let texture = Images.get(id);
        const {
            offsetWidth: width,
            offsetHeight: height
        } = element;
    
        if (!texture) {
            const image = new Image();
            texture = new Texture(image);
    
            Images.add(id, texture);
        }
    
        texture.image.src = dataUrl;
        texture.image.height = height;
        texture.image.width = width;
        texture.needsUpdate = true;

        return Promise.resolve(texture);
    }

    render(Component) {
        render(
            createElement(Component, {
                onUpdate: this.onLabelUpdate,
                onMount: this.onLabelMount,
                onUnmount: this.onLabelUnmount,
                ...this.options
            }),
            getUIContainer(this.buildContainerId())
        );
    }

    convertToPng = (id, domElement) => (
        toPng(domElement, { cacheBust: true })
    )

    dispose() {
        super.dispose();
        unmount(this.buildContainerId());
    }
}
