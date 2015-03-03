Class("ShaderMesh", {

    ShaderMesh : function(geometry, name, attributes, uniforms, options) {
        Entity.call(this);
        this.geometry = geometry;
        this.attributes = attributes;
        this.uniforms = uniforms;
        this.shaderName = name;
        var shader = new Shader(this.shaderName, this.attributes, this.uniforms);
        if ( !attributes ) {
          this.attributes = shader.attributes;
        }
        if ( !uniforms ) {
          this.uniforms = shader.uniforms;
        }
        this.script = {};
        this.hasScript = false;

        this.mesh = new THREE.Mesh(geometry, shader.material);
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

})._extends("Entity");
