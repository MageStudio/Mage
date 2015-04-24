class MainScene extends Wage.Scene
    create: ->
        #: create the cube
        geometry = new THREE.CubeGeometry 20, 20, 20
        material = new THREE.MeshBasicMaterial
            color: 0x00ff00,
            wireframe : true
        cube = new Wage.Mesh(
            geometry
            material
            script: boxscript
        )
        #: load rain sound
        rain = new Wage.BackgroundSound "rain",
            autoplay: true
        return


class CubeGame extends Wage.Game
    create: ->
        @scenes.main = new MainScene()
        return


class Application extends Wage.App
    onCreate: ->
        @registerAsset "sound", "rain", "assets/audio/rain.mp3"
        return

    onStart: ->
        super
        Wage.camera.entity.addScript camerascript
        return

self.app = new Application CubeGame,
    camera:
        fov: 45
        near: 1
        far: 5000
