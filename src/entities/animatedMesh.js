/**************************************************
		Animated MESH CLASS
**************************************************/

Class("AnimatedMesh", {

    AnimatedMesh : function(geometry, material, options) {

		Entity.call(this);

        var ensureLoop = function(animation) {
            for ( var i = 0; i < animation.hierarchy.length; i ++ ) {

				var bone = animation.hierarchy[ i ];

				var first = bone.keys[ 0 ];
				var last = bone.keys[ bone.keys.length - 1 ];

				last.pos = first.pos;
				last.rot = first.rot;
				last.scl = first.scl;

			}
        };

        ensureLoop( geometry.animation );

		this.geometry = geometry;
		this.material = material;
		this.script = {};
		this.hasScript = false;

        this.geometry.computeBoundingBox();
        var boundBox = this.geometry.boundingBox;
		this.mesh = new THREE.SkinnedMesh(geometry, material);
		//adding to core
		app.add(this.mesh, this);

        //creating skeleton helper
        this.helper = new THREE.SkeletonHelper( this.mesh );
		this.helper.material.linewidth = 3;
		this.helper.visible = true;
		app.add( this.helper, this.helper );

        //creating animation
        this.animation = new THREE.Animation( this.mesh, this.geometry.animation );
	    this.animation.play();

		if (options) {
			//do something with options
			for (var o in options) {
				this[o] = options[o];
				if (o == "script") {
					this.hasScript = true;
					this.addScript(options[o], options.dir);
				}
			}
		}

	},

    update: function() {
        this.animate();
    },

    animate: function() {

        var delta = app.clock.getDelta() * 0.75;
        THREE.AnimationHandler.update(delta);
        if (this.helper) {
            this.helper.update();
        }

    }

})._extends("Entity");
