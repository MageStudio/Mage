class PointLight extends Wage.Light
    constructor: (color, intensity, @distance, position, options) ->
        super color, intensity, position, options

    create: ->
        super
        @geometry = new THREE.SphereGeometry Wage.managers.lights.holderRadius, Wage.managers.lights.holderSegment, Wage.managers.lights.holderSegment
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
            self.light.intensity += Wage.managers.lights.delayFactor
            if self.light.intensity < self.intensity
                setTimeout _delay, Wage.managers.lights.delayStep
            else
                self.isOn = true
            return
        _delay()
        return

    off: ->
        self = this
        _delay = ->
            self.light.intensity -= Wage.managers.lights.delayFactor
            if self.light.intensity > 0
                setTimeout _delay, Wage.managers.lights.delayStep
            else
                self.isOn = false
            return
        _delay()
        return


env = self.Wage ?= {}
env.PointLight = PointLight
