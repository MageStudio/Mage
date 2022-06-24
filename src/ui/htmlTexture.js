import html2canvas from 'html2canvas';
import { toPng, toPixelData, toJpeg } from 'html-to-image';
import { CanvasTexture } from 'three';
import { getOrCreateElement } from '../lib/dom';
import Images from '../images/Images';
import { Texture } from 'three';

const canvasTextures = {}

export const getCanvasTexture = id => canvasTextures[id];
export const hasCanvasTexture = id => Object.keys(canvasTextures).includes(id);

export const storeCanvasTexture = (key = `canvastexture_${Math.random()}`)  => (canvas) => {
    if (hasCanvasTexture(id)) {
        // update the existing texture?
    } else {
        const texture = new CanvasTexture(canvas);
        canvasTextures[key] = texture;
    
        if (!canvas.id) {
            canvas.id = key;
        }
    }
}

const updateTexture = id => dataUrl => {
    let texture = Images.get(id);
    if (!texture) {
        const image = new Image();
        texture = new Texture(image);

        Images.add(id, texture);
    }

    texture.needsUpdate = true;
    

    // console.log('got new dataUrl', dataUrl);
    // const container = getOrCreateElement('.testroot');
    // const image = getOrCreateElement('#testimg', 'img', { width: '100%' });

    // console.log(image, container); 

    // image.src = dataUrl;

    // container.appendChild(image);
    // document.body.appendChild(container);

    // const img = new Image();
    // img.src = dataUrl;
    // document.body.append(img);
}

export const convertToJPG = (id, domElement) => (
    toJpeg(domElement, { cacheBust: true }).then(updateTexture(id))
);

export const convertToPng = (id, domElement) => (
    toPng(domElement, { cacheBust: true }).then(updateTexture(id))
);

export const useCanvas = (ref) => {

}
