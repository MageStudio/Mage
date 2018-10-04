/**
 * @author Michael Guerrero / http://realitymeltdown.com
 */

import Entity from './Entity';
import SceneManager from '../base/SceneManager';
import {
    SkinnedMesh,
    Animation,
    SkeletonHelper,
    AnimationHandler,
    Vector3
} from 'three';

export default class AnimatedMesh extends Entity {

    constructor(geometry, materials, options) {

        super();

        this.animations = {};
        this.weightSchedule = [];
        this.warpSchedule = [];


        var originalMaterial = materials[0];
        originalMaterial.skinning = true;

        this.meshVisible = true;
        this.mesh = new SkinnedMesh(geometry, originalMaterial);
        this.mesh.visible = this.meshVisible;
        SceneManager.add(this.mesh, this);


        //storing animations
        for ( var i = 0; i < geometry.animations.length; ++i ) {
            var animName = geometry.animations[ i ].name;
            this.animations[animName] = new Animation(this.mesh, geometry.animations[i]);
        }

        //creating skeleton
        this.skeleton = new SkeletonHelper(this.mesh);
        this.skeleton.material.linediwth = 3;
        this.mesh.add(this.skeleton);

        this.skeletonVisible = false;
        this.skeleton.visible = this.skeletonVisible;

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
    }

    toggleSkeleton() {
        this.skeletonVisible = !this.skeletonVisible;
        this.skeleton.visible = this.skeletonVisible;
    }

	toggleModel() {
        this.meshVisible = !this.meshVisible;
        this.mesh.visible = this.meshVisible;
	}

    setWeights(weights) {
        for (name in weights) {
            if (this.animations[name]) {
                this.animations[name].weight = weights[name];
            }
        }
    }

    update(dt) {
        this.animate(dt);
    }

    animate(dt) {

        for ( let i = this.weightSchedule.length - 1; i >= 0; --i ) {

			var data = this.weightSchedule[ i ];
			data.timeElapsed += dt;

			// If the transition is complete, remove it from the schedule
			if ( data.timeElapsed > data.duration ) {
				data.anim.weight = data.endWeight;
				this.weightSchedule.splice( i, 1 );

				// If we've faded out completely, stop the animation

				if ( data.anim.weight == 0 ) {
					data.anim.stop( 0 );
				}

			} else {
				// interpolate the weight for the current time
				data.anim.weight = data.startWeight + (data.endWeight - data.startWeight) * data.timeElapsed / data.duration;
			}
		}

		this.updateWarps(dt);
		this.skeleton.update();
        AnimationHandler.update(dt);
    }

    updateWarps(dt) {
        // Warping modifies the time scale over time to make 2 animations of different
		// lengths match. This is useful for smoothing out transitions that get out of
		// phase such as between a walk and run cycle

		for ( var i = this.warpSchedule.length - 1; i >= 0; --i ) {

			var data = this.warpSchedule[ i ];
			data.timeElapsed += dt;

			if ( data.timeElapsed > data.duration ) {

				data.to.weight = 1;
				data.to.timeScale = 1;
				data.from.weight = 0;
				data.from.timeScale = 1;
				data.from.stop( 0 );

				this.warpSchedule.splice( i, 1 );

			} else {

				var alpha = data.timeElapsed / data.duration;

				var fromLength = data.from.data.length;
				var toLength = data.to.data.length;

				var fromToRatio = fromLength / toLength;
				var toFromRatio = toLength / fromLength;

				// scale from each time proportionally to the other animation

				data.from.timeScale = ( 1 - alpha ) + fromToRatio * alpha;
				data.to.timeScale = alpha + toFromRatio * ( 1 - alpha );

				data.from.weight = 1 - alpha;
				data.to.weight = alpha;

			}

		}

    }

    play(animName) {
        var weight = this.animations[animName].weight === undefined ? this.animations[animName] : 1;
		this.animations[animName].play(0, weight);
	}

	crossfade(fromAnimName, toAnimName, duration) {
		var fromAnim = this.animations[fromAnimName];
		var toAnim = this.animations[toAnimName];

		fromAnim.play( 0, 1 );
		toAnim.play( 0, 0 );

		this.weightSchedule.push({
			anim: fromAnim,
			startWeight: 1,
			endWeight: 0,
			timeElapsed: 0,
			duration: duration

		});

		this.weightSchedule.push({
			anim: toAnim,
			startWeight: 0,
			endWeight: 1,
			timeElapsed: 0,
			duration: duration

		});
	},

	warp(fromAnimName, toAnimName, duration) {

		var fromAnim = this.animations[fromAnimName];
		var toAnim = this.animations[toAnimName];

		fromAnim.play( 0, 1 );
		toAnim.play( 0, 0 );

		this.warpSchedule.push({
			from: fromAnim,
			to: toAnim,
			timeElapsed: 0,
			duration: duration
		});

	}

	applyWeight(animName, weight) {
		this.animations[ animName ].weight = weight;
	}

	pauseAll() {
		for (var a in this.animations) {
			if (this.animations[a].isPlaying) {
				this.animations[a].stop();
			}
		}
	}

	unPauseAll() {
        for ( var a in this.animations ) {
            if ( this.animations[ a ].isPlaying && this.animations[ a ].isPaused ) {
                this.animations[ a ].pause();
            }
        }
    }


    stopAll() {

		for ( a in this.animations ) {

			if ( this.animations[ a ].isPlaying ) {
				this.animations[ a ].stop(0);
			}

			this.animations[ a ].weight = 0;

		}

		this.weightSchedule.length = 0;
		this.warpSchedule.length = 0;

	}

    getForward() {

        var forward = new Vector3();

        return () => {

            // pull the character's forward basis vector out of the matrix
            forward.set(
                -this.matrix.elements[ 8 ],
                -this.matrix.elements[ 9 ],
                -this.matrix.elements[ 10 ]
            );

            return forward;
        }
    }
}
