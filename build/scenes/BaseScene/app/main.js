/********************************************************************************
	MAIN SCRIPT
	copyright© 2014 Marco Stagni. http://marcostagni.com
********************************************************************************/

include("app/scripts/cube/mybox")

Class("MyGame", {

	MyGame: function() {
		App.call(this);
		this.loader = new THREE.ObjectLoader();
	},

	onCreate: function() {

		// ricezione del messaggio dal router
		function eventListener(event) {
			console.log("inside scene");
			console.log(event);
			//event.source.postMessage("Hi, router!", event.origin);
		}
		window.addEventListener("message", eventListener, false);
		parent.postMessage("Hi router from child", "http://localhost:8080")

		//restoring meshes
		var meshes = JSON.parse(app._scene.meshes);
		var models = JSON.parse(app._scene.models);
		for (var i in models) {
			meshes.push(models[i]);
		}
		var lights = JSON.parse(app._scene.lights);
        for (var i=0; i<meshes.length; i++) {
			var current = meshes[i];
			console.log(current);

			// loading script
			var script = current.object.userData ? current.object.userData['script'] : false,
				dir = false,
				file = false;
			if (script) {
				// we have the script for this mesh
				script = script.slice(script.lastIndexOf('scripts/') + 8);
			 	dir = script.slice(0, script.indexOf('/')),
				file = script.slice(script.indexOf('/') + 1);
			}

            var _mesh = this.loader.parse(current);

			if (_mesh.name.indexOf('_camera') > -1) {
				// dealing with a camera
				var camType = _mesh.name.replace('_', '').toLowerCase();
				if (app.camera.object.type.toLowerCase() === camType) {
					app.camera.object.position.set(_mesh.position.x, _mesh.position.y, _mesh.position.z);
					app.camera.object.rotation.set(_mesh.rotation.x, _mesh.rotation.y, _mesh.rotation.z);
					app.camera.object.scale.set(_mesh.scale.x, _mesh.scale.y, _mesh.scale.z);

					if (dir && file) {
						app.camera.addScript(file.replace('.js', ''), dir);
					}
				}
			} else {
				//every mesh must have castshadow and receive shadow enabled
	            _mesh.castShadow = true;
	            _mesh.receiveShadow = true;
				var mesh = new Mesh(_mesh.geometry, _mesh.material);
				mesh.mesh.position.set(_mesh.position.x, _mesh.position.y, _mesh.position.z);
				mesh.mesh.rotation.set(_mesh.rotation.x, _mesh.rotation.y, _mesh.rotation.z);
				mesh.mesh.scale.set(_mesh.scale.x, _mesh.scale.y, _mesh.scale.z);
				mesh.mesh.castShadow = true;
				mesh.mesh.receiveShadow = true;
				// setting texture
				if (current.textureKey) {
					var texture = ImagesEngine.get(current.textureKey);
					texture.wrapS = THREE.RepeatWrapping;
			        texture.wrapT = THREE.RepeatWrapping;
			        texture.repeat.set(1, 1);
					mesh.mesh.material.map = texture;
				}
				if (dir && file) {
					mesh.addScript(file.replace('.js', ''), dir);
				}
			}
        }
        //restoring lights
        for (var j=0; j<lights.length; j++) {
            var l = lights[j];
            //recreating light, holder, target, helper
            var o = {
                holder: (l.holder) ? app.loader.parse(l.holder) : false,
                //helper: (l.helper) ? app.loader.parse(l.helper) : false,
                target: (l.target) ? app.loader.parse(l.target) : false,
                light: (l.light) ? app.loader.parse(l.light) : false
            };
            //setting helpers ecc
            if (l.light.object.type == "DirectionalLight") {
				l = new DirectionalLight(o.light.color, o.light.intensity, o.light.distance, o.light.position, o.target);
                var size = 50;
                l.light.castShadow = true;
                //l.light.shadowCameraVisible = true;
                l.light.shadowMaSizeWidth = 512;
                l.light.shadowMapSizeHeight = 512;
                var d = 200;
                l.light.shadowCameraLeft = -d;
                l.light.shadowCameraRight = d;
                l.light.shadowCameraTop = d;
                l.light.shadowCameraBottom = -d;
                l.light.shadowCameraFar = 1000;
                //l.light.shadowDarkness = 0.2;
            } else if (l.light.object.type == "AmbientLight") {
                l = new AmbientLight(l.light.color, l.light.intensity, l.light.position);
            } else if (l.light.object.type == "PointLight") {
                //var sphereSize = 50;
                //o.helper = new THREE.PointLightHelper(o.light, sphereSize);
                //every light must cast shadow
				var d = 200;
				var position = l.holder ? l.holder.position : l.light.position;
				l = new PointLight(l.light.color, l.light.intensity, d, position);
                l.light.castShadow = true;
                l.light.shadowCameraLeft = -d;
                l.light.shadowCameraRight = d;
                l.light.shadowCameraTop = d;
                l.light.shadowCameraBottom = -d;
                l.light.shadowCameraFar = 1000;
                l.light.shadowDarkness = 0.2;
            }
        }
        //restoring models
        //restoring sounds

		/*
		include("app/SceneLoader", function() {
			app.sceneLoader = new THREE.SceneLoader();

		});
		*/
		//var geometry = new THREE.CubeGeometry(20, 20, 20);
		//var material = new THREE.MeshBasicMaterial({
		//	color: 0xff0000,
		//	wireframe : true
		//});

		//var cube = new Mesh(geometry, material, {script : "mybox", dir : "cube"});

		//console.log("Inside onCreate method");

		//document.addEventListener( 'mousemove', app.onDocumentMouseMove, false );
		//document.addEventListener( 'touchstart', app.onDocumentTouchStart, false );
		//document.addEventListener( 'touchmove', app.onDocumentTouchMove, false );
		//document.addEventListener( 'mousewheel', app.onDocumentMouseWheel, false);

		//example for camera movement
		//app.camera.addScript("cameraScript", "camera");
	},

	progressAnimation: function(next) {
		new Vivus("mage", {type: 'oneByOne', duration: 1000, onReady: function() {
			$('#mage').css('visibility', 'visible');
		}});
		$('#loader').delay(5000).fadeOut(1000);
		next();
	},

	preload: function(next) {
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load", function() {
			var scene = JSON.parse(this.responseText);
			app.loadScene(scene, next);
		});
		oReq.open("GET", "scene.json");
		oReq.send();
	},

	loadScene: function(scene, next) {
		app._scene = scene;
		next();
	},

	prepareScene: function() {

	}

})._extends("App");
