self.camerascript =
    update: ->
        #console.log "updating camera"
        {screen, scene} = Wage
        @object.position.x += ( screen.mouse.x/2 - @object.position.x ) * 0.01
        @object.position.y += ( - screen.mouse.y/2 - @object.position.y ) * 0.05

        if @object.position.z < 250
            @object.position.z = 250
        if @object.position.z > 1000
            @object.position.z = 1000

        @object.lookAt scene.position
        return
