class MyGame extends Wage.App
    onCreate: ->
        @registerAsset "sound", "rain", "assets/audio/rain.mp3"
        return

    onStart: ->
        geometry = new THREE.CubeGeometry 20, 20, 20
        material = new THREE.MeshBasicMaterial
            color: 0x00ff00,
            wireframe : true

        cube = new Wage.Mesh(
            geometry
            material
            script: boxscript
        )

        console.log("Inside onCreate method")

        Wage.camera.entity.addScript camerascript

        rain = new Wage.BackgroundSound "rain",
            autoplay: true
        return

self.app = new MyGame
    camera:
        fov: 45
        near: 1
        far: 5000
