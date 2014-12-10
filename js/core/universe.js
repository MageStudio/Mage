(function() {
	window.Universe = {};
	Universe =  {
		/*------------------------------------------------------------------------------------------
		
			we are going to use this object to store and properly udpate every single object in our
			scene. 

			we must collect informations about:
				-	light
				- 	animation
				- 	user movements
				- 	other users movements
				- 	light animation
				-   lod ( level of detail ) using trees


		------------------------------------------------------------------------------------------*/

		universe : undefined,

		loaded : false,

		worker : undefined,

		init : (function(){
			console.log("inside univers init");
			/*------------------------------------------------------------------------------------------

				this is an auto-call method. it will initialize our object map

			------------------------------------------------------------------------------------------*/
			requirejs(["js/core/util/HashMap"], function() {
				Universe.loaded = true;
				Universe.universe = new HashMap();


				//we now should recover our universe from data. how??
				//Universe.worker = new Worker('js/lib/universe_worker.js');
			

				//Universe.worker.onmessage = function(e) {
				//  var data = e.data;
				//  if (data.type === 'debug') {
				//    console.log(data.value);
				//  }
				//  else if (data.type === 'result') {
				//    // process results
				//  }
				//}


			});

		})(),

		cube : undefined,

		addRandomCube : function() {
			
			var geometry = new THREE.CubeGeometry(1,1,1);
			var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 , wireframe : true } );
			var cube = new THREE.Mesh( geometry, material );
			cube.position.x = Math.random() *5;
			cube.position.y = Math.random() *5;
			cube.position.z = Math.random() *5;

			//adding the render function.
			cube.auto_render = function() {
				this.rotation.x += 0.01;
			}

			//adding to the scene and to our map.
			core.scene.add( cube );
			Universe.universe.put(cube.uuid, cube);
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
			core.scene.add( mesh );
			Universe.universe.put(mesh.uuid, mesh);

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
			core.scene.add( planet );
			Universe.universe.put(planet.uuid, planet);

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

			/*------------------------------------------------------------------------------------------

				we are going to add or modify scene elements.

			------------------------------------------------------------------------------------------*/
			var keys_list = Universe.universe.keys.concat();   //create a clone of the original
			if (keys_list.length != 0) {
				//setTimeout(function(){
					var start = +new Date();
					do {
						//console.log(new Date() - start);
						var o = Universe.universe.get(keys_list.shift());
						//console.log(o);
						//_.defer(o._render);
						//console.log(o._render);
						if (o._render) {
							//o._render(core.clock.getDelta());
							with(o) {
								setTimeout(function() {
									_render(core.clock.getDelta());
								}, 0);
							}
						}
						/*setTimeout(function() {
							var o = Universe.universe.get(keys_list.shift());
							console.log("CULO");
							//o._render(o, core.clock.getDelta());
						}, 0);*/
						//Universe.performUpdate(keys_list.shift());
					} while (keys_list.length > 0 && (+new Date() - start < 50));

					//if (todo.length > 0){
					//    setTimeout(arguments.callee, 0);
					//} else {
						//callback(items);
						//l("ho finito di eseguire il render"),
					//}
				//}, 0);
			}	
			//Universe.performUpdate();
		},

		performUpdate : function( ) {
			/*------------------------------------------------------------------------------------------

				here we are going to call the update() method for every object.

			------------------------------------------------------------------------------------------*/
			//qui muore tutto.
			//for (key in Universe.universe.map) {
				
				
				
			//}

		}
	}
})();