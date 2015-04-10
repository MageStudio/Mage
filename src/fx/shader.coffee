class Shader
    constructor: (@name, attributes, uniforms, options={}) ->
        {shaders} = Wage.managers
        @shader = shaders.get name
        @vertex = @shader.vertex
        @fragment = @shader.fragment
        @attributes = attributes ?= @shader.attributes
        @uniforms = uniforms ?= @shader.uniforms
        obj =
            attributes: @attributes
            uniforms: @uniforms
            vertexShader: @vertex
            fragmentShader: @fragment
        opt = @shader.options
        for key, val of options
            opt[key] = val
        for key, val of opt
            obj[key] = val
        @material = new THREE.ShaderMaterial obj

env = self.Wage ?= {}
env.Shader = Shader
