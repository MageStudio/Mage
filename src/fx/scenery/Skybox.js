import {
    CubeTexture,
    ShaderLib,
    RGBFormat,
    ShaderMaterial,
    Mesh,
    BoxGeometry,
    BackSide
} from 'three';

import Images from '../../images/Images';
import Scene from '../../base/Scene';

export default class Skybox {

    static get options() {
        return {
            textureName: {
                name: 'texture',
                type: 'string',
                default: 'skybox',
                mandatory: true
            }
        }
    }

    constructor(options) {
        this.cubeMap = new CubeTexture( [] );
        this.cubeMap.format = RGBFormat;

        if (options.texture) {
            this.buildCube(options.texture);
        } else {
            var textureName = options.textureName || 'skybox';
            this.buildCube(Images.get(textureName));
        }

        const cubeShader = ShaderLib[ 'cube' ];
        cubeShader.uniforms[ 'tCube' ].value = this.cubeMap;


        const skyBoxMaterial = new ShaderMaterial( {
            fragmentShader: cubeShader.fragmentShader,
            vertexShader: cubeShader.vertexShader,
            uniforms: cubeShader.uniforms,
            depthWrite: false,
            side: BackSide
        });

        this.mesh = new Mesh(
            new BoxGeometry( 1000000, 1000000, 1000000 ),
            skyBoxMaterial
        );

        Scene.add(this.mesh, this);
    }

    render() {}

    buildCube(image) {
        this.cubeMap.images[ 0 ] = this.getSide(image, 2, 1 ); // px
        this.cubeMap.images[ 1 ] = this.getSide(image, 0, 1 ); // nx
        this.cubeMap.images[ 2 ] = this.getSide(image, 1, 0 ); // py
        this.cubeMap.images[ 3 ] = this.getSide(image, 1, 2 ); // ny
        this.cubeMap.images[ 4 ] = this.getSide(image, 1, 1 ); // pz
        this.cubeMap.images[ 5 ] = this.getSide(image, 3, 1 ); // nz
        this.cubeMap.needsUpdate = true;
    }

    getSide(image, x, y ) {
        const size = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext( '2d' );
        context.drawImage( image, - x * size, - y * size );
        return canvas;
    }
}
