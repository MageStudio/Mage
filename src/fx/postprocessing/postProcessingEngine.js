window.M = window.M || {};
M.fx = M.fx || {},

M.fx.postProcessingEngine = {

    frame: new THREE.NodeFrame(),
    nodepost: new THREE.NodePostProcessing(app.renderer),

    // define post processing units outside like particles and others

    update: function() {
        // multiple post processing elements
        // each one acting on the nodePost = new THREE.NodePostProcessing(renderer);
        frame.update( delta );
		nodepost.render( scene, camera, frame );
    }
};
