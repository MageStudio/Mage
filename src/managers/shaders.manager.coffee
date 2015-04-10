class ShadersManager extends Wage.AssetsManager
    constructor: ->
        super
        @namespace = "shaders"

    get: (id) ->
        @data[id]

    _loadFile: (name, path) ->
        scope = this
        type = path.split(".")[1]
        if type is "js"
            Wage.include path.split(".js")[0] @_loadCallback, name
        else
            request = new XMLHttpRequest()
            request.open "GET", path, true
            request.responseType = "text"
            request.onload = ->
                shader = scope._parseShader @responseText
                scope._add shader
                return
            request.send()
        return

    _parseShader: (text) ->
        obj =
            name: text.substring text.indexOf('<name>')+6, text.indexOf('</name>')
            vertex: text.substring text.indexOf('<vertex>')+8, text.indexOf('</vertex>')
            fragment: text.substring text.indexOf('<fragment>')+10, text.indexOf('</fragment>')
            attributes: {}
            uniforms: {}
            options: {}

    create: (name, data) ->
        @_add
            name: name
            vertex: data.vertex or ""
            fragment: data.fragment or ""
            attributes: data.attributes or {}
            uniforms: data.uniforms or {}
            options: data.options or {}
        return

    _add: (shader) ->
        @data[shader.name] = shader
        return


env = self.Wage ?= {}
env.ShadersManager = ShadersManager
managers = env.managers ?= {}
managers.shaders = new ShadersManager()
