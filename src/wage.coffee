env = self.Wage ?= {}
env.clock = new THREE.Clock()

self.requestAnimationFrame = (
    window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame)

self.onload = ->
    if app isnt undefined
        Wage.app = app
    else
        Wage.app = new Wage.App()
    # TODO utils checks
    # App load
    return

self.onresize = ->
    {screen, camera, renderer} = Wage
    screen.w = window.innerWidth
    screen.h = window.innerHeight
    screen.ratio = screen.w / screen.h
    camera.aspect = screen.ratio
    camera.updateProjectionMatrix()
    renderer.setSize(screen.w / screen.h)
    return
