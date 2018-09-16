import Entity from './entity';

export default class ShaderMesh extends Entity {

    constructor(geometry, name, attributes, uniforms, options) {
        super();
        this.geometry = geometry;
        this.attributes = attributes;
        this.uniforms = uniforms;
        this.shaderName = name;

        const shader = new Shader(this.shaderName, this.attributes, this.uniforms, options);
        if (shader.shader && !shader.shader.instance) {
            if ( !attributes ) {
                this.attributes = shader.attributes;
            }
            if ( !uniforms ) {
                this.uniforms = shader.uniforms;
            }
            this.script = {};
            this.hasScript = false;

            this.mesh = new THREE.Mesh(geometry, shader.material);
        } else {
            this.mesh = shader.shader.instance(app.renderer, app.camera.object, app.scene, options);
        }

        //adding to core
        app.add(this.mesh, this);

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
