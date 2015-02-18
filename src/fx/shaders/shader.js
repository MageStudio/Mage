Class("Shader", {
    Shader: function(name, attributes, uniforms){
        this.shader = fx.ShadersEngine.get(name);
        this.name = this.shader.name;
        this.vertex = this.shader.vertex;
        this.fragment = this.shader.fragment;
        this.attributes = attributes;
        this.uniforms = uniforms;

        this.material = new THREE.ShaderMaterial({
            'attributes': this.attributes,
            'uniforms': this.uniforms,
            'vertexShader': this.shader.vertex,
            'fragmentShader': this.shader.fragment
        });
    }
})