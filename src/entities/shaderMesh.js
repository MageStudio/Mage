import { Mesh } from 'three';
import Shader from '../fx/shaders/Shader';
import SceneManager from '../base/SceneManager';
import Entity from './entity';

export default class ShaderMesh extends Entity {

    constructor(geometry, name, attributes, uniforms, options) {
        super();
        this.geometry = geometry;
        this.attributes = attributes;
        this.uniforms = uniforms;
        this.shaderName = name;

        const shader = new Shader(this.shaderName, this.attributes, this.uniforms, options);
        if (shader.instance && !(typeof shader.instance === 'function')) {
            if (!attributes) {
                this.attributes = shader.attributes;
            }
            if (!uniforms) {
                this.uniforms = shader.uniforms;
            }
            this.script = {};
            this.hasScript = false;

            this.mesh = new Mesh(geometry, shader.material);
        } else {
            this.mesh = new shader.instance(
                app.renderer,
                app.camera.object,
                app.scene,
                options
            );
        }

        //adding to core
        SceneManager.add(this.mesh, this);

        if (options) {
            //do something with options
            for (var o in options) {
                this[o] = options[o];
                if (o == "script") {
                    this.hasScript = true;
                    this.addScript(options[o], options.dir);
                }
            }
        }
    }
}
