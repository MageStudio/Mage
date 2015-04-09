class ShaderMesh extends Wage.Mesh
    constructor: (geometry, @name, @attributes, @uniforms, options={}) ->
        shader = new Wage.Shader(@name, @attributes, @uniforms)
        if not @attributes
            @attributes = shader.attributes
        if not @uniforms
            @uniforms = shader.uniforms
        super @geometry, shader.material, options

env = self.Wage ?= {}
env.ShaderMesh = ShaderMesh
