class AnimatedMesh extends Wage.Mesh
    constructor: (geometry, @materials, options={}) ->
        @animations = {}
        @fadeStack = []
        @warpStack = []
        # get skinning material
        originalMaterial = @materials[0]
        originalMaterial.skinning = true
        # default visibility
        @meshVisible = true
        # init
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
        @updateFades(dt)
        @updateWarps(dt)
        THREE.AnimationHandler.update(dt)
        return

    updateFades: (dt) ->
        for i in [@fadeStack.length-1..0]
            data = @fadeStack[i]
            data.timeElapsed += dt
            #: if the transition is completed, remove it from the stack
            if data.timeElapsed > data.duration
                data.anim.weight = data.endWeight
                @fadeStack.splice i, 1
                #: if animation faded out, stop it
                if data.anim.weight is 0
                    data.anim.stop 0
            #: otherwise interpolate the weight for the current time
            else
                data.anim.weight = data.startWeight + (data.endWeight - data.startWeight) * data.timeElapsed / data.duration
        return

    updateWarps: (dt) ->
        for i in [@warpStack.length-1..0]
            data = @warpStack[i]
            data.timeElapsed += dt
            if data.timeElapsed > data.duration
                data.to.weight = 1
                data.to.timeScale = 1
                data.from.weight = 0
                data.from.timeScale = 1
                data.from.stop 0
                @warpStack.splice i, 1
            else
                alpha = data.timeElapsed / data.duration
                fromToRatio = data.from.data.length / data.to.data.length
                toFromRatio = data.to.data.length / data.from.data.length
                # scale each animation proportionally
                data.from.timeScale = (1 - alpha) + fromToRatio * alpha
                data.to.timeScale = alpha + toFromRatio * (1 - alpha)
                data.from.weight = 1 - alpha
                data.to.weight = alpha
        return

    play: (animation) ->
        weight = @animations[animation].weight ?= 1
        @animations[animation].play(0, weight)
        return

    crossfade: (fromAnimation, toAnimation, duration) ->
        anim1 = @animations[fromAnimation]
        anim2 = @animations[toAnimation]
        anim1.play 0, 1
        anim2.play 0, 0
        @fadeStack.push
            anim: anim1
            startWeight: 1
            endWeight: 0
            timeElapsed: 0
            duration: duration

        @fadeStack.push
            anim: anim2
            startWeight: 0
            endWeight: 1
            timeElapsed: 0
            duration: duration
        return

    warp: (fromAnimation, toAnimation, duration) ->
        anim1 = @animations[fromAnimation]
        anim2 = @animations[toAnimation]
        anim1.play 0, 1
        anim2.play 0, 0
        @warpStack.push
            from: anim1
            to: anim2
            timeElapsed: 0
            duration: duration
        return

    applyWeight: (animation, w) ->
        @animations[animation].weight = weight

    pauseAll: ->
        for animName, animation of @animations
            if animation.isPlaying
                animation.stop()
        return

    unpauseAll: ->
        for animName, animation of @animations
            if animation.isPlaying and animation.isPaused
                animation.pause()
        return

    stopAll: ->
        for animName, animation of @animations
            if animation.isPlaying
                animation.stop 0
            animation.weight = 0
        @fadeStack.length = 0
        @warpStack.length = 0
        return

    getForward: ->
        forward = new THREE.Vector3()
        ->
            forward.set -@matrix.elements[8], -@matrix.elements[9], -matrix.elements[10]
            forward

env = self.Wage ?= {}
env.AnimatedMesh = AnimatedMesh
