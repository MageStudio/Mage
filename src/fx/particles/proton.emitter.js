/*
<!DOCTYPE HTML>
<html>

<head>
    <title>three.proton - helloworld</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
    <style type="text/css">
        body {
            font-family: Monospace;
            background-color: #000;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        
        .tips {
            position: absolute;
            top: 10px;
            right: 20px;
            color: #fff;
            font-size: 14px;
            text-align: right;
            padding: 6px 15px;
            background: rgba(0, 0, 0, .7);
        }
    </style>
</head>

<body>
    <div class="tips">Please press the "w" key
        <br><span id="info">Add Behaviours</span>
    </div>
    <div id="container"></div>
    <script src="../lib/stats.min.js"></script>
    <script src="../lib/three.min.js"></script>
    <script src="../lib/require.js"></script>
    <script src="../lib/config.js"></script>
    <script src="./js/lib/TrackballControls.js"></script>
    <script>
        var proton, emitter1, emitter2;
        var camera, scene, renderer, stats, clock, controls;

        function init() {
            initScene();
            //initLights();
            initProton();
            initPlane();
            initControls();
            addStats();
            animate();
            keydownEvent();
        }

        function initScene() {
            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
            camera.position.z = 500;
            scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0xffffff, 1, 10000);

            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0xaaccff);

            document.body.appendChild(renderer.domElement);
            window.addEventListener('resize', onWindowResize, false);
        }

        function keydownEvent() {
            var num = 0;

            document.onkeydown = function(e) {
                var keynum = window.event ? e.keyCode : e.which;
                if (keynum == 87) {
                    num++;

                    switch (num) {
                        case 1:
                            var color = new Proton.Color('random', 'random', Infinity, Proton.easeOutQuart);
                            addBehaviour(color);
                            addInfo(": Color");
                            break;

                        case 2:
                            var zone = new Proton.BoxZone(400);
                            addBehaviour(new Proton.CrossZone(zone, "bound"));
                            addInfo("+CrossZone");
                            break;

                        case 3:
                            var force = new Proton.Force(1, 0, -.1);
                            addBehaviour(force);
                            addInfo("+Force");
                            break;

                        case 4:
                            var spring = new Proton.Spring(0, 0, 0);
                            addBehaviour(spring);
                            addInfo("+Spring");
                            break;

                        case 5:
                            var repulsion = new Proton.Repulsion(new Proton.Vector3D(0, -100, 0), 2, 200);
                            addBehaviour(repulsion);
                            addInfo("+Repulsion");
                            break;

                        default:

                    }
                }
            }

            function addInfo(info) {
                document.getElementById("info").innerText += info;
            }

            function addBehaviour(behaviour) {
                emitter1.addBehaviour(behaviour);
                emitter2.addBehaviour(behaviour);
            }
        }

        function initLights() {
            var ambientLight = new THREE.AmbientLight(0x101010);
            scene.add(ambientLight);

            var pointLight = new THREE.PointLight(0xffffff, 2, 1000, 1);
            pointLight.position.set(0, 200, 200);
            scene.add(pointLight);

            var spotLight = new THREE.SpotLight(0xffffff, .5);
            spotLight.position.set(0, 500, 100);
            scene.add(spotLight);
            spotLight.lookAt(scene);
        }

        function initControls() {
            controls = new THREE.TrackballControls(camera);
            controls.rotateSpeed = 1.0;
            controls.zoomSpeed = 1.2;
            controls.panSpeed = 0.8;
            controls.noZoom = false;
            controls.noPan = false;
            controls.staticMoving = true;
            controls.dynamicDampingFactor = 0.3;
            //controls.addEventListener('change', render);
        }

        function addStats() {
            stats = new Stats();
            stats.showPanel(0);
            stats.dom.style.position = 'absolute';
            stats.dom.style.left = '0px';
            stats.dom.style.top = '0px';
            container.appendChild(stats.dom);
        }

        function initPlane() {
            var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
            var groundMat = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x050505
            });
            groundMat.color.setHSL(0.095, 1, 0.75);

            var ground = new THREE.Mesh(groundGeo, groundMat);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -200;
            scene.add(ground);
            //ground.receiveShadow = true;
        }

        function initProton() {
            proton = new Proton();

            window.emitter1 = createEmitter({
                p: {
                    x: -100,
                    y: 0
                },
                Body: createMesh("sphere")
            })

            window.emitter2 = createEmitter({
                p: {
                    x: 100,
                    y: 0
                },
                Body: createMesh("cube")
            })

            proton.addEmitter(emitter1);
            proton.addEmitter(emitter2);

            proton.addRender(new Proton.SpriteRender(scene));

            //Proton.Debug.drawZone(proton,scene,zone2);
            Proton.Debug.drawEmitter(proton, scene, emitter1);
            Proton.Debug.drawEmitter(proton, scene, emitter2);
        }

        function createSprite() {
            var map = new THREE.TextureLoader().load("./img/dot.png");
            var material = new THREE.SpriteMaterial({
                map: map,
                color: 0xff0000,
                blending: THREE.AdditiveBlending,
                fog: true
            });
            return new THREE.Sprite(material);
        }

        function createMesh(geo) {
            if (geo == "sphere") {
                var geometry = new THREE.SphereGeometry(10, 8, 8);
                var material = new THREE.MeshLambertMaterial({
                    color: "#ff0000"
                });
            } else {
                var geometry = new THREE.BoxGeometry(20, 20, 20);
                var material = new THREE.MeshLambertMaterial({
                    color: "#00ffcc"
                });
            }

            var mesh = new THREE.Mesh(geometry, material);
            return mesh;
        }


        function createEmitter(obj) {
            var emitter = new Proton.Emitter();
            emitter.rate = new Proton.Rate(new Proton.Span(100, 300), new Proton.Span(.05, .07));
            emitter.addInitialize(new Proton.Mass(0.1));
            //emitter.addInitialize(new Proton.Radius(1));
            emitter.addInitialize(new Proton.Life(.4, 1));
            //emitter.addInitialize(new Proton.Body(createSprite()));
            emitter.addInitialize(new Proton.Position(new Proton.SphereZone(30)));
            //emitter.addInitialize(new Proton.V(new Proton.Span(500, 800), new Proton.Vector3D(0, 0.3, 0), 30));
            emitter.addInitialize(new Proton.V(new Proton.Span(400, 600), new Proton.Vector3D(0, .4, 0), 50));
            emitter.addInitialize(new Proton.V(new Proton.Polar3D(10, 1, 1), 300));

            emitter.addBehaviour(new Proton.RandomDrift(1, 1, 1, .05));
            //emitter.addBehaviour(new Proton.Repulsion(new Proton.Vector3D(0, 1, 0), -1, 200));

            emitter.addBehaviour(new Proton.Rotate("random", "random"));
            emitter.addBehaviour(new Proton.Scale(3, 0.1));
            // emitter.addBehaviour(new Proton.Force(0, 3, 0));
            //Gravity
            //emitter.addBehaviour(new Proton.Gravity(.7));

            emitter.p.x = obj.p.x;
            emitter.p.y = obj.p.y;
            emitter.emit(.2, true);
            return emitter;
        }

        function animate() {
            stats.begin();
            requestAnimationFrame(animate);
            render();
            stats.end();
        }

        function render() {
            proton.update();
            renderer.render(scene, camera);
            controls.update();
            Proton.Debug.renderInfo(proton, 3);
        }

        function onWindowResize() {

        }
    </script>
</body>

</html>
*/