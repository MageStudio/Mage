import { ObjectLoader, ImageBitmapLoader, LoadingManager, DataTexture } from 'three';

const TYPED_ARRAYS = {
    Int8Array: Int8Array,
    Uint8Array: Uint8Array,
    Uint8ClampedArray: Uint8ClampedArray,
    Int16Array: Int16Array,
    Uint16Array: Uint16Array,
    Int32Array: Int32Array,
    Uint32Array: Uint32Array,
    Float32Array: Float32Array,
    Float64Array: Float64Array
};

function getTypedArray(type, buffer) {
    return new TYPED_ARRAYS[type](buffer);
}

export default class OffscreenLoader extends ObjectLoader {

    constructor(manager) {
        super(manager);
    }

    parseImages(json, onLoad) {

        const scope = this;
        const images = {};

        let loader;

        function loadImage(url) {
            scope.manager.itemStart(url);

            return loader.load(url, function () {
                scope.manager.itemEnd(url);
            }, undefined, function () {
                scope.manager.itemError(url);
                scope.manager.itemEnd(url);
            });
        }

        function deserializeImage(image) {

            if (typeof image === 'string') {
                const url = image;
                const path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(url) ? url : scope.resourcePath + url;

                return loadImage(path);
            } else {
                if (image.data) {
                    return {
                        data: getTypedArray(image.type, image.data),
                        width: image.width,
                        height: image.height
                    };
                } else {
                    return null;
                }
            }
        }

        if (json !== undefined && json.length > 0) {

            const manager = new LoadingManager(onLoad);

            loader =new ImageBitmapLoader(manager).setOptions({ imageOrientation: 'none' });
            loader.setCrossOrigin(this.crossOrigin);

            for (let i = 0, il = json.length; i < il; i ++) {
                const image = json[i];
                const url = image.url;

                if (Array.isArray(url)) {
                    // load array of images e.g CubeTexture

                    images[image.uuid] = [];

                    for (let j = 0, jl = url.length; j < jl; j ++) {

                        const currentUrl = url[j];
                        const deserializedImage = deserializeImage(currentUrl);

                        if (deserializedImage !== null) {

                            if (deserializedImage instanceof HTMLImageElement) {
                                images[image.uuid].push(deserializedImage);
                            } else {
                                // special case: handle array of data textures for cube textures
                                images[image.uuid].push(new DataTexture(deserializedImage.data, deserializedImage.width, deserializedImage.height));
                            }
                        }
                    }
                } else {
                    // load single image
                    const deserializedImage = deserializeImage(image.url);

                    if (deserializedImage !== null) {
                        images[image.uuid] = deserializedImage;
                    }
                }
            }
        }
        return images;
    }
}