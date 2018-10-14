import { ShaderMaterial } from 'three';
import ShadersEngine from './ShadersEngine';

export default class Shader {

    constructor( name, attributes, uniforms, options ) {
        this.instance = ShadersEngine.get(name);

        if (!this.instance) {
            this.name = this.shader.name;
            this.vertex = this.shader.vertex;
            this.fragment = this.shader.fragment;
            this.attributes = attributes ? attributes : this.shader.attributes;
            this.uniforms = uniforms ? uniforms : this.shader.uniforms;

            //creating shader options
            var object = {
                'attributes': this.attributes,
                'uniforms': this.uniforms,
                'vertexShader': this.shader.vertex,
                'fragmentShader': this.shader.fragment
            };

            //storing user options in shader options
            var opt = options ? options : this.shader.options;
            for (o in opt) {
                object[o] = opt[o];
            }

            //creating the actual material
            this.material = new ShaderMaterial(object);
        } else {
            this.instance = this.shader.instance;
        }
    }
}
