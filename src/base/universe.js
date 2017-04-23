window.M = window.M || {};

M.universe =  {

	reality : undefined,

	loaded : false,

	worker : undefined,

	bigbang : function(){
		console.log("inside universe init");

		M.universe.loaded = true;
		M.universe.reality = new HashMap();
	},

	testingShaders : function() {
		// create a wireframe material
		//shader ha bisogno di uniforms


		var material = new THREE.ShaderMaterial( {
			uniforms: {
				tExplosion: {
				  type: "t",
				  value: THREE.ImageUtils.loadTexture( 'img/explosion.png' , {}, function(t) {
					console.log(t);
				  })
				},
				time: {
				  type: "f",
				  value: 0.0
				}
			},
			vertexShader: document.getElementById( 'vertexShader' ).textContent,
			fragmentShader: document.getElementById( 'fragmentShader' ).textContent
		} );

		// create a sphere and assign the material
		var mesh = new THREE.Mesh(
			new THREE.IcosahedronGeometry( 20, 4 ),
			material
		);

		mesh.start_time = Date.now();

		mesh.auto_render = function() {

			this.material.uniforms[ 'time' ].value = .00025 * ( Date.now() - this.start_time);
		}
		app.scene.add( mesh );
		M.universe.reality.put(mesh.uuid, mesh);

	},

	addPlanetAndSatellite : function () {

		var material = new THREE.MeshBasicMaterial( { color: 0xffffff , wireframe : true } );
		var geometry = new THREE.SphereGeometry(15, 40, 40);
		geometry.dynamic = true;


		var planet = new THREE.Mesh(geometry, material);

		planet.position.x = 0;
		planet.position.y = 0;
		planet.position.z = 0;



		//addding render function
		planet.auto_render = function () {
			this.rotation.y += 0.0001;
		}

		//adding to the scene and to our map.
		app.scene.add( planet );
		M.universe.reality.put(planet.uuid, planet);

		//stampiamo la geometry appena settata
		l("PLANET GEOMETRY");
		l(planet.geometry.dynamic + " - " + planet.geometry.verticesNeedUpdate + " - " + planet.geometry.normalsNeedUpdate);

		//satellite
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff , wireframe : true } );
		var satellite = new THREE.Mesh(new THREE.SphereGeometry(30, 40, 40), material);

		satellite.position.x = 0;
		satellite.position.y = 400;
		satellite.position.z = 0;

		//addding render function
		satellite.auto_render = function () {

			this.position.x +=
			this.position.z +=

			this.rotation.y += 0.0001;
		}


	},

	update : function () {

		var keys_list = M.universe.reality.keys.concat();
		if (keys_list.length != 0) {
			var start = +new Date();
			do {
				var o = M.universe.reality.get(keys_list.shift());
				if (o && o.update) {
					o.update(app.clock.getDelta());
				}
				o.render();
			} while (keys_list.length > 0 && (+new Date() - start < 50));
		}
		
	}
};

M.universe.bigbang();
