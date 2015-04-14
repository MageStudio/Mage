class PointLight extends Wage.Light
    constructor: (color, intensity, @distance, position, options) ->
        super color, intensity, position, options

    create: ->
        super
        @geometry = new THREE.SphereGeometry @lights.holderRadius, @lights.holderSegment, @lights.holderSegment
        @material = new THREE.MeshPhongMaterial
            color: @color
        mesh = new THREE.Mesh @geometry, @material
        @light = new THREE.PointLight @color, @intensity, @distance
        mesh.position.set @position.x, @position.y, @position.z
        @light.position = mesh.position
        mesh.add @light
        mesh

    on: ->
        self = this
        _delay = ->
            self.light.intensity += self.lights.delayFactor
            if self.light.intensity < self.intensity
                setTimeout _delay, self.lights.delayStep
            else
                self.isOn = true
            return
        _delay()
        return

    off: ->
        self = this
        _delay = ->
            self.light.intensity -= self.lights.delayFactor
            if self.light.intensity > 0
                setTimeout _delay, self.lights.delayStep
            else
                self.isOn = false
            return
        _delay()
        return


env = self.Wage ?= {}
env.PointLight = PointLight
