import {
    Vector2
} from 'three';
import ShaderPass from './passes/ShaderPass';

const PixelShader = {

    uniforms: {

        "tDiffuse": { value: null },
        "resolution": { value: null },
        "pixelSize": { value: 1. },

    },

    vertexShader: [

        "varying highp vec2 vUv;",

        "void main() {",

        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float pixelSize;",
        "uniform vec2 resolution;",

        "varying highp vec2 vUv;",

        "void main(){",

        "vec2 dxy = pixelSize / resolution;",
        "vec2 coord = dxy * floor( vUv / dxy );",
        "gl_FragColor = texture2D(tDiffuse, coord);",

        "}"

    ].join( "\n" )
};

export default class PixelEffect extends ShaderPass {

    constructor({ pixelSize = 16, renderToScreen = false, screen }) {
        const { h, w, devicePixelRatio } = screen;

        super(PixelShader);

        this.renderToScreen = renderToScreen;

        this.uniforms["pixelSize"].value = pixelSize;
        this.uniforms["resolution"].value = new Vector2(w, h);
        this.uniforms["resolution"].value.multiplyScalar(devicePixelRatio);
    }

    setPixelSize(pixelSize = 16) {
        this.uniforms["pixelSize"].value = pixelSize;
    }

    onResize(h, w, ratio, devicePixelRatio) {
        this.uniforms["resolution"].value.set(w, h).multiplyScalar(devicePixelRatio);
    }
}
