Class("ShaderMesh", {

    ShaderMesh : function(geometry, name, attributes, uniforms, options) {
        Entity.call(this);
        this.geometry = geometry;
        this.attributes = attributes;
        this.uniforms = uniforms;
        this.shaderName = name;
        this.shader = new Shader(this.shaderName, this.attributes, this.uniforms);
        this.script = {};
        this.hasScript = false;

        this.mesh = new THREE.Mesh(geometry, this.shader.material);
        //adding to core
        core.add(this.mesh, this);

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

})._extends("Entity");