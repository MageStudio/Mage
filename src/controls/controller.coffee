class Controller
    constructor: (@domElement=document) ->
        if @domElement isnt document
            @domElement.setAttribute 'tabindex', -1
        @addListeners()
        return

    addListeners: ->
        @domElement.addEventListener(
            'contextmenu'
            (e) ->
                e.preventDefault()
                return
            false
        )
        return

    update: (dt) ->
        return

env = self.Wage ?= {}
env.Controller = Controller
