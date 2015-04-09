class AnimatedMesh extends Wage.Mesh
    constructor: (geometry, @materials, options={}) ->
        @animations = {}
        @weightSchedule = []
        @warpSchedule = []

        originalMaterial = materials[0]
        originalMaterial.skinning = true

        @meshVisible = true

        super geometry, originalMaterial, options

    create: ->
        mesh = new THREE.SkinnedMesh(@geometry, @material)
        # register animations
        for animation in @geometry.animations
            @animations[animation.name] = new THREE.Animation(mesh, animation)
        # register skeleton
        @skeleton = new THREE.SkeletonHelper(mesh)
        @skeleton.material.linewidth = 3
        mesh.add(@skeleton)
        @skeletonVisible = false
        @skeleton.visible = @skeletonVisible
        return mesh

    toggleSkeleton: ->
        @skeletonVisible = not @skeletonVisible
        @skeleton.visible = @skeletonVisible

    toggleModel: ->
        @meshVisible = not @meshVisible
        @object.visible = @meshVisible

    setWeights: (weights={}) ->
        for key, val of weights
            animation = @animations[key]
            if animation
                @animations[key] = val
        return

    update: (dt) ->
        @animate(dt)
        @updateWarps(dt)
        return

    animate: (dt) ->
        return

    updateWarps: (dt) ->
        return

    play: (animation) ->
        weight = @animations[animation].weight ?= 1
        @animations[animation].play(0, weight)
        return

    crossfade: (fromAnimation, toAnimation, duration) ->
        return

    warp: (fromAnimation, toAnimation, duration) ->
        return

    applyWeight: (animation, w) ->
        @animations[animation].weight = weight

    pauseAll: ->
        return

    unpauseAll: ->
        return

    stopAll: ->
        return

    getForward: ->
        forward = new THREE.Vector3()
        ->
            forward.set -@matrix.elements[8], -@matrix.elements[9], -matrix.elements[10]
            forward

env = self.Wage ?= {}
env.AnimatedMesh = AnimatedMesh
