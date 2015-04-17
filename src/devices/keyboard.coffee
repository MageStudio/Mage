class Keyboard
    constructor: (control) ->
        @keys =
            q: 81,
            w: 87,
            e: 69,
            r: 82,
            t: 84,
            y: 89,
            u: 85,
            i: 73,
            o: 79,
            p: 80,
            a: 65,
            s: 83,
            d: 68,
            f: 70,
            g: 71,
            h: 72,
            j: 74,
            k: 75,
            l: 76,
            z: 90,
            x: 88,
            c: 67,
            v: 86,
            b: 66,
            n: 78,
            m: 77,
            num0: 48,
            num1: 49,
            num2: 50,
            num3: 51,
            num4: 52,
            num5: 53,
            num6: 54,
            num7: 55,
            num8: 56,
            num9: 57,
            plus: 187,
            minus: 189,
            shift: 16
            up: 38,
            down: 40,
            left: 37,
            right: 39,
            space: 32
        @keymap = {}
        @signals =
            up: {}
            down: {}
            all: new signals.Signal()
        for key, val of @keys
            @keymap[val+''] = key
            @signals.up[key] = new signals.Signal()
            @signals.down[key] = new signals.Signal()
        {bind} = Wage
        control.handler.domElement.addEventListener 'keydown', bind(this, this.keydown), false
        control.handler.domElement.addEventListener 'keyup', bind(this, this.keyup), false

    keydown: (e) ->
        if e.altKey
            return
        key = @keymap[e.keyCode+'']
        if not key
            return
        @signals.down[key].dispatch()
        @signals.all.dispatch()
        return

    keyup: (e) ->
        if e.altKey
            return
        key = @keymap[e.keyCode+'']
        if not key
            return
        @signals.up[key].dispatch()
        @signals.all.dispatch()
        return

env = self.Wage ?= {}
env.Keyboard = Keyboard
