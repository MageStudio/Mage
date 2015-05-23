/*! wage version: 0.0.37, 23-05-2015 */
function ParticleTween(a, b) {
    this.times = a || [], this.values = b || [];
}

function Particle() {
    this.position = new THREE.Vector3(), this.velocity = new THREE.Vector3(), this.acceleration = new THREE.Vector3(), 
    this.angle = 0, this.angleVelocity = 0, this.angleAcceleration = 0, this.size = 16, 
    this.color = new THREE.Color(), this.opacity = 1, this.age = 0, this.alive = 0;
}

function ParticleEngine() {
    this.positionStyle = Type.CUBE, this.positionBase = new THREE.Vector3(), this.positionSpread = new THREE.Vector3(), 
    this.positionRadius = 0, this.velocityStyle = Type.CUBE, this.velocityBase = new THREE.Vector3(), 
    this.velocitySpread = new THREE.Vector3(), this.speedBase = 0, this.speedSpread = 0, 
    this.accelerationBase = new THREE.Vector3(), this.accelerationSpread = new THREE.Vector3(), 
    this.angleBase = 0, this.angleSpread = 0, this.angleVelocityBase = 0, this.angleVelocitySpread = 0, 
    this.angleAccelerationBase = 0, this.angleAccelerationSpread = 0, this.sizeBase = 0, 
    this.sizeSpread = 0, this.sizeTween = new ParticleTween(), this.colorBase = new THREE.Vector3(0, 1, .5), 
    this.colorSpread = new THREE.Vector3(0, 0, 0), this.colorTween = new ParticleTween(), 
    this.opacityBase = 1, this.opacitySpread = 0, this.opacityTween = new ParticleTween(), 
    this.blendStyle = THREE.NormalBlending, this.particleArray = [], this.particlesPerSecond = 100, 
    this.particleDeathAge = 1, this.emitterAge = 0, this.emitterAlive = !0, this.emitterDeathAge = 60, 
    this.particleCount = this.particlesPerSecond * Math.min(this.particleDeathAge, this.emitterDeathAge), 
    this.particleGeometry = new THREE.Geometry(), this.particleTexture = null, this.particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            texture: {
                type: "t",
                value: this.particleTexture
            }
        },
        attributes: {
            customVisible: {
                type: "f",
                value: []
            },
            customAngle: {
                type: "f",
                value: []
            },
            customSize: {
                type: "f",
                value: []
            },
            customColor: {
                type: "c",
                value: []
            },
            customOpacity: {
                type: "f",
                value: []
            }
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        transparent: !0,
        blending: THREE.NormalBlending,
        depthTest: !0
    }), this.particleMesh = new THREE.Mesh();
}

function BEE() {
    this.options = void 0, this.nodes = [], this.size = 0, this.hasRoot = !1, this._idPool = [];
}

function _preEach(a, b, c) {
    if (c) {
        var d = b + 1;
        a(c, d), _preEach(a, b, c.leftBranch), _preEach(a, b, c.rightBranch);
    }
}

function _postEach(a, b, c) {
    if (c) {
        console.log("inside _postEach"), _postEach(a, b, c.leftBranch), _postEach(a, b, c.rightBranch);
        var d = b + 1;
        a(c, d);
    }
}

function _defEach(a, b, c) {
    if (c) {
        _defEach(a, b, c.leftBranch);
        var d = b + 1;
        a(c, d), _defEach(a, b, c.rightBranch);
    }
}

function _hasLTR(a, b, c) {
    return b ? c(a.data, b.data) ? !0 : _hasLTR(e, b.leftBranch) || _hasLTR(e, b.rightBranch) : !1;
}

function _hasRTL(a, b, c) {
    return b ? c(a.data, b.data) ? !0 : _hasRTL(e, b.rightBranch) || _hasRTL(e, b.leftBranch) : !1;
}

function _orderedHas(a, b, c) {
    return b ? 0 == c(a.data, b.data) ? !0 : c(a.data, b.data) < 0 ? _orderedHas(a, b.leftBranch) : _orderedHas(a, b.rightBranch) : !1;
}

function height(a) {
    return a ? 1 + Math.max(_height(a.leftBranch), _height(a.rightBranch)) : 0;
}

function _orderedIns(a, b, c) {
    return b ? (c(a.data, b.data) < 0 || 0 == c(a.data, b.data) ? b.leftBranch = _orderedIns(a, b.leftBranch) : b.rightBranch = _orderedIns(a, b.rightBranch), 
    b) : buildNode(data, void 0, void 0);
}

function buildNode(a, b, c) {
    var d = this.createNode(a);
    return d.addLeaf(b, {
        branch: "left"
    }), d.addLeaf(c, {
        branch: "right"
    }), d;
}

function Node(a) {
    if (!(a.tree && a.tree instanceof BEE)) throw BEE.VALID_BEE;
    this.tree = a.tree;
    for (var b = Math.random().toString(BEE.MAX_ID_SIZE).slice(2); this.tree._idPool.indexOf(b) > -1; ) b = Math.random().toString(BEE.MAX_ID_SIZE).slice(2);
    this.tree._idPool.push(b), this._id = b, Object.defineProperty(this, "_id", {
        set: function() {
            throw BEE.UNTOUCHABLE;
        },
        get: function() {
            return b;
        }
    }), this.data = a.data, this.tree.size += 1, this.tree.nodes.push(this), this.leftBranch = void 0, 
    this.rightBranch = void 0, this.rightWeight = void 0, this.leftWeight = void 0, 
    this._isRoot = !1, this._isLeaf = !1, this._isParent = !1, this.children = 0, this.parents = 0, 
    this.parent = void 0;
}

function Class(a, b) {
    var c = __upperCaseFirstLetter__(a);
    if (__pool__[c] = new __class__(c, b), !b[c]) throw "NO CONSTRUCTOR PROVIDED";
    window[c] = b[c];
    for (var d in b) d != a && (window[c].prototype[d] = b[d]);
    return window[c].prototype.__print__ = function() {
        console.table(this);
    }, __pool__[c];
}

function __upperCaseFirstLetter__(a) {
    return a.length > 2 ? a[0].toUpperCase() + a.substring(1, a.length) : a.toUpperCase();
}

function include(a, b) {
    for (var c, d, e, f = [], g = document.getElementsByTagName("script"), h = 0; h < g.length; h++) f.push(g[h].src);
    var i = function(a) {
        for (var b = 0; b < f.length; b++) if (-1 != f[b].indexOf(a)) return !0;
        return !1;
    };
    if (a instanceof Array) {
        var j = 0;
        if (0 == a.length) return void console.log("Why are you triyng to include 0 scripts? This makes me sad.");
        for (var k = function() {
            j == a.length && b();
        }, l = 0; l < a.length; l++) i(a[l]) ? b && k() : (c = document.createElement("script"), 
        c.type = "text/javascript", c.src = a[l] + ".js", b && (c.onload = c.onreadystatechange = function() {
            this.readyState && "complete" != this.readyState || (j++, k());
        }), e = document.getElementsByTagName("script")[0], e.parentNode.insertBefore(c, e));
    } else "string" == typeof a && (i(a) ? b && b() : (d = !1, c = document.createElement("script"), 
    c.type = "text/javascript", c.src = a + ".js", b && (c.onload = c.onreadystatechange = function() {
        d || this.readyState && "complete" != this.readyState || (d = !0, b());
    }), e = document.getElementsByTagName("script")[0], e.parentNode.insertBefore(c, e)));
}

function randomColor() {
    for (var a = "0123456789ABCDEF".split(""), b = "#", c = 0; 6 > c; c++) b += a[Math.floor(16 * Math.random())];
    return b;
}

function componentToHex(a) {
    var b = a.toString(16);
    return 1 == b.length ? "0" + b : b;
}

function rgbToHex(a, b, c) {
    return "0x" + componentToHex(a) + componentToHex(b) + componentToHex(c);
}

function getIntValueFromHex(a) {
    return parseInt(a, 16);
}

function HashMap() {
    0 == arguments.length ? (this.total = 0, this.keys = new Array(), this.maxDimension = void 0) : 1 == arguments.length && (isNaN(arguments[0]) ? (this.total = 0, 
    this.keys = new Array(), this.maxDimension = void 0) : (this.total = 0, this.maxDimension = arguments[0], 
    this.keys = new Array())), this.map = {};
}

var license = "Copyright (c) 2015 by Marco Stagni < http://marcostagni.com mrc.stagni@gmail.com > and contributors.\n\nSome rights reserved. Redistribution and use in source and binary forms, with or without\nmodification, are permitted provided that the following conditions are\nmet:\n\n* Redistributions of source code must retain the above copyright\n  notice, this list of conditions and the following disclaimer.\n\n* Redistributions in binary form must reproduce the above\n  copyright notice, this list of conditions and the following\n  disclaimer in the documentation and/or other materials provided\n  with the distribution.\n\n* The names of the contributors may not be used to endorse or\n  promote products derived from this software without specific\n  prior written permission.\n\nTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\nLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\nA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\nOWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\nSPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\nLIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\nDATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\nTHEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\nOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\nWage contains third party software in the 'app/vendor' directory: each\nfile/module in this directory is distributed under its original license.\n\n";

!function(a, b) {
    "object" == typeof module && "object" == typeof module.exports ? module.exports = a.document ? b(a, !0) : function(a) {
        if (!a.document) throw new Error("jQuery requires a window with a document");
        return b(a);
    } : b(a);
}("undefined" != typeof window ? window : this, function(a, b) {
    function c(a) {
        var b = a.length, c = fb.type(a);
        return "function" === c || fb.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a;
    }
    function d(a, b, c) {
        if (fb.isFunction(b)) return fb.grep(a, function(a, d) {
            return !!b.call(a, d, a) !== c;
        });
        if (b.nodeType) return fb.grep(a, function(a) {
            return a === b !== c;
        });
        if ("string" == typeof b) {
            if (nb.test(b)) return fb.filter(b, a, c);
            b = fb.filter(b, a);
        }
        return fb.grep(a, function(a) {
            return fb.inArray(a, b) >= 0 !== c;
        });
    }
    function e(a, b) {
        do a = a[b]; while (a && 1 !== a.nodeType);
        return a;
    }
    function f(a) {
        var b = vb[a] = {};
        return fb.each(a.match(ub) || [], function(a, c) {
            b[c] = !0;
        }), b;
    }
    function g() {
        pb.addEventListener ? (pb.removeEventListener("DOMContentLoaded", h, !1), a.removeEventListener("load", h, !1)) : (pb.detachEvent("onreadystatechange", h), 
        a.detachEvent("onload", h));
    }
    function h() {
        (pb.addEventListener || "load" === event.type || "complete" === pb.readyState) && (g(), 
        fb.ready());
    }
    function i(a, b, c) {
        if (void 0 === c && 1 === a.nodeType) {
            var d = "data-" + b.replace(Ab, "-$1").toLowerCase();
            if (c = a.getAttribute(d), "string" == typeof c) {
                try {
                    c = "true" === c ? !0 : "false" === c ? !1 : "null" === c ? null : +c + "" === c ? +c : zb.test(c) ? fb.parseJSON(c) : c;
                } catch (e) {}
                fb.data(a, b, c);
            } else c = void 0;
        }
        return c;
    }
    function j(a) {
        var b;
        for (b in a) if (("data" !== b || !fb.isEmptyObject(a[b])) && "toJSON" !== b) return !1;
        return !0;
    }
    function k(a, b, c, d) {
        if (fb.acceptData(a)) {
            var e, f, g = fb.expando, h = a.nodeType, i = h ? fb.cache : a, j = h ? a[g] : a[g] && g;
            if (j && i[j] && (d || i[j].data) || void 0 !== c || "string" != typeof b) return j || (j = h ? a[g] = W.pop() || fb.guid++ : g), 
            i[j] || (i[j] = h ? {} : {
                toJSON: fb.noop
            }), ("object" == typeof b || "function" == typeof b) && (d ? i[j] = fb.extend(i[j], b) : i[j].data = fb.extend(i[j].data, b)), 
            f = i[j], d || (f.data || (f.data = {}), f = f.data), void 0 !== c && (f[fb.camelCase(b)] = c), 
            "string" == typeof b ? (e = f[b], null == e && (e = f[fb.camelCase(b)])) : e = f, 
            e;
        }
    }
    function l(a, b, c) {
        if (fb.acceptData(a)) {
            var d, e, f = a.nodeType, g = f ? fb.cache : a, h = f ? a[fb.expando] : fb.expando;
            if (g[h]) {
                if (b && (d = c ? g[h] : g[h].data)) {
                    fb.isArray(b) ? b = b.concat(fb.map(b, fb.camelCase)) : b in d ? b = [ b ] : (b = fb.camelCase(b), 
                    b = b in d ? [ b ] : b.split(" ")), e = b.length;
                    for (;e--; ) delete d[b[e]];
                    if (c ? !j(d) : !fb.isEmptyObject(d)) return;
                }
                (c || (delete g[h].data, j(g[h]))) && (f ? fb.cleanData([ a ], !0) : db.deleteExpando || g != g.window ? delete g[h] : g[h] = null);
            }
        }
    }
    function m() {
        return !0;
    }
    function n() {
        return !1;
    }
    function o() {
        try {
            return pb.activeElement;
        } catch (a) {}
    }
    function p(a) {
        var b = Lb.split("|"), c = a.createDocumentFragment();
        if (c.createElement) for (;b.length; ) c.createElement(b.pop());
        return c;
    }
    function q(a, b) {
        var c, d, e = 0, f = typeof a.getElementsByTagName !== yb ? a.getElementsByTagName(b || "*") : typeof a.querySelectorAll !== yb ? a.querySelectorAll(b || "*") : void 0;
        if (!f) for (f = [], c = a.childNodes || a; null != (d = c[e]); e++) !b || fb.nodeName(d, b) ? f.push(d) : fb.merge(f, q(d, b));
        return void 0 === b || b && fb.nodeName(a, b) ? fb.merge([ a ], f) : f;
    }
    function r(a) {
        Fb.test(a.type) && (a.defaultChecked = a.checked);
    }
    function s(a, b) {
        return fb.nodeName(a, "table") && fb.nodeName(11 !== b.nodeType ? b : b.firstChild, "tr") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a;
    }
    function t(a) {
        return a.type = (null !== fb.find.attr(a, "type")) + "/" + a.type, a;
    }
    function u(a) {
        var b = Wb.exec(a.type);
        return b ? a.type = b[1] : a.removeAttribute("type"), a;
    }
    function v(a, b) {
        for (var c, d = 0; null != (c = a[d]); d++) fb._data(c, "globalEval", !b || fb._data(b[d], "globalEval"));
    }
    function w(a, b) {
        if (1 === b.nodeType && fb.hasData(a)) {
            var c, d, e, f = fb._data(a), g = fb._data(b, f), h = f.events;
            if (h) {
                delete g.handle, g.events = {};
                for (c in h) for (d = 0, e = h[c].length; e > d; d++) fb.event.add(b, c, h[c][d]);
            }
            g.data && (g.data = fb.extend({}, g.data));
        }
    }
    function x(a, b) {
        var c, d, e;
        if (1 === b.nodeType) {
            if (c = b.nodeName.toLowerCase(), !db.noCloneEvent && b[fb.expando]) {
                e = fb._data(b);
                for (d in e.events) fb.removeEvent(b, d, e.handle);
                b.removeAttribute(fb.expando);
            }
            "script" === c && b.text !== a.text ? (t(b).text = a.text, u(b)) : "object" === c ? (b.parentNode && (b.outerHTML = a.outerHTML), 
            db.html5Clone && a.innerHTML && !fb.trim(b.innerHTML) && (b.innerHTML = a.innerHTML)) : "input" === c && Fb.test(a.type) ? (b.defaultChecked = b.checked = a.checked, 
            b.value !== a.value && (b.value = a.value)) : "option" === c ? b.defaultSelected = b.selected = a.defaultSelected : ("input" === c || "textarea" === c) && (b.defaultValue = a.defaultValue);
        }
    }
    function y(b, c) {
        var d = fb(c.createElement(b)).appendTo(c.body), e = a.getDefaultComputedStyle ? a.getDefaultComputedStyle(d[0]).display : fb.css(d[0], "display");
        return d.detach(), e;
    }
    function z(a) {
        var b = pb, c = ac[a];
        return c || (c = y(a, b), "none" !== c && c || (_b = (_b || fb("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement), 
        b = (_b[0].contentWindow || _b[0].contentDocument).document, b.write(), b.close(), 
        c = y(a, b), _b.detach()), ac[a] = c), c;
    }
    function A(a, b) {
        return {
            get: function() {
                var c = a();
                return null != c ? c ? void delete this.get : (this.get = b).apply(this, arguments) : void 0;
            }
        };
    }
    function B(a, b) {
        if (b in a) return b;
        for (var c = b.charAt(0).toUpperCase() + b.slice(1), d = b, e = nc.length; e--; ) if (b = nc[e] + c, 
        b in a) return b;
        return d;
    }
    function C(a, b) {
        for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++) d = a[g], d.style && (f[g] = fb._data(d, "olddisplay"), 
        c = d.style.display, b ? (f[g] || "none" !== c || (d.style.display = ""), "" === d.style.display && Db(d) && (f[g] = fb._data(d, "olddisplay", z(d.nodeName)))) : f[g] || (e = Db(d), 
        (c && "none" !== c || !e) && fb._data(d, "olddisplay", e ? c : fb.css(d, "display"))));
        for (g = 0; h > g; g++) d = a[g], d.style && (b && "none" !== d.style.display && "" !== d.style.display || (d.style.display = b ? f[g] || "" : "none"));
        return a;
    }
    function D(a, b, c) {
        var d = jc.exec(b);
        return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || "px") : b;
    }
    function E(a, b, c, d, e) {
        for (var f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, g = 0; 4 > f; f += 2) "margin" === c && (g += fb.css(a, c + Cb[f], !0, e)), 
        d ? ("content" === c && (g -= fb.css(a, "padding" + Cb[f], !0, e)), "margin" !== c && (g -= fb.css(a, "border" + Cb[f] + "Width", !0, e))) : (g += fb.css(a, "padding" + Cb[f], !0, e), 
        "padding" !== c && (g += fb.css(a, "border" + Cb[f] + "Width", !0, e)));
        return g;
    }
    function F(a, b, c) {
        var d = !0, e = "width" === b ? a.offsetWidth : a.offsetHeight, f = bc(a), g = db.boxSizing() && "border-box" === fb.css(a, "boxSizing", !1, f);
        if (0 >= e || null == e) {
            if (e = cc(a, b, f), (0 > e || null == e) && (e = a.style[b]), ec.test(e)) return e;
            d = g && (db.boxSizingReliable() || e === a.style[b]), e = parseFloat(e) || 0;
        }
        return e + E(a, b, c || (g ? "border" : "content"), d, f) + "px";
    }
    function G(a, b, c, d, e) {
        return new G.prototype.init(a, b, c, d, e);
    }
    function H() {
        return setTimeout(function() {
            oc = void 0;
        }), oc = fb.now();
    }
    function I(a, b) {
        var c, d = {
            height: a
        }, e = 0;
        for (b = b ? 1 : 0; 4 > e; e += 2 - b) c = Cb[e], d["margin" + c] = d["padding" + c] = a;
        return b && (d.opacity = d.width = a), d;
    }
    function J(a, b, c) {
        for (var d, e = (uc[b] || []).concat(uc["*"]), f = 0, g = e.length; g > f; f++) if (d = e[f].call(c, b, a)) return d;
    }
    function K(a, b, c) {
        var d, e, f, g, h, i, j, k, l = this, m = {}, n = a.style, o = a.nodeType && Db(a), p = fb._data(a, "fxshow");
        c.queue || (h = fb._queueHooks(a, "fx"), null == h.unqueued && (h.unqueued = 0, 
        i = h.empty.fire, h.empty.fire = function() {
            h.unqueued || i();
        }), h.unqueued++, l.always(function() {
            l.always(function() {
                h.unqueued--, fb.queue(a, "fx").length || h.empty.fire();
            });
        })), 1 === a.nodeType && ("height" in b || "width" in b) && (c.overflow = [ n.overflow, n.overflowX, n.overflowY ], 
        j = fb.css(a, "display"), k = z(a.nodeName), "none" === j && (j = k), "inline" === j && "none" === fb.css(a, "float") && (db.inlineBlockNeedsLayout && "inline" !== k ? n.zoom = 1 : n.display = "inline-block")), 
        c.overflow && (n.overflow = "hidden", db.shrinkWrapBlocks() || l.always(function() {
            n.overflow = c.overflow[0], n.overflowX = c.overflow[1], n.overflowY = c.overflow[2];
        }));
        for (d in b) if (e = b[d], qc.exec(e)) {
            if (delete b[d], f = f || "toggle" === e, e === (o ? "hide" : "show")) {
                if ("show" !== e || !p || void 0 === p[d]) continue;
                o = !0;
            }
            m[d] = p && p[d] || fb.style(a, d);
        }
        if (!fb.isEmptyObject(m)) {
            p ? "hidden" in p && (o = p.hidden) : p = fb._data(a, "fxshow", {}), f && (p.hidden = !o), 
            o ? fb(a).show() : l.done(function() {
                fb(a).hide();
            }), l.done(function() {
                var b;
                fb._removeData(a, "fxshow");
                for (b in m) fb.style(a, b, m[b]);
            });
            for (d in m) g = J(o ? p[d] : 0, d, l), d in p || (p[d] = g.start, o && (g.end = g.start, 
            g.start = "width" === d || "height" === d ? 1 : 0));
        }
    }
    function L(a, b) {
        var c, d, e, f, g;
        for (c in a) if (d = fb.camelCase(c), e = b[d], f = a[c], fb.isArray(f) && (e = f[1], 
        f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = fb.cssHooks[d], g && "expand" in g) {
            f = g.expand(f), delete a[d];
            for (c in f) c in a || (a[c] = f[c], b[c] = e);
        } else b[d] = e;
    }
    function M(a, b, c) {
        var d, e, f = 0, g = tc.length, h = fb.Deferred().always(function() {
            delete i.elem;
        }), i = function() {
            if (e) return !1;
            for (var b = oc || H(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++) j.tweens[g].run(f);
            return h.notifyWith(a, [ j, f, c ]), 1 > f && i ? c : (h.resolveWith(a, [ j ]), 
            !1);
        }, j = h.promise({
            elem: a,
            props: fb.extend({}, b),
            opts: fb.extend(!0, {
                specialEasing: {}
            }, c),
            originalProperties: b,
            originalOptions: c,
            startTime: oc || H(),
            duration: c.duration,
            tweens: [],
            createTween: function(b, c) {
                var d = fb.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing);
                return j.tweens.push(d), d;
            },
            stop: function(b) {
                var c = 0, d = b ? j.tweens.length : 0;
                if (e) return this;
                for (e = !0; d > c; c++) j.tweens[c].run(1);
                return b ? h.resolveWith(a, [ j, b ]) : h.rejectWith(a, [ j, b ]), this;
            }
        }), k = j.props;
        for (L(k, j.opts.specialEasing); g > f; f++) if (d = tc[f].call(j, a, k, j.opts)) return d;
        return fb.map(k, J, j), fb.isFunction(j.opts.start) && j.opts.start.call(a, j), 
        fb.fx.timer(fb.extend(i, {
            elem: a,
            anim: j,
            queue: j.opts.queue
        })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always);
    }
    function N(a) {
        return function(b, c) {
            "string" != typeof b && (c = b, b = "*");
            var d, e = 0, f = b.toLowerCase().match(ub) || [];
            if (fb.isFunction(c)) for (;d = f[e++]; ) "+" === d.charAt(0) ? (d = d.slice(1) || "*", 
            (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c);
        };
    }
    function O(a, b, c, d) {
        function e(h) {
            var i;
            return f[h] = !0, fb.each(a[h] || [], function(a, h) {
                var j = h(b, c, d);
                return "string" != typeof j || g || f[j] ? g ? !(i = j) : void 0 : (b.dataTypes.unshift(j), 
                e(j), !1);
            }), i;
        }
        var f = {}, g = a === Sc;
        return e(b.dataTypes[0]) || !f["*"] && e("*");
    }
    function P(a, b) {
        var c, d, e = fb.ajaxSettings.flatOptions || {};
        for (d in b) void 0 !== b[d] && ((e[d] ? a : c || (c = {}))[d] = b[d]);
        return c && fb.extend(!0, a, c), a;
    }
    function Q(a, b, c) {
        for (var d, e, f, g, h = a.contents, i = a.dataTypes; "*" === i[0]; ) i.shift(), 
        void 0 === e && (e = a.mimeType || b.getResponseHeader("Content-Type"));
        if (e) for (g in h) if (h[g] && h[g].test(e)) {
            i.unshift(g);
            break;
        }
        if (i[0] in c) f = i[0]; else {
            for (g in c) {
                if (!i[0] || a.converters[g + " " + i[0]]) {
                    f = g;
                    break;
                }
                d || (d = g);
            }
            f = f || d;
        }
        return f ? (f !== i[0] && i.unshift(f), c[f]) : void 0;
    }
    function R(a, b, c, d) {
        var e, f, g, h, i, j = {}, k = a.dataTypes.slice();
        if (k[1]) for (g in a.converters) j[g.toLowerCase()] = a.converters[g];
        for (f = k.shift(); f; ) if (a.responseFields[f] && (c[a.responseFields[f]] = b), 
        !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift()) if ("*" === f) f = i; else if ("*" !== i && i !== f) {
            if (g = j[i + " " + f] || j["* " + f], !g) for (e in j) if (h = e.split(" "), h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]])) {
                g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1]));
                break;
            }
            if (g !== !0) if (g && a["throws"]) b = g(b); else try {
                b = g(b);
            } catch (l) {
                return {
                    state: "parsererror",
                    error: g ? l : "No conversion from " + i + " to " + f
                };
            }
        }
        return {
            state: "success",
            data: b
        };
    }
    function S(a, b, c, d) {
        var e;
        if (fb.isArray(b)) fb.each(b, function(b, e) {
            c || Wc.test(a) ? d(a, e) : S(a + "[" + ("object" == typeof e ? b : "") + "]", e, c, d);
        }); else if (c || "object" !== fb.type(b)) d(a, b); else for (e in b) S(a + "[" + e + "]", b[e], c, d);
    }
    function T() {
        try {
            return new a.XMLHttpRequest();
        } catch (b) {}
    }
    function U() {
        try {
            return new a.ActiveXObject("Microsoft.XMLHTTP");
        } catch (b) {}
    }
    function V(a) {
        return fb.isWindow(a) ? a : 9 === a.nodeType ? a.defaultView || a.parentWindow : !1;
    }
    var W = [], X = W.slice, Y = W.concat, Z = W.push, $ = W.indexOf, _ = {}, ab = _.toString, bb = _.hasOwnProperty, cb = "".trim, db = {}, eb = "1.11.0", fb = function(a, b) {
        return new fb.fn.init(a, b);
    }, gb = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, hb = /^-ms-/, ib = /-([\da-z])/gi, jb = function(a, b) {
        return b.toUpperCase();
    };
    fb.fn = fb.prototype = {
        jquery: eb,
        constructor: fb,
        selector: "",
        length: 0,
        toArray: function() {
            return X.call(this);
        },
        get: function(a) {
            return null != a ? 0 > a ? this[a + this.length] : this[a] : X.call(this);
        },
        pushStack: function(a) {
            var b = fb.merge(this.constructor(), a);
            return b.prevObject = this, b.context = this.context, b;
        },
        each: function(a, b) {
            return fb.each(this, a, b);
        },
        map: function(a) {
            return this.pushStack(fb.map(this, function(b, c) {
                return a.call(b, c, b);
            }));
        },
        slice: function() {
            return this.pushStack(X.apply(this, arguments));
        },
        first: function() {
            return this.eq(0);
        },
        last: function() {
            return this.eq(-1);
        },
        eq: function(a) {
            var b = this.length, c = +a + (0 > a ? b : 0);
            return this.pushStack(c >= 0 && b > c ? [ this[c] ] : []);
        },
        end: function() {
            return this.prevObject || this.constructor(null);
        },
        push: Z,
        sort: W.sort,
        splice: W.splice
    }, fb.extend = fb.fn.extend = function() {
        var a, b, c, d, e, f, g = arguments[0] || {}, h = 1, i = arguments.length, j = !1;
        for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == typeof g || fb.isFunction(g) || (g = {}), 
        h === i && (g = this, h--); i > h; h++) if (null != (e = arguments[h])) for (d in e) a = g[d], 
        c = e[d], g !== c && (j && c && (fb.isPlainObject(c) || (b = fb.isArray(c))) ? (b ? (b = !1, 
        f = a && fb.isArray(a) ? a : []) : f = a && fb.isPlainObject(a) ? a : {}, g[d] = fb.extend(j, f, c)) : void 0 !== c && (g[d] = c));
        return g;
    }, fb.extend({
        expando: "jQuery" + (eb + Math.random()).replace(/\D/g, ""),
        isReady: !0,
        error: function(a) {
            throw new Error(a);
        },
        noop: function() {},
        isFunction: function(a) {
            return "function" === fb.type(a);
        },
        isArray: Array.isArray || function(a) {
            return "array" === fb.type(a);
        },
        isWindow: function(a) {
            return null != a && a == a.window;
        },
        isNumeric: function(a) {
            return a - parseFloat(a) >= 0;
        },
        isEmptyObject: function(a) {
            var b;
            for (b in a) return !1;
            return !0;
        },
        isPlainObject: function(a) {
            var b;
            if (!a || "object" !== fb.type(a) || a.nodeType || fb.isWindow(a)) return !1;
            try {
                if (a.constructor && !bb.call(a, "constructor") && !bb.call(a.constructor.prototype, "isPrototypeOf")) return !1;
            } catch (c) {
                return !1;
            }
            if (db.ownLast) for (b in a) return bb.call(a, b);
            for (b in a) ;
            return void 0 === b || bb.call(a, b);
        },
        type: function(a) {
            return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? _[ab.call(a)] || "object" : typeof a;
        },
        globalEval: function(b) {
            b && fb.trim(b) && (a.execScript || function(b) {
                a.eval.call(a, b);
            })(b);
        },
        camelCase: function(a) {
            return a.replace(hb, "ms-").replace(ib, jb);
        },
        nodeName: function(a, b) {
            return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase();
        },
        each: function(a, b, d) {
            var e, f = 0, g = a.length, h = c(a);
            if (d) {
                if (h) for (;g > f && (e = b.apply(a[f], d), e !== !1); f++) ; else for (f in a) if (e = b.apply(a[f], d), 
                e === !1) break;
            } else if (h) for (;g > f && (e = b.call(a[f], f, a[f]), e !== !1); f++) ; else for (f in a) if (e = b.call(a[f], f, a[f]), 
            e === !1) break;
            return a;
        },
        trim: cb && !cb.call("﻿ ") ? function(a) {
            return null == a ? "" : cb.call(a);
        } : function(a) {
            return null == a ? "" : (a + "").replace(gb, "");
        },
        makeArray: function(a, b) {
            var d = b || [];
            return null != a && (c(Object(a)) ? fb.merge(d, "string" == typeof a ? [ a ] : a) : Z.call(d, a)), 
            d;
        },
        inArray: function(a, b, c) {
            var d;
            if (b) {
                if ($) return $.call(b, a, c);
                for (d = b.length, c = c ? 0 > c ? Math.max(0, d + c) : c : 0; d > c; c++) if (c in b && b[c] === a) return c;
            }
            return -1;
        },
        merge: function(a, b) {
            for (var c = +b.length, d = 0, e = a.length; c > d; ) a[e++] = b[d++];
            if (c !== c) for (;void 0 !== b[d]; ) a[e++] = b[d++];
            return a.length = e, a;
        },
        grep: function(a, b, c) {
            for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++) d = !b(a[f], f), d !== h && e.push(a[f]);
            return e;
        },
        map: function(a, b, d) {
            var e, f = 0, g = a.length, h = c(a), i = [];
            if (h) for (;g > f; f++) e = b(a[f], f, d), null != e && i.push(e); else for (f in a) e = b(a[f], f, d), 
            null != e && i.push(e);
            return Y.apply([], i);
        },
        guid: 1,
        proxy: function(a, b) {
            var c, d, e;
            return "string" == typeof b && (e = a[b], b = a, a = e), fb.isFunction(a) ? (c = X.call(arguments, 2), 
            d = function() {
                return a.apply(b || this, c.concat(X.call(arguments)));
            }, d.guid = a.guid = a.guid || fb.guid++, d) : void 0;
        },
        now: function() {
            return +new Date();
        },
        support: db
    }), fb.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(a, b) {
        _["[object " + b + "]"] = b.toLowerCase();
    });
    var kb = function(a) {
        function b(a, b, c, d) {
            var e, f, g, h, i, j, l, o, p, q;
            if ((b ? b.ownerDocument || b : O) !== G && F(b), b = b || G, c = c || [], !a || "string" != typeof a) return c;
            if (1 !== (h = b.nodeType) && 9 !== h) return [];
            if (I && !d) {
                if (e = sb.exec(a)) if (g = e[1]) {
                    if (9 === h) {
                        if (f = b.getElementById(g), !f || !f.parentNode) return c;
                        if (f.id === g) return c.push(f), c;
                    } else if (b.ownerDocument && (f = b.ownerDocument.getElementById(g)) && M(b, f) && f.id === g) return c.push(f), 
                    c;
                } else {
                    if (e[2]) return _.apply(c, b.getElementsByTagName(a)), c;
                    if ((g = e[3]) && x.getElementsByClassName && b.getElementsByClassName) return _.apply(c, b.getElementsByClassName(g)), 
                    c;
                }
                if (x.qsa && (!J || !J.test(a))) {
                    if (o = l = N, p = b, q = 9 === h && a, 1 === h && "object" !== b.nodeName.toLowerCase()) {
                        for (j = m(a), (l = b.getAttribute("id")) ? o = l.replace(ub, "\\$&") : b.setAttribute("id", o), 
                        o = "[id='" + o + "'] ", i = j.length; i--; ) j[i] = o + n(j[i]);
                        p = tb.test(a) && k(b.parentNode) || b, q = j.join(",");
                    }
                    if (q) try {
                        return _.apply(c, p.querySelectorAll(q)), c;
                    } catch (r) {} finally {
                        l || b.removeAttribute("id");
                    }
                }
            }
            return v(a.replace(ib, "$1"), b, c, d);
        }
        function c() {
            function a(c, d) {
                return b.push(c + " ") > y.cacheLength && delete a[b.shift()], a[c + " "] = d;
            }
            var b = [];
            return a;
        }
        function d(a) {
            return a[N] = !0, a;
        }
        function e(a) {
            var b = G.createElement("div");
            try {
                return !!a(b);
            } catch (c) {
                return !1;
            } finally {
                b.parentNode && b.parentNode.removeChild(b), b = null;
            }
        }
        function f(a, b) {
            for (var c = a.split("|"), d = a.length; d--; ) y.attrHandle[c[d]] = b;
        }
        function g(a, b) {
            var c = b && a, d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || W) - (~a.sourceIndex || W);
            if (d) return d;
            if (c) for (;c = c.nextSibling; ) if (c === b) return -1;
            return a ? 1 : -1;
        }
        function h(a) {
            return function(b) {
                var c = b.nodeName.toLowerCase();
                return "input" === c && b.type === a;
            };
        }
        function i(a) {
            return function(b) {
                var c = b.nodeName.toLowerCase();
                return ("input" === c || "button" === c) && b.type === a;
            };
        }
        function j(a) {
            return d(function(b) {
                return b = +b, d(function(c, d) {
                    for (var e, f = a([], c.length, b), g = f.length; g--; ) c[e = f[g]] && (c[e] = !(d[e] = c[e]));
                });
            });
        }
        function k(a) {
            return a && typeof a.getElementsByTagName !== V && a;
        }
        function l() {}
        function m(a, c) {
            var d, e, f, g, h, i, j, k = S[a + " "];
            if (k) return c ? 0 : k.slice(0);
            for (h = a, i = [], j = y.preFilter; h; ) {
                (!d || (e = jb.exec(h))) && (e && (h = h.slice(e[0].length) || h), i.push(f = [])), 
                d = !1, (e = kb.exec(h)) && (d = e.shift(), f.push({
                    value: d,
                    type: e[0].replace(ib, " ")
                }), h = h.slice(d.length));
                for (g in y.filter) !(e = ob[g].exec(h)) || j[g] && !(e = j[g](e)) || (d = e.shift(), 
                f.push({
                    value: d,
                    type: g,
                    matches: e
                }), h = h.slice(d.length));
                if (!d) break;
            }
            return c ? h.length : h ? b.error(a) : S(a, i).slice(0);
        }
        function n(a) {
            for (var b = 0, c = a.length, d = ""; c > b; b++) d += a[b].value;
            return d;
        }
        function o(a, b, c) {
            var d = b.dir, e = c && "parentNode" === d, f = Q++;
            return b.first ? function(b, c, f) {
                for (;b = b[d]; ) if (1 === b.nodeType || e) return a(b, c, f);
            } : function(b, c, g) {
                var h, i, j = [ P, f ];
                if (g) {
                    for (;b = b[d]; ) if ((1 === b.nodeType || e) && a(b, c, g)) return !0;
                } else for (;b = b[d]; ) if (1 === b.nodeType || e) {
                    if (i = b[N] || (b[N] = {}), (h = i[d]) && h[0] === P && h[1] === f) return j[2] = h[2];
                    if (i[d] = j, j[2] = a(b, c, g)) return !0;
                }
            };
        }
        function p(a) {
            return a.length > 1 ? function(b, c, d) {
                for (var e = a.length; e--; ) if (!a[e](b, c, d)) return !1;
                return !0;
            } : a[0];
        }
        function q(a, b, c, d, e) {
            for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++) (f = a[h]) && (!c || c(f, d, e)) && (g.push(f), 
            j && b.push(h));
            return g;
        }
        function r(a, b, c, e, f, g) {
            return e && !e[N] && (e = r(e)), f && !f[N] && (f = r(f, g)), d(function(d, g, h, i) {
                var j, k, l, m = [], n = [], o = g.length, p = d || u(b || "*", h.nodeType ? [ h ] : h, []), r = !a || !d && b ? p : q(p, m, a, h, i), s = c ? f || (d ? a : o || e) ? [] : g : r;
                if (c && c(r, s, h, i), e) for (j = q(s, n), e(j, [], h, i), k = j.length; k--; ) (l = j[k]) && (s[n[k]] = !(r[n[k]] = l));
                if (d) {
                    if (f || a) {
                        if (f) {
                            for (j = [], k = s.length; k--; ) (l = s[k]) && j.push(r[k] = l);
                            f(null, s = [], j, i);
                        }
                        for (k = s.length; k--; ) (l = s[k]) && (j = f ? bb.call(d, l) : m[k]) > -1 && (d[j] = !(g[j] = l));
                    }
                } else s = q(s === g ? s.splice(o, s.length) : s), f ? f(null, g, s, i) : _.apply(g, s);
            });
        }
        function s(a) {
            for (var b, c, d, e = a.length, f = y.relative[a[0].type], g = f || y.relative[" "], h = f ? 1 : 0, i = o(function(a) {
                return a === b;
            }, g, !0), j = o(function(a) {
                return bb.call(b, a) > -1;
            }, g, !0), k = [ function(a, c, d) {
                return !f && (d || c !== C) || ((b = c).nodeType ? i(a, c, d) : j(a, c, d));
            } ]; e > h; h++) if (c = y.relative[a[h].type]) k = [ o(p(k), c) ]; else {
                if (c = y.filter[a[h].type].apply(null, a[h].matches), c[N]) {
                    for (d = ++h; e > d && !y.relative[a[d].type]; d++) ;
                    return r(h > 1 && p(k), h > 1 && n(a.slice(0, h - 1).concat({
                        value: " " === a[h - 2].type ? "*" : ""
                    })).replace(ib, "$1"), c, d > h && s(a.slice(h, d)), e > d && s(a = a.slice(d)), e > d && n(a));
                }
                k.push(c);
            }
            return p(k);
        }
        function t(a, c) {
            var e = c.length > 0, f = a.length > 0, g = function(d, g, h, i, j) {
                var k, l, m, n = 0, o = "0", p = d && [], r = [], s = C, t = d || f && y.find.TAG("*", j), u = P += null == s ? 1 : Math.random() || .1, v = t.length;
                for (j && (C = g !== G && g); o !== v && null != (k = t[o]); o++) {
                    if (f && k) {
                        for (l = 0; m = a[l++]; ) if (m(k, g, h)) {
                            i.push(k);
                            break;
                        }
                        j && (P = u);
                    }
                    e && ((k = !m && k) && n--, d && p.push(k));
                }
                if (n += o, e && o !== n) {
                    for (l = 0; m = c[l++]; ) m(p, r, g, h);
                    if (d) {
                        if (n > 0) for (;o--; ) p[o] || r[o] || (r[o] = Z.call(i));
                        r = q(r);
                    }
                    _.apply(i, r), j && !d && r.length > 0 && n + c.length > 1 && b.uniqueSort(i);
                }
                return j && (P = u, C = s), p;
            };
            return e ? d(g) : g;
        }
        function u(a, c, d) {
            for (var e = 0, f = c.length; f > e; e++) b(a, c[e], d);
            return d;
        }
        function v(a, b, c, d) {
            var e, f, g, h, i, j = m(a);
            if (!d && 1 === j.length) {
                if (f = j[0] = j[0].slice(0), f.length > 2 && "ID" === (g = f[0]).type && x.getById && 9 === b.nodeType && I && y.relative[f[1].type]) {
                    if (b = (y.find.ID(g.matches[0].replace(vb, wb), b) || [])[0], !b) return c;
                    a = a.slice(f.shift().value.length);
                }
                for (e = ob.needsContext.test(a) ? 0 : f.length; e-- && (g = f[e], !y.relative[h = g.type]); ) if ((i = y.find[h]) && (d = i(g.matches[0].replace(vb, wb), tb.test(f[0].type) && k(b.parentNode) || b))) {
                    if (f.splice(e, 1), a = d.length && n(f), !a) return _.apply(c, d), c;
                    break;
                }
            }
            return B(a, j)(d, b, !I, c, tb.test(a) && k(b.parentNode) || b), c;
        }
        var w, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, M, N = "sizzle" + -new Date(), O = a.document, P = 0, Q = 0, R = c(), S = c(), T = c(), U = function(a, b) {
            return a === b && (E = !0), 0;
        }, V = "undefined", W = 1 << 31, X = {}.hasOwnProperty, Y = [], Z = Y.pop, $ = Y.push, _ = Y.push, ab = Y.slice, bb = Y.indexOf || function(a) {
            for (var b = 0, c = this.length; c > b; b++) if (this[b] === a) return b;
            return -1;
        }, cb = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", db = "[\\x20\\t\\r\\n\\f]", eb = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", fb = eb.replace("w", "w#"), gb = "\\[" + db + "*(" + eb + ")" + db + "*(?:([*^$|!~]?=)" + db + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + fb + ")|)|)" + db + "*\\]", hb = ":(" + eb + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + gb.replace(3, 8) + ")*)|.*)\\)|)", ib = new RegExp("^" + db + "+|((?:^|[^\\\\])(?:\\\\.)*)" + db + "+$", "g"), jb = new RegExp("^" + db + "*," + db + "*"), kb = new RegExp("^" + db + "*([>+~]|" + db + ")" + db + "*"), lb = new RegExp("=" + db + "*([^\\]'\"]*?)" + db + "*\\]", "g"), mb = new RegExp(hb), nb = new RegExp("^" + fb + "$"), ob = {
            ID: new RegExp("^#(" + eb + ")"),
            CLASS: new RegExp("^\\.(" + eb + ")"),
            TAG: new RegExp("^(" + eb.replace("w", "w*") + ")"),
            ATTR: new RegExp("^" + gb),
            PSEUDO: new RegExp("^" + hb),
            CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + db + "*(even|odd|(([+-]|)(\\d*)n|)" + db + "*(?:([+-]|)" + db + "*(\\d+)|))" + db + "*\\)|)", "i"),
            bool: new RegExp("^(?:" + cb + ")$", "i"),
            needsContext: new RegExp("^" + db + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + db + "*((?:-\\d)?\\d*)" + db + "*\\)|)(?=[^-]|$)", "i")
        }, pb = /^(?:input|select|textarea|button)$/i, qb = /^h\d$/i, rb = /^[^{]+\{\s*\[native \w/, sb = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, tb = /[+~]/, ub = /'|\\/g, vb = new RegExp("\\\\([\\da-f]{1,6}" + db + "?|(" + db + ")|.)", "ig"), wb = function(a, b, c) {
            var d = "0x" + b - 65536;
            return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320);
        };
        try {
            _.apply(Y = ab.call(O.childNodes), O.childNodes), Y[O.childNodes.length].nodeType;
        } catch (xb) {
            _ = {
                apply: Y.length ? function(a, b) {
                    $.apply(a, ab.call(b));
                } : function(a, b) {
                    for (var c = a.length, d = 0; a[c++] = b[d++]; ) ;
                    a.length = c - 1;
                }
            };
        }
        x = b.support = {}, A = b.isXML = function(a) {
            var b = a && (a.ownerDocument || a).documentElement;
            return b ? "HTML" !== b.nodeName : !1;
        }, F = b.setDocument = function(a) {
            var b, c = a ? a.ownerDocument || a : O, d = c.defaultView;
            return c !== G && 9 === c.nodeType && c.documentElement ? (G = c, H = c.documentElement, 
            I = !A(c), d && d !== d.top && (d.addEventListener ? d.addEventListener("unload", function() {
                F();
            }, !1) : d.attachEvent && d.attachEvent("onunload", function() {
                F();
            })), x.attributes = e(function(a) {
                return a.className = "i", !a.getAttribute("className");
            }), x.getElementsByTagName = e(function(a) {
                return a.appendChild(c.createComment("")), !a.getElementsByTagName("*").length;
            }), x.getElementsByClassName = rb.test(c.getElementsByClassName) && e(function(a) {
                return a.innerHTML = "<div class='a'></div><div class='a i'></div>", a.firstChild.className = "i", 
                2 === a.getElementsByClassName("i").length;
            }), x.getById = e(function(a) {
                return H.appendChild(a).id = N, !c.getElementsByName || !c.getElementsByName(N).length;
            }), x.getById ? (y.find.ID = function(a, b) {
                if (typeof b.getElementById !== V && I) {
                    var c = b.getElementById(a);
                    return c && c.parentNode ? [ c ] : [];
                }
            }, y.filter.ID = function(a) {
                var b = a.replace(vb, wb);
                return function(a) {
                    return a.getAttribute("id") === b;
                };
            }) : (delete y.find.ID, y.filter.ID = function(a) {
                var b = a.replace(vb, wb);
                return function(a) {
                    var c = typeof a.getAttributeNode !== V && a.getAttributeNode("id");
                    return c && c.value === b;
                };
            }), y.find.TAG = x.getElementsByTagName ? function(a, b) {
                return typeof b.getElementsByTagName !== V ? b.getElementsByTagName(a) : void 0;
            } : function(a, b) {
                var c, d = [], e = 0, f = b.getElementsByTagName(a);
                if ("*" === a) {
                    for (;c = f[e++]; ) 1 === c.nodeType && d.push(c);
                    return d;
                }
                return f;
            }, y.find.CLASS = x.getElementsByClassName && function(a, b) {
                return typeof b.getElementsByClassName !== V && I ? b.getElementsByClassName(a) : void 0;
            }, K = [], J = [], (x.qsa = rb.test(c.querySelectorAll)) && (e(function(a) {
                a.innerHTML = "<select t=''><option selected=''></option></select>", a.querySelectorAll("[t^='']").length && J.push("[*^$]=" + db + "*(?:''|\"\")"), 
                a.querySelectorAll("[selected]").length || J.push("\\[" + db + "*(?:value|" + cb + ")"), 
                a.querySelectorAll(":checked").length || J.push(":checked");
            }), e(function(a) {
                var b = c.createElement("input");
                b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && J.push("name" + db + "*[*^$|!~]?="), 
                a.querySelectorAll(":enabled").length || J.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), 
                J.push(",.*:");
            })), (x.matchesSelector = rb.test(L = H.webkitMatchesSelector || H.mozMatchesSelector || H.oMatchesSelector || H.msMatchesSelector)) && e(function(a) {
                x.disconnectedMatch = L.call(a, "div"), L.call(a, "[s!='']:x"), K.push("!=", hb);
            }), J = J.length && new RegExp(J.join("|")), K = K.length && new RegExp(K.join("|")), 
            b = rb.test(H.compareDocumentPosition), M = b || rb.test(H.contains) ? function(a, b) {
                var c = 9 === a.nodeType ? a.documentElement : a, d = b && b.parentNode;
                return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)));
            } : function(a, b) {
                if (b) for (;b = b.parentNode; ) if (b === a) return !0;
                return !1;
            }, U = b ? function(a, b) {
                if (a === b) return E = !0, 0;
                var d = !a.compareDocumentPosition - !b.compareDocumentPosition;
                return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 
                1 & d || !x.sortDetached && b.compareDocumentPosition(a) === d ? a === c || a.ownerDocument === O && M(O, a) ? -1 : b === c || b.ownerDocument === O && M(O, b) ? 1 : D ? bb.call(D, a) - bb.call(D, b) : 0 : 4 & d ? -1 : 1);
            } : function(a, b) {
                if (a === b) return E = !0, 0;
                var d, e = 0, f = a.parentNode, h = b.parentNode, i = [ a ], j = [ b ];
                if (!f || !h) return a === c ? -1 : b === c ? 1 : f ? -1 : h ? 1 : D ? bb.call(D, a) - bb.call(D, b) : 0;
                if (f === h) return g(a, b);
                for (d = a; d = d.parentNode; ) i.unshift(d);
                for (d = b; d = d.parentNode; ) j.unshift(d);
                for (;i[e] === j[e]; ) e++;
                return e ? g(i[e], j[e]) : i[e] === O ? -1 : j[e] === O ? 1 : 0;
            }, c) : G;
        }, b.matches = function(a, c) {
            return b(a, null, null, c);
        }, b.matchesSelector = function(a, c) {
            if ((a.ownerDocument || a) !== G && F(a), c = c.replace(lb, "='$1']"), !(!x.matchesSelector || !I || K && K.test(c) || J && J.test(c))) try {
                var d = L.call(a, c);
                if (d || x.disconnectedMatch || a.document && 11 !== a.document.nodeType) return d;
            } catch (e) {}
            return b(c, G, null, [ a ]).length > 0;
        }, b.contains = function(a, b) {
            return (a.ownerDocument || a) !== G && F(a), M(a, b);
        }, b.attr = function(a, b) {
            (a.ownerDocument || a) !== G && F(a);
            var c = y.attrHandle[b.toLowerCase()], d = c && X.call(y.attrHandle, b.toLowerCase()) ? c(a, b, !I) : void 0;
            return void 0 !== d ? d : x.attributes || !I ? a.getAttribute(b) : (d = a.getAttributeNode(b)) && d.specified ? d.value : null;
        }, b.error = function(a) {
            throw new Error("Syntax error, unrecognized expression: " + a);
        }, b.uniqueSort = function(a) {
            var b, c = [], d = 0, e = 0;
            if (E = !x.detectDuplicates, D = !x.sortStable && a.slice(0), a.sort(U), E) {
                for (;b = a[e++]; ) b === a[e] && (d = c.push(e));
                for (;d--; ) a.splice(c[d], 1);
            }
            return D = null, a;
        }, z = b.getText = function(a) {
            var b, c = "", d = 0, e = a.nodeType;
            if (e) {
                if (1 === e || 9 === e || 11 === e) {
                    if ("string" == typeof a.textContent) return a.textContent;
                    for (a = a.firstChild; a; a = a.nextSibling) c += z(a);
                } else if (3 === e || 4 === e) return a.nodeValue;
            } else for (;b = a[d++]; ) c += z(b);
            return c;
        }, y = b.selectors = {
            cacheLength: 50,
            createPseudo: d,
            match: ob,
            attrHandle: {},
            find: {},
            relative: {
                ">": {
                    dir: "parentNode",
                    first: !0
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: !0
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                ATTR: function(a) {
                    return a[1] = a[1].replace(vb, wb), a[3] = (a[4] || a[5] || "").replace(vb, wb), 
                    "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4);
                },
                CHILD: function(a) {
                    return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || b.error(a[0]), 
                    a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && b.error(a[0]), 
                    a;
                },
                PSEUDO: function(a) {
                    var b, c = !a[5] && a[2];
                    return ob.CHILD.test(a[0]) ? null : (a[3] && void 0 !== a[4] ? a[2] = a[4] : c && mb.test(c) && (b = m(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), 
                    a[2] = c.slice(0, b)), a.slice(0, 3));
                }
            },
            filter: {
                TAG: function(a) {
                    var b = a.replace(vb, wb).toLowerCase();
                    return "*" === a ? function() {
                        return !0;
                    } : function(a) {
                        return a.nodeName && a.nodeName.toLowerCase() === b;
                    };
                },
                CLASS: function(a) {
                    var b = R[a + " "];
                    return b || (b = new RegExp("(^|" + db + ")" + a + "(" + db + "|$)")) && R(a, function(a) {
                        return b.test("string" == typeof a.className && a.className || typeof a.getAttribute !== V && a.getAttribute("class") || "");
                    });
                },
                ATTR: function(a, c, d) {
                    return function(e) {
                        var f = b.attr(e, a);
                        return null == f ? "!=" === c : c ? (f += "", "=" === c ? f === d : "!=" === c ? f !== d : "^=" === c ? d && 0 === f.indexOf(d) : "*=" === c ? d && f.indexOf(d) > -1 : "$=" === c ? d && f.slice(-d.length) === d : "~=" === c ? (" " + f + " ").indexOf(d) > -1 : "|=" === c ? f === d || f.slice(0, d.length + 1) === d + "-" : !1) : !0;
                    };
                },
                CHILD: function(a, b, c, d, e) {
                    var f = "nth" !== a.slice(0, 3), g = "last" !== a.slice(-4), h = "of-type" === b;
                    return 1 === d && 0 === e ? function(a) {
                        return !!a.parentNode;
                    } : function(b, c, i) {
                        var j, k, l, m, n, o, p = f !== g ? "nextSibling" : "previousSibling", q = b.parentNode, r = h && b.nodeName.toLowerCase(), s = !i && !h;
                        if (q) {
                            if (f) {
                                for (;p; ) {
                                    for (l = b; l = l[p]; ) if (h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) return !1;
                                    o = p = "only" === a && !o && "nextSibling";
                                }
                                return !0;
                            }
                            if (o = [ g ? q.firstChild : q.lastChild ], g && s) {
                                for (k = q[N] || (q[N] = {}), j = k[a] || [], n = j[0] === P && j[1], m = j[0] === P && j[2], 
                                l = n && q.childNodes[n]; l = ++n && l && l[p] || (m = n = 0) || o.pop(); ) if (1 === l.nodeType && ++m && l === b) {
                                    k[a] = [ P, n, m ];
                                    break;
                                }
                            } else if (s && (j = (b[N] || (b[N] = {}))[a]) && j[0] === P) m = j[1]; else for (;(l = ++n && l && l[p] || (m = n = 0) || o.pop()) && ((h ? l.nodeName.toLowerCase() !== r : 1 !== l.nodeType) || !++m || (s && ((l[N] || (l[N] = {}))[a] = [ P, m ]), 
                            l !== b)); ) ;
                            return m -= e, m === d || m % d === 0 && m / d >= 0;
                        }
                    };
                },
                PSEUDO: function(a, c) {
                    var e, f = y.pseudos[a] || y.setFilters[a.toLowerCase()] || b.error("unsupported pseudo: " + a);
                    return f[N] ? f(c) : f.length > 1 ? (e = [ a, a, "", c ], y.setFilters.hasOwnProperty(a.toLowerCase()) ? d(function(a, b) {
                        for (var d, e = f(a, c), g = e.length; g--; ) d = bb.call(a, e[g]), a[d] = !(b[d] = e[g]);
                    }) : function(a) {
                        return f(a, 0, e);
                    }) : f;
                }
            },
            pseudos: {
                not: d(function(a) {
                    var b = [], c = [], e = B(a.replace(ib, "$1"));
                    return e[N] ? d(function(a, b, c, d) {
                        for (var f, g = e(a, null, d, []), h = a.length; h--; ) (f = g[h]) && (a[h] = !(b[h] = f));
                    }) : function(a, d, f) {
                        return b[0] = a, e(b, null, f, c), !c.pop();
                    };
                }),
                has: d(function(a) {
                    return function(c) {
                        return b(a, c).length > 0;
                    };
                }),
                contains: d(function(a) {
                    return function(b) {
                        return (b.textContent || b.innerText || z(b)).indexOf(a) > -1;
                    };
                }),
                lang: d(function(a) {
                    return nb.test(a || "") || b.error("unsupported lang: " + a), a = a.replace(vb, wb).toLowerCase(), 
                    function(b) {
                        var c;
                        do if (c = I ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang")) return c = c.toLowerCase(), 
                        c === a || 0 === c.indexOf(a + "-"); while ((b = b.parentNode) && 1 === b.nodeType);
                        return !1;
                    };
                }),
                target: function(b) {
                    var c = a.location && a.location.hash;
                    return c && c.slice(1) === b.id;
                },
                root: function(a) {
                    return a === H;
                },
                focus: function(a) {
                    return a === G.activeElement && (!G.hasFocus || G.hasFocus()) && !!(a.type || a.href || ~a.tabIndex);
                },
                enabled: function(a) {
                    return a.disabled === !1;
                },
                disabled: function(a) {
                    return a.disabled === !0;
                },
                checked: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return "input" === b && !!a.checked || "option" === b && !!a.selected;
                },
                selected: function(a) {
                    return a.parentNode && a.parentNode.selectedIndex, a.selected === !0;
                },
                empty: function(a) {
                    for (a = a.firstChild; a; a = a.nextSibling) if (a.nodeType < 6) return !1;
                    return !0;
                },
                parent: function(a) {
                    return !y.pseudos.empty(a);
                },
                header: function(a) {
                    return qb.test(a.nodeName);
                },
                input: function(a) {
                    return pb.test(a.nodeName);
                },
                button: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return "input" === b && "button" === a.type || "button" === b;
                },
                text: function(a) {
                    var b;
                    return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase());
                },
                first: j(function() {
                    return [ 0 ];
                }),
                last: j(function(a, b) {
                    return [ b - 1 ];
                }),
                eq: j(function(a, b, c) {
                    return [ 0 > c ? c + b : c ];
                }),
                even: j(function(a, b) {
                    for (var c = 0; b > c; c += 2) a.push(c);
                    return a;
                }),
                odd: j(function(a, b) {
                    for (var c = 1; b > c; c += 2) a.push(c);
                    return a;
                }),
                lt: j(function(a, b, c) {
                    for (var d = 0 > c ? c + b : c; --d >= 0; ) a.push(d);
                    return a;
                }),
                gt: j(function(a, b, c) {
                    for (var d = 0 > c ? c + b : c; ++d < b; ) a.push(d);
                    return a;
                })
            }
        }, y.pseudos.nth = y.pseudos.eq;
        for (w in {
            radio: !0,
            checkbox: !0,
            file: !0,
            password: !0,
            image: !0
        }) y.pseudos[w] = h(w);
        for (w in {
            submit: !0,
            reset: !0
        }) y.pseudos[w] = i(w);
        return l.prototype = y.filters = y.pseudos, y.setFilters = new l(), B = b.compile = function(a, b) {
            var c, d = [], e = [], f = T[a + " "];
            if (!f) {
                for (b || (b = m(a)), c = b.length; c--; ) f = s(b[c]), f[N] ? d.push(f) : e.push(f);
                f = T(a, t(e, d));
            }
            return f;
        }, x.sortStable = N.split("").sort(U).join("") === N, x.detectDuplicates = !!E, 
        F(), x.sortDetached = e(function(a) {
            return 1 & a.compareDocumentPosition(G.createElement("div"));
        }), e(function(a) {
            return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href");
        }) || f("type|href|height|width", function(a, b, c) {
            return c ? void 0 : a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2);
        }), x.attributes && e(function(a) {
            return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value");
        }) || f("value", function(a, b, c) {
            return c || "input" !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue;
        }), e(function(a) {
            return null == a.getAttribute("disabled");
        }) || f(cb, function(a, b, c) {
            var d;
            return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null;
        }), b;
    }(a);
    fb.find = kb, fb.expr = kb.selectors, fb.expr[":"] = fb.expr.pseudos, fb.unique = kb.uniqueSort, 
    fb.text = kb.getText, fb.isXMLDoc = kb.isXML, fb.contains = kb.contains;
    var lb = fb.expr.match.needsContext, mb = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, nb = /^.[^:#\[\.,]*$/;
    fb.filter = function(a, b, c) {
        var d = b[0];
        return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? fb.find.matchesSelector(d, a) ? [ d ] : [] : fb.find.matches(a, fb.grep(b, function(a) {
            return 1 === a.nodeType;
        }));
    }, fb.fn.extend({
        find: function(a) {
            var b, c = [], d = this, e = d.length;
            if ("string" != typeof a) return this.pushStack(fb(a).filter(function() {
                for (b = 0; e > b; b++) if (fb.contains(d[b], this)) return !0;
            }));
            for (b = 0; e > b; b++) fb.find(a, d[b], c);
            return c = this.pushStack(e > 1 ? fb.unique(c) : c), c.selector = this.selector ? this.selector + " " + a : a, 
            c;
        },
        filter: function(a) {
            return this.pushStack(d(this, a || [], !1));
        },
        not: function(a) {
            return this.pushStack(d(this, a || [], !0));
        },
        is: function(a) {
            return !!d(this, "string" == typeof a && lb.test(a) ? fb(a) : a || [], !1).length;
        }
    });
    var ob, pb = a.document, qb = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, rb = fb.fn.init = function(a, b) {
        var c, d;
        if (!a) return this;
        if ("string" == typeof a) {
            if (c = "<" === a.charAt(0) && ">" === a.charAt(a.length - 1) && a.length >= 3 ? [ null, a, null ] : qb.exec(a), 
            !c || !c[1] && b) return !b || b.jquery ? (b || ob).find(a) : this.constructor(b).find(a);
            if (c[1]) {
                if (b = b instanceof fb ? b[0] : b, fb.merge(this, fb.parseHTML(c[1], b && b.nodeType ? b.ownerDocument || b : pb, !0)), 
                mb.test(c[1]) && fb.isPlainObject(b)) for (c in b) fb.isFunction(this[c]) ? this[c](b[c]) : this.attr(c, b[c]);
                return this;
            }
            if (d = pb.getElementById(c[2]), d && d.parentNode) {
                if (d.id !== c[2]) return ob.find(a);
                this.length = 1, this[0] = d;
            }
            return this.context = pb, this.selector = a, this;
        }
        return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : fb.isFunction(a) ? "undefined" != typeof ob.ready ? ob.ready(a) : a(fb) : (void 0 !== a.selector && (this.selector = a.selector, 
        this.context = a.context), fb.makeArray(a, this));
    };
    rb.prototype = fb.fn, ob = fb(pb);
    var sb = /^(?:parents|prev(?:Until|All))/, tb = {
        children: !0,
        contents: !0,
        next: !0,
        prev: !0
    };
    fb.extend({
        dir: function(a, b, c) {
            for (var d = [], e = a[b]; e && 9 !== e.nodeType && (void 0 === c || 1 !== e.nodeType || !fb(e).is(c)); ) 1 === e.nodeType && d.push(e), 
            e = e[b];
            return d;
        },
        sibling: function(a, b) {
            for (var c = []; a; a = a.nextSibling) 1 === a.nodeType && a !== b && c.push(a);
            return c;
        }
    }), fb.fn.extend({
        has: function(a) {
            var b, c = fb(a, this), d = c.length;
            return this.filter(function() {
                for (b = 0; d > b; b++) if (fb.contains(this, c[b])) return !0;
            });
        },
        closest: function(a, b) {
            for (var c, d = 0, e = this.length, f = [], g = lb.test(a) || "string" != typeof a ? fb(a, b || this.context) : 0; e > d; d++) for (c = this[d]; c && c !== b; c = c.parentNode) if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && fb.find.matchesSelector(c, a))) {
                f.push(c);
                break;
            }
            return this.pushStack(f.length > 1 ? fb.unique(f) : f);
        },
        index: function(a) {
            return a ? "string" == typeof a ? fb.inArray(this[0], fb(a)) : fb.inArray(a.jquery ? a[0] : a, this) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
        },
        add: function(a, b) {
            return this.pushStack(fb.unique(fb.merge(this.get(), fb(a, b))));
        },
        addBack: function(a) {
            return this.add(null == a ? this.prevObject : this.prevObject.filter(a));
        }
    }), fb.each({
        parent: function(a) {
            var b = a.parentNode;
            return b && 11 !== b.nodeType ? b : null;
        },
        parents: function(a) {
            return fb.dir(a, "parentNode");
        },
        parentsUntil: function(a, b, c) {
            return fb.dir(a, "parentNode", c);
        },
        next: function(a) {
            return e(a, "nextSibling");
        },
        prev: function(a) {
            return e(a, "previousSibling");
        },
        nextAll: function(a) {
            return fb.dir(a, "nextSibling");
        },
        prevAll: function(a) {
            return fb.dir(a, "previousSibling");
        },
        nextUntil: function(a, b, c) {
            return fb.dir(a, "nextSibling", c);
        },
        prevUntil: function(a, b, c) {
            return fb.dir(a, "previousSibling", c);
        },
        siblings: function(a) {
            return fb.sibling((a.parentNode || {}).firstChild, a);
        },
        children: function(a) {
            return fb.sibling(a.firstChild);
        },
        contents: function(a) {
            return fb.nodeName(a, "iframe") ? a.contentDocument || a.contentWindow.document : fb.merge([], a.childNodes);
        }
    }, function(a, b) {
        fb.fn[a] = function(c, d) {
            var e = fb.map(this, b, c);
            return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = fb.filter(d, e)), 
            this.length > 1 && (tb[a] || (e = fb.unique(e)), sb.test(a) && (e = e.reverse())), 
            this.pushStack(e);
        };
    });
    var ub = /\S+/g, vb = {};
    fb.Callbacks = function(a) {
        a = "string" == typeof a ? vb[a] || f(a) : fb.extend({}, a);
        var b, c, d, e, g, h, i = [], j = !a.once && [], k = function(f) {
            for (c = a.memory && f, d = !0, g = h || 0, h = 0, e = i.length, b = !0; i && e > g; g++) if (i[g].apply(f[0], f[1]) === !1 && a.stopOnFalse) {
                c = !1;
                break;
            }
            b = !1, i && (j ? j.length && k(j.shift()) : c ? i = [] : l.disable());
        }, l = {
            add: function() {
                if (i) {
                    var d = i.length;
                    !function f(b) {
                        fb.each(b, function(b, c) {
                            var d = fb.type(c);
                            "function" === d ? a.unique && l.has(c) || i.push(c) : c && c.length && "string" !== d && f(c);
                        });
                    }(arguments), b ? e = i.length : c && (h = d, k(c));
                }
                return this;
            },
            remove: function() {
                return i && fb.each(arguments, function(a, c) {
                    for (var d; (d = fb.inArray(c, i, d)) > -1; ) i.splice(d, 1), b && (e >= d && e--, 
                    g >= d && g--);
                }), this;
            },
            has: function(a) {
                return a ? fb.inArray(a, i) > -1 : !(!i || !i.length);
            },
            empty: function() {
                return i = [], e = 0, this;
            },
            disable: function() {
                return i = j = c = void 0, this;
            },
            disabled: function() {
                return !i;
            },
            lock: function() {
                return j = void 0, c || l.disable(), this;
            },
            locked: function() {
                return !j;
            },
            fireWith: function(a, c) {
                return !i || d && !j || (c = c || [], c = [ a, c.slice ? c.slice() : c ], b ? j.push(c) : k(c)), 
                this;
            },
            fire: function() {
                return l.fireWith(this, arguments), this;
            },
            fired: function() {
                return !!d;
            }
        };
        return l;
    }, fb.extend({
        Deferred: function(a) {
            var b = [ [ "resolve", "done", fb.Callbacks("once memory"), "resolved" ], [ "reject", "fail", fb.Callbacks("once memory"), "rejected" ], [ "notify", "progress", fb.Callbacks("memory") ] ], c = "pending", d = {
                state: function() {
                    return c;
                },
                always: function() {
                    return e.done(arguments).fail(arguments), this;
                },
                then: function() {
                    var a = arguments;
                    return fb.Deferred(function(c) {
                        fb.each(b, function(b, f) {
                            var g = fb.isFunction(a[b]) && a[b];
                            e[f[1]](function() {
                                var a = g && g.apply(this, arguments);
                                a && fb.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f[0] + "With"](this === d ? c.promise() : this, g ? [ a ] : arguments);
                            });
                        }), a = null;
                    }).promise();
                },
                promise: function(a) {
                    return null != a ? fb.extend(a, d) : d;
                }
            }, e = {};
            return d.pipe = d.then, fb.each(b, function(a, f) {
                var g = f[2], h = f[3];
                d[f[1]] = g.add, h && g.add(function() {
                    c = h;
                }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function() {
                    return e[f[0] + "With"](this === e ? d : this, arguments), this;
                }, e[f[0] + "With"] = g.fireWith;
            }), d.promise(e), a && a.call(e, e), e;
        },
        when: function(a) {
            var b, c, d, e = 0, f = X.call(arguments), g = f.length, h = 1 !== g || a && fb.isFunction(a.promise) ? g : 0, i = 1 === h ? a : fb.Deferred(), j = function(a, c, d) {
                return function(e) {
                    c[a] = this, d[a] = arguments.length > 1 ? X.call(arguments) : e, d === b ? i.notifyWith(c, d) : --h || i.resolveWith(c, d);
                };
            };
            if (g > 1) for (b = new Array(g), c = new Array(g), d = new Array(g); g > e; e++) f[e] && fb.isFunction(f[e].promise) ? f[e].promise().done(j(e, d, f)).fail(i.reject).progress(j(e, c, b)) : --h;
            return h || i.resolveWith(d, f), i.promise();
        }
    });
    var wb;
    fb.fn.ready = function(a) {
        return fb.ready.promise().done(a), this;
    }, fb.extend({
        isReady: !1,
        readyWait: 1,
        holdReady: function(a) {
            a ? fb.readyWait++ : fb.ready(!0);
        },
        ready: function(a) {
            if (a === !0 ? !--fb.readyWait : !fb.isReady) {
                if (!pb.body) return setTimeout(fb.ready);
                fb.isReady = !0, a !== !0 && --fb.readyWait > 0 || (wb.resolveWith(pb, [ fb ]), 
                fb.fn.trigger && fb(pb).trigger("ready").off("ready"));
            }
        }
    }), fb.ready.promise = function(b) {
        if (!wb) if (wb = fb.Deferred(), "complete" === pb.readyState) setTimeout(fb.ready); else if (pb.addEventListener) pb.addEventListener("DOMContentLoaded", h, !1), 
        a.addEventListener("load", h, !1); else {
            pb.attachEvent("onreadystatechange", h), a.attachEvent("onload", h);
            var c = !1;
            try {
                c = null == a.frameElement && pb.documentElement;
            } catch (d) {}
            c && c.doScroll && !function e() {
                if (!fb.isReady) {
                    try {
                        c.doScroll("left");
                    } catch (a) {
                        return setTimeout(e, 50);
                    }
                    g(), fb.ready();
                }
            }();
        }
        return wb.promise(b);
    };
    var xb, yb = "undefined";
    for (xb in fb(db)) break;
    db.ownLast = "0" !== xb, db.inlineBlockNeedsLayout = !1, fb(function() {
        var a, b, c = pb.getElementsByTagName("body")[0];
        c && (a = pb.createElement("div"), a.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px", 
        b = pb.createElement("div"), c.appendChild(a).appendChild(b), typeof b.style.zoom !== yb && (b.style.cssText = "border:0;margin:0;width:1px;padding:1px;display:inline;zoom:1", 
        (db.inlineBlockNeedsLayout = 3 === b.offsetWidth) && (c.style.zoom = 1)), c.removeChild(a), 
        a = b = null);
    }), function() {
        var a = pb.createElement("div");
        if (null == db.deleteExpando) {
            db.deleteExpando = !0;
            try {
                delete a.test;
            } catch (b) {
                db.deleteExpando = !1;
            }
        }
        a = null;
    }(), fb.acceptData = function(a) {
        var b = fb.noData[(a.nodeName + " ").toLowerCase()], c = +a.nodeType || 1;
        return 1 !== c && 9 !== c ? !1 : !b || b !== !0 && a.getAttribute("classid") === b;
    };
    var zb = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, Ab = /([A-Z])/g;
    fb.extend({
        cache: {},
        noData: {
            "applet ": !0,
            "embed ": !0,
            "object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
        },
        hasData: function(a) {
            return a = a.nodeType ? fb.cache[a[fb.expando]] : a[fb.expando], !!a && !j(a);
        },
        data: function(a, b, c) {
            return k(a, b, c);
        },
        removeData: function(a, b) {
            return l(a, b);
        },
        _data: function(a, b, c) {
            return k(a, b, c, !0);
        },
        _removeData: function(a, b) {
            return l(a, b, !0);
        }
    }), fb.fn.extend({
        data: function(a, b) {
            var c, d, e, f = this[0], g = f && f.attributes;
            if (void 0 === a) {
                if (this.length && (e = fb.data(f), 1 === f.nodeType && !fb._data(f, "parsedAttrs"))) {
                    for (c = g.length; c--; ) d = g[c].name, 0 === d.indexOf("data-") && (d = fb.camelCase(d.slice(5)), 
                    i(f, d, e[d]));
                    fb._data(f, "parsedAttrs", !0);
                }
                return e;
            }
            return "object" == typeof a ? this.each(function() {
                fb.data(this, a);
            }) : arguments.length > 1 ? this.each(function() {
                fb.data(this, a, b);
            }) : f ? i(f, a, fb.data(f, a)) : void 0;
        },
        removeData: function(a) {
            return this.each(function() {
                fb.removeData(this, a);
            });
        }
    }), fb.extend({
        queue: function(a, b, c) {
            var d;
            return a ? (b = (b || "fx") + "queue", d = fb._data(a, b), c && (!d || fb.isArray(c) ? d = fb._data(a, b, fb.makeArray(c)) : d.push(c)), 
            d || []) : void 0;
        },
        dequeue: function(a, b) {
            b = b || "fx";
            var c = fb.queue(a, b), d = c.length, e = c.shift(), f = fb._queueHooks(a, b), g = function() {
                fb.dequeue(a, b);
            };
            "inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), 
            delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire();
        },
        _queueHooks: function(a, b) {
            var c = b + "queueHooks";
            return fb._data(a, c) || fb._data(a, c, {
                empty: fb.Callbacks("once memory").add(function() {
                    fb._removeData(a, b + "queue"), fb._removeData(a, c);
                })
            });
        }
    }), fb.fn.extend({
        queue: function(a, b) {
            var c = 2;
            return "string" != typeof a && (b = a, a = "fx", c--), arguments.length < c ? fb.queue(this[0], a) : void 0 === b ? this : this.each(function() {
                var c = fb.queue(this, a, b);
                fb._queueHooks(this, a), "fx" === a && "inprogress" !== c[0] && fb.dequeue(this, a);
            });
        },
        dequeue: function(a) {
            return this.each(function() {
                fb.dequeue(this, a);
            });
        },
        clearQueue: function(a) {
            return this.queue(a || "fx", []);
        },
        promise: function(a, b) {
            var c, d = 1, e = fb.Deferred(), f = this, g = this.length, h = function() {
                --d || e.resolveWith(f, [ f ]);
            };
            for ("string" != typeof a && (b = a, a = void 0), a = a || "fx"; g--; ) c = fb._data(f[g], a + "queueHooks"), 
            c && c.empty && (d++, c.empty.add(h));
            return h(), e.promise(b);
        }
    });
    var Bb = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, Cb = [ "Top", "Right", "Bottom", "Left" ], Db = function(a, b) {
        return a = b || a, "none" === fb.css(a, "display") || !fb.contains(a.ownerDocument, a);
    }, Eb = fb.access = function(a, b, c, d, e, f, g) {
        var h = 0, i = a.length, j = null == c;
        if ("object" === fb.type(c)) {
            e = !0;
            for (h in c) fb.access(a, b, h, c[h], !0, f, g);
        } else if (void 0 !== d && (e = !0, fb.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), 
        b = null) : (j = b, b = function(a, b, c) {
            return j.call(fb(a), c);
        })), b)) for (;i > h; h++) b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c)));
        return e ? a : j ? b.call(a) : i ? b(a[0], c) : f;
    }, Fb = /^(?:checkbox|radio)$/i;
    !function() {
        var a = pb.createDocumentFragment(), b = pb.createElement("div"), c = pb.createElement("input");
        if (b.setAttribute("className", "t"), b.innerHTML = "  <link/><table></table><a href='/a'>a</a>", 
        db.leadingWhitespace = 3 === b.firstChild.nodeType, db.tbody = !b.getElementsByTagName("tbody").length, 
        db.htmlSerialize = !!b.getElementsByTagName("link").length, db.html5Clone = "<:nav></:nav>" !== pb.createElement("nav").cloneNode(!0).outerHTML, 
        c.type = "checkbox", c.checked = !0, a.appendChild(c), db.appendChecked = c.checked, 
        b.innerHTML = "<textarea>x</textarea>", db.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue, 
        a.appendChild(b), b.innerHTML = "<input type='radio' checked='checked' name='t'/>", 
        db.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, db.noCloneEvent = !0, 
        b.attachEvent && (b.attachEvent("onclick", function() {
            db.noCloneEvent = !1;
        }), b.cloneNode(!0).click()), null == db.deleteExpando) {
            db.deleteExpando = !0;
            try {
                delete b.test;
            } catch (d) {
                db.deleteExpando = !1;
            }
        }
        a = b = c = null;
    }(), function() {
        var b, c, d = pb.createElement("div");
        for (b in {
            submit: !0,
            change: !0,
            focusin: !0
        }) c = "on" + b, (db[b + "Bubbles"] = c in a) || (d.setAttribute(c, "t"), db[b + "Bubbles"] = d.attributes[c].expando === !1);
        d = null;
    }();
    var Gb = /^(?:input|select|textarea)$/i, Hb = /^key/, Ib = /^(?:mouse|contextmenu)|click/, Jb = /^(?:focusinfocus|focusoutblur)$/, Kb = /^([^.]*)(?:\.(.+)|)$/;
    fb.event = {
        global: {},
        add: function(a, b, c, d, e) {
            var f, g, h, i, j, k, l, m, n, o, p, q = fb._data(a);
            if (q) {
                for (c.handler && (i = c, c = i.handler, e = i.selector), c.guid || (c.guid = fb.guid++), 
                (g = q.events) || (g = q.events = {}), (k = q.handle) || (k = q.handle = function(a) {
                    return typeof fb === yb || a && fb.event.triggered === a.type ? void 0 : fb.event.dispatch.apply(k.elem, arguments);
                }, k.elem = a), b = (b || "").match(ub) || [ "" ], h = b.length; h--; ) f = Kb.exec(b[h]) || [], 
                n = p = f[1], o = (f[2] || "").split(".").sort(), n && (j = fb.event.special[n] || {}, 
                n = (e ? j.delegateType : j.bindType) || n, j = fb.event.special[n] || {}, l = fb.extend({
                    type: n,
                    origType: p,
                    data: d,
                    handler: c,
                    guid: c.guid,
                    selector: e,
                    needsContext: e && fb.expr.match.needsContext.test(e),
                    namespace: o.join(".")
                }, i), (m = g[n]) || (m = g[n] = [], m.delegateCount = 0, j.setup && j.setup.call(a, d, o, k) !== !1 || (a.addEventListener ? a.addEventListener(n, k, !1) : a.attachEvent && a.attachEvent("on" + n, k))), 
                j.add && (j.add.call(a, l), l.handler.guid || (l.handler.guid = c.guid)), e ? m.splice(m.delegateCount++, 0, l) : m.push(l), 
                fb.event.global[n] = !0);
                a = null;
            }
        },
        remove: function(a, b, c, d, e) {
            var f, g, h, i, j, k, l, m, n, o, p, q = fb.hasData(a) && fb._data(a);
            if (q && (k = q.events)) {
                for (b = (b || "").match(ub) || [ "" ], j = b.length; j--; ) if (h = Kb.exec(b[j]) || [], 
                n = p = h[1], o = (h[2] || "").split(".").sort(), n) {
                    for (l = fb.event.special[n] || {}, n = (d ? l.delegateType : l.bindType) || n, 
                    m = k[n] || [], h = h[2] && new RegExp("(^|\\.)" + o.join("\\.(?:.*\\.|)") + "(\\.|$)"), 
                    i = f = m.length; f--; ) g = m[f], !e && p !== g.origType || c && c.guid !== g.guid || h && !h.test(g.namespace) || d && d !== g.selector && ("**" !== d || !g.selector) || (m.splice(f, 1), 
                    g.selector && m.delegateCount--, l.remove && l.remove.call(a, g));
                    i && !m.length && (l.teardown && l.teardown.call(a, o, q.handle) !== !1 || fb.removeEvent(a, n, q.handle), 
                    delete k[n]);
                } else for (n in k) fb.event.remove(a, n + b[j], c, d, !0);
                fb.isEmptyObject(k) && (delete q.handle, fb._removeData(a, "events"));
            }
        },
        trigger: function(b, c, d, e) {
            var f, g, h, i, j, k, l, m = [ d || pb ], n = bb.call(b, "type") ? b.type : b, o = bb.call(b, "namespace") ? b.namespace.split(".") : [];
            if (h = k = d = d || pb, 3 !== d.nodeType && 8 !== d.nodeType && !Jb.test(n + fb.event.triggered) && (n.indexOf(".") >= 0 && (o = n.split("."), 
            n = o.shift(), o.sort()), g = n.indexOf(":") < 0 && "on" + n, b = b[fb.expando] ? b : new fb.Event(n, "object" == typeof b && b), 
            b.isTrigger = e ? 2 : 3, b.namespace = o.join("."), b.namespace_re = b.namespace ? new RegExp("(^|\\.)" + o.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, 
            b.result = void 0, b.target || (b.target = d), c = null == c ? [ b ] : fb.makeArray(c, [ b ]), 
            j = fb.event.special[n] || {}, e || !j.trigger || j.trigger.apply(d, c) !== !1)) {
                if (!e && !j.noBubble && !fb.isWindow(d)) {
                    for (i = j.delegateType || n, Jb.test(i + n) || (h = h.parentNode); h; h = h.parentNode) m.push(h), 
                    k = h;
                    k === (d.ownerDocument || pb) && m.push(k.defaultView || k.parentWindow || a);
                }
                for (l = 0; (h = m[l++]) && !b.isPropagationStopped(); ) b.type = l > 1 ? i : j.bindType || n, 
                f = (fb._data(h, "events") || {})[b.type] && fb._data(h, "handle"), f && f.apply(h, c), 
                f = g && h[g], f && f.apply && fb.acceptData(h) && (b.result = f.apply(h, c), b.result === !1 && b.preventDefault());
                if (b.type = n, !e && !b.isDefaultPrevented() && (!j._default || j._default.apply(m.pop(), c) === !1) && fb.acceptData(d) && g && d[n] && !fb.isWindow(d)) {
                    k = d[g], k && (d[g] = null), fb.event.triggered = n;
                    try {
                        d[n]();
                    } catch (p) {}
                    fb.event.triggered = void 0, k && (d[g] = k);
                }
                return b.result;
            }
        },
        dispatch: function(a) {
            a = fb.event.fix(a);
            var b, c, d, e, f, g = [], h = X.call(arguments), i = (fb._data(this, "events") || {})[a.type] || [], j = fb.event.special[a.type] || {};
            if (h[0] = a, a.delegateTarget = this, !j.preDispatch || j.preDispatch.call(this, a) !== !1) {
                for (g = fb.event.handlers.call(this, a, i), b = 0; (e = g[b++]) && !a.isPropagationStopped(); ) for (a.currentTarget = e.elem, 
                f = 0; (d = e.handlers[f++]) && !a.isImmediatePropagationStopped(); ) (!a.namespace_re || a.namespace_re.test(d.namespace)) && (a.handleObj = d, 
                a.data = d.data, c = ((fb.event.special[d.origType] || {}).handle || d.handler).apply(e.elem, h), 
                void 0 !== c && (a.result = c) === !1 && (a.preventDefault(), a.stopPropagation()));
                return j.postDispatch && j.postDispatch.call(this, a), a.result;
            }
        },
        handlers: function(a, b) {
            var c, d, e, f, g = [], h = b.delegateCount, i = a.target;
            if (h && i.nodeType && (!a.button || "click" !== a.type)) for (;i != this; i = i.parentNode || this) if (1 === i.nodeType && (i.disabled !== !0 || "click" !== a.type)) {
                for (e = [], f = 0; h > f; f++) d = b[f], c = d.selector + " ", void 0 === e[c] && (e[c] = d.needsContext ? fb(c, this).index(i) >= 0 : fb.find(c, this, null, [ i ]).length), 
                e[c] && e.push(d);
                e.length && g.push({
                    elem: i,
                    handlers: e
                });
            }
            return h < b.length && g.push({
                elem: this,
                handlers: b.slice(h)
            }), g;
        },
        fix: function(a) {
            if (a[fb.expando]) return a;
            var b, c, d, e = a.type, f = a, g = this.fixHooks[e];
            for (g || (this.fixHooks[e] = g = Ib.test(e) ? this.mouseHooks : Hb.test(e) ? this.keyHooks : {}), 
            d = g.props ? this.props.concat(g.props) : this.props, a = new fb.Event(f), b = d.length; b--; ) c = d[b], 
            a[c] = f[c];
            return a.target || (a.target = f.srcElement || pb), 3 === a.target.nodeType && (a.target = a.target.parentNode), 
            a.metaKey = !!a.metaKey, g.filter ? g.filter(a, f) : a;
        },
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(a, b) {
                return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), 
                a;
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(a, b) {
                var c, d, e, f = b.button, g = b.fromElement;
                return null == a.pageX && null != b.clientX && (d = a.target.ownerDocument || pb, 
                e = d.documentElement, c = d.body, a.pageX = b.clientX + (e && e.scrollLeft || c && c.scrollLeft || 0) - (e && e.clientLeft || c && c.clientLeft || 0), 
                a.pageY = b.clientY + (e && e.scrollTop || c && c.scrollTop || 0) - (e && e.clientTop || c && c.clientTop || 0)), 
                !a.relatedTarget && g && (a.relatedTarget = g === a.target ? b.toElement : g), a.which || void 0 === f || (a.which = 1 & f ? 1 : 2 & f ? 3 : 4 & f ? 2 : 0), 
                a;
            }
        },
        special: {
            load: {
                noBubble: !0
            },
            focus: {
                trigger: function() {
                    if (this !== o() && this.focus) try {
                        return this.focus(), !1;
                    } catch (a) {}
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function() {
                    return this === o() && this.blur ? (this.blur(), !1) : void 0;
                },
                delegateType: "focusout"
            },
            click: {
                trigger: function() {
                    return fb.nodeName(this, "input") && "checkbox" === this.type && this.click ? (this.click(), 
                    !1) : void 0;
                },
                _default: function(a) {
                    return fb.nodeName(a.target, "a");
                }
            },
            beforeunload: {
                postDispatch: function(a) {
                    void 0 !== a.result && (a.originalEvent.returnValue = a.result);
                }
            }
        },
        simulate: function(a, b, c, d) {
            var e = fb.extend(new fb.Event(), c, {
                type: a,
                isSimulated: !0,
                originalEvent: {}
            });
            d ? fb.event.trigger(e, null, b) : fb.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault();
        }
    }, fb.removeEvent = pb.removeEventListener ? function(a, b, c) {
        a.removeEventListener && a.removeEventListener(b, c, !1);
    } : function(a, b, c) {
        var d = "on" + b;
        a.detachEvent && (typeof a[d] === yb && (a[d] = null), a.detachEvent(d, c));
    }, fb.Event = function(a, b) {
        return this instanceof fb.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, 
        this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && (a.returnValue === !1 || a.getPreventDefault && a.getPreventDefault()) ? m : n) : this.type = a, 
        b && fb.extend(this, b), this.timeStamp = a && a.timeStamp || fb.now(), void (this[fb.expando] = !0)) : new fb.Event(a, b);
    }, fb.Event.prototype = {
        isDefaultPrevented: n,
        isPropagationStopped: n,
        isImmediatePropagationStopped: n,
        preventDefault: function() {
            var a = this.originalEvent;
            this.isDefaultPrevented = m, a && (a.preventDefault ? a.preventDefault() : a.returnValue = !1);
        },
        stopPropagation: function() {
            var a = this.originalEvent;
            this.isPropagationStopped = m, a && (a.stopPropagation && a.stopPropagation(), a.cancelBubble = !0);
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = m, this.stopPropagation();
        }
    }, fb.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(a, b) {
        fb.event.special[a] = {
            delegateType: b,
            bindType: b,
            handle: function(a) {
                var c, d = this, e = a.relatedTarget, f = a.handleObj;
                return (!e || e !== d && !fb.contains(d, e)) && (a.type = f.origType, c = f.handler.apply(this, arguments), 
                a.type = b), c;
            }
        };
    }), db.submitBubbles || (fb.event.special.submit = {
        setup: function() {
            return fb.nodeName(this, "form") ? !1 : void fb.event.add(this, "click._submit keypress._submit", function(a) {
                var b = a.target, c = fb.nodeName(b, "input") || fb.nodeName(b, "button") ? b.form : void 0;
                c && !fb._data(c, "submitBubbles") && (fb.event.add(c, "submit._submit", function(a) {
                    a._submit_bubble = !0;
                }), fb._data(c, "submitBubbles", !0));
            });
        },
        postDispatch: function(a) {
            a._submit_bubble && (delete a._submit_bubble, this.parentNode && !a.isTrigger && fb.event.simulate("submit", this.parentNode, a, !0));
        },
        teardown: function() {
            return fb.nodeName(this, "form") ? !1 : void fb.event.remove(this, "._submit");
        }
    }), db.changeBubbles || (fb.event.special.change = {
        setup: function() {
            return Gb.test(this.nodeName) ? (("checkbox" === this.type || "radio" === this.type) && (fb.event.add(this, "propertychange._change", function(a) {
                "checked" === a.originalEvent.propertyName && (this._just_changed = !0);
            }), fb.event.add(this, "click._change", function(a) {
                this._just_changed && !a.isTrigger && (this._just_changed = !1), fb.event.simulate("change", this, a, !0);
            })), !1) : void fb.event.add(this, "beforeactivate._change", function(a) {
                var b = a.target;
                Gb.test(b.nodeName) && !fb._data(b, "changeBubbles") && (fb.event.add(b, "change._change", function(a) {
                    !this.parentNode || a.isSimulated || a.isTrigger || fb.event.simulate("change", this.parentNode, a, !0);
                }), fb._data(b, "changeBubbles", !0));
            });
        },
        handle: function(a) {
            var b = a.target;
            return this !== b || a.isSimulated || a.isTrigger || "radio" !== b.type && "checkbox" !== b.type ? a.handleObj.handler.apply(this, arguments) : void 0;
        },
        teardown: function() {
            return fb.event.remove(this, "._change"), !Gb.test(this.nodeName);
        }
    }), db.focusinBubbles || fb.each({
        focus: "focusin",
        blur: "focusout"
    }, function(a, b) {
        var c = function(a) {
            fb.event.simulate(b, a.target, fb.event.fix(a), !0);
        };
        fb.event.special[b] = {
            setup: function() {
                var d = this.ownerDocument || this, e = fb._data(d, b);
                e || d.addEventListener(a, c, !0), fb._data(d, b, (e || 0) + 1);
            },
            teardown: function() {
                var d = this.ownerDocument || this, e = fb._data(d, b) - 1;
                e ? fb._data(d, b, e) : (d.removeEventListener(a, c, !0), fb._removeData(d, b));
            }
        };
    }), fb.fn.extend({
        on: function(a, b, c, d, e) {
            var f, g;
            if ("object" == typeof a) {
                "string" != typeof b && (c = c || b, b = void 0);
                for (f in a) this.on(f, b, c, a[f], e);
                return this;
            }
            if (null == c && null == d ? (d = b, c = b = void 0) : null == d && ("string" == typeof b ? (d = c, 
            c = void 0) : (d = c, c = b, b = void 0)), d === !1) d = n; else if (!d) return this;
            return 1 === e && (g = d, d = function(a) {
                return fb().off(a), g.apply(this, arguments);
            }, d.guid = g.guid || (g.guid = fb.guid++)), this.each(function() {
                fb.event.add(this, a, d, c, b);
            });
        },
        one: function(a, b, c, d) {
            return this.on(a, b, c, d, 1);
        },
        off: function(a, b, c) {
            var d, e;
            if (a && a.preventDefault && a.handleObj) return d = a.handleObj, fb(a.delegateTarget).off(d.namespace ? d.origType + "." + d.namespace : d.origType, d.selector, d.handler), 
            this;
            if ("object" == typeof a) {
                for (e in a) this.off(e, b, a[e]);
                return this;
            }
            return (b === !1 || "function" == typeof b) && (c = b, b = void 0), c === !1 && (c = n), 
            this.each(function() {
                fb.event.remove(this, a, c, b);
            });
        },
        trigger: function(a, b) {
            return this.each(function() {
                fb.event.trigger(a, b, this);
            });
        },
        triggerHandler: function(a, b) {
            var c = this[0];
            return c ? fb.event.trigger(a, b, c, !0) : void 0;
        }
    });
    var Lb = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video", Mb = / jQuery\d+="(?:null|\d+)"/g, Nb = new RegExp("<(?:" + Lb + ")[\\s/>]", "i"), Ob = /^\s+/, Pb = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, Qb = /<([\w:]+)/, Rb = /<tbody/i, Sb = /<|&#?\w+;/, Tb = /<(?:script|style|link)/i, Ub = /checked\s*(?:[^=]|=\s*.checked.)/i, Vb = /^$|\/(?:java|ecma)script/i, Wb = /^true\/(.*)/, Xb = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, Yb = {
        option: [ 1, "<select multiple='multiple'>", "</select>" ],
        legend: [ 1, "<fieldset>", "</fieldset>" ],
        area: [ 1, "<map>", "</map>" ],
        param: [ 1, "<object>", "</object>" ],
        thead: [ 1, "<table>", "</table>" ],
        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
        _default: db.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
    }, Zb = p(pb), $b = Zb.appendChild(pb.createElement("div"));
    Yb.optgroup = Yb.option, Yb.tbody = Yb.tfoot = Yb.colgroup = Yb.caption = Yb.thead, 
    Yb.th = Yb.td, fb.extend({
        clone: function(a, b, c) {
            var d, e, f, g, h, i = fb.contains(a.ownerDocument, a);
            if (db.html5Clone || fb.isXMLDoc(a) || !Nb.test("<" + a.nodeName + ">") ? f = a.cloneNode(!0) : ($b.innerHTML = a.outerHTML, 
            $b.removeChild(f = $b.firstChild)), !(db.noCloneEvent && db.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || fb.isXMLDoc(a))) for (d = q(f), 
            h = q(a), g = 0; null != (e = h[g]); ++g) d[g] && x(e, d[g]);
            if (b) if (c) for (h = h || q(a), d = d || q(f), g = 0; null != (e = h[g]); g++) w(e, d[g]); else w(a, f);
            return d = q(f, "script"), d.length > 0 && v(d, !i && q(a, "script")), d = h = e = null, 
            f;
        },
        buildFragment: function(a, b, c, d) {
            for (var e, f, g, h, i, j, k, l = a.length, m = p(b), n = [], o = 0; l > o; o++) if (f = a[o], 
            f || 0 === f) if ("object" === fb.type(f)) fb.merge(n, f.nodeType ? [ f ] : f); else if (Sb.test(f)) {
                for (h = h || m.appendChild(b.createElement("div")), i = (Qb.exec(f) || [ "", "" ])[1].toLowerCase(), 
                k = Yb[i] || Yb._default, h.innerHTML = k[1] + f.replace(Pb, "<$1></$2>") + k[2], 
                e = k[0]; e--; ) h = h.lastChild;
                if (!db.leadingWhitespace && Ob.test(f) && n.push(b.createTextNode(Ob.exec(f)[0])), 
                !db.tbody) for (f = "table" !== i || Rb.test(f) ? "<table>" !== k[1] || Rb.test(f) ? 0 : h : h.firstChild, 
                e = f && f.childNodes.length; e--; ) fb.nodeName(j = f.childNodes[e], "tbody") && !j.childNodes.length && f.removeChild(j);
                for (fb.merge(n, h.childNodes), h.textContent = ""; h.firstChild; ) h.removeChild(h.firstChild);
                h = m.lastChild;
            } else n.push(b.createTextNode(f));
            for (h && m.removeChild(h), db.appendChecked || fb.grep(q(n, "input"), r), o = 0; f = n[o++]; ) if ((!d || -1 === fb.inArray(f, d)) && (g = fb.contains(f.ownerDocument, f), 
            h = q(m.appendChild(f), "script"), g && v(h), c)) for (e = 0; f = h[e++]; ) Vb.test(f.type || "") && c.push(f);
            return h = null, m;
        },
        cleanData: function(a, b) {
            for (var c, d, e, f, g = 0, h = fb.expando, i = fb.cache, j = db.deleteExpando, k = fb.event.special; null != (c = a[g]); g++) if ((b || fb.acceptData(c)) && (e = c[h], 
            f = e && i[e])) {
                if (f.events) for (d in f.events) k[d] ? fb.event.remove(c, d) : fb.removeEvent(c, d, f.handle);
                i[e] && (delete i[e], j ? delete c[h] : typeof c.removeAttribute !== yb ? c.removeAttribute(h) : c[h] = null, 
                W.push(e));
            }
        }
    }), fb.fn.extend({
        text: function(a) {
            return Eb(this, function(a) {
                return void 0 === a ? fb.text(this) : this.empty().append((this[0] && this[0].ownerDocument || pb).createTextNode(a));
            }, null, a, arguments.length);
        },
        append: function() {
            return this.domManip(arguments, function(a) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var b = s(this, a);
                    b.appendChild(a);
                }
            });
        },
        prepend: function() {
            return this.domManip(arguments, function(a) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var b = s(this, a);
                    b.insertBefore(a, b.firstChild);
                }
            });
        },
        before: function() {
            return this.domManip(arguments, function(a) {
                this.parentNode && this.parentNode.insertBefore(a, this);
            });
        },
        after: function() {
            return this.domManip(arguments, function(a) {
                this.parentNode && this.parentNode.insertBefore(a, this.nextSibling);
            });
        },
        remove: function(a, b) {
            for (var c, d = a ? fb.filter(a, this) : this, e = 0; null != (c = d[e]); e++) b || 1 !== c.nodeType || fb.cleanData(q(c)), 
            c.parentNode && (b && fb.contains(c.ownerDocument, c) && v(q(c, "script")), c.parentNode.removeChild(c));
            return this;
        },
        empty: function() {
            for (var a, b = 0; null != (a = this[b]); b++) {
                for (1 === a.nodeType && fb.cleanData(q(a, !1)); a.firstChild; ) a.removeChild(a.firstChild);
                a.options && fb.nodeName(a, "select") && (a.options.length = 0);
            }
            return this;
        },
        clone: function(a, b) {
            return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function() {
                return fb.clone(this, a, b);
            });
        },
        html: function(a) {
            return Eb(this, function(a) {
                var b = this[0] || {}, c = 0, d = this.length;
                if (void 0 === a) return 1 === b.nodeType ? b.innerHTML.replace(Mb, "") : void 0;
                if (!("string" != typeof a || Tb.test(a) || !db.htmlSerialize && Nb.test(a) || !db.leadingWhitespace && Ob.test(a) || Yb[(Qb.exec(a) || [ "", "" ])[1].toLowerCase()])) {
                    a = a.replace(Pb, "<$1></$2>");
                    try {
                        for (;d > c; c++) b = this[c] || {}, 1 === b.nodeType && (fb.cleanData(q(b, !1)), 
                        b.innerHTML = a);
                        b = 0;
                    } catch (e) {}
                }
                b && this.empty().append(a);
            }, null, a, arguments.length);
        },
        replaceWith: function() {
            var a = arguments[0];
            return this.domManip(arguments, function(b) {
                a = this.parentNode, fb.cleanData(q(this)), a && a.replaceChild(b, this);
            }), a && (a.length || a.nodeType) ? this : this.remove();
        },
        detach: function(a) {
            return this.remove(a, !0);
        },
        domManip: function(a, b) {
            a = Y.apply([], a);
            var c, d, e, f, g, h, i = 0, j = this.length, k = this, l = j - 1, m = a[0], n = fb.isFunction(m);
            if (n || j > 1 && "string" == typeof m && !db.checkClone && Ub.test(m)) return this.each(function(c) {
                var d = k.eq(c);
                n && (a[0] = m.call(this, c, d.html())), d.domManip(a, b);
            });
            if (j && (h = fb.buildFragment(a, this[0].ownerDocument, !1, this), c = h.firstChild, 
            1 === h.childNodes.length && (h = c), c)) {
                for (f = fb.map(q(h, "script"), t), e = f.length; j > i; i++) d = h, i !== l && (d = fb.clone(d, !0, !0), 
                e && fb.merge(f, q(d, "script"))), b.call(this[i], d, i);
                if (e) for (g = f[f.length - 1].ownerDocument, fb.map(f, u), i = 0; e > i; i++) d = f[i], 
                Vb.test(d.type || "") && !fb._data(d, "globalEval") && fb.contains(g, d) && (d.src ? fb._evalUrl && fb._evalUrl(d.src) : fb.globalEval((d.text || d.textContent || d.innerHTML || "").replace(Xb, "")));
                h = c = null;
            }
            return this;
        }
    }), fb.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(a, b) {
        fb.fn[a] = function(a) {
            for (var c, d = 0, e = [], f = fb(a), g = f.length - 1; g >= d; d++) c = d === g ? this : this.clone(!0), 
            fb(f[d])[b](c), Z.apply(e, c.get());
            return this.pushStack(e);
        };
    });
    var _b, ac = {};
    !function() {
        var a, b, c = pb.createElement("div"), d = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;padding:0;margin:0;border:0";
        c.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", 
        a = c.getElementsByTagName("a")[0], a.style.cssText = "float:left;opacity:.5", db.opacity = /^0.5/.test(a.style.opacity), 
        db.cssFloat = !!a.style.cssFloat, c.style.backgroundClip = "content-box", c.cloneNode(!0).style.backgroundClip = "", 
        db.clearCloneStyle = "content-box" === c.style.backgroundClip, a = c = null, db.shrinkWrapBlocks = function() {
            var a, c, e, f;
            if (null == b) {
                if (a = pb.getElementsByTagName("body")[0], !a) return;
                f = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px", c = pb.createElement("div"), 
                e = pb.createElement("div"), a.appendChild(c).appendChild(e), b = !1, typeof e.style.zoom !== yb && (e.style.cssText = d + ";width:1px;padding:1px;zoom:1", 
                e.innerHTML = "<div></div>", e.firstChild.style.width = "5px", b = 3 !== e.offsetWidth), 
                a.removeChild(c), a = c = e = null;
            }
            return b;
        };
    }();
    var bc, cc, dc = /^margin/, ec = new RegExp("^(" + Bb + ")(?!px)[a-z%]+$", "i"), fc = /^(top|right|bottom|left)$/;
    a.getComputedStyle ? (bc = function(a) {
        return a.ownerDocument.defaultView.getComputedStyle(a, null);
    }, cc = function(a, b, c) {
        var d, e, f, g, h = a.style;
        return c = c || bc(a), g = c ? c.getPropertyValue(b) || c[b] : void 0, c && ("" !== g || fb.contains(a.ownerDocument, a) || (g = fb.style(a, b)), 
        ec.test(g) && dc.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, 
        g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f)), void 0 === g ? g : g + "";
    }) : pb.documentElement.currentStyle && (bc = function(a) {
        return a.currentStyle;
    }, cc = function(a, b, c) {
        var d, e, f, g, h = a.style;
        return c = c || bc(a), g = c ? c[b] : void 0, null == g && h && h[b] && (g = h[b]), 
        ec.test(g) && !fc.test(b) && (d = h.left, e = a.runtimeStyle, f = e && e.left, f && (e.left = a.currentStyle.left), 
        h.left = "fontSize" === b ? "1em" : g, g = h.pixelLeft + "px", h.left = d, f && (e.left = f)), 
        void 0 === g ? g : g + "" || "auto";
    }), !function() {
        function b() {
            var b, c, d = pb.getElementsByTagName("body")[0];
            d && (b = pb.createElement("div"), c = pb.createElement("div"), b.style.cssText = j, 
            d.appendChild(b).appendChild(c), c.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;display:block;padding:1px;border:1px;width:4px;margin-top:1%;top:1%", 
            fb.swap(d, null != d.style.zoom ? {
                zoom: 1
            } : {}, function() {
                e = 4 === c.offsetWidth;
            }), f = !0, g = !1, h = !0, a.getComputedStyle && (g = "1%" !== (a.getComputedStyle(c, null) || {}).top, 
            f = "4px" === (a.getComputedStyle(c, null) || {
                width: "4px"
            }).width), d.removeChild(b), c = d = null);
        }
        var c, d, e, f, g, h, i = pb.createElement("div"), j = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px", k = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;padding:0;margin:0;border:0";
        i.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", 
        c = i.getElementsByTagName("a")[0], c.style.cssText = "float:left;opacity:.5", db.opacity = /^0.5/.test(c.style.opacity), 
        db.cssFloat = !!c.style.cssFloat, i.style.backgroundClip = "content-box", i.cloneNode(!0).style.backgroundClip = "", 
        db.clearCloneStyle = "content-box" === i.style.backgroundClip, c = i = null, fb.extend(db, {
            reliableHiddenOffsets: function() {
                if (null != d) return d;
                var a, b, c, e = pb.createElement("div"), f = pb.getElementsByTagName("body")[0];
                return f ? (e.setAttribute("className", "t"), e.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", 
                a = pb.createElement("div"), a.style.cssText = j, f.appendChild(a).appendChild(e), 
                e.innerHTML = "<table><tr><td></td><td>t</td></tr></table>", b = e.getElementsByTagName("td"), 
                b[0].style.cssText = "padding:0;margin:0;border:0;display:none", c = 0 === b[0].offsetHeight, 
                b[0].style.display = "", b[1].style.display = "none", d = c && 0 === b[0].offsetHeight, 
                f.removeChild(a), e = f = null, d) : void 0;
            },
            boxSizing: function() {
                return null == e && b(), e;
            },
            boxSizingReliable: function() {
                return null == f && b(), f;
            },
            pixelPosition: function() {
                return null == g && b(), g;
            },
            reliableMarginRight: function() {
                var b, c, d, e;
                if (null == h && a.getComputedStyle) {
                    if (b = pb.getElementsByTagName("body")[0], !b) return;
                    c = pb.createElement("div"), d = pb.createElement("div"), c.style.cssText = j, b.appendChild(c).appendChild(d), 
                    e = d.appendChild(pb.createElement("div")), e.style.cssText = d.style.cssText = k, 
                    e.style.marginRight = e.style.width = "0", d.style.width = "1px", h = !parseFloat((a.getComputedStyle(e, null) || {}).marginRight), 
                    b.removeChild(c);
                }
                return h;
            }
        });
    }(), fb.swap = function(a, b, c, d) {
        var e, f, g = {};
        for (f in b) g[f] = a.style[f], a.style[f] = b[f];
        e = c.apply(a, d || []);
        for (f in b) a.style[f] = g[f];
        return e;
    };
    var gc = /alpha\([^)]*\)/i, hc = /opacity\s*=\s*([^)]*)/, ic = /^(none|table(?!-c[ea]).+)/, jc = new RegExp("^(" + Bb + ")(.*)$", "i"), kc = new RegExp("^([+-])=(" + Bb + ")", "i"), lc = {
        position: "absolute",
        visibility: "hidden",
        display: "block"
    }, mc = {
        letterSpacing: 0,
        fontWeight: 400
    }, nc = [ "Webkit", "O", "Moz", "ms" ];
    fb.extend({
        cssHooks: {
            opacity: {
                get: function(a, b) {
                    if (b) {
                        var c = cc(a, "opacity");
                        return "" === c ? "1" : c;
                    }
                }
            }
        },
        cssNumber: {
            columnCount: !0,
            fillOpacity: !0,
            fontWeight: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0
        },
        cssProps: {
            "float": db.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function(a, b, c, d) {
            if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
                var e, f, g, h = fb.camelCase(b), i = a.style;
                if (b = fb.cssProps[h] || (fb.cssProps[h] = B(i, h)), g = fb.cssHooks[b] || fb.cssHooks[h], 
                void 0 === c) return g && "get" in g && void 0 !== (e = g.get(a, !1, d)) ? e : i[b];
                if (f = typeof c, "string" === f && (e = kc.exec(c)) && (c = (e[1] + 1) * e[2] + parseFloat(fb.css(a, b)), 
                f = "number"), null != c && c === c && ("number" !== f || fb.cssNumber[h] || (c += "px"), 
                db.clearCloneStyle || "" !== c || 0 !== b.indexOf("background") || (i[b] = "inherit"), 
                !(g && "set" in g && void 0 === (c = g.set(a, c, d))))) try {
                    i[b] = "", i[b] = c;
                } catch (j) {}
            }
        },
        css: function(a, b, c, d) {
            var e, f, g, h = fb.camelCase(b);
            return b = fb.cssProps[h] || (fb.cssProps[h] = B(a.style, h)), g = fb.cssHooks[b] || fb.cssHooks[h], 
            g && "get" in g && (f = g.get(a, !0, c)), void 0 === f && (f = cc(a, b, d)), "normal" === f && b in mc && (f = mc[b]), 
            "" === c || c ? (e = parseFloat(f), c === !0 || fb.isNumeric(e) ? e || 0 : f) : f;
        }
    }), fb.each([ "height", "width" ], function(a, b) {
        fb.cssHooks[b] = {
            get: function(a, c, d) {
                return c ? 0 === a.offsetWidth && ic.test(fb.css(a, "display")) ? fb.swap(a, lc, function() {
                    return F(a, b, d);
                }) : F(a, b, d) : void 0;
            },
            set: function(a, c, d) {
                var e = d && bc(a);
                return D(a, c, d ? E(a, b, d, db.boxSizing() && "border-box" === fb.css(a, "boxSizing", !1, e), e) : 0);
            }
        };
    }), db.opacity || (fb.cssHooks.opacity = {
        get: function(a, b) {
            return hc.test((b && a.currentStyle ? a.currentStyle.filter : a.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : b ? "1" : "";
        },
        set: function(a, b) {
            var c = a.style, d = a.currentStyle, e = fb.isNumeric(b) ? "alpha(opacity=" + 100 * b + ")" : "", f = d && d.filter || c.filter || "";
            c.zoom = 1, (b >= 1 || "" === b) && "" === fb.trim(f.replace(gc, "")) && c.removeAttribute && (c.removeAttribute("filter"), 
            "" === b || d && !d.filter) || (c.filter = gc.test(f) ? f.replace(gc, e) : f + " " + e);
        }
    }), fb.cssHooks.marginRight = A(db.reliableMarginRight, function(a, b) {
        return b ? fb.swap(a, {
            display: "inline-block"
        }, cc, [ a, "marginRight" ]) : void 0;
    }), fb.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(a, b) {
        fb.cssHooks[a + b] = {
            expand: function(c) {
                for (var d = 0, e = {}, f = "string" == typeof c ? c.split(" ") : [ c ]; 4 > d; d++) e[a + Cb[d] + b] = f[d] || f[d - 2] || f[0];
                return e;
            }
        }, dc.test(a) || (fb.cssHooks[a + b].set = D);
    }), fb.fn.extend({
        css: function(a, b) {
            return Eb(this, function(a, b, c) {
                var d, e, f = {}, g = 0;
                if (fb.isArray(b)) {
                    for (d = bc(a), e = b.length; e > g; g++) f[b[g]] = fb.css(a, b[g], !1, d);
                    return f;
                }
                return void 0 !== c ? fb.style(a, b, c) : fb.css(a, b);
            }, a, b, arguments.length > 1);
        },
        show: function() {
            return C(this, !0);
        },
        hide: function() {
            return C(this);
        },
        toggle: function(a) {
            return "boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function() {
                Db(this) ? fb(this).show() : fb(this).hide();
            });
        }
    }), fb.Tween = G, G.prototype = {
        constructor: G,
        init: function(a, b, c, d, e, f) {
            this.elem = a, this.prop = c, this.easing = e || "swing", this.options = b, this.start = this.now = this.cur(), 
            this.end = d, this.unit = f || (fb.cssNumber[c] ? "" : "px");
        },
        cur: function() {
            var a = G.propHooks[this.prop];
            return a && a.get ? a.get(this) : G.propHooks._default.get(this);
        },
        run: function(a) {
            var b, c = G.propHooks[this.prop];
            return this.pos = b = this.options.duration ? fb.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : a, 
            this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), 
            c && c.set ? c.set(this) : G.propHooks._default.set(this), this;
        }
    }, G.prototype.init.prototype = G.prototype, G.propHooks = {
        _default: {
            get: function(a) {
                var b;
                return null == a.elem[a.prop] || a.elem.style && null != a.elem.style[a.prop] ? (b = fb.css(a.elem, a.prop, ""), 
                b && "auto" !== b ? b : 0) : a.elem[a.prop];
            },
            set: function(a) {
                fb.fx.step[a.prop] ? fb.fx.step[a.prop](a) : a.elem.style && (null != a.elem.style[fb.cssProps[a.prop]] || fb.cssHooks[a.prop]) ? fb.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now;
            }
        }
    }, G.propHooks.scrollTop = G.propHooks.scrollLeft = {
        set: function(a) {
            a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now);
        }
    }, fb.easing = {
        linear: function(a) {
            return a;
        },
        swing: function(a) {
            return .5 - Math.cos(a * Math.PI) / 2;
        }
    }, fb.fx = G.prototype.init, fb.fx.step = {};
    var oc, pc, qc = /^(?:toggle|show|hide)$/, rc = new RegExp("^(?:([+-])=|)(" + Bb + ")([a-z%]*)$", "i"), sc = /queueHooks$/, tc = [ K ], uc = {
        "*": [ function(a, b) {
            var c = this.createTween(a, b), d = c.cur(), e = rc.exec(b), f = e && e[3] || (fb.cssNumber[a] ? "" : "px"), g = (fb.cssNumber[a] || "px" !== f && +d) && rc.exec(fb.css(c.elem, a)), h = 1, i = 20;
            if (g && g[3] !== f) {
                f = f || g[3], e = e || [], g = +d || 1;
                do h = h || ".5", g /= h, fb.style(c.elem, a, g + f); while (h !== (h = c.cur() / d) && 1 !== h && --i);
            }
            return e && (g = c.start = +g || +d || 0, c.unit = f, c.end = e[1] ? g + (e[1] + 1) * e[2] : +e[2]), 
            c;
        } ]
    };
    fb.Animation = fb.extend(M, {
        tweener: function(a, b) {
            fb.isFunction(a) ? (b = a, a = [ "*" ]) : a = a.split(" ");
            for (var c, d = 0, e = a.length; e > d; d++) c = a[d], uc[c] = uc[c] || [], uc[c].unshift(b);
        },
        prefilter: function(a, b) {
            b ? tc.unshift(a) : tc.push(a);
        }
    }), fb.speed = function(a, b, c) {
        var d = a && "object" == typeof a ? fb.extend({}, a) : {
            complete: c || !c && b || fb.isFunction(a) && a,
            duration: a,
            easing: c && b || b && !fb.isFunction(b) && b
        };
        return d.duration = fb.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in fb.fx.speeds ? fb.fx.speeds[d.duration] : fb.fx.speeds._default, 
        (null == d.queue || d.queue === !0) && (d.queue = "fx"), d.old = d.complete, d.complete = function() {
            fb.isFunction(d.old) && d.old.call(this), d.queue && fb.dequeue(this, d.queue);
        }, d;
    }, fb.fn.extend({
        fadeTo: function(a, b, c, d) {
            return this.filter(Db).css("opacity", 0).show().end().animate({
                opacity: b
            }, a, c, d);
        },
        animate: function(a, b, c, d) {
            var e = fb.isEmptyObject(a), f = fb.speed(b, c, d), g = function() {
                var b = M(this, fb.extend({}, a), f);
                (e || fb._data(this, "finish")) && b.stop(!0);
            };
            return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g);
        },
        stop: function(a, b, c) {
            var d = function(a) {
                var b = a.stop;
                delete a.stop, b(c);
            };
            return "string" != typeof a && (c = b, b = a, a = void 0), b && a !== !1 && this.queue(a || "fx", []), 
            this.each(function() {
                var b = !0, e = null != a && a + "queueHooks", f = fb.timers, g = fb._data(this);
                if (e) g[e] && g[e].stop && d(g[e]); else for (e in g) g[e] && g[e].stop && sc.test(e) && d(g[e]);
                for (e = f.length; e--; ) f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), 
                b = !1, f.splice(e, 1));
                (b || !c) && fb.dequeue(this, a);
            });
        },
        finish: function(a) {
            return a !== !1 && (a = a || "fx"), this.each(function() {
                var b, c = fb._data(this), d = c[a + "queue"], e = c[a + "queueHooks"], f = fb.timers, g = d ? d.length : 0;
                for (c.finish = !0, fb.queue(this, a, []), e && e.stop && e.stop.call(this, !0), 
                b = f.length; b--; ) f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), 
                f.splice(b, 1));
                for (b = 0; g > b; b++) d[b] && d[b].finish && d[b].finish.call(this);
                delete c.finish;
            });
        }
    }), fb.each([ "toggle", "show", "hide" ], function(a, b) {
        var c = fb.fn[b];
        fb.fn[b] = function(a, d, e) {
            return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(I(b, !0), a, d, e);
        };
    }), fb.each({
        slideDown: I("show"),
        slideUp: I("hide"),
        slideToggle: I("toggle"),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(a, b) {
        fb.fn[a] = function(a, c, d) {
            return this.animate(b, a, c, d);
        };
    }), fb.timers = [], fb.fx.tick = function() {
        var a, b = fb.timers, c = 0;
        for (oc = fb.now(); c < b.length; c++) a = b[c], a() || b[c] !== a || b.splice(c--, 1);
        b.length || fb.fx.stop(), oc = void 0;
    }, fb.fx.timer = function(a) {
        fb.timers.push(a), a() ? fb.fx.start() : fb.timers.pop();
    }, fb.fx.interval = 13, fb.fx.start = function() {
        pc || (pc = setInterval(fb.fx.tick, fb.fx.interval));
    }, fb.fx.stop = function() {
        clearInterval(pc), pc = null;
    }, fb.fx.speeds = {
        slow: 600,
        fast: 200,
        _default: 400
    }, fb.fn.delay = function(a, b) {
        return a = fb.fx ? fb.fx.speeds[a] || a : a, b = b || "fx", this.queue(b, function(b, c) {
            var d = setTimeout(b, a);
            c.stop = function() {
                clearTimeout(d);
            };
        });
    }, function() {
        var a, b, c, d, e = pb.createElement("div");
        e.setAttribute("className", "t"), e.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", 
        a = e.getElementsByTagName("a")[0], c = pb.createElement("select"), d = c.appendChild(pb.createElement("option")), 
        b = e.getElementsByTagName("input")[0], a.style.cssText = "top:1px", db.getSetAttribute = "t" !== e.className, 
        db.style = /top/.test(a.getAttribute("style")), db.hrefNormalized = "/a" === a.getAttribute("href"), 
        db.checkOn = !!b.value, db.optSelected = d.selected, db.enctype = !!pb.createElement("form").enctype, 
        c.disabled = !0, db.optDisabled = !d.disabled, b = pb.createElement("input"), b.setAttribute("value", ""), 
        db.input = "" === b.getAttribute("value"), b.value = "t", b.setAttribute("type", "radio"), 
        db.radioValue = "t" === b.value, a = b = c = d = e = null;
    }();
    var vc = /\r/g;
    fb.fn.extend({
        val: function(a) {
            var b, c, d, e = this[0];
            return arguments.length ? (d = fb.isFunction(a), this.each(function(c) {
                var e;
                1 === this.nodeType && (e = d ? a.call(this, c, fb(this).val()) : a, null == e ? e = "" : "number" == typeof e ? e += "" : fb.isArray(e) && (e = fb.map(e, function(a) {
                    return null == a ? "" : a + "";
                })), b = fb.valHooks[this.type] || fb.valHooks[this.nodeName.toLowerCase()], b && "set" in b && void 0 !== b.set(this, e, "value") || (this.value = e));
            })) : e ? (b = fb.valHooks[e.type] || fb.valHooks[e.nodeName.toLowerCase()], b && "get" in b && void 0 !== (c = b.get(e, "value")) ? c : (c = e.value, 
            "string" == typeof c ? c.replace(vc, "") : null == c ? "" : c)) : void 0;
        }
    }), fb.extend({
        valHooks: {
            option: {
                get: function(a) {
                    var b = fb.find.attr(a, "value");
                    return null != b ? b : fb.text(a);
                }
            },
            select: {
                get: function(a) {
                    for (var b, c, d = a.options, e = a.selectedIndex, f = "select-one" === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++) if (c = d[i], 
                    !(!c.selected && i !== e || (db.optDisabled ? c.disabled : null !== c.getAttribute("disabled")) || c.parentNode.disabled && fb.nodeName(c.parentNode, "optgroup"))) {
                        if (b = fb(c).val(), f) return b;
                        g.push(b);
                    }
                    return g;
                },
                set: function(a, b) {
                    for (var c, d, e = a.options, f = fb.makeArray(b), g = e.length; g--; ) if (d = e[g], 
                    fb.inArray(fb.valHooks.option.get(d), f) >= 0) try {
                        d.selected = c = !0;
                    } catch (h) {
                        d.scrollHeight;
                    } else d.selected = !1;
                    return c || (a.selectedIndex = -1), e;
                }
            }
        }
    }), fb.each([ "radio", "checkbox" ], function() {
        fb.valHooks[this] = {
            set: function(a, b) {
                return fb.isArray(b) ? a.checked = fb.inArray(fb(a).val(), b) >= 0 : void 0;
            }
        }, db.checkOn || (fb.valHooks[this].get = function(a) {
            return null === a.getAttribute("value") ? "on" : a.value;
        });
    });
    var wc, xc, yc = fb.expr.attrHandle, zc = /^(?:checked|selected)$/i, Ac = db.getSetAttribute, Bc = db.input;
    fb.fn.extend({
        attr: function(a, b) {
            return Eb(this, fb.attr, a, b, arguments.length > 1);
        },
        removeAttr: function(a) {
            return this.each(function() {
                fb.removeAttr(this, a);
            });
        }
    }), fb.extend({
        attr: function(a, b, c) {
            var d, e, f = a.nodeType;
            return a && 3 !== f && 8 !== f && 2 !== f ? typeof a.getAttribute === yb ? fb.prop(a, b, c) : (1 === f && fb.isXMLDoc(a) || (b = b.toLowerCase(), 
            d = fb.attrHooks[b] || (fb.expr.match.bool.test(b) ? xc : wc)), void 0 === c ? d && "get" in d && null !== (e = d.get(a, b)) ? e : (e = fb.find.attr(a, b), 
            null == e ? void 0 : e) : null !== c ? d && "set" in d && void 0 !== (e = d.set(a, c, b)) ? e : (a.setAttribute(b, c + ""), 
            c) : void fb.removeAttr(a, b)) : void 0;
        },
        removeAttr: function(a, b) {
            var c, d, e = 0, f = b && b.match(ub);
            if (f && 1 === a.nodeType) for (;c = f[e++]; ) d = fb.propFix[c] || c, fb.expr.match.bool.test(c) ? Bc && Ac || !zc.test(c) ? a[d] = !1 : a[fb.camelCase("default-" + c)] = a[d] = !1 : fb.attr(a, c, ""), 
            a.removeAttribute(Ac ? c : d);
        },
        attrHooks: {
            type: {
                set: function(a, b) {
                    if (!db.radioValue && "radio" === b && fb.nodeName(a, "input")) {
                        var c = a.value;
                        return a.setAttribute("type", b), c && (a.value = c), b;
                    }
                }
            }
        }
    }), xc = {
        set: function(a, b, c) {
            return b === !1 ? fb.removeAttr(a, c) : Bc && Ac || !zc.test(c) ? a.setAttribute(!Ac && fb.propFix[c] || c, c) : a[fb.camelCase("default-" + c)] = a[c] = !0, 
            c;
        }
    }, fb.each(fb.expr.match.bool.source.match(/\w+/g), function(a, b) {
        var c = yc[b] || fb.find.attr;
        yc[b] = Bc && Ac || !zc.test(b) ? function(a, b, d) {
            var e, f;
            return d || (f = yc[b], yc[b] = e, e = null != c(a, b, d) ? b.toLowerCase() : null, 
            yc[b] = f), e;
        } : function(a, b, c) {
            return c ? void 0 : a[fb.camelCase("default-" + b)] ? b.toLowerCase() : null;
        };
    }), Bc && Ac || (fb.attrHooks.value = {
        set: function(a, b, c) {
            return fb.nodeName(a, "input") ? void (a.defaultValue = b) : wc && wc.set(a, b, c);
        }
    }), Ac || (wc = {
        set: function(a, b, c) {
            var d = a.getAttributeNode(c);
            return d || a.setAttributeNode(d = a.ownerDocument.createAttribute(c)), d.value = b += "", 
            "value" === c || b === a.getAttribute(c) ? b : void 0;
        }
    }, yc.id = yc.name = yc.coords = function(a, b, c) {
        var d;
        return c ? void 0 : (d = a.getAttributeNode(b)) && "" !== d.value ? d.value : null;
    }, fb.valHooks.button = {
        get: function(a, b) {
            var c = a.getAttributeNode(b);
            return c && c.specified ? c.value : void 0;
        },
        set: wc.set
    }, fb.attrHooks.contenteditable = {
        set: function(a, b, c) {
            wc.set(a, "" === b ? !1 : b, c);
        }
    }, fb.each([ "width", "height" ], function(a, b) {
        fb.attrHooks[b] = {
            set: function(a, c) {
                return "" === c ? (a.setAttribute(b, "auto"), c) : void 0;
            }
        };
    })), db.style || (fb.attrHooks.style = {
        get: function(a) {
            return a.style.cssText || void 0;
        },
        set: function(a, b) {
            return a.style.cssText = b + "";
        }
    });
    var Cc = /^(?:input|select|textarea|button|object)$/i, Dc = /^(?:a|area)$/i;
    fb.fn.extend({
        prop: function(a, b) {
            return Eb(this, fb.prop, a, b, arguments.length > 1);
        },
        removeProp: function(a) {
            return a = fb.propFix[a] || a, this.each(function() {
                try {
                    this[a] = void 0, delete this[a];
                } catch (b) {}
            });
        }
    }), fb.extend({
        propFix: {
            "for": "htmlFor",
            "class": "className"
        },
        prop: function(a, b, c) {
            var d, e, f, g = a.nodeType;
            return a && 3 !== g && 8 !== g && 2 !== g ? (f = 1 !== g || !fb.isXMLDoc(a), f && (b = fb.propFix[b] || b, 
            e = fb.propHooks[b]), void 0 !== c ? e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && "get" in e && null !== (d = e.get(a, b)) ? d : a[b]) : void 0;
        },
        propHooks: {
            tabIndex: {
                get: function(a) {
                    var b = fb.find.attr(a, "tabindex");
                    return b ? parseInt(b, 10) : Cc.test(a.nodeName) || Dc.test(a.nodeName) && a.href ? 0 : -1;
                }
            }
        }
    }), db.hrefNormalized || fb.each([ "href", "src" ], function(a, b) {
        fb.propHooks[b] = {
            get: function(a) {
                return a.getAttribute(b, 4);
            }
        };
    }), db.optSelected || (fb.propHooks.selected = {
        get: function(a) {
            var b = a.parentNode;
            return b && (b.selectedIndex, b.parentNode && b.parentNode.selectedIndex), null;
        }
    }), fb.each([ "tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable" ], function() {
        fb.propFix[this.toLowerCase()] = this;
    }), db.enctype || (fb.propFix.enctype = "encoding");
    var Ec = /[\t\r\n\f]/g;
    fb.fn.extend({
        addClass: function(a) {
            var b, c, d, e, f, g, h = 0, i = this.length, j = "string" == typeof a && a;
            if (fb.isFunction(a)) return this.each(function(b) {
                fb(this).addClass(a.call(this, b, this.className));
            });
            if (j) for (b = (a || "").match(ub) || []; i > h; h++) if (c = this[h], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(Ec, " ") : " ")) {
                for (f = 0; e = b[f++]; ) d.indexOf(" " + e + " ") < 0 && (d += e + " ");
                g = fb.trim(d), c.className !== g && (c.className = g);
            }
            return this;
        },
        removeClass: function(a) {
            var b, c, d, e, f, g, h = 0, i = this.length, j = 0 === arguments.length || "string" == typeof a && a;
            if (fb.isFunction(a)) return this.each(function(b) {
                fb(this).removeClass(a.call(this, b, this.className));
            });
            if (j) for (b = (a || "").match(ub) || []; i > h; h++) if (c = this[h], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(Ec, " ") : "")) {
                for (f = 0; e = b[f++]; ) for (;d.indexOf(" " + e + " ") >= 0; ) d = d.replace(" " + e + " ", " ");
                g = a ? fb.trim(d) : "", c.className !== g && (c.className = g);
            }
            return this;
        },
        toggleClass: function(a, b) {
            var c = typeof a;
            return "boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : this.each(fb.isFunction(a) ? function(c) {
                fb(this).toggleClass(a.call(this, c, this.className, b), b);
            } : function() {
                if ("string" === c) for (var b, d = 0, e = fb(this), f = a.match(ub) || []; b = f[d++]; ) e.hasClass(b) ? e.removeClass(b) : e.addClass(b); else (c === yb || "boolean" === c) && (this.className && fb._data(this, "__className__", this.className), 
                this.className = this.className || a === !1 ? "" : fb._data(this, "__className__") || "");
            });
        },
        hasClass: function(a) {
            for (var b = " " + a + " ", c = 0, d = this.length; d > c; c++) if (1 === this[c].nodeType && (" " + this[c].className + " ").replace(Ec, " ").indexOf(b) >= 0) return !0;
            return !1;
        }
    }), fb.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(a, b) {
        fb.fn[b] = function(a, c) {
            return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b);
        };
    }), fb.fn.extend({
        hover: function(a, b) {
            return this.mouseenter(a).mouseleave(b || a);
        },
        bind: function(a, b, c) {
            return this.on(a, null, b, c);
        },
        unbind: function(a, b) {
            return this.off(a, null, b);
        },
        delegate: function(a, b, c, d) {
            return this.on(b, a, c, d);
        },
        undelegate: function(a, b, c) {
            return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c);
        }
    });
    var Fc = fb.now(), Gc = /\?/, Hc = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;
    fb.parseJSON = function(b) {
        if (a.JSON && a.JSON.parse) return a.JSON.parse(b + "");
        var c, d = null, e = fb.trim(b + "");
        return e && !fb.trim(e.replace(Hc, function(a, b, e, f) {
            return c && b && (d = 0), 0 === d ? a : (c = e || b, d += !f - !e, "");
        })) ? Function("return " + e)() : fb.error("Invalid JSON: " + b);
    }, fb.parseXML = function(b) {
        var c, d;
        if (!b || "string" != typeof b) return null;
        try {
            a.DOMParser ? (d = new DOMParser(), c = d.parseFromString(b, "text/xml")) : (c = new ActiveXObject("Microsoft.XMLDOM"), 
            c.async = "false", c.loadXML(b));
        } catch (e) {
            c = void 0;
        }
        return c && c.documentElement && !c.getElementsByTagName("parsererror").length || fb.error("Invalid XML: " + b), 
        c;
    };
    var Ic, Jc, Kc = /#.*$/, Lc = /([?&])_=[^&]*/, Mc = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm, Nc = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, Oc = /^(?:GET|HEAD)$/, Pc = /^\/\//, Qc = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, Rc = {}, Sc = {}, Tc = "*/".concat("*");
    try {
        Jc = location.href;
    } catch (Uc) {
        Jc = pb.createElement("a"), Jc.href = "", Jc = Jc.href;
    }
    Ic = Qc.exec(Jc.toLowerCase()) || [], fb.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
            url: Jc,
            type: "GET",
            isLocal: Nc.test(Ic[1]),
            global: !0,
            processData: !0,
            async: !0,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
                "*": Tc,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },
            converters: {
                "* text": String,
                "text html": !0,
                "text json": fb.parseJSON,
                "text xml": fb.parseXML
            },
            flatOptions: {
                url: !0,
                context: !0
            }
        },
        ajaxSetup: function(a, b) {
            return b ? P(P(a, fb.ajaxSettings), b) : P(fb.ajaxSettings, a);
        },
        ajaxPrefilter: N(Rc),
        ajaxTransport: N(Sc),
        ajax: function(a, b) {
            function c(a, b, c, d) {
                var e, k, r, s, u, w = b;
                2 !== t && (t = 2, h && clearTimeout(h), j = void 0, g = d || "", v.readyState = a > 0 ? 4 : 0, 
                e = a >= 200 && 300 > a || 304 === a, c && (s = Q(l, v, c)), s = R(l, s, v, e), 
                e ? (l.ifModified && (u = v.getResponseHeader("Last-Modified"), u && (fb.lastModified[f] = u), 
                u = v.getResponseHeader("etag"), u && (fb.etag[f] = u)), 204 === a || "HEAD" === l.type ? w = "nocontent" : 304 === a ? w = "notmodified" : (w = s.state, 
                k = s.data, r = s.error, e = !r)) : (r = w, (a || !w) && (w = "error", 0 > a && (a = 0))), 
                v.status = a, v.statusText = (b || w) + "", e ? o.resolveWith(m, [ k, w, v ]) : o.rejectWith(m, [ v, w, r ]), 
                v.statusCode(q), q = void 0, i && n.trigger(e ? "ajaxSuccess" : "ajaxError", [ v, l, e ? k : r ]), 
                p.fireWith(m, [ v, w ]), i && (n.trigger("ajaxComplete", [ v, l ]), --fb.active || fb.event.trigger("ajaxStop")));
            }
            "object" == typeof a && (b = a, a = void 0), b = b || {};
            var d, e, f, g, h, i, j, k, l = fb.ajaxSetup({}, b), m = l.context || l, n = l.context && (m.nodeType || m.jquery) ? fb(m) : fb.event, o = fb.Deferred(), p = fb.Callbacks("once memory"), q = l.statusCode || {}, r = {}, s = {}, t = 0, u = "canceled", v = {
                readyState: 0,
                getResponseHeader: function(a) {
                    var b;
                    if (2 === t) {
                        if (!k) for (k = {}; b = Mc.exec(g); ) k[b[1].toLowerCase()] = b[2];
                        b = k[a.toLowerCase()];
                    }
                    return null == b ? null : b;
                },
                getAllResponseHeaders: function() {
                    return 2 === t ? g : null;
                },
                setRequestHeader: function(a, b) {
                    var c = a.toLowerCase();
                    return t || (a = s[c] = s[c] || a, r[a] = b), this;
                },
                overrideMimeType: function(a) {
                    return t || (l.mimeType = a), this;
                },
                statusCode: function(a) {
                    var b;
                    if (a) if (2 > t) for (b in a) q[b] = [ q[b], a[b] ]; else v.always(a[v.status]);
                    return this;
                },
                abort: function(a) {
                    var b = a || u;
                    return j && j.abort(b), c(0, b), this;
                }
            };
            if (o.promise(v).complete = p.add, v.success = v.done, v.error = v.fail, l.url = ((a || l.url || Jc) + "").replace(Kc, "").replace(Pc, Ic[1] + "//"), 
            l.type = b.method || b.type || l.method || l.type, l.dataTypes = fb.trim(l.dataType || "*").toLowerCase().match(ub) || [ "" ], 
            null == l.crossDomain && (d = Qc.exec(l.url.toLowerCase()), l.crossDomain = !(!d || d[1] === Ic[1] && d[2] === Ic[2] && (d[3] || ("http:" === d[1] ? "80" : "443")) === (Ic[3] || ("http:" === Ic[1] ? "80" : "443")))), 
            l.data && l.processData && "string" != typeof l.data && (l.data = fb.param(l.data, l.traditional)), 
            O(Rc, l, b, v), 2 === t) return v;
            i = l.global, i && 0 === fb.active++ && fb.event.trigger("ajaxStart"), l.type = l.type.toUpperCase(), 
            l.hasContent = !Oc.test(l.type), f = l.url, l.hasContent || (l.data && (f = l.url += (Gc.test(f) ? "&" : "?") + l.data, 
            delete l.data), l.cache === !1 && (l.url = Lc.test(f) ? f.replace(Lc, "$1_=" + Fc++) : f + (Gc.test(f) ? "&" : "?") + "_=" + Fc++)), 
            l.ifModified && (fb.lastModified[f] && v.setRequestHeader("If-Modified-Since", fb.lastModified[f]), 
            fb.etag[f] && v.setRequestHeader("If-None-Match", fb.etag[f])), (l.data && l.hasContent && l.contentType !== !1 || b.contentType) && v.setRequestHeader("Content-Type", l.contentType), 
            v.setRequestHeader("Accept", l.dataTypes[0] && l.accepts[l.dataTypes[0]] ? l.accepts[l.dataTypes[0]] + ("*" !== l.dataTypes[0] ? ", " + Tc + "; q=0.01" : "") : l.accepts["*"]);
            for (e in l.headers) v.setRequestHeader(e, l.headers[e]);
            if (l.beforeSend && (l.beforeSend.call(m, v, l) === !1 || 2 === t)) return v.abort();
            u = "abort";
            for (e in {
                success: 1,
                error: 1,
                complete: 1
            }) v[e](l[e]);
            if (j = O(Sc, l, b, v)) {
                v.readyState = 1, i && n.trigger("ajaxSend", [ v, l ]), l.async && l.timeout > 0 && (h = setTimeout(function() {
                    v.abort("timeout");
                }, l.timeout));
                try {
                    t = 1, j.send(r, c);
                } catch (w) {
                    if (!(2 > t)) throw w;
                    c(-1, w);
                }
            } else c(-1, "No Transport");
            return v;
        },
        getJSON: function(a, b, c) {
            return fb.get(a, b, c, "json");
        },
        getScript: function(a, b) {
            return fb.get(a, void 0, b, "script");
        }
    }), fb.each([ "get", "post" ], function(a, b) {
        fb[b] = function(a, c, d, e) {
            return fb.isFunction(c) && (e = e || d, d = c, c = void 0), fb.ajax({
                url: a,
                type: b,
                dataType: e,
                data: c,
                success: d
            });
        };
    }), fb.each([ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function(a, b) {
        fb.fn[b] = function(a) {
            return this.on(b, a);
        };
    }), fb._evalUrl = function(a) {
        return fb.ajax({
            url: a,
            type: "GET",
            dataType: "script",
            async: !1,
            global: !1,
            "throws": !0
        });
    }, fb.fn.extend({
        wrapAll: function(a) {
            if (fb.isFunction(a)) return this.each(function(b) {
                fb(this).wrapAll(a.call(this, b));
            });
            if (this[0]) {
                var b = fb(a, this[0].ownerDocument).eq(0).clone(!0);
                this[0].parentNode && b.insertBefore(this[0]), b.map(function() {
                    for (var a = this; a.firstChild && 1 === a.firstChild.nodeType; ) a = a.firstChild;
                    return a;
                }).append(this);
            }
            return this;
        },
        wrapInner: function(a) {
            return this.each(fb.isFunction(a) ? function(b) {
                fb(this).wrapInner(a.call(this, b));
            } : function() {
                var b = fb(this), c = b.contents();
                c.length ? c.wrapAll(a) : b.append(a);
            });
        },
        wrap: function(a) {
            var b = fb.isFunction(a);
            return this.each(function(c) {
                fb(this).wrapAll(b ? a.call(this, c) : a);
            });
        },
        unwrap: function() {
            return this.parent().each(function() {
                fb.nodeName(this, "body") || fb(this).replaceWith(this.childNodes);
            }).end();
        }
    }), fb.expr.filters.hidden = function(a) {
        return a.offsetWidth <= 0 && a.offsetHeight <= 0 || !db.reliableHiddenOffsets() && "none" === (a.style && a.style.display || fb.css(a, "display"));
    }, fb.expr.filters.visible = function(a) {
        return !fb.expr.filters.hidden(a);
    };
    var Vc = /%20/g, Wc = /\[\]$/, Xc = /\r?\n/g, Yc = /^(?:submit|button|image|reset|file)$/i, Zc = /^(?:input|select|textarea|keygen)/i;
    fb.param = function(a, b) {
        var c, d = [], e = function(a, b) {
            b = fb.isFunction(b) ? b() : null == b ? "" : b, d[d.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b);
        };
        if (void 0 === b && (b = fb.ajaxSettings && fb.ajaxSettings.traditional), fb.isArray(a) || a.jquery && !fb.isPlainObject(a)) fb.each(a, function() {
            e(this.name, this.value);
        }); else for (c in a) S(c, a[c], b, e);
        return d.join("&").replace(Vc, "+");
    }, fb.fn.extend({
        serialize: function() {
            return fb.param(this.serializeArray());
        },
        serializeArray: function() {
            return this.map(function() {
                var a = fb.prop(this, "elements");
                return a ? fb.makeArray(a) : this;
            }).filter(function() {
                var a = this.type;
                return this.name && !fb(this).is(":disabled") && Zc.test(this.nodeName) && !Yc.test(a) && (this.checked || !Fb.test(a));
            }).map(function(a, b) {
                var c = fb(this).val();
                return null == c ? null : fb.isArray(c) ? fb.map(c, function(a) {
                    return {
                        name: b.name,
                        value: a.replace(Xc, "\r\n")
                    };
                }) : {
                    name: b.name,
                    value: c.replace(Xc, "\r\n")
                };
            }).get();
        }
    }), fb.ajaxSettings.xhr = void 0 !== a.ActiveXObject ? function() {
        return !this.isLocal && /^(get|post|head|put|delete|options)$/i.test(this.type) && T() || U();
    } : T;
    var $c = 0, _c = {}, ad = fb.ajaxSettings.xhr();
    a.ActiveXObject && fb(a).on("unload", function() {
        for (var a in _c) _c[a](void 0, !0);
    }), db.cors = !!ad && "withCredentials" in ad, ad = db.ajax = !!ad, ad && fb.ajaxTransport(function(a) {
        if (!a.crossDomain || db.cors) {
            var b;
            return {
                send: function(c, d) {
                    var e, f = a.xhr(), g = ++$c;
                    if (f.open(a.type, a.url, a.async, a.username, a.password), a.xhrFields) for (e in a.xhrFields) f[e] = a.xhrFields[e];
                    a.mimeType && f.overrideMimeType && f.overrideMimeType(a.mimeType), a.crossDomain || c["X-Requested-With"] || (c["X-Requested-With"] = "XMLHttpRequest");
                    for (e in c) void 0 !== c[e] && f.setRequestHeader(e, c[e] + "");
                    f.send(a.hasContent && a.data || null), b = function(c, e) {
                        var h, i, j;
                        if (b && (e || 4 === f.readyState)) if (delete _c[g], b = void 0, f.onreadystatechange = fb.noop, 
                        e) 4 !== f.readyState && f.abort(); else {
                            j = {}, h = f.status, "string" == typeof f.responseText && (j.text = f.responseText);
                            try {
                                i = f.statusText;
                            } catch (k) {
                                i = "";
                            }
                            h || !a.isLocal || a.crossDomain ? 1223 === h && (h = 204) : h = j.text ? 200 : 404;
                        }
                        j && d(h, i, j, f.getAllResponseHeaders());
                    }, a.async ? 4 === f.readyState ? setTimeout(b) : f.onreadystatechange = _c[g] = b : b();
                },
                abort: function() {
                    b && b(void 0, !0);
                }
            };
        }
    }), fb.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /(?:java|ecma)script/
        },
        converters: {
            "text script": function(a) {
                return fb.globalEval(a), a;
            }
        }
    }), fb.ajaxPrefilter("script", function(a) {
        void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET", a.global = !1);
    }), fb.ajaxTransport("script", function(a) {
        if (a.crossDomain) {
            var b, c = pb.head || fb("head")[0] || pb.documentElement;
            return {
                send: function(d, e) {
                    b = pb.createElement("script"), b.async = !0, a.scriptCharset && (b.charset = a.scriptCharset), 
                    b.src = a.url, b.onload = b.onreadystatechange = function(a, c) {
                        (c || !b.readyState || /loaded|complete/.test(b.readyState)) && (b.onload = b.onreadystatechange = null, 
                        b.parentNode && b.parentNode.removeChild(b), b = null, c || e(200, "success"));
                    }, c.insertBefore(b, c.firstChild);
                },
                abort: function() {
                    b && b.onload(void 0, !0);
                }
            };
        }
    });
    var bd = [], cd = /(=)\?(?=&|$)|\?\?/;
    fb.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var a = bd.pop() || fb.expando + "_" + Fc++;
            return this[a] = !0, a;
        }
    }), fb.ajaxPrefilter("json jsonp", function(b, c, d) {
        var e, f, g, h = b.jsonp !== !1 && (cd.test(b.url) ? "url" : "string" == typeof b.data && !(b.contentType || "").indexOf("application/x-www-form-urlencoded") && cd.test(b.data) && "data");
        return h || "jsonp" === b.dataTypes[0] ? (e = b.jsonpCallback = fb.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, 
        h ? b[h] = b[h].replace(cd, "$1" + e) : b.jsonp !== !1 && (b.url += (Gc.test(b.url) ? "&" : "?") + b.jsonp + "=" + e), 
        b.converters["script json"] = function() {
            return g || fb.error(e + " was not called"), g[0];
        }, b.dataTypes[0] = "json", f = a[e], a[e] = function() {
            g = arguments;
        }, d.always(function() {
            a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, bd.push(e)), g && fb.isFunction(f) && f(g[0]), 
            g = f = void 0;
        }), "script") : void 0;
    }), fb.parseHTML = function(a, b, c) {
        if (!a || "string" != typeof a) return null;
        "boolean" == typeof b && (c = b, b = !1), b = b || pb;
        var d = mb.exec(a), e = !c && [];
        return d ? [ b.createElement(d[1]) ] : (d = fb.buildFragment([ a ], b, e), e && e.length && fb(e).remove(), 
        fb.merge([], d.childNodes));
    };
    var dd = fb.fn.load;
    fb.fn.load = function(a, b, c) {
        if ("string" != typeof a && dd) return dd.apply(this, arguments);
        var d, e, f, g = this, h = a.indexOf(" ");
        return h >= 0 && (d = a.slice(h, a.length), a = a.slice(0, h)), fb.isFunction(b) ? (c = b, 
        b = void 0) : b && "object" == typeof b && (f = "POST"), g.length > 0 && fb.ajax({
            url: a,
            type: f,
            dataType: "html",
            data: b
        }).done(function(a) {
            e = arguments, g.html(d ? fb("<div>").append(fb.parseHTML(a)).find(d) : a);
        }).complete(c && function(a, b) {
            g.each(c, e || [ a.responseText, b, a ]);
        }), this;
    }, fb.expr.filters.animated = function(a) {
        return fb.grep(fb.timers, function(b) {
            return a === b.elem;
        }).length;
    };
    var ed = a.document.documentElement;
    fb.offset = {
        setOffset: function(a, b, c) {
            var d, e, f, g, h, i, j, k = fb.css(a, "position"), l = fb(a), m = {};
            "static" === k && (a.style.position = "relative"), h = l.offset(), f = fb.css(a, "top"), 
            i = fb.css(a, "left"), j = ("absolute" === k || "fixed" === k) && fb.inArray("auto", [ f, i ]) > -1, 
            j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), 
            fb.isFunction(b) && (b = b.call(a, c, h)), null != b.top && (m.top = b.top - h.top + g), 
            null != b.left && (m.left = b.left - h.left + e), "using" in b ? b.using.call(a, m) : l.css(m);
        }
    }, fb.fn.extend({
        offset: function(a) {
            if (arguments.length) return void 0 === a ? this : this.each(function(b) {
                fb.offset.setOffset(this, a, b);
            });
            var b, c, d = {
                top: 0,
                left: 0
            }, e = this[0], f = e && e.ownerDocument;
            return f ? (b = f.documentElement, fb.contains(b, e) ? (typeof e.getBoundingClientRect !== yb && (d = e.getBoundingClientRect()), 
            c = V(f), {
                top: d.top + (c.pageYOffset || b.scrollTop) - (b.clientTop || 0),
                left: d.left + (c.pageXOffset || b.scrollLeft) - (b.clientLeft || 0)
            }) : d) : void 0;
        },
        position: function() {
            if (this[0]) {
                var a, b, c = {
                    top: 0,
                    left: 0
                }, d = this[0];
                return "fixed" === fb.css(d, "position") ? b = d.getBoundingClientRect() : (a = this.offsetParent(), 
                b = this.offset(), fb.nodeName(a[0], "html") || (c = a.offset()), c.top += fb.css(a[0], "borderTopWidth", !0), 
                c.left += fb.css(a[0], "borderLeftWidth", !0)), {
                    top: b.top - c.top - fb.css(d, "marginTop", !0),
                    left: b.left - c.left - fb.css(d, "marginLeft", !0)
                };
            }
        },
        offsetParent: function() {
            return this.map(function() {
                for (var a = this.offsetParent || ed; a && !fb.nodeName(a, "html") && "static" === fb.css(a, "position"); ) a = a.offsetParent;
                return a || ed;
            });
        }
    }), fb.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(a, b) {
        var c = /Y/.test(b);
        fb.fn[a] = function(d) {
            return Eb(this, function(a, d, e) {
                var f = V(a);
                return void 0 === e ? f ? b in f ? f[b] : f.document.documentElement[d] : a[d] : void (f ? f.scrollTo(c ? fb(f).scrollLeft() : e, c ? e : fb(f).scrollTop()) : a[d] = e);
            }, a, d, arguments.length, null);
        };
    }), fb.each([ "top", "left" ], function(a, b) {
        fb.cssHooks[b] = A(db.pixelPosition, function(a, c) {
            return c ? (c = cc(a, b), ec.test(c) ? fb(a).position()[b] + "px" : c) : void 0;
        });
    }), fb.each({
        Height: "height",
        Width: "width"
    }, function(a, b) {
        fb.each({
            padding: "inner" + a,
            content: b,
            "": "outer" + a
        }, function(c, d) {
            fb.fn[d] = function(d, e) {
                var f = arguments.length && (c || "boolean" != typeof d), g = c || (d === !0 || e === !0 ? "margin" : "border");
                return Eb(this, function(b, c, d) {
                    var e;
                    return fb.isWindow(b) ? b.document.documentElement["client" + a] : 9 === b.nodeType ? (e = b.documentElement, 
                    Math.max(b.body["scroll" + a], e["scroll" + a], b.body["offset" + a], e["offset" + a], e["client" + a])) : void 0 === d ? fb.css(b, c, g) : fb.style(b, c, d, g);
                }, b, f ? d : void 0, f, null);
            };
        });
    }), fb.fn.size = function() {
        return this.length;
    }, fb.fn.andSelf = fb.fn.addBack, "function" == typeof define && define.amd && define("jquery", [], function() {
        return fb;
    });
    var fd = a.jQuery, gd = a.$;
    return fb.noConflict = function(b) {
        return a.$ === fb && (a.$ = gd), b && a.jQuery === fb && (a.jQuery = fd), fb;
    }, typeof b === yb && (a.jQuery = a.$ = fb), fb;
});

var THREE = {
    REVISION: "71"
};

"object" == typeof module && (module.exports = THREE), void 0 === Math.sign && (Math.sign = function(a) {
    return 0 > a ? -1 : a > 0 ? 1 : +a;
}), THREE.log = function() {
    console.log.apply(console, arguments);
}, THREE.warn = function() {
    console.warn.apply(console, arguments);
}, THREE.error = function() {
    console.error.apply(console, arguments);
}, THREE.MOUSE = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
}, THREE.CullFaceNone = 0, THREE.CullFaceBack = 1, THREE.CullFaceFront = 2, THREE.CullFaceFrontBack = 3, 
THREE.FrontFaceDirectionCW = 0, THREE.FrontFaceDirectionCCW = 1, THREE.BasicShadowMap = 0, 
THREE.PCFShadowMap = 1, THREE.PCFSoftShadowMap = 2, THREE.FrontSide = 0, THREE.BackSide = 1, 
THREE.DoubleSide = 2, THREE.NoShading = 0, THREE.FlatShading = 1, THREE.SmoothShading = 2, 
THREE.NoColors = 0, THREE.FaceColors = 1, THREE.VertexColors = 2, THREE.NoBlending = 0, 
THREE.NormalBlending = 1, THREE.AdditiveBlending = 2, THREE.SubtractiveBlending = 3, 
THREE.MultiplyBlending = 4, THREE.CustomBlending = 5, THREE.AddEquation = 100, THREE.SubtractEquation = 101, 
THREE.ReverseSubtractEquation = 102, THREE.MinEquation = 103, THREE.MaxEquation = 104, 
THREE.ZeroFactor = 200, THREE.OneFactor = 201, THREE.SrcColorFactor = 202, THREE.OneMinusSrcColorFactor = 203, 
THREE.SrcAlphaFactor = 204, THREE.OneMinusSrcAlphaFactor = 205, THREE.DstAlphaFactor = 206, 
THREE.OneMinusDstAlphaFactor = 207, THREE.DstColorFactor = 208, THREE.OneMinusDstColorFactor = 209, 
THREE.SrcAlphaSaturateFactor = 210, THREE.MultiplyOperation = 0, THREE.MixOperation = 1, 
THREE.AddOperation = 2, THREE.UVMapping = 300, THREE.CubeReflectionMapping = 301, 
THREE.CubeRefractionMapping = 302, THREE.EquirectangularReflectionMapping = 303, 
THREE.EquirectangularRefractionMapping = 304, THREE.SphericalReflectionMapping = 305, 
THREE.RepeatWrapping = 1e3, THREE.ClampToEdgeWrapping = 1001, THREE.MirroredRepeatWrapping = 1002, 
THREE.NearestFilter = 1003, THREE.NearestMipMapNearestFilter = 1004, THREE.NearestMipMapLinearFilter = 1005, 
THREE.LinearFilter = 1006, THREE.LinearMipMapNearestFilter = 1007, THREE.LinearMipMapLinearFilter = 1008, 
THREE.UnsignedByteType = 1009, THREE.ByteType = 1010, THREE.ShortType = 1011, THREE.UnsignedShortType = 1012, 
THREE.IntType = 1013, THREE.UnsignedIntType = 1014, THREE.FloatType = 1015, THREE.HalfFloatType = 1025, 
THREE.UnsignedShort4444Type = 1016, THREE.UnsignedShort5551Type = 1017, THREE.UnsignedShort565Type = 1018, 
THREE.AlphaFormat = 1019, THREE.RGBFormat = 1020, THREE.RGBAFormat = 1021, THREE.LuminanceFormat = 1022, 
THREE.LuminanceAlphaFormat = 1023, THREE.RGBEFormat = THREE.RGBAFormat, THREE.RGB_S3TC_DXT1_Format = 2001, 
THREE.RGBA_S3TC_DXT1_Format = 2002, THREE.RGBA_S3TC_DXT3_Format = 2003, THREE.RGBA_S3TC_DXT5_Format = 2004, 
THREE.RGB_PVRTC_4BPPV1_Format = 2100, THREE.RGB_PVRTC_2BPPV1_Format = 2101, THREE.RGBA_PVRTC_4BPPV1_Format = 2102, 
THREE.RGBA_PVRTC_2BPPV1_Format = 2103, THREE.Projector = function() {
    THREE.error("THREE.Projector has been moved to /examples/js/renderers/Projector.js."), 
    this.projectVector = function(a, b) {
        THREE.warn("THREE.Projector: .projectVector() is now vector.project()."), a.project(b);
    }, this.unprojectVector = function(a, b) {
        THREE.warn("THREE.Projector: .unprojectVector() is now vector.unproject()."), a.unproject(b);
    }, this.pickingRay = function() {
        THREE.error("THREE.Projector: .pickingRay() is now raycaster.setFromCamera().");
    };
}, THREE.CanvasRenderer = function() {
    THREE.error("THREE.CanvasRenderer has been moved to /examples/js/renderers/CanvasRenderer.js"), 
    this.domElement = document.createElement("canvas"), this.clear = function() {}, 
    this.render = function() {}, this.setClearColor = function() {}, this.setSize = function() {};
}, THREE.Color = function(a) {
    return 3 === arguments.length ? this.setRGB(arguments[0], arguments[1], arguments[2]) : this.set(a);
}, THREE.Color.prototype = {
    constructor: THREE.Color,
    r: 1,
    g: 1,
    b: 1,
    set: function(a) {
        return a instanceof THREE.Color ? this.copy(a) : "number" == typeof a ? this.setHex(a) : "string" == typeof a && this.setStyle(a), 
        this;
    },
    setHex: function(a) {
        return a = Math.floor(a), this.r = (a >> 16 & 255) / 255, this.g = (a >> 8 & 255) / 255, 
        this.b = (255 & a) / 255, this;
    },
    setRGB: function(a, b, c) {
        return this.r = a, this.g = b, this.b = c, this;
    },
    setHSL: function(a, b, c) {
        if (0 === b) this.r = this.g = this.b = c; else {
            var d = function(a, b, c) {
                return 0 > c && (c += 1), c > 1 && (c -= 1), 1 / 6 > c ? a + 6 * (b - a) * c : .5 > c ? b : 2 / 3 > c ? a + 6 * (b - a) * (2 / 3 - c) : a;
            };
            b = .5 >= c ? c * (1 + b) : c + b - c * b, c = 2 * c - b, this.r = d(c, b, a + 1 / 3), 
            this.g = d(c, b, a), this.b = d(c, b, a - 1 / 3);
        }
        return this;
    },
    setStyle: function(a) {
        return /^rgb\((\d+), ?(\d+), ?(\d+)\)$/i.test(a) ? (a = /^rgb\((\d+), ?(\d+), ?(\d+)\)$/i.exec(a), 
        this.r = Math.min(255, parseInt(a[1], 10)) / 255, this.g = Math.min(255, parseInt(a[2], 10)) / 255, 
        this.b = Math.min(255, parseInt(a[3], 10)) / 255, this) : /^rgb\((\d+)\%, ?(\d+)\%, ?(\d+)\%\)$/i.test(a) ? (a = /^rgb\((\d+)\%, ?(\d+)\%, ?(\d+)\%\)$/i.exec(a), 
        this.r = Math.min(100, parseInt(a[1], 10)) / 100, this.g = Math.min(100, parseInt(a[2], 10)) / 100, 
        this.b = Math.min(100, parseInt(a[3], 10)) / 100, this) : /^\#([0-9a-f]{6})$/i.test(a) ? (a = /^\#([0-9a-f]{6})$/i.exec(a), 
        this.setHex(parseInt(a[1], 16)), this) : /^\#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(a) ? (a = /^\#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(a), 
        this.setHex(parseInt(a[1] + a[1] + a[2] + a[2] + a[3] + a[3], 16)), this) : /^(\w+)$/i.test(a) ? (this.setHex(THREE.ColorKeywords[a]), 
        this) : void 0;
    },
    copy: function(a) {
        return this.r = a.r, this.g = a.g, this.b = a.b, this;
    },
    copyGammaToLinear: function(a, b) {
        return void 0 === b && (b = 2), this.r = Math.pow(a.r, b), this.g = Math.pow(a.g, b), 
        this.b = Math.pow(a.b, b), this;
    },
    copyLinearToGamma: function(a, b) {
        void 0 === b && (b = 2);
        var c = b > 0 ? 1 / b : 1;
        return this.r = Math.pow(a.r, c), this.g = Math.pow(a.g, c), this.b = Math.pow(a.b, c), 
        this;
    },
    convertGammaToLinear: function() {
        var a = this.r, b = this.g, c = this.b;
        return this.r = a * a, this.g = b * b, this.b = c * c, this;
    },
    convertLinearToGamma: function() {
        return this.r = Math.sqrt(this.r), this.g = Math.sqrt(this.g), this.b = Math.sqrt(this.b), 
        this;
    },
    getHex: function() {
        return 255 * this.r << 16 ^ 255 * this.g << 8 ^ 255 * this.b << 0;
    },
    getHexString: function() {
        return ("000000" + this.getHex().toString(16)).slice(-6);
    },
    getHSL: function(a) {
        a = a || {
            h: 0,
            s: 0,
            l: 0
        };
        var b, c = this.r, d = this.g, e = this.b, f = Math.max(c, d, e), g = Math.min(c, d, e), h = (g + f) / 2;
        if (g === f) g = b = 0; else {
            var i = f - g, g = .5 >= h ? i / (f + g) : i / (2 - f - g);
            switch (f) {
              case c:
                b = (d - e) / i + (e > d ? 6 : 0);
                break;

              case d:
                b = (e - c) / i + 2;
                break;

              case e:
                b = (c - d) / i + 4;
            }
            b /= 6;
        }
        return a.h = b, a.s = g, a.l = h, a;
    },
    getStyle: function() {
        return "rgb(" + (255 * this.r | 0) + "," + (255 * this.g | 0) + "," + (255 * this.b | 0) + ")";
    },
    offsetHSL: function(a, b, c) {
        var d = this.getHSL();
        return d.h += a, d.s += b, d.l += c, this.setHSL(d.h, d.s, d.l), this;
    },
    add: function(a) {
        return this.r += a.r, this.g += a.g, this.b += a.b, this;
    },
    addColors: function(a, b) {
        return this.r = a.r + b.r, this.g = a.g + b.g, this.b = a.b + b.b, this;
    },
    addScalar: function(a) {
        return this.r += a, this.g += a, this.b += a, this;
    },
    multiply: function(a) {
        return this.r *= a.r, this.g *= a.g, this.b *= a.b, this;
    },
    multiplyScalar: function(a) {
        return this.r *= a, this.g *= a, this.b *= a, this;
    },
    lerp: function(a, b) {
        return this.r += (a.r - this.r) * b, this.g += (a.g - this.g) * b, this.b += (a.b - this.b) * b, 
        this;
    },
    equals: function(a) {
        return a.r === this.r && a.g === this.g && a.b === this.b;
    },
    fromArray: function(a) {
        return this.r = a[0], this.g = a[1], this.b = a[2], this;
    },
    toArray: function(a, b) {
        return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this.r, a[b + 1] = this.g, 
        a[b + 2] = this.b, a;
    },
    clone: function() {
        return new THREE.Color().setRGB(this.r, this.g, this.b);
    }
}, THREE.ColorKeywords = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
}, THREE.Quaternion = function(a, b, c, d) {
    this._x = a || 0, this._y = b || 0, this._z = c || 0, this._w = void 0 !== d ? d : 1;
}, THREE.Quaternion.prototype = {
    constructor: THREE.Quaternion,
    _x: 0,
    _y: 0,
    _z: 0,
    _w: 0,
    get x() {
        return this._x;
    },
    set x(a) {
        this._x = a, this.onChangeCallback();
    },
    get y() {
        return this._y;
    },
    set y(a) {
        this._y = a, this.onChangeCallback();
    },
    get z() {
        return this._z;
    },
    set z(a) {
        this._z = a, this.onChangeCallback();
    },
    get w() {
        return this._w;
    },
    set w(a) {
        this._w = a, this.onChangeCallback();
    },
    set: function(a, b, c, d) {
        return this._x = a, this._y = b, this._z = c, this._w = d, this.onChangeCallback(), 
        this;
    },
    copy: function(a) {
        return this._x = a.x, this._y = a.y, this._z = a.z, this._w = a.w, this.onChangeCallback(), 
        this;
    },
    setFromEuler: function(a, b) {
        if (!1 == a instanceof THREE.Euler) throw Error("THREE.Quaternion: .setFromEuler() now expects a Euler rotation rather than a Vector3 and order.");
        var c = Math.cos(a._x / 2), d = Math.cos(a._y / 2), e = Math.cos(a._z / 2), f = Math.sin(a._x / 2), g = Math.sin(a._y / 2), h = Math.sin(a._z / 2);
        return "XYZ" === a.order ? (this._x = f * d * e + c * g * h, this._y = c * g * e - f * d * h, 
        this._z = c * d * h + f * g * e, this._w = c * d * e - f * g * h) : "YXZ" === a.order ? (this._x = f * d * e + c * g * h, 
        this._y = c * g * e - f * d * h, this._z = c * d * h - f * g * e, this._w = c * d * e + f * g * h) : "ZXY" === a.order ? (this._x = f * d * e - c * g * h, 
        this._y = c * g * e + f * d * h, this._z = c * d * h + f * g * e, this._w = c * d * e - f * g * h) : "ZYX" === a.order ? (this._x = f * d * e - c * g * h, 
        this._y = c * g * e + f * d * h, this._z = c * d * h - f * g * e, this._w = c * d * e + f * g * h) : "YZX" === a.order ? (this._x = f * d * e + c * g * h, 
        this._y = c * g * e + f * d * h, this._z = c * d * h - f * g * e, this._w = c * d * e - f * g * h) : "XZY" === a.order && (this._x = f * d * e - c * g * h, 
        this._y = c * g * e - f * d * h, this._z = c * d * h + f * g * e, this._w = c * d * e + f * g * h), 
        !1 !== b && this.onChangeCallback(), this;
    },
    setFromAxisAngle: function(a, b) {
        var c = b / 2, d = Math.sin(c);
        return this._x = a.x * d, this._y = a.y * d, this._z = a.z * d, this._w = Math.cos(c), 
        this.onChangeCallback(), this;
    },
    setFromRotationMatrix: function(a) {
        var b = a.elements, c = b[0];
        a = b[4];
        var d = b[8], e = b[1], f = b[5], g = b[9], h = b[2], i = b[6], b = b[10], j = c + f + b;
        return j > 0 ? (c = .5 / Math.sqrt(j + 1), this._w = .25 / c, this._x = (i - g) * c, 
        this._y = (d - h) * c, this._z = (e - a) * c) : c > f && c > b ? (c = 2 * Math.sqrt(1 + c - f - b), 
        this._w = (i - g) / c, this._x = .25 * c, this._y = (a + e) / c, this._z = (d + h) / c) : f > b ? (c = 2 * Math.sqrt(1 + f - c - b), 
        this._w = (d - h) / c, this._x = (a + e) / c, this._y = .25 * c, this._z = (g + i) / c) : (c = 2 * Math.sqrt(1 + b - c - f), 
        this._w = (e - a) / c, this._x = (d + h) / c, this._y = (g + i) / c, this._z = .25 * c), 
        this.onChangeCallback(), this;
    },
    setFromUnitVectors: function() {
        var a, b;
        return function(c, d) {
            return void 0 === a && (a = new THREE.Vector3()), b = c.dot(d) + 1, 1e-6 > b ? (b = 0, 
            Math.abs(c.x) > Math.abs(c.z) ? a.set(-c.y, c.x, 0) : a.set(0, -c.z, c.y)) : a.crossVectors(c, d), 
            this._x = a.x, this._y = a.y, this._z = a.z, this._w = b, this.normalize(), this;
        };
    }(),
    inverse: function() {
        return this.conjugate().normalize(), this;
    },
    conjugate: function() {
        return this._x *= -1, this._y *= -1, this._z *= -1, this.onChangeCallback(), this;
    },
    dot: function(a) {
        return this._x * a._x + this._y * a._y + this._z * a._z + this._w * a._w;
    },
    lengthSq: function() {
        return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    },
    length: function() {
        return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
    },
    normalize: function() {
        var a = this.length();
        return 0 === a ? (this._z = this._y = this._x = 0, this._w = 1) : (a = 1 / a, this._x *= a, 
        this._y *= a, this._z *= a, this._w *= a), this.onChangeCallback(), this;
    },
    multiply: function(a, b) {
        return void 0 !== b ? (THREE.warn("THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead."), 
        this.multiplyQuaternions(a, b)) : this.multiplyQuaternions(this, a);
    },
    multiplyQuaternions: function(a, b) {
        var c = a._x, d = a._y, e = a._z, f = a._w, g = b._x, h = b._y, i = b._z, j = b._w;
        return this._x = c * j + f * g + d * i - e * h, this._y = d * j + f * h + e * g - c * i, 
        this._z = e * j + f * i + c * h - d * g, this._w = f * j - c * g - d * h - e * i, 
        this.onChangeCallback(), this;
    },
    multiplyVector3: function(a) {
        return THREE.warn("THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead."), 
        a.applyQuaternion(this);
    },
    slerp: function(a, b) {
        if (0 === b) return this;
        if (1 === b) return this.copy(a);
        var c = this._x, d = this._y, e = this._z, f = this._w, g = f * a._w + c * a._x + d * a._y + e * a._z;
        if (0 > g ? (this._w = -a._w, this._x = -a._x, this._y = -a._y, this._z = -a._z, 
        g = -g) : this.copy(a), g >= 1) return this._w = f, this._x = c, this._y = d, this._z = e, 
        this;
        var h = Math.acos(g), i = Math.sqrt(1 - g * g);
        return .001 > Math.abs(i) ? (this._w = .5 * (f + this._w), this._x = .5 * (c + this._x), 
        this._y = .5 * (d + this._y), this._z = .5 * (e + this._z), this) : (g = Math.sin((1 - b) * h) / i, 
        h = Math.sin(b * h) / i, this._w = f * g + this._w * h, this._x = c * g + this._x * h, 
        this._y = d * g + this._y * h, this._z = e * g + this._z * h, this.onChangeCallback(), 
        this);
    },
    equals: function(a) {
        return a._x === this._x && a._y === this._y && a._z === this._z && a._w === this._w;
    },
    fromArray: function(a, b) {
        return void 0 === b && (b = 0), this._x = a[b], this._y = a[b + 1], this._z = a[b + 2], 
        this._w = a[b + 3], this.onChangeCallback(), this;
    },
    toArray: function(a, b) {
        return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this._x, a[b + 1] = this._y, 
        a[b + 2] = this._z, a[b + 3] = this._w, a;
    },
    onChange: function(a) {
        return this.onChangeCallback = a, this;
    },
    onChangeCallback: function() {},
    clone: function() {
        return new THREE.Quaternion(this._x, this._y, this._z, this._w);
    }
}, THREE.Quaternion.slerp = function(a, b, c, d) {
    return c.copy(a).slerp(b, d);
}, THREE.Vector2 = function(a, b) {
    this.x = a || 0, this.y = b || 0;
}, THREE.Vector2.prototype = {
    constructor: THREE.Vector2,
    set: function(a, b) {
        return this.x = a, this.y = b, this;
    },
    setX: function(a) {
        return this.x = a, this;
    },
    setY: function(a) {
        return this.y = a, this;
    },
    setComponent: function(a, b) {
        switch (a) {
          case 0:
            this.x = b;
            break;

          case 1:
            this.y = b;
            break;

          default:
            throw Error("index is out of range: " + a);
        }
    },
    getComponent: function(a) {
        switch (a) {
          case 0:
            return this.x;

          case 1:
            return this.y;

          default:
            throw Error("index is out of range: " + a);
        }
    },
    copy: function(a) {
        return this.x = a.x, this.y = a.y, this;
    },
    add: function(a, b) {
        return void 0 !== b ? (THREE.warn("THREE.Vector2: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), 
        this.addVectors(a, b)) : (this.x += a.x, this.y += a.y, this);
    },
    addScalar: function(a) {
        return this.x += a, this.y += a, this;
    },
    addVectors: function(a, b) {
        return this.x = a.x + b.x, this.y = a.y + b.y, this;
    },
    sub: function(a, b) {
        return void 0 !== b ? (THREE.warn("THREE.Vector2: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), 
        this.subVectors(a, b)) : (this.x -= a.x, this.y -= a.y, this);
    },
    subScalar: function(a) {
        return this.x -= a, this.y -= a, this;
    },
    subVectors: function(a, b) {
        return this.x = a.x - b.x, this.y = a.y - b.y, this;
    },
    multiply: function(a) {
        return this.x *= a.x, this.y *= a.y, this;
    },
    multiplyScalar: function(a) {
        return this.x *= a, this.y *= a, this;
    },
    divide: function(a) {
        return this.x /= a.x, this.y /= a.y, this;
    },
    divideScalar: function(a) {
        return 0 !== a ? (a = 1 / a, this.x *= a, this.y *= a) : this.y = this.x = 0, this;
    },
    min: function(a) {
        return this.x > a.x && (this.x = a.x), this.y > a.y && (this.y = a.y), this;
    },
    max: function(a) {
        return this.x < a.x && (this.x = a.x), this.y < a.y && (this.y = a.y), this;
    },
    clamp: function(a, b) {
        return this.x < a.x ? this.x = a.x : this.x > b.x && (this.x = b.x), this.y < a.y ? this.y = a.y : this.y > b.y && (this.y = b.y), 
        this;
    },
    clampScalar: function() {
        var a, b;
        return function(c, d) {
            return void 0 === a && (a = new THREE.Vector2(), b = new THREE.Vector2()), a.set(c, c), 
            b.set(d, d), this.clamp(a, b);
        };
    }(),
    floor: function() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
    },
    ceil: function() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
    },
    round: function() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
    },
    roundToZero: function() {
        return this.x = 0 > this.x ? Math.ceil(this.x) : Math.floor(this.x), this.y = 0 > this.y ? Math.ceil(this.y) : Math.floor(this.y), 
        this;
    },
    negate: function() {
        return this.x = -this.x, this.y = -this.y, this;
    },
    dot: function(a) {
        return this.x * a.x + this.y * a.y;
    },
    lengthSq: function() {
        return this.x * this.x + this.y * this.y;
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    normalize: function() {
        return this.divideScalar(this.length());
    },
    distanceTo: function(a) {
        return Math.sqrt(this.distanceToSquared(a));
    },
    distanceToSquared: function(a) {
        var b = this.x - a.x;
        return a = this.y - a.y, b * b + a * a;
    },
    setLength: function(a) {
        var b = this.length();
        return 0 !== b && a !== b && this.multiplyScalar(a / b), this;
    },
    lerp: function(a, b) {
        return this.x += (a.x - this.x) * b, this.y += (a.y - this.y) * b, this;
    },
    lerpVectors: function(a, b, c) {
        return this.subVectors(b, a).multiplyScalar(c).add(a), this;
    },
    equals: function(a) {
        return a.x === this.x && a.y === this.y;
    },
    fromArray: function(a, b) {
        return void 0 === b && (b = 0), this.x = a[b], this.y = a[b + 1], this;
    },
    toArray: function(a, b) {
        return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this.x, a[b + 1] = this.y, 
        a;
    },
    fromAttribute: function(a, b, c) {
        return void 0 === c && (c = 0), b = b * a.itemSize + c, this.x = a.array[b], this.y = a.array[b + 1], 
        this;
    },
    clone: function() {
        return new THREE.Vector2(this.x, this.y);
    }
}, THREE.Vector3 = function(a, b, c) {
    this.x = a || 0, this.y = b || 0, this.z = c || 0;
}, THREE.Vector3.prototype = {
    constructor: THREE.Vector3,
    set: function(a, b, c) {
        return this.x = a, this.y = b, this.z = c, this;
    },
    setX: function(a) {
        return this.x = a, this;
    },
    setY: function(a) {
        return this.y = a, this;
    },
    setZ: function(a) {
        return this.z = a, this;
    },
    setComponent: function(a, b) {
        switch (a) {
          case 0:
            this.x = b;
            break;

          case 1:
            this.y = b;
            break;

          case 2:
            this.z = b;
            break;

          default:
            throw Error("index is out of range: " + a);
        }
    },
    getComponent: function(a) {
        switch (a) {
          case 0:
            return this.x;

          case 1:
            return this.y;

          case 2:
            return this.z;

          default:
            throw Error("index is out of range: " + a);
        }
    },
    copy: function(a) {
        return this.x = a.x, this.y = a.y, this.z = a.z, this;
    },
    add: function(a, b) {
        return void 0 !== b ? (THREE.warn("THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), 
        this.addVectors(a, b)) : (this.x += a.x, this.y += a.y, this.z += a.z, this);
    },
    addScalar: function(a) {
        return this.x += a, this.y += a, this.z += a, this;
    },
    addVectors: function(a, b) {
        return this.x = a.x + b.x, this.y = a.y + b.y, this.z = a.z + b.z, this;
    },
    sub: function(a, b) {
        return void 0 !== b ? (THREE.warn("THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), 
        this.subVectors(a, b)) : (this.x -= a.x, this.y -= a.y, this.z -= a.z, this);
    },
    subScalar: function(a) {
        return this.x -= a, this.y -= a, this.z -= a, this;
    },
    subVectors: function(a, b) {
        return this.x = a.x - b.x, this.y = a.y - b.y, this.z = a.z - b.z, this;
    },
    multiply: function(a, b) {
        return void 0 !== b ? (THREE.warn("THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead."), 
        this.multiplyVectors(a, b)) : (this.x *= a.x, this.y *= a.y, this.z *= a.z, this);
    },
    multiplyScalar: function(a) {
        return this.x *= a, this.y *= a, this.z *= a, this;
    },
    multiplyVectors: function(a, b) {
        return this.x = a.x * b.x, this.y = a.y * b.y, this.z = a.z * b.z, this;
    },
    applyEuler: function() {
        var a;
        return function(b) {
            return !1 == b instanceof THREE.Euler && THREE.error("THREE.Vector3: .applyEuler() now expects a Euler rotation rather than a Vector3 and order."), 
            void 0 === a && (a = new THREE.Quaternion()), this.applyQuaternion(a.setFromEuler(b)), 
            this;
        };
    }(),
    applyAxisAngle: function() {
        var a;
        return function(b, c) {
            return void 0 === a && (a = new THREE.Quaternion()), this.applyQuaternion(a.setFromAxisAngle(b, c)), 
            this;
        };
    }(),
    applyMatrix3: function(a) {
        var b = this.x, c = this.y, d = this.z;
        return a = a.elements, this.x = a[0] * b + a[3] * c + a[6] * d, this.y = a[1] * b + a[4] * c + a[7] * d, 
        this.z = a[2] * b + a[5] * c + a[8] * d, this;
    },
    applyMatrix4: function(a) {
        var b = this.x, c = this.y, d = this.z;
        return a = a.elements, this.x = a[0] * b + a[4] * c + a[8] * d + a[12], this.y = a[1] * b + a[5] * c + a[9] * d + a[13], 
        this.z = a[2] * b + a[6] * c + a[10] * d + a[14], this;
    },
    applyProjection: function(a) {
        var b = this.x, c = this.y, d = this.z;
        a = a.elements;
        var e = 1 / (a[3] * b + a[7] * c + a[11] * d + a[15]);
        return this.x = (a[0] * b + a[4] * c + a[8] * d + a[12]) * e, this.y = (a[1] * b + a[5] * c + a[9] * d + a[13]) * e, 
        this.z = (a[2] * b + a[6] * c + a[10] * d + a[14]) * e, this;
    },
    applyQuaternion: function(a) {
        var b = this.x, c = this.y, d = this.z, e = a.x, f = a.y, g = a.z;
        a = a.w;
        var h = a * b + f * d - g * c, i = a * c + g * b - e * d, j = a * d + e * c - f * b, b = -e * b - f * c - g * d;
        return this.x = h * a + b * -e + i * -g - j * -f, this.y = i * a + b * -f + j * -e - h * -g, 
        this.z = j * a + b * -g + h * -f - i * -e, this;
    },
    project: function() {
        var a;
        return function(b) {
            return void 0 === a && (a = new THREE.Matrix4()), a.multiplyMatrices(b.projectionMatrix, a.getInverse(b.matrixWorld)), 
            this.applyProjection(a);
        };
    }(),
    unproject: function() {
        var a;
        return function(b) {
            return void 0 === a && (a = new THREE.Matrix4()), a.multiplyMatrices(b.matrixWorld, a.getInverse(b.projectionMatrix)), 
            this.applyProjection(a);
        };
    }(),
    transformDirection: function(a) {
        var b = this.x, c = this.y, d = this.z;
        return a = a.elements, this.x = a[0] * b + a[4] * c + a[8] * d, this.y = a[1] * b + a[5] * c + a[9] * d, 
        this.z = a[2] * b + a[6] * c + a[10] * d, this.normalize(), this;
    },
    divide: function(a) {
        return this.x /= a.x, this.y /= a.y, this.z /= a.z, this;
    },
    divideScalar: function(a) {
        return 0 !== a ? (a = 1 / a, this.x *= a, this.y *= a, this.z *= a) : this.z = this.y = this.x = 0, 
        this;
    },
    min: function(a) {
        return this.x > a.x && (this.x = a.x), this.y > a.y && (this.y = a.y), this.z > a.z && (this.z = a.z), 
        this;
    },
    max: function(a) {
        return this.x < a.x && (this.x = a.x), this.y < a.y && (this.y = a.y), this.z < a.z && (this.z = a.z), 
        this;
    },
    clamp: function(a, b) {
        return this.x < a.x ? this.x = a.x : this.x > b.x && (this.x = b.x), this.y < a.y ? this.y = a.y : this.y > b.y && (this.y = b.y), 
        this.z < a.z ? this.z = a.z : this.z > b.z && (this.z = b.z), this;
    },
    clampScalar: function() {
        var a, b;
        return function(c, d) {
            return void 0 === a && (a = new THREE.Vector3(), b = new THREE.Vector3()), a.set(c, c, c), 
            b.set(d, d, d), this.clamp(a, b);
        };
    }(),
    floor: function() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), 
        this;
    },
    ceil: function() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), 
        this;
    },
    round: function() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), 
        this;
    },
    roundToZero: function() {
        return this.x = 0 > this.x ? Math.ceil(this.x) : Math.floor(this.x), this.y = 0 > this.y ? Math.ceil(this.y) : Math.floor(this.y), 
        this.z = 0 > this.z ? Math.ceil(this.z) : Math.floor(this.z), this;
    },
    negate: function() {
        return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
    },
    dot: function(a) {
        return this.x * a.x + this.y * a.y + this.z * a.z;
    },
    lengthSq: function() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    },
    lengthManhattan: function() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    },
    normalize: function() {
        return this.divideScalar(this.length());
    },
    setLength: function(a) {
        var b = this.length();
        return 0 !== b && a !== b && this.multiplyScalar(a / b), this;
    },
    lerp: function(a, b) {
        return this.x += (a.x - this.x) * b, this.y += (a.y - this.y) * b, this.z += (a.z - this.z) * b, 
        this;
    },
    lerpVectors: function(a, b, c) {
        return this.subVectors(b, a).multiplyScalar(c).add(a), this;
    },
    cross: function(a, b) {
        if (void 0 !== b) return THREE.warn("THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead."), 
        this.crossVectors(a, b);
        var c = this.x, d = this.y, e = this.z;
        return this.x = d * a.z - e * a.y, this.y = e * a.x - c * a.z, this.z = c * a.y - d * a.x, 
        this;
    },
    crossVectors: function(a, b) {
        var c = a.x, d = a.y, e = a.z, f = b.x, g = b.y, h = b.z;
        return this.x = d * h - e * g, this.y = e * f - c * h, this.z = c * g - d * f, this;
    },
    projectOnVector: function() {
        var a, b;
        return function(c) {
            return void 0 === a && (a = new THREE.Vector3()), a.copy(c).normalize(), b = this.dot(a), 
            this.copy(a).multiplyScalar(b);
        };
    }(),
    projectOnPlane: function() {
        var a;
        return function(b) {
            return void 0 === a && (a = new THREE.Vector3()), a.copy(this).projectOnVector(b), 
            this.sub(a);
        };
    }(),
    reflect: function() {
        var a;
        return function(b) {
            return void 0 === a && (a = new THREE.Vector3()), this.sub(a.copy(b).multiplyScalar(2 * this.dot(b)));
        };
    }(),
    angleTo: function(a) {
        return a = this.dot(a) / (this.length() * a.length()), Math.acos(THREE.Math.clamp(a, -1, 1));
    },
    distanceTo: function(a) {
        return Math.sqrt(this.distanceToSquared(a));
    },
    distanceToSquared: function(a) {
        var b = this.x - a.x, c = this.y - a.y;
        return a = this.z - a.z, b * b + c * c + a * a;
    },
    setEulerFromRotationMatrix: function() {
        THREE.error("THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.");
    },
    setEulerFromQuaternion: function() {
        THREE.error("THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.");
    },
    getPositionFromMatrix: function(a) {
        return THREE.warn("THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition()."), 
        this.setFromMatrixPosition(a);
    },
    getScaleFromMatrix: function(a) {
        return THREE.warn("THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale()."), 
        this.setFromMatrixScale(a);
    },
    getColumnFromMatrix: function(a, b) {
        return THREE.warn("THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn()."), 
        this.setFromMatrixColumn(a, b);
    },
    setFromMatrixPosition: function(a) {
        return this.x = a.elements[12], this.y = a.elements[13], this.z = a.elements[14], 
        this;
    },
    setFromMatrixScale: function(a) {
        var b = this.set(a.elements[0], a.elements[1], a.elements[2]).length(), c = this.set(a.elements[4], a.elements[5], a.elements[6]).length();
        return a = this.set(a.elements[8], a.elements[9], a.elements[10]).length(), this.x = b, 
        this.y = c, this.z = a, this;
    },
    setFromMatrixColumn: function(a, b) {
        var c = 4 * a, d = b.elements;
        return this.x = d[c], this.y = d[c + 1], this.z = d[c + 2], this;
    },
    equals: function(a) {
        return a.x === this.x && a.y === this.y && a.z === this.z;
    },
    fromArray: function(a, b) {
        return void 0 === b && (b = 0), this.x = a[b], this.y = a[b + 1], this.z = a[b + 2], 
        this;
    },
    toArray: function(a, b) {
        return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this.x, a[b + 1] = this.y, 
        a[b + 2] = this.z, a;
    },
    fromAttribute: function(a, b, c) {
        return void 0 === c && (c = 0), b = b * a.itemSize + c, this.x = a.array[b], this.y = a.array[b + 1], 
        this.z = a.array[b + 2], this;
    },
    clone: function() {
        return new THREE.Vector3(this.x, this.y, this.z);
    }
}, THREE.Vector4 = function(a, b, c, d) {
    this.x = a || 0, this.y = b || 0, this.z = c || 0, this.w = void 0 !== d ? d : 1;
}, THREE.Vector4.prototype = {
    constructor: THREE.Vector4,
    set: function(a, b, c, d) {
        return this.x = a, this.y = b, this.z = c, this.w = d, this;
    },
    setX: function(a) {
        return this.x = a, this;
    },
    setY: function(a) {
        return this.y = a, this;
    },
    setZ: function(a) {
        return this.z = a, this;
    },
    setW: function(a) {
        return this.w = a, this;
    },
    setComponent: function(a, b) {
        switch (a) {
          case 0:
            this.x = b;
            break;

          case 1:
            this.y = b;
            break;

          case 2:
            this.z = b;
            break;

          case 3:
            this.w = b;
            break;

          default:
            throw Error("index is out of range: " + a);
        }
    },
    getComponent: function(a) {
        switch (a) {
          case 0:
            return this.x;

          case 1:
            return this.y;

          case 2:
            return this.z;

          case 3:
            return this.w;

          default:
            throw Error("index is out of range: " + a);
        }
    },
    copy: function(a) {
        return this.x = a.x, this.y = a.y, this.z = a.z, this.w = void 0 !== a.w ? a.w : 1, 
        this;
    },
    add: function(a, b) {
        return void 0 !== b ? (THREE.warn("THREE.Vector4: .add() now only accepts one argument. Use .addVectors( a, b ) instead."), 
        this.addVectors(a, b)) : (this.x += a.x, this.y += a.y, this.z += a.z, this.w += a.w, 
        this);
    },
    addScalar: function(a) {
        return this.x += a, this.y += a, this.z += a, this.w += a, this;
    },
    addVectors: function(a, b) {
        return this.x = a.x + b.x, this.y = a.y + b.y, this.z = a.z + b.z, this.w = a.w + b.w, 
        this;
    },
    sub: function(a, b) {
        return void 0 !== b ? (THREE.warn("THREE.Vector4: .sub() now only accepts one argument. Use .subVectors( a, b ) instead."), 
        this.subVectors(a, b)) : (this.x -= a.x, this.y -= a.y, this.z -= a.z, this.w -= a.w, 
        this);
    },
    subScalar: function(a) {
        return this.x -= a, this.y -= a, this.z -= a, this.w -= a, this;
    },
    subVectors: function(a, b) {
        return this.x = a.x - b.x, this.y = a.y - b.y, this.z = a.z - b.z, this.w = a.w - b.w, 
        this;
    },
    multiplyScalar: function(a) {
        return this.x *= a, this.y *= a, this.z *= a, this.w *= a, this;
    },
    applyMatrix4: function(a) {
        var b = this.x, c = this.y, d = this.z, e = this.w;
        return a = a.elements, this.x = a[0] * b + a[4] * c + a[8] * d + a[12] * e, this.y = a[1] * b + a[5] * c + a[9] * d + a[13] * e, 
        this.z = a[2] * b + a[6] * c + a[10] * d + a[14] * e, this.w = a[3] * b + a[7] * c + a[11] * d + a[15] * e, 
        this;
    },
    divideScalar: function(a) {
        return 0 !== a ? (a = 1 / a, this.x *= a, this.y *= a, this.z *= a, this.w *= a) : (this.z = this.y = this.x = 0, 
        this.w = 1), this;
    },
    setAxisAngleFromQuaternion: function(a) {
        this.w = 2 * Math.acos(a.w);
        var b = Math.sqrt(1 - a.w * a.w);
        return 1e-4 > b ? (this.x = 1, this.z = this.y = 0) : (this.x = a.x / b, this.y = a.y / b, 
        this.z = a.z / b), this;
    },
    setAxisAngleFromRotationMatrix: function(a) {
        var b, c, d;
        a = a.elements;
        var e = a[0];
        d = a[4];
        var f = a[8], g = a[1], h = a[5], i = a[9];
        c = a[2], b = a[6];
        var j = a[10];
        return .01 > Math.abs(d - g) && .01 > Math.abs(f - c) && .01 > Math.abs(i - b) ? .1 > Math.abs(d + g) && .1 > Math.abs(f + c) && .1 > Math.abs(i + b) && .1 > Math.abs(e + h + j - 3) ? (this.set(1, 0, 0, 0), 
        this) : (a = Math.PI, e = (e + 1) / 2, h = (h + 1) / 2, j = (j + 1) / 2, d = (d + g) / 4, 
        f = (f + c) / 4, i = (i + b) / 4, e > h && e > j ? .01 > e ? (b = 0, d = c = .707106781) : (b = Math.sqrt(e), 
        c = d / b, d = f / b) : h > j ? .01 > h ? (b = .707106781, c = 0, d = .707106781) : (c = Math.sqrt(h), 
        b = d / c, d = i / c) : .01 > j ? (c = b = .707106781, d = 0) : (d = Math.sqrt(j), 
        b = f / d, c = i / d), this.set(b, c, d, a), this) : (a = Math.sqrt((b - i) * (b - i) + (f - c) * (f - c) + (g - d) * (g - d)), 
        .001 > Math.abs(a) && (a = 1), this.x = (b - i) / a, this.y = (f - c) / a, this.z = (g - d) / a, 
        this.w = Math.acos((e + h + j - 1) / 2), this);
    },
    min: function(a) {
        return this.x > a.x && (this.x = a.x), this.y > a.y && (this.y = a.y), this.z > a.z && (this.z = a.z), 
        this.w > a.w && (this.w = a.w), this;
    },
    max: function(a) {
        return this.x < a.x && (this.x = a.x), this.y < a.y && (this.y = a.y), this.z < a.z && (this.z = a.z), 
        this.w < a.w && (this.w = a.w), this;
    },
    clamp: function(a, b) {
        return this.x < a.x ? this.x = a.x : this.x > b.x && (this.x = b.x), this.y < a.y ? this.y = a.y : this.y > b.y && (this.y = b.y), 
        this.z < a.z ? this.z = a.z : this.z > b.z && (this.z = b.z), this.w < a.w ? this.w = a.w : this.w > b.w && (this.w = b.w), 
        this;
    },
    clampScalar: function() {
        var a, b;
        return function(c, d) {
            return void 0 === a && (a = new THREE.Vector4(), b = new THREE.Vector4()), a.set(c, c, c, c), 
            b.set(d, d, d, d), this.clamp(a, b);
        };
    }(),
    floor: function() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), 
        this.w = Math.floor(this.w), this;
    },
    ceil: function() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), 
        this.w = Math.ceil(this.w), this;
    },
    round: function() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), 
        this.w = Math.round(this.w), this;
    },
    roundToZero: function() {
        return this.x = 0 > this.x ? Math.ceil(this.x) : Math.floor(this.x), this.y = 0 > this.y ? Math.ceil(this.y) : Math.floor(this.y), 
        this.z = 0 > this.z ? Math.ceil(this.z) : Math.floor(this.z), this.w = 0 > this.w ? Math.ceil(this.w) : Math.floor(this.w), 
        this;
    },
    negate: function() {
        return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
    },
    dot: function(a) {
        return this.x * a.x + this.y * a.y + this.z * a.z + this.w * a.w;
    },
    lengthSq: function() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    },
    length: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    },
    lengthManhattan: function() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
    },
    normalize: function() {
        return this.divideScalar(this.length());
    },
    setLength: function(a) {
        var b = this.length();
        return 0 !== b && a !== b && this.multiplyScalar(a / b), this;
    },
    lerp: function(a, b) {
        return this.x += (a.x - this.x) * b, this.y += (a.y - this.y) * b, this.z += (a.z - this.z) * b, 
        this.w += (a.w - this.w) * b, this;
    },
    lerpVectors: function(a, b, c) {
        return this.subVectors(b, a).multiplyScalar(c).add(a), this;
    },
    equals: function(a) {
        return a.x === this.x && a.y === this.y && a.z === this.z && a.w === this.w;
    },
    fromArray: function(a, b) {
        return void 0 === b && (b = 0), this.x = a[b], this.y = a[b + 1], this.z = a[b + 2], 
        this.w = a[b + 3], this;
    },
    toArray: function(a, b) {
        return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this.x, a[b + 1] = this.y, 
        a[b + 2] = this.z, a[b + 3] = this.w, a;
    },
    fromAttribute: function(a, b, c) {
        return void 0 === c && (c = 0), b = b * a.itemSize + c, this.x = a.array[b], this.y = a.array[b + 1], 
        this.z = a.array[b + 2], this.w = a.array[b + 3], this;
    },
    clone: function() {
        return new THREE.Vector4(this.x, this.y, this.z, this.w);
    }
}, THREE.Euler = function(a, b, c, d) {
    this._x = a || 0, this._y = b || 0, this._z = c || 0, this._order = d || THREE.Euler.DefaultOrder;
}, THREE.Euler.RotationOrders = "XYZ YZX ZXY XZY YXZ ZYX".split(" "), THREE.Euler.DefaultOrder = "XYZ", 
THREE.Euler.prototype = {
    constructor: THREE.Euler,
    _x: 0,
    _y: 0,
    _z: 0,
    _order: THREE.Euler.DefaultOrder,
    get x() {
        return this._x;
    },
    set x(a) {
        this._x = a, this.onChangeCallback();
    },
    get y() {
        return this._y;
    },
    set y(a) {
        this._y = a, this.onChangeCallback();
    },
    get z() {
        return this._z;
    },
    set z(a) {
        this._z = a, this.onChangeCallback();
    },
    get order() {
        return this._order;
    },
    set order(a) {
        this._order = a, this.onChangeCallback();
    },
    set: function(a, b, c, d) {
        return this._x = a, this._y = b, this._z = c, this._order = d || this._order, this.onChangeCallback(), 
        this;
    },
    copy: function(a) {
        return this._x = a._x, this._y = a._y, this._z = a._z, this._order = a._order, this.onChangeCallback(), 
        this;
    },
    setFromRotationMatrix: function(a, b, c) {
        var d = THREE.Math.clamp, e = a.elements;
        a = e[0];
        var f = e[4], g = e[8], h = e[1], i = e[5], j = e[9], k = e[2], l = e[6], e = e[10];
        return b = b || this._order, "XYZ" === b ? (this._y = Math.asin(d(g, -1, 1)), .99999 > Math.abs(g) ? (this._x = Math.atan2(-j, e), 
        this._z = Math.atan2(-f, a)) : (this._x = Math.atan2(l, i), this._z = 0)) : "YXZ" === b ? (this._x = Math.asin(-d(j, -1, 1)), 
        .99999 > Math.abs(j) ? (this._y = Math.atan2(g, e), this._z = Math.atan2(h, i)) : (this._y = Math.atan2(-k, a), 
        this._z = 0)) : "ZXY" === b ? (this._x = Math.asin(d(l, -1, 1)), .99999 > Math.abs(l) ? (this._y = Math.atan2(-k, e), 
        this._z = Math.atan2(-f, i)) : (this._y = 0, this._z = Math.atan2(h, a))) : "ZYX" === b ? (this._y = Math.asin(-d(k, -1, 1)), 
        .99999 > Math.abs(k) ? (this._x = Math.atan2(l, e), this._z = Math.atan2(h, a)) : (this._x = 0, 
        this._z = Math.atan2(-f, i))) : "YZX" === b ? (this._z = Math.asin(d(h, -1, 1)), 
        .99999 > Math.abs(h) ? (this._x = Math.atan2(-j, i), this._y = Math.atan2(-k, a)) : (this._x = 0, 
        this._y = Math.atan2(g, e))) : "XZY" === b ? (this._z = Math.asin(-d(f, -1, 1)), 
        .99999 > Math.abs(f) ? (this._x = Math.atan2(l, i), this._y = Math.atan2(g, a)) : (this._x = Math.atan2(-j, e), 
        this._y = 0)) : THREE.warn("THREE.Euler: .setFromRotationMatrix() given unsupported order: " + b), 
        this._order = b, !1 !== c && this.onChangeCallback(), this;
    },
    setFromQuaternion: function() {
        var a;
        return function(b, c, d) {
            return void 0 === a && (a = new THREE.Matrix4()), a.makeRotationFromQuaternion(b), 
            this.setFromRotationMatrix(a, c, d), this;
        };
    }(),
    setFromVector3: function(a, b) {
        return this.set(a.x, a.y, a.z, b || this._order);
    },
    reorder: function() {
        var a = new THREE.Quaternion();
        return function(b) {
            a.setFromEuler(this), this.setFromQuaternion(a, b);
        };
    }(),
    equals: function(a) {
        return a._x === this._x && a._y === this._y && a._z === this._z && a._order === this._order;
    },
    fromArray: function(a) {
        return this._x = a[0], this._y = a[1], this._z = a[2], void 0 !== a[3] && (this._order = a[3]), 
        this.onChangeCallback(), this;
    },
    toArray: function(a, b) {
        return void 0 === a && (a = []), void 0 === b && (b = 0), a[b] = this._x, a[b + 1] = this._y, 
        a[b + 2] = this._z, a[b + 3] = this._order, a;
    },
    toVector3: function(a) {
        return a ? a.set(this._x, this._y, this._z) : new THREE.Vector3(this._x, this._y, this._z);
    },
    onChange: function(a) {
        return this.onChangeCallback = a, this;
    },
    onChangeCallback: function() {},
    clone: function() {
        return new THREE.Euler(this._x, this._y, this._z, this._order);
    }
}, THREE.Line3 = function(a, b) {
    this.start = void 0 !== a ? a : new THREE.Vector3(), this.end = void 0 !== b ? b : new THREE.Vector3();
}, THREE.Line3.prototype = {
    constructor: THREE.Line3,
    set: function(a, b) {
        return this.start.copy(a), this.end.copy(b), this;
    },
    copy: function(a) {
        return this.start.copy(a.start), this.end.copy(a.end), this;
    },
    center: function(a) {
        return (a || new THREE.Vector3()).addVectors(this.start, this.end).multiplyScalar(.5);
    },
    delta: function(a) {
        return (a || new THREE.Vector3()).subVectors(this.end, this.start);
    },
    distanceSq: function() {
        return this.start.distanceToSquared(this.end);
    },
    distance: function() {
        return this.start.distanceTo(this.end);
    },
    at: function(a, b) {
        var c = b || new THREE.Vector3();
        return this.delta(c).multiplyScalar(a).add(this.start);
    },
    closestPointToPointParameter: function() {
        var a = new THREE.Vector3(), b = new THREE.Vector3();
        return function(c, d) {
            a.subVectors(c, this.start), b.subVectors(this.end, this.start);
            var e = b.dot(b), e = b.dot(a) / e;
            return d && (e = THREE.Math.clamp(e, 0, 1)), e;
        };
    }(),
    closestPointToPoint: function(a, b, c) {
        return a = this.closestPointToPointParameter(a, b), c = c || new THREE.Vector3(), 
        this.delta(c).multiplyScalar(a).add(this.start);
    },
    applyMatrix4: function(a) {
        return this.start.applyMatrix4(a), this.end.applyMatrix4(a), this;
    },
    equals: function(a) {
        return a.start.equals(this.start) && a.end.equals(this.end);
    },
    clone: function() {
        return new THREE.Line3().copy(this);
    }
}, THREE.Box2 = function(a, b) {
    this.min = void 0 !== a ? a : new THREE.Vector2(1/0, 1/0), this.max = void 0 !== b ? b : new THREE.Vector2(-1/0, -1/0);
}, THREE.Box2.prototype = {
    constructor: THREE.Box2,
    set: function(a, b) {
        return this.min.copy(a), this.max.copy(b), this;
    },
    setFromPoints: function(a) {
        this.makeEmpty();
        for (var b = 0, c = a.length; c > b; b++) this.expandByPoint(a[b]);
        return this;
    },
    setFromCenterAndSize: function() {
        var a = new THREE.Vector2();
        return function(b, c) {
            var d = a.copy(c).multiplyScalar(.5);
            return this.min.copy(b).sub(d), this.max.copy(b).add(d), this;
        };
    }(),
    copy: function(a) {
        return this.min.copy(a.min), this.max.copy(a.max), this;
    },
    makeEmpty: function() {
        return this.min.x = this.min.y = 1/0, this.max.x = this.max.y = -1/0, this;
    },
    empty: function() {
        return this.max.x < this.min.x || this.max.y < this.min.y;
    },
    center: function(a) {
        return (a || new THREE.Vector2()).addVectors(this.min, this.max).multiplyScalar(.5);
    },
    size: function(a) {
        return (a || new THREE.Vector2()).subVectors(this.max, this.min);
    },
    expandByPoint: function(a) {
        return this.min.min(a), this.max.max(a), this;
    },
    expandByVector: function(a) {
        return this.min.sub(a), this.max.add(a), this;
    },
    expandByScalar: function(a) {
        return this.min.addScalar(-a), this.max.addScalar(a), this;
    },
    containsPoint: function(a) {
        return a.x < this.min.x || a.x > this.max.x || a.y < this.min.y || a.y > this.max.y ? !1 : !0;
    },
    containsBox: function(a) {
        return this.min.x <= a.min.x && a.max.x <= this.max.x && this.min.y <= a.min.y && a.max.y <= this.max.y ? !0 : !1;
    },
    getParameter: function(a, b) {
        return (b || new THREE.Vector2()).set((a.x - this.min.x) / (this.max.x - this.min.x), (a.y - this.min.y) / (this.max.y - this.min.y));
    },
    isIntersectionBox: function(a) {
        return a.max.x < this.min.x || a.min.x > this.max.x || a.max.y < this.min.y || a.min.y > this.max.y ? !1 : !0;
    },
    clampPoint: function(a, b) {
        return (b || new THREE.Vector2()).copy(a).clamp(this.min, this.max);
    },
    distanceToPoint: function() {
        var a = new THREE.Vector2();
        return function(b) {
            return a.copy(b).clamp(this.min, this.max).sub(b).length();
        };
    }(),
    intersect: function(a) {
        return this.min.max(a.min), this.max.min(a.max), this;
    },
    union: function(a) {
        return this.min.min(a.min), this.max.max(a.max), this;
    },
    translate: function(a) {
        return this.min.add(a), this.max.add(a), this;
    },
    equals: function(a) {
        return a.min.equals(this.min) && a.max.equals(this.max);
    },
    clone: function() {
        return new THREE.Box2().copy(this);
    }
}, THREE.Box3 = function(a, b) {
    this.min = void 0 !== a ? a : new THREE.Vector3(1/0, 1/0, 1/0), this.max = void 0 !== b ? b : new THREE.Vector3(-1/0, -1/0, -1/0);
}, THREE.Box3.prototype = {
    constructor: THREE.Box3,
    set: function(a, b) {
        return this.min.copy(a), this.max.copy(b), this;
    },
    setFromPoints: function(a) {
        this.makeEmpty();
        for (var b = 0, c = a.length; c > b; b++) this.expandByPoint(a[b]);
        return this;
    },
    setFromCenterAndSize: function() {
        var a = new THREE.Vector3();
        return function(b, c) {
            var d = a.copy(c).multiplyScalar(.5);
            return this.min.copy(b).sub(d), this.max.copy(b).add(d), this;
        };
    }(),
    setFromObject: function() {
        var a = new THREE.Vector3();
        return function(b) {
            var c = this;
            return b.updateMatrixWorld(!0), this.makeEmpty(), b.traverse(function(b) {
                var d = b.geometry;
                if (void 0 !== d) if (d instanceof THREE.Geometry) for (var e = d.vertices, d = 0, f = e.length; f > d; d++) a.copy(e[d]), 
                a.applyMatrix4(b.matrixWorld), c.expandByPoint(a); else if (d instanceof THREE.BufferGeometry && void 0 !== d.attributes.position) for (e = d.attributes.position.array, 
                d = 0, f = e.length; f > d; d += 3) a.set(e[d], e[d + 1], e[d + 2]), a.applyMatrix4(b.matrixWorld), 
                c.expandByPoint(a);
            }), this;
        };
    }(),
    copy: function(a) {
        return this.min.copy(a.min), this.max.copy(a.max), this;
    },
    makeEmpty: function() {
        return this.min.x = this.min.y = this.min.z = 1/0, this.max.x = this.max.y = this.max.z = -1/0, 
        this;
    },
    empty: function() {
        return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
    },
    center: function(a) {
        return (a || new THREE.Vector3()).addVectors(this.min, this.max).multiplyScalar(.5);
    },
    size: function(a) {
        return (a || new THREE.Vector3()).subVectors(this.max, this.min);
    },
    expandByPoint: function(a) {
        return this.min.min(a), this.max.max(a), this;
    },
    expandByVector: function(a) {
        return this.min.sub(a), this.max.add(a), this;
    },
    expandByScalar: function(a) {
        return this.min.addScalar(-a), this.max.addScalar(a), this;
    },
    containsPoint: function(a) {
        return a.x < this.min.x || a.x > this.max.x || a.y < this.min.y || a.y > this.max.y || a.z < this.min.z || a.z > this.max.z ? !1 : !0;
    },
    containsBox: function(a) {
        return this.min.x <= a.min.x && a.max.x <= this.max.x && this.min.y <= a.min.y && a.max.y <= this.max.y && this.min.z <= a.min.z && a.max.z <= this.max.z ? !0 : !1;
    },
    getParameter: function(a, b) {
        return (b || new THREE.Vector3()).set((a.x - this.min.x) / (this.max.x - this.min.x), (a.y - this.min.y) / (this.max.y - this.min.y), (a.z - this.min.z) / (this.max.z - this.min.z));
    },
    isIntersectionBox: function(a) {
        return a.max.x < this.min.x || a.min.x > this.max.x || a.max.y < this.min.y || a.min.y > this.max.y || a.max.z < this.min.z || a.min.z > this.max.z ? !1 : !0;
    },
    clampPoint: function(a, b) {
        return (b || new THREE.Vector3()).copy(a).clamp(this.min, this.max);
    },
    distanceToPoint: function() {
        var a = new THREE.Vector3();
        return function(b) {
            return a.copy(b).clamp(this.min, this.max).sub(b).length();
        };
    }(),
    getBoundingSphere: function() {
        var a = new THREE.Vector3();
        return function(b) {
            return b = b || new THREE.Sphere(), b.center = this.center(), b.radius = .5 * this.size(a).length(), 
            b;
        };
    }(),
    intersect: function(a) {
        return this.min.max(a.min), this.max.min(a.max), this;
    },
    union: function(a) {
        return this.min.min(a.min), this.max.max(a.max), this;
    },
    applyMatrix4: function() {
        var a = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
        return function(b) {
            return a[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(b), a[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(b), 
            a[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(b), a[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(b), 
            a[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(b), a[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(b), 
            a[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(b), a[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(b), 
            this.makeEmpty(), this.setFromPoints(a), this;
        };
    }(),
    translate: function(a) {
        return this.min.add(a), this.max.add(a), this;
    },
    equals: function(a) {
        return a.min.equals(this.min) && a.max.equals(this.max);
    },
    clone: function() {
        return new THREE.Box3().copy(this);
    }
}, THREE.Matrix3 = function() {
    this.elements = new Float32Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]), 0 < arguments.length && THREE.error("THREE.Matrix3: the constructor no longer reads arguments. use .set() instead.");
}, THREE.Matrix3.prototype = {
    constructor: THREE.Matrix3,
    set: function(a, b, c, d, e, f, g, h, i) {
        var j = this.elements;
        return j[0] = a, j[3] = b, j[6] = c, j[1] = d, j[4] = e, j[7] = f, j[2] = g, j[5] = h, 
        j[8] = i, this;
    },
    identity: function() {
        return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
    },
    copy: function(a) {
        return a = a.elements, this.set(a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]), 
        this;
    },
    multiplyVector3: function(a) {
        return THREE.warn("THREE.Matrix3: .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead."), 
        a.applyMatrix3(this);
    },
    multiplyVector3Array: function(a) {
        return THREE.warn("THREE.Matrix3: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead."), 
        this.applyToVector3Array(a);
    },
    applyToVector3Array: function() {
        var a = new THREE.Vector3();
        return function(b, c, d) {
            void 0 === c && (c = 0), void 0 === d && (d = b.length);
            for (var e = 0; d > e; e += 3, c += 3) a.x = b[c], a.y = b[c + 1], a.z = b[c + 2], 
            a.applyMatrix3(this), b[c] = a.x, b[c + 1] = a.y, b[c + 2] = a.z;
            return b;
        };
    }(),
    multiplyScalar: function(a) {
        var b = this.elements;
        return b[0] *= a, b[3] *= a, b[6] *= a, b[1] *= a, b[4] *= a, b[7] *= a, b[2] *= a, 
        b[5] *= a, b[8] *= a, this;
    },
    determinant: function() {
        var a = this.elements, b = a[0], c = a[1], d = a[2], e = a[3], f = a[4], g = a[5], h = a[6], i = a[7], a = a[8];
        return b * f * a - b * g * i - c * e * a + c * g * h + d * e * i - d * f * h;
    },
    getInverse: function(a, b) {
        var c = a.elements, d = this.elements;
        if (d[0] = c[10] * c[5] - c[6] * c[9], d[1] = -c[10] * c[1] + c[2] * c[9], d[2] = c[6] * c[1] - c[2] * c[5], 
        d[3] = -c[10] * c[4] + c[6] * c[8], d[4] = c[10] * c[0] - c[2] * c[8], d[5] = -c[6] * c[0] + c[2] * c[4], 
        d[6] = c[9] * c[4] - c[5] * c[8], d[7] = -c[9] * c[0] + c[1] * c[8], d[8] = c[5] * c[0] - c[1] * c[4], 
        c = c[0] * d[0] + c[1] * d[3] + c[2] * d[6], 0 === c) {
            if (b) throw Error("Matrix3.getInverse(): can't invert matrix, determinant is 0");
            return THREE.warn("Matrix3.getInverse(): can't invert matrix, determinant is 0"), 
            this.identity(), this;
        }
        return this.multiplyScalar(1 / c), this;
    },
    transpose: function() {
        var a, b = this.elements;
        return a = b[1], b[1] = b[3], b[3] = a, a = b[2], b[2] = b[6], b[6] = a, a = b[5], 
        b[5] = b[7], b[7] = a, this;
    },
    flattenToArrayOffset: function(a, b) {
        var c = this.elements;
        return a[b] = c[0], a[b + 1] = c[1], a[b + 2] = c[2], a[b + 3] = c[3], a[b + 4] = c[4], 
        a[b + 5] = c[5], a[b + 6] = c[6], a[b + 7] = c[7], a[b + 8] = c[8], a;
    },
    getNormalMatrix: function(a) {
        return this.getInverse(a).transpose(), this;
    },
    transposeIntoArray: function(a) {
        var b = this.elements;
        return a[0] = b[0], a[1] = b[3], a[2] = b[6], a[3] = b[1], a[4] = b[4], a[5] = b[7], 
        a[6] = b[2], a[7] = b[5], a[8] = b[8], this;
    },
    fromArray: function(a) {
        return this.elements.set(a), this;
    },
    toArray: function() {
        var a = this.elements;
        return [ a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8] ];
    },
    clone: function() {
        return new THREE.Matrix3().fromArray(this.elements);
    }
}, THREE.Matrix4 = function() {
    this.elements = new Float32Array([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]), 
    0 < arguments.length && THREE.error("THREE.Matrix4: the constructor no longer reads arguments. use .set() instead.");
}, THREE.Matrix4.prototype = {
    constructor: THREE.Matrix4,
    set: function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
        var q = this.elements;
        return q[0] = a, q[4] = b, q[8] = c, q[12] = d, q[1] = e, q[5] = f, q[9] = g, q[13] = h, 
        q[2] = i, q[6] = j, q[10] = k, q[14] = l, q[3] = m, q[7] = n, q[11] = o, q[15] = p, 
        this;
    },
    identity: function() {
        return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
    },
    copy: function(a) {
        return this.elements.set(a.elements), this;
    },
    extractPosition: function(a) {
        return THREE.warn("THREE.Matrix4: .extractPosition() has been renamed to .copyPosition()."), 
        this.copyPosition(a);
    },
    copyPosition: function(a) {
        var b = this.elements;
        return a = a.elements, b[12] = a[12], b[13] = a[13], b[14] = a[14], this;
    },
    extractBasis: function(a, b, c) {
        var d = this.elements;
        return a.set(d[0], d[1], d[2]), b.set(d[4], d[5], d[6]), c.set(d[8], d[9], d[10]), 
        this;
    },
    makeBasis: function(a, b, c) {
        return this.set(a.x, b.x, c.x, 0, a.y, b.y, c.y, 0, a.z, b.z, c.z, 0, 0, 0, 0, 1), 
        this;
    },
    extractRotation: function() {
        var a = new THREE.Vector3();
        return function(b) {
            var c = this.elements;
            b = b.elements;
            var d = 1 / a.set(b[0], b[1], b[2]).length(), e = 1 / a.set(b[4], b[5], b[6]).length(), f = 1 / a.set(b[8], b[9], b[10]).length();
            return c[0] = b[0] * d, c[1] = b[1] * d, c[2] = b[2] * d, c[4] = b[4] * e, c[5] = b[5] * e, 
            c[6] = b[6] * e, c[8] = b[8] * f, c[9] = b[9] * f, c[10] = b[10] * f, this;
        };
    }(),
    makeRotationFromEuler: function(a) {
        !1 == a instanceof THREE.Euler && THREE.error("THREE.Matrix: .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.");
        var b = this.elements, c = a.x, d = a.y, e = a.z, f = Math.cos(c), c = Math.sin(c), g = Math.cos(d), d = Math.sin(d), h = Math.cos(e), e = Math.sin(e);
        if ("XYZ" === a.order) {
            a = f * h;
            var i = f * e, j = c * h, k = c * e;
            b[0] = g * h, b[4] = -g * e, b[8] = d, b[1] = i + j * d, b[5] = a - k * d, b[9] = -c * g, 
            b[2] = k - a * d, b[6] = j + i * d, b[10] = f * g;
        } else "YXZ" === a.order ? (a = g * h, i = g * e, j = d * h, k = d * e, b[0] = a + k * c, 
        b[4] = j * c - i, b[8] = f * d, b[1] = f * e, b[5] = f * h, b[9] = -c, b[2] = i * c - j, 
        b[6] = k + a * c, b[10] = f * g) : "ZXY" === a.order ? (a = g * h, i = g * e, j = d * h, 
        k = d * e, b[0] = a - k * c, b[4] = -f * e, b[8] = j + i * c, b[1] = i + j * c, 
        b[5] = f * h, b[9] = k - a * c, b[2] = -f * d, b[6] = c, b[10] = f * g) : "ZYX" === a.order ? (a = f * h, 
        i = f * e, j = c * h, k = c * e, b[0] = g * h, b[4] = j * d - i, b[8] = a * d + k, 
        b[1] = g * e, b[5] = k * d + a, b[9] = i * d - j, b[2] = -d, b[6] = c * g, b[10] = f * g) : "YZX" === a.order ? (a = f * g, 
        i = f * d, j = c * g, k = c * d, b[0] = g * h, b[4] = k - a * e, b[8] = j * e + i, 
        b[1] = e, b[5] = f * h, b[9] = -c * h, b[2] = -d * h, b[6] = i * e + j, b[10] = a - k * e) : "XZY" === a.order && (a = f * g, 
        i = f * d, j = c * g, k = c * d, b[0] = g * h, b[4] = -e, b[8] = d * h, b[1] = a * e + k, 
        b[5] = f * h, b[9] = i * e - j, b[2] = j * e - i, b[6] = c * h, b[10] = k * e + a);
        return b[3] = 0, b[7] = 0, b[11] = 0, b[12] = 0, b[13] = 0, b[14] = 0, b[15] = 1, 
        this;
    },
    setRotationFromQuaternion: function(a) {
        return THREE.warn("THREE.Matrix4: .setRotationFromQuaternion() has been renamed to .makeRotationFromQuaternion()."), 
        this.makeRotationFromQuaternion(a);
    },
    makeRotationFromQuaternion: function(a) {
        var b = this.elements, c = a.x, d = a.y, e = a.z, f = a.w, g = c + c, h = d + d, i = e + e;
        a = c * g;
        var j = c * h, c = c * i, k = d * h, d = d * i, e = e * i, g = f * g, h = f * h, f = f * i;
        return b[0] = 1 - (k + e), b[4] = j - f, b[8] = c + h, b[1] = j + f, b[5] = 1 - (a + e), 
        b[9] = d - g, b[2] = c - h, b[6] = d + g, b[10] = 1 - (a + k), b[3] = 0, b[7] = 0, 
        b[11] = 0, b[12] = 0, b[13] = 0, b[14] = 0, b[15] = 1, this;
    },
    lookAt: function() {
        var a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
        return function(d, e, f) {
            var g = this.elements;
            return c.subVectors(d, e).normalize(), 0 === c.length() && (c.z = 1), a.crossVectors(f, c).normalize(), 
            0 === a.length() && (c.x += 1e-4, a.crossVectors(f, c).normalize()), b.crossVectors(c, a), 
            g[0] = a.x, g[4] = b.x, g[8] = c.x, g[1] = a.y, g[5] = b.y, g[9] = c.y, g[2] = a.z, 
            g[6] = b.z, g[10] = c.z, this;
        };
    }(),
    multiply: function(a, b) {
        return void 0 !== b ? (THREE.warn("THREE.Matrix4: .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead."), 
        this.multiplyMatrices(a, b)) : this.multiplyMatrices(this, a);
    },
    multiplyMatrices: function(a, b) {
        var c = a.elements, d = b.elements, e = this.elements, f = c[0], g = c[4], h = c[8], i = c[12], j = c[1], k = c[5], l = c[9], m = c[13], n = c[2], o = c[6], p = c[10], q = c[14], r = c[3], s = c[7], t = c[11], c = c[15], u = d[0], v = d[4], w = d[8], x = d[12], y = d[1], z = d[5], A = d[9], B = d[13], C = d[2], D = d[6], E = d[10], F = d[14], G = d[3], H = d[7], I = d[11], d = d[15];
        return e[0] = f * u + g * y + h * C + i * G, e[4] = f * v + g * z + h * D + i * H, 
        e[8] = f * w + g * A + h * E + i * I, e[12] = f * x + g * B + h * F + i * d, e[1] = j * u + k * y + l * C + m * G, 
        e[5] = j * v + k * z + l * D + m * H, e[9] = j * w + k * A + l * E + m * I, e[13] = j * x + k * B + l * F + m * d, 
        e[2] = n * u + o * y + p * C + q * G, e[6] = n * v + o * z + p * D + q * H, e[10] = n * w + o * A + p * E + q * I, 
        e[14] = n * x + o * B + p * F + q * d, e[3] = r * u + s * y + t * C + c * G, e[7] = r * v + s * z + t * D + c * H, 
        e[11] = r * w + s * A + t * E + c * I, e[15] = r * x + s * B + t * F + c * d, this;
    },
    multiplyToArray: function(a, b, c) {
        var d = this.elements;
        return this.multiplyMatrices(a, b), c[0] = d[0], c[1] = d[1], c[2] = d[2], c[3] = d[3], 
        c[4] = d[4], c[5] = d[5], c[6] = d[6], c[7] = d[7], c[8] = d[8], c[9] = d[9], c[10] = d[10], 
        c[11] = d[11], c[12] = d[12], c[13] = d[13], c[14] = d[14], c[15] = d[15], this;
    },
    multiplyScalar: function(a) {
        var b = this.elements;
        return b[0] *= a, b[4] *= a, b[8] *= a, b[12] *= a, b[1] *= a, b[5] *= a, b[9] *= a, 
        b[13] *= a, b[2] *= a, b[6] *= a, b[10] *= a, b[14] *= a, b[3] *= a, b[7] *= a, 
        b[11] *= a, b[15] *= a, this;
    },
    multiplyVector3: function(a) {
        return THREE.warn("THREE.Matrix4: .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) or vector.applyProjection( matrix ) instead."), 
        a.applyProjection(this);
    },
    multiplyVector4: function(a) {
        return THREE.warn("THREE.Matrix4: .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead."), 
        a.applyMatrix4(this);
    },
    multiplyVector3Array: function(a) {
        return THREE.warn("THREE.Matrix4: .multiplyVector3Array() has been renamed. Use matrix.applyToVector3Array( array ) instead."), 
        this.applyToVector3Array(a);
    },
    applyToVector3Array: function() {
        var a = new THREE.Vector3();
        return function(b, c, d) {
            void 0 === c && (c = 0), void 0 === d && (d = b.length);
            for (var e = 0; d > e; e += 3, c += 3) a.x = b[c], a.y = b[c + 1], a.z = b[c + 2], 
            a.applyMatrix4(this), b[c] = a.x, b[c + 1] = a.y, b[c + 2] = a.z;
            return b;
        };
    }(),
    rotateAxis: function(a) {
        THREE.warn("THREE.Matrix4: .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead."), 
        a.transformDirection(this);
    },
    crossVector: function(a) {
        return THREE.warn("THREE.Matrix4: .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead."), 
        a.applyMatrix4(this);
    },
    determinant: function() {
        var a = this.elements, b = a[0], c = a[4], d = a[8], e = a[12], f = a[1], g = a[5], h = a[9], i = a[13], j = a[2], k = a[6], l = a[10], m = a[14];
        return a[3] * (+e * h * k - d * i * k - e * g * l + c * i * l + d * g * m - c * h * m) + a[7] * (+b * h * m - b * i * l + e * f * l - d * f * m + d * i * j - e * h * j) + a[11] * (+b * i * k - b * g * m - e * f * k + c * f * m + e * g * j - c * i * j) + a[15] * (-d * g * j - b * h * k + b * g * l + d * f * k - c * f * l + c * h * j);
    },
    transpose: function() {
        var a, b = this.elements;
        return a = b[1], b[1] = b[4], b[4] = a, a = b[2], b[2] = b[8], b[8] = a, a = b[6], 
        b[6] = b[9], b[9] = a, a = b[3], b[3] = b[12], b[12] = a, a = b[7], b[7] = b[13], 
        b[13] = a, a = b[11], b[11] = b[14], b[14] = a, this;
    },
    flattenToArrayOffset: function(a, b) {
        var c = this.elements;
        return a[b] = c[0], a[b + 1] = c[1], a[b + 2] = c[2], a[b + 3] = c[3], a[b + 4] = c[4], 
        a[b + 5] = c[5], a[b + 6] = c[6], a[b + 7] = c[7], a[b + 8] = c[8], a[b + 9] = c[9], 
        a[b + 10] = c[10], a[b + 11] = c[11], a[b + 12] = c[12], a[b + 13] = c[13], a[b + 14] = c[14], 
        a[b + 15] = c[15], a;
    },
    getPosition: function() {
        var a = new THREE.Vector3();
        return function() {
            THREE.warn("THREE.Matrix4: .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead.");
            var b = this.elements;
            return a.set(b[12], b[13], b[14]);
        };
    }(),
    setPosition: function(a) {
        var b = this.elements;
        return b[12] = a.x, b[13] = a.y, b[14] = a.z, this;
    },
    getInverse: function(a, b) {
        var c = this.elements, d = a.elements, e = d[0], f = d[4], g = d[8], h = d[12], i = d[1], j = d[5], k = d[9], l = d[13], m = d[2], n = d[6], o = d[10], p = d[14], q = d[3], r = d[7], s = d[11], d = d[15];
        if (c[0] = k * p * r - l * o * r + l * n * s - j * p * s - k * n * d + j * o * d, 
        c[4] = h * o * r - g * p * r - h * n * s + f * p * s + g * n * d - f * o * d, c[8] = g * l * r - h * k * r + h * j * s - f * l * s - g * j * d + f * k * d, 
        c[12] = h * k * n - g * l * n - h * j * o + f * l * o + g * j * p - f * k * p, c[1] = l * o * q - k * p * q - l * m * s + i * p * s + k * m * d - i * o * d, 
        c[5] = g * p * q - h * o * q + h * m * s - e * p * s - g * m * d + e * o * d, c[9] = h * k * q - g * l * q - h * i * s + e * l * s + g * i * d - e * k * d, 
        c[13] = g * l * m - h * k * m + h * i * o - e * l * o - g * i * p + e * k * p, c[2] = j * p * q - l * n * q + l * m * r - i * p * r - j * m * d + i * n * d, 
        c[6] = h * n * q - f * p * q - h * m * r + e * p * r + f * m * d - e * n * d, c[10] = f * l * q - h * j * q + h * i * r - e * l * r - f * i * d + e * j * d, 
        c[14] = h * j * m - f * l * m - h * i * n + e * l * n + f * i * p - e * j * p, c[3] = k * n * q - j * o * q - k * m * r + i * o * r + j * m * s - i * n * s, 
        c[7] = f * o * q - g * n * q + g * m * r - e * o * r - f * m * s + e * n * s, c[11] = g * j * q - f * k * q - g * i * r + e * k * r + f * i * s - e * j * s, 
        c[15] = f * k * m - g * j * m + g * i * n - e * k * n - f * i * o + e * j * o, c = e * c[0] + i * c[4] + m * c[8] + q * c[12], 
        0 == c) {
            if (b) throw Error("THREE.Matrix4.getInverse(): can't invert matrix, determinant is 0");
            return THREE.warn("THREE.Matrix4.getInverse(): can't invert matrix, determinant is 0"), 
            this.identity(), this;
        }
        return this.multiplyScalar(1 / c), this;
    },
    translate: function() {
        THREE.error("THREE.Matrix4: .translate() has been removed.");
    },
    rotateX: function() {
        THREE.error("THREE.Matrix4: .rotateX() has been removed.");
    },
    rotateY: function() {
        THREE.error("THREE.Matrix4: .rotateY() has been removed.");
    },
    rotateZ: function() {
        THREE.error("THREE.Matrix4: .rotateZ() has been removed.");
    },
    rotateByAxis: function() {
        THREE.error("THREE.Matrix4: .rotateByAxis() has been removed.");
    },
    scale: function(a) {
        var b = this.elements, c = a.x, d = a.y;
        return a = a.z, b[0] *= c, b[4] *= d, b[8] *= a, b[1] *= c, b[5] *= d, b[9] *= a, 
        b[2] *= c, b[6] *= d, b[10] *= a, b[3] *= c, b[7] *= d, b[11] *= a, this;
    },
    getMaxScaleOnAxis: function() {
        var a = this.elements;
        return Math.sqrt(Math.max(a[0] * a[0] + a[1] * a[1] + a[2] * a[2], Math.max(a[4] * a[4] + a[5] * a[5] + a[6] * a[6], a[8] * a[8] + a[9] * a[9] + a[10] * a[10])));
    },
    makeTranslation: function(a, b, c) {
        return this.set(1, 0, 0, a, 0, 1, 0, b, 0, 0, 1, c, 0, 0, 0, 1), this;
    },
    makeRotationX: function(a) {
        var b = Math.cos(a);
        return a = Math.sin(a), this.set(1, 0, 0, 0, 0, b, -a, 0, 0, a, b, 0, 0, 0, 0, 1), 
        this;
    },
    makeRotationY: function(a) {
        var b = Math.cos(a);
        return a = Math.sin(a), this.set(b, 0, a, 0, 0, 1, 0, 0, -a, 0, b, 0, 0, 0, 0, 1), 
        this;
    },
    makeRotationZ: function(a) {
        var b = Math.cos(a);
        return a = Math.sin(a), this.set(b, -a, 0, 0, a, b, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), 
        this;
    },
    makeRotationAxis: function(a, b) {
        var c = Math.cos(b), d = Math.sin(b), e = 1 - c, f = a.x, g = a.y, h = a.z, i = e * f, j = e * g;
        return this.set(i * f + c, i * g - d * h, i * h + d * g, 0, i * g + d * h, j * g + c, j * h - d * f, 0, i * h - d * g, j * h + d * f, e * h * h + c, 0, 0, 0, 0, 1), 
        this;
    },
    makeScale: function(a, b, c) {
        return this.set(a, 0, 0, 0, 0, b, 0, 0, 0, 0, c, 0, 0, 0, 0, 1), this;
    },
    compose: function(a, b, c) {
        return this.makeRotationFromQuaternion(b), this.scale(c), this.setPosition(a), this;
    },
    decompose: function() {
        var a = new THREE.Vector3(), b = new THREE.Matrix4();
        return function(c, d, e) {
            var f = this.elements, g = a.set(f[0], f[1], f[2]).length(), h = a.set(f[4], f[5], f[6]).length(), i = a.set(f[8], f[9], f[10]).length();
            0 > this.determinant() && (g = -g), c.x = f[12], c.y = f[13], c.z = f[14], b.elements.set(this.elements), 
            c = 1 / g;
            var f = 1 / h, j = 1 / i;
            return b.elements[0] *= c, b.elements[1] *= c, b.elements[2] *= c, b.elements[4] *= f, 
            b.elements[5] *= f, b.elements[6] *= f, b.elements[8] *= j, b.elements[9] *= j, 
            b.elements[10] *= j, d.setFromRotationMatrix(b), e.x = g, e.y = h, e.z = i, this;
        };
    }(),
    makeFrustum: function(a, b, c, d, e, f) {
        var g = this.elements;
        return g[0] = 2 * e / (b - a), g[4] = 0, g[8] = (b + a) / (b - a), g[12] = 0, g[1] = 0, 
        g[5] = 2 * e / (d - c), g[9] = (d + c) / (d - c), g[13] = 0, g[2] = 0, g[6] = 0, 
        g[10] = -(f + e) / (f - e), g[14] = -2 * f * e / (f - e), g[3] = 0, g[7] = 0, g[11] = -1, 
        g[15] = 0, this;
    },
    makePerspective: function(a, b, c, d) {
        a = c * Math.tan(THREE.Math.degToRad(.5 * a));
        var e = -a;
        return this.makeFrustum(e * b, a * b, e, a, c, d);
    },
    makeOrthographic: function(a, b, c, d, e, f) {
        var g = this.elements, h = b - a, i = c - d, j = f - e;
        return g[0] = 2 / h, g[4] = 0, g[8] = 0, g[12] = -((b + a) / h), g[1] = 0, g[5] = 2 / i, 
        g[9] = 0, g[13] = -((c + d) / i), g[2] = 0, g[6] = 0, g[10] = -2 / j, g[14] = -((f + e) / j), 
        g[3] = 0, g[7] = 0, g[11] = 0, g[15] = 1, this;
    },
    fromArray: function(a) {
        return this.elements.set(a), this;
    },
    toArray: function() {
        var a = this.elements;
        return [ a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15] ];
    },
    clone: function() {
        return new THREE.Matrix4().fromArray(this.elements);
    }
}, THREE.Ray = function(a, b) {
    this.origin = void 0 !== a ? a : new THREE.Vector3(), this.direction = void 0 !== b ? b : new THREE.Vector3();
}, THREE.Ray.prototype = {
    constructor: THREE.Ray,
    set: function(a, b) {
        return this.origin.copy(a), this.direction.copy(b), this;
    },
    copy: function(a) {
        return this.origin.copy(a.origin), this.direction.copy(a.direction), this;
    },
    at: function(a, b) {
        return (b || new THREE.Vector3()).copy(this.direction).multiplyScalar(a).add(this.origin);
    },
    recast: function() {
        var a = new THREE.Vector3();
        return function(b) {
            return this.origin.copy(this.at(b, a)), this;
        };
    }(),
    closestPointToPoint: function(a, b) {
        var c = b || new THREE.Vector3();
        c.subVectors(a, this.origin);
        var d = c.dot(this.direction);
        return 0 > d ? c.copy(this.origin) : c.copy(this.direction).multiplyScalar(d).add(this.origin);
    },
    distanceToPoint: function() {
        var a = new THREE.Vector3();
        return function(b) {
            var c = a.subVectors(b, this.origin).dot(this.direction);
            return 0 > c ? this.origin.distanceTo(b) : (a.copy(this.direction).multiplyScalar(c).add(this.origin), 
            a.distanceTo(b));
        };
    }(),
    distanceSqToSegment: function() {
        var a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
        return function(d, e, f, g) {
            a.copy(d).add(e).multiplyScalar(.5), b.copy(e).sub(d).normalize(), c.copy(this.origin).sub(a);
            var h, i = .5 * d.distanceTo(e), j = -this.direction.dot(b), k = c.dot(this.direction), l = -c.dot(b), m = c.lengthSq(), n = Math.abs(1 - j * j);
            return n > 0 ? (d = j * l - k, e = j * k - l, h = i * n, d >= 0 ? e >= -h ? h >= e ? (i = 1 / n, 
            d *= i, e *= i, j = d * (d + j * e + 2 * k) + e * (j * d + e + 2 * l) + m) : (e = i, 
            d = Math.max(0, -(j * e + k)), j = -d * d + e * (e + 2 * l) + m) : (e = -i, d = Math.max(0, -(j * e + k)), 
            j = -d * d + e * (e + 2 * l) + m) : -h >= e ? (d = Math.max(0, -(-j * i + k)), e = d > 0 ? -i : Math.min(Math.max(-i, -l), i), 
            j = -d * d + e * (e + 2 * l) + m) : h >= e ? (d = 0, e = Math.min(Math.max(-i, -l), i), 
            j = e * (e + 2 * l) + m) : (d = Math.max(0, -(j * i + k)), e = d > 0 ? i : Math.min(Math.max(-i, -l), i), 
            j = -d * d + e * (e + 2 * l) + m)) : (e = j > 0 ? -i : i, d = Math.max(0, -(j * e + k)), 
            j = -d * d + e * (e + 2 * l) + m), f && f.copy(this.direction).multiplyScalar(d).add(this.origin), 
            g && g.copy(b).multiplyScalar(e).add(a), j;
        };
    }(),
    isIntersectionSphere: function(a) {
        return this.distanceToPoint(a.center) <= a.radius;
    },
    intersectSphere: function() {
        var a = new THREE.Vector3();
        return function(b, c) {
            a.subVectors(b.center, this.origin);
            var d = a.dot(this.direction), e = a.dot(a) - d * d, f = b.radius * b.radius;
            return e > f ? null : (f = Math.sqrt(f - e), e = d - f, d += f, 0 > e && 0 > d ? null : 0 > e ? this.at(d, c) : this.at(e, c));
        };
    }(),
    isIntersectionPlane: function(a) {
        var b = a.distanceToPoint(this.origin);
        return 0 === b || 0 > a.normal.dot(this.direction) * b ? !0 : !1;
    },
    distanceToPlane: function(a) {
        var b = a.normal.dot(this.direction);
        return 0 == b ? 0 == a.distanceToPoint(this.origin) ? 0 : null : (a = -(this.origin.dot(a.normal) + a.constant) / b, 
        a >= 0 ? a : null);
    },
    intersectPlane: function(a, b) {
        var c = this.distanceToPlane(a);
        return null === c ? null : this.at(c, b);
    },
    isIntersectionBox: function() {
        var a = new THREE.Vector3();
        return function(b) {
            return null !== this.intersectBox(b, a);
        };
    }(),
    intersectBox: function(a, b) {
        var c, d, e, f, g;
        d = 1 / this.direction.x, f = 1 / this.direction.y, g = 1 / this.direction.z;
        var h = this.origin;
        return d >= 0 ? (c = (a.min.x - h.x) * d, d *= a.max.x - h.x) : (c = (a.max.x - h.x) * d, 
        d *= a.min.x - h.x), f >= 0 ? (e = (a.min.y - h.y) * f, f *= a.max.y - h.y) : (e = (a.max.y - h.y) * f, 
        f *= a.min.y - h.y), c > f || e > d ? null : ((e > c || c !== c) && (c = e), (d > f || d !== d) && (d = f), 
        g >= 0 ? (e = (a.min.z - h.z) * g, g *= a.max.z - h.z) : (e = (a.max.z - h.z) * g, 
        g *= a.min.z - h.z), c > g || e > d ? null : ((e > c || c !== c) && (c = e), (d > g || d !== d) && (d = g), 
        0 > d ? null : this.at(c >= 0 ? c : d, b)));
    },
    intersectTriangle: function() {
        var a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Vector3();
        return function(e, f, g, h, i) {
            if (b.subVectors(f, e), c.subVectors(g, e), d.crossVectors(b, c), f = this.direction.dot(d), 
            f > 0) {
                if (h) return null;
                h = 1;
            } else {
                if (!(0 > f)) return null;
                h = -1, f = -f;
            }
            return a.subVectors(this.origin, e), e = h * this.direction.dot(c.crossVectors(a, c)), 
            0 > e ? null : (g = h * this.direction.dot(b.cross(a)), 0 > g || e + g > f ? null : (e = -h * a.dot(d), 
            0 > e ? null : this.at(e / f, i)));
        };
    }(),
    applyMatrix4: function(a) {
        return this.direction.add(this.origin).applyMatrix4(a), this.origin.applyMatrix4(a), 
        this.direction.sub(this.origin), this.direction.normalize(), this;
    },
    equals: function(a) {
        return a.origin.equals(this.origin) && a.direction.equals(this.direction);
    },
    clone: function() {
        return new THREE.Ray().copy(this);
    }
}, THREE.Sphere = function(a, b) {
    this.center = void 0 !== a ? a : new THREE.Vector3(), this.radius = void 0 !== b ? b : 0;
}, THREE.Sphere.prototype = {
    constructor: THREE.Sphere,
    set: function(a, b) {
        return this.center.copy(a), this.radius = b, this;
    },
    setFromPoints: function() {
        var a = new THREE.Box3();
        return function(b, c) {
            var d = this.center;
            void 0 !== c ? d.copy(c) : a.setFromPoints(b).center(d);
            for (var e = 0, f = 0, g = b.length; g > f; f++) e = Math.max(e, d.distanceToSquared(b[f]));
            return this.radius = Math.sqrt(e), this;
        };
    }(),
    copy: function(a) {
        return this.center.copy(a.center), this.radius = a.radius, this;
    },
    empty: function() {
        return 0 >= this.radius;
    },
    containsPoint: function(a) {
        return a.distanceToSquared(this.center) <= this.radius * this.radius;
    },
    distanceToPoint: function(a) {
        return a.distanceTo(this.center) - this.radius;
    },
    intersectsSphere: function(a) {
        var b = this.radius + a.radius;
        return a.center.distanceToSquared(this.center) <= b * b;
    },
    clampPoint: function(a, b) {
        var c = this.center.distanceToSquared(a), d = b || new THREE.Vector3();
        return d.copy(a), c > this.radius * this.radius && (d.sub(this.center).normalize(), 
        d.multiplyScalar(this.radius).add(this.center)), d;
    },
    getBoundingBox: function(a) {
        return a = a || new THREE.Box3(), a.set(this.center, this.center), a.expandByScalar(this.radius), 
        a;
    },
    applyMatrix4: function(a) {
        return this.center.applyMatrix4(a), this.radius *= a.getMaxScaleOnAxis(), this;
    },
    translate: function(a) {
        return this.center.add(a), this;
    },
    equals: function(a) {
        return a.center.equals(this.center) && a.radius === this.radius;
    },
    clone: function() {
        return new THREE.Sphere().copy(this);
    }
}, THREE.Frustum = function(a, b, c, d, e, f) {
    this.planes = [ void 0 !== a ? a : new THREE.Plane(), void 0 !== b ? b : new THREE.Plane(), void 0 !== c ? c : new THREE.Plane(), void 0 !== d ? d : new THREE.Plane(), void 0 !== e ? e : new THREE.Plane(), void 0 !== f ? f : new THREE.Plane() ];
}, THREE.Frustum.prototype = {
    constructor: THREE.Frustum,
    set: function(a, b, c, d, e, f) {
        var g = this.planes;
        return g[0].copy(a), g[1].copy(b), g[2].copy(c), g[3].copy(d), g[4].copy(e), g[5].copy(f), 
        this;
    },
    copy: function(a) {
        for (var b = this.planes, c = 0; 6 > c; c++) b[c].copy(a.planes[c]);
        return this;
    },
    setFromMatrix: function(a) {
        var b = this.planes, c = a.elements;
        a = c[0];
        var d = c[1], e = c[2], f = c[3], g = c[4], h = c[5], i = c[6], j = c[7], k = c[8], l = c[9], m = c[10], n = c[11], o = c[12], p = c[13], q = c[14], c = c[15];
        return b[0].setComponents(f - a, j - g, n - k, c - o).normalize(), b[1].setComponents(f + a, j + g, n + k, c + o).normalize(), 
        b[2].setComponents(f + d, j + h, n + l, c + p).normalize(), b[3].setComponents(f - d, j - h, n - l, c - p).normalize(), 
        b[4].setComponents(f - e, j - i, n - m, c - q).normalize(), b[5].setComponents(f + e, j + i, n + m, c + q).normalize(), 
        this;
    },
    intersectsObject: function() {
        var a = new THREE.Sphere();
        return function(b) {
            var c = b.geometry;
            return null === c.boundingSphere && c.computeBoundingSphere(), a.copy(c.boundingSphere), 
            a.applyMatrix4(b.matrixWorld), this.intersectsSphere(a);
        };
    }(),
    intersectsSphere: function(a) {
        var b = this.planes, c = a.center;
        a = -a.radius;
        for (var d = 0; 6 > d; d++) if (b[d].distanceToPoint(c) < a) return !1;
        return !0;
    },
    intersectsBox: function() {
        var a = new THREE.Vector3(), b = new THREE.Vector3();
        return function(c) {
            for (var d = this.planes, e = 0; 6 > e; e++) {
                var f = d[e];
                a.x = 0 < f.normal.x ? c.min.x : c.max.x, b.x = 0 < f.normal.x ? c.max.x : c.min.x, 
                a.y = 0 < f.normal.y ? c.min.y : c.max.y, b.y = 0 < f.normal.y ? c.max.y : c.min.y, 
                a.z = 0 < f.normal.z ? c.min.z : c.max.z, b.z = 0 < f.normal.z ? c.max.z : c.min.z;
                var g = f.distanceToPoint(a), f = f.distanceToPoint(b);
                if (0 > g && 0 > f) return !1;
            }
            return !0;
        };
    }(),
    containsPoint: function(a) {
        for (var b = this.planes, c = 0; 6 > c; c++) if (0 > b[c].distanceToPoint(a)) return !1;
        return !0;
    },
    clone: function() {
        return new THREE.Frustum().copy(this);
    }
}, THREE.Plane = function(a, b) {
    this.normal = void 0 !== a ? a : new THREE.Vector3(1, 0, 0), this.constant = void 0 !== b ? b : 0;
}, THREE.Plane.prototype = {
    constructor: THREE.Plane,
    set: function(a, b) {
        return this.normal.copy(a), this.constant = b, this;
    },
    setComponents: function(a, b, c, d) {
        return this.normal.set(a, b, c), this.constant = d, this;
    },
    setFromNormalAndCoplanarPoint: function(a, b) {
        return this.normal.copy(a), this.constant = -b.dot(this.normal), this;
    },
    setFromCoplanarPoints: function() {
        var a = new THREE.Vector3(), b = new THREE.Vector3();
        return function(c, d, e) {
            return d = a.subVectors(e, d).cross(b.subVectors(c, d)).normalize(), this.setFromNormalAndCoplanarPoint(d, c), 
            this;
        };
    }(),
    copy: function(a) {
        return this.normal.copy(a.normal), this.constant = a.constant, this;
    },
    normalize: function() {
        var a = 1 / this.normal.length();
        return this.normal.multiplyScalar(a), this.constant *= a, this;
    },
    negate: function() {
        return this.constant *= -1, this.normal.negate(), this;
    },
    distanceToPoint: function(a) {
        return this.normal.dot(a) + this.constant;
    },
    distanceToSphere: function(a) {
        return this.distanceToPoint(a.center) - a.radius;
    },
    projectPoint: function(a, b) {
        return this.orthoPoint(a, b).sub(a).negate();
    },
    orthoPoint: function(a, b) {
        var c = this.distanceToPoint(a);
        return (b || new THREE.Vector3()).copy(this.normal).multiplyScalar(c);
    },
    isIntersectionLine: function(a) {
        var b = this.distanceToPoint(a.start);
        return a = this.distanceToPoint(a.end), 0 > b && a > 0 || 0 > a && b > 0;
    },
    intersectLine: function() {
        var a = new THREE.Vector3();
        return function(b, c) {
            var d = c || new THREE.Vector3(), e = b.delta(a), f = this.normal.dot(e);
            return 0 != f ? (f = -(b.start.dot(this.normal) + this.constant) / f, 0 > f || f > 1 ? void 0 : d.copy(e).multiplyScalar(f).add(b.start)) : 0 == this.distanceToPoint(b.start) ? d.copy(b.start) : void 0;
        };
    }(),
    coplanarPoint: function(a) {
        return (a || new THREE.Vector3()).copy(this.normal).multiplyScalar(-this.constant);
    },
    applyMatrix4: function() {
        var a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Matrix3();
        return function(d, e) {
            var f = e || c.getNormalMatrix(d), f = a.copy(this.normal).applyMatrix3(f), g = this.coplanarPoint(b);
            return g.applyMatrix4(d), this.setFromNormalAndCoplanarPoint(f, g), this;
        };
    }(),
    translate: function(a) {
        return this.constant -= a.dot(this.normal), this;
    },
    equals: function(a) {
        return a.normal.equals(this.normal) && a.constant == this.constant;
    },
    clone: function() {
        return new THREE.Plane().copy(this);
    }
}, THREE.Math = {
    generateUUID: function() {
        var a, b = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""), c = Array(36), d = 0;
        return function() {
            for (var e = 0; 36 > e; e++) 8 == e || 13 == e || 18 == e || 23 == e ? c[e] = "-" : 14 == e ? c[e] = "4" : (2 >= d && (d = 33554432 + 16777216 * Math.random() | 0), 
            a = 15 & d, d >>= 4, c[e] = b[19 == e ? 3 & a | 8 : a]);
            return c.join("");
        };
    }(),
    clamp: function(a, b, c) {
        return b > a ? b : a > c ? c : a;
    },
    clampBottom: function(a, b) {
        return b > a ? b : a;
    },
    mapLinear: function(a, b, c, d, e) {
        return d + (a - b) * (e - d) / (c - b);
    },
    smoothstep: function(a, b, c) {
        return b >= a ? 0 : a >= c ? 1 : (a = (a - b) / (c - b), a * a * (3 - 2 * a));
    },
    smootherstep: function(a, b, c) {
        return b >= a ? 0 : a >= c ? 1 : (a = (a - b) / (c - b), a * a * a * (a * (6 * a - 15) + 10));
    },
    random16: function() {
        return (65280 * Math.random() + 255 * Math.random()) / 65535;
    },
    randInt: function(a, b) {
        return Math.floor(this.randFloat(a, b));
    },
    randFloat: function(a, b) {
        return a + Math.random() * (b - a);
    },
    randFloatSpread: function(a) {
        return a * (.5 - Math.random());
    },
    degToRad: function() {
        var a = Math.PI / 180;
        return function(b) {
            return b * a;
        };
    }(),
    radToDeg: function() {
        var a = 180 / Math.PI;
        return function(b) {
            return b * a;
        };
    }(),
    isPowerOfTwo: function(a) {
        return 0 === (a & a - 1) && 0 !== a;
    },
    nextPowerOfTwo: function(a) {
        return a--, a |= a >> 1, a |= a >> 2, a |= a >> 4, a |= a >> 8, a |= a >> 16, a++, 
        a;
    }
}, THREE.Spline = function(a) {
    function b(a, b, c, d, e, f, g) {
        return a = .5 * (c - a), d = .5 * (d - b), (2 * (b - c) + a + d) * g + (-3 * (b - c) - 2 * a - d) * f + a * e + b;
    }
    this.points = a;
    var c, d, e, f, g, h, i, j, k, l = [], m = {
        x: 0,
        y: 0,
        z: 0
    };
    this.initFromArray = function(a) {
        this.points = [];
        for (var b = 0; b < a.length; b++) this.points[b] = {
            x: a[b][0],
            y: a[b][1],
            z: a[b][2]
        };
    }, this.getPoint = function(a) {
        return c = (this.points.length - 1) * a, d = Math.floor(c), e = c - d, l[0] = 0 === d ? d : d - 1, 
        l[1] = d, l[2] = d > this.points.length - 2 ? this.points.length - 1 : d + 1, l[3] = d > this.points.length - 3 ? this.points.length - 1 : d + 2, 
        h = this.points[l[0]], i = this.points[l[1]], j = this.points[l[2]], k = this.points[l[3]], 
        f = e * e, g = e * f, m.x = b(h.x, i.x, j.x, k.x, e, f, g), m.y = b(h.y, i.y, j.y, k.y, e, f, g), 
        m.z = b(h.z, i.z, j.z, k.z, e, f, g), m;
    }, this.getControlPointsArray = function() {
        var a, b, c = this.points.length, d = [];
        for (a = 0; c > a; a++) b = this.points[a], d[a] = [ b.x, b.y, b.z ];
        return d;
    }, this.getLength = function(a) {
        var b, c, d, e = b = b = 0, f = new THREE.Vector3(), g = new THREE.Vector3(), h = [], i = 0;
        for (h[0] = 0, a || (a = 100), c = this.points.length * a, f.copy(this.points[0]), 
        a = 1; c > a; a++) b = a / c, d = this.getPoint(b), g.copy(d), i += g.distanceTo(f), 
        f.copy(d), b *= this.points.length - 1, b = Math.floor(b), b != e && (h[b] = i, 
        e = b);
        return h[h.length] = i, {
            chunks: h,
            total: i
        };
    }, this.reparametrizeByArcLength = function(a) {
        var b, c, d, e, f, g, h = [], i = new THREE.Vector3(), j = this.getLength();
        for (h.push(i.copy(this.points[0]).clone()), b = 1; b < this.points.length; b++) {
            for (c = j.chunks[b] - j.chunks[b - 1], g = Math.ceil(a * c / j.total), e = (b - 1) / (this.points.length - 1), 
            f = b / (this.points.length - 1), c = 1; g - 1 > c; c++) d = e + 1 / g * c * (f - e), 
            d = this.getPoint(d), h.push(i.copy(d).clone());
            h.push(i.copy(this.points[b]).clone());
        }
        this.points = h;
    };
}, THREE.Triangle = function(a, b, c) {
    this.a = void 0 !== a ? a : new THREE.Vector3(), this.b = void 0 !== b ? b : new THREE.Vector3(), 
    this.c = void 0 !== c ? c : new THREE.Vector3();
}, THREE.Triangle.normal = function() {
    var a = new THREE.Vector3();
    return function(b, c, d, e) {
        return e = e || new THREE.Vector3(), e.subVectors(d, c), a.subVectors(b, c), e.cross(a), 
        b = e.lengthSq(), b > 0 ? e.multiplyScalar(1 / Math.sqrt(b)) : e.set(0, 0, 0);
    };
}(), THREE.Triangle.barycoordFromPoint = function() {
    var a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    return function(d, e, f, g, h) {
        a.subVectors(g, e), b.subVectors(f, e), c.subVectors(d, e), d = a.dot(a), e = a.dot(b), 
        f = a.dot(c);
        var i = b.dot(b);
        g = b.dot(c);
        var j = d * i - e * e;
        return h = h || new THREE.Vector3(), 0 == j ? h.set(-2, -1, -1) : (j = 1 / j, i = (i * f - e * g) * j, 
        d = (d * g - e * f) * j, h.set(1 - i - d, d, i));
    };
}(), THREE.Triangle.containsPoint = function() {
    var a = new THREE.Vector3();
    return function(b, c, d, e) {
        return b = THREE.Triangle.barycoordFromPoint(b, c, d, e, a), 0 <= b.x && 0 <= b.y && 1 >= b.x + b.y;
    };
}(), THREE.Triangle.prototype = {
    constructor: THREE.Triangle,
    set: function(a, b, c) {
        return this.a.copy(a), this.b.copy(b), this.c.copy(c), this;
    },
    setFromPointsAndIndices: function(a, b, c, d) {
        return this.a.copy(a[b]), this.b.copy(a[c]), this.c.copy(a[d]), this;
    },
    copy: function(a) {
        return this.a.copy(a.a), this.b.copy(a.b), this.c.copy(a.c), this;
    },
    area: function() {
        var a = new THREE.Vector3(), b = new THREE.Vector3();
        return function() {
            return a.subVectors(this.c, this.b), b.subVectors(this.a, this.b), .5 * a.cross(b).length();
        };
    }(),
    midpoint: function(a) {
        return (a || new THREE.Vector3()).addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
    },
    normal: function(a) {
        return THREE.Triangle.normal(this.a, this.b, this.c, a);
    },
    plane: function(a) {
        return (a || new THREE.Plane()).setFromCoplanarPoints(this.a, this.b, this.c);
    },
    barycoordFromPoint: function(a, b) {
        return THREE.Triangle.barycoordFromPoint(a, this.a, this.b, this.c, b);
    },
    containsPoint: function(a) {
        return THREE.Triangle.containsPoint(a, this.a, this.b, this.c);
    },
    equals: function(a) {
        return a.a.equals(this.a) && a.b.equals(this.b) && a.c.equals(this.c);
    },
    clone: function() {
        return new THREE.Triangle().copy(this);
    }
}, THREE.Clock = function(a) {
    this.autoStart = void 0 !== a ? a : !0, this.elapsedTime = this.oldTime = this.startTime = 0, 
    this.running = !1;
}, THREE.Clock.prototype = {
    constructor: THREE.Clock,
    start: function() {
        this.oldTime = this.startTime = void 0 !== self.performance && void 0 !== self.performance.now ? self.performance.now() : Date.now(), 
        this.running = !0;
    },
    stop: function() {
        this.getElapsedTime(), this.running = !1;
    },
    getElapsedTime: function() {
        return this.getDelta(), this.elapsedTime;
    },
    getDelta: function() {
        var a = 0;
        if (this.autoStart && !this.running && this.start(), this.running) {
            var b = void 0 !== self.performance && void 0 !== self.performance.now ? self.performance.now() : Date.now(), a = .001 * (b - this.oldTime);
            this.oldTime = b, this.elapsedTime += a;
        }
        return a;
    }
}, THREE.EventDispatcher = function() {}, THREE.EventDispatcher.prototype = {
    constructor: THREE.EventDispatcher,
    apply: function(a) {
        a.addEventListener = THREE.EventDispatcher.prototype.addEventListener, a.hasEventListener = THREE.EventDispatcher.prototype.hasEventListener, 
        a.removeEventListener = THREE.EventDispatcher.prototype.removeEventListener, a.dispatchEvent = THREE.EventDispatcher.prototype.dispatchEvent;
    },
    addEventListener: function(a, b) {
        void 0 === this._listeners && (this._listeners = {});
        var c = this._listeners;
        void 0 === c[a] && (c[a] = []), -1 === c[a].indexOf(b) && c[a].push(b);
    },
    hasEventListener: function(a, b) {
        if (void 0 === this._listeners) return !1;
        var c = this._listeners;
        return void 0 !== c[a] && -1 !== c[a].indexOf(b) ? !0 : !1;
    },
    removeEventListener: function(a, b) {
        if (void 0 !== this._listeners) {
            var c = this._listeners[a];
            if (void 0 !== c) {
                var d = c.indexOf(b);
                -1 !== d && c.splice(d, 1);
            }
        }
    },
    dispatchEvent: function(a) {
        if (void 0 !== this._listeners) {
            var b = this._listeners[a.type];
            if (void 0 !== b) {
                a.target = this;
                for (var c = [], d = b.length, e = 0; d > e; e++) c[e] = b[e];
                for (e = 0; d > e; e++) c[e].call(this, a);
            }
        }
    }
}, function(a) {
    a.Raycaster = function(b, c, d, e) {
        this.ray = new a.Ray(b, c), this.near = d || 0, this.far = e || 1/0, this.params = {
            Sprite: {},
            Mesh: {},
            PointCloud: {
                threshold: 1
            },
            LOD: {},
            Line: {}
        };
    };
    var b = function(a, b) {
        return a.distance - b.distance;
    }, c = function(a, b, d, e) {
        if (a.raycast(b, d), !0 === e) {
            a = a.children, e = 0;
            for (var f = a.length; f > e; e++) c(a[e], b, d, !0);
        }
    };
    a.Raycaster.prototype = {
        constructor: a.Raycaster,
        precision: 1e-4,
        linePrecision: 1,
        set: function(a, b) {
            this.ray.set(a, b);
        },
        setFromCamera: function(b, c) {
            c instanceof a.PerspectiveCamera ? (this.ray.origin.copy(c.position), this.ray.direction.set(b.x, b.y, .5).unproject(c).sub(c.position).normalize()) : c instanceof a.OrthographicCamera ? (this.ray.origin.set(b.x, b.y, -1).unproject(c), 
            this.ray.direction.set(0, 0, -1).transformDirection(c.matrixWorld)) : a.error("THREE.Raycaster: Unsupported camera type.");
        },
        intersectObject: function(a, d) {
            var e = [];
            return c(a, this, e, d), e.sort(b), e;
        },
        intersectObjects: function(d, e) {
            var f = [];
            if (!1 == d instanceof Array) return a.warn("THREE.Raycaster.intersectObjects: objects is not an Array."), 
            f;
            for (var g = 0, h = d.length; h > g; g++) c(d[g], this, f, e);
            return f.sort(b), f;
        }
    };
}(THREE), THREE.Object3D = function() {
    Object.defineProperty(this, "id", {
        value: THREE.Object3DIdCount++
    }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Object3D", 
    this.parent = void 0, this.children = [], this.up = THREE.Object3D.DefaultUp.clone();
    var a = new THREE.Vector3(), b = new THREE.Euler(), c = new THREE.Quaternion(), d = new THREE.Vector3(1, 1, 1);
    b.onChange(function() {
        c.setFromEuler(b, !1);
    }), c.onChange(function() {
        b.setFromQuaternion(c, void 0, !1);
    }), Object.defineProperties(this, {
        position: {
            enumerable: !0,
            value: a
        },
        rotation: {
            enumerable: !0,
            value: b
        },
        quaternion: {
            enumerable: !0,
            value: c
        },
        scale: {
            enumerable: !0,
            value: d
        }
    }), this.rotationAutoUpdate = !0, this.matrix = new THREE.Matrix4(), this.matrixWorld = new THREE.Matrix4(), 
    this.matrixAutoUpdate = !0, this.matrixWorldNeedsUpdate = !1, this.visible = !0, 
    this.receiveShadow = this.castShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, 
    this.userData = {};
}, THREE.Object3D.DefaultUp = new THREE.Vector3(0, 1, 0), THREE.Object3D.prototype = {
    constructor: THREE.Object3D,
    get eulerOrder() {
        return THREE.warn("THREE.Object3D: .eulerOrder has been moved to .rotation.order."), 
        this.rotation.order;
    },
    set eulerOrder(a) {
        THREE.warn("THREE.Object3D: .eulerOrder has been moved to .rotation.order."), this.rotation.order = a;
    },
    get useQuaternion() {
        THREE.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.");
    },
    set useQuaternion(a) {
        THREE.warn("THREE.Object3D: .useQuaternion has been removed. The library now uses quaternions by default.");
    },
    applyMatrix: function(a) {
        this.matrix.multiplyMatrices(a, this.matrix), this.matrix.decompose(this.position, this.quaternion, this.scale);
    },
    setRotationFromAxisAngle: function(a, b) {
        this.quaternion.setFromAxisAngle(a, b);
    },
    setRotationFromEuler: function(a) {
        this.quaternion.setFromEuler(a, !0);
    },
    setRotationFromMatrix: function(a) {
        this.quaternion.setFromRotationMatrix(a);
    },
    setRotationFromQuaternion: function(a) {
        this.quaternion.copy(a);
    },
    rotateOnAxis: function() {
        var a = new THREE.Quaternion();
        return function(b, c) {
            return a.setFromAxisAngle(b, c), this.quaternion.multiply(a), this;
        };
    }(),
    rotateX: function() {
        var a = new THREE.Vector3(1, 0, 0);
        return function(b) {
            return this.rotateOnAxis(a, b);
        };
    }(),
    rotateY: function() {
        var a = new THREE.Vector3(0, 1, 0);
        return function(b) {
            return this.rotateOnAxis(a, b);
        };
    }(),
    rotateZ: function() {
        var a = new THREE.Vector3(0, 0, 1);
        return function(b) {
            return this.rotateOnAxis(a, b);
        };
    }(),
    translateOnAxis: function() {
        var a = new THREE.Vector3();
        return function(b, c) {
            return a.copy(b).applyQuaternion(this.quaternion), this.position.add(a.multiplyScalar(c)), 
            this;
        };
    }(),
    translate: function(a, b) {
        return THREE.warn("THREE.Object3D: .translate() has been removed. Use .translateOnAxis( axis, distance ) instead."), 
        this.translateOnAxis(b, a);
    },
    translateX: function() {
        var a = new THREE.Vector3(1, 0, 0);
        return function(b) {
            return this.translateOnAxis(a, b);
        };
    }(),
    translateY: function() {
        var a = new THREE.Vector3(0, 1, 0);
        return function(b) {
            return this.translateOnAxis(a, b);
        };
    }(),
    translateZ: function() {
        var a = new THREE.Vector3(0, 0, 1);
        return function(b) {
            return this.translateOnAxis(a, b);
        };
    }(),
    localToWorld: function(a) {
        return a.applyMatrix4(this.matrixWorld);
    },
    worldToLocal: function() {
        var a = new THREE.Matrix4();
        return function(b) {
            return b.applyMatrix4(a.getInverse(this.matrixWorld));
        };
    }(),
    lookAt: function() {
        var a = new THREE.Matrix4();
        return function(b) {
            a.lookAt(b, this.position, this.up), this.quaternion.setFromRotationMatrix(a);
        };
    }(),
    add: function(a) {
        if (1 < arguments.length) {
            for (var b = 0; b < arguments.length; b++) this.add(arguments[b]);
            return this;
        }
        return a === this ? (THREE.error("THREE.Object3D.add: object can't be added as a child of itself.", a), 
        this) : (a instanceof THREE.Object3D ? (void 0 !== a.parent && a.parent.remove(a), 
        a.parent = this, a.dispatchEvent({
            type: "added"
        }), this.children.push(a)) : THREE.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", a), 
        this);
    },
    remove: function(a) {
        if (1 < arguments.length) for (var b = 0; b < arguments.length; b++) this.remove(arguments[b]);
        b = this.children.indexOf(a), -1 !== b && (a.parent = void 0, a.dispatchEvent({
            type: "removed"
        }), this.children.splice(b, 1));
    },
    getChildByName: function(a) {
        return THREE.warn("THREE.Object3D: .getChildByName() has been renamed to .getObjectByName()."), 
        this.getObjectByName(a);
    },
    getObjectById: function(a) {
        return this.getObjectByProperty("id", a);
    },
    getObjectByName: function(a) {
        return this.getObjectByProperty("name", a);
    },
    getObjectByProperty: function(a, b) {
        if (this[a] === b) return this;
        for (var c = 0, d = this.children.length; d > c; c++) {
            var e = this.children[c].getObjectByProperty(a, b);
            if (void 0 !== e) return e;
        }
    },
    getWorldPosition: function(a) {
        return a = a || new THREE.Vector3(), this.updateMatrixWorld(!0), a.setFromMatrixPosition(this.matrixWorld);
    },
    getWorldQuaternion: function() {
        var a = new THREE.Vector3(), b = new THREE.Vector3();
        return function(c) {
            return c = c || new THREE.Quaternion(), this.updateMatrixWorld(!0), this.matrixWorld.decompose(a, c, b), 
            c;
        };
    }(),
    getWorldRotation: function() {
        var a = new THREE.Quaternion();
        return function(b) {
            return b = b || new THREE.Euler(), this.getWorldQuaternion(a), b.setFromQuaternion(a, this.rotation.order, !1);
        };
    }(),
    getWorldScale: function() {
        var a = new THREE.Vector3(), b = new THREE.Quaternion();
        return function(c) {
            return c = c || new THREE.Vector3(), this.updateMatrixWorld(!0), this.matrixWorld.decompose(a, b, c), 
            c;
        };
    }(),
    getWorldDirection: function() {
        var a = new THREE.Quaternion();
        return function(b) {
            return b = b || new THREE.Vector3(), this.getWorldQuaternion(a), b.set(0, 0, 1).applyQuaternion(a);
        };
    }(),
    raycast: function() {},
    traverse: function(a) {
        a(this);
        for (var b = 0, c = this.children.length; c > b; b++) this.children[b].traverse(a);
    },
    traverseVisible: function(a) {
        if (!1 !== this.visible) {
            a(this);
            for (var b = 0, c = this.children.length; c > b; b++) this.children[b].traverseVisible(a);
        }
    },
    traverseAncestors: function(a) {
        this.parent && (a(this.parent), this.parent.traverseAncestors(a));
    },
    updateMatrix: function() {
        this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
    },
    updateMatrixWorld: function(a) {
        !0 === this.matrixAutoUpdate && this.updateMatrix(), (!0 === this.matrixWorldNeedsUpdate || !0 === a) && (void 0 === this.parent ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), 
        this.matrixWorldNeedsUpdate = !1, a = !0);
        for (var b = 0, c = this.children.length; c > b; b++) this.children[b].updateMatrixWorld(a);
    },
    toJSON: function() {
        var a = {
            metadata: {
                version: 4.3,
                type: "Object",
                generator: "ObjectExporter"
            }
        }, b = {}, c = {}, d = function(b) {
            if (void 0 === a.materials && (a.materials = []), void 0 === c[b.uuid]) {
                var d = b.toJSON();
                delete d.metadata, c[b.uuid] = d, a.materials.push(d);
            }
            return b.uuid;
        }, e = function(c) {
            var f = {};
            if (f.uuid = c.uuid, f.type = c.type, "" !== c.name && (f.name = c.name), "{}" !== JSON.stringify(c.userData) && (f.userData = c.userData), 
            !0 !== c.visible && (f.visible = c.visible), c instanceof THREE.PerspectiveCamera) f.fov = c.fov, 
            f.aspect = c.aspect, f.near = c.near, f.far = c.far; else if (c instanceof THREE.OrthographicCamera) f.left = c.left, 
            f.right = c.right, f.top = c.top, f.bottom = c.bottom, f.near = c.near, f.far = c.far; else if (c instanceof THREE.AmbientLight) f.color = c.color.getHex(); else if (c instanceof THREE.DirectionalLight) f.color = c.color.getHex(), 
            f.intensity = c.intensity; else if (c instanceof THREE.PointLight) f.color = c.color.getHex(), 
            f.intensity = c.intensity, f.distance = c.distance, f.decay = c.decay; else if (c instanceof THREE.SpotLight) f.color = c.color.getHex(), 
            f.intensity = c.intensity, f.distance = c.distance, f.angle = c.angle, f.exponent = c.exponent, 
            f.decay = c.decay; else if (c instanceof THREE.HemisphereLight) f.color = c.color.getHex(), 
            f.groundColor = c.groundColor.getHex(); else if (c instanceof THREE.Mesh || c instanceof THREE.Line || c instanceof THREE.PointCloud) {
                var g = c.geometry;
                if (void 0 === a.geometries && (a.geometries = []), void 0 === b[g.uuid]) {
                    var h = g.toJSON();
                    delete h.metadata, b[g.uuid] = h, a.geometries.push(h);
                }
                f.geometry = g.uuid, f.material = d(c.material), c instanceof THREE.Line && (f.mode = c.mode);
            } else c instanceof THREE.Sprite && (f.material = d(c.material));
            if (f.matrix = c.matrix.toArray(), 0 < c.children.length) for (f.children = [], 
            g = 0; g < c.children.length; g++) f.children.push(e(c.children[g]));
            return f;
        };
        return a.object = e(this), a;
    },
    clone: function(a, b) {
        if (void 0 === a && (a = new THREE.Object3D()), void 0 === b && (b = !0), a.name = this.name, 
        a.up.copy(this.up), a.position.copy(this.position), a.quaternion.copy(this.quaternion), 
        a.scale.copy(this.scale), a.rotationAutoUpdate = this.rotationAutoUpdate, a.matrix.copy(this.matrix), 
        a.matrixWorld.copy(this.matrixWorld), a.matrixAutoUpdate = this.matrixAutoUpdate, 
        a.matrixWorldNeedsUpdate = this.matrixWorldNeedsUpdate, a.visible = this.visible, 
        a.castShadow = this.castShadow, a.receiveShadow = this.receiveShadow, a.frustumCulled = this.frustumCulled, 
        a.userData = JSON.parse(JSON.stringify(this.userData)), !0 === b) for (var c = 0; c < this.children.length; c++) a.add(this.children[c].clone());
        return a;
    }
}, THREE.EventDispatcher.prototype.apply(THREE.Object3D.prototype), THREE.Object3DIdCount = 0, 
THREE.Face3 = function(a, b, c, d, e, f) {
    this.a = a, this.b = b, this.c = c, this.normal = d instanceof THREE.Vector3 ? d : new THREE.Vector3(), 
    this.vertexNormals = d instanceof Array ? d : [], this.color = e instanceof THREE.Color ? e : new THREE.Color(), 
    this.vertexColors = e instanceof Array ? e : [], this.vertexTangents = [], this.materialIndex = void 0 !== f ? f : 0;
}, THREE.Face3.prototype = {
    constructor: THREE.Face3,
    clone: function() {
        var a = new THREE.Face3(this.a, this.b, this.c);
        a.normal.copy(this.normal), a.color.copy(this.color), a.materialIndex = this.materialIndex;
        for (var b = 0, c = this.vertexNormals.length; c > b; b++) a.vertexNormals[b] = this.vertexNormals[b].clone();
        for (b = 0, c = this.vertexColors.length; c > b; b++) a.vertexColors[b] = this.vertexColors[b].clone();
        for (b = 0, c = this.vertexTangents.length; c > b; b++) a.vertexTangents[b] = this.vertexTangents[b].clone();
        return a;
    }
}, THREE.Face4 = function(a, b, c, d, e, f, g) {
    return THREE.warn("THREE.Face4 has been removed. A THREE.Face3 will be created instead."), 
    new THREE.Face3(a, b, c, e, f, g);
}, THREE.BufferAttribute = function(a, b) {
    this.array = a, this.itemSize = b, this.needsUpdate = !1;
}, THREE.BufferAttribute.prototype = {
    constructor: THREE.BufferAttribute,
    get length() {
        return this.array.length;
    },
    copyAt: function(a, b, c) {
        a *= this.itemSize, c *= b.itemSize;
        for (var d = 0, e = this.itemSize; e > d; d++) this.array[a + d] = b.array[c + d];
        return this;
    },
    set: function(a, b) {
        return void 0 === b && (b = 0), this.array.set(a, b), this;
    },
    setX: function(a, b) {
        return this.array[a * this.itemSize] = b, this;
    },
    setY: function(a, b) {
        return this.array[a * this.itemSize + 1] = b, this;
    },
    setZ: function(a, b) {
        return this.array[a * this.itemSize + 2] = b, this;
    },
    setXY: function(a, b, c) {
        return a *= this.itemSize, this.array[a] = b, this.array[a + 1] = c, this;
    },
    setXYZ: function(a, b, c, d) {
        return a *= this.itemSize, this.array[a] = b, this.array[a + 1] = c, this.array[a + 2] = d, 
        this;
    },
    setXYZW: function(a, b, c, d, e) {
        return a *= this.itemSize, this.array[a] = b, this.array[a + 1] = c, this.array[a + 2] = d, 
        this.array[a + 3] = e, this;
    },
    clone: function() {
        return new THREE.BufferAttribute(new this.array.constructor(this.array), this.itemSize);
    }
}, THREE.Int8Attribute = function(a, b) {
    return THREE.warn("THREE.Int8Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), 
    new THREE.BufferAttribute(a, b);
}, THREE.Uint8Attribute = function(a, b) {
    return THREE.warn("THREE.Uint8Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), 
    new THREE.BufferAttribute(a, b);
}, THREE.Uint8ClampedAttribute = function(a, b) {
    return THREE.warn("THREE.Uint8ClampedAttribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), 
    new THREE.BufferAttribute(a, b);
}, THREE.Int16Attribute = function(a, b) {
    return THREE.warn("THREE.Int16Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), 
    new THREE.BufferAttribute(a, b);
}, THREE.Uint16Attribute = function(a, b) {
    return THREE.warn("THREE.Uint16Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), 
    new THREE.BufferAttribute(a, b);
}, THREE.Int32Attribute = function(a, b) {
    return THREE.warn("THREE.Int32Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), 
    new THREE.BufferAttribute(a, b);
}, THREE.Uint32Attribute = function(a, b) {
    return THREE.warn("THREE.Uint32Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), 
    new THREE.BufferAttribute(a, b);
}, THREE.Float32Attribute = function(a, b) {
    return THREE.warn("THREE.Float32Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), 
    new THREE.BufferAttribute(a, b);
}, THREE.Float64Attribute = function(a, b) {
    return THREE.warn("THREE.Float64Attribute has been removed. Use THREE.BufferAttribute( array, itemSize ) instead."), 
    new THREE.BufferAttribute(a, b);
}, THREE.DynamicBufferAttribute = function(a, b) {
    THREE.BufferAttribute.call(this, a, b), this.updateRange = {
        offset: 0,
        count: -1
    };
}, THREE.DynamicBufferAttribute.prototype = Object.create(THREE.BufferAttribute.prototype), 
THREE.DynamicBufferAttribute.prototype.constructor = THREE.DynamicBufferAttribute, 
THREE.DynamicBufferAttribute.prototype.clone = function() {
    return new THREE.DynamicBufferAttribute(new this.array.constructor(this.array), this.itemSize);
}, THREE.BufferGeometry = function() {
    Object.defineProperty(this, "id", {
        value: THREE.GeometryIdCount++
    }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "BufferGeometry", 
    this.attributes = {}, this.attributesKeys = [], this.offsets = this.drawcalls = [], 
    this.boundingSphere = this.boundingBox = null;
}, THREE.BufferGeometry.prototype = {
    constructor: THREE.BufferGeometry,
    addAttribute: function(a, b, c) {
        !1 == b instanceof THREE.BufferAttribute ? (THREE.warn("THREE.BufferGeometry: .addAttribute() now expects ( name, attribute )."), 
        this.attributes[a] = {
            array: b,
            itemSize: c
        }) : (this.attributes[a] = b, this.attributesKeys = Object.keys(this.attributes));
    },
    getAttribute: function(a) {
        return this.attributes[a];
    },
    addDrawCall: function(a, b, c) {
        this.drawcalls.push({
            start: a,
            count: b,
            index: void 0 !== c ? c : 0
        });
    },
    applyMatrix: function(a) {
        var b = this.attributes.position;
        void 0 !== b && (a.applyToVector3Array(b.array), b.needsUpdate = !0), b = this.attributes.normal, 
        void 0 !== b && (new THREE.Matrix3().getNormalMatrix(a).applyToVector3Array(b.array), 
        b.needsUpdate = !0), null !== this.boundingBox && this.computeBoundingBox(), null !== this.boundingSphere && this.computeBoundingSphere();
    },
    center: function() {
        this.computeBoundingBox();
        var a = this.boundingBox.center().negate();
        return this.applyMatrix(new THREE.Matrix4().setPosition(a)), a;
    },
    fromGeometry: function(a, b) {
        b = b || {
            vertexColors: THREE.NoColors
        };
        var c = a.vertices, d = a.faces, e = a.faceVertexUvs, f = b.vertexColors, g = 0 < e[0].length, h = 3 == d[0].vertexNormals.length, i = new Float32Array(9 * d.length);
        this.addAttribute("position", new THREE.BufferAttribute(i, 3));
        var j = new Float32Array(9 * d.length);
        if (this.addAttribute("normal", new THREE.BufferAttribute(j, 3)), f !== THREE.NoColors) {
            var k = new Float32Array(9 * d.length);
            this.addAttribute("color", new THREE.BufferAttribute(k, 3));
        }
        if (!0 === g) {
            var l = new Float32Array(6 * d.length);
            this.addAttribute("uv", new THREE.BufferAttribute(l, 2));
        }
        for (var m = 0, n = 0, o = 0; m < d.length; m++, n += 6, o += 9) {
            var p = d[m], q = c[p.a], r = c[p.b], s = c[p.c];
            i[o] = q.x, i[o + 1] = q.y, i[o + 2] = q.z, i[o + 3] = r.x, i[o + 4] = r.y, i[o + 5] = r.z, 
            i[o + 6] = s.x, i[o + 7] = s.y, i[o + 8] = s.z, !0 === h ? (q = p.vertexNormals[0], 
            r = p.vertexNormals[1], s = p.vertexNormals[2], j[o] = q.x, j[o + 1] = q.y, j[o + 2] = q.z, 
            j[o + 3] = r.x, j[o + 4] = r.y, j[o + 5] = r.z, j[o + 6] = s.x, j[o + 7] = s.y, 
            j[o + 8] = s.z) : (q = p.normal, j[o] = q.x, j[o + 1] = q.y, j[o + 2] = q.z, j[o + 3] = q.x, 
            j[o + 4] = q.y, j[o + 5] = q.z, j[o + 6] = q.x, j[o + 7] = q.y, j[o + 8] = q.z), 
            f === THREE.FaceColors ? (p = p.color, k[o] = p.r, k[o + 1] = p.g, k[o + 2] = p.b, 
            k[o + 3] = p.r, k[o + 4] = p.g, k[o + 5] = p.b, k[o + 6] = p.r, k[o + 7] = p.g, 
            k[o + 8] = p.b) : f === THREE.VertexColors && (q = p.vertexColors[0], r = p.vertexColors[1], 
            p = p.vertexColors[2], k[o] = q.r, k[o + 1] = q.g, k[o + 2] = q.b, k[o + 3] = r.r, 
            k[o + 4] = r.g, k[o + 5] = r.b, k[o + 6] = p.r, k[o + 7] = p.g, k[o + 8] = p.b), 
            !0 === g && (p = e[0][m][0], q = e[0][m][1], r = e[0][m][2], l[n] = p.x, l[n + 1] = p.y, 
            l[n + 2] = q.x, l[n + 3] = q.y, l[n + 4] = r.x, l[n + 5] = r.y);
        }
        return this.computeBoundingSphere(), this;
    },
    computeBoundingBox: function() {
        var a = new THREE.Vector3();
        return function() {
            null === this.boundingBox && (this.boundingBox = new THREE.Box3());
            var b = this.attributes.position.array;
            if (b) {
                var c = this.boundingBox;
                c.makeEmpty();
                for (var d = 0, e = b.length; e > d; d += 3) a.set(b[d], b[d + 1], b[d + 2]), c.expandByPoint(a);
            }
            (void 0 === b || 0 === b.length) && (this.boundingBox.min.set(0, 0, 0), this.boundingBox.max.set(0, 0, 0)), 
            (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && THREE.error('THREE.BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The "position" attribute is likely to have NaN values.');
        };
    }(),
    computeBoundingSphere: function() {
        var a = new THREE.Box3(), b = new THREE.Vector3();
        return function() {
            null === this.boundingSphere && (this.boundingSphere = new THREE.Sphere());
            var c = this.attributes.position.array;
            if (c) {
                a.makeEmpty();
                for (var d = this.boundingSphere.center, e = 0, f = c.length; f > e; e += 3) b.set(c[e], c[e + 1], c[e + 2]), 
                a.expandByPoint(b);
                a.center(d);
                for (var g = 0, e = 0, f = c.length; f > e; e += 3) b.set(c[e], c[e + 1], c[e + 2]), 
                g = Math.max(g, d.distanceToSquared(b));
                this.boundingSphere.radius = Math.sqrt(g), isNaN(this.boundingSphere.radius) && THREE.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.');
            }
        };
    }(),
    computeFaceNormals: function() {},
    computeVertexNormals: function() {
        var a = this.attributes;
        if (a.position) {
            var b = a.position.array;
            if (void 0 === a.normal) this.addAttribute("normal", new THREE.BufferAttribute(new Float32Array(b.length), 3)); else for (var c = a.normal.array, d = 0, e = c.length; e > d; d++) c[d] = 0;
            var f, g, h, c = a.normal.array, i = new THREE.Vector3(), j = new THREE.Vector3(), k = new THREE.Vector3(), l = new THREE.Vector3(), m = new THREE.Vector3();
            if (a.index) for (var n = a.index.array, o = 0 < this.offsets.length ? this.offsets : [ {
                start: 0,
                count: n.length,
                index: 0
            } ], p = 0, q = o.length; q > p; ++p) {
                e = o[p].start, f = o[p].count;
                for (var r = o[p].index, d = e, e = e + f; e > d; d += 3) f = 3 * (r + n[d]), g = 3 * (r + n[d + 1]), 
                h = 3 * (r + n[d + 2]), i.fromArray(b, f), j.fromArray(b, g), k.fromArray(b, h), 
                l.subVectors(k, j), m.subVectors(i, j), l.cross(m), c[f] += l.x, c[f + 1] += l.y, 
                c[f + 2] += l.z, c[g] += l.x, c[g + 1] += l.y, c[g + 2] += l.z, c[h] += l.x, c[h + 1] += l.y, 
                c[h + 2] += l.z;
            } else for (d = 0, e = b.length; e > d; d += 9) i.fromArray(b, d), j.fromArray(b, d + 3), 
            k.fromArray(b, d + 6), l.subVectors(k, j), m.subVectors(i, j), l.cross(m), c[d] = l.x, 
            c[d + 1] = l.y, c[d + 2] = l.z, c[d + 3] = l.x, c[d + 4] = l.y, c[d + 5] = l.z, 
            c[d + 6] = l.x, c[d + 7] = l.y, c[d + 8] = l.z;
            this.normalizeNormals(), a.normal.needsUpdate = !0;
        }
    },
    computeTangents: function() {
        function a(a, b, c) {
            B.fromArray(d, 3 * a), C.fromArray(d, 3 * b), D.fromArray(d, 3 * c), E.fromArray(f, 2 * a), 
            F.fromArray(f, 2 * b), G.fromArray(f, 2 * c), l = C.x - B.x, m = D.x - B.x, n = C.y - B.y, 
            o = D.y - B.y, p = C.z - B.z, q = D.z - B.z, r = F.x - E.x, s = G.x - E.x, t = F.y - E.y, 
            u = G.y - E.y, v = 1 / (r * u - s * t), H.set((u * l - t * m) * v, (u * n - t * o) * v, (u * p - t * q) * v), 
            I.set((r * m - s * l) * v, (r * o - s * n) * v, (r * q - s * p) * v), i[a].add(H), 
            i[b].add(H), i[c].add(H), j[a].add(I), j[b].add(I), j[c].add(I);
        }
        function b(a) {
            Q.fromArray(e, 3 * a), R.copy(Q), M = i[a], O.copy(M), O.sub(Q.multiplyScalar(Q.dot(M))).normalize(), 
            P.crossVectors(R, M), N = P.dot(j[a]), L = 0 > N ? -1 : 1, h[4 * a] = O.x, h[4 * a + 1] = O.y, 
            h[4 * a + 2] = O.z, h[4 * a + 3] = L;
        }
        if (void 0 === this.attributes.index || void 0 === this.attributes.position || void 0 === this.attributes.normal || void 0 === this.attributes.uv) THREE.warn("THREE.BufferGeometry: Missing required attributes (index, position, normal or uv) in BufferGeometry.computeTangents()"); else {
            var c = this.attributes.index.array, d = this.attributes.position.array, e = this.attributes.normal.array, f = this.attributes.uv.array, g = d.length / 3;
            void 0 === this.attributes.tangent && this.addAttribute("tangent", new THREE.BufferAttribute(new Float32Array(4 * g), 4));
            for (var h = this.attributes.tangent.array, i = [], j = [], k = 0; g > k; k++) i[k] = new THREE.Vector3(), 
            j[k] = new THREE.Vector3();
            var l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B = new THREE.Vector3(), C = new THREE.Vector3(), D = new THREE.Vector3(), E = new THREE.Vector2(), F = new THREE.Vector2(), G = new THREE.Vector2(), H = new THREE.Vector3(), I = new THREE.Vector3();
            0 === this.drawcalls.length && this.addDrawCall(0, c.length, 0);
            var J = this.drawcalls, k = 0;
            for (x = J.length; x > k; ++k) {
                w = J[k].start, y = J[k].count;
                var K = J[k].index, g = w;
                for (w += y; w > g; g += 3) y = K + c[g], z = K + c[g + 1], A = K + c[g + 2], a(y, z, A);
            }
            var L, M, N, O = new THREE.Vector3(), P = new THREE.Vector3(), Q = new THREE.Vector3(), R = new THREE.Vector3(), k = 0;
            for (x = J.length; x > k; ++k) for (w = J[k].start, y = J[k].count, K = J[k].index, 
            g = w, w += y; w > g; g += 3) y = K + c[g], z = K + c[g + 1], A = K + c[g + 2], 
            b(y), b(z), b(A);
        }
    },
    computeOffsets: function(a) {
        void 0 === a && (a = 65535);
        for (var b = this.attributes.index.array, c = this.attributes.position.array, d = b.length / 3, e = new Uint16Array(b.length), f = 0, g = 0, h = [ {
            start: 0,
            count: 0,
            index: 0
        } ], i = h[0], j = 0, k = 0, l = new Int32Array(6), m = new Int32Array(c.length), n = new Int32Array(c.length), o = 0; o < c.length; o++) m[o] = -1, 
        n[o] = -1;
        for (c = 0; d > c; c++) {
            for (var p = k = 0; 3 > p; p++) o = b[3 * c + p], -1 == m[o] ? (l[2 * p] = o, l[2 * p + 1] = -1, 
            k++) : m[o] < i.index ? (l[2 * p] = o, l[2 * p + 1] = -1, j++) : (l[2 * p] = o, 
            l[2 * p + 1] = m[o]);
            if (g + k > i.index + a) for (i = {
                start: f,
                count: 0,
                index: g
            }, h.push(i), k = 0; 6 > k; k += 2) p = l[k + 1], p > -1 && p < i.index && (l[k + 1] = -1);
            for (k = 0; 6 > k; k += 2) o = l[k], p = l[k + 1], -1 === p && (p = g++), m[o] = p, 
            n[p] = o, e[f++] = p - i.index, i.count++;
        }
        return this.reorderBuffers(e, n, g), this.drawcalls = this.offsets = h;
    },
    merge: function(a, b) {
        if (!1 != a instanceof THREE.BufferGeometry) {
            void 0 === b && (b = 0);
            var c, d = this.attributes;
            for (c in d) if (void 0 !== a.attributes[c]) for (var e = d[c].array, f = a.attributes[c], g = f.array, h = 0, f = f.itemSize * b; h < g.length; h++, 
            f++) e[f] = g[h];
            return this;
        }
        THREE.error("THREE.BufferGeometry.merge(): geometry not an instance of THREE.BufferGeometry.", a);
    },
    normalizeNormals: function() {
        for (var a, b, c, d = this.attributes.normal.array, e = 0, f = d.length; f > e; e += 3) a = d[e], 
        b = d[e + 1], c = d[e + 2], a = 1 / Math.sqrt(a * a + b * b + c * c), d[e] *= a, 
        d[e + 1] *= a, d[e + 2] *= a;
    },
    reorderBuffers: function(a, b, c) {
        var d, e = {};
        for (d in this.attributes) "index" != d && (e[d] = new this.attributes[d].array.constructor(this.attributes[d].itemSize * c));
        for (var f = 0; c > f; f++) {
            var g = b[f];
            for (d in this.attributes) if ("index" != d) for (var h = this.attributes[d].array, i = this.attributes[d].itemSize, j = e[d], k = 0; i > k; k++) j[f * i + k] = h[g * i + k];
        }
        this.attributes.index.array = a;
        for (d in this.attributes) "index" != d && (this.attributes[d].array = e[d], this.attributes[d].numItems = this.attributes[d].itemSize * c);
    },
    toJSON: function() {
        var a, b = {
            metadata: {
                version: 4,
                type: "BufferGeometry",
                generator: "BufferGeometryExporter"
            },
            uuid: this.uuid,
            type: this.type,
            data: {
                attributes: {}
            }
        }, c = this.attributes, d = this.offsets, e = this.boundingSphere;
        for (a in c) {
            var f = c[a], g = Array.prototype.slice.call(f.array);
            b.data.attributes[a] = {
                itemSize: f.itemSize,
                type: f.array.constructor.name,
                array: g
            };
        }
        return 0 < d.length && (b.data.offsets = JSON.parse(JSON.stringify(d))), null !== e && (b.data.boundingSphere = {
            center: e.center.toArray(),
            radius: e.radius
        }), b;
    },
    clone: function() {
        var a, b = new THREE.BufferGeometry();
        for (a in this.attributes) b.addAttribute(a, this.attributes[a].clone());
        a = 0;
        for (var c = this.offsets.length; c > a; a++) {
            var d = this.offsets[a];
            b.offsets.push({
                start: d.start,
                index: d.index,
                count: d.count
            });
        }
        return b;
    },
    dispose: function() {
        this.dispatchEvent({
            type: "dispose"
        });
    }
}, THREE.EventDispatcher.prototype.apply(THREE.BufferGeometry.prototype), THREE.Geometry = function() {
    Object.defineProperty(this, "id", {
        value: THREE.GeometryIdCount++
    }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Geometry", 
    this.vertices = [], this.colors = [], this.faces = [], this.faceVertexUvs = [ [] ], 
    this.morphTargets = [], this.morphColors = [], this.morphNormals = [], this.skinWeights = [], 
    this.skinIndices = [], this.lineDistances = [], this.boundingSphere = this.boundingBox = null, 
    this.hasTangents = !1, this.dynamic = !0, this.groupsNeedUpdate = this.lineDistancesNeedUpdate = this.colorsNeedUpdate = this.tangentsNeedUpdate = this.normalsNeedUpdate = this.uvsNeedUpdate = this.elementsNeedUpdate = this.verticesNeedUpdate = !1;
}, THREE.Geometry.prototype = {
    constructor: THREE.Geometry,
    applyMatrix: function(a) {
        for (var b = new THREE.Matrix3().getNormalMatrix(a), c = 0, d = this.vertices.length; d > c; c++) this.vertices[c].applyMatrix4(a);
        for (c = 0, d = this.faces.length; d > c; c++) {
            a = this.faces[c], a.normal.applyMatrix3(b).normalize();
            for (var e = 0, f = a.vertexNormals.length; f > e; e++) a.vertexNormals[e].applyMatrix3(b).normalize();
        }
        null !== this.boundingBox && this.computeBoundingBox(), null !== this.boundingSphere && this.computeBoundingSphere(), 
        this.normalsNeedUpdate = this.verticesNeedUpdate = !0;
    },
    fromBufferGeometry: function(a) {
        for (var b = this, c = a.attributes, d = c.position.array, e = void 0 !== c.index ? c.index.array : void 0, f = void 0 !== c.normal ? c.normal.array : void 0, g = void 0 !== c.color ? c.color.array : void 0, h = void 0 !== c.uv ? c.uv.array : void 0, i = [], j = [], k = c = 0; c < d.length; c += 3, 
        k += 2) b.vertices.push(new THREE.Vector3(d[c], d[c + 1], d[c + 2])), void 0 !== f && i.push(new THREE.Vector3(f[c], f[c + 1], f[c + 2])), 
        void 0 !== g && b.colors.push(new THREE.Color(g[c], g[c + 1], g[c + 2])), void 0 !== h && j.push(new THREE.Vector2(h[k], h[k + 1]));
        var l = function(a, c, d) {
            var e = void 0 !== f ? [ i[a].clone(), i[c].clone(), i[d].clone() ] : [], k = void 0 !== g ? [ b.colors[a].clone(), b.colors[c].clone(), b.colors[d].clone() ] : [];
            b.faces.push(new THREE.Face3(a, c, d, e, k)), void 0 !== h && b.faceVertexUvs[0].push([ j[a].clone(), j[c].clone(), j[d].clone() ]);
        };
        if (void 0 !== e) if (d = a.drawcalls, 0 < d.length) for (c = 0; c < d.length; c++) for (var k = d[c], m = k.start, n = k.count, o = k.index, k = m, m = m + n; m > k; k += 3) l(o + e[k], o + e[k + 1], o + e[k + 2]); else for (c = 0; c < e.length; c += 3) l(e[c], e[c + 1], e[c + 2]); else for (c = 0; c < d.length / 3; c += 3) l(c, c + 1, c + 2);
        return this.computeFaceNormals(), null !== a.boundingBox && (this.boundingBox = a.boundingBox.clone()), 
        null !== a.boundingSphere && (this.boundingSphere = a.boundingSphere.clone()), this;
    },
    center: function() {
        this.computeBoundingBox();
        var a = this.boundingBox.center().negate();
        return this.applyMatrix(new THREE.Matrix4().setPosition(a)), a;
    },
    computeFaceNormals: function() {
        for (var a = new THREE.Vector3(), b = new THREE.Vector3(), c = 0, d = this.faces.length; d > c; c++) {
            var e = this.faces[c], f = this.vertices[e.a], g = this.vertices[e.b];
            a.subVectors(this.vertices[e.c], g), b.subVectors(f, g), a.cross(b), a.normalize(), 
            e.normal.copy(a);
        }
    },
    computeVertexNormals: function(a) {
        var b, c, d;
        for (d = Array(this.vertices.length), b = 0, c = this.vertices.length; c > b; b++) d[b] = new THREE.Vector3();
        if (a) {
            var e, f, g, h = new THREE.Vector3(), i = new THREE.Vector3();
            for (a = 0, b = this.faces.length; b > a; a++) c = this.faces[a], e = this.vertices[c.a], 
            f = this.vertices[c.b], g = this.vertices[c.c], h.subVectors(g, f), i.subVectors(e, f), 
            h.cross(i), d[c.a].add(h), d[c.b].add(h), d[c.c].add(h);
        } else for (a = 0, b = this.faces.length; b > a; a++) c = this.faces[a], d[c.a].add(c.normal), 
        d[c.b].add(c.normal), d[c.c].add(c.normal);
        for (b = 0, c = this.vertices.length; c > b; b++) d[b].normalize();
        for (a = 0, b = this.faces.length; b > a; a++) c = this.faces[a], c.vertexNormals[0] = d[c.a].clone(), 
        c.vertexNormals[1] = d[c.b].clone(), c.vertexNormals[2] = d[c.c].clone();
    },
    computeMorphNormals: function() {
        var a, b, c, d, e;
        for (c = 0, d = this.faces.length; d > c; c++) for (e = this.faces[c], e.__originalFaceNormal ? e.__originalFaceNormal.copy(e.normal) : e.__originalFaceNormal = e.normal.clone(), 
        e.__originalVertexNormals || (e.__originalVertexNormals = []), a = 0, b = e.vertexNormals.length; b > a; a++) e.__originalVertexNormals[a] ? e.__originalVertexNormals[a].copy(e.vertexNormals[a]) : e.__originalVertexNormals[a] = e.vertexNormals[a].clone();
        var f = new THREE.Geometry();
        for (f.faces = this.faces, a = 0, b = this.morphTargets.length; b > a; a++) {
            if (!this.morphNormals[a]) {
                this.morphNormals[a] = {}, this.morphNormals[a].faceNormals = [], this.morphNormals[a].vertexNormals = [], 
                e = this.morphNormals[a].faceNormals;
                var g, h, i = this.morphNormals[a].vertexNormals;
                for (c = 0, d = this.faces.length; d > c; c++) g = new THREE.Vector3(), h = {
                    a: new THREE.Vector3(),
                    b: new THREE.Vector3(),
                    c: new THREE.Vector3()
                }, e.push(g), i.push(h);
            }
            for (i = this.morphNormals[a], f.vertices = this.morphTargets[a].vertices, f.computeFaceNormals(), 
            f.computeVertexNormals(), c = 0, d = this.faces.length; d > c; c++) e = this.faces[c], 
            g = i.faceNormals[c], h = i.vertexNormals[c], g.copy(e.normal), h.a.copy(e.vertexNormals[0]), 
            h.b.copy(e.vertexNormals[1]), h.c.copy(e.vertexNormals[2]);
        }
        for (c = 0, d = this.faces.length; d > c; c++) e = this.faces[c], e.normal = e.__originalFaceNormal, 
        e.vertexNormals = e.__originalVertexNormals;
    },
    computeTangents: function() {
        var a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r = [], s = [];
        c = new THREE.Vector3();
        var t = new THREE.Vector3(), u = new THREE.Vector3(), v = new THREE.Vector3(), w = new THREE.Vector3();
        for (a = 0, b = this.vertices.length; b > a; a++) r[a] = new THREE.Vector3(), s[a] = new THREE.Vector3();
        for (a = 0, b = this.faces.length; b > a; a++) e = this.faces[a], f = this.faceVertexUvs[0][a], 
        d = e.a, q = e.b, e = e.c, g = this.vertices[d], h = this.vertices[q], i = this.vertices[e], 
        j = f[0], k = f[1], l = f[2], f = h.x - g.x, m = i.x - g.x, n = h.y - g.y, o = i.y - g.y, 
        h = h.z - g.z, g = i.z - g.z, i = k.x - j.x, p = l.x - j.x, k = k.y - j.y, j = l.y - j.y, 
        l = 1 / (i * j - p * k), c.set((j * f - k * m) * l, (j * n - k * o) * l, (j * h - k * g) * l), 
        t.set((i * m - p * f) * l, (i * o - p * n) * l, (i * g - p * h) * l), r[d].add(c), 
        r[q].add(c), r[e].add(c), s[d].add(t), s[q].add(t), s[e].add(t);
        for (t = [ "a", "b", "c", "d" ], a = 0, b = this.faces.length; b > a; a++) for (e = this.faces[a], 
        c = 0; c < Math.min(e.vertexNormals.length, 3); c++) w.copy(e.vertexNormals[c]), 
        d = e[t[c]], q = r[d], u.copy(q), u.sub(w.multiplyScalar(w.dot(q))).normalize(), 
        v.crossVectors(e.vertexNormals[c], q), d = v.dot(s[d]), d = 0 > d ? -1 : 1, e.vertexTangents[c] = new THREE.Vector4(u.x, u.y, u.z, d);
        this.hasTangents = !0;
    },
    computeLineDistances: function() {
        for (var a = 0, b = this.vertices, c = 0, d = b.length; d > c; c++) c > 0 && (a += b[c].distanceTo(b[c - 1])), 
        this.lineDistances[c] = a;
    },
    computeBoundingBox: function() {
        null === this.boundingBox && (this.boundingBox = new THREE.Box3()), this.boundingBox.setFromPoints(this.vertices);
    },
    computeBoundingSphere: function() {
        null === this.boundingSphere && (this.boundingSphere = new THREE.Sphere()), this.boundingSphere.setFromPoints(this.vertices);
    },
    merge: function(a, b, c) {
        if (!1 == a instanceof THREE.Geometry) THREE.error("THREE.Geometry.merge(): geometry not an instance of THREE.Geometry.", a); else {
            var d, e = this.vertices.length, f = this.vertices, g = a.vertices, h = this.faces, i = a.faces, j = this.faceVertexUvs[0];
            a = a.faceVertexUvs[0], void 0 === c && (c = 0), void 0 !== b && (d = new THREE.Matrix3().getNormalMatrix(b));
            for (var k = 0, l = g.length; l > k; k++) {
                var m = g[k].clone();
                void 0 !== b && m.applyMatrix4(b), f.push(m);
            }
            for (k = 0, l = i.length; l > k; k++) {
                var n, g = i[k], o = g.vertexNormals, p = g.vertexColors, m = new THREE.Face3(g.a + e, g.b + e, g.c + e);
                for (m.normal.copy(g.normal), void 0 !== d && m.normal.applyMatrix3(d).normalize(), 
                b = 0, f = o.length; f > b; b++) n = o[b].clone(), void 0 !== d && n.applyMatrix3(d).normalize(), 
                m.vertexNormals.push(n);
                for (m.color.copy(g.color), b = 0, f = p.length; f > b; b++) n = p[b], m.vertexColors.push(n.clone());
                m.materialIndex = g.materialIndex + c, h.push(m);
            }
            for (k = 0, l = a.length; l > k; k++) if (c = a[k], d = [], void 0 !== c) {
                for (b = 0, f = c.length; f > b; b++) d.push(c[b].clone());
                j.push(d);
            }
        }
    },
    mergeMesh: function(a) {
        !1 == a instanceof THREE.Mesh ? THREE.error("THREE.Geometry.mergeMesh(): mesh not an instance of THREE.Mesh.", a) : (a.matrixAutoUpdate && a.updateMatrix(), 
        this.merge(a.geometry, a.matrix));
    },
    mergeVertices: function() {
        var a, b, c, d = {}, e = [], f = [], g = Math.pow(10, 4);
        for (b = 0, c = this.vertices.length; c > b; b++) a = this.vertices[b], a = Math.round(a.x * g) + "_" + Math.round(a.y * g) + "_" + Math.round(a.z * g), 
        void 0 === d[a] ? (d[a] = b, e.push(this.vertices[b]), f[b] = e.length - 1) : f[b] = f[d[a]];
        for (d = [], b = 0, c = this.faces.length; c > b; b++) for (g = this.faces[b], g.a = f[g.a], 
        g.b = f[g.b], g.c = f[g.c], g = [ g.a, g.b, g.c ], a = 0; 3 > a; a++) if (g[a] == g[(a + 1) % 3]) {
            d.push(b);
            break;
        }
        for (b = d.length - 1; b >= 0; b--) for (g = d[b], this.faces.splice(g, 1), f = 0, 
        c = this.faceVertexUvs.length; c > f; f++) this.faceVertexUvs[f].splice(g, 1);
        return b = this.vertices.length - e.length, this.vertices = e, b;
    },
    toJSON: function() {
        function a(a, b, c) {
            return c ? a | 1 << b : a & ~(1 << b);
        }
        function b(a) {
            var b = a.x.toString() + a.y.toString() + a.z.toString();
            return void 0 !== j[b] ? j[b] : (j[b] = i.length / 3, i.push(a.x, a.y, a.z), j[b]);
        }
        function c(a) {
            var b = a.r.toString() + a.g.toString() + a.b.toString();
            return void 0 !== l[b] ? l[b] : (l[b] = k.length, k.push(a.getHex()), l[b]);
        }
        function d(a) {
            var b = a.x.toString() + a.y.toString();
            return void 0 !== n[b] ? n[b] : (n[b] = m.length / 2, m.push(a.x, a.y), n[b]);
        }
        var e = {
            metadata: {
                version: 4,
                type: "BufferGeometry",
                generator: "BufferGeometryExporter"
            },
            uuid: this.uuid,
            type: this.type
        };
        if ("" !== this.name && (e.name = this.name), void 0 !== this.parameters) {
            var f, g = this.parameters;
            for (f in g) void 0 !== g[f] && (e[f] = g[f]);
            return e;
        }
        for (g = [], f = 0; f < this.vertices.length; f++) {
            var h = this.vertices[f];
            g.push(h.x, h.y, h.z);
        }
        var h = [], i = [], j = {}, k = [], l = {}, m = [], n = {};
        for (f = 0; f < this.faces.length; f++) {
            var o = this.faces[f], p = void 0 !== this.faceVertexUvs[0][f], q = 0 < o.normal.length(), r = 0 < o.vertexNormals.length, s = 1 !== o.color.r || 1 !== o.color.g || 1 !== o.color.b, t = 0 < o.vertexColors.length, u = 0, u = a(u, 0, 0), u = a(u, 1, !1), u = a(u, 2, !1), u = a(u, 3, p), u = a(u, 4, q), u = a(u, 5, r), u = a(u, 6, s), u = a(u, 7, t);
            h.push(u), h.push(o.a, o.b, o.c), p && (p = this.faceVertexUvs[0][f], h.push(d(p[0]), d(p[1]), d(p[2]))), 
            q && h.push(b(o.normal)), r && (q = o.vertexNormals, h.push(b(q[0]), b(q[1]), b(q[2]))), 
            s && h.push(c(o.color)), t && (o = o.vertexColors, h.push(c(o[0]), c(o[1]), c(o[2])));
        }
        return e.data = {}, e.data.vertices = g, e.data.normals = i, 0 < k.length && (e.data.colors = k), 
        0 < m.length && (e.data.uvs = [ m ]), e.data.faces = h, e;
    },
    clone: function() {
        for (var a = new THREE.Geometry(), b = this.vertices, c = 0, d = b.length; d > c; c++) a.vertices.push(b[c].clone());
        for (b = this.faces, c = 0, d = b.length; d > c; c++) a.faces.push(b[c].clone());
        for (c = 0, d = this.faceVertexUvs.length; d > c; c++) {
            b = this.faceVertexUvs[c], void 0 === a.faceVertexUvs[c] && (a.faceVertexUvs[c] = []);
            for (var e = 0, f = b.length; f > e; e++) {
                for (var g = b[e], h = [], i = 0, j = g.length; j > i; i++) h.push(g[i].clone());
                a.faceVertexUvs[c].push(h);
            }
        }
        return a;
    },
    dispose: function() {
        this.dispatchEvent({
            type: "dispose"
        });
    }
}, THREE.EventDispatcher.prototype.apply(THREE.Geometry.prototype), THREE.GeometryIdCount = 0, 
THREE.Camera = function() {
    THREE.Object3D.call(this), this.type = "Camera", this.matrixWorldInverse = new THREE.Matrix4(), 
    this.projectionMatrix = new THREE.Matrix4();
}, THREE.Camera.prototype = Object.create(THREE.Object3D.prototype), THREE.Camera.prototype.constructor = THREE.Camera, 
THREE.Camera.prototype.getWorldDirection = function() {
    var a = new THREE.Quaternion();
    return function(b) {
        return b = b || new THREE.Vector3(), this.getWorldQuaternion(a), b.set(0, 0, -1).applyQuaternion(a);
    };
}(), THREE.Camera.prototype.lookAt = function() {
    var a = new THREE.Matrix4();
    return function(b) {
        a.lookAt(this.position, b, this.up), this.quaternion.setFromRotationMatrix(a);
    };
}(), THREE.Camera.prototype.clone = function(a) {
    return void 0 === a && (a = new THREE.Camera()), THREE.Object3D.prototype.clone.call(this, a), 
    a.matrixWorldInverse.copy(this.matrixWorldInverse), a.projectionMatrix.copy(this.projectionMatrix), 
    a;
}, THREE.CubeCamera = function(a, b, c) {
    THREE.Object3D.call(this), this.type = "CubeCamera";
    var d = new THREE.PerspectiveCamera(90, 1, a, b);
    d.up.set(0, -1, 0), d.lookAt(new THREE.Vector3(1, 0, 0)), this.add(d);
    var e = new THREE.PerspectiveCamera(90, 1, a, b);
    e.up.set(0, -1, 0), e.lookAt(new THREE.Vector3(-1, 0, 0)), this.add(e);
    var f = new THREE.PerspectiveCamera(90, 1, a, b);
    f.up.set(0, 0, 1), f.lookAt(new THREE.Vector3(0, 1, 0)), this.add(f);
    var g = new THREE.PerspectiveCamera(90, 1, a, b);
    g.up.set(0, 0, -1), g.lookAt(new THREE.Vector3(0, -1, 0)), this.add(g);
    var h = new THREE.PerspectiveCamera(90, 1, a, b);
    h.up.set(0, -1, 0), h.lookAt(new THREE.Vector3(0, 0, 1)), this.add(h);
    var i = new THREE.PerspectiveCamera(90, 1, a, b);
    i.up.set(0, -1, 0), i.lookAt(new THREE.Vector3(0, 0, -1)), this.add(i), this.renderTarget = new THREE.WebGLRenderTargetCube(c, c, {
        format: THREE.RGBFormat,
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter
    }), this.updateCubeMap = function(a, b) {
        var c = this.renderTarget, j = c.generateMipmaps;
        c.generateMipmaps = !1, c.activeCubeFace = 0, a.render(b, d, c), c.activeCubeFace = 1, 
        a.render(b, e, c), c.activeCubeFace = 2, a.render(b, f, c), c.activeCubeFace = 3, 
        a.render(b, g, c), c.activeCubeFace = 4, a.render(b, h, c), c.generateMipmaps = j, 
        c.activeCubeFace = 5, a.render(b, i, c);
    };
}, THREE.CubeCamera.prototype = Object.create(THREE.Object3D.prototype), THREE.CubeCamera.prototype.constructor = THREE.CubeCamera, 
THREE.OrthographicCamera = function(a, b, c, d, e, f) {
    THREE.Camera.call(this), this.type = "OrthographicCamera", this.zoom = 1, this.left = a, 
    this.right = b, this.top = c, this.bottom = d, this.near = void 0 !== e ? e : .1, 
    this.far = void 0 !== f ? f : 2e3, this.updateProjectionMatrix();
}, THREE.OrthographicCamera.prototype = Object.create(THREE.Camera.prototype), THREE.OrthographicCamera.prototype.constructor = THREE.OrthographicCamera, 
THREE.OrthographicCamera.prototype.updateProjectionMatrix = function() {
    var a = (this.right - this.left) / (2 * this.zoom), b = (this.top - this.bottom) / (2 * this.zoom), c = (this.right + this.left) / 2, d = (this.top + this.bottom) / 2;
    this.projectionMatrix.makeOrthographic(c - a, c + a, d + b, d - b, this.near, this.far);
}, THREE.OrthographicCamera.prototype.clone = function() {
    var a = new THREE.OrthographicCamera();
    return THREE.Camera.prototype.clone.call(this, a), a.zoom = this.zoom, a.left = this.left, 
    a.right = this.right, a.top = this.top, a.bottom = this.bottom, a.near = this.near, 
    a.far = this.far, a.projectionMatrix.copy(this.projectionMatrix), a;
}, THREE.PerspectiveCamera = function(a, b, c, d) {
    THREE.Camera.call(this), this.type = "PerspectiveCamera", this.zoom = 1, this.fov = void 0 !== a ? a : 50, 
    this.aspect = void 0 !== b ? b : 1, this.near = void 0 !== c ? c : .1, this.far = void 0 !== d ? d : 2e3, 
    this.updateProjectionMatrix();
}, THREE.PerspectiveCamera.prototype = Object.create(THREE.Camera.prototype), THREE.PerspectiveCamera.prototype.constructor = THREE.PerspectiveCamera, 
THREE.PerspectiveCamera.prototype.setLens = function(a, b) {
    void 0 === b && (b = 24), this.fov = 2 * THREE.Math.radToDeg(Math.atan(b / (2 * a))), 
    this.updateProjectionMatrix();
}, THREE.PerspectiveCamera.prototype.setViewOffset = function(a, b, c, d, e, f) {
    this.fullWidth = a, this.fullHeight = b, this.x = c, this.y = d, this.width = e, 
    this.height = f, this.updateProjectionMatrix();
}, THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function() {
    var a = THREE.Math.radToDeg(2 * Math.atan(Math.tan(.5 * THREE.Math.degToRad(this.fov)) / this.zoom));
    if (this.fullWidth) {
        var b = this.fullWidth / this.fullHeight, a = Math.tan(THREE.Math.degToRad(.5 * a)) * this.near, c = -a, d = b * c, b = Math.abs(b * a - d), c = Math.abs(a - c);
        this.projectionMatrix.makeFrustum(d + this.x * b / this.fullWidth, d + (this.x + this.width) * b / this.fullWidth, a - (this.y + this.height) * c / this.fullHeight, a - this.y * c / this.fullHeight, this.near, this.far);
    } else this.projectionMatrix.makePerspective(a, this.aspect, this.near, this.far);
}, THREE.PerspectiveCamera.prototype.clone = function() {
    var a = new THREE.PerspectiveCamera();
    return THREE.Camera.prototype.clone.call(this, a), a.zoom = this.zoom, a.fov = this.fov, 
    a.aspect = this.aspect, a.near = this.near, a.far = this.far, a.projectionMatrix.copy(this.projectionMatrix), 
    a;
}, THREE.Light = function(a) {
    THREE.Object3D.call(this), this.type = "Light", this.color = new THREE.Color(a);
}, THREE.Light.prototype = Object.create(THREE.Object3D.prototype), THREE.Light.prototype.constructor = THREE.Light, 
THREE.Light.prototype.clone = function(a) {
    return void 0 === a && (a = new THREE.Light()), THREE.Object3D.prototype.clone.call(this, a), 
    a.color.copy(this.color), a;
}, THREE.AmbientLight = function(a) {
    THREE.Light.call(this, a), this.type = "AmbientLight";
}, THREE.AmbientLight.prototype = Object.create(THREE.Light.prototype), THREE.AmbientLight.prototype.constructor = THREE.AmbientLight, 
THREE.AmbientLight.prototype.clone = function() {
    var a = new THREE.AmbientLight();
    return THREE.Light.prototype.clone.call(this, a), a;
}, THREE.AreaLight = function(a, b) {
    THREE.Light.call(this, a), this.type = "AreaLight", this.normal = new THREE.Vector3(0, -1, 0), 
    this.right = new THREE.Vector3(1, 0, 0), this.intensity = void 0 !== b ? b : 1, 
    this.height = this.width = 1, this.constantAttenuation = 1.5, this.linearAttenuation = .5, 
    this.quadraticAttenuation = .1;
}, THREE.AreaLight.prototype = Object.create(THREE.Light.prototype), THREE.AreaLight.prototype.constructor = THREE.AreaLight, 
THREE.DirectionalLight = function(a, b) {
    THREE.Light.call(this, a), this.type = "DirectionalLight", this.position.set(0, 1, 0), 
    this.target = new THREE.Object3D(), this.intensity = void 0 !== b ? b : 1, this.onlyShadow = this.castShadow = !1, 
    this.shadowCameraNear = 50, this.shadowCameraFar = 5e3, this.shadowCameraLeft = -500, 
    this.shadowCameraTop = this.shadowCameraRight = 500, this.shadowCameraBottom = -500, 
    this.shadowCameraVisible = !1, this.shadowBias = 0, this.shadowDarkness = .5, this.shadowMapHeight = this.shadowMapWidth = 512, 
    this.shadowCascade = !1, this.shadowCascadeOffset = new THREE.Vector3(0, 0, -1e3), 
    this.shadowCascadeCount = 2, this.shadowCascadeBias = [ 0, 0, 0 ], this.shadowCascadeWidth = [ 512, 512, 512 ], 
    this.shadowCascadeHeight = [ 512, 512, 512 ], this.shadowCascadeNearZ = [ -1, .99, .998 ], 
    this.shadowCascadeFarZ = [ .99, .998, 1 ], this.shadowCascadeArray = [], this.shadowMatrix = this.shadowCamera = this.shadowMapSize = this.shadowMap = null;
}, THREE.DirectionalLight.prototype = Object.create(THREE.Light.prototype), THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight, 
THREE.DirectionalLight.prototype.clone = function() {
    var a = new THREE.DirectionalLight();
    return THREE.Light.prototype.clone.call(this, a), a.target = this.target.clone(), 
    a.intensity = this.intensity, a.castShadow = this.castShadow, a.onlyShadow = this.onlyShadow, 
    a.shadowCameraNear = this.shadowCameraNear, a.shadowCameraFar = this.shadowCameraFar, 
    a.shadowCameraLeft = this.shadowCameraLeft, a.shadowCameraRight = this.shadowCameraRight, 
    a.shadowCameraTop = this.shadowCameraTop, a.shadowCameraBottom = this.shadowCameraBottom, 
    a.shadowCameraVisible = this.shadowCameraVisible, a.shadowBias = this.shadowBias, 
    a.shadowDarkness = this.shadowDarkness, a.shadowMapWidth = this.shadowMapWidth, 
    a.shadowMapHeight = this.shadowMapHeight, a.shadowCascade = this.shadowCascade, 
    a.shadowCascadeOffset.copy(this.shadowCascadeOffset), a.shadowCascadeCount = this.shadowCascadeCount, 
    a.shadowCascadeBias = this.shadowCascadeBias.slice(0), a.shadowCascadeWidth = this.shadowCascadeWidth.slice(0), 
    a.shadowCascadeHeight = this.shadowCascadeHeight.slice(0), a.shadowCascadeNearZ = this.shadowCascadeNearZ.slice(0), 
    a.shadowCascadeFarZ = this.shadowCascadeFarZ.slice(0), a;
}, THREE.HemisphereLight = function(a, b, c) {
    THREE.Light.call(this, a), this.type = "HemisphereLight", this.position.set(0, 100, 0), 
    this.groundColor = new THREE.Color(b), this.intensity = void 0 !== c ? c : 1;
}, THREE.HemisphereLight.prototype = Object.create(THREE.Light.prototype), THREE.HemisphereLight.prototype.constructor = THREE.HemisphereLight, 
THREE.HemisphereLight.prototype.clone = function() {
    var a = new THREE.HemisphereLight();
    return THREE.Light.prototype.clone.call(this, a), a.groundColor.copy(this.groundColor), 
    a.intensity = this.intensity, a;
}, THREE.PointLight = function(a, b, c, d) {
    THREE.Light.call(this, a), this.type = "PointLight", this.intensity = void 0 !== b ? b : 1, 
    this.distance = void 0 !== c ? c : 0, this.decay = void 0 !== d ? d : 1;
}, THREE.PointLight.prototype = Object.create(THREE.Light.prototype), THREE.PointLight.prototype.constructor = THREE.PointLight, 
THREE.PointLight.prototype.clone = function() {
    var a = new THREE.PointLight();
    return THREE.Light.prototype.clone.call(this, a), a.intensity = this.intensity, 
    a.distance = this.distance, a.decay = this.decay, a;
}, THREE.SpotLight = function(a, b, c, d, e, f) {
    THREE.Light.call(this, a), this.type = "SpotLight", this.position.set(0, 1, 0), 
    this.target = new THREE.Object3D(), this.intensity = void 0 !== b ? b : 1, this.distance = void 0 !== c ? c : 0, 
    this.angle = void 0 !== d ? d : Math.PI / 3, this.exponent = void 0 !== e ? e : 10, 
    this.decay = void 0 !== f ? f : 1, this.onlyShadow = this.castShadow = !1, this.shadowCameraNear = 50, 
    this.shadowCameraFar = 5e3, this.shadowCameraFov = 50, this.shadowCameraVisible = !1, 
    this.shadowBias = 0, this.shadowDarkness = .5, this.shadowMapHeight = this.shadowMapWidth = 512, 
    this.shadowMatrix = this.shadowCamera = this.shadowMapSize = this.shadowMap = null;
}, THREE.SpotLight.prototype = Object.create(THREE.Light.prototype), THREE.SpotLight.prototype.constructor = THREE.SpotLight, 
THREE.SpotLight.prototype.clone = function() {
    var a = new THREE.SpotLight();
    return THREE.Light.prototype.clone.call(this, a), a.target = this.target.clone(), 
    a.intensity = this.intensity, a.distance = this.distance, a.angle = this.angle, 
    a.exponent = this.exponent, a.decay = this.decay, a.castShadow = this.castShadow, 
    a.onlyShadow = this.onlyShadow, a.shadowCameraNear = this.shadowCameraNear, a.shadowCameraFar = this.shadowCameraFar, 
    a.shadowCameraFov = this.shadowCameraFov, a.shadowCameraVisible = this.shadowCameraVisible, 
    a.shadowBias = this.shadowBias, a.shadowDarkness = this.shadowDarkness, a.shadowMapWidth = this.shadowMapWidth, 
    a.shadowMapHeight = this.shadowMapHeight, a;
}, THREE.Cache = {
    files: {},
    add: function(a, b) {
        this.files[a] = b;
    },
    get: function(a) {
        return this.files[a];
    },
    remove: function(a) {
        delete this.files[a];
    },
    clear: function() {
        this.files = {};
    }
}, THREE.Loader = function(a) {
    this.statusDomElement = (this.showStatus = a) ? THREE.Loader.prototype.addStatusElement() : null, 
    this.imageLoader = new THREE.ImageLoader(), this.onLoadStart = function() {}, this.onLoadProgress = function() {}, 
    this.onLoadComplete = function() {};
}, THREE.Loader.prototype = {
    constructor: THREE.Loader,
    crossOrigin: void 0,
    addStatusElement: function() {
        var a = document.createElement("div");
        return a.style.position = "absolute", a.style.right = "0px", a.style.top = "0px", 
        a.style.fontSize = "0.8em", a.style.textAlign = "left", a.style.background = "rgba(0,0,0,0.25)", 
        a.style.color = "#fff", a.style.width = "120px", a.style.padding = "0.5em 0.5em 0.5em 0.5em", 
        a.style.zIndex = 1e3, a.innerHTML = "Loading ...", a;
    },
    updateProgress: function(a) {
        var b = "Loaded ", b = a.total ? b + ((100 * a.loaded / a.total).toFixed(0) + "%") : b + ((a.loaded / 1024).toFixed(2) + " KB");
        this.statusDomElement.innerHTML = b;
    },
    extractUrlBase: function(a) {
        return a = a.split("/"), 1 === a.length ? "./" : (a.pop(), a.join("/") + "/");
    },
    initMaterials: function(a, b) {
        for (var c = [], d = 0; d < a.length; ++d) c[d] = this.createMaterial(a[d], b);
        return c;
    },
    needsTangents: function(a) {
        for (var b = 0, c = a.length; c > b; b++) if (a[b] instanceof THREE.ShaderMaterial) return !0;
        return !1;
    },
    createMaterial: function(a, b) {
        function c(a) {
            return a = Math.log(a) / Math.LN2, Math.pow(2, Math.round(a));
        }
        function d(a, d, e, g, h, i, j) {
            var k, l = b + e, m = THREE.Loader.Handlers.get(l);
            null !== m ? k = m.load(l) : (k = new THREE.Texture(), m = f.imageLoader, m.crossOrigin = f.crossOrigin, 
            m.load(l, function(a) {
                if (!1 === THREE.Math.isPowerOfTwo(a.width) || !1 === THREE.Math.isPowerOfTwo(a.height)) {
                    var b = c(a.width), d = c(a.height), e = document.createElement("canvas");
                    e.width = b, e.height = d, e.getContext("2d").drawImage(a, 0, 0, b, d), k.image = e;
                } else k.image = a;
                k.needsUpdate = !0;
            })), k.sourceFile = e, g && (k.repeat.set(g[0], g[1]), 1 !== g[0] && (k.wrapS = THREE.RepeatWrapping), 
            1 !== g[1] && (k.wrapT = THREE.RepeatWrapping)), h && k.offset.set(h[0], h[1]), 
            i && (e = {
                repeat: THREE.RepeatWrapping,
                mirror: THREE.MirroredRepeatWrapping
            }, void 0 !== e[i[0]] && (k.wrapS = e[i[0]]), void 0 !== e[i[1]] && (k.wrapT = e[i[1]])), 
            j && (k.anisotropy = j), a[d] = k;
        }
        function e(a) {
            return (255 * a[0] << 16) + (255 * a[1] << 8) + 255 * a[2];
        }
        var f = this, g = "MeshLambertMaterial", h = {
            color: 15658734,
            opacity: 1,
            map: null,
            lightMap: null,
            normalMap: null,
            bumpMap: null,
            wireframe: !1
        };
        if (a.shading) {
            var i = a.shading.toLowerCase();
            "phong" === i ? g = "MeshPhongMaterial" : "basic" === i && (g = "MeshBasicMaterial");
        }
        return void 0 !== a.blending && void 0 !== THREE[a.blending] && (h.blending = THREE[a.blending]), 
        void 0 !== a.transparent && (h.transparent = a.transparent), void 0 !== a.opacity && 1 > a.opacity && (h.transparent = !0), 
        void 0 !== a.depthTest && (h.depthTest = a.depthTest), void 0 !== a.depthWrite && (h.depthWrite = a.depthWrite), 
        void 0 !== a.visible && (h.visible = a.visible), void 0 !== a.flipSided && (h.side = THREE.BackSide), 
        void 0 !== a.doubleSided && (h.side = THREE.DoubleSide), void 0 !== a.wireframe && (h.wireframe = a.wireframe), 
        void 0 !== a.vertexColors && ("face" === a.vertexColors ? h.vertexColors = THREE.FaceColors : a.vertexColors && (h.vertexColors = THREE.VertexColors)), 
        a.colorDiffuse ? h.color = e(a.colorDiffuse) : a.DbgColor && (h.color = a.DbgColor), 
        a.colorSpecular && (h.specular = e(a.colorSpecular)), a.colorEmissive && (h.emissive = e(a.colorEmissive)), 
        void 0 !== a.transparency && (console.warn("THREE.Loader: transparency has been renamed to opacity"), 
        a.opacity = a.transparency), void 0 !== a.opacity && (h.opacity = a.opacity), a.specularCoef && (h.shininess = a.specularCoef), 
        a.mapDiffuse && b && d(h, "map", a.mapDiffuse, a.mapDiffuseRepeat, a.mapDiffuseOffset, a.mapDiffuseWrap, a.mapDiffuseAnisotropy), 
        a.mapLight && b && d(h, "lightMap", a.mapLight, a.mapLightRepeat, a.mapLightOffset, a.mapLightWrap, a.mapLightAnisotropy), 
        a.mapBump && b && d(h, "bumpMap", a.mapBump, a.mapBumpRepeat, a.mapBumpOffset, a.mapBumpWrap, a.mapBumpAnisotropy), 
        a.mapNormal && b && d(h, "normalMap", a.mapNormal, a.mapNormalRepeat, a.mapNormalOffset, a.mapNormalWrap, a.mapNormalAnisotropy), 
        a.mapSpecular && b && d(h, "specularMap", a.mapSpecular, a.mapSpecularRepeat, a.mapSpecularOffset, a.mapSpecularWrap, a.mapSpecularAnisotropy), 
        a.mapAlpha && b && d(h, "alphaMap", a.mapAlpha, a.mapAlphaRepeat, a.mapAlphaOffset, a.mapAlphaWrap, a.mapAlphaAnisotropy), 
        a.mapBumpScale && (h.bumpScale = a.mapBumpScale), a.mapNormalFactor && (h.normalScale = new THREE.Vector2(a.mapNormalFactor, a.mapNormalFactor)), 
        g = new THREE[g](h), void 0 !== a.DbgName && (g.name = a.DbgName), g;
    }
}, THREE.Loader.Handlers = {
    handlers: [],
    add: function(a, b) {
        this.handlers.push(a, b);
    },
    get: function(a) {
        for (var b = 0, c = this.handlers.length; c > b; b += 2) {
            var d = this.handlers[b + 1];
            if (this.handlers[b].test(a)) return d;
        }
        return null;
    }
}, THREE.XHRLoader = function(a) {
    this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager;
}, THREE.XHRLoader.prototype = {
    constructor: THREE.XHRLoader,
    load: function(a, b, c, d) {
        var e = this, f = THREE.Cache.get(a);
        void 0 !== f ? b && b(f) : (f = new XMLHttpRequest(), f.open("GET", a, !0), f.addEventListener("load", function() {
            THREE.Cache.add(a, this.response), b && b(this.response), e.manager.itemEnd(a);
        }, !1), void 0 !== c && f.addEventListener("progress", function(a) {
            c(a);
        }, !1), void 0 !== d && f.addEventListener("error", function(a) {
            d(a);
        }, !1), void 0 !== this.crossOrigin && (f.crossOrigin = this.crossOrigin), void 0 !== this.responseType && (f.responseType = this.responseType), 
        f.send(null), e.manager.itemStart(a));
    },
    setResponseType: function(a) {
        this.responseType = a;
    },
    setCrossOrigin: function(a) {
        this.crossOrigin = a;
    }
}, THREE.ImageLoader = function(a) {
    this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager;
}, THREE.ImageLoader.prototype = {
    constructor: THREE.ImageLoader,
    load: function(a, b, c, d) {
        var e = this, f = THREE.Cache.get(a);
        return void 0 === f ? (f = document.createElement("img"), f.addEventListener("load", function() {
            THREE.Cache.add(a, this), b && b(this), e.manager.itemEnd(a);
        }, !1), void 0 !== c && f.addEventListener("progress", function(a) {
            c(a);
        }, !1), void 0 !== d && f.addEventListener("error", function(a) {
            d(a);
        }, !1), void 0 !== this.crossOrigin && (f.crossOrigin = this.crossOrigin), f.src = a, 
        e.manager.itemStart(a), f) : void b(f);
    },
    setCrossOrigin: function(a) {
        this.crossOrigin = a;
    }
}, THREE.JSONLoader = function(a) {
    THREE.Loader.call(this, a), this.withCredentials = !1;
}, THREE.JSONLoader.prototype = Object.create(THREE.Loader.prototype), THREE.JSONLoader.prototype.constructor = THREE.JSONLoader, 
THREE.JSONLoader.prototype.load = function(a, b, c) {
    c = c && "string" == typeof c ? c : this.extractUrlBase(a), this.onLoadStart(), 
    this.loadAjaxJSON(this, a, b, c);
}, THREE.JSONLoader.prototype.loadAjaxJSON = function(a, b, c, d, e) {
    var f = new XMLHttpRequest(), g = 0;
    f.onreadystatechange = function() {
        if (f.readyState === f.DONE) if (200 === f.status || 0 === f.status) {
            if (f.responseText) {
                var h = JSON.parse(f.responseText), i = h.metadata;
                if (void 0 !== i) {
                    if ("object" === i.type) return void THREE.error("THREE.JSONLoader: " + b + " should be loaded with THREE.ObjectLoader instead.");
                    if ("scene" === i.type) return void THREE.error("THREE.JSONLoader: " + b + " seems to be a Scene. Use THREE.SceneLoader instead.");
                }
                h = a.parse(h, d), c(h.geometry, h.materials);
            } else THREE.error("THREE.JSONLoader: " + b + " seems to be unreachable or the file is empty.");
            a.onLoadComplete();
        } else THREE.error("THREE.JSONLoader: Couldn't load " + b + " (" + f.status + ")"); else f.readyState === f.LOADING ? e && (0 === g && (g = f.getResponseHeader("Content-Length")), 
        e({
            total: g,
            loaded: f.responseText.length
        })) : f.readyState === f.HEADERS_RECEIVED && void 0 !== e && (g = f.getResponseHeader("Content-Length"));
    }, f.open("GET", b, !0), f.withCredentials = this.withCredentials, f.send(null);
}, THREE.JSONLoader.prototype.parse = function(a, b) {
    var c = new THREE.Geometry(), d = void 0 !== a.scale ? 1 / a.scale : 1;
    return function(b) {
        var d, e, f, g, h, i, j, k, l, m, n, o, p, q = a.faces;
        i = a.vertices;
        var r = a.normals, s = a.colors, t = 0;
        if (void 0 !== a.uvs) {
            for (d = 0; d < a.uvs.length; d++) a.uvs[d].length && t++;
            for (d = 0; t > d; d++) c.faceVertexUvs[d] = [];
        }
        for (g = 0, h = i.length; h > g; ) d = new THREE.Vector3(), d.x = i[g++] * b, d.y = i[g++] * b, 
        d.z = i[g++] * b, c.vertices.push(d);
        for (g = 0, h = q.length; h > g; ) if (b = q[g++], l = 1 & b, f = 2 & b, d = 8 & b, 
        j = 16 & b, m = 32 & b, i = 64 & b, b &= 128, l) {
            if (l = new THREE.Face3(), l.a = q[g], l.b = q[g + 1], l.c = q[g + 3], n = new THREE.Face3(), 
            n.a = q[g + 1], n.b = q[g + 2], n.c = q[g + 3], g += 4, f && (f = q[g++], l.materialIndex = f, 
            n.materialIndex = f), f = c.faces.length, d) for (d = 0; t > d; d++) for (o = a.uvs[d], 
            c.faceVertexUvs[d][f] = [], c.faceVertexUvs[d][f + 1] = [], e = 0; 4 > e; e++) k = q[g++], 
            p = o[2 * k], k = o[2 * k + 1], p = new THREE.Vector2(p, k), 2 !== e && c.faceVertexUvs[d][f].push(p), 
            0 !== e && c.faceVertexUvs[d][f + 1].push(p);
            if (j && (j = 3 * q[g++], l.normal.set(r[j++], r[j++], r[j]), n.normal.copy(l.normal)), 
            m) for (d = 0; 4 > d; d++) j = 3 * q[g++], m = new THREE.Vector3(r[j++], r[j++], r[j]), 
            2 !== d && l.vertexNormals.push(m), 0 !== d && n.vertexNormals.push(m);
            if (i && (i = q[g++], i = s[i], l.color.setHex(i), n.color.setHex(i)), b) for (d = 0; 4 > d; d++) i = q[g++], 
            i = s[i], 2 !== d && l.vertexColors.push(new THREE.Color(i)), 0 !== d && n.vertexColors.push(new THREE.Color(i));
            c.faces.push(l), c.faces.push(n);
        } else {
            if (l = new THREE.Face3(), l.a = q[g++], l.b = q[g++], l.c = q[g++], f && (f = q[g++], 
            l.materialIndex = f), f = c.faces.length, d) for (d = 0; t > d; d++) for (o = a.uvs[d], 
            c.faceVertexUvs[d][f] = [], e = 0; 3 > e; e++) k = q[g++], p = o[2 * k], k = o[2 * k + 1], 
            p = new THREE.Vector2(p, k), c.faceVertexUvs[d][f].push(p);
            if (j && (j = 3 * q[g++], l.normal.set(r[j++], r[j++], r[j])), m) for (d = 0; 3 > d; d++) j = 3 * q[g++], 
            m = new THREE.Vector3(r[j++], r[j++], r[j]), l.vertexNormals.push(m);
            if (i && (i = q[g++], l.color.setHex(s[i])), b) for (d = 0; 3 > d; d++) i = q[g++], 
            l.vertexColors.push(new THREE.Color(s[i]));
            c.faces.push(l);
        }
    }(d), function() {
        var b = void 0 !== a.influencesPerVertex ? a.influencesPerVertex : 2;
        if (a.skinWeights) for (var d = 0, e = a.skinWeights.length; e > d; d += b) c.skinWeights.push(new THREE.Vector4(a.skinWeights[d], b > 1 ? a.skinWeights[d + 1] : 0, b > 2 ? a.skinWeights[d + 2] : 0, b > 3 ? a.skinWeights[d + 3] : 0));
        if (a.skinIndices) for (d = 0, e = a.skinIndices.length; e > d; d += b) c.skinIndices.push(new THREE.Vector4(a.skinIndices[d], b > 1 ? a.skinIndices[d + 1] : 0, b > 2 ? a.skinIndices[d + 2] : 0, b > 3 ? a.skinIndices[d + 3] : 0));
        c.bones = a.bones, c.bones && 0 < c.bones.length && (c.skinWeights.length !== c.skinIndices.length || c.skinIndices.length !== c.vertices.length) && THREE.warn("THREE.JSONLoader: When skinning, number of vertices (" + c.vertices.length + "), skinIndices (" + c.skinIndices.length + "), and skinWeights (" + c.skinWeights.length + ") should match."), 
        c.animation = a.animation, c.animations = a.animations;
    }(), function(b) {
        if (void 0 !== a.morphTargets) {
            var d, e, f, g, h, i;
            for (d = 0, e = a.morphTargets.length; e > d; d++) for (c.morphTargets[d] = {}, 
            c.morphTargets[d].name = a.morphTargets[d].name, c.morphTargets[d].vertices = [], 
            h = c.morphTargets[d].vertices, i = a.morphTargets[d].vertices, f = 0, g = i.length; g > f; f += 3) {
                var j = new THREE.Vector3();
                j.x = i[f] * b, j.y = i[f + 1] * b, j.z = i[f + 2] * b, h.push(j);
            }
        }
        if (void 0 !== a.morphColors) for (d = 0, e = a.morphColors.length; e > d; d++) for (c.morphColors[d] = {}, 
        c.morphColors[d].name = a.morphColors[d].name, c.morphColors[d].colors = [], g = c.morphColors[d].colors, 
        h = a.morphColors[d].colors, b = 0, f = h.length; f > b; b += 3) i = new THREE.Color(16755200), 
        i.setRGB(h[b], h[b + 1], h[b + 2]), g.push(i);
    }(d), c.computeFaceNormals(), c.computeBoundingSphere(), void 0 === a.materials || 0 === a.materials.length ? {
        geometry: c
    } : (d = this.initMaterials(a.materials, b), this.needsTangents(d) && c.computeTangents(), 
    {
        geometry: c,
        materials: d
    });
}, THREE.LoadingManager = function(a, b, c) {
    var d = this, e = 0, f = 0;
    this.onLoad = a, this.onProgress = b, this.onError = c, this.itemStart = function() {
        f++;
    }, this.itemEnd = function(a) {
        e++, void 0 !== d.onProgress && d.onProgress(a, e, f), e === f && void 0 !== d.onLoad && d.onLoad();
    };
}, THREE.DefaultLoadingManager = new THREE.LoadingManager(), THREE.BufferGeometryLoader = function(a) {
    this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager;
}, THREE.BufferGeometryLoader.prototype = {
    constructor: THREE.BufferGeometryLoader,
    load: function(a, b, c, d) {
        var e = this, f = new THREE.XHRLoader(e.manager);
        f.setCrossOrigin(this.crossOrigin), f.load(a, function(a) {
            b(e.parse(JSON.parse(a)));
        }, c, d);
    },
    setCrossOrigin: function(a) {
        this.crossOrigin = a;
    },
    parse: function(a) {
        var b, c = new THREE.BufferGeometry(), d = a.data.attributes;
        for (b in d) {
            var e = d[b], f = new self[e.type](e.array);
            c.addAttribute(b, new THREE.BufferAttribute(f, e.itemSize));
        }
        return d = a.data.offsets, void 0 !== d && (c.offsets = JSON.parse(JSON.stringify(d))), 
        a = a.data.boundingSphere, void 0 !== a && (d = new THREE.Vector3(), void 0 !== a.center && d.fromArray(a.center), 
        c.boundingSphere = new THREE.Sphere(d, a.radius)), c;
    }
}, THREE.MaterialLoader = function(a) {
    this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager;
}, THREE.MaterialLoader.prototype = {
    constructor: THREE.MaterialLoader,
    load: function(a, b, c, d) {
        var e = this, f = new THREE.XHRLoader(e.manager);
        f.setCrossOrigin(this.crossOrigin), f.load(a, function(a) {
            b(e.parse(JSON.parse(a)));
        }, c, d);
    },
    setCrossOrigin: function(a) {
        this.crossOrigin = a;
    },
    parse: function(a) {
        var b = new THREE[a.type]();
        if (void 0 !== a.color && b.color.setHex(a.color), void 0 !== a.emissive && b.emissive.setHex(a.emissive), 
        void 0 !== a.specular && b.specular.setHex(a.specular), void 0 !== a.shininess && (b.shininess = a.shininess), 
        void 0 !== a.uniforms && (b.uniforms = a.uniforms), void 0 !== a.vertexShader && (b.vertexShader = a.vertexShader), 
        void 0 !== a.fragmentShader && (b.fragmentShader = a.fragmentShader), void 0 !== a.vertexColors && (b.vertexColors = a.vertexColors), 
        void 0 !== a.shading && (b.shading = a.shading), void 0 !== a.blending && (b.blending = a.blending), 
        void 0 !== a.side && (b.side = a.side), void 0 !== a.opacity && (b.opacity = a.opacity), 
        void 0 !== a.transparent && (b.transparent = a.transparent), void 0 !== a.wireframe && (b.wireframe = a.wireframe), 
        void 0 !== a.size && (b.size = a.size), void 0 !== a.sizeAttenuation && (b.sizeAttenuation = a.sizeAttenuation), 
        void 0 !== a.materials) for (var c = 0, d = a.materials.length; d > c; c++) b.materials.push(this.parse(a.materials[c]));
        return b;
    }
}, THREE.ObjectLoader = function(a) {
    this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager, this.texturePath = "";
}, THREE.ObjectLoader.prototype = {
    constructor: THREE.ObjectLoader,
    load: function(a, b, c, d) {
        "" === this.texturePath && (this.texturePath = a.substring(0, a.lastIndexOf("/") + 1));
        var e = this, f = new THREE.XHRLoader(e.manager);
        f.setCrossOrigin(this.crossOrigin), f.load(a, function(a) {
            e.parse(JSON.parse(a), b);
        }, c, d);
    },
    setTexturePath: function(a) {
        this.texturePath = a;
    },
    setCrossOrigin: function(a) {
        this.crossOrigin = a;
    },
    parse: function(a, b) {
        var c = this.parseGeometries(a.geometries), d = this.parseImages(a.images, function() {
            void 0 !== b && b(e);
        }), d = this.parseTextures(a.textures, d), d = this.parseMaterials(a.materials, d), e = this.parseObject(a.object, c, d);
        return void 0 !== a.images && 0 !== a.images.length || void 0 === b || b(e), e;
    },
    parseGeometries: function(a) {
        var b = {};
        if (void 0 !== a) for (var c = new THREE.JSONLoader(), d = new THREE.BufferGeometryLoader(), e = 0, f = a.length; f > e; e++) {
            var g, h = a[e];
            switch (h.type) {
              case "PlaneGeometry":
              case "PlaneBufferGeometry":
                g = new THREE[h.type](h.width, h.height, h.widthSegments, h.heightSegments);
                break;

              case "BoxGeometry":
              case "CubeGeometry":
                g = new THREE.BoxGeometry(h.width, h.height, h.depth, h.widthSegments, h.heightSegments, h.depthSegments);
                break;

              case "CircleGeometry":
                g = new THREE.CircleGeometry(h.radius, h.segments);
                break;

              case "CylinderGeometry":
                g = new THREE.CylinderGeometry(h.radiusTop, h.radiusBottom, h.height, h.radialSegments, h.heightSegments, h.openEnded);
                break;

              case "SphereGeometry":
                g = new THREE.SphereGeometry(h.radius, h.widthSegments, h.heightSegments, h.phiStart, h.phiLength, h.thetaStart, h.thetaLength);
                break;

              case "IcosahedronGeometry":
                g = new THREE.IcosahedronGeometry(h.radius, h.detail);
                break;

              case "TorusGeometry":
                g = new THREE.TorusGeometry(h.radius, h.tube, h.radialSegments, h.tubularSegments, h.arc);
                break;

              case "TorusKnotGeometry":
                g = new THREE.TorusKnotGeometry(h.radius, h.tube, h.radialSegments, h.tubularSegments, h.p, h.q, h.heightScale);
                break;

              case "BufferGeometry":
                g = d.parse(h);
                break;

              case "Geometry":
                g = c.parse(h.data).geometry;
            }
            g.uuid = h.uuid, void 0 !== h.name && (g.name = h.name), b[h.uuid] = g;
        }
        return b;
    },
    parseMaterials: function(a, b) {
        var c = {};
        if (void 0 !== a) for (var d = function(a) {
            return void 0 === b[a] && THREE.warn("THREE.ObjectLoader: Undefined texture", a), 
            b[a];
        }, e = new THREE.MaterialLoader(), f = 0, g = a.length; g > f; f++) {
            var h = a[f], i = e.parse(h);
            i.uuid = h.uuid, void 0 !== h.name && (i.name = h.name), void 0 !== h.map && (i.map = d(h.map)), 
            void 0 !== h.bumpMap && (i.bumpMap = d(h.bumpMap), h.bumpScale && (i.bumpScale = new THREE.Vector2(h.bumpScale, h.bumpScale))), 
            void 0 !== h.alphaMap && (i.alphaMap = d(h.alphaMap)), void 0 !== h.envMap && (i.envMap = d(h.envMap)), 
            void 0 !== h.normalMap && (i.normalMap = d(h.normalMap), h.normalScale && (i.normalScale = new THREE.Vector2(h.normalScale, h.normalScale))), 
            void 0 !== h.lightMap && (i.lightMap = d(h.lightMap)), void 0 !== h.specularMap && (i.specularMap = d(h.specularMap)), 
            c[h.uuid] = i;
        }
        return c;
    },
    parseImages: function(a, b) {
        var c = this, d = {};
        if (void 0 !== a && 0 < a.length) {
            var e = new THREE.LoadingManager(b), f = new THREE.ImageLoader(e);
            f.setCrossOrigin(this.crossOrigin);
            for (var e = function(a) {
                return c.manager.itemStart(a), f.load(a, function() {
                    c.manager.itemEnd(a);
                });
            }, g = 0, h = a.length; h > g; g++) {
                var i = a[g], j = /^(\/\/)|([a-z]+:(\/\/)?)/i.test(i.url) ? i.url : c.texturePath + i.url;
                d[i.uuid] = e(j);
            }
        }
        return d;
    },
    parseTextures: function(a, b) {
        var c = {};
        if (void 0 !== a) for (var d = 0, e = a.length; e > d; d++) {
            var f = a[d];
            void 0 === f.image && THREE.warn('THREE.ObjectLoader: No "image" speficied for', f.uuid), 
            void 0 === b[f.image] && THREE.warn("THREE.ObjectLoader: Undefined image", f.image);
            var g = new THREE.Texture(b[f.image]);
            g.needsUpdate = !0, g.uuid = f.uuid, void 0 !== f.name && (g.name = f.name), void 0 !== f.repeat && (g.repeat = new THREE.Vector2(f.repeat[0], f.repeat[1])), 
            void 0 !== f.minFilter && (g.minFilter = THREE[f.minFilter]), void 0 !== f.magFilter && (g.magFilter = THREE[f.magFilter]), 
            void 0 !== f.anisotropy && (g.anisotropy = f.anisotropy), f.wrap instanceof Array && (g.wrapS = THREE[f.wrap[0]], 
            g.wrapT = THREE[f.wrap[1]]), c[f.uuid] = g;
        }
        return c;
    },
    parseObject: function() {
        var a = new THREE.Matrix4();
        return function(b, c, d) {
            var e;
            e = function(a) {
                return void 0 === c[a] && THREE.warn("THREE.ObjectLoader: Undefined geometry", a), 
                c[a];
            };
            var f = function(a) {
                return void 0 === d[a] && THREE.warn("THREE.ObjectLoader: Undefined material", a), 
                d[a];
            };
            switch (b.type) {
              case "Scene":
                e = new THREE.Scene();
                break;

              case "PerspectiveCamera":
                e = new THREE.PerspectiveCamera(b.fov, b.aspect, b.near, b.far);
                break;

              case "OrthographicCamera":
                e = new THREE.OrthographicCamera(b.left, b.right, b.top, b.bottom, b.near, b.far);
                break;

              case "AmbientLight":
                e = new THREE.AmbientLight(b.color);
                break;

              case "DirectionalLight":
                e = new THREE.DirectionalLight(b.color, b.intensity);
                break;

              case "PointLight":
                e = new THREE.PointLight(b.color, b.intensity, b.distance, b.decay);
                break;

              case "SpotLight":
                e = new THREE.SpotLight(b.color, b.intensity, b.distance, b.angle, b.exponent, b.decay);
                break;

              case "HemisphereLight":
                e = new THREE.HemisphereLight(b.color, b.groundColor, b.intensity);
                break;

              case "Mesh":
                e = new THREE.Mesh(e(b.geometry), f(b.material));
                break;

              case "Line":
                e = new THREE.Line(e(b.geometry), f(b.material), b.mode);
                break;

              case "PointCloud":
                e = new THREE.PointCloud(e(b.geometry), f(b.material));
                break;

              case "Sprite":
                e = new THREE.Sprite(f(b.material));
                break;

              case "Group":
                e = new THREE.Group();
                break;

              default:
                e = new THREE.Object3D();
            }
            if (e.uuid = b.uuid, void 0 !== b.name && (e.name = b.name), void 0 !== b.matrix ? (a.fromArray(b.matrix), 
            a.decompose(e.position, e.quaternion, e.scale)) : (void 0 !== b.position && e.position.fromArray(b.position), 
            void 0 !== b.rotation && e.rotation.fromArray(b.rotation), void 0 !== b.scale && e.scale.fromArray(b.scale)), 
            void 0 !== b.visible && (e.visible = b.visible), void 0 !== b.userData && (e.userData = b.userData), 
            void 0 !== b.children) for (var g in b.children) e.add(this.parseObject(b.children[g], c, d));
            return e;
        };
    }()
}, THREE.TextureLoader = function(a) {
    this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager;
}, THREE.TextureLoader.prototype = {
    constructor: THREE.TextureLoader,
    load: function(a, b, c, d) {
        var e = new THREE.ImageLoader(this.manager);
        e.setCrossOrigin(this.crossOrigin), e.load(a, function(a) {
            a = new THREE.Texture(a), a.needsUpdate = !0, void 0 !== b && b(a);
        }, c, d);
    },
    setCrossOrigin: function(a) {
        this.crossOrigin = a;
    }
}, THREE.DataTextureLoader = THREE.BinaryTextureLoader = function() {
    this._parser = null;
}, THREE.BinaryTextureLoader.prototype = {
    constructor: THREE.BinaryTextureLoader,
    load: function(a, b, c, d) {
        var e = this, f = new THREE.DataTexture(), g = new THREE.XHRLoader();
        return g.setResponseType("arraybuffer"), g.load(a, function(a) {
            (a = e._parser(a)) && (void 0 !== a.image ? f.image = a.image : void 0 !== a.data && (f.image.width = a.width, 
            f.image.height = a.height, f.image.data = a.data), f.wrapS = void 0 !== a.wrapS ? a.wrapS : THREE.ClampToEdgeWrapping, 
            f.wrapT = void 0 !== a.wrapT ? a.wrapT : THREE.ClampToEdgeWrapping, f.magFilter = void 0 !== a.magFilter ? a.magFilter : THREE.LinearFilter, 
            f.minFilter = void 0 !== a.minFilter ? a.minFilter : THREE.LinearMipMapLinearFilter, 
            f.anisotropy = void 0 !== a.anisotropy ? a.anisotropy : 1, void 0 !== a.format && (f.format = a.format), 
            void 0 !== a.type && (f.type = a.type), void 0 !== a.mipmaps && (f.mipmaps = a.mipmaps), 
            1 === a.mipmapCount && (f.minFilter = THREE.LinearFilter), f.needsUpdate = !0, b && b(f, a));
        }, c, d), f;
    }
}, THREE.CompressedTextureLoader = function() {
    this._parser = null;
}, THREE.CompressedTextureLoader.prototype = {
    constructor: THREE.CompressedTextureLoader,
    load: function(a, b, c) {
        var d = this, e = [], f = new THREE.CompressedTexture();
        f.image = e;
        var g = new THREE.XHRLoader();
        if (g.setResponseType("arraybuffer"), a instanceof Array) {
            var h = 0;
            c = function(c) {
                g.load(a[c], function(a) {
                    a = d._parser(a, !0), e[c] = {
                        width: a.width,
                        height: a.height,
                        format: a.format,
                        mipmaps: a.mipmaps
                    }, h += 1, 6 === h && (1 == a.mipmapCount && (f.minFilter = THREE.LinearFilter), 
                    f.format = a.format, f.needsUpdate = !0, b && b(f));
                });
            };
            for (var i = 0, j = a.length; j > i; ++i) c(i);
        } else g.load(a, function(a) {
            if (a = d._parser(a, !0), a.isCubemap) for (var c = a.mipmaps.length / a.mipmapCount, g = 0; c > g; g++) {
                e[g] = {
                    mipmaps: []
                };
                for (var h = 0; h < a.mipmapCount; h++) e[g].mipmaps.push(a.mipmaps[g * a.mipmapCount + h]), 
                e[g].format = a.format, e[g].width = a.width, e[g].height = a.height;
            } else f.image.width = a.width, f.image.height = a.height, f.mipmaps = a.mipmaps;
            1 === a.mipmapCount && (f.minFilter = THREE.LinearFilter), f.format = a.format, 
            f.needsUpdate = !0, b && b(f);
        });
        return f;
    }
}, THREE.Material = function() {
    Object.defineProperty(this, "id", {
        value: THREE.MaterialIdCount++
    }), this.uuid = THREE.Math.generateUUID(), this.name = "", this.type = "Material", 
    this.side = THREE.FrontSide, this.opacity = 1, this.transparent = !1, this.blending = THREE.NormalBlending, 
    this.blendSrc = THREE.SrcAlphaFactor, this.blendDst = THREE.OneMinusSrcAlphaFactor, 
    this.blendEquation = THREE.AddEquation, this.blendEquationAlpha = this.blendDstAlpha = this.blendSrcAlpha = null, 
    this.colorWrite = this.depthWrite = this.depthTest = !0, this.polygonOffset = !1, 
    this.overdraw = this.alphaTest = this.polygonOffsetUnits = this.polygonOffsetFactor = 0, 
    this._needsUpdate = this.visible = !0;
}, THREE.Material.prototype = {
    constructor: THREE.Material,
    get needsUpdate() {
        return this._needsUpdate;
    },
    set needsUpdate(a) {
        !0 === a && this.update(), this._needsUpdate = a;
    },
    setValues: function(a) {
        if (void 0 !== a) for (var b in a) {
            var c = a[b];
            if (void 0 === c) THREE.warn("THREE.Material: '" + b + "' parameter is undefined."); else if (b in this) {
                var d = this[b];
                d instanceof THREE.Color ? d.set(c) : d instanceof THREE.Vector3 && c instanceof THREE.Vector3 ? d.copy(c) : this[b] = "overdraw" == b ? Number(c) : c;
            }
        }
    },
    toJSON: function() {
        var a = {
            metadata: {
                version: 4.2,
                type: "material",
                generator: "MaterialExporter"
            },
            uuid: this.uuid,
            type: this.type
        };
        return "" !== this.name && (a.name = this.name), this instanceof THREE.MeshBasicMaterial ? (a.color = this.color.getHex(), 
        this.vertexColors !== THREE.NoColors && (a.vertexColors = this.vertexColors), this.blending !== THREE.NormalBlending && (a.blending = this.blending), 
        this.side !== THREE.FrontSide && (a.side = this.side)) : this instanceof THREE.MeshLambertMaterial ? (a.color = this.color.getHex(), 
        a.emissive = this.emissive.getHex(), this.vertexColors !== THREE.NoColors && (a.vertexColors = this.vertexColors), 
        this.shading !== THREE.SmoothShading && (a.shading = this.shading), this.blending !== THREE.NormalBlending && (a.blending = this.blending), 
        this.side !== THREE.FrontSide && (a.side = this.side)) : this instanceof THREE.MeshPhongMaterial ? (a.color = this.color.getHex(), 
        a.emissive = this.emissive.getHex(), a.specular = this.specular.getHex(), a.shininess = this.shininess, 
        this.vertexColors !== THREE.NoColors && (a.vertexColors = this.vertexColors), this.shading !== THREE.SmoothShading && (a.shading = this.shading), 
        this.blending !== THREE.NormalBlending && (a.blending = this.blending), this.side !== THREE.FrontSide && (a.side = this.side)) : this instanceof THREE.MeshNormalMaterial ? (this.blending !== THREE.NormalBlending && (a.blending = this.blending), 
        this.side !== THREE.FrontSide && (a.side = this.side)) : this instanceof THREE.MeshDepthMaterial ? (this.blending !== THREE.NormalBlending && (a.blending = this.blending), 
        this.side !== THREE.FrontSide && (a.side = this.side)) : this instanceof THREE.PointCloudMaterial ? (a.size = this.size, 
        a.sizeAttenuation = this.sizeAttenuation, a.color = this.color.getHex(), this.vertexColors !== THREE.NoColors && (a.vertexColors = this.vertexColors), 
        this.blending !== THREE.NormalBlending && (a.blending = this.blending)) : this instanceof THREE.ShaderMaterial ? (a.uniforms = this.uniforms, 
        a.vertexShader = this.vertexShader, a.fragmentShader = this.fragmentShader) : this instanceof THREE.SpriteMaterial && (a.color = this.color.getHex()), 
        1 > this.opacity && (a.opacity = this.opacity), !1 !== this.transparent && (a.transparent = this.transparent), 
        !1 !== this.wireframe && (a.wireframe = this.wireframe), a;
    },
    clone: function(a) {
        return void 0 === a && (a = new THREE.Material()), a.name = this.name, a.side = this.side, 
        a.opacity = this.opacity, a.transparent = this.transparent, a.blending = this.blending, 
        a.blendSrc = this.blendSrc, a.blendDst = this.blendDst, a.blendEquation = this.blendEquation, 
        a.blendSrcAlpha = this.blendSrcAlpha, a.blendDstAlpha = this.blendDstAlpha, a.blendEquationAlpha = this.blendEquationAlpha, 
        a.depthTest = this.depthTest, a.depthWrite = this.depthWrite, a.polygonOffset = this.polygonOffset, 
        a.polygonOffsetFactor = this.polygonOffsetFactor, a.polygonOffsetUnits = this.polygonOffsetUnits, 
        a.alphaTest = this.alphaTest, a.overdraw = this.overdraw, a.visible = this.visible, 
        a;
    },
    update: function() {
        this.dispatchEvent({
            type: "update"
        });
    },
    dispose: function() {
        this.dispatchEvent({
            type: "dispose"
        });
    }
}, THREE.EventDispatcher.prototype.apply(THREE.Material.prototype), THREE.MaterialIdCount = 0, 
THREE.LineBasicMaterial = function(a) {
    THREE.Material.call(this), this.type = "LineBasicMaterial", this.color = new THREE.Color(16777215), 
    this.linewidth = 1, this.linejoin = this.linecap = "round", this.vertexColors = THREE.NoColors, 
    this.fog = !0, this.setValues(a);
}, THREE.LineBasicMaterial.prototype = Object.create(THREE.Material.prototype), 
THREE.LineBasicMaterial.prototype.constructor = THREE.LineBasicMaterial, THREE.LineBasicMaterial.prototype.clone = function() {
    var a = new THREE.LineBasicMaterial();
    return THREE.Material.prototype.clone.call(this, a), a.color.copy(this.color), a.linewidth = this.linewidth, 
    a.linecap = this.linecap, a.linejoin = this.linejoin, a.vertexColors = this.vertexColors, 
    a.fog = this.fog, a;
}, THREE.LineDashedMaterial = function(a) {
    THREE.Material.call(this), this.type = "LineDashedMaterial", this.color = new THREE.Color(16777215), 
    this.scale = this.linewidth = 1, this.dashSize = 3, this.gapSize = 1, this.vertexColors = !1, 
    this.fog = !0, this.setValues(a);
}, THREE.LineDashedMaterial.prototype = Object.create(THREE.Material.prototype), 
THREE.LineDashedMaterial.prototype.constructor = THREE.LineDashedMaterial, THREE.LineDashedMaterial.prototype.clone = function() {
    var a = new THREE.LineDashedMaterial();
    return THREE.Material.prototype.clone.call(this, a), a.color.copy(this.color), a.linewidth = this.linewidth, 
    a.scale = this.scale, a.dashSize = this.dashSize, a.gapSize = this.gapSize, a.vertexColors = this.vertexColors, 
    a.fog = this.fog, a;
}, THREE.MeshBasicMaterial = function(a) {
    THREE.Material.call(this), this.type = "MeshBasicMaterial", this.color = new THREE.Color(16777215), 
    this.envMap = this.alphaMap = this.specularMap = this.lightMap = this.map = null, 
    this.combine = THREE.MultiplyOperation, this.reflectivity = 1, this.refractionRatio = .98, 
    this.fog = !0, this.shading = THREE.SmoothShading, this.wireframe = !1, this.wireframeLinewidth = 1, 
    this.wireframeLinejoin = this.wireframeLinecap = "round", this.vertexColors = THREE.NoColors, 
    this.morphTargets = this.skinning = !1, this.setValues(a);
}, THREE.MeshBasicMaterial.prototype = Object.create(THREE.Material.prototype), 
THREE.MeshBasicMaterial.prototype.constructor = THREE.MeshBasicMaterial, THREE.MeshBasicMaterial.prototype.clone = function() {
    var a = new THREE.MeshBasicMaterial();
    return THREE.Material.prototype.clone.call(this, a), a.color.copy(this.color), a.map = this.map, 
    a.lightMap = this.lightMap, a.specularMap = this.specularMap, a.alphaMap = this.alphaMap, 
    a.envMap = this.envMap, a.combine = this.combine, a.reflectivity = this.reflectivity, 
    a.refractionRatio = this.refractionRatio, a.fog = this.fog, a.shading = this.shading, 
    a.wireframe = this.wireframe, a.wireframeLinewidth = this.wireframeLinewidth, a.wireframeLinecap = this.wireframeLinecap, 
    a.wireframeLinejoin = this.wireframeLinejoin, a.vertexColors = this.vertexColors, 
    a.skinning = this.skinning, a.morphTargets = this.morphTargets, a;
}, THREE.MeshLambertMaterial = function(a) {
    THREE.Material.call(this), this.type = "MeshLambertMaterial", this.color = new THREE.Color(16777215), 
    this.emissive = new THREE.Color(0), this.wrapAround = !1, this.wrapRGB = new THREE.Vector3(1, 1, 1), 
    this.envMap = this.alphaMap = this.specularMap = this.lightMap = this.map = null, 
    this.combine = THREE.MultiplyOperation, this.reflectivity = 1, this.refractionRatio = .98, 
    this.fog = !0, this.shading = THREE.SmoothShading, this.wireframe = !1, this.wireframeLinewidth = 1, 
    this.wireframeLinejoin = this.wireframeLinecap = "round", this.vertexColors = THREE.NoColors, 
    this.morphNormals = this.morphTargets = this.skinning = !1, this.setValues(a);
}, THREE.MeshLambertMaterial.prototype = Object.create(THREE.Material.prototype), 
THREE.MeshLambertMaterial.prototype.constructor = THREE.MeshLambertMaterial, THREE.MeshLambertMaterial.prototype.clone = function() {
    var a = new THREE.MeshLambertMaterial();
    return THREE.Material.prototype.clone.call(this, a), a.color.copy(this.color), a.emissive.copy(this.emissive), 
    a.wrapAround = this.wrapAround, a.wrapRGB.copy(this.wrapRGB), a.map = this.map, 
    a.lightMap = this.lightMap, a.specularMap = this.specularMap, a.alphaMap = this.alphaMap, 
    a.envMap = this.envMap, a.combine = this.combine, a.reflectivity = this.reflectivity, 
    a.refractionRatio = this.refractionRatio, a.fog = this.fog, a.shading = this.shading, 
    a.wireframe = this.wireframe, a.wireframeLinewidth = this.wireframeLinewidth, a.wireframeLinecap = this.wireframeLinecap, 
    a.wireframeLinejoin = this.wireframeLinejoin, a.vertexColors = this.vertexColors, 
    a.skinning = this.skinning, a.morphTargets = this.morphTargets, a.morphNormals = this.morphNormals, 
    a;
}, THREE.MeshPhongMaterial = function(a) {
    THREE.Material.call(this), this.type = "MeshPhongMaterial", this.color = new THREE.Color(16777215), 
    this.emissive = new THREE.Color(0), this.specular = new THREE.Color(1118481), this.shininess = 30, 
    this.wrapAround = this.metal = !1, this.wrapRGB = new THREE.Vector3(1, 1, 1), this.bumpMap = this.lightMap = this.map = null, 
    this.bumpScale = 1, this.normalMap = null, this.normalScale = new THREE.Vector2(1, 1), 
    this.envMap = this.alphaMap = this.specularMap = null, this.combine = THREE.MultiplyOperation, 
    this.reflectivity = 1, this.refractionRatio = .98, this.fog = !0, this.shading = THREE.SmoothShading, 
    this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinejoin = this.wireframeLinecap = "round", 
    this.vertexColors = THREE.NoColors, this.morphNormals = this.morphTargets = this.skinning = !1, 
    this.setValues(a);
}, THREE.MeshPhongMaterial.prototype = Object.create(THREE.Material.prototype), 
THREE.MeshPhongMaterial.prototype.constructor = THREE.MeshPhongMaterial, THREE.MeshPhongMaterial.prototype.clone = function() {
    var a = new THREE.MeshPhongMaterial();
    return THREE.Material.prototype.clone.call(this, a), a.color.copy(this.color), a.emissive.copy(this.emissive), 
    a.specular.copy(this.specular), a.shininess = this.shininess, a.metal = this.metal, 
    a.wrapAround = this.wrapAround, a.wrapRGB.copy(this.wrapRGB), a.map = this.map, 
    a.lightMap = this.lightMap, a.bumpMap = this.bumpMap, a.bumpScale = this.bumpScale, 
    a.normalMap = this.normalMap, a.normalScale.copy(this.normalScale), a.specularMap = this.specularMap, 
    a.alphaMap = this.alphaMap, a.envMap = this.envMap, a.combine = this.combine, a.reflectivity = this.reflectivity, 
    a.refractionRatio = this.refractionRatio, a.fog = this.fog, a.shading = this.shading, 
    a.wireframe = this.wireframe, a.wireframeLinewidth = this.wireframeLinewidth, a.wireframeLinecap = this.wireframeLinecap, 
    a.wireframeLinejoin = this.wireframeLinejoin, a.vertexColors = this.vertexColors, 
    a.skinning = this.skinning, a.morphTargets = this.morphTargets, a.morphNormals = this.morphNormals, 
    a;
}, THREE.MeshDepthMaterial = function(a) {
    THREE.Material.call(this), this.type = "MeshDepthMaterial", this.wireframe = this.morphTargets = !1, 
    this.wireframeLinewidth = 1, this.setValues(a);
}, THREE.MeshDepthMaterial.prototype = Object.create(THREE.Material.prototype), 
THREE.MeshDepthMaterial.prototype.constructor = THREE.MeshDepthMaterial, THREE.MeshDepthMaterial.prototype.clone = function() {
    var a = new THREE.MeshDepthMaterial();
    return THREE.Material.prototype.clone.call(this, a), a.wireframe = this.wireframe, 
    a.wireframeLinewidth = this.wireframeLinewidth, a;
}, THREE.MeshNormalMaterial = function(a) {
    THREE.Material.call(this, a), this.type = "MeshNormalMaterial", this.wireframe = !1, 
    this.wireframeLinewidth = 1, this.morphTargets = !1, this.setValues(a);
}, THREE.MeshNormalMaterial.prototype = Object.create(THREE.Material.prototype), 
THREE.MeshNormalMaterial.prototype.constructor = THREE.MeshNormalMaterial, THREE.MeshNormalMaterial.prototype.clone = function() {
    var a = new THREE.MeshNormalMaterial();
    return THREE.Material.prototype.clone.call(this, a), a.wireframe = this.wireframe, 
    a.wireframeLinewidth = this.wireframeLinewidth, a;
}, THREE.MeshFaceMaterial = function(a) {
    this.uuid = THREE.Math.generateUUID(), this.type = "MeshFaceMaterial", this.materials = a instanceof Array ? a : [];
}, THREE.MeshFaceMaterial.prototype = {
    constructor: THREE.MeshFaceMaterial,
    toJSON: function() {
        for (var a = {
            metadata: {
                version: 4.2,
                type: "material",
                generator: "MaterialExporter"
            },
            uuid: this.uuid,
            type: this.type,
            materials: []
        }, b = 0, c = this.materials.length; c > b; b++) a.materials.push(this.materials[b].toJSON());
        return a;
    },
    clone: function() {
        for (var a = new THREE.MeshFaceMaterial(), b = 0; b < this.materials.length; b++) a.materials.push(this.materials[b].clone());
        return a;
    }
}, THREE.PointCloudMaterial = function(a) {
    THREE.Material.call(this), this.type = "PointCloudMaterial", this.color = new THREE.Color(16777215), 
    this.map = null, this.size = 1, this.sizeAttenuation = !0, this.vertexColors = THREE.NoColors, 
    this.fog = !0, this.setValues(a);
}, THREE.PointCloudMaterial.prototype = Object.create(THREE.Material.prototype), 
THREE.PointCloudMaterial.prototype.constructor = THREE.PointCloudMaterial, THREE.PointCloudMaterial.prototype.clone = function() {
    var a = new THREE.PointCloudMaterial();
    return THREE.Material.prototype.clone.call(this, a), a.color.copy(this.color), a.map = this.map, 
    a.size = this.size, a.sizeAttenuation = this.sizeAttenuation, a.vertexColors = this.vertexColors, 
    a.fog = this.fog, a;
}, THREE.ParticleBasicMaterial = function(a) {
    return THREE.warn("THREE.ParticleBasicMaterial has been renamed to THREE.PointCloudMaterial."), 
    new THREE.PointCloudMaterial(a);
}, THREE.ParticleSystemMaterial = function(a) {
    return THREE.warn("THREE.ParticleSystemMaterial has been renamed to THREE.PointCloudMaterial."), 
    new THREE.PointCloudMaterial(a);
}, THREE.ShaderMaterial = function(a) {
    THREE.Material.call(this), this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, 
    this.attributes = null, this.vertexShader = "void main() {\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}", 
    this.fragmentShader = "void main() {\n	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}", 
    this.shading = THREE.SmoothShading, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, 
    this.lights = this.fog = !1, this.vertexColors = THREE.NoColors, this.morphNormals = this.morphTargets = this.skinning = !1, 
    this.defaultAttributeValues = {
        color: [ 1, 1, 1 ],
        uv: [ 0, 0 ],
        uv2: [ 0, 0 ]
    }, this.index0AttributeName = void 0, this.setValues(a);
}, THREE.ShaderMaterial.prototype = Object.create(THREE.Material.prototype), THREE.ShaderMaterial.prototype.constructor = THREE.ShaderMaterial, 
THREE.ShaderMaterial.prototype.clone = function() {
    var a = new THREE.ShaderMaterial();
    return THREE.Material.prototype.clone.call(this, a), a.fragmentShader = this.fragmentShader, 
    a.vertexShader = this.vertexShader, a.uniforms = THREE.UniformsUtils.clone(this.uniforms), 
    a.attributes = this.attributes, a.defines = this.defines, a.shading = this.shading, 
    a.wireframe = this.wireframe, a.wireframeLinewidth = this.wireframeLinewidth, a.fog = this.fog, 
    a.lights = this.lights, a.vertexColors = this.vertexColors, a.skinning = this.skinning, 
    a.morphTargets = this.morphTargets, a.morphNormals = this.morphNormals, a;
}, THREE.RawShaderMaterial = function(a) {
    THREE.ShaderMaterial.call(this, a), this.type = "RawShaderMaterial";
}, THREE.RawShaderMaterial.prototype = Object.create(THREE.ShaderMaterial.prototype), 
THREE.RawShaderMaterial.prototype.constructor = THREE.RawShaderMaterial, THREE.RawShaderMaterial.prototype.clone = function() {
    var a = new THREE.RawShaderMaterial();
    return THREE.ShaderMaterial.prototype.clone.call(this, a), a;
}, THREE.SpriteMaterial = function(a) {
    THREE.Material.call(this), this.type = "SpriteMaterial", this.color = new THREE.Color(16777215), 
    this.map = null, this.rotation = 0, this.fog = !1, this.setValues(a);
}, THREE.SpriteMaterial.prototype = Object.create(THREE.Material.prototype), THREE.SpriteMaterial.prototype.constructor = THREE.SpriteMaterial, 
THREE.SpriteMaterial.prototype.clone = function() {
    var a = new THREE.SpriteMaterial();
    return THREE.Material.prototype.clone.call(this, a), a.color.copy(this.color), a.map = this.map, 
    a.rotation = this.rotation, a.fog = this.fog, a;
}, THREE.Texture = function(a, b, c, d, e, f, g, h, i) {
    Object.defineProperty(this, "id", {
        value: THREE.TextureIdCount++
    }), this.uuid = THREE.Math.generateUUID(), this.sourceFile = this.name = "", this.image = void 0 !== a ? a : THREE.Texture.DEFAULT_IMAGE, 
    this.mipmaps = [], this.mapping = void 0 !== b ? b : THREE.Texture.DEFAULT_MAPPING, 
    this.wrapS = void 0 !== c ? c : THREE.ClampToEdgeWrapping, this.wrapT = void 0 !== d ? d : THREE.ClampToEdgeWrapping, 
    this.magFilter = void 0 !== e ? e : THREE.LinearFilter, this.minFilter = void 0 !== f ? f : THREE.LinearMipMapLinearFilter, 
    this.anisotropy = void 0 !== i ? i : 1, this.format = void 0 !== g ? g : THREE.RGBAFormat, 
    this.type = void 0 !== h ? h : THREE.UnsignedByteType, this.offset = new THREE.Vector2(0, 0), 
    this.repeat = new THREE.Vector2(1, 1), this.generateMipmaps = !0, this.premultiplyAlpha = !1, 
    this.flipY = !0, this.unpackAlignment = 4, this._needsUpdate = !1, this.onUpdate = null;
}, THREE.Texture.DEFAULT_IMAGE = void 0, THREE.Texture.DEFAULT_MAPPING = THREE.UVMapping, 
THREE.Texture.prototype = {
    constructor: THREE.Texture,
    get needsUpdate() {
        return this._needsUpdate;
    },
    set needsUpdate(a) {
        !0 === a && this.update(), this._needsUpdate = a;
    },
    clone: function(a) {
        return void 0 === a && (a = new THREE.Texture()), a.image = this.image, a.mipmaps = this.mipmaps.slice(0), 
        a.mapping = this.mapping, a.wrapS = this.wrapS, a.wrapT = this.wrapT, a.magFilter = this.magFilter, 
        a.minFilter = this.minFilter, a.anisotropy = this.anisotropy, a.format = this.format, 
        a.type = this.type, a.offset.copy(this.offset), a.repeat.copy(this.repeat), a.generateMipmaps = this.generateMipmaps, 
        a.premultiplyAlpha = this.premultiplyAlpha, a.flipY = this.flipY, a.unpackAlignment = this.unpackAlignment, 
        a;
    },
    update: function() {
        this.dispatchEvent({
            type: "update"
        });
    },
    dispose: function() {
        this.dispatchEvent({
            type: "dispose"
        });
    }
}, THREE.EventDispatcher.prototype.apply(THREE.Texture.prototype), THREE.TextureIdCount = 0, 
THREE.CubeTexture = function(a, b, c, d, e, f, g, h, i) {
    b = void 0 !== b ? b : THREE.CubeReflectionMapping, THREE.Texture.call(this, a, b, c, d, e, f, g, h, i), 
    this.images = a;
}, THREE.CubeTexture.prototype = Object.create(THREE.Texture.prototype), THREE.CubeTexture.prototype.constructor = THREE.CubeTexture, 
THREE.CubeTexture.clone = function(a) {
    return void 0 === a && (a = new THREE.CubeTexture()), THREE.Texture.prototype.clone.call(this, a), 
    a.images = this.images, a;
}, THREE.CompressedTexture = function(a, b, c, d, e, f, g, h, i, j, k) {
    THREE.Texture.call(this, null, f, g, h, i, j, d, e, k), this.image = {
        width: b,
        height: c
    }, this.mipmaps = a, this.generateMipmaps = this.flipY = !1;
}, THREE.CompressedTexture.prototype = Object.create(THREE.Texture.prototype), THREE.CompressedTexture.prototype.constructor = THREE.CompressedTexture, 
THREE.CompressedTexture.prototype.clone = function() {
    var a = new THREE.CompressedTexture();
    return THREE.Texture.prototype.clone.call(this, a), a;
}, THREE.DataTexture = function(a, b, c, d, e, f, g, h, i, j, k) {
    THREE.Texture.call(this, null, f, g, h, i, j, d, e, k), this.image = {
        data: a,
        width: b,
        height: c
    };
}, THREE.DataTexture.prototype = Object.create(THREE.Texture.prototype), THREE.DataTexture.prototype.constructor = THREE.DataTexture, 
THREE.DataTexture.prototype.clone = function() {
    var a = new THREE.DataTexture();
    return THREE.Texture.prototype.clone.call(this, a), a;
}, THREE.VideoTexture = function(a, b, c, d, e, f, g, h, i) {
    THREE.Texture.call(this, a, b, c, d, e, f, g, h, i), this.generateMipmaps = !1;
    var j = this, k = function() {
        requestAnimationFrame(k), a.readyState === a.HAVE_ENOUGH_DATA && (j.needsUpdate = !0);
    };
    k();
}, THREE.VideoTexture.prototype = Object.create(THREE.Texture.prototype), THREE.VideoTexture.prototype.constructor = THREE.VideoTexture, 
THREE.Group = function() {
    THREE.Object3D.call(this), this.type = "Group";
}, THREE.Group.prototype = Object.create(THREE.Object3D.prototype), THREE.Group.prototype.constructor = THREE.Group, 
THREE.PointCloud = function(a, b) {
    THREE.Object3D.call(this), this.type = "PointCloud", this.geometry = void 0 !== a ? a : new THREE.Geometry(), 
    this.material = void 0 !== b ? b : new THREE.PointCloudMaterial({
        color: 16777215 * Math.random()
    });
}, THREE.PointCloud.prototype = Object.create(THREE.Object3D.prototype), THREE.PointCloud.prototype.constructor = THREE.PointCloud, 
THREE.PointCloud.prototype.raycast = function() {
    var a = new THREE.Matrix4(), b = new THREE.Ray();
    return function(c, d) {
        var e = this, f = e.geometry, g = c.params.PointCloud.threshold;
        if (a.getInverse(this.matrixWorld), b.copy(c.ray).applyMatrix4(a), null === f.boundingBox || !1 !== b.isIntersectionBox(f.boundingBox)) {
            var h = g / ((this.scale.x + this.scale.y + this.scale.z) / 3), i = new THREE.Vector3(), g = function(a, f) {
                var g = b.distanceToPoint(a);
                if (h > g) {
                    var i = b.closestPointToPoint(a);
                    i.applyMatrix4(e.matrixWorld);
                    var j = c.ray.origin.distanceTo(i);
                    d.push({
                        distance: j,
                        distanceToRay: g,
                        point: i.clone(),
                        index: f,
                        face: null,
                        object: e
                    });
                }
            };
            if (f instanceof THREE.BufferGeometry) {
                var j = f.attributes, k = j.position.array;
                if (void 0 !== j.index) {
                    var j = j.index.array, l = f.offsets;
                    0 === l.length && (l = [ {
                        start: 0,
                        count: j.length,
                        index: 0
                    } ]);
                    for (var m = 0, n = l.length; n > m; ++m) for (var o = l[m].start, p = l[m].index, f = o, o = o + l[m].count; o > f; f++) {
                        var q = p + j[f];
                        i.fromArray(k, 3 * q), g(i, q);
                    }
                } else for (j = k.length / 3, f = 0; j > f; f++) i.set(k[3 * f], k[3 * f + 1], k[3 * f + 2]), 
                g(i, f);
            } else for (i = this.geometry.vertices, f = 0; f < i.length; f++) g(i[f], f);
        }
    };
}(), THREE.PointCloud.prototype.clone = function(a) {
    return void 0 === a && (a = new THREE.PointCloud(this.geometry, this.material)), 
    THREE.Object3D.prototype.clone.call(this, a), a;
}, THREE.ParticleSystem = function(a, b) {
    return THREE.warn("THREE.ParticleSystem has been renamed to THREE.PointCloud."), 
    new THREE.PointCloud(a, b);
}, THREE.Line = function(a, b, c) {
    THREE.Object3D.call(this), this.type = "Line", this.geometry = void 0 !== a ? a : new THREE.Geometry(), 
    this.material = void 0 !== b ? b : new THREE.LineBasicMaterial({
        color: 16777215 * Math.random()
    }), this.mode = void 0 !== c ? c : THREE.LineStrip;
}, THREE.LineStrip = 0, THREE.LinePieces = 1, THREE.Line.prototype = Object.create(THREE.Object3D.prototype), 
THREE.Line.prototype.constructor = THREE.Line, THREE.Line.prototype.raycast = function() {
    var a = new THREE.Matrix4(), b = new THREE.Ray(), c = new THREE.Sphere();
    return function(d, e) {
        var f = d.linePrecision, f = f * f, g = this.geometry;
        if (null === g.boundingSphere && g.computeBoundingSphere(), c.copy(g.boundingSphere), 
        c.applyMatrix4(this.matrixWorld), !1 !== d.ray.isIntersectionSphere(c)) {
            a.getInverse(this.matrixWorld), b.copy(d.ray).applyMatrix4(a);
            var h = new THREE.Vector3(), i = new THREE.Vector3(), j = new THREE.Vector3(), k = new THREE.Vector3(), l = this.mode === THREE.LineStrip ? 1 : 2;
            if (g instanceof THREE.BufferGeometry) {
                var m = g.attributes;
                if (void 0 !== m.index) {
                    var n = m.index.array, m = m.position.array, o = g.offsets;
                    0 === o.length && (o = [ {
                        start: 0,
                        count: n.length,
                        index: 0
                    } ]);
                    for (var p = 0; p < o.length; p++) for (var q = o[p].start, r = o[p].count, s = o[p].index, g = q; q + r - 1 > g; g += l) {
                        var t = s + n[g + 1];
                        h.fromArray(m, 3 * (s + n[g])), i.fromArray(m, 3 * t), t = b.distanceSqToSegment(h, i, k, j), 
                        t > f || (t = b.origin.distanceTo(k), t < d.near || t > d.far || e.push({
                            distance: t,
                            point: j.clone().applyMatrix4(this.matrixWorld),
                            index: g,
                            offsetIndex: p,
                            face: null,
                            faceIndex: null,
                            object: this
                        }));
                    }
                } else for (m = m.position.array, g = 0; g < m.length / 3 - 1; g += l) h.fromArray(m, 3 * g), 
                i.fromArray(m, 3 * g + 3), t = b.distanceSqToSegment(h, i, k, j), t > f || (t = b.origin.distanceTo(k), 
                t < d.near || t > d.far || e.push({
                    distance: t,
                    point: j.clone().applyMatrix4(this.matrixWorld),
                    index: g,
                    face: null,
                    faceIndex: null,
                    object: this
                }));
            } else if (g instanceof THREE.Geometry) for (h = g.vertices, i = h.length, g = 0; i - 1 > g; g += l) t = b.distanceSqToSegment(h[g], h[g + 1], k, j), 
            t > f || (t = b.origin.distanceTo(k), t < d.near || t > d.far || e.push({
                distance: t,
                point: j.clone().applyMatrix4(this.matrixWorld),
                index: g,
                face: null,
                faceIndex: null,
                object: this
            }));
        }
    };
}(), THREE.Line.prototype.clone = function(a) {
    return void 0 === a && (a = new THREE.Line(this.geometry, this.material, this.mode)), 
    THREE.Object3D.prototype.clone.call(this, a), a;
}, THREE.Mesh = function(a, b) {
    THREE.Object3D.call(this), this.type = "Mesh", this.geometry = void 0 !== a ? a : new THREE.Geometry(), 
    this.material = void 0 !== b ? b : new THREE.MeshBasicMaterial({
        color: 16777215 * Math.random()
    }), this.updateMorphTargets();
}, THREE.Mesh.prototype = Object.create(THREE.Object3D.prototype), THREE.Mesh.prototype.constructor = THREE.Mesh, 
THREE.Mesh.prototype.updateMorphTargets = function() {
    if (void 0 !== this.geometry.morphTargets && 0 < this.geometry.morphTargets.length) {
        this.morphTargetBase = -1, this.morphTargetForcedOrder = [], this.morphTargetInfluences = [], 
        this.morphTargetDictionary = {};
        for (var a = 0, b = this.geometry.morphTargets.length; b > a; a++) this.morphTargetInfluences.push(0), 
        this.morphTargetDictionary[this.geometry.morphTargets[a].name] = a;
    }
}, THREE.Mesh.prototype.getMorphTargetIndexByName = function(a) {
    return void 0 !== this.morphTargetDictionary[a] ? this.morphTargetDictionary[a] : (THREE.warn("THREE.Mesh.getMorphTargetIndexByName: morph target " + a + " does not exist. Returning 0."), 
    0);
}, THREE.Mesh.prototype.raycast = function() {
    var a = new THREE.Matrix4(), b = new THREE.Ray(), c = new THREE.Sphere(), d = new THREE.Vector3(), e = new THREE.Vector3(), f = new THREE.Vector3();
    return function(g, h) {
        var i = this.geometry;
        if (null === i.boundingSphere && i.computeBoundingSphere(), c.copy(i.boundingSphere), 
        c.applyMatrix4(this.matrixWorld), !1 !== g.ray.isIntersectionSphere(c) && (a.getInverse(this.matrixWorld), 
        b.copy(g.ray).applyMatrix4(a), null === i.boundingBox || !1 !== b.isIntersectionBox(i.boundingBox))) if (i instanceof THREE.BufferGeometry) {
            var j = this.material;
            if (void 0 !== j) {
                var k, l, m = i.attributes, n = g.precision;
                if (void 0 !== m.index) {
                    var o = m.index.array, p = m.position.array, q = i.offsets;
                    0 === q.length && (q = [ {
                        start: 0,
                        count: o.length,
                        index: 0
                    } ]);
                    for (var r = 0, s = q.length; s > r; ++r) for (var m = q[r].start, t = q[r].index, i = m, u = m + q[r].count; u > i; i += 3) {
                        m = t + o[i], k = t + o[i + 1], l = t + o[i + 2], d.fromArray(p, 3 * m), e.fromArray(p, 3 * k), 
                        f.fromArray(p, 3 * l);
                        var v = j.side === THREE.BackSide ? b.intersectTriangle(f, e, d, !0) : b.intersectTriangle(d, e, f, j.side !== THREE.DoubleSide);
                        if (null !== v) {
                            v.applyMatrix4(this.matrixWorld);
                            var w = g.ray.origin.distanceTo(v);
                            n > w || w < g.near || w > g.far || h.push({
                                distance: w,
                                point: v,
                                face: new THREE.Face3(m, k, l, THREE.Triangle.normal(d, e, f)),
                                faceIndex: null,
                                object: this
                            });
                        }
                    }
                } else for (p = m.position.array, o = i = 0, u = p.length; u > i; i += 3, o += 9) m = i, 
                k = i + 1, l = i + 2, d.fromArray(p, o), e.fromArray(p, o + 3), f.fromArray(p, o + 6), 
                v = j.side === THREE.BackSide ? b.intersectTriangle(f, e, d, !0) : b.intersectTriangle(d, e, f, j.side !== THREE.DoubleSide), 
                null !== v && (v.applyMatrix4(this.matrixWorld), w = g.ray.origin.distanceTo(v), 
                n > w || w < g.near || w > g.far || h.push({
                    distance: w,
                    point: v,
                    face: new THREE.Face3(m, k, l, THREE.Triangle.normal(d, e, f)),
                    faceIndex: null,
                    object: this
                }));
            }
        } else if (i instanceof THREE.Geometry) for (o = this.material instanceof THREE.MeshFaceMaterial, 
        p = !0 === o ? this.material.materials : null, n = g.precision, q = i.vertices, 
        r = 0, s = i.faces.length; s > r; r++) if (t = i.faces[r], j = !0 === o ? p[t.materialIndex] : this.material, 
        void 0 !== j) {
            if (m = q[t.a], k = q[t.b], l = q[t.c], !0 === j.morphTargets) {
                v = i.morphTargets, w = this.morphTargetInfluences, d.set(0, 0, 0), e.set(0, 0, 0), 
                f.set(0, 0, 0);
                for (var u = 0, x = v.length; x > u; u++) {
                    var y = w[u];
                    if (0 !== y) {
                        var z = v[u].vertices;
                        d.x += (z[t.a].x - m.x) * y, d.y += (z[t.a].y - m.y) * y, d.z += (z[t.a].z - m.z) * y, 
                        e.x += (z[t.b].x - k.x) * y, e.y += (z[t.b].y - k.y) * y, e.z += (z[t.b].z - k.z) * y, 
                        f.x += (z[t.c].x - l.x) * y, f.y += (z[t.c].y - l.y) * y, f.z += (z[t.c].z - l.z) * y;
                    }
                }
                d.add(m), e.add(k), f.add(l), m = d, k = e, l = f;
            }
            v = j.side === THREE.BackSide ? b.intersectTriangle(l, k, m, !0) : b.intersectTriangle(m, k, l, j.side !== THREE.DoubleSide), 
            null !== v && (v.applyMatrix4(this.matrixWorld), w = g.ray.origin.distanceTo(v), 
            n > w || w < g.near || w > g.far || h.push({
                distance: w,
                point: v,
                face: t,
                faceIndex: r,
                object: this
            }));
        }
    };
}(), THREE.Mesh.prototype.clone = function(a, b) {
    return void 0 === a && (a = new THREE.Mesh(this.geometry, this.material)), THREE.Object3D.prototype.clone.call(this, a, b), 
    a;
}, THREE.Bone = function(a) {
    THREE.Object3D.call(this), this.type = "Bone", this.skin = a;
}, THREE.Bone.prototype = Object.create(THREE.Object3D.prototype), THREE.Bone.prototype.constructor = THREE.Bone, 
THREE.Skeleton = function(a, b, c) {
    if (this.useVertexTexture = void 0 !== c ? c : !0, this.identityMatrix = new THREE.Matrix4(), 
    a = a || [], this.bones = a.slice(0), this.useVertexTexture ? (this.boneTextureHeight = this.boneTextureWidth = a = 256 < this.bones.length ? 64 : 64 < this.bones.length ? 32 : 16 < this.bones.length ? 16 : 8, 
    this.boneMatrices = new Float32Array(this.boneTextureWidth * this.boneTextureHeight * 4), 
    this.boneTexture = new THREE.DataTexture(this.boneMatrices, this.boneTextureWidth, this.boneTextureHeight, THREE.RGBAFormat, THREE.FloatType), 
    this.boneTexture.minFilter = THREE.NearestFilter, this.boneTexture.magFilter = THREE.NearestFilter, 
    this.boneTexture.generateMipmaps = !1, this.boneTexture.flipY = !1) : this.boneMatrices = new Float32Array(16 * this.bones.length), 
    void 0 === b) this.calculateInverses(); else if (this.bones.length === b.length) this.boneInverses = b.slice(0); else for (THREE.warn("THREE.Skeleton bonInverses is the wrong length."), 
    this.boneInverses = [], b = 0, a = this.bones.length; a > b; b++) this.boneInverses.push(new THREE.Matrix4());
}, THREE.Skeleton.prototype.calculateInverses = function() {
    this.boneInverses = [];
    for (var a = 0, b = this.bones.length; b > a; a++) {
        var c = new THREE.Matrix4();
        this.bones[a] && c.getInverse(this.bones[a].matrixWorld), this.boneInverses.push(c);
    }
}, THREE.Skeleton.prototype.pose = function() {
    for (var a, b = 0, c = this.bones.length; c > b; b++) (a = this.bones[b]) && a.matrixWorld.getInverse(this.boneInverses[b]);
    for (b = 0, c = this.bones.length; c > b; b++) (a = this.bones[b]) && (a.parent ? (a.matrix.getInverse(a.parent.matrixWorld), 
    a.matrix.multiply(a.matrixWorld)) : a.matrix.copy(a.matrixWorld), a.matrix.decompose(a.position, a.quaternion, a.scale));
}, THREE.Skeleton.prototype.update = function() {
    var a = new THREE.Matrix4();
    return function() {
        for (var b = 0, c = this.bones.length; c > b; b++) a.multiplyMatrices(this.bones[b] ? this.bones[b].matrixWorld : this.identityMatrix, this.boneInverses[b]), 
        a.flattenToArrayOffset(this.boneMatrices, 16 * b);
        this.useVertexTexture && (this.boneTexture.needsUpdate = !0);
    };
}(), THREE.SkinnedMesh = function(a, b, c) {
    if (THREE.Mesh.call(this, a, b), this.type = "SkinnedMesh", this.bindMode = "attached", 
    this.bindMatrix = new THREE.Matrix4(), this.bindMatrixInverse = new THREE.Matrix4(), 
    a = [], this.geometry && void 0 !== this.geometry.bones) {
        for (var d, e, f, g, h = 0, i = this.geometry.bones.length; i > h; ++h) d = this.geometry.bones[h], 
        e = d.pos, f = d.rotq, g = d.scl, b = new THREE.Bone(this), a.push(b), b.name = d.name, 
        b.position.set(e[0], e[1], e[2]), b.quaternion.set(f[0], f[1], f[2], f[3]), void 0 !== g ? b.scale.set(g[0], g[1], g[2]) : b.scale.set(1, 1, 1);
        for (h = 0, i = this.geometry.bones.length; i > h; ++h) d = this.geometry.bones[h], 
        -1 !== d.parent ? a[d.parent].add(a[h]) : this.add(a[h]);
    }
    this.normalizeSkinWeights(), this.updateMatrixWorld(!0), this.bind(new THREE.Skeleton(a, void 0, c));
}, THREE.SkinnedMesh.prototype = Object.create(THREE.Mesh.prototype), THREE.SkinnedMesh.prototype.constructor = THREE.SkinnedMesh, 
THREE.SkinnedMesh.prototype.bind = function(a, b) {
    this.skeleton = a, void 0 === b && (this.updateMatrixWorld(!0), b = this.matrixWorld), 
    this.bindMatrix.copy(b), this.bindMatrixInverse.getInverse(b);
}, THREE.SkinnedMesh.prototype.pose = function() {
    this.skeleton.pose();
}, THREE.SkinnedMesh.prototype.normalizeSkinWeights = function() {
    if (this.geometry instanceof THREE.Geometry) for (var a = 0; a < this.geometry.skinIndices.length; a++) {
        var b = this.geometry.skinWeights[a], c = 1 / b.lengthManhattan();
        1/0 !== c ? b.multiplyScalar(c) : b.set(1);
    }
}, THREE.SkinnedMesh.prototype.updateMatrixWorld = function() {
    THREE.Mesh.prototype.updateMatrixWorld.call(this, !0), "attached" === this.bindMode ? this.bindMatrixInverse.getInverse(this.matrixWorld) : "detached" === this.bindMode ? this.bindMatrixInverse.getInverse(this.bindMatrix) : THREE.warn("THREE.SkinnedMesh unreckognized bindMode: " + this.bindMode);
}, THREE.SkinnedMesh.prototype.clone = function(a) {
    return void 0 === a && (a = new THREE.SkinnedMesh(this.geometry, this.material, this.useVertexTexture)), 
    THREE.Mesh.prototype.clone.call(this, a), a;
}, THREE.MorphAnimMesh = function(a, b) {
    THREE.Mesh.call(this, a, b), this.type = "MorphAnimMesh", this.duration = 1e3, this.mirroredLoop = !1, 
    this.currentKeyframe = this.lastKeyframe = this.time = 0, this.direction = 1, this.directionBackwards = !1, 
    this.setFrameRange(0, this.geometry.morphTargets.length - 1);
}, THREE.MorphAnimMesh.prototype = Object.create(THREE.Mesh.prototype), THREE.MorphAnimMesh.prototype.constructor = THREE.MorphAnimMesh, 
THREE.MorphAnimMesh.prototype.setFrameRange = function(a, b) {
    this.startKeyframe = a, this.endKeyframe = b, this.length = this.endKeyframe - this.startKeyframe + 1;
}, THREE.MorphAnimMesh.prototype.setDirectionForward = function() {
    this.direction = 1, this.directionBackwards = !1;
}, THREE.MorphAnimMesh.prototype.setDirectionBackward = function() {
    this.direction = -1, this.directionBackwards = !0;
}, THREE.MorphAnimMesh.prototype.parseAnimations = function() {
    var a = this.geometry;
    a.animations || (a.animations = {});
    for (var b, c = a.animations, d = /([a-z]+)_?(\d+)/, e = 0, f = a.morphTargets.length; f > e; e++) {
        var g = a.morphTargets[e].name.match(d);
        if (g && 1 < g.length) {
            g = g[1], c[g] || (c[g] = {
                start: 1/0,
                end: -1/0
            });
            var h = c[g];
            e < h.start && (h.start = e), e > h.end && (h.end = e), b || (b = g);
        }
    }
    a.firstAnimation = b;
}, THREE.MorphAnimMesh.prototype.setAnimationLabel = function(a, b, c) {
    this.geometry.animations || (this.geometry.animations = {}), this.geometry.animations[a] = {
        start: b,
        end: c
    };
}, THREE.MorphAnimMesh.prototype.playAnimation = function(a, b) {
    var c = this.geometry.animations[a];
    c ? (this.setFrameRange(c.start, c.end), this.duration = (c.end - c.start) / b * 1e3, 
    this.time = 0) : THREE.warn("THREE.MorphAnimMesh: animation[" + a + "] undefined in .playAnimation()");
}, THREE.MorphAnimMesh.prototype.updateAnimation = function(a) {
    var b = this.duration / this.length;
    this.time += this.direction * a, this.mirroredLoop ? (this.time > this.duration || 0 > this.time) && (this.direction *= -1, 
    this.time > this.duration && (this.time = this.duration, this.directionBackwards = !0), 
    0 > this.time && (this.time = 0, this.directionBackwards = !1)) : (this.time %= this.duration, 
    0 > this.time && (this.time += this.duration)), a = this.startKeyframe + THREE.Math.clamp(Math.floor(this.time / b), 0, this.length - 1), 
    a !== this.currentKeyframe && (this.morphTargetInfluences[this.lastKeyframe] = 0, 
    this.morphTargetInfluences[this.currentKeyframe] = 1, this.morphTargetInfluences[a] = 0, 
    this.lastKeyframe = this.currentKeyframe, this.currentKeyframe = a), b = this.time % b / b, 
    this.directionBackwards && (b = 1 - b), this.morphTargetInfluences[this.currentKeyframe] = b, 
    this.morphTargetInfluences[this.lastKeyframe] = 1 - b;
}, THREE.MorphAnimMesh.prototype.interpolateTargets = function(a, b, c) {
    for (var d = this.morphTargetInfluences, e = 0, f = d.length; f > e; e++) d[e] = 0;
    a > -1 && (d[a] = 1 - c), b > -1 && (d[b] = c);
}, THREE.MorphAnimMesh.prototype.clone = function(a) {
    return void 0 === a && (a = new THREE.MorphAnimMesh(this.geometry, this.material)), 
    a.duration = this.duration, a.mirroredLoop = this.mirroredLoop, a.time = this.time, 
    a.lastKeyframe = this.lastKeyframe, a.currentKeyframe = this.currentKeyframe, a.direction = this.direction, 
    a.directionBackwards = this.directionBackwards, THREE.Mesh.prototype.clone.call(this, a), 
    a;
}, THREE.LOD = function() {
    THREE.Object3D.call(this), this.objects = [];
}, THREE.LOD.prototype = Object.create(THREE.Object3D.prototype), THREE.LOD.prototype.constructor = THREE.LOD, 
THREE.LOD.prototype.addLevel = function(a, b) {
    void 0 === b && (b = 0), b = Math.abs(b);
    for (var c = 0; c < this.objects.length && !(b < this.objects[c].distance); c++) ;
    this.objects.splice(c, 0, {
        distance: b,
        object: a
    }), this.add(a);
}, THREE.LOD.prototype.getObjectForDistance = function(a) {
    for (var b = 1, c = this.objects.length; c > b && !(a < this.objects[b].distance); b++) ;
    return this.objects[b - 1].object;
}, THREE.LOD.prototype.raycast = function() {
    var a = new THREE.Vector3();
    return function(b, c) {
        a.setFromMatrixPosition(this.matrixWorld);
        var d = b.ray.origin.distanceTo(a);
        this.getObjectForDistance(d).raycast(b, c);
    };
}(), THREE.LOD.prototype.update = function() {
    var a = new THREE.Vector3(), b = new THREE.Vector3();
    return function(c) {
        if (1 < this.objects.length) {
            a.setFromMatrixPosition(c.matrixWorld), b.setFromMatrixPosition(this.matrixWorld), 
            c = a.distanceTo(b), this.objects[0].object.visible = !0;
            for (var d = 1, e = this.objects.length; e > d && c >= this.objects[d].distance; d++) this.objects[d - 1].object.visible = !1, 
            this.objects[d].object.visible = !0;
            for (;e > d; d++) this.objects[d].object.visible = !1;
        }
    };
}(), THREE.LOD.prototype.clone = function(a) {
    void 0 === a && (a = new THREE.LOD()), THREE.Object3D.prototype.clone.call(this, a);
    for (var b = 0, c = this.objects.length; c > b; b++) {
        var d = this.objects[b].object.clone();
        d.visible = 0 === b, a.addLevel(d, this.objects[b].distance);
    }
    return a;
}, THREE.Sprite = function() {
    var a = new Uint16Array([ 0, 1, 2, 0, 2, 3 ]), b = new Float32Array([ -.5, -.5, 0, .5, -.5, 0, .5, .5, 0, -.5, .5, 0 ]), c = new Float32Array([ 0, 0, 1, 0, 1, 1, 0, 1 ]), d = new THREE.BufferGeometry();
    return d.addAttribute("index", new THREE.BufferAttribute(a, 1)), d.addAttribute("position", new THREE.BufferAttribute(b, 3)), 
    d.addAttribute("uv", new THREE.BufferAttribute(c, 2)), function(a) {
        THREE.Object3D.call(this), this.type = "Sprite", this.geometry = d, this.material = void 0 !== a ? a : new THREE.SpriteMaterial();
    };
}(), THREE.Sprite.prototype = Object.create(THREE.Object3D.prototype), THREE.Sprite.prototype.constructor = THREE.Sprite, 
THREE.Sprite.prototype.raycast = function() {
    var a = new THREE.Vector3();
    return function(b, c) {
        a.setFromMatrixPosition(this.matrixWorld);
        var d = b.ray.distanceToPoint(a);
        d > this.scale.x || c.push({
            distance: d,
            point: this.position,
            face: null,
            object: this
        });
    };
}(), THREE.Sprite.prototype.clone = function(a) {
    return void 0 === a && (a = new THREE.Sprite(this.material)), THREE.Object3D.prototype.clone.call(this, a), 
    a;
}, THREE.Particle = THREE.Sprite, THREE.LensFlare = function(a, b, c, d, e) {
    THREE.Object3D.call(this), this.lensFlares = [], this.positionScreen = new THREE.Vector3(), 
    this.customUpdateCallback = void 0, void 0 !== a && this.add(a, b, c, d, e);
}, THREE.LensFlare.prototype = Object.create(THREE.Object3D.prototype), THREE.LensFlare.prototype.constructor = THREE.LensFlare, 
THREE.LensFlare.prototype.add = function(a, b, c, d, e, f) {
    void 0 === b && (b = -1), void 0 === c && (c = 0), void 0 === f && (f = 1), void 0 === e && (e = new THREE.Color(16777215)), 
    void 0 === d && (d = THREE.NormalBlending), c = Math.min(c, Math.max(0, c)), this.lensFlares.push({
        texture: a,
        size: b,
        distance: c,
        x: 0,
        y: 0,
        z: 0,
        scale: 1,
        rotation: 1,
        opacity: f,
        color: e,
        blending: d
    });
}, THREE.LensFlare.prototype.updateLensFlares = function() {
    var a, b, c = this.lensFlares.length, d = 2 * -this.positionScreen.x, e = 2 * -this.positionScreen.y;
    for (a = 0; c > a; a++) b = this.lensFlares[a], b.x = this.positionScreen.x + d * b.distance, 
    b.y = this.positionScreen.y + e * b.distance, b.wantedRotation = b.x * Math.PI * .25, 
    b.rotation += .25 * (b.wantedRotation - b.rotation);
}, THREE.Scene = function() {
    THREE.Object3D.call(this), this.type = "Scene", this.overrideMaterial = this.fog = null, 
    this.autoUpdate = !0;
}, THREE.Scene.prototype = Object.create(THREE.Object3D.prototype), THREE.Scene.prototype.constructor = THREE.Scene, 
THREE.Scene.prototype.clone = function(a) {
    return void 0 === a && (a = new THREE.Scene()), THREE.Object3D.prototype.clone.call(this, a), 
    null !== this.fog && (a.fog = this.fog.clone()), null !== this.overrideMaterial && (a.overrideMaterial = this.overrideMaterial.clone()), 
    a.autoUpdate = this.autoUpdate, a.matrixAutoUpdate = this.matrixAutoUpdate, a;
}, THREE.Fog = function(a, b, c) {
    this.name = "", this.color = new THREE.Color(a), this.near = void 0 !== b ? b : 1, 
    this.far = void 0 !== c ? c : 1e3;
}, THREE.Fog.prototype.clone = function() {
    return new THREE.Fog(this.color.getHex(), this.near, this.far);
}, THREE.FogExp2 = function(a, b) {
    this.name = "", this.color = new THREE.Color(a), this.density = void 0 !== b ? b : 25e-5;
}, THREE.FogExp2.prototype.clone = function() {
    return new THREE.FogExp2(this.color.getHex(), this.density);
}, THREE.ShaderChunk = {}, THREE.ShaderChunk.common = "#define PI 3.14159\n#define PI2 6.28318\n#define RECIPROCAL_PI2 0.15915494\n#define LOG2 1.442695\n#define EPSILON 1e-6\n\nfloat square( in float a ) { return a*a; }\nvec2  square( in vec2 a )  { return vec2( a.x*a.x, a.y*a.y ); }\nvec3  square( in vec3 a )  { return vec3( a.x*a.x, a.y*a.y, a.z*a.z ); }\nvec4  square( in vec4 a )  { return vec4( a.x*a.x, a.y*a.y, a.z*a.z, a.w*a.w ); }\nfloat saturate( in float a ) { return clamp( a, 0.0, 1.0 ); }\nvec2  saturate( in vec2 a )  { return clamp( a, 0.0, 1.0 ); }\nvec3  saturate( in vec3 a )  { return clamp( a, 0.0, 1.0 ); }\nvec4  saturate( in vec4 a )  { return clamp( a, 0.0, 1.0 ); }\nfloat average( in float a ) { return a; }\nfloat average( in vec2 a )  { return ( a.x + a.y) * 0.5; }\nfloat average( in vec3 a )  { return ( a.x + a.y + a.z) / 3.0; }\nfloat average( in vec4 a )  { return ( a.x + a.y + a.z + a.w) * 0.25; }\nfloat whiteCompliment( in float a ) { return saturate( 1.0 - a ); }\nvec2  whiteCompliment( in vec2 a )  { return saturate( vec2(1.0) - a ); }\nvec3  whiteCompliment( in vec3 a )  { return saturate( vec3(1.0) - a ); }\nvec4  whiteCompliment( in vec4 a )  { return saturate( vec4(1.0) - a ); }\nvec3 transformDirection( in vec3 normal, in mat4 matrix ) {\n	return normalize( ( matrix * vec4( normal, 0.0 ) ).xyz );\n}\n// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations\nvec3 inverseTransformDirection( in vec3 normal, in mat4 matrix ) {\n	return normalize( ( vec4( normal, 0.0 ) * matrix ).xyz );\n}\nvec3 projectOnPlane(in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal) {\n	float distance = dot( planeNormal, point-pointOnPlane );\n	return point - distance * planeNormal;\n}\nfloat sideOfPlane( in vec3 point, in vec3 pointOnPlane, in vec3 planeNormal ) {\n	return sign( dot( point - pointOnPlane, planeNormal ) );\n}\nvec3 linePlaneIntersect( in vec3 pointOnLine, in vec3 lineDirection, in vec3 pointOnPlane, in vec3 planeNormal ) {\n	return pointOnLine + lineDirection * ( dot( planeNormal, pointOnPlane - pointOnLine ) / dot( planeNormal, lineDirection ) );\n}\nfloat calcLightAttenuation( float lightDistance, float cutoffDistance, float decayExponent ) {\n	if ( decayExponent > 0.0 ) {\n	  return pow( saturate( 1.0 - lightDistance / cutoffDistance ), decayExponent );\n	}\n	return 1.0;\n}\n\nvec3 inputToLinear( in vec3 a ) {\n#ifdef GAMMA_INPUT\n	return pow( a, vec3( float( GAMMA_FACTOR ) ) );\n#else\n	return a;\n#endif\n}\nvec3 linearToOutput( in vec3 a ) {\n#ifdef GAMMA_OUTPUT\n	return pow( a, vec3( 1.0 / float( GAMMA_FACTOR ) ) );\n#else\n	return a;\n#endif\n}\n", 
THREE.ShaderChunk.alphatest_fragment = "#ifdef ALPHATEST\n\n	if ( diffuseColor.a < ALPHATEST ) discard;\n\n#endif\n", 
THREE.ShaderChunk.lights_lambert_vertex = "vLightFront = vec3( 0.0 );\n\n#ifdef DOUBLE_SIDED\n\n	vLightBack = vec3( 0.0 );\n\n#endif\n\ntransformedNormal = normalize( transformedNormal );\n\n#if MAX_DIR_LIGHTS > 0\n\nfor( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n\n	vec3 dirVector = transformDirection( directionalLightDirection[ i ], viewMatrix );\n\n	float dotProduct = dot( transformedNormal, dirVector );\n	vec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );\n\n	#ifdef DOUBLE_SIDED\n\n		vec3 directionalLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );\n\n		#ifdef WRAP_AROUND\n\n			vec3 directionalLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );\n\n		#endif\n\n	#endif\n\n	#ifdef WRAP_AROUND\n\n		vec3 directionalLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );\n		directionalLightWeighting = mix( directionalLightWeighting, directionalLightWeightingHalf, wrapRGB );\n\n		#ifdef DOUBLE_SIDED\n\n			directionalLightWeightingBack = mix( directionalLightWeightingBack, directionalLightWeightingHalfBack, wrapRGB );\n\n		#endif\n\n	#endif\n\n	vLightFront += directionalLightColor[ i ] * directionalLightWeighting;\n\n	#ifdef DOUBLE_SIDED\n\n		vLightBack += directionalLightColor[ i ] * directionalLightWeightingBack;\n\n	#endif\n\n}\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n	for( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\n\n		vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\n		vec3 lVector = lPosition.xyz - mvPosition.xyz;\n\n		float attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );\n\n		lVector = normalize( lVector );\n		float dotProduct = dot( transformedNormal, lVector );\n\n		vec3 pointLightWeighting = vec3( max( dotProduct, 0.0 ) );\n\n		#ifdef DOUBLE_SIDED\n\n			vec3 pointLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );\n\n			#ifdef WRAP_AROUND\n\n				vec3 pointLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );\n\n			#endif\n\n		#endif\n\n		#ifdef WRAP_AROUND\n\n			vec3 pointLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );\n			pointLightWeighting = mix( pointLightWeighting, pointLightWeightingHalf, wrapRGB );\n\n			#ifdef DOUBLE_SIDED\n\n				pointLightWeightingBack = mix( pointLightWeightingBack, pointLightWeightingHalfBack, wrapRGB );\n\n			#endif\n\n		#endif\n\n		vLightFront += pointLightColor[ i ] * pointLightWeighting * attenuation;\n\n		#ifdef DOUBLE_SIDED\n\n			vLightBack += pointLightColor[ i ] * pointLightWeightingBack * attenuation;\n\n		#endif\n\n	}\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n	for( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\n\n		vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );\n		vec3 lVector = lPosition.xyz - mvPosition.xyz;\n\n		float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - worldPosition.xyz ) );\n\n		if ( spotEffect > spotLightAngleCos[ i ] ) {\n\n			spotEffect = max( pow( max( spotEffect, 0.0 ), spotLightExponent[ i ] ), 0.0 );\n\n			float attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );\n\n			lVector = normalize( lVector );\n\n			float dotProduct = dot( transformedNormal, lVector );\n			vec3 spotLightWeighting = vec3( max( dotProduct, 0.0 ) );\n\n			#ifdef DOUBLE_SIDED\n\n				vec3 spotLightWeightingBack = vec3( max( -dotProduct, 0.0 ) );\n\n				#ifdef WRAP_AROUND\n\n					vec3 spotLightWeightingHalfBack = vec3( max( -0.5 * dotProduct + 0.5, 0.0 ) );\n\n				#endif\n\n			#endif\n\n			#ifdef WRAP_AROUND\n\n				vec3 spotLightWeightingHalf = vec3( max( 0.5 * dotProduct + 0.5, 0.0 ) );\n				spotLightWeighting = mix( spotLightWeighting, spotLightWeightingHalf, wrapRGB );\n\n				#ifdef DOUBLE_SIDED\n\n					spotLightWeightingBack = mix( spotLightWeightingBack, spotLightWeightingHalfBack, wrapRGB );\n\n				#endif\n\n			#endif\n\n			vLightFront += spotLightColor[ i ] * spotLightWeighting * attenuation * spotEffect;\n\n			#ifdef DOUBLE_SIDED\n\n				vLightBack += spotLightColor[ i ] * spotLightWeightingBack * attenuation * spotEffect;\n\n			#endif\n\n		}\n\n	}\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\n\n		vec3 lVector = transformDirection( hemisphereLightDirection[ i ], viewMatrix );\n\n		float dotProduct = dot( transformedNormal, lVector );\n\n		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\n		float hemiDiffuseWeightBack = -0.5 * dotProduct + 0.5;\n\n		vLightFront += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\n\n		#ifdef DOUBLE_SIDED\n\n			vLightBack += mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeightBack );\n\n		#endif\n\n	}\n\n#endif\n\nvLightFront += ambientLightColor;\n\n#ifdef DOUBLE_SIDED\n\n	vLightBack += ambientLightColor;\n\n#endif\n", 
THREE.ShaderChunk.map_particle_pars_fragment = "#ifdef USE_MAP\n\n	uniform vec4 offsetRepeat;\n	uniform sampler2D map;\n\n#endif\n", 
THREE.ShaderChunk.default_vertex = "#ifdef USE_SKINNING\n\n	vec4 mvPosition = modelViewMatrix * skinned;\n\n#elif defined( USE_MORPHTARGETS )\n\n	vec4 mvPosition = modelViewMatrix * vec4( morphed, 1.0 );\n\n#else\n\n	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n\n#endif\n\ngl_Position = projectionMatrix * mvPosition;\n", 
THREE.ShaderChunk.map_pars_fragment = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP )\n\n	varying vec2 vUv;\n\n#endif\n\n#ifdef USE_MAP\n\n	uniform sampler2D map;\n\n#endif", 
THREE.ShaderChunk.skinnormal_vertex = "#ifdef USE_SKINNING\n\n	mat4 skinMatrix = mat4( 0.0 );\n	skinMatrix += skinWeight.x * boneMatX;\n	skinMatrix += skinWeight.y * boneMatY;\n	skinMatrix += skinWeight.z * boneMatZ;\n	skinMatrix += skinWeight.w * boneMatW;\n	skinMatrix  = bindMatrixInverse * skinMatrix * bindMatrix;\n\n	#ifdef USE_MORPHNORMALS\n\n	vec4 skinnedNormal = skinMatrix * vec4( morphedNormal, 0.0 );\n\n	#else\n\n	vec4 skinnedNormal = skinMatrix * vec4( normal, 0.0 );\n\n	#endif\n\n#endif\n", 
THREE.ShaderChunk.logdepthbuf_pars_vertex = "#ifdef USE_LOGDEPTHBUF\n\n	#ifdef USE_LOGDEPTHBUF_EXT\n\n		varying float vFragDepth;\n\n	#endif\n\n	uniform float logDepthBufFC;\n\n#endif", 
THREE.ShaderChunk.lightmap_pars_vertex = "#ifdef USE_LIGHTMAP\n\n	varying vec2 vUv2;\n\n#endif", 
THREE.ShaderChunk.lights_phong_fragment = "#ifndef FLAT_SHADED\n\n	vec3 normal = normalize( vNormal );\n\n	#ifdef DOUBLE_SIDED\n\n		normal = normal * ( -1.0 + 2.0 * float( gl_FrontFacing ) );\n\n	#endif\n\n#else\n\n	vec3 fdx = dFdx( vViewPosition );\n	vec3 fdy = dFdy( vViewPosition );\n	vec3 normal = normalize( cross( fdx, fdy ) );\n\n#endif\n\nvec3 viewPosition = normalize( vViewPosition );\n\n#ifdef USE_NORMALMAP\n\n	normal = perturbNormal2Arb( -vViewPosition, normal );\n\n#elif defined( USE_BUMPMAP )\n\n	normal = perturbNormalArb( -vViewPosition, normal, dHdxy_fwd() );\n\n#endif\n\nvec3 totalDiffuseLight = vec3( 0.0 );\nvec3 totalSpecularLight = vec3( 0.0 );\n\n#if MAX_POINT_LIGHTS > 0\n\n	for ( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {\n\n		vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );\n		vec3 lVector = lPosition.xyz + vViewPosition.xyz;\n\n		float attenuation = calcLightAttenuation( length( lVector ), pointLightDistance[ i ], pointLightDecay[ i ] );\n\n		lVector = normalize( lVector );\n\n		// diffuse\n\n		float dotProduct = dot( normal, lVector );\n\n		#ifdef WRAP_AROUND\n\n			float pointDiffuseWeightFull = max( dotProduct, 0.0 );\n			float pointDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\n\n			vec3 pointDiffuseWeight = mix( vec3( pointDiffuseWeightFull ), vec3( pointDiffuseWeightHalf ), wrapRGB );\n\n		#else\n\n			float pointDiffuseWeight = max( dotProduct, 0.0 );\n\n		#endif\n\n		totalDiffuseLight += pointLightColor[ i ] * pointDiffuseWeight * attenuation;\n\n				// specular\n\n		vec3 pointHalfVector = normalize( lVector + viewPosition );\n		float pointDotNormalHalf = max( dot( normal, pointHalfVector ), 0.0 );\n		float pointSpecularWeight = specularStrength * max( pow( pointDotNormalHalf, shininess ), 0.0 );\n\n		float specularNormalization = ( shininess + 2.0 ) / 8.0;\n\n		vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, pointHalfVector ), 0.0 ), 5.0 );\n		totalSpecularLight += schlick * pointLightColor[ i ] * pointSpecularWeight * pointDiffuseWeight * attenuation * specularNormalization;\n\n	}\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n	for ( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {\n\n		vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );\n		vec3 lVector = lPosition.xyz + vViewPosition.xyz;\n\n		float attenuation = calcLightAttenuation( length( lVector ), spotLightDistance[ i ], spotLightDecay[ i ] );\n\n		lVector = normalize( lVector );\n\n		float spotEffect = dot( spotLightDirection[ i ], normalize( spotLightPosition[ i ] - vWorldPosition ) );\n\n		if ( spotEffect > spotLightAngleCos[ i ] ) {\n\n			spotEffect = max( pow( max( spotEffect, 0.0 ), spotLightExponent[ i ] ), 0.0 );\n\n			// diffuse\n\n			float dotProduct = dot( normal, lVector );\n\n			#ifdef WRAP_AROUND\n\n				float spotDiffuseWeightFull = max( dotProduct, 0.0 );\n				float spotDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\n\n				vec3 spotDiffuseWeight = mix( vec3( spotDiffuseWeightFull ), vec3( spotDiffuseWeightHalf ), wrapRGB );\n\n			#else\n\n				float spotDiffuseWeight = max( dotProduct, 0.0 );\n\n			#endif\n\n			totalDiffuseLight += spotLightColor[ i ] * spotDiffuseWeight * attenuation * spotEffect;\n\n			// specular\n\n			vec3 spotHalfVector = normalize( lVector + viewPosition );\n			float spotDotNormalHalf = max( dot( normal, spotHalfVector ), 0.0 );\n			float spotSpecularWeight = specularStrength * max( pow( spotDotNormalHalf, shininess ), 0.0 );\n\n			float specularNormalization = ( shininess + 2.0 ) / 8.0;\n\n			vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, spotHalfVector ), 0.0 ), 5.0 );\n			totalSpecularLight += schlick * spotLightColor[ i ] * spotSpecularWeight * spotDiffuseWeight * attenuation * specularNormalization * spotEffect;\n\n		}\n\n	}\n\n#endif\n\n#if MAX_DIR_LIGHTS > 0\n\n	for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {\n\n		vec3 dirVector = transformDirection( directionalLightDirection[ i ], viewMatrix );\n\n		// diffuse\n\n		float dotProduct = dot( normal, dirVector );\n\n		#ifdef WRAP_AROUND\n\n			float dirDiffuseWeightFull = max( dotProduct, 0.0 );\n			float dirDiffuseWeightHalf = max( 0.5 * dotProduct + 0.5, 0.0 );\n\n			vec3 dirDiffuseWeight = mix( vec3( dirDiffuseWeightFull ), vec3( dirDiffuseWeightHalf ), wrapRGB );\n\n		#else\n\n			float dirDiffuseWeight = max( dotProduct, 0.0 );\n\n		#endif\n\n		totalDiffuseLight += directionalLightColor[ i ] * dirDiffuseWeight;\n\n		// specular\n\n		vec3 dirHalfVector = normalize( dirVector + viewPosition );\n		float dirDotNormalHalf = max( dot( normal, dirHalfVector ), 0.0 );\n		float dirSpecularWeight = specularStrength * max( pow( dirDotNormalHalf, shininess ), 0.0 );\n\n		/*\n		// fresnel term from skin shader\n		const float F0 = 0.128;\n\n		float base = 1.0 - dot( viewPosition, dirHalfVector );\n		float exponential = pow( base, 5.0 );\n\n		float fresnel = exponential + F0 * ( 1.0 - exponential );\n		*/\n\n		/*\n		// fresnel term from fresnel shader\n		const float mFresnelBias = 0.08;\n		const float mFresnelScale = 0.3;\n		const float mFresnelPower = 5.0;\n\n		float fresnel = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( -viewPosition ), normal ), mFresnelPower );\n		*/\n\n		float specularNormalization = ( shininess + 2.0 ) / 8.0;\n\n		// 		dirSpecular += specular * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization * fresnel;\n\n		vec3 schlick = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( dirVector, dirHalfVector ), 0.0 ), 5.0 );\n		totalSpecularLight += schlick * directionalLightColor[ i ] * dirSpecularWeight * dirDiffuseWeight * specularNormalization;\n\n\n	}\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n	for( int i = 0; i < MAX_HEMI_LIGHTS; i ++ ) {\n\n		vec3 lVector = transformDirection( hemisphereLightDirection[ i ], viewMatrix );\n\n		// diffuse\n\n		float dotProduct = dot( normal, lVector );\n		float hemiDiffuseWeight = 0.5 * dotProduct + 0.5;\n\n		vec3 hemiColor = mix( hemisphereLightGroundColor[ i ], hemisphereLightSkyColor[ i ], hemiDiffuseWeight );\n\n		totalDiffuseLight += hemiColor;\n\n		// specular (sky light)\n\n		vec3 hemiHalfVectorSky = normalize( lVector + viewPosition );\n		float hemiDotNormalHalfSky = 0.5 * dot( normal, hemiHalfVectorSky ) + 0.5;\n		float hemiSpecularWeightSky = specularStrength * max( pow( max( hemiDotNormalHalfSky, 0.0 ), shininess ), 0.0 );\n\n		// specular (ground light)\n\n		vec3 lVectorGround = -lVector;\n\n		vec3 hemiHalfVectorGround = normalize( lVectorGround + viewPosition );\n		float hemiDotNormalHalfGround = 0.5 * dot( normal, hemiHalfVectorGround ) + 0.5;\n		float hemiSpecularWeightGround = specularStrength * max( pow( max( hemiDotNormalHalfGround, 0.0 ), shininess ), 0.0 );\n\n		float dotProductGround = dot( normal, lVectorGround );\n\n		float specularNormalization = ( shininess + 2.0 ) / 8.0;\n\n		vec3 schlickSky = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVector, hemiHalfVectorSky ), 0.0 ), 5.0 );\n		vec3 schlickGround = specular + vec3( 1.0 - specular ) * pow( max( 1.0 - dot( lVectorGround, hemiHalfVectorGround ), 0.0 ), 5.0 );\n		totalSpecularLight += hemiColor * specularNormalization * ( schlickSky * hemiSpecularWeightSky * max( dotProduct, 0.0 ) + schlickGround * hemiSpecularWeightGround * max( dotProductGround, 0.0 ) );\n\n	}\n\n#endif\n\n#ifdef METAL\n\n	outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + ambientLightColor ) * specular + totalSpecularLight + emissive;\n\n#else\n\n	outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + ambientLightColor ) + totalSpecularLight + emissive;\n\n#endif\n", 
THREE.ShaderChunk.fog_pars_fragment = "#ifdef USE_FOG\n\n	uniform vec3 fogColor;\n\n	#ifdef FOG_EXP2\n\n		uniform float fogDensity;\n\n	#else\n\n		uniform float fogNear;\n		uniform float fogFar;\n	#endif\n\n#endif", 
THREE.ShaderChunk.morphnormal_vertex = "#ifdef USE_MORPHNORMALS\n\n	vec3 morphedNormal = vec3( 0.0 );\n\n	morphedNormal += ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];\n	morphedNormal += ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];\n	morphedNormal += ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];\n	morphedNormal += ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];\n\n	morphedNormal += normal;\n\n#endif", 
THREE.ShaderChunk.envmap_pars_fragment = "#ifdef USE_ENVMAP\n\n	uniform float reflectivity;\n	#ifdef ENVMAP_TYPE_CUBE\n		uniform samplerCube envMap;\n	#else\n		uniform sampler2D envMap;\n	#endif\n	uniform float flipEnvMap;\n\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\n		uniform float refractionRatio;\n\n	#else\n\n		varying vec3 vReflect;\n\n	#endif\n\n#endif\n", 
THREE.ShaderChunk.logdepthbuf_fragment = "#if defined(USE_LOGDEPTHBUF) && defined(USE_LOGDEPTHBUF_EXT)\n\n	gl_FragDepthEXT = log2(vFragDepth) * logDepthBufFC * 0.5;\n\n#endif", 
THREE.ShaderChunk.normalmap_pars_fragment = "#ifdef USE_NORMALMAP\n\n	uniform sampler2D normalMap;\n	uniform vec2 normalScale;\n\n	// Per-Pixel Tangent Space Normal Mapping\n	// http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html\n\n	vec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm ) {\n\n		vec3 q0 = dFdx( eye_pos.xyz );\n		vec3 q1 = dFdy( eye_pos.xyz );\n		vec2 st0 = dFdx( vUv.st );\n		vec2 st1 = dFdy( vUv.st );\n\n		vec3 S = normalize( q0 * st1.t - q1 * st0.t );\n		vec3 T = normalize( -q0 * st1.s + q1 * st0.s );\n		vec3 N = normalize( surf_norm );\n\n		vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;\n		mapN.xy = normalScale * mapN.xy;\n		mat3 tsn = mat3( S, T, N );\n		return normalize( tsn * mapN );\n\n	}\n\n#endif\n", 
THREE.ShaderChunk.lights_phong_pars_vertex = "#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )\n\n	varying vec3 vWorldPosition;\n\n#endif\n", 
THREE.ShaderChunk.lightmap_pars_fragment = "#ifdef USE_LIGHTMAP\n\n	varying vec2 vUv2;\n	uniform sampler2D lightMap;\n\n#endif", 
THREE.ShaderChunk.shadowmap_vertex = "#ifdef USE_SHADOWMAP\n\n	for( int i = 0; i < MAX_SHADOWS; i ++ ) {\n\n		vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;\n\n	}\n\n#endif", 
THREE.ShaderChunk.lights_phong_vertex = "#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )\n\n	vWorldPosition = worldPosition.xyz;\n\n#endif", 
THREE.ShaderChunk.map_fragment = "#ifdef USE_MAP\n\n	vec4 texelColor = texture2D( map, vUv );\n\n	texelColor.xyz = inputToLinear( texelColor.xyz );\n\n	diffuseColor *= texelColor;\n\n#endif", 
THREE.ShaderChunk.lightmap_vertex = "#ifdef USE_LIGHTMAP\n\n	vUv2 = uv2;\n\n#endif", 
THREE.ShaderChunk.map_particle_fragment = "#ifdef USE_MAP\n\n	diffuseColor *= texture2D( map, vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y ) * offsetRepeat.zw + offsetRepeat.xy );\n\n#endif\n", 
THREE.ShaderChunk.color_pars_fragment = "#ifdef USE_COLOR\n\n	varying vec3 vColor;\n\n#endif\n", 
THREE.ShaderChunk.color_vertex = "#ifdef USE_COLOR\n\n	vColor.xyz = inputToLinear( color.xyz );\n\n#endif", 
THREE.ShaderChunk.skinning_vertex = "#ifdef USE_SKINNING\n\n	#ifdef USE_MORPHTARGETS\n\n	vec4 skinVertex = bindMatrix * vec4( morphed, 1.0 );\n\n	#else\n\n	vec4 skinVertex = bindMatrix * vec4( position, 1.0 );\n\n	#endif\n\n	vec4 skinned = vec4( 0.0 );\n	skinned += boneMatX * skinVertex * skinWeight.x;\n	skinned += boneMatY * skinVertex * skinWeight.y;\n	skinned += boneMatZ * skinVertex * skinWeight.z;\n	skinned += boneMatW * skinVertex * skinWeight.w;\n	skinned  = bindMatrixInverse * skinned;\n\n#endif\n", 
THREE.ShaderChunk.envmap_pars_vertex = "#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP ) && ! defined( PHONG )\n\n	varying vec3 vReflect;\n\n	uniform float refractionRatio;\n\n#endif\n", 
THREE.ShaderChunk.linear_to_gamma_fragment = "\n	outgoingLight = linearToOutput( outgoingLight );\n", 
THREE.ShaderChunk.color_pars_vertex = "#ifdef USE_COLOR\n\n	varying vec3 vColor;\n\n#endif", 
THREE.ShaderChunk.lights_lambert_pars_vertex = "uniform vec3 ambientLightColor;\n\n#if MAX_DIR_LIGHTS > 0\n\n	uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\n	uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n	uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\n	uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\n	uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n	uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\n	uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\n	uniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n	uniform float pointLightDecay[ MAX_POINT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n	uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];\n	uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\n	uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightDecay[ MAX_SPOT_LIGHTS ];\n\n#endif\n\n#ifdef WRAP_AROUND\n\n	uniform vec3 wrapRGB;\n\n#endif\n", 
THREE.ShaderChunk.map_pars_vertex = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP )\n\n	varying vec2 vUv;\n	uniform vec4 offsetRepeat;\n\n#endif\n", 
THREE.ShaderChunk.envmap_fragment = "#ifdef USE_ENVMAP\n\n	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG )\n\n		vec3 cameraToVertex = normalize( vWorldPosition - cameraPosition );\n\n		// Transforming Normal Vectors with the Inverse Transformation\n		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\n		#ifdef ENVMAP_MODE_REFLECTION\n\n			vec3 reflectVec = reflect( cameraToVertex, worldNormal );\n\n		#else\n\n			vec3 reflectVec = refract( cameraToVertex, worldNormal, refractionRatio );\n\n		#endif\n\n	#else\n\n		vec3 reflectVec = vReflect;\n\n	#endif\n\n	#ifdef DOUBLE_SIDED\n		float flipNormal = ( -1.0 + 2.0 * float( gl_FrontFacing ) );\n	#else\n		float flipNormal = 1.0;\n	#endif\n\n	#ifdef ENVMAP_TYPE_CUBE\n		vec4 envColor = textureCube( envMap, flipNormal * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\n	#elif defined( ENVMAP_TYPE_EQUIREC )\n		vec2 sampleUV;\n		sampleUV.y = saturate( flipNormal * reflectVec.y * 0.5 + 0.5 );\n		sampleUV.x = atan( flipNormal * reflectVec.z, flipNormal * reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n		vec4 envColor = texture2D( envMap, sampleUV );\n\n	#elif defined( ENVMAP_TYPE_SPHERE )\n		vec3 reflectView = flipNormal * normalize((viewMatrix * vec4( reflectVec, 0.0 )).xyz + vec3(0.0,0.0,1.0));\n		vec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );\n	#endif\n\n	envColor.xyz = inputToLinear( envColor.xyz );\n\n	#ifdef ENVMAP_BLENDING_MULTIPLY\n\n		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n\n	#elif defined( ENVMAP_BLENDING_MIX )\n\n		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n\n	#elif defined( ENVMAP_BLENDING_ADD )\n\n		outgoingLight += envColor.xyz * specularStrength * reflectivity;\n\n	#endif\n\n#endif\n", 
THREE.ShaderChunk.specularmap_pars_fragment = "#ifdef USE_SPECULARMAP\n\n	uniform sampler2D specularMap;\n\n#endif", 
THREE.ShaderChunk.logdepthbuf_vertex = "#ifdef USE_LOGDEPTHBUF\n\n	gl_Position.z = log2(max( EPSILON, gl_Position.w + 1.0 )) * logDepthBufFC;\n\n	#ifdef USE_LOGDEPTHBUF_EXT\n\n		vFragDepth = 1.0 + gl_Position.w;\n\n#else\n\n		gl_Position.z = (gl_Position.z - 1.0) * gl_Position.w;\n\n	#endif\n\n#endif", 
THREE.ShaderChunk.morphtarget_pars_vertex = "#ifdef USE_MORPHTARGETS\n\n	#ifndef USE_MORPHNORMALS\n\n	uniform float morphTargetInfluences[ 8 ];\n\n	#else\n\n	uniform float morphTargetInfluences[ 4 ];\n\n	#endif\n\n#endif", 
THREE.ShaderChunk.specularmap_fragment = "float specularStrength;\n\n#ifdef USE_SPECULARMAP\n\n	vec4 texelSpecular = texture2D( specularMap, vUv );\n	specularStrength = texelSpecular.r;\n\n#else\n\n	specularStrength = 1.0;\n\n#endif", 
THREE.ShaderChunk.fog_fragment = "#ifdef USE_FOG\n\n	#ifdef USE_LOGDEPTHBUF_EXT\n\n		float depth = gl_FragDepthEXT / gl_FragCoord.w;\n\n	#else\n\n		float depth = gl_FragCoord.z / gl_FragCoord.w;\n\n	#endif\n\n	#ifdef FOG_EXP2\n\n		float fogFactor = exp2( - square( fogDensity ) * square( depth ) * LOG2 );\n		fogFactor = whiteCompliment( fogFactor );\n\n	#else\n\n		float fogFactor = smoothstep( fogNear, fogFar, depth );\n\n	#endif\n	\n	outgoingLight = mix( outgoingLight, fogColor, fogFactor );\n\n#endif", 
THREE.ShaderChunk.bumpmap_pars_fragment = "#ifdef USE_BUMPMAP\n\n	uniform sampler2D bumpMap;\n	uniform float bumpScale;\n\n	// Derivative maps - bump mapping unparametrized surfaces by Morten Mikkelsen\n	// http://mmikkelsen3d.blogspot.sk/2011/07/derivative-maps.html\n\n	// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)\n\n	vec2 dHdxy_fwd() {\n\n		vec2 dSTdx = dFdx( vUv );\n		vec2 dSTdy = dFdy( vUv );\n\n		float Hll = bumpScale * texture2D( bumpMap, vUv ).x;\n		float dBx = bumpScale * texture2D( bumpMap, vUv + dSTdx ).x - Hll;\n		float dBy = bumpScale * texture2D( bumpMap, vUv + dSTdy ).x - Hll;\n\n		return vec2( dBx, dBy );\n\n	}\n\n	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy ) {\n\n		vec3 vSigmaX = dFdx( surf_pos );\n		vec3 vSigmaY = dFdy( surf_pos );\n		vec3 vN = surf_norm;		// normalized\n\n		vec3 R1 = cross( vSigmaY, vN );\n		vec3 R2 = cross( vN, vSigmaX );\n\n		float fDet = dot( vSigmaX, R1 );\n\n		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n		return normalize( abs( fDet ) * surf_norm - vGrad );\n\n	}\n\n#endif\n", 
THREE.ShaderChunk.defaultnormal_vertex = "#ifdef USE_SKINNING\n\n	vec3 objectNormal = skinnedNormal.xyz;\n\n#elif defined( USE_MORPHNORMALS )\n\n	vec3 objectNormal = morphedNormal;\n\n#else\n\n	vec3 objectNormal = normal;\n\n#endif\n\n#ifdef FLIP_SIDED\n\n	objectNormal = -objectNormal;\n\n#endif\n\nvec3 transformedNormal = normalMatrix * objectNormal;\n", 
THREE.ShaderChunk.lights_phong_pars_fragment = "uniform vec3 ambientLightColor;\n\n#if MAX_DIR_LIGHTS > 0\n\n	uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];\n	uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];\n\n#endif\n\n#if MAX_HEMI_LIGHTS > 0\n\n	uniform vec3 hemisphereLightSkyColor[ MAX_HEMI_LIGHTS ];\n	uniform vec3 hemisphereLightGroundColor[ MAX_HEMI_LIGHTS ];\n	uniform vec3 hemisphereLightDirection[ MAX_HEMI_LIGHTS ];\n\n#endif\n\n#if MAX_POINT_LIGHTS > 0\n\n	uniform vec3 pointLightColor[ MAX_POINT_LIGHTS ];\n\n	uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];\n	uniform float pointLightDistance[ MAX_POINT_LIGHTS ];\n	uniform float pointLightDecay[ MAX_POINT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0\n\n	uniform vec3 spotLightColor[ MAX_SPOT_LIGHTS ];\n	uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];\n	uniform vec3 spotLightDirection[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightAngleCos[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightExponent[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];\n	uniform float spotLightDecay[ MAX_SPOT_LIGHTS ];\n\n#endif\n\n#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP ) || defined( USE_ENVMAP )\n\n	varying vec3 vWorldPosition;\n\n#endif\n\n#ifdef WRAP_AROUND\n\n	uniform vec3 wrapRGB;\n\n#endif\n\nvarying vec3 vViewPosition;\n\n#ifndef FLAT_SHADED\n\n	varying vec3 vNormal;\n\n#endif\n", 
THREE.ShaderChunk.skinbase_vertex = "#ifdef USE_SKINNING\n\n	mat4 boneMatX = getBoneMatrix( skinIndex.x );\n	mat4 boneMatY = getBoneMatrix( skinIndex.y );\n	mat4 boneMatZ = getBoneMatrix( skinIndex.z );\n	mat4 boneMatW = getBoneMatrix( skinIndex.w );\n\n#endif", 
THREE.ShaderChunk.map_vertex = "#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP )\n\n	vUv = uv * offsetRepeat.zw + offsetRepeat.xy;\n\n#endif", 
THREE.ShaderChunk.lightmap_fragment = "#ifdef USE_LIGHTMAP\n\n	outgoingLight *= diffuseColor.xyz * texture2D( lightMap, vUv2 ).xyz;\n\n#endif", 
THREE.ShaderChunk.shadowmap_pars_vertex = "#ifdef USE_SHADOWMAP\n\n	varying vec4 vShadowCoord[ MAX_SHADOWS ];\n	uniform mat4 shadowMatrix[ MAX_SHADOWS ];\n\n#endif", 
THREE.ShaderChunk.color_fragment = "#ifdef USE_COLOR\n\n	diffuseColor.rgb *= vColor;\n\n#endif", 
THREE.ShaderChunk.morphtarget_vertex = "#ifdef USE_MORPHTARGETS\n\n	vec3 morphed = vec3( 0.0 );\n	morphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];\n	morphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];\n	morphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];\n	morphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];\n\n	#ifndef USE_MORPHNORMALS\n\n	morphed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];\n	morphed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];\n	morphed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];\n	morphed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];\n\n	#endif\n\n	morphed += position;\n\n#endif", 
THREE.ShaderChunk.envmap_vertex = "#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP ) && ! defined( PHONG )\n\n	vec3 worldNormal = transformDirection( objectNormal, modelMatrix );\n\n	vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n\n	#ifdef ENVMAP_MODE_REFLECTION\n\n		vReflect = reflect( cameraToVertex, worldNormal );\n\n	#else\n\n		vReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n\n	#endif\n\n#endif\n", 
THREE.ShaderChunk.shadowmap_fragment = "#ifdef USE_SHADOWMAP\n\n	#ifdef SHADOWMAP_DEBUG\n\n		vec3 frustumColors[3];\n		frustumColors[0] = vec3( 1.0, 0.5, 0.0 );\n		frustumColors[1] = vec3( 0.0, 1.0, 0.8 );\n		frustumColors[2] = vec3( 0.0, 0.5, 1.0 );\n\n	#endif\n\n	#ifdef SHADOWMAP_CASCADE\n\n		int inFrustumCount = 0;\n\n	#endif\n\n	float fDepth;\n	vec3 shadowColor = vec3( 1.0 );\n\n	for( int i = 0; i < MAX_SHADOWS; i ++ ) {\n\n		vec3 shadowCoord = vShadowCoord[ i ].xyz / vShadowCoord[ i ].w;\n\n				// if ( something && something ) breaks ATI OpenGL shader compiler\n				// if ( all( something, something ) ) using this instead\n\n		bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );\n		bool inFrustum = all( inFrustumVec );\n\n				// don't shadow pixels outside of light frustum\n				// use just first frustum (for cascades)\n				// don't shadow pixels behind far plane of light frustum\n\n		#ifdef SHADOWMAP_CASCADE\n\n			inFrustumCount += int( inFrustum );\n			bvec3 frustumTestVec = bvec3( inFrustum, inFrustumCount == 1, shadowCoord.z <= 1.0 );\n\n		#else\n\n			bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );\n\n		#endif\n\n		bool frustumTest = all( frustumTestVec );\n\n		if ( frustumTest ) {\n\n			shadowCoord.z += shadowBias[ i ];\n\n			#if defined( SHADOWMAP_TYPE_PCF )\n\n						// Percentage-close filtering\n						// (9 pixel kernel)\n						// http://fabiensanglard.net/shadowmappingPCF/\n\n				float shadow = 0.0;\n\n		/*\n						// nested loops breaks shader compiler / validator on some ATI cards when using OpenGL\n						// must enroll loop manually\n\n				for ( float y = -1.25; y <= 1.25; y += 1.25 )\n					for ( float x = -1.25; x <= 1.25; x += 1.25 ) {\n\n						vec4 rgbaDepth = texture2D( shadowMap[ i ], vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy );\n\n								// doesn't seem to produce any noticeable visual difference compared to simple texture2D lookup\n								//vec4 rgbaDepth = texture2DProj( shadowMap[ i ], vec4( vShadowCoord[ i ].w * ( vec2( x * xPixelOffset, y * yPixelOffset ) + shadowCoord.xy ), 0.05, vShadowCoord[ i ].w ) );\n\n						float fDepth = unpackDepth( rgbaDepth );\n\n						if ( fDepth < shadowCoord.z )\n							shadow += 1.0;\n\n				}\n\n				shadow /= 9.0;\n\n		*/\n\n				const float shadowDelta = 1.0 / 9.0;\n\n				float xPixelOffset = 1.0 / shadowMapSize[ i ].x;\n				float yPixelOffset = 1.0 / shadowMapSize[ i ].y;\n\n				float dx0 = -1.25 * xPixelOffset;\n				float dy0 = -1.25 * yPixelOffset;\n				float dx1 = 1.25 * xPixelOffset;\n				float dy1 = 1.25 * yPixelOffset;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\n				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n				fDepth = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\n				if ( fDepth < shadowCoord.z ) shadow += shadowDelta;\n\n				shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );\n\n			#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n\n						// Percentage-close filtering\n						// (9 pixel kernel)\n						// http://fabiensanglard.net/shadowmappingPCF/\n\n				float shadow = 0.0;\n\n				float xPixelOffset = 1.0 / shadowMapSize[ i ].x;\n				float yPixelOffset = 1.0 / shadowMapSize[ i ].y;\n\n				float dx0 = -1.0 * xPixelOffset;\n				float dy0 = -1.0 * yPixelOffset;\n				float dx1 = 1.0 * xPixelOffset;\n				float dy1 = 1.0 * yPixelOffset;\n\n				mat3 shadowKernel;\n				mat3 depthKernel;\n\n				depthKernel[0][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy0 ) ) );\n				depthKernel[0][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, 0.0 ) ) );\n				depthKernel[0][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx0, dy1 ) ) );\n				depthKernel[1][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy0 ) ) );\n				depthKernel[1][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy ) );\n				depthKernel[1][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( 0.0, dy1 ) ) );\n				depthKernel[2][0] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy0 ) ) );\n				depthKernel[2][1] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, 0.0 ) ) );\n				depthKernel[2][2] = unpackDepth( texture2D( shadowMap[ i ], shadowCoord.xy + vec2( dx1, dy1 ) ) );\n\n				vec3 shadowZ = vec3( shadowCoord.z );\n				shadowKernel[0] = vec3(lessThan(depthKernel[0], shadowZ ));\n				shadowKernel[0] *= vec3(0.25);\n\n				shadowKernel[1] = vec3(lessThan(depthKernel[1], shadowZ ));\n				shadowKernel[1] *= vec3(0.25);\n\n				shadowKernel[2] = vec3(lessThan(depthKernel[2], shadowZ ));\n				shadowKernel[2] *= vec3(0.25);\n\n				vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize[i].xy );\n\n				shadowKernel[0] = mix( shadowKernel[1], shadowKernel[0], fractionalCoord.x );\n				shadowKernel[1] = mix( shadowKernel[2], shadowKernel[1], fractionalCoord.x );\n\n				vec4 shadowValues;\n				shadowValues.x = mix( shadowKernel[0][1], shadowKernel[0][0], fractionalCoord.y );\n				shadowValues.y = mix( shadowKernel[0][2], shadowKernel[0][1], fractionalCoord.y );\n				shadowValues.z = mix( shadowKernel[1][1], shadowKernel[1][0], fractionalCoord.y );\n				shadowValues.w = mix( shadowKernel[1][2], shadowKernel[1][1], fractionalCoord.y );\n\n				shadow = dot( shadowValues, vec4( 1.0 ) );\n\n				shadowColor = shadowColor * vec3( ( 1.0 - shadowDarkness[ i ] * shadow ) );\n\n			#else\n\n				vec4 rgbaDepth = texture2D( shadowMap[ i ], shadowCoord.xy );\n				float fDepth = unpackDepth( rgbaDepth );\n\n				if ( fDepth < shadowCoord.z )\n\n		// spot with multiple shadows is darker\n\n					shadowColor = shadowColor * vec3( 1.0 - shadowDarkness[ i ] );\n\n		// spot with multiple shadows has the same color as single shadow spot\n\n		// 					shadowColor = min( shadowColor, vec3( shadowDarkness[ i ] ) );\n\n			#endif\n\n		}\n\n\n		#ifdef SHADOWMAP_DEBUG\n\n			#ifdef SHADOWMAP_CASCADE\n\n				if ( inFrustum && inFrustumCount == 1 ) outgoingLight *= frustumColors[ i ];\n\n			#else\n\n				if ( inFrustum ) outgoingLight *= frustumColors[ i ];\n\n			#endif\n\n		#endif\n\n	}\n\n	// NOTE: I am unsure if this is correct in linear space.  -bhouston, Dec 29, 2014\n	shadowColor = inputToLinear( shadowColor );\n\n	outgoingLight = outgoingLight * shadowColor;\n\n#endif\n", 
THREE.ShaderChunk.worldpos_vertex = "#if defined( USE_ENVMAP ) || defined( PHONG ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )\n\n	#ifdef USE_SKINNING\n\n		vec4 worldPosition = modelMatrix * skinned;\n\n	#elif defined( USE_MORPHTARGETS )\n\n		vec4 worldPosition = modelMatrix * vec4( morphed, 1.0 );\n\n	#else\n\n		vec4 worldPosition = modelMatrix * vec4( position, 1.0 );\n\n	#endif\n\n#endif\n", 
THREE.ShaderChunk.shadowmap_pars_fragment = "#ifdef USE_SHADOWMAP\n\n	uniform sampler2D shadowMap[ MAX_SHADOWS ];\n	uniform vec2 shadowMapSize[ MAX_SHADOWS ];\n\n	uniform float shadowDarkness[ MAX_SHADOWS ];\n	uniform float shadowBias[ MAX_SHADOWS ];\n\n	varying vec4 vShadowCoord[ MAX_SHADOWS ];\n\n	float unpackDepth( const in vec4 rgba_depth ) {\n\n		const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );\n		float depth = dot( rgba_depth, bit_shift );\n		return depth;\n\n	}\n\n#endif", 
THREE.ShaderChunk.skinning_pars_vertex = "#ifdef USE_SKINNING\n\n	uniform mat4 bindMatrix;\n	uniform mat4 bindMatrixInverse;\n\n	#ifdef BONE_TEXTURE\n\n		uniform sampler2D boneTexture;\n		uniform int boneTextureWidth;\n		uniform int boneTextureHeight;\n\n		mat4 getBoneMatrix( const in float i ) {\n\n			float j = i * 4.0;\n			float x = mod( j, float( boneTextureWidth ) );\n			float y = floor( j / float( boneTextureWidth ) );\n\n			float dx = 1.0 / float( boneTextureWidth );\n			float dy = 1.0 / float( boneTextureHeight );\n\n			y = dy * ( y + 0.5 );\n\n			vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n			vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n			vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n			vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n\n			mat4 bone = mat4( v1, v2, v3, v4 );\n\n			return bone;\n\n		}\n\n	#else\n\n		uniform mat4 boneGlobalMatrices[ MAX_BONES ];\n\n		mat4 getBoneMatrix( const in float i ) {\n\n			mat4 bone = boneGlobalMatrices[ int(i) ];\n			return bone;\n\n		}\n\n	#endif\n\n#endif\n", 
THREE.ShaderChunk.logdepthbuf_pars_fragment = "#ifdef USE_LOGDEPTHBUF\n\n	uniform float logDepthBufFC;\n\n	#ifdef USE_LOGDEPTHBUF_EXT\n\n		#extension GL_EXT_frag_depth : enable\n		varying float vFragDepth;\n\n	#endif\n\n#endif", 
THREE.ShaderChunk.alphamap_fragment = "#ifdef USE_ALPHAMAP\n\n	diffuseColor.a *= texture2D( alphaMap, vUv ).g;\n\n#endif\n", 
THREE.ShaderChunk.alphamap_pars_fragment = "#ifdef USE_ALPHAMAP\n\n	uniform sampler2D alphaMap;\n\n#endif\n", 
THREE.UniformsUtils = {
    merge: function(a) {
        for (var b = {}, c = 0; c < a.length; c++) {
            var d, e = this.clone(a[c]);
            for (d in e) b[d] = e[d];
        }
        return b;
    },
    clone: function(a) {
        var b, c = {};
        for (b in a) {
            c[b] = {};
            for (var d in a[b]) {
                var e = a[b][d];
                c[b][d] = e instanceof THREE.Color || e instanceof THREE.Vector2 || e instanceof THREE.Vector3 || e instanceof THREE.Vector4 || e instanceof THREE.Matrix4 || e instanceof THREE.Texture ? e.clone() : e instanceof Array ? e.slice() : e;
            }
        }
        return c;
    }
}, THREE.UniformsLib = {
    common: {
        diffuse: {
            type: "c",
            value: new THREE.Color(15658734)
        },
        opacity: {
            type: "f",
            value: 1
        },
        map: {
            type: "t",
            value: null
        },
        offsetRepeat: {
            type: "v4",
            value: new THREE.Vector4(0, 0, 1, 1)
        },
        lightMap: {
            type: "t",
            value: null
        },
        specularMap: {
            type: "t",
            value: null
        },
        alphaMap: {
            type: "t",
            value: null
        },
        envMap: {
            type: "t",
            value: null
        },
        flipEnvMap: {
            type: "f",
            value: -1
        },
        reflectivity: {
            type: "f",
            value: 1
        },
        refractionRatio: {
            type: "f",
            value: .98
        },
        morphTargetInfluences: {
            type: "f",
            value: 0
        }
    },
    bump: {
        bumpMap: {
            type: "t",
            value: null
        },
        bumpScale: {
            type: "f",
            value: 1
        }
    },
    normalmap: {
        normalMap: {
            type: "t",
            value: null
        },
        normalScale: {
            type: "v2",
            value: new THREE.Vector2(1, 1)
        }
    },
    fog: {
        fogDensity: {
            type: "f",
            value: 25e-5
        },
        fogNear: {
            type: "f",
            value: 1
        },
        fogFar: {
            type: "f",
            value: 2e3
        },
        fogColor: {
            type: "c",
            value: new THREE.Color(16777215)
        }
    },
    lights: {
        ambientLightColor: {
            type: "fv",
            value: []
        },
        directionalLightDirection: {
            type: "fv",
            value: []
        },
        directionalLightColor: {
            type: "fv",
            value: []
        },
        hemisphereLightDirection: {
            type: "fv",
            value: []
        },
        hemisphereLightSkyColor: {
            type: "fv",
            value: []
        },
        hemisphereLightGroundColor: {
            type: "fv",
            value: []
        },
        pointLightColor: {
            type: "fv",
            value: []
        },
        pointLightPosition: {
            type: "fv",
            value: []
        },
        pointLightDistance: {
            type: "fv1",
            value: []
        },
        pointLightDecay: {
            type: "fv1",
            value: []
        },
        spotLightColor: {
            type: "fv",
            value: []
        },
        spotLightPosition: {
            type: "fv",
            value: []
        },
        spotLightDirection: {
            type: "fv",
            value: []
        },
        spotLightDistance: {
            type: "fv1",
            value: []
        },
        spotLightAngleCos: {
            type: "fv1",
            value: []
        },
        spotLightExponent: {
            type: "fv1",
            value: []
        },
        spotLightDecay: {
            type: "fv1",
            value: []
        }
    },
    particle: {
        psColor: {
            type: "c",
            value: new THREE.Color(15658734)
        },
        opacity: {
            type: "f",
            value: 1
        },
        size: {
            type: "f",
            value: 1
        },
        scale: {
            type: "f",
            value: 1
        },
        map: {
            type: "t",
            value: null
        },
        offsetRepeat: {
            type: "v4",
            value: new THREE.Vector4(0, 0, 1, 1)
        },
        fogDensity: {
            type: "f",
            value: 25e-5
        },
        fogNear: {
            type: "f",
            value: 1
        },
        fogFar: {
            type: "f",
            value: 2e3
        },
        fogColor: {
            type: "c",
            value: new THREE.Color(16777215)
        }
    },
    shadowmap: {
        shadowMap: {
            type: "tv",
            value: []
        },
        shadowMapSize: {
            type: "v2v",
            value: []
        },
        shadowBias: {
            type: "fv1",
            value: []
        },
        shadowDarkness: {
            type: "fv1",
            value: []
        },
        shadowMatrix: {
            type: "m4v",
            value: []
        }
    }
}, THREE.ShaderLib = {
    basic: {
        uniforms: THREE.UniformsUtils.merge([ THREE.UniformsLib.common, THREE.UniformsLib.fog, THREE.UniformsLib.shadowmap ]),
        vertexShader: [ THREE.ShaderChunk.common, THREE.ShaderChunk.map_pars_vertex, THREE.ShaderChunk.lightmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.map_vertex, THREE.ShaderChunk.lightmap_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.skinbase_vertex, "	#ifdef USE_ENVMAP", THREE.ShaderChunk.morphnormal_vertex, THREE.ShaderChunk.skinnormal_vertex, THREE.ShaderChunk.defaultnormal_vertex, "	#endif", THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.shadowmap_vertex, "}" ].join("\n"),
        fragmentShader: [ "uniform vec3 diffuse;\nuniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.alphamap_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {\n	vec3 outgoingLight = vec3( 0.0 );\n	vec4 diffuseColor = vec4( diffuse, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphamap_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.specularmap_fragment, "	outgoingLight = diffuseColor.rgb;", THREE.ShaderChunk.lightmap_fragment, THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n}" ].join("\n")
    },
    lambert: {
        uniforms: THREE.UniformsUtils.merge([ THREE.UniformsLib.common, THREE.UniformsLib.fog, THREE.UniformsLib.lights, THREE.UniformsLib.shadowmap, {
            emissive: {
                type: "c",
                value: new THREE.Color(0)
            },
            wrapRGB: {
                type: "v3",
                value: new THREE.Vector3(1, 1, 1)
            }
        } ]),
        vertexShader: [ "#define LAMBERT\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n	varying vec3 vLightBack;\n#endif", THREE.ShaderChunk.common, THREE.ShaderChunk.map_pars_vertex, THREE.ShaderChunk.lightmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.lights_lambert_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.map_vertex, THREE.ShaderChunk.lightmap_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.morphnormal_vertex, THREE.ShaderChunk.skinbase_vertex, THREE.ShaderChunk.skinnormal_vertex, THREE.ShaderChunk.defaultnormal_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.lights_lambert_vertex, THREE.ShaderChunk.shadowmap_vertex, "}" ].join("\n"),
        fragmentShader: [ "uniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\nvarying vec3 vLightFront;\n#ifdef DOUBLE_SIDED\n	varying vec3 vLightBack;\n#endif", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.alphamap_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {\n	vec3 outgoingLight = vec3( 0.0 );\n	vec4 diffuseColor = vec4( diffuse, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphamap_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.specularmap_fragment, "	#ifdef DOUBLE_SIDED\n		if ( gl_FrontFacing )\n			outgoingLight += diffuseColor.rgb * vLightFront + emissive;\n		else\n			outgoingLight += diffuseColor.rgb * vLightBack + emissive;\n	#else\n		outgoingLight += diffuseColor.rgb * vLightFront + emissive;\n	#endif", THREE.ShaderChunk.lightmap_fragment, THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n}" ].join("\n")
    },
    phong: {
        uniforms: THREE.UniformsUtils.merge([ THREE.UniformsLib.common, THREE.UniformsLib.bump, THREE.UniformsLib.normalmap, THREE.UniformsLib.fog, THREE.UniformsLib.lights, THREE.UniformsLib.shadowmap, {
            emissive: {
                type: "c",
                value: new THREE.Color(0)
            },
            specular: {
                type: "c",
                value: new THREE.Color(1118481)
            },
            shininess: {
                type: "f",
                value: 30
            },
            wrapRGB: {
                type: "v3",
                value: new THREE.Vector3(1, 1, 1)
            }
        } ]),
        vertexShader: [ "#define PHONG\nvarying vec3 vViewPosition;\n#ifndef FLAT_SHADED\n	varying vec3 vNormal;\n#endif", THREE.ShaderChunk.common, THREE.ShaderChunk.map_pars_vertex, THREE.ShaderChunk.lightmap_pars_vertex, THREE.ShaderChunk.envmap_pars_vertex, THREE.ShaderChunk.lights_phong_pars_vertex, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.map_vertex, THREE.ShaderChunk.lightmap_vertex, THREE.ShaderChunk.color_vertex, THREE.ShaderChunk.morphnormal_vertex, THREE.ShaderChunk.skinbase_vertex, THREE.ShaderChunk.skinnormal_vertex, THREE.ShaderChunk.defaultnormal_vertex, "#ifndef FLAT_SHADED\n	vNormal = normalize( transformedNormal );\n#endif", THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "	vViewPosition = -mvPosition.xyz;", THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.envmap_vertex, THREE.ShaderChunk.lights_phong_vertex, THREE.ShaderChunk.shadowmap_vertex, "}" ].join("\n"),
        fragmentShader: [ "#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_pars_fragment, THREE.ShaderChunk.alphamap_pars_fragment, THREE.ShaderChunk.lightmap_pars_fragment, THREE.ShaderChunk.envmap_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.lights_phong_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.bumpmap_pars_fragment, THREE.ShaderChunk.normalmap_pars_fragment, THREE.ShaderChunk.specularmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {\n	vec3 outgoingLight = vec3( 0.0 );\n	vec4 diffuseColor = vec4( diffuse, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphamap_fragment, THREE.ShaderChunk.alphatest_fragment, THREE.ShaderChunk.specularmap_fragment, THREE.ShaderChunk.lights_phong_fragment, THREE.ShaderChunk.lightmap_fragment, THREE.ShaderChunk.envmap_fragment, THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.linear_to_gamma_fragment, THREE.ShaderChunk.fog_fragment, "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n}" ].join("\n")
    },
    particle_basic: {
        uniforms: THREE.UniformsUtils.merge([ THREE.UniformsLib.particle, THREE.UniformsLib.shadowmap ]),
        vertexShader: [ "uniform float size;\nuniform float scale;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.shadowmap_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.color_vertex, "	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n	#ifdef USE_SIZEATTENUATION\n		gl_PointSize = size * ( scale / length( mvPosition.xyz ) );\n	#else\n		gl_PointSize = size;\n	#endif\n	gl_Position = projectionMatrix * mvPosition;", THREE.ShaderChunk.logdepthbuf_vertex, THREE.ShaderChunk.worldpos_vertex, THREE.ShaderChunk.shadowmap_vertex, "}" ].join("\n"),
        fragmentShader: [ "uniform vec3 psColor;\nuniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.map_particle_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.shadowmap_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {\n	vec3 outgoingLight = vec3( 0.0 );\n	vec4 diffuseColor = vec4( psColor, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.map_particle_fragment, THREE.ShaderChunk.color_fragment, THREE.ShaderChunk.alphatest_fragment, "	outgoingLight = diffuseColor.rgb;", THREE.ShaderChunk.shadowmap_fragment, THREE.ShaderChunk.fog_fragment, "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n}" ].join("\n")
    },
    dashed: {
        uniforms: THREE.UniformsUtils.merge([ THREE.UniformsLib.common, THREE.UniformsLib.fog, {
            scale: {
                type: "f",
                value: 1
            },
            dashSize: {
                type: "f",
                value: 1
            },
            totalSize: {
                type: "f",
                value: 2
            }
        } ]),
        vertexShader: [ "uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.color_vertex, "	vLineDistance = scale * lineDistance;\n	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n	gl_Position = projectionMatrix * mvPosition;", THREE.ShaderChunk.logdepthbuf_vertex, "}" ].join("\n"),
        fragmentShader: [ "uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;", THREE.ShaderChunk.common, THREE.ShaderChunk.color_pars_fragment, THREE.ShaderChunk.fog_pars_fragment, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {\n	if ( mod( vLineDistance, totalSize ) > dashSize ) {\n		discard;\n	}\n	vec3 outgoingLight = vec3( 0.0 );\n	vec4 diffuseColor = vec4( diffuse, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, THREE.ShaderChunk.color_fragment, "	outgoingLight = diffuseColor.rgb;", THREE.ShaderChunk.fog_fragment, "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );\n}" ].join("\n")
    },
    depth: {
        uniforms: {
            mNear: {
                type: "f",
                value: 1
            },
            mFar: {
                type: "f",
                value: 2e3
            },
            opacity: {
                type: "f",
                value: 1
            }
        },
        vertexShader: [ THREE.ShaderChunk.common, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "}" ].join("\n"),
        fragmentShader: [ "uniform float mNear;\nuniform float mFar;\nuniform float opacity;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {", THREE.ShaderChunk.logdepthbuf_fragment, "	#ifdef USE_LOGDEPTHBUF_EXT\n		float depth = gl_FragDepthEXT / gl_FragCoord.w;\n	#else\n		float depth = gl_FragCoord.z / gl_FragCoord.w;\n	#endif\n	float color = 1.0 - smoothstep( mNear, mFar, depth );\n	gl_FragColor = vec4( vec3( color ), opacity );\n}" ].join("\n")
    },
    normal: {
        uniforms: {
            opacity: {
                type: "f",
                value: 1
            }
        },
        vertexShader: [ "varying vec3 vNormal;", THREE.ShaderChunk.common, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {\n	vNormal = normalize( normalMatrix * normal );", THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "}" ].join("\n"),
        fragmentShader: [ "uniform float opacity;\nvarying vec3 vNormal;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {\n	gl_FragColor = vec4( 0.5 * normalize( vNormal ) + 0.5, opacity );", THREE.ShaderChunk.logdepthbuf_fragment, "}" ].join("\n")
    },
    cube: {
        uniforms: {
            tCube: {
                type: "t",
                value: null
            },
            tFlip: {
                type: "f",
                value: -1
            }
        },
        vertexShader: [ "varying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {\n	vWorldPosition = transformDirection( position, modelMatrix );\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", THREE.ShaderChunk.logdepthbuf_vertex, "}" ].join("\n"),
        fragmentShader: [ "uniform samplerCube tCube;\nuniform float tFlip;\nvarying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {\n	gl_FragColor = textureCube( tCube, vec3( tFlip * vWorldPosition.x, vWorldPosition.yz ) );", THREE.ShaderChunk.logdepthbuf_fragment, "}" ].join("\n")
    },
    equirect: {
        uniforms: {
            tEquirect: {
                type: "t",
                value: null
            },
            tFlip: {
                type: "f",
                value: -1
            }
        },
        vertexShader: [ "varying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {\n	vWorldPosition = transformDirection( position, modelMatrix );\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", THREE.ShaderChunk.logdepthbuf_vertex, "}" ].join("\n"),
        fragmentShader: [ "uniform sampler2D tEquirect;\nuniform float tFlip;\nvarying vec3 vWorldPosition;", THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "void main() {\nvec3 direction = normalize( vWorldPosition );\nvec2 sampleUV;\nsampleUV.y = saturate( tFlip * direction.y * -0.5 + 0.5 );\nsampleUV.x = atan( direction.z, direction.x ) * RECIPROCAL_PI2 + 0.5;\ngl_FragColor = texture2D( tEquirect, sampleUV );", THREE.ShaderChunk.logdepthbuf_fragment, "}" ].join("\n")
    },
    depthRGBA: {
        uniforms: {},
        vertexShader: [ THREE.ShaderChunk.common, THREE.ShaderChunk.morphtarget_pars_vertex, THREE.ShaderChunk.skinning_pars_vertex, THREE.ShaderChunk.logdepthbuf_pars_vertex, "void main() {", THREE.ShaderChunk.skinbase_vertex, THREE.ShaderChunk.morphtarget_vertex, THREE.ShaderChunk.skinning_vertex, THREE.ShaderChunk.default_vertex, THREE.ShaderChunk.logdepthbuf_vertex, "}" ].join("\n"),
        fragmentShader: [ THREE.ShaderChunk.common, THREE.ShaderChunk.logdepthbuf_pars_fragment, "vec4 pack_depth( const in float depth ) {\n	const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );\n	const vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );\n	vec4 res = mod( depth * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );\n	res -= res.xxyz * bit_mask;\n	return res;\n}\nvoid main() {", THREE.ShaderChunk.logdepthbuf_fragment, "	#ifdef USE_LOGDEPTHBUF_EXT\n		gl_FragData[ 0 ] = pack_depth( gl_FragDepthEXT );\n	#else\n		gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );\n	#endif\n}" ].join("\n")
    }
}, THREE.WebGLRenderer = function(a) {
    function b(a) {
        var b = a.geometry;
        a = a.material;
        var c = b.vertices.length;
        if (a.attributes) {
            void 0 === b.__webglCustomAttributesList && (b.__webglCustomAttributesList = []);
            for (var d in a.attributes) {
                var e = a.attributes[d];
                if (!e.__webglInitialized || e.createUniqueBuffers) {
                    e.__webglInitialized = !0;
                    var f = 1;
                    "v2" === e.type ? f = 2 : "v3" === e.type ? f = 3 : "v4" === e.type ? f = 4 : "c" === e.type && (f = 3), 
                    e.size = f, e.array = new Float32Array(c * f), e.buffer = W.createBuffer(), e.buffer.belongsToAttribute = d, 
                    e.needsUpdate = !0;
                }
                b.__webglCustomAttributesList.push(e);
            }
        }
    }
    function c(a, b) {
        return a.material instanceof THREE.MeshFaceMaterial ? a.material.materials[b.materialIndex] : a.material;
    }
    function d(a, b, c, d) {
        c = c.attributes;
        var e = b.attributes;
        b = b.attributesKeys;
        for (var f = 0, g = b.length; g > f; f++) {
            var h = b[f], i = e[h];
            if (i >= 0) {
                var j = c[h];
                void 0 !== j ? (h = j.itemSize, W.bindBuffer(W.ARRAY_BUFFER, j.buffer), rb.enableAttribute(i), 
                W.vertexAttribPointer(i, h, W.FLOAT, !1, 0, d * h * 4)) : void 0 !== a.defaultAttributeValues && (2 === a.defaultAttributeValues[h].length ? W.vertexAttrib2fv(i, a.defaultAttributeValues[h]) : 3 === a.defaultAttributeValues[h].length && W.vertexAttrib3fv(i, a.defaultAttributeValues[h]));
            }
        }
        rb.disableUnusedAttributes();
    }
    function e(a, b) {
        return a.object.renderOrder !== b.object.renderOrder ? a.object.renderOrder - b.object.renderOrder : a.material.id !== b.material.id ? a.material.id - b.material.id : a.z !== b.z ? a.z - b.z : a.id - b.id;
    }
    function f(a, b) {
        return a.object.renderOrder !== b.object.renderOrder ? a.object.renderOrder - b.object.renderOrder : a.z !== b.z ? b.z - a.z : a.id - b.id;
    }
    function g(a, b) {
        return b[0] - a[0];
    }
    function h(a) {
        if (!1 !== a.visible) {
            if (!(a instanceof THREE.Scene || a instanceof THREE.Group)) {
                void 0 === a.__webglInit && (a.__webglInit = !0, a._modelViewMatrix = new THREE.Matrix4(), 
                a._normalMatrix = new THREE.Matrix3(), a.addEventListener("removed", Mb));
                var c = a.geometry;
                if (void 0 !== c && void 0 === c.__webglInit) if (c.__webglInit = !0, c.addEventListener("dispose", Nb), 
                c instanceof THREE.BufferGeometry) X.info.memory.geometries++; else if (a instanceof THREE.Mesh) l(a, c); else if (a instanceof THREE.Line) {
                    if (void 0 === c.__webglVertexBuffer) {
                        c.__webglVertexBuffer = W.createBuffer(), c.__webglColorBuffer = W.createBuffer(), 
                        c.__webglLineDistanceBuffer = W.createBuffer(), X.info.memory.geometries++;
                        var d = c.vertices.length;
                        c.__vertexArray = new Float32Array(3 * d), c.__colorArray = new Float32Array(3 * d), 
                        c.__lineDistanceArray = new Float32Array(1 * d), c.__webglLineCount = d, b(a), c.verticesNeedUpdate = !0, 
                        c.colorsNeedUpdate = !0, c.lineDistancesNeedUpdate = !0;
                    }
                } else a instanceof THREE.PointCloud && void 0 === c.__webglVertexBuffer && (c.__webglVertexBuffer = W.createBuffer(), 
                c.__webglColorBuffer = W.createBuffer(), X.info.memory.geometries++, d = c.vertices.length, 
                c.__vertexArray = new Float32Array(3 * d), c.__colorArray = new Float32Array(3 * d), 
                c.__webglParticleCount = d, b(a), c.verticesNeedUpdate = !0, c.colorsNeedUpdate = !0);
                if (void 0 === a.__webglActive) if (a.__webglActive = !0, a instanceof THREE.Mesh) {
                    if (c instanceof THREE.BufferGeometry) m(Q, c, a); else if (c instanceof THREE.Geometry) for (var c = Tb[c.id], d = 0, e = c.length; e > d; d++) m(Q, c[d], a);
                } else a instanceof THREE.Line || a instanceof THREE.PointCloud ? m(Q, c, a) : (a instanceof THREE.ImmediateRenderObject || a.immediateRenderCallback) && R.push({
                    id: null,
                    object: a,
                    opaque: null,
                    transparent: null,
                    z: 0
                });
                if (a instanceof THREE.Light) P.push(a); else if (a instanceof THREE.Sprite) U.push(a); else if (a instanceof THREE.LensFlare) V.push(a); else if ((c = Q[a.id]) && (!1 === a.frustumCulled || !0 === jb.intersectsObject(a))) for (d = 0, 
                e = c.length; e > d; d++) {
                    var f = c[d], g = f, i = g.object, j = g.buffer, k = i.geometry, i = i.material;
                    i instanceof THREE.MeshFaceMaterial ? (i = i.materials[k instanceof THREE.BufferGeometry ? 0 : j.materialIndex], 
                    g.material = i, i.transparent ? T.push(g) : S.push(g)) : i && (g.material = i, i.transparent ? T.push(g) : S.push(g)), 
                    f.render = !0, !0 === X.sortObjects && (lb.setFromMatrixPosition(a.matrixWorld), 
                    lb.applyProjection(kb), f.z = lb.z);
                }
            }
            for (d = 0, e = a.children.length; e > d; d++) h(a.children[d]);
        }
    }
    function i(a, b, c, d, e) {
        for (var f, g = 0, h = a.length; h > g; g++) {
            f = a[g];
            var i = f.object, j = f.buffer;
            if (u(i, b), e) f = e; else {
                if (f = f.material, !f) continue;
                q(f);
            }
            X.setMaterialFaces(f), j instanceof THREE.BufferGeometry ? X.renderBufferDirect(b, c, d, f, j, i) : X.renderBuffer(b, c, d, f, j, i);
        }
    }
    function j(a, b, c, d, e, f) {
        for (var g, h = 0, i = a.length; i > h; h++) {
            g = a[h];
            var j = g.object;
            if (j.visible) {
                if (f) g = f; else {
                    if (g = g[b], !g) continue;
                    q(g);
                }
                X.renderImmediateObject(c, d, e, g, j);
            }
        }
    }
    function k(a) {
        var b = a.object.material;
        b.transparent ? (a.transparent = b, a.opaque = null) : (a.opaque = b, a.transparent = null);
    }
    function l(a, b) {
        var d = a.material, e = !1;
        if (void 0 === Tb[b.id] || !0 === b.groupsNeedUpdate) {
            delete Q[a.id];
            for (var f, g, h = Tb, i = b.id, d = d instanceof THREE.MeshFaceMaterial, j = sb.get("OES_element_index_uint") ? 4294967296 : 65535, e = {}, k = b.morphTargets.length, l = b.morphNormals.length, n = {}, o = [], p = 0, q = b.faces.length; q > p; p++) {
                f = b.faces[p];
                var r = d ? f.materialIndex : 0;
                r in e || (e[r] = {
                    hash: r,
                    counter: 0
                }), f = e[r].hash + "_" + e[r].counter, f in n || (g = {
                    id: Ub++,
                    faces3: [],
                    materialIndex: r,
                    vertices: 0,
                    numMorphTargets: k,
                    numMorphNormals: l
                }, n[f] = g, o.push(g)), n[f].vertices + 3 > j && (e[r].counter += 1, f = e[r].hash + "_" + e[r].counter, 
                f in n || (g = {
                    id: Ub++,
                    faces3: [],
                    materialIndex: r,
                    vertices: 0,
                    numMorphTargets: k,
                    numMorphNormals: l
                }, n[f] = g, o.push(g))), n[f].faces3.push(p), n[f].vertices += 3;
            }
            h[i] = o, b.groupsNeedUpdate = !1;
        }
        for (h = Tb[b.id], i = 0, d = h.length; d > i; i++) {
            if (j = h[i], void 0 === j.__webglVertexBuffer) {
                if (e = j, e.__webglVertexBuffer = W.createBuffer(), e.__webglNormalBuffer = W.createBuffer(), 
                e.__webglTangentBuffer = W.createBuffer(), e.__webglColorBuffer = W.createBuffer(), 
                e.__webglUVBuffer = W.createBuffer(), e.__webglUV2Buffer = W.createBuffer(), e.__webglSkinIndicesBuffer = W.createBuffer(), 
                e.__webglSkinWeightsBuffer = W.createBuffer(), e.__webglFaceBuffer = W.createBuffer(), 
                e.__webglLineBuffer = W.createBuffer(), l = e.numMorphTargets) for (e.__webglMorphTargetsBuffers = [], 
                k = 0; l > k; k++) e.__webglMorphTargetsBuffers.push(W.createBuffer());
                if (l = e.numMorphNormals) for (e.__webglMorphNormalsBuffers = [], k = 0; l > k; k++) e.__webglMorphNormalsBuffers.push(W.createBuffer());
                if (X.info.memory.geometries++, e = j, p = a, q = p.geometry, l = e.faces3, k = 3 * l.length, 
                n = 1 * l.length, o = 3 * l.length, l = c(p, e), e.__vertexArray = new Float32Array(3 * k), 
                e.__normalArray = new Float32Array(3 * k), e.__colorArray = new Float32Array(3 * k), 
                e.__uvArray = new Float32Array(2 * k), 1 < q.faceVertexUvs.length && (e.__uv2Array = new Float32Array(2 * k)), 
                q.hasTangents && (e.__tangentArray = new Float32Array(4 * k)), p.geometry.skinWeights.length && p.geometry.skinIndices.length && (e.__skinIndexArray = new Float32Array(4 * k), 
                e.__skinWeightArray = new Float32Array(4 * k)), p = null !== sb.get("OES_element_index_uint") && n > 21845 ? Uint32Array : Uint16Array, 
                e.__typeArray = p, e.__faceArray = new p(3 * n), e.__lineArray = new p(2 * o), q = e.numMorphTargets) for (e.__morphTargetsArrays = [], 
                p = 0; q > p; p++) e.__morphTargetsArrays.push(new Float32Array(3 * k));
                if (q = e.numMorphNormals) for (e.__morphNormalsArrays = [], p = 0; q > p; p++) e.__morphNormalsArrays.push(new Float32Array(3 * k));
                if (e.__webglFaceCount = 3 * n, e.__webglLineCount = 2 * o, l.attributes) for (n in void 0 === e.__webglCustomAttributesList && (e.__webglCustomAttributesList = []), 
                n = void 0, l.attributes) {
                    var s, o = l.attributes[n], p = {};
                    for (s in o) p[s] = o[s];
                    (!p.__webglInitialized || p.createUniqueBuffers) && (p.__webglInitialized = !0, 
                    q = 1, "v2" === p.type ? q = 2 : "v3" === p.type ? q = 3 : "v4" === p.type ? q = 4 : "c" === p.type && (q = 3), 
                    p.size = q, p.array = new Float32Array(k * q), p.buffer = W.createBuffer(), p.buffer.belongsToAttribute = n, 
                    o.needsUpdate = !0, p.__original = o), e.__webglCustomAttributesList.push(p);
                }
                e.__inittedArrays = !0, b.verticesNeedUpdate = !0, b.morphTargetsNeedUpdate = !0, 
                b.elementsNeedUpdate = !0, b.uvsNeedUpdate = !0, b.normalsNeedUpdate = !0, b.tangentsNeedUpdate = !0, 
                e = b.colorsNeedUpdate = !0;
            } else e = !1;
            (e || void 0 === a.__webglActive) && m(Q, j, a);
        }
        a.__webglActive = !0;
    }
    function m(a, b, c) {
        var d = c.id;
        a[d] = a[d] || [], a[d].push({
            id: d,
            buffer: b,
            object: c,
            material: null,
            z: 0
        });
    }
    function n(a) {
        var b = a.geometry;
        if (b instanceof THREE.BufferGeometry) for (var d = b.attributes, e = b.attributesKeys, f = 0, g = e.length; g > f; f++) {
            var h = e[f], i = d[h], j = "index" === h ? W.ELEMENT_ARRAY_BUFFER : W.ARRAY_BUFFER;
            void 0 === i.buffer ? (i.buffer = W.createBuffer(), W.bindBuffer(j, i.buffer), W.bufferData(j, i.array, i instanceof THREE.DynamicBufferAttribute ? W.DYNAMIC_DRAW : W.STATIC_DRAW), 
            i.needsUpdate = !1) : !0 === i.needsUpdate && (W.bindBuffer(j, i.buffer), void 0 === i.updateRange || -1 === i.updateRange.count ? W.bufferSubData(j, 0, i.array) : 0 === i.updateRange.count ? console.error("THREE.WebGLRenderer.updateObject: using updateRange for THREE.DynamicBufferAttribute and marked as needsUpdate but count is 0, ensure you are using set methods or updating manually.") : (W.bufferSubData(j, i.updateRange.offset * i.array.BYTES_PER_ELEMENT, i.array.subarray(i.updateRange.offset, i.updateRange.offset + i.updateRange.count)), 
            i.updateRange.count = 0), i.needsUpdate = !1);
        } else if (a instanceof THREE.Mesh) {
            !0 === b.groupsNeedUpdate && l(a, b);
            for (var k = Tb[b.id], f = 0, m = k.length; m > f; f++) {
                var n = k[f], q = c(a, n), r = q.attributes && o(q);
                if (b.verticesNeedUpdate || b.morphTargetsNeedUpdate || b.elementsNeedUpdate || b.uvsNeedUpdate || b.normalsNeedUpdate || b.colorsNeedUpdate || b.tangentsNeedUpdate || r) {
                    var s = n, t = a, u = W.DYNAMIC_DRAW, v = !b.dynamic, w = q;
                    if (s.__inittedArrays) {
                        var x = !1 == w instanceof THREE.MeshPhongMaterial && w.shading === THREE.FlatShading, y = void 0, z = void 0, A = void 0, B = void 0, C = void 0, D = void 0, E = void 0, F = void 0, G = void 0, H = void 0, I = void 0, J = void 0, K = void 0, L = void 0, M = void 0, N = void 0, O = void 0, P = void 0, Q = void 0, R = void 0, S = void 0, T = void 0, U = void 0, V = void 0, X = void 0, Y = void 0, Z = void 0, $ = void 0, _ = void 0, ab = void 0, bb = void 0, cb = void 0, db = void 0, eb = void 0, fb = void 0, gb = void 0, hb = void 0, ib = void 0, jb = void 0, kb = void 0, lb = 0, mb = 0, nb = 0, ob = 0, pb = 0, qb = 0, rb = 0, sb = 0, tb = 0, ub = 0, vb = 0, wb = 0, xb = void 0, yb = s.__vertexArray, zb = s.__uvArray, Ab = s.__uv2Array, Bb = s.__normalArray, Cb = s.__tangentArray, Db = s.__colorArray, Eb = s.__skinIndexArray, Fb = s.__skinWeightArray, Gb = s.__morphTargetsArrays, Hb = s.__morphNormalsArrays, Ib = s.__webglCustomAttributesList, Jb = void 0, Kb = s.__faceArray, Lb = s.__lineArray, Mb = t.geometry, Nb = Mb.elementsNeedUpdate, Ob = Mb.uvsNeedUpdate, Pb = Mb.normalsNeedUpdate, Qb = Mb.tangentsNeedUpdate, Rb = Mb.colorsNeedUpdate, Sb = Mb.morphTargetsNeedUpdate, Ub = Mb.vertices, Vb = s.faces3, Wb = Mb.faces, Xb = Mb.faceVertexUvs[0], Yb = Mb.faceVertexUvs[1], Zb = Mb.skinIndices, $b = Mb.skinWeights, _b = Mb.morphTargets, ac = Mb.morphNormals;
                        if (Mb.verticesNeedUpdate) {
                            for (y = 0, z = Vb.length; z > y; y++) B = Wb[Vb[y]], J = Ub[B.a], K = Ub[B.b], 
                            L = Ub[B.c], yb[mb] = J.x, yb[mb + 1] = J.y, yb[mb + 2] = J.z, yb[mb + 3] = K.x, 
                            yb[mb + 4] = K.y, yb[mb + 5] = K.z, yb[mb + 6] = L.x, yb[mb + 7] = L.y, yb[mb + 8] = L.z, 
                            mb += 9;
                            W.bindBuffer(W.ARRAY_BUFFER, s.__webglVertexBuffer), W.bufferData(W.ARRAY_BUFFER, yb, u);
                        }
                        if (Sb) for (fb = 0, gb = _b.length; gb > fb; fb++) {
                            for (y = vb = 0, z = Vb.length; z > y; y++) jb = Vb[y], B = Wb[jb], J = _b[fb].vertices[B.a], 
                            K = _b[fb].vertices[B.b], L = _b[fb].vertices[B.c], hb = Gb[fb], hb[vb] = J.x, hb[vb + 1] = J.y, 
                            hb[vb + 2] = J.z, hb[vb + 3] = K.x, hb[vb + 4] = K.y, hb[vb + 5] = K.z, hb[vb + 6] = L.x, 
                            hb[vb + 7] = L.y, hb[vb + 8] = L.z, w.morphNormals && (x ? R = Q = P = ac[fb].faceNormals[jb] : (kb = ac[fb].vertexNormals[jb], 
                            P = kb.a, Q = kb.b, R = kb.c), ib = Hb[fb], ib[vb] = P.x, ib[vb + 1] = P.y, ib[vb + 2] = P.z, 
                            ib[vb + 3] = Q.x, ib[vb + 4] = Q.y, ib[vb + 5] = Q.z, ib[vb + 6] = R.x, ib[vb + 7] = R.y, 
                            ib[vb + 8] = R.z), vb += 9;
                            W.bindBuffer(W.ARRAY_BUFFER, s.__webglMorphTargetsBuffers[fb]), W.bufferData(W.ARRAY_BUFFER, Gb[fb], u), 
                            w.morphNormals && (W.bindBuffer(W.ARRAY_BUFFER, s.__webglMorphNormalsBuffers[fb]), 
                            W.bufferData(W.ARRAY_BUFFER, Hb[fb], u));
                        }
                        if ($b.length) {
                            for (y = 0, z = Vb.length; z > y; y++) B = Wb[Vb[y]], V = $b[B.a], X = $b[B.b], 
                            Y = $b[B.c], Fb[ub] = V.x, Fb[ub + 1] = V.y, Fb[ub + 2] = V.z, Fb[ub + 3] = V.w, 
                            Fb[ub + 4] = X.x, Fb[ub + 5] = X.y, Fb[ub + 6] = X.z, Fb[ub + 7] = X.w, Fb[ub + 8] = Y.x, 
                            Fb[ub + 9] = Y.y, Fb[ub + 10] = Y.z, Fb[ub + 11] = Y.w, Z = Zb[B.a], $ = Zb[B.b], 
                            _ = Zb[B.c], Eb[ub] = Z.x, Eb[ub + 1] = Z.y, Eb[ub + 2] = Z.z, Eb[ub + 3] = Z.w, 
                            Eb[ub + 4] = $.x, Eb[ub + 5] = $.y, Eb[ub + 6] = $.z, Eb[ub + 7] = $.w, Eb[ub + 8] = _.x, 
                            Eb[ub + 9] = _.y, Eb[ub + 10] = _.z, Eb[ub + 11] = _.w, ub += 12;
                            ub > 0 && (W.bindBuffer(W.ARRAY_BUFFER, s.__webglSkinIndicesBuffer), W.bufferData(W.ARRAY_BUFFER, Eb, u), 
                            W.bindBuffer(W.ARRAY_BUFFER, s.__webglSkinWeightsBuffer), W.bufferData(W.ARRAY_BUFFER, Fb, u));
                        }
                        if (Rb) {
                            for (y = 0, z = Vb.length; z > y; y++) B = Wb[Vb[y]], E = B.vertexColors, F = B.color, 
                            3 === E.length && w.vertexColors === THREE.VertexColors ? (S = E[0], T = E[1], U = E[2]) : U = T = S = F, 
                            Db[tb] = S.r, Db[tb + 1] = S.g, Db[tb + 2] = S.b, Db[tb + 3] = T.r, Db[tb + 4] = T.g, 
                            Db[tb + 5] = T.b, Db[tb + 6] = U.r, Db[tb + 7] = U.g, Db[tb + 8] = U.b, tb += 9;
                            tb > 0 && (W.bindBuffer(W.ARRAY_BUFFER, s.__webglColorBuffer), W.bufferData(W.ARRAY_BUFFER, Db, u));
                        }
                        if (Qb && Mb.hasTangents) {
                            for (y = 0, z = Vb.length; z > y; y++) B = Wb[Vb[y]], G = B.vertexTangents, M = G[0], 
                            N = G[1], O = G[2], Cb[rb] = M.x, Cb[rb + 1] = M.y, Cb[rb + 2] = M.z, Cb[rb + 3] = M.w, 
                            Cb[rb + 4] = N.x, Cb[rb + 5] = N.y, Cb[rb + 6] = N.z, Cb[rb + 7] = N.w, Cb[rb + 8] = O.x, 
                            Cb[rb + 9] = O.y, Cb[rb + 10] = O.z, Cb[rb + 11] = O.w, rb += 12;
                            W.bindBuffer(W.ARRAY_BUFFER, s.__webglTangentBuffer), W.bufferData(W.ARRAY_BUFFER, Cb, u);
                        }
                        if (Pb) {
                            for (y = 0, z = Vb.length; z > y; y++) if (B = Wb[Vb[y]], C = B.vertexNormals, D = B.normal, 
                            3 === C.length && !1 === x) for (ab = 0; 3 > ab; ab++) cb = C[ab], Bb[qb] = cb.x, 
                            Bb[qb + 1] = cb.y, Bb[qb + 2] = cb.z, qb += 3; else for (ab = 0; 3 > ab; ab++) Bb[qb] = D.x, 
                            Bb[qb + 1] = D.y, Bb[qb + 2] = D.z, qb += 3;
                            W.bindBuffer(W.ARRAY_BUFFER, s.__webglNormalBuffer), W.bufferData(W.ARRAY_BUFFER, Bb, u);
                        }
                        if (Ob && Xb) {
                            for (y = 0, z = Vb.length; z > y; y++) if (A = Vb[y], H = Xb[A], void 0 !== H) for (ab = 0; 3 > ab; ab++) db = H[ab], 
                            zb[nb] = db.x, zb[nb + 1] = db.y, nb += 2;
                            nb > 0 && (W.bindBuffer(W.ARRAY_BUFFER, s.__webglUVBuffer), W.bufferData(W.ARRAY_BUFFER, zb, u));
                        }
                        if (Ob && Yb) {
                            for (y = 0, z = Vb.length; z > y; y++) if (A = Vb[y], I = Yb[A], void 0 !== I) for (ab = 0; 3 > ab; ab++) eb = I[ab], 
                            Ab[ob] = eb.x, Ab[ob + 1] = eb.y, ob += 2;
                            ob > 0 && (W.bindBuffer(W.ARRAY_BUFFER, s.__webglUV2Buffer), W.bufferData(W.ARRAY_BUFFER, Ab, u));
                        }
                        if (Nb) {
                            for (y = 0, z = Vb.length; z > y; y++) Kb[pb] = lb, Kb[pb + 1] = lb + 1, Kb[pb + 2] = lb + 2, 
                            pb += 3, Lb[sb] = lb, Lb[sb + 1] = lb + 1, Lb[sb + 2] = lb, Lb[sb + 3] = lb + 2, 
                            Lb[sb + 4] = lb + 1, Lb[sb + 5] = lb + 2, sb += 6, lb += 3;
                            W.bindBuffer(W.ELEMENT_ARRAY_BUFFER, s.__webglFaceBuffer), W.bufferData(W.ELEMENT_ARRAY_BUFFER, Kb, u), 
                            W.bindBuffer(W.ELEMENT_ARRAY_BUFFER, s.__webglLineBuffer), W.bufferData(W.ELEMENT_ARRAY_BUFFER, Lb, u);
                        }
                        if (Ib) for (ab = 0, bb = Ib.length; bb > ab; ab++) if (Jb = Ib[ab], Jb.__original.needsUpdate) {
                            if (wb = 0, 1 === Jb.size) {
                                if (void 0 === Jb.boundTo || "vertices" === Jb.boundTo) for (y = 0, z = Vb.length; z > y; y++) B = Wb[Vb[y]], 
                                Jb.array[wb] = Jb.value[B.a], Jb.array[wb + 1] = Jb.value[B.b], Jb.array[wb + 2] = Jb.value[B.c], 
                                wb += 3; else if ("faces" === Jb.boundTo) for (y = 0, z = Vb.length; z > y; y++) xb = Jb.value[Vb[y]], 
                                Jb.array[wb] = xb, Jb.array[wb + 1] = xb, Jb.array[wb + 2] = xb, wb += 3;
                            } else if (2 === Jb.size) {
                                if (void 0 === Jb.boundTo || "vertices" === Jb.boundTo) for (y = 0, z = Vb.length; z > y; y++) B = Wb[Vb[y]], 
                                J = Jb.value[B.a], K = Jb.value[B.b], L = Jb.value[B.c], Jb.array[wb] = J.x, Jb.array[wb + 1] = J.y, 
                                Jb.array[wb + 2] = K.x, Jb.array[wb + 3] = K.y, Jb.array[wb + 4] = L.x, Jb.array[wb + 5] = L.y, 
                                wb += 6; else if ("faces" === Jb.boundTo) for (y = 0, z = Vb.length; z > y; y++) L = K = J = xb = Jb.value[Vb[y]], 
                                Jb.array[wb] = J.x, Jb.array[wb + 1] = J.y, Jb.array[wb + 2] = K.x, Jb.array[wb + 3] = K.y, 
                                Jb.array[wb + 4] = L.x, Jb.array[wb + 5] = L.y, wb += 6;
                            } else if (3 === Jb.size) {
                                var bc;
                                if (bc = "c" === Jb.type ? [ "r", "g", "b" ] : [ "x", "y", "z" ], void 0 === Jb.boundTo || "vertices" === Jb.boundTo) for (y = 0, 
                                z = Vb.length; z > y; y++) B = Wb[Vb[y]], J = Jb.value[B.a], K = Jb.value[B.b], 
                                L = Jb.value[B.c], Jb.array[wb] = J[bc[0]], Jb.array[wb + 1] = J[bc[1]], Jb.array[wb + 2] = J[bc[2]], 
                                Jb.array[wb + 3] = K[bc[0]], Jb.array[wb + 4] = K[bc[1]], Jb.array[wb + 5] = K[bc[2]], 
                                Jb.array[wb + 6] = L[bc[0]], Jb.array[wb + 7] = L[bc[1]], Jb.array[wb + 8] = L[bc[2]], 
                                wb += 9; else if ("faces" === Jb.boundTo) for (y = 0, z = Vb.length; z > y; y++) L = K = J = xb = Jb.value[Vb[y]], 
                                Jb.array[wb] = J[bc[0]], Jb.array[wb + 1] = J[bc[1]], Jb.array[wb + 2] = J[bc[2]], 
                                Jb.array[wb + 3] = K[bc[0]], Jb.array[wb + 4] = K[bc[1]], Jb.array[wb + 5] = K[bc[2]], 
                                Jb.array[wb + 6] = L[bc[0]], Jb.array[wb + 7] = L[bc[1]], Jb.array[wb + 8] = L[bc[2]], 
                                wb += 9; else if ("faceVertices" === Jb.boundTo) for (y = 0, z = Vb.length; z > y; y++) xb = Jb.value[Vb[y]], 
                                J = xb[0], K = xb[1], L = xb[2], Jb.array[wb] = J[bc[0]], Jb.array[wb + 1] = J[bc[1]], 
                                Jb.array[wb + 2] = J[bc[2]], Jb.array[wb + 3] = K[bc[0]], Jb.array[wb + 4] = K[bc[1]], 
                                Jb.array[wb + 5] = K[bc[2]], Jb.array[wb + 6] = L[bc[0]], Jb.array[wb + 7] = L[bc[1]], 
                                Jb.array[wb + 8] = L[bc[2]], wb += 9;
                            } else if (4 === Jb.size) if (void 0 === Jb.boundTo || "vertices" === Jb.boundTo) for (y = 0, 
                            z = Vb.length; z > y; y++) B = Wb[Vb[y]], J = Jb.value[B.a], K = Jb.value[B.b], 
                            L = Jb.value[B.c], Jb.array[wb] = J.x, Jb.array[wb + 1] = J.y, Jb.array[wb + 2] = J.z, 
                            Jb.array[wb + 3] = J.w, Jb.array[wb + 4] = K.x, Jb.array[wb + 5] = K.y, Jb.array[wb + 6] = K.z, 
                            Jb.array[wb + 7] = K.w, Jb.array[wb + 8] = L.x, Jb.array[wb + 9] = L.y, Jb.array[wb + 10] = L.z, 
                            Jb.array[wb + 11] = L.w, wb += 12; else if ("faces" === Jb.boundTo) for (y = 0, 
                            z = Vb.length; z > y; y++) L = K = J = xb = Jb.value[Vb[y]], Jb.array[wb] = J.x, 
                            Jb.array[wb + 1] = J.y, Jb.array[wb + 2] = J.z, Jb.array[wb + 3] = J.w, Jb.array[wb + 4] = K.x, 
                            Jb.array[wb + 5] = K.y, Jb.array[wb + 6] = K.z, Jb.array[wb + 7] = K.w, Jb.array[wb + 8] = L.x, 
                            Jb.array[wb + 9] = L.y, Jb.array[wb + 10] = L.z, Jb.array[wb + 11] = L.w, wb += 12; else if ("faceVertices" === Jb.boundTo) for (y = 0, 
                            z = Vb.length; z > y; y++) xb = Jb.value[Vb[y]], J = xb[0], K = xb[1], L = xb[2], 
                            Jb.array[wb] = J.x, Jb.array[wb + 1] = J.y, Jb.array[wb + 2] = J.z, Jb.array[wb + 3] = J.w, 
                            Jb.array[wb + 4] = K.x, Jb.array[wb + 5] = K.y, Jb.array[wb + 6] = K.z, Jb.array[wb + 7] = K.w, 
                            Jb.array[wb + 8] = L.x, Jb.array[wb + 9] = L.y, Jb.array[wb + 10] = L.z, Jb.array[wb + 11] = L.w, 
                            wb += 12;
                            W.bindBuffer(W.ARRAY_BUFFER, Jb.buffer), W.bufferData(W.ARRAY_BUFFER, Jb.array, u);
                        }
                        v && (delete s.__inittedArrays, delete s.__colorArray, delete s.__normalArray, delete s.__tangentArray, 
                        delete s.__uvArray, delete s.__uv2Array, delete s.__faceArray, delete s.__vertexArray, 
                        delete s.__lineArray, delete s.__skinIndexArray, delete s.__skinWeightArray);
                    }
                }
            }
            b.verticesNeedUpdate = !1, b.morphTargetsNeedUpdate = !1, b.elementsNeedUpdate = !1, 
            b.uvsNeedUpdate = !1, b.normalsNeedUpdate = !1, b.colorsNeedUpdate = !1, b.tangentsNeedUpdate = !1, 
            q.attributes && p(q);
        } else if (a instanceof THREE.Line) {
            if (q = c(a, b), r = q.attributes && o(q), b.verticesNeedUpdate || b.colorsNeedUpdate || b.lineDistancesNeedUpdate || r) {
                var cc, dc, ec, fc, gc, hc, ic, jc, kc, lc, mc, nc, oc = W.DYNAMIC_DRAW, pc = b.vertices, qc = b.colors, rc = b.lineDistances, sc = pc.length, tc = qc.length, uc = rc.length, vc = b.__vertexArray, wc = b.__colorArray, xc = b.__lineDistanceArray, yc = b.colorsNeedUpdate, zc = b.lineDistancesNeedUpdate, Ac = b.__webglCustomAttributesList;
                if (b.verticesNeedUpdate) {
                    for (cc = 0; sc > cc; cc++) fc = pc[cc], gc = 3 * cc, vc[gc] = fc.x, vc[gc + 1] = fc.y, 
                    vc[gc + 2] = fc.z;
                    W.bindBuffer(W.ARRAY_BUFFER, b.__webglVertexBuffer), W.bufferData(W.ARRAY_BUFFER, vc, oc);
                }
                if (yc) {
                    for (dc = 0; tc > dc; dc++) hc = qc[dc], gc = 3 * dc, wc[gc] = hc.r, wc[gc + 1] = hc.g, 
                    wc[gc + 2] = hc.b;
                    W.bindBuffer(W.ARRAY_BUFFER, b.__webglColorBuffer), W.bufferData(W.ARRAY_BUFFER, wc, oc);
                }
                if (zc) {
                    for (ec = 0; uc > ec; ec++) xc[ec] = rc[ec];
                    W.bindBuffer(W.ARRAY_BUFFER, b.__webglLineDistanceBuffer), W.bufferData(W.ARRAY_BUFFER, xc, oc);
                }
                if (Ac) for (ic = 0, jc = Ac.length; jc > ic; ic++) if (nc = Ac[ic], nc.needsUpdate && (void 0 === nc.boundTo || "vertices" === nc.boundTo)) {
                    if (gc = 0, lc = nc.value.length, 1 === nc.size) for (kc = 0; lc > kc; kc++) nc.array[kc] = nc.value[kc]; else if (2 === nc.size) for (kc = 0; lc > kc; kc++) mc = nc.value[kc], 
                    nc.array[gc] = mc.x, nc.array[gc + 1] = mc.y, gc += 2; else if (3 === nc.size) if ("c" === nc.type) for (kc = 0; lc > kc; kc++) mc = nc.value[kc], 
                    nc.array[gc] = mc.r, nc.array[gc + 1] = mc.g, nc.array[gc + 2] = mc.b, gc += 3; else for (kc = 0; lc > kc; kc++) mc = nc.value[kc], 
                    nc.array[gc] = mc.x, nc.array[gc + 1] = mc.y, nc.array[gc + 2] = mc.z, gc += 3; else if (4 === nc.size) for (kc = 0; lc > kc; kc++) mc = nc.value[kc], 
                    nc.array[gc] = mc.x, nc.array[gc + 1] = mc.y, nc.array[gc + 2] = mc.z, nc.array[gc + 3] = mc.w, 
                    gc += 4;
                    W.bindBuffer(W.ARRAY_BUFFER, nc.buffer), W.bufferData(W.ARRAY_BUFFER, nc.array, oc), 
                    nc.needsUpdate = !1;
                }
            }
            b.verticesNeedUpdate = !1, b.colorsNeedUpdate = !1, b.lineDistancesNeedUpdate = !1, 
            q.attributes && p(q);
        } else if (a instanceof THREE.PointCloud) {
            if (q = c(a, b), r = q.attributes && o(q), b.verticesNeedUpdate || b.colorsNeedUpdate || r) {
                var Bc, Cc, Dc, Ec, Fc, Gc, Hc, Ic, Jc, Kc, Lc, Mc = W.DYNAMIC_DRAW, Nc = b.vertices, Oc = Nc.length, Pc = b.colors, Qc = Pc.length, Rc = b.__vertexArray, Sc = b.__colorArray, Tc = b.colorsNeedUpdate, Uc = b.__webglCustomAttributesList;
                if (b.verticesNeedUpdate) {
                    for (Bc = 0; Oc > Bc; Bc++) Dc = Nc[Bc], Ec = 3 * Bc, Rc[Ec] = Dc.x, Rc[Ec + 1] = Dc.y, 
                    Rc[Ec + 2] = Dc.z;
                    W.bindBuffer(W.ARRAY_BUFFER, b.__webglVertexBuffer), W.bufferData(W.ARRAY_BUFFER, Rc, Mc);
                }
                if (Tc) {
                    for (Cc = 0; Qc > Cc; Cc++) Fc = Pc[Cc], Ec = 3 * Cc, Sc[Ec] = Fc.r, Sc[Ec + 1] = Fc.g, 
                    Sc[Ec + 2] = Fc.b;
                    W.bindBuffer(W.ARRAY_BUFFER, b.__webglColorBuffer), W.bufferData(W.ARRAY_BUFFER, Sc, Mc);
                }
                if (Uc) for (Gc = 0, Hc = Uc.length; Hc > Gc; Gc++) {
                    if (Lc = Uc[Gc], Lc.needsUpdate && (void 0 === Lc.boundTo || "vertices" === Lc.boundTo)) if (Jc = Lc.value.length, 
                    Ec = 0, 1 === Lc.size) for (Ic = 0; Jc > Ic; Ic++) Lc.array[Ic] = Lc.value[Ic]; else if (2 === Lc.size) for (Ic = 0; Jc > Ic; Ic++) Kc = Lc.value[Ic], 
                    Lc.array[Ec] = Kc.x, Lc.array[Ec + 1] = Kc.y, Ec += 2; else if (3 === Lc.size) if ("c" === Lc.type) for (Ic = 0; Jc > Ic; Ic++) Kc = Lc.value[Ic], 
                    Lc.array[Ec] = Kc.r, Lc.array[Ec + 1] = Kc.g, Lc.array[Ec + 2] = Kc.b, Ec += 3; else for (Ic = 0; Jc > Ic; Ic++) Kc = Lc.value[Ic], 
                    Lc.array[Ec] = Kc.x, Lc.array[Ec + 1] = Kc.y, Lc.array[Ec + 2] = Kc.z, Ec += 3; else if (4 === Lc.size) for (Ic = 0; Jc > Ic; Ic++) Kc = Lc.value[Ic], 
                    Lc.array[Ec] = Kc.x, Lc.array[Ec + 1] = Kc.y, Lc.array[Ec + 2] = Kc.z, Lc.array[Ec + 3] = Kc.w, 
                    Ec += 4;
                    W.bindBuffer(W.ARRAY_BUFFER, Lc.buffer), W.bufferData(W.ARRAY_BUFFER, Lc.array, Mc), 
                    Lc.needsUpdate = !1;
                }
            }
            b.verticesNeedUpdate = !1, b.colorsNeedUpdate = !1, q.attributes && p(q);
        }
    }
    function o(a) {
        for (var b in a.attributes) if (a.attributes[b].needsUpdate) return !0;
        return !1;
    }
    function p(a) {
        for (var b in a.attributes) a.attributes[b].needsUpdate = !1;
    }
    function q(a) {
        !0 === a.transparent ? rb.setBlending(a.blending, a.blendEquation, a.blendSrc, a.blendDst, a.blendEquationAlpha, a.blendSrcAlpha, a.blendDstAlpha) : rb.setBlending(THREE.NoBlending), 
        rb.setDepthTest(a.depthTest), rb.setDepthWrite(a.depthWrite), rb.setColorWrite(a.colorWrite), 
        rb.setPolygonOffset(a.polygonOffset, a.polygonOffsetFactor, a.polygonOffsetUnits);
    }
    function r(a, b, c, d, e) {
        var f, g, h, i;
        if (cb = 0, d.needsUpdate) {
            d.program && Sb(d), d.addEventListener("dispose", Qb);
            var j = Vb[d.type];
            if (j) {
                var k = THREE.ShaderLib[j];
                d.__webglShader = {
                    uniforms: THREE.UniformsUtils.clone(k.uniforms),
                    vertexShader: k.vertexShader,
                    fragmentShader: k.fragmentShader
                };
            } else d.__webglShader = {
                uniforms: d.uniforms,
                vertexShader: d.vertexShader,
                fragmentShader: d.fragmentShader
            };
            for (var l = 0, m = 0, n = 0, o = 0, p = 0, q = b.length; q > p; p++) {
                var r = b[p];
                r.onlyShadow || !1 === r.visible || (r instanceof THREE.DirectionalLight && l++, 
                r instanceof THREE.PointLight && m++, r instanceof THREE.SpotLight && n++, r instanceof THREE.HemisphereLight && o++);
            }
            f = l, g = m, h = n, i = o;
            for (var u, y = 0, z = 0, A = b.length; A > z; z++) {
                var D = b[z];
                D.castShadow && (D instanceof THREE.SpotLight && y++, D instanceof THREE.DirectionalLight && !D.shadowCascade && y++);
            }
            u = y;
            var E;
            if (Bb && e && e.skeleton && e.skeleton.useVertexTexture) E = 1024; else {
                var G = W.getParameter(W.MAX_VERTEX_UNIFORM_VECTORS), H = Math.floor((G - 20) / 4);
                void 0 !== e && e instanceof THREE.SkinnedMesh && (H = Math.min(e.skeleton.bones.length, H), 
                H < e.skeleton.bones.length && THREE.warn("WebGLRenderer: too many bones - " + e.skeleton.bones.length + ", this GPU supports just " + H + " (try OpenGL instead of ANGLE)")), 
                E = H;
            }
            var I = {
                precision: F,
                supportsVertexTextures: Ab,
                map: !!d.map,
                envMap: !!d.envMap,
                envMapMode: d.envMap && d.envMap.mapping,
                lightMap: !!d.lightMap,
                bumpMap: !!d.bumpMap,
                normalMap: !!d.normalMap,
                specularMap: !!d.specularMap,
                alphaMap: !!d.alphaMap,
                combine: d.combine,
                vertexColors: d.vertexColors,
                fog: c,
                useFog: d.fog,
                fogExp: c instanceof THREE.FogExp2,
                flatShading: d.shading === THREE.FlatShading,
                sizeAttenuation: d.sizeAttenuation,
                logarithmicDepthBuffer: M,
                skinning: d.skinning,
                maxBones: E,
                useVertexTexture: Bb && e && e.skeleton && e.skeleton.useVertexTexture,
                morphTargets: d.morphTargets,
                morphNormals: d.morphNormals,
                maxMorphTargets: X.maxMorphTargets,
                maxMorphNormals: X.maxMorphNormals,
                maxDirLights: f,
                maxPointLights: g,
                maxSpotLights: h,
                maxHemiLights: i,
                maxShadows: u,
                shadowMapEnabled: X.shadowMapEnabled && e.receiveShadow && u > 0,
                shadowMapType: X.shadowMapType,
                shadowMapDebug: X.shadowMapDebug,
                shadowMapCascade: X.shadowMapCascade,
                alphaTest: d.alphaTest,
                metal: d.metal,
                wrapAround: d.wrapAround,
                doubleSided: d.side === THREE.DoubleSide,
                flipSided: d.side === THREE.BackSide
            }, J = [];
            if (j ? J.push(j) : (J.push(d.fragmentShader), J.push(d.vertexShader)), void 0 !== d.defines) for (var K in d.defines) J.push(K), 
            J.push(d.defines[K]);
            for (K in I) J.push(K), J.push(I[K]);
            for (var L, N = J.join(), O = 0, P = Y.length; P > O; O++) {
                var Q = Y[O];
                if (Q.code === N) {
                    L = Q, L.usedTimes++;
                    break;
                }
            }
            void 0 === L && (L = new THREE.WebGLProgram(X, N, d, I), Y.push(L), X.info.memory.programs = Y.length), 
            d.program = L;
            var R = L.attributes;
            if (d.morphTargets) {
                d.numSupportedMorphTargets = 0;
                for (var S, T = "morphTarget", U = 0; U < X.maxMorphTargets; U++) S = T + U, 0 <= R[S] && d.numSupportedMorphTargets++;
            }
            if (d.morphNormals) for (d.numSupportedMorphNormals = 0, T = "morphNormal", U = 0; U < X.maxMorphNormals; U++) S = T + U, 
            0 <= R[S] && d.numSupportedMorphNormals++;
            d.uniformsList = [];
            for (var V in d.__webglShader.uniforms) {
                var $ = d.program.uniforms[V];
                $ && d.uniformsList.push([ d.__webglShader.uniforms[V], $ ]);
            }
            d.needsUpdate = !1;
        }
        d.morphTargets && !e.__webglMorphTargetInfluences && (e.__webglMorphTargetInfluences = new Float32Array(X.maxMorphTargets));
        var ab = !1, db = !1, eb = !1, fb = d.program, gb = fb.uniforms, hb = d.__webglShader.uniforms;
        if (fb.id !== Z && (W.useProgram(fb.program), Z = fb.id, eb = db = ab = !0), d.id !== _ && (-1 === _ && (eb = !0), 
        _ = d.id, db = !0), (ab || a !== bb) && (W.uniformMatrix4fv(gb.projectionMatrix, !1, a.projectionMatrix.elements), 
        M && W.uniform1f(gb.logDepthBufFC, 2 / (Math.log(a.far + 1) / Math.LN2)), a !== bb && (bb = a), 
        (d instanceof THREE.ShaderMaterial || d instanceof THREE.MeshPhongMaterial || d.envMap) && null !== gb.cameraPosition && (lb.setFromMatrixPosition(a.matrixWorld), 
        W.uniform3f(gb.cameraPosition, lb.x, lb.y, lb.z)), (d instanceof THREE.MeshPhongMaterial || d instanceof THREE.MeshLambertMaterial || d instanceof THREE.MeshBasicMaterial || d instanceof THREE.ShaderMaterial || d.skinning) && null !== gb.viewMatrix && W.uniformMatrix4fv(gb.viewMatrix, !1, a.matrixWorldInverse.elements)), 
        d.skinning) if (e.bindMatrix && null !== gb.bindMatrix && W.uniformMatrix4fv(gb.bindMatrix, !1, e.bindMatrix.elements), 
        e.bindMatrixInverse && null !== gb.bindMatrixInverse && W.uniformMatrix4fv(gb.bindMatrixInverse, !1, e.bindMatrixInverse.elements), 
        Bb && e.skeleton && e.skeleton.useVertexTexture) {
            if (null !== gb.boneTexture) {
                var ib = t();
                W.uniform1i(gb.boneTexture, ib), X.setTexture(e.skeleton.boneTexture, ib);
            }
            null !== gb.boneTextureWidth && W.uniform1i(gb.boneTextureWidth, e.skeleton.boneTextureWidth), 
            null !== gb.boneTextureHeight && W.uniform1i(gb.boneTextureHeight, e.skeleton.boneTextureHeight);
        } else e.skeleton && e.skeleton.boneMatrices && null !== gb.boneGlobalMatrices && W.uniformMatrix4fv(gb.boneGlobalMatrices, !1, e.skeleton.boneMatrices);
        if (db) {
            if (c && d.fog && (hb.fogColor.value = c.color, c instanceof THREE.Fog ? (hb.fogNear.value = c.near, 
            hb.fogFar.value = c.far) : c instanceof THREE.FogExp2 && (hb.fogDensity.value = c.density)), 
            d instanceof THREE.MeshPhongMaterial || d instanceof THREE.MeshLambertMaterial || d.lights) {
                if (nb) {
                    var jb, kb, pb, qb, rb, sb, tb, ub, eb = !0, vb = 0, wb = 0, xb = 0, yb = ob, Cb = yb.directional.colors, Db = yb.directional.positions, Eb = yb.point.colors, Fb = yb.point.positions, Hb = yb.point.distances, Ib = yb.point.decays, Jb = yb.spot.colors, Kb = yb.spot.positions, Lb = yb.spot.distances, Mb = yb.spot.directions, Nb = yb.spot.anglesCos, Pb = yb.spot.exponents, Rb = yb.spot.decays, Tb = yb.hemi.skyColors, Ub = yb.hemi.groundColors, Wb = yb.hemi.positions, Xb = 0, Yb = 0, Zb = 0, $b = 0, _b = 0, ac = 0, bc = 0, cc = 0, dc = 0, ec = 0, fc = 0, gc = 0;
                    for (jb = 0, kb = b.length; kb > jb; jb++) pb = b[jb], pb.onlyShadow || (qb = pb.color, 
                    tb = pb.intensity, ub = pb.distance, pb instanceof THREE.AmbientLight ? pb.visible && (vb += qb.r, 
                    wb += qb.g, xb += qb.b) : pb instanceof THREE.DirectionalLight ? (_b += 1, pb.visible && (mb.setFromMatrixPosition(pb.matrixWorld), 
                    lb.setFromMatrixPosition(pb.target.matrixWorld), mb.sub(lb), mb.normalize(), dc = 3 * Xb, 
                    Db[dc] = mb.x, Db[dc + 1] = mb.y, Db[dc + 2] = mb.z, v(Cb, dc, qb, tb), Xb += 1)) : pb instanceof THREE.PointLight ? (ac += 1, 
                    pb.visible && (ec = 3 * Yb, v(Eb, ec, qb, tb), lb.setFromMatrixPosition(pb.matrixWorld), 
                    Fb[ec] = lb.x, Fb[ec + 1] = lb.y, Fb[ec + 2] = lb.z, Hb[Yb] = ub, Ib[Yb] = 0 === pb.distance ? 0 : pb.decay, 
                    Yb += 1)) : pb instanceof THREE.SpotLight ? (bc += 1, pb.visible && (fc = 3 * Zb, 
                    v(Jb, fc, qb, tb), mb.setFromMatrixPosition(pb.matrixWorld), Kb[fc] = mb.x, Kb[fc + 1] = mb.y, 
                    Kb[fc + 2] = mb.z, Lb[Zb] = ub, lb.setFromMatrixPosition(pb.target.matrixWorld), 
                    mb.sub(lb), mb.normalize(), Mb[fc] = mb.x, Mb[fc + 1] = mb.y, Mb[fc + 2] = mb.z, 
                    Nb[Zb] = Math.cos(pb.angle), Pb[Zb] = pb.exponent, Rb[Zb] = 0 === pb.distance ? 0 : pb.decay, 
                    Zb += 1)) : pb instanceof THREE.HemisphereLight && (cc += 1, pb.visible && (mb.setFromMatrixPosition(pb.matrixWorld), 
                    mb.normalize(), gc = 3 * $b, Wb[gc] = mb.x, Wb[gc + 1] = mb.y, Wb[gc + 2] = mb.z, 
                    rb = pb.color, sb = pb.groundColor, v(Tb, gc, rb, tb), v(Ub, gc, sb, tb), $b += 1)));
                    for (jb = 3 * Xb, kb = Math.max(Cb.length, 3 * _b); kb > jb; jb++) Cb[jb] = 0;
                    for (jb = 3 * Yb, kb = Math.max(Eb.length, 3 * ac); kb > jb; jb++) Eb[jb] = 0;
                    for (jb = 3 * Zb, kb = Math.max(Jb.length, 3 * bc); kb > jb; jb++) Jb[jb] = 0;
                    for (jb = 3 * $b, kb = Math.max(Tb.length, 3 * cc); kb > jb; jb++) Tb[jb] = 0;
                    for (jb = 3 * $b, kb = Math.max(Ub.length, 3 * cc); kb > jb; jb++) Ub[jb] = 0;
                    yb.directional.length = Xb, yb.point.length = Yb, yb.spot.length = Zb, yb.hemi.length = $b, 
                    yb.ambient[0] = vb, yb.ambient[1] = wb, yb.ambient[2] = xb, nb = !1;
                }
                if (eb) {
                    var hc = ob;
                    hb.ambientLightColor.value = hc.ambient, hb.directionalLightColor.value = hc.directional.colors, 
                    hb.directionalLightDirection.value = hc.directional.positions, hb.pointLightColor.value = hc.point.colors, 
                    hb.pointLightPosition.value = hc.point.positions, hb.pointLightDistance.value = hc.point.distances, 
                    hb.pointLightDecay.value = hc.point.decays, hb.spotLightColor.value = hc.spot.colors, 
                    hb.spotLightPosition.value = hc.spot.positions, hb.spotLightDistance.value = hc.spot.distances, 
                    hb.spotLightDirection.value = hc.spot.directions, hb.spotLightAngleCos.value = hc.spot.anglesCos, 
                    hb.spotLightExponent.value = hc.spot.exponents, hb.spotLightDecay.value = hc.spot.decays, 
                    hb.hemisphereLightSkyColor.value = hc.hemi.skyColors, hb.hemisphereLightGroundColor.value = hc.hemi.groundColors, 
                    hb.hemisphereLightDirection.value = hc.hemi.positions, s(hb, !0);
                } else s(hb, !1);
            }
            if (d instanceof THREE.MeshBasicMaterial || d instanceof THREE.MeshLambertMaterial || d instanceof THREE.MeshPhongMaterial) {
                hb.opacity.value = d.opacity, hb.diffuse.value = d.color, hb.map.value = d.map, 
                hb.lightMap.value = d.lightMap, hb.specularMap.value = d.specularMap, hb.alphaMap.value = d.alphaMap, 
                d.bumpMap && (hb.bumpMap.value = d.bumpMap, hb.bumpScale.value = d.bumpScale), d.normalMap && (hb.normalMap.value = d.normalMap, 
                hb.normalScale.value.copy(d.normalScale));
                var ic;
                if (d.map ? ic = d.map : d.specularMap ? ic = d.specularMap : d.normalMap ? ic = d.normalMap : d.bumpMap ? ic = d.bumpMap : d.alphaMap && (ic = d.alphaMap), 
                void 0 !== ic) {
                    var jc = ic.offset, kc = ic.repeat;
                    hb.offsetRepeat.value.set(jc.x, jc.y, kc.x, kc.y);
                }
                hb.envMap.value = d.envMap, hb.flipEnvMap.value = d.envMap instanceof THREE.WebGLRenderTargetCube ? 1 : -1, 
                hb.reflectivity.value = d.reflectivity, hb.refractionRatio.value = d.refractionRatio;
            }
            if (d instanceof THREE.LineBasicMaterial) hb.diffuse.value = d.color, hb.opacity.value = d.opacity; else if (d instanceof THREE.LineDashedMaterial) hb.diffuse.value = d.color, 
            hb.opacity.value = d.opacity, hb.dashSize.value = d.dashSize, hb.totalSize.value = d.dashSize + d.gapSize, 
            hb.scale.value = d.scale; else if (d instanceof THREE.PointCloudMaterial) {
                if (hb.psColor.value = d.color, hb.opacity.value = d.opacity, hb.size.value = d.size, 
                hb.scale.value = C.height / 2, hb.map.value = d.map, null !== d.map) {
                    var lc = d.map.offset, mc = d.map.repeat;
                    hb.offsetRepeat.value.set(lc.x, lc.y, mc.x, mc.y);
                }
            } else d instanceof THREE.MeshPhongMaterial ? (hb.shininess.value = d.shininess, 
            hb.emissive.value = d.emissive, hb.specular.value = d.specular, d.wrapAround && hb.wrapRGB.value.copy(d.wrapRGB)) : d instanceof THREE.MeshLambertMaterial ? (hb.emissive.value = d.emissive, 
            d.wrapAround && hb.wrapRGB.value.copy(d.wrapRGB)) : d instanceof THREE.MeshDepthMaterial ? (hb.mNear.value = a.near, 
            hb.mFar.value = a.far, hb.opacity.value = d.opacity) : d instanceof THREE.MeshNormalMaterial && (hb.opacity.value = d.opacity);
            if (e.receiveShadow && !d._shadowPass && hb.shadowMatrix) for (var nc = 0, oc = 0, pc = b.length; pc > oc; oc++) {
                var qc = b[oc];
                qc.castShadow && (qc instanceof THREE.SpotLight || qc instanceof THREE.DirectionalLight && !qc.shadowCascade) && (hb.shadowMap.value[nc] = qc.shadowMap, 
                hb.shadowMapSize.value[nc] = qc.shadowMapSize, hb.shadowMatrix.value[nc] = qc.shadowMatrix, 
                hb.shadowDarkness.value[nc] = qc.shadowDarkness, hb.shadowBias.value[nc] = qc.shadowBias, 
                nc++);
            }
            for (var rc, sc, tc, uc = d.uniformsList, vc = 0, wc = uc.length; wc > vc; vc++) {
                var xc = uc[vc][0];
                if (!1 !== xc.needsUpdate) {
                    var yc = xc.type, zc = xc.value, Ac = uc[vc][1];
                    switch (yc) {
                      case "1i":
                        W.uniform1i(Ac, zc);
                        break;

                      case "1f":
                        W.uniform1f(Ac, zc);
                        break;

                      case "2f":
                        W.uniform2f(Ac, zc[0], zc[1]);
                        break;

                      case "3f":
                        W.uniform3f(Ac, zc[0], zc[1], zc[2]);
                        break;

                      case "4f":
                        W.uniform4f(Ac, zc[0], zc[1], zc[2], zc[3]);
                        break;

                      case "1iv":
                        W.uniform1iv(Ac, zc);
                        break;

                      case "3iv":
                        W.uniform3iv(Ac, zc);
                        break;

                      case "1fv":
                        W.uniform1fv(Ac, zc);
                        break;

                      case "2fv":
                        W.uniform2fv(Ac, zc);
                        break;

                      case "3fv":
                        W.uniform3fv(Ac, zc);
                        break;

                      case "4fv":
                        W.uniform4fv(Ac, zc);
                        break;

                      case "Matrix3fv":
                        W.uniformMatrix3fv(Ac, !1, zc);
                        break;

                      case "Matrix4fv":
                        W.uniformMatrix4fv(Ac, !1, zc);
                        break;

                      case "i":
                        W.uniform1i(Ac, zc);
                        break;

                      case "f":
                        W.uniform1f(Ac, zc);
                        break;

                      case "v2":
                        W.uniform2f(Ac, zc.x, zc.y);
                        break;

                      case "v3":
                        W.uniform3f(Ac, zc.x, zc.y, zc.z);
                        break;

                      case "v4":
                        W.uniform4f(Ac, zc.x, zc.y, zc.z, zc.w);
                        break;

                      case "c":
                        W.uniform3f(Ac, zc.r, zc.g, zc.b);
                        break;

                      case "iv1":
                        W.uniform1iv(Ac, zc);
                        break;

                      case "iv":
                        W.uniform3iv(Ac, zc);
                        break;

                      case "fv1":
                        W.uniform1fv(Ac, zc);
                        break;

                      case "fv":
                        W.uniform3fv(Ac, zc);
                        break;

                      case "v2v":
                        void 0 === xc._array && (xc._array = new Float32Array(2 * zc.length));
                        for (var Bc = 0, Cc = zc.length; Cc > Bc; Bc++) tc = 2 * Bc, xc._array[tc] = zc[Bc].x, 
                        xc._array[tc + 1] = zc[Bc].y;
                        W.uniform2fv(Ac, xc._array);
                        break;

                      case "v3v":
                        for (void 0 === xc._array && (xc._array = new Float32Array(3 * zc.length)), Bc = 0, 
                        Cc = zc.length; Cc > Bc; Bc++) tc = 3 * Bc, xc._array[tc] = zc[Bc].x, xc._array[tc + 1] = zc[Bc].y, 
                        xc._array[tc + 2] = zc[Bc].z;
                        W.uniform3fv(Ac, xc._array);
                        break;

                      case "v4v":
                        for (void 0 === xc._array && (xc._array = new Float32Array(4 * zc.length)), Bc = 0, 
                        Cc = zc.length; Cc > Bc; Bc++) tc = 4 * Bc, xc._array[tc] = zc[Bc].x, xc._array[tc + 1] = zc[Bc].y, 
                        xc._array[tc + 2] = zc[Bc].z, xc._array[tc + 3] = zc[Bc].w;
                        W.uniform4fv(Ac, xc._array);
                        break;

                      case "m3":
                        W.uniformMatrix3fv(Ac, !1, zc.elements);
                        break;

                      case "m3v":
                        for (void 0 === xc._array && (xc._array = new Float32Array(9 * zc.length)), Bc = 0, 
                        Cc = zc.length; Cc > Bc; Bc++) zc[Bc].flattenToArrayOffset(xc._array, 9 * Bc);
                        W.uniformMatrix3fv(Ac, !1, xc._array);
                        break;

                      case "m4":
                        W.uniformMatrix4fv(Ac, !1, zc.elements);
                        break;

                      case "m4v":
                        for (void 0 === xc._array && (xc._array = new Float32Array(16 * zc.length)), Bc = 0, 
                        Cc = zc.length; Cc > Bc; Bc++) zc[Bc].flattenToArrayOffset(xc._array, 16 * Bc);
                        W.uniformMatrix4fv(Ac, !1, xc._array);
                        break;

                      case "t":
                        if (rc = zc, sc = t(), W.uniform1i(Ac, sc), !rc) continue;
                        if (rc instanceof THREE.CubeTexture || rc.image instanceof Array && 6 === rc.image.length) {
                            var Dc = rc, Ec = sc;
                            if (6 === Dc.image.length) if (Dc.needsUpdate) {
                                Dc.image.__webglTextureCube || (Dc.addEventListener("dispose", Ob), Dc.image.__webglTextureCube = W.createTexture(), 
                                X.info.memory.textures++), W.activeTexture(W.TEXTURE0 + Ec), W.bindTexture(W.TEXTURE_CUBE_MAP, Dc.image.__webglTextureCube), 
                                W.pixelStorei(W.UNPACK_FLIP_Y_WEBGL, Dc.flipY);
                                for (var Fc = Dc instanceof THREE.CompressedTexture, Gc = Dc.image[0] instanceof THREE.DataTexture, Hc = [], Ic = 0; 6 > Ic; Ic++) Hc[Ic] = !X.autoScaleCubemaps || Fc || Gc ? Gc ? Dc.image[Ic].image : Dc.image[Ic] : x(Dc.image[Ic], zb);
                                var Jc = Hc[0], Kc = THREE.Math.isPowerOfTwo(Jc.width) && THREE.Math.isPowerOfTwo(Jc.height), Lc = B(Dc.format), Mc = B(Dc.type);
                                for (w(W.TEXTURE_CUBE_MAP, Dc, Kc), Ic = 0; 6 > Ic; Ic++) if (Fc) for (var Nc, Oc = Hc[Ic].mipmaps, Pc = 0, Qc = Oc.length; Qc > Pc; Pc++) Nc = Oc[Pc], 
                                Dc.format !== THREE.RGBAFormat && Dc.format !== THREE.RGBFormat ? -1 < Gb().indexOf(Lc) ? W.compressedTexImage2D(W.TEXTURE_CUBE_MAP_POSITIVE_X + Ic, Pc, Lc, Nc.width, Nc.height, 0, Nc.data) : THREE.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setCubeTexture()") : W.texImage2D(W.TEXTURE_CUBE_MAP_POSITIVE_X + Ic, Pc, Lc, Nc.width, Nc.height, 0, Lc, Mc, Nc.data); else Gc ? W.texImage2D(W.TEXTURE_CUBE_MAP_POSITIVE_X + Ic, 0, Lc, Hc[Ic].width, Hc[Ic].height, 0, Lc, Mc, Hc[Ic].data) : W.texImage2D(W.TEXTURE_CUBE_MAP_POSITIVE_X + Ic, 0, Lc, Lc, Mc, Hc[Ic]);
                                Dc.generateMipmaps && Kc && W.generateMipmap(W.TEXTURE_CUBE_MAP), Dc.needsUpdate = !1, 
                                Dc.onUpdate && Dc.onUpdate();
                            } else W.activeTexture(W.TEXTURE0 + Ec), W.bindTexture(W.TEXTURE_CUBE_MAP, Dc.image.__webglTextureCube);
                        } else if (rc instanceof THREE.WebGLRenderTargetCube) {
                            var Rc = rc;
                            W.activeTexture(W.TEXTURE0 + sc), W.bindTexture(W.TEXTURE_CUBE_MAP, Rc.__webglTexture);
                        } else X.setTexture(rc, sc);
                        break;

                      case "tv":
                        for (void 0 === xc._array && (xc._array = []), Bc = 0, Cc = xc.value.length; Cc > Bc; Bc++) xc._array[Bc] = t();
                        for (W.uniform1iv(Ac, xc._array), Bc = 0, Cc = xc.value.length; Cc > Bc; Bc++) rc = xc.value[Bc], 
                        sc = xc._array[Bc], rc && X.setTexture(rc, sc);
                        break;

                      default:
                        THREE.warn("THREE.WebGLRenderer: Unknown uniform type: " + yc);
                    }
                }
            }
        }
        return W.uniformMatrix4fv(gb.modelViewMatrix, !1, e._modelViewMatrix.elements), 
        gb.normalMatrix && W.uniformMatrix3fv(gb.normalMatrix, !1, e._normalMatrix.elements), 
        null !== gb.modelMatrix && W.uniformMatrix4fv(gb.modelMatrix, !1, e.matrixWorld.elements), 
        fb;
    }
    function s(a, b) {
        a.ambientLightColor.needsUpdate = b, a.directionalLightColor.needsUpdate = b, a.directionalLightDirection.needsUpdate = b, 
        a.pointLightColor.needsUpdate = b, a.pointLightPosition.needsUpdate = b, a.pointLightDistance.needsUpdate = b, 
        a.pointLightDecay.needsUpdate = b, a.spotLightColor.needsUpdate = b, a.spotLightPosition.needsUpdate = b, 
        a.spotLightDistance.needsUpdate = b, a.spotLightDirection.needsUpdate = b, a.spotLightAngleCos.needsUpdate = b, 
        a.spotLightExponent.needsUpdate = b, a.spotLightDecay.needsUpdate = b, a.hemisphereLightSkyColor.needsUpdate = b, 
        a.hemisphereLightGroundColor.needsUpdate = b, a.hemisphereLightDirection.needsUpdate = b;
    }
    function t() {
        var a = cb;
        return a >= wb && THREE.warn("WebGLRenderer: trying to use " + a + " texture units while this GPU supports only " + wb), 
        cb += 1, a;
    }
    function u(a, b) {
        a._modelViewMatrix.multiplyMatrices(b.matrixWorldInverse, a.matrixWorld), a._normalMatrix.getNormalMatrix(a._modelViewMatrix);
    }
    function v(a, b, c, d) {
        a[b] = c.r * d, a[b + 1] = c.g * d, a[b + 2] = c.b * d;
    }
    function w(a, b, c) {
        c ? (W.texParameteri(a, W.TEXTURE_WRAP_S, B(b.wrapS)), W.texParameteri(a, W.TEXTURE_WRAP_T, B(b.wrapT)), 
        W.texParameteri(a, W.TEXTURE_MAG_FILTER, B(b.magFilter)), W.texParameteri(a, W.TEXTURE_MIN_FILTER, B(b.minFilter))) : (W.texParameteri(a, W.TEXTURE_WRAP_S, W.CLAMP_TO_EDGE), 
        W.texParameteri(a, W.TEXTURE_WRAP_T, W.CLAMP_TO_EDGE), b.wrapS === THREE.ClampToEdgeWrapping && b.wrapT === THREE.ClampToEdgeWrapping || THREE.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping. ( " + b.sourceFile + " )"), 
        W.texParameteri(a, W.TEXTURE_MAG_FILTER, A(b.magFilter)), W.texParameteri(a, W.TEXTURE_MIN_FILTER, A(b.minFilter)), 
        b.minFilter !== THREE.NearestFilter && b.minFilter !== THREE.LinearFilter && THREE.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter. ( " + b.sourceFile + " )")), 
        (c = sb.get("EXT_texture_filter_anisotropic")) && b.type !== THREE.FloatType && b.type !== THREE.HalfFloatType && (1 < b.anisotropy || b.__currentAnisotropy) && (W.texParameterf(a, c.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(b.anisotropy, X.getMaxAnisotropy())), 
        b.__currentAnisotropy = b.anisotropy);
    }
    function x(a, b) {
        if (a.width > b || a.height > b) {
            var c = b / Math.max(a.width, a.height), d = document.createElement("canvas");
            return d.width = Math.floor(a.width * c), d.height = Math.floor(a.height * c), d.getContext("2d").drawImage(a, 0, 0, a.width, a.height, 0, 0, d.width, d.height), 
            THREE.warn("THREE.WebGLRenderer: image is too big (" + a.width + "x" + a.height + "). Resized to " + d.width + "x" + d.height, a), 
            d;
        }
        return a;
    }
    function y(a, b) {
        W.bindRenderbuffer(W.RENDERBUFFER, a), b.depthBuffer && !b.stencilBuffer ? (W.renderbufferStorage(W.RENDERBUFFER, W.DEPTH_COMPONENT16, b.width, b.height), 
        W.framebufferRenderbuffer(W.FRAMEBUFFER, W.DEPTH_ATTACHMENT, W.RENDERBUFFER, a)) : b.depthBuffer && b.stencilBuffer ? (W.renderbufferStorage(W.RENDERBUFFER, W.DEPTH_STENCIL, b.width, b.height), 
        W.framebufferRenderbuffer(W.FRAMEBUFFER, W.DEPTH_STENCIL_ATTACHMENT, W.RENDERBUFFER, a)) : W.renderbufferStorage(W.RENDERBUFFER, W.RGBA4, b.width, b.height);
    }
    function z(a) {
        a instanceof THREE.WebGLRenderTargetCube ? (W.bindTexture(W.TEXTURE_CUBE_MAP, a.__webglTexture), 
        W.generateMipmap(W.TEXTURE_CUBE_MAP), W.bindTexture(W.TEXTURE_CUBE_MAP, null)) : (W.bindTexture(W.TEXTURE_2D, a.__webglTexture), 
        W.generateMipmap(W.TEXTURE_2D), W.bindTexture(W.TEXTURE_2D, null));
    }
    function A(a) {
        return a === THREE.NearestFilter || a === THREE.NearestMipMapNearestFilter || a === THREE.NearestMipMapLinearFilter ? W.NEAREST : W.LINEAR;
    }
    function B(a) {
        var b;
        if (a === THREE.RepeatWrapping) return W.REPEAT;
        if (a === THREE.ClampToEdgeWrapping) return W.CLAMP_TO_EDGE;
        if (a === THREE.MirroredRepeatWrapping) return W.MIRRORED_REPEAT;
        if (a === THREE.NearestFilter) return W.NEAREST;
        if (a === THREE.NearestMipMapNearestFilter) return W.NEAREST_MIPMAP_NEAREST;
        if (a === THREE.NearestMipMapLinearFilter) return W.NEAREST_MIPMAP_LINEAR;
        if (a === THREE.LinearFilter) return W.LINEAR;
        if (a === THREE.LinearMipMapNearestFilter) return W.LINEAR_MIPMAP_NEAREST;
        if (a === THREE.LinearMipMapLinearFilter) return W.LINEAR_MIPMAP_LINEAR;
        if (a === THREE.UnsignedByteType) return W.UNSIGNED_BYTE;
        if (a === THREE.UnsignedShort4444Type) return W.UNSIGNED_SHORT_4_4_4_4;
        if (a === THREE.UnsignedShort5551Type) return W.UNSIGNED_SHORT_5_5_5_1;
        if (a === THREE.UnsignedShort565Type) return W.UNSIGNED_SHORT_5_6_5;
        if (a === THREE.ByteType) return W.BYTE;
        if (a === THREE.ShortType) return W.SHORT;
        if (a === THREE.UnsignedShortType) return W.UNSIGNED_SHORT;
        if (a === THREE.IntType) return W.INT;
        if (a === THREE.UnsignedIntType) return W.UNSIGNED_INT;
        if (a === THREE.FloatType) return W.FLOAT;
        if (b = sb.get("OES_texture_half_float"), null !== b && a === THREE.HalfFloatType) return b.HALF_FLOAT_OES;
        if (a === THREE.AlphaFormat) return W.ALPHA;
        if (a === THREE.RGBFormat) return W.RGB;
        if (a === THREE.RGBAFormat) return W.RGBA;
        if (a === THREE.LuminanceFormat) return W.LUMINANCE;
        if (a === THREE.LuminanceAlphaFormat) return W.LUMINANCE_ALPHA;
        if (a === THREE.AddEquation) return W.FUNC_ADD;
        if (a === THREE.SubtractEquation) return W.FUNC_SUBTRACT;
        if (a === THREE.ReverseSubtractEquation) return W.FUNC_REVERSE_SUBTRACT;
        if (a === THREE.ZeroFactor) return W.ZERO;
        if (a === THREE.OneFactor) return W.ONE;
        if (a === THREE.SrcColorFactor) return W.SRC_COLOR;
        if (a === THREE.OneMinusSrcColorFactor) return W.ONE_MINUS_SRC_COLOR;
        if (a === THREE.SrcAlphaFactor) return W.SRC_ALPHA;
        if (a === THREE.OneMinusSrcAlphaFactor) return W.ONE_MINUS_SRC_ALPHA;
        if (a === THREE.DstAlphaFactor) return W.DST_ALPHA;
        if (a === THREE.OneMinusDstAlphaFactor) return W.ONE_MINUS_DST_ALPHA;
        if (a === THREE.DstColorFactor) return W.DST_COLOR;
        if (a === THREE.OneMinusDstColorFactor) return W.ONE_MINUS_DST_COLOR;
        if (a === THREE.SrcAlphaSaturateFactor) return W.SRC_ALPHA_SATURATE;
        if (b = sb.get("WEBGL_compressed_texture_s3tc"), null !== b) {
            if (a === THREE.RGB_S3TC_DXT1_Format) return b.COMPRESSED_RGB_S3TC_DXT1_EXT;
            if (a === THREE.RGBA_S3TC_DXT1_Format) return b.COMPRESSED_RGBA_S3TC_DXT1_EXT;
            if (a === THREE.RGBA_S3TC_DXT3_Format) return b.COMPRESSED_RGBA_S3TC_DXT3_EXT;
            if (a === THREE.RGBA_S3TC_DXT5_Format) return b.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        }
        if (b = sb.get("WEBGL_compressed_texture_pvrtc"), null !== b) {
            if (a === THREE.RGB_PVRTC_4BPPV1_Format) return b.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
            if (a === THREE.RGB_PVRTC_2BPPV1_Format) return b.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
            if (a === THREE.RGBA_PVRTC_4BPPV1_Format) return b.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
            if (a === THREE.RGBA_PVRTC_2BPPV1_Format) return b.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
        }
        if (b = sb.get("EXT_blend_minmax"), null !== b) {
            if (a === THREE.MinEquation) return b.MIN_EXT;
            if (a === THREE.MaxEquation) return b.MAX_EXT;
        }
        return 0;
    }
    console.log("THREE.WebGLRenderer", THREE.REVISION), a = a || {};
    var C = void 0 !== a.canvas ? a.canvas : document.createElement("canvas"), D = void 0 !== a.context ? a.context : null, E = 1, F = void 0 !== a.precision ? a.precision : "highp", G = void 0 !== a.alpha ? a.alpha : !1, H = void 0 !== a.depth ? a.depth : !0, I = void 0 !== a.stencil ? a.stencil : !0, J = void 0 !== a.antialias ? a.antialias : !1, K = void 0 !== a.premultipliedAlpha ? a.premultipliedAlpha : !0, L = void 0 !== a.preserveDrawingBuffer ? a.preserveDrawingBuffer : !1, M = void 0 !== a.logarithmicDepthBuffer ? a.logarithmicDepthBuffer : !1, N = new THREE.Color(0), O = 0, P = [], Q = {}, R = [], S = [], T = [], U = [], V = [];
    this.domElement = C, this.context = null, this.sortObjects = this.autoClearStencil = this.autoClearDepth = this.autoClearColor = this.autoClear = !0, 
    this.gammaFactor = 2, this.shadowMapEnabled = this.gammaOutput = this.gammaInput = !1, 
    this.shadowMapType = THREE.PCFShadowMap, this.shadowMapCullFace = THREE.CullFaceFront, 
    this.shadowMapCascade = this.shadowMapDebug = !1, this.maxMorphTargets = 8, this.maxMorphNormals = 4, 
    this.autoScaleCubemaps = !0, this.info = {
        memory: {
            programs: 0,
            geometries: 0,
            textures: 0
        },
        render: {
            calls: 0,
            vertices: 0,
            faces: 0,
            points: 0
        }
    };
    var W, X = this, Y = [], Z = null, $ = null, _ = -1, ab = "", bb = null, cb = 0, db = 0, eb = 0, fb = C.width, gb = C.height, hb = 0, ib = 0, jb = new THREE.Frustum(), kb = new THREE.Matrix4(), lb = new THREE.Vector3(), mb = new THREE.Vector3(), nb = !0, ob = {
        ambient: [ 0, 0, 0 ],
        directional: {
            length: 0,
            colors: [],
            positions: []
        },
        point: {
            length: 0,
            colors: [],
            positions: [],
            distances: [],
            decays: []
        },
        spot: {
            length: 0,
            colors: [],
            positions: [],
            distances: [],
            directions: [],
            anglesCos: [],
            exponents: [],
            decays: []
        },
        hemi: {
            length: 0,
            skyColors: [],
            groundColors: [],
            positions: []
        }
    };
    try {
        var pb = {
            alpha: G,
            depth: H,
            stencil: I,
            antialias: J,
            premultipliedAlpha: K,
            preserveDrawingBuffer: L
        };
        if (W = D || C.getContext("webgl", pb) || C.getContext("experimental-webgl", pb), 
        null === W) {
            if (null !== C.getContext("webgl")) throw "Error creating WebGL context with your selected attributes.";
            throw "Error creating WebGL context.";
        }
        C.addEventListener("webglcontextlost", function(a) {
            a.preventDefault(), vb(), ub(), Q = {};
        }, !1);
    } catch (qb) {
        THREE.error("THREE.WebGLRenderer: " + qb);
    }
    var rb = new THREE.WebGLState(W, B);
    void 0 === W.getShaderPrecisionFormat && (W.getShaderPrecisionFormat = function() {
        return {
            rangeMin: 1,
            rangeMax: 1,
            precision: 1
        };
    });
    var sb = new THREE.WebGLExtensions(W);
    sb.get("OES_texture_float"), sb.get("OES_texture_float_linear"), sb.get("OES_texture_half_float"), 
    sb.get("OES_texture_half_float_linear"), sb.get("OES_standard_derivatives"), M && sb.get("EXT_frag_depth");
    var tb = function(a, b, c, d) {
        !0 === K && (a *= d, b *= d, c *= d), W.clearColor(a, b, c, d);
    }, ub = function() {
        W.clearColor(0, 0, 0, 1), W.clearDepth(1), W.clearStencil(0), W.enable(W.DEPTH_TEST), 
        W.depthFunc(W.LEQUAL), W.frontFace(W.CCW), W.cullFace(W.BACK), W.enable(W.CULL_FACE), 
        W.enable(W.BLEND), W.blendEquation(W.FUNC_ADD), W.blendFunc(W.SRC_ALPHA, W.ONE_MINUS_SRC_ALPHA), 
        W.viewport(db, eb, fb, gb), tb(N.r, N.g, N.b, O);
    }, vb = function() {
        bb = Z = null, ab = "", _ = -1, nb = !0, rb.reset();
    };
    ub(), this.context = W, this.state = rb;
    var wb = W.getParameter(W.MAX_TEXTURE_IMAGE_UNITS), xb = W.getParameter(W.MAX_VERTEX_TEXTURE_IMAGE_UNITS), yb = W.getParameter(W.MAX_TEXTURE_SIZE), zb = W.getParameter(W.MAX_CUBE_MAP_TEXTURE_SIZE), Ab = xb > 0, Bb = Ab && sb.get("OES_texture_float"), Cb = W.getShaderPrecisionFormat(W.VERTEX_SHADER, W.HIGH_FLOAT), Db = W.getShaderPrecisionFormat(W.VERTEX_SHADER, W.MEDIUM_FLOAT), Eb = W.getShaderPrecisionFormat(W.FRAGMENT_SHADER, W.HIGH_FLOAT), Fb = W.getShaderPrecisionFormat(W.FRAGMENT_SHADER, W.MEDIUM_FLOAT), Gb = function() {
        var a;
        return function() {
            if (void 0 !== a) return a;
            if (a = [], sb.get("WEBGL_compressed_texture_pvrtc") || sb.get("WEBGL_compressed_texture_s3tc")) for (var b = W.getParameter(W.COMPRESSED_TEXTURE_FORMATS), c = 0; c < b.length; c++) a.push(b[c]);
            return a;
        };
    }(), Hb = 0 < Cb.precision && 0 < Eb.precision, Ib = 0 < Db.precision && 0 < Fb.precision;
    "highp" !== F || Hb || (Ib ? (F = "mediump", THREE.warn("THREE.WebGLRenderer: highp not supported, using mediump.")) : (F = "lowp", 
    THREE.warn("THREE.WebGLRenderer: highp and mediump not supported, using lowp."))), 
    "mediump" !== F || Ib || (F = "lowp", THREE.warn("THREE.WebGLRenderer: mediump not supported, using lowp."));
    var Jb = new THREE.ShadowMapPlugin(this, P, Q, R), Kb = new THREE.SpritePlugin(this, U), Lb = new THREE.LensFlarePlugin(this, V);
    this.getContext = function() {
        return W;
    }, this.forceContextLoss = function() {
        sb.get("WEBGL_lose_context").loseContext();
    }, this.supportsVertexTextures = function() {
        return Ab;
    }, this.supportsFloatTextures = function() {
        return sb.get("OES_texture_float");
    }, this.supportsHalfFloatTextures = function() {
        return sb.get("OES_texture_half_float");
    }, this.supportsStandardDerivatives = function() {
        return sb.get("OES_standard_derivatives");
    }, this.supportsCompressedTextureS3TC = function() {
        return sb.get("WEBGL_compressed_texture_s3tc");
    }, this.supportsCompressedTexturePVRTC = function() {
        return sb.get("WEBGL_compressed_texture_pvrtc");
    }, this.supportsBlendMinMax = function() {
        return sb.get("EXT_blend_minmax");
    }, this.getMaxAnisotropy = function() {
        var a;
        return function() {
            if (void 0 !== a) return a;
            var b = sb.get("EXT_texture_filter_anisotropic");
            return a = null !== b ? W.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;
        };
    }(), this.getPrecision = function() {
        return F;
    }, this.getPixelRatio = function() {
        return E;
    }, this.setPixelRatio = function(a) {
        E = a;
    }, this.setSize = function(a, b, c) {
        C.width = a * E, C.height = b * E, !1 !== c && (C.style.width = a + "px", C.style.height = b + "px"), 
        this.setViewport(0, 0, a, b);
    }, this.setViewport = function(a, b, c, d) {
        db = a * E, eb = b * E, fb = c * E, gb = d * E, W.viewport(db, eb, fb, gb);
    }, this.setScissor = function(a, b, c, d) {
        W.scissor(a * E, b * E, c * E, d * E);
    }, this.enableScissorTest = function(a) {
        a ? W.enable(W.SCISSOR_TEST) : W.disable(W.SCISSOR_TEST);
    }, this.getClearColor = function() {
        return N;
    }, this.setClearColor = function(a, b) {
        N.set(a), O = void 0 !== b ? b : 1, tb(N.r, N.g, N.b, O);
    }, this.getClearAlpha = function() {
        return O;
    }, this.setClearAlpha = function(a) {
        O = a, tb(N.r, N.g, N.b, O);
    }, this.clear = function(a, b, c) {
        var d = 0;
        (void 0 === a || a) && (d |= W.COLOR_BUFFER_BIT), (void 0 === b || b) && (d |= W.DEPTH_BUFFER_BIT), 
        (void 0 === c || c) && (d |= W.STENCIL_BUFFER_BIT), W.clear(d);
    }, this.clearColor = function() {
        W.clear(W.COLOR_BUFFER_BIT);
    }, this.clearDepth = function() {
        W.clear(W.DEPTH_BUFFER_BIT);
    }, this.clearStencil = function() {
        W.clear(W.STENCIL_BUFFER_BIT);
    }, this.clearTarget = function(a, b, c, d) {
        this.setRenderTarget(a), this.clear(b, c, d);
    }, this.resetGLState = vb;
    var Mb = function(a) {
        a.target.traverse(function(a) {
            if (a.removeEventListener("remove", Mb), a instanceof THREE.Mesh || a instanceof THREE.PointCloud || a instanceof THREE.Line) delete Q[a.id]; else if (a instanceof THREE.ImmediateRenderObject || a.immediateRenderCallback) for (var b = R, c = b.length - 1; c >= 0; c--) b[c].object === a && b.splice(c, 1);
            delete a.__webglInit, delete a._modelViewMatrix, delete a._normalMatrix, delete a.__webglActive;
        });
    }, Nb = function(a) {
        if (a = a.target, a.removeEventListener("dispose", Nb), delete a.__webglInit, a instanceof THREE.BufferGeometry) {
            for (var b in a.attributes) {
                var c = a.attributes[b];
                void 0 !== c.buffer && (W.deleteBuffer(c.buffer), delete c.buffer);
            }
            X.info.memory.geometries--;
        } else if (b = Tb[a.id], void 0 !== b) {
            for (var c = 0, d = b.length; d > c; c++) {
                var e = b[c];
                if (void 0 !== e.numMorphTargets) {
                    for (var f = 0, g = e.numMorphTargets; g > f; f++) W.deleteBuffer(e.__webglMorphTargetsBuffers[f]);
                    delete e.__webglMorphTargetsBuffers;
                }
                if (void 0 !== e.numMorphNormals) {
                    for (f = 0, g = e.numMorphNormals; g > f; f++) W.deleteBuffer(e.__webglMorphNormalsBuffers[f]);
                    delete e.__webglMorphNormalsBuffers;
                }
                Rb(e);
            }
            delete Tb[a.id];
        } else Rb(a);
        ab = "";
    }, Ob = function(a) {
        a = a.target, a.removeEventListener("dispose", Ob), a.image && a.image.__webglTextureCube ? (W.deleteTexture(a.image.__webglTextureCube), 
        delete a.image.__webglTextureCube) : void 0 !== a.__webglInit && (W.deleteTexture(a.__webglTexture), 
        delete a.__webglTexture, delete a.__webglInit), X.info.memory.textures--;
    }, Pb = function(a) {
        if (a = a.target, a.removeEventListener("dispose", Pb), a && void 0 !== a.__webglTexture) {
            if (W.deleteTexture(a.__webglTexture), delete a.__webglTexture, a instanceof THREE.WebGLRenderTargetCube) for (var b = 0; 6 > b; b++) W.deleteFramebuffer(a.__webglFramebuffer[b]), 
            W.deleteRenderbuffer(a.__webglRenderbuffer[b]); else W.deleteFramebuffer(a.__webglFramebuffer), 
            W.deleteRenderbuffer(a.__webglRenderbuffer);
            delete a.__webglFramebuffer, delete a.__webglRenderbuffer;
        }
        X.info.memory.textures--;
    }, Qb = function(a) {
        a = a.target, a.removeEventListener("dispose", Qb), Sb(a);
    }, Rb = function(a) {
        for (var b = "__webglVertexBuffer __webglNormalBuffer __webglTangentBuffer __webglColorBuffer __webglUVBuffer __webglUV2Buffer __webglSkinIndicesBuffer __webglSkinWeightsBuffer __webglFaceBuffer __webglLineBuffer __webglLineDistanceBuffer".split(" "), c = 0, d = b.length; d > c; c++) {
            var e = b[c];
            void 0 !== a[e] && (W.deleteBuffer(a[e]), delete a[e]);
        }
        if (void 0 !== a.__webglCustomAttributesList) {
            for (e in a.__webglCustomAttributesList) W.deleteBuffer(a.__webglCustomAttributesList[e].buffer);
            delete a.__webglCustomAttributesList;
        }
        X.info.memory.geometries--;
    }, Sb = function(a) {
        var b = a.program.program;
        if (void 0 !== b) {
            a.program = void 0;
            var c, d, e = !1;
            for (a = 0, c = Y.length; c > a; a++) if (d = Y[a], d.program === b) {
                d.usedTimes--, 0 === d.usedTimes && (e = !0);
                break;
            }
            if (!0 === e) {
                for (e = [], a = 0, c = Y.length; c > a; a++) d = Y[a], d.program !== b && e.push(d);
                Y = e, W.deleteProgram(b), X.info.memory.programs--;
            }
        }
    };
    this.renderBufferImmediate = function(a, b, c) {
        if (rb.initAttributes(), a.hasPositions && !a.__webglVertexBuffer && (a.__webglVertexBuffer = W.createBuffer()), 
        a.hasNormals && !a.__webglNormalBuffer && (a.__webglNormalBuffer = W.createBuffer()), 
        a.hasUvs && !a.__webglUvBuffer && (a.__webglUvBuffer = W.createBuffer()), a.hasColors && !a.__webglColorBuffer && (a.__webglColorBuffer = W.createBuffer()), 
        a.hasPositions && (W.bindBuffer(W.ARRAY_BUFFER, a.__webglVertexBuffer), W.bufferData(W.ARRAY_BUFFER, a.positionArray, W.DYNAMIC_DRAW), 
        rb.enableAttribute(b.attributes.position), W.vertexAttribPointer(b.attributes.position, 3, W.FLOAT, !1, 0, 0)), 
        a.hasNormals) {
            if (W.bindBuffer(W.ARRAY_BUFFER, a.__webglNormalBuffer), !1 == c instanceof THREE.MeshPhongMaterial && c.shading === THREE.FlatShading) {
                var d, e, f, g, h, i, j, k, l, m, n, o = 3 * a.count;
                for (n = 0; o > n; n += 9) m = a.normalArray, d = m[n], e = m[n + 1], f = m[n + 2], 
                g = m[n + 3], i = m[n + 4], k = m[n + 5], h = m[n + 6], j = m[n + 7], l = m[n + 8], 
                d = (d + g + h) / 3, e = (e + i + j) / 3, f = (f + k + l) / 3, m[n] = d, m[n + 1] = e, 
                m[n + 2] = f, m[n + 3] = d, m[n + 4] = e, m[n + 5] = f, m[n + 6] = d, m[n + 7] = e, 
                m[n + 8] = f;
            }
            W.bufferData(W.ARRAY_BUFFER, a.normalArray, W.DYNAMIC_DRAW), rb.enableAttribute(b.attributes.normal), 
            W.vertexAttribPointer(b.attributes.normal, 3, W.FLOAT, !1, 0, 0);
        }
        a.hasUvs && c.map && (W.bindBuffer(W.ARRAY_BUFFER, a.__webglUvBuffer), W.bufferData(W.ARRAY_BUFFER, a.uvArray, W.DYNAMIC_DRAW), 
        rb.enableAttribute(b.attributes.uv), W.vertexAttribPointer(b.attributes.uv, 2, W.FLOAT, !1, 0, 0)), 
        a.hasColors && c.vertexColors !== THREE.NoColors && (W.bindBuffer(W.ARRAY_BUFFER, a.__webglColorBuffer), 
        W.bufferData(W.ARRAY_BUFFER, a.colorArray, W.DYNAMIC_DRAW), rb.enableAttribute(b.attributes.color), 
        W.vertexAttribPointer(b.attributes.color, 3, W.FLOAT, !1, 0, 0)), rb.disableUnusedAttributes(), 
        W.drawArrays(W.TRIANGLES, 0, a.count), a.count = 0;
    }, this.renderBufferDirect = function(a, b, c, e, f, g) {
        if (!1 !== e.visible) if (n(g), a = r(a, b, c, e, g), b = !1, c = "direct_" + f.id + "_" + a.id + "_" + (e.wireframe ? 1 : 0), 
        c !== ab && (ab = c, b = !0), b && rb.initAttributes(), g instanceof THREE.Mesh) {
            g = !0 === e.wireframe ? W.LINES : W.TRIANGLES;
            var h = f.attributes.index;
            if (h) {
                var i, j;
                if (h.array instanceof Uint32Array && sb.get("OES_element_index_uint") ? (i = W.UNSIGNED_INT, 
                j = 4) : (i = W.UNSIGNED_SHORT, j = 2), c = f.offsets, 0 === c.length) b && (d(e, a, f, 0), 
                W.bindBuffer(W.ELEMENT_ARRAY_BUFFER, h.buffer)), W.drawElements(g, h.array.length, i, 0), 
                X.info.render.calls++, X.info.render.vertices += h.array.length, X.info.render.faces += h.array.length / 3; else {
                    b = !0;
                    for (var k = 0, l = c.length; l > k; k++) {
                        var m = c[k].index;
                        b && (d(e, a, f, m), W.bindBuffer(W.ELEMENT_ARRAY_BUFFER, h.buffer)), W.drawElements(g, c[k].count, i, c[k].start * j), 
                        X.info.render.calls++, X.info.render.vertices += c[k].count, X.info.render.faces += c[k].count / 3;
                    }
                }
            } else b && d(e, a, f, 0), e = f.attributes.position, W.drawArrays(g, 0, e.array.length / e.itemSize), 
            X.info.render.calls++, X.info.render.vertices += e.array.length / e.itemSize, X.info.render.faces += e.array.length / (3 * e.itemSize);
        } else if (g instanceof THREE.PointCloud) if (g = W.POINTS, h = f.attributes.index) if (h.array instanceof Uint32Array && sb.get("OES_element_index_uint") ? (i = W.UNSIGNED_INT, 
        j = 4) : (i = W.UNSIGNED_SHORT, j = 2), c = f.offsets, 0 === c.length) b && (d(e, a, f, 0), 
        W.bindBuffer(W.ELEMENT_ARRAY_BUFFER, h.buffer)), W.drawElements(g, h.array.length, i, 0), 
        X.info.render.calls++, X.info.render.points += h.array.length; else for (1 < c.length && (b = !0), 
        k = 0, l = c.length; l > k; k++) m = c[k].index, b && (d(e, a, f, m), W.bindBuffer(W.ELEMENT_ARRAY_BUFFER, h.buffer)), 
        W.drawElements(g, c[k].count, i, c[k].start * j), X.info.render.calls++, X.info.render.points += c[k].count; else if (b && d(e, a, f, 0), 
        e = f.attributes.position, c = f.offsets, 0 === c.length) W.drawArrays(g, 0, e.array.length / 3), 
        X.info.render.calls++, X.info.render.points += e.array.length / 3; else for (k = 0, 
        l = c.length; l > k; k++) W.drawArrays(g, c[k].index, c[k].count), X.info.render.calls++, 
        X.info.render.points += c[k].count; else if (g instanceof THREE.Line) if (g = g.mode === THREE.LineStrip ? W.LINE_STRIP : W.LINES, 
        rb.setLineWidth(e.linewidth * E), h = f.attributes.index) if (h.array instanceof Uint32Array ? (i = W.UNSIGNED_INT, 
        j = 4) : (i = W.UNSIGNED_SHORT, j = 2), c = f.offsets, 0 === c.length) b && (d(e, a, f, 0), 
        W.bindBuffer(W.ELEMENT_ARRAY_BUFFER, h.buffer)), W.drawElements(g, h.array.length, i, 0), 
        X.info.render.calls++, X.info.render.vertices += h.array.length; else for (1 < c.length && (b = !0), 
        k = 0, l = c.length; l > k; k++) m = c[k].index, b && (d(e, a, f, m), W.bindBuffer(W.ELEMENT_ARRAY_BUFFER, h.buffer)), 
        W.drawElements(g, c[k].count, i, c[k].start * j), X.info.render.calls++, X.info.render.vertices += c[k].count; else if (b && d(e, a, f, 0), 
        e = f.attributes.position, c = f.offsets, 0 === c.length) W.drawArrays(g, 0, e.array.length / 3), 
        X.info.render.calls++, X.info.render.vertices += e.array.length / 3; else for (k = 0, 
        l = c.length; l > k; k++) W.drawArrays(g, c[k].index, c[k].count), X.info.render.calls++, 
        X.info.render.vertices += c[k].count;
    }, this.renderBuffer = function(a, b, c, d, e, f) {
        if (!1 !== d.visible) {
            if (n(f), c = r(a, b, c, d, f), b = c.attributes, a = !1, c = e.id + "_" + c.id + "_" + (d.wireframe ? 1 : 0), 
            c !== ab && (ab = c, a = !0), a && rb.initAttributes(), !d.morphTargets && 0 <= b.position) a && (W.bindBuffer(W.ARRAY_BUFFER, e.__webglVertexBuffer), 
            rb.enableAttribute(b.position), W.vertexAttribPointer(b.position, 3, W.FLOAT, !1, 0, 0)); else if (f.morphTargetBase) {
                if (c = d.program.attributes, -1 !== f.morphTargetBase && 0 <= c.position ? (W.bindBuffer(W.ARRAY_BUFFER, e.__webglMorphTargetsBuffers[f.morphTargetBase]), 
                rb.enableAttribute(c.position), W.vertexAttribPointer(c.position, 3, W.FLOAT, !1, 0, 0)) : 0 <= c.position && (W.bindBuffer(W.ARRAY_BUFFER, e.__webglVertexBuffer), 
                rb.enableAttribute(c.position), W.vertexAttribPointer(c.position, 3, W.FLOAT, !1, 0, 0)), 
                f.morphTargetForcedOrder.length) for (var h, i = 0, j = f.morphTargetForcedOrder, k = f.morphTargetInfluences; i < d.numSupportedMorphTargets && i < j.length; ) h = c["morphTarget" + i], 
                h >= 0 && (W.bindBuffer(W.ARRAY_BUFFER, e.__webglMorphTargetsBuffers[j[i]]), rb.enableAttribute(h), 
                W.vertexAttribPointer(h, 3, W.FLOAT, !1, 0, 0)), h = c["morphNormal" + i], h >= 0 && d.morphNormals && (W.bindBuffer(W.ARRAY_BUFFER, e.__webglMorphNormalsBuffers[j[i]]), 
                rb.enableAttribute(h), W.vertexAttribPointer(h, 3, W.FLOAT, !1, 0, 0)), f.__webglMorphTargetInfluences[i] = k[j[i]], 
                i++; else {
                    for (j = [], k = f.morphTargetInfluences, i = f.geometry.morphTargets, k.length > i.length && (console.warn("THREE.WebGLRenderer: Influences array is bigger than morphTargets array."), 
                    k.length = i.length), i = 0, h = k.length; h > i; i++) j.push([ k[i], i ]);
                    j.length > d.numSupportedMorphTargets ? (j.sort(g), j.length = d.numSupportedMorphTargets) : j.length > d.numSupportedMorphNormals ? j.sort(g) : 0 === j.length && j.push([ 0, 0 ]);
                    for (var i = 0, l = d.numSupportedMorphTargets; l > i; i++) if (j[i]) {
                        var m = j[i][1];
                        h = c["morphTarget" + i], h >= 0 && (W.bindBuffer(W.ARRAY_BUFFER, e.__webglMorphTargetsBuffers[m]), 
                        rb.enableAttribute(h), W.vertexAttribPointer(h, 3, W.FLOAT, !1, 0, 0)), h = c["morphNormal" + i], 
                        h >= 0 && d.morphNormals && (W.bindBuffer(W.ARRAY_BUFFER, e.__webglMorphNormalsBuffers[m]), 
                        rb.enableAttribute(h), W.vertexAttribPointer(h, 3, W.FLOAT, !1, 0, 0)), f.__webglMorphTargetInfluences[i] = k[m];
                    } else f.__webglMorphTargetInfluences[i] = 0;
                }
                null !== d.program.uniforms.morphTargetInfluences && W.uniform1fv(d.program.uniforms.morphTargetInfluences, f.__webglMorphTargetInfluences);
            }
            if (a) {
                if (e.__webglCustomAttributesList) for (c = 0, k = e.__webglCustomAttributesList.length; k > c; c++) j = e.__webglCustomAttributesList[c], 
                0 <= b[j.buffer.belongsToAttribute] && (W.bindBuffer(W.ARRAY_BUFFER, j.buffer), 
                rb.enableAttribute(b[j.buffer.belongsToAttribute]), W.vertexAttribPointer(b[j.buffer.belongsToAttribute], j.size, W.FLOAT, !1, 0, 0));
                0 <= b.color && (0 < f.geometry.colors.length || 0 < f.geometry.faces.length ? (W.bindBuffer(W.ARRAY_BUFFER, e.__webglColorBuffer), 
                rb.enableAttribute(b.color), W.vertexAttribPointer(b.color, 3, W.FLOAT, !1, 0, 0)) : void 0 !== d.defaultAttributeValues && W.vertexAttrib3fv(b.color, d.defaultAttributeValues.color)), 
                0 <= b.normal && (W.bindBuffer(W.ARRAY_BUFFER, e.__webglNormalBuffer), rb.enableAttribute(b.normal), 
                W.vertexAttribPointer(b.normal, 3, W.FLOAT, !1, 0, 0)), 0 <= b.tangent && (W.bindBuffer(W.ARRAY_BUFFER, e.__webglTangentBuffer), 
                rb.enableAttribute(b.tangent), W.vertexAttribPointer(b.tangent, 4, W.FLOAT, !1, 0, 0)), 
                0 <= b.uv && (f.geometry.faceVertexUvs[0] ? (W.bindBuffer(W.ARRAY_BUFFER, e.__webglUVBuffer), 
                rb.enableAttribute(b.uv), W.vertexAttribPointer(b.uv, 2, W.FLOAT, !1, 0, 0)) : void 0 !== d.defaultAttributeValues && W.vertexAttrib2fv(b.uv, d.defaultAttributeValues.uv)), 
                0 <= b.uv2 && (f.geometry.faceVertexUvs[1] ? (W.bindBuffer(W.ARRAY_BUFFER, e.__webglUV2Buffer), 
                rb.enableAttribute(b.uv2), W.vertexAttribPointer(b.uv2, 2, W.FLOAT, !1, 0, 0)) : void 0 !== d.defaultAttributeValues && W.vertexAttrib2fv(b.uv2, d.defaultAttributeValues.uv2)), 
                d.skinning && 0 <= b.skinIndex && 0 <= b.skinWeight && (W.bindBuffer(W.ARRAY_BUFFER, e.__webglSkinIndicesBuffer), 
                rb.enableAttribute(b.skinIndex), W.vertexAttribPointer(b.skinIndex, 4, W.FLOAT, !1, 0, 0), 
                W.bindBuffer(W.ARRAY_BUFFER, e.__webglSkinWeightsBuffer), rb.enableAttribute(b.skinWeight), 
                W.vertexAttribPointer(b.skinWeight, 4, W.FLOAT, !1, 0, 0)), 0 <= b.lineDistance && (W.bindBuffer(W.ARRAY_BUFFER, e.__webglLineDistanceBuffer), 
                rb.enableAttribute(b.lineDistance), W.vertexAttribPointer(b.lineDistance, 1, W.FLOAT, !1, 0, 0));
            }
            rb.disableUnusedAttributes(), f instanceof THREE.Mesh ? (f = e.__typeArray === Uint32Array ? W.UNSIGNED_INT : W.UNSIGNED_SHORT, 
            d.wireframe ? (rb.setLineWidth(d.wireframeLinewidth * E), a && W.bindBuffer(W.ELEMENT_ARRAY_BUFFER, e.__webglLineBuffer), 
            W.drawElements(W.LINES, e.__webglLineCount, f, 0)) : (a && W.bindBuffer(W.ELEMENT_ARRAY_BUFFER, e.__webglFaceBuffer), 
            W.drawElements(W.TRIANGLES, e.__webglFaceCount, f, 0)), X.info.render.calls++, X.info.render.vertices += e.__webglFaceCount, 
            X.info.render.faces += e.__webglFaceCount / 3) : f instanceof THREE.Line ? (f = f.mode === THREE.LineStrip ? W.LINE_STRIP : W.LINES, 
            rb.setLineWidth(d.linewidth * E), W.drawArrays(f, 0, e.__webglLineCount), X.info.render.calls++) : f instanceof THREE.PointCloud && (W.drawArrays(W.POINTS, 0, e.__webglParticleCount), 
            X.info.render.calls++, X.info.render.points += e.__webglParticleCount);
        }
    }, this.render = function(a, b, c, d) {
        if (!1 == b instanceof THREE.Camera) THREE.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera."); else {
            var g = a.fog;
            ab = "", _ = -1, bb = null, nb = !0, !0 === a.autoUpdate && a.updateMatrixWorld(), 
            void 0 === b.parent && b.updateMatrixWorld(), a.traverse(function(a) {
                a instanceof THREE.SkinnedMesh && a.skeleton.update();
            }), b.matrixWorldInverse.getInverse(b.matrixWorld), kb.multiplyMatrices(b.projectionMatrix, b.matrixWorldInverse), 
            jb.setFromMatrix(kb), P.length = 0, S.length = 0, T.length = 0, U.length = 0, V.length = 0, 
            h(a), !0 === X.sortObjects && (S.sort(e), T.sort(f)), Jb.render(a, b), X.info.render.calls = 0, 
            X.info.render.vertices = 0, X.info.render.faces = 0, X.info.render.points = 0, this.setRenderTarget(c), 
            (this.autoClear || d) && this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil), 
            d = 0;
            for (var l = R.length; l > d; d++) {
                var m = R[d], n = m.object;
                n.visible && (u(n, b), k(m));
            }
            a.overrideMaterial ? (d = a.overrideMaterial, q(d), i(S, b, P, g, d), i(T, b, P, g, d), 
            j(R, "", b, P, g, d)) : (rb.setBlending(THREE.NoBlending), i(S, b, P, g, null), 
            j(R, "opaque", b, P, g, null), i(T, b, P, g, null), j(R, "transparent", b, P, g, null)), 
            Kb.render(a, b), Lb.render(a, b, hb, ib), c && c.generateMipmaps && c.minFilter !== THREE.NearestFilter && c.minFilter !== THREE.LinearFilter && z(c), 
            rb.setDepthTest(!0), rb.setDepthWrite(!0), rb.setColorWrite(!0);
        }
    }, this.renderImmediateObject = function(a, b, c, d, e) {
        var f = r(a, b, c, d, e);
        ab = "", X.setMaterialFaces(d), e.immediateRenderCallback ? e.immediateRenderCallback(f, W, jb) : e.render(function(a) {
            X.renderBufferImmediate(a, f, d);
        });
    };
    var Tb = {}, Ub = 0, Vb = {
        MeshDepthMaterial: "depth",
        MeshNormalMaterial: "normal",
        MeshBasicMaterial: "basic",
        MeshLambertMaterial: "lambert",
        MeshPhongMaterial: "phong",
        LineBasicMaterial: "basic",
        LineDashedMaterial: "dashed",
        PointCloudMaterial: "particle_basic"
    };
    this.setFaceCulling = function(a, b) {
        a === THREE.CullFaceNone ? W.disable(W.CULL_FACE) : (W.frontFace(b === THREE.FrontFaceDirectionCW ? W.CW : W.CCW), 
        W.cullFace(a === THREE.CullFaceBack ? W.BACK : a === THREE.CullFaceFront ? W.FRONT : W.FRONT_AND_BACK), 
        W.enable(W.CULL_FACE));
    }, this.setMaterialFaces = function(a) {
        rb.setDoubleSided(a.side === THREE.DoubleSide), rb.setFlipSided(a.side === THREE.BackSide);
    }, this.uploadTexture = function(a) {
        void 0 === a.__webglInit && (a.__webglInit = !0, a.addEventListener("dispose", Ob), 
        a.__webglTexture = W.createTexture(), X.info.memory.textures++), W.bindTexture(W.TEXTURE_2D, a.__webglTexture), 
        W.pixelStorei(W.UNPACK_FLIP_Y_WEBGL, a.flipY), W.pixelStorei(W.UNPACK_PREMULTIPLY_ALPHA_WEBGL, a.premultiplyAlpha), 
        W.pixelStorei(W.UNPACK_ALIGNMENT, a.unpackAlignment), a.image = x(a.image, yb);
        var b = a.image, c = THREE.Math.isPowerOfTwo(b.width) && THREE.Math.isPowerOfTwo(b.height), d = B(a.format), e = B(a.type);
        w(W.TEXTURE_2D, a, c);
        var f = a.mipmaps;
        if (a instanceof THREE.DataTexture) if (0 < f.length && c) {
            for (var g = 0, h = f.length; h > g; g++) b = f[g], W.texImage2D(W.TEXTURE_2D, g, d, b.width, b.height, 0, d, e, b.data);
            a.generateMipmaps = !1;
        } else W.texImage2D(W.TEXTURE_2D, 0, d, b.width, b.height, 0, d, e, b.data); else if (a instanceof THREE.CompressedTexture) for (g = 0, 
        h = f.length; h > g; g++) b = f[g], a.format !== THREE.RGBAFormat && a.format !== THREE.RGBFormat ? -1 < Gb().indexOf(d) ? W.compressedTexImage2D(W.TEXTURE_2D, g, d, b.width, b.height, 0, b.data) : THREE.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : W.texImage2D(W.TEXTURE_2D, g, d, b.width, b.height, 0, d, e, b.data); else if (0 < f.length && c) {
            for (g = 0, h = f.length; h > g; g++) b = f[g], W.texImage2D(W.TEXTURE_2D, g, d, d, e, b);
            a.generateMipmaps = !1;
        } else W.texImage2D(W.TEXTURE_2D, 0, d, d, e, a.image);
        a.generateMipmaps && c && W.generateMipmap(W.TEXTURE_2D), a.needsUpdate = !1, a.onUpdate && a.onUpdate();
    }, this.setTexture = function(a, b) {
        W.activeTexture(W.TEXTURE0 + b), a.needsUpdate ? X.uploadTexture(a) : W.bindTexture(W.TEXTURE_2D, a.__webglTexture);
    }, this.setRenderTarget = function(a) {
        var b = a instanceof THREE.WebGLRenderTargetCube;
        if (a && void 0 === a.__webglFramebuffer) {
            void 0 === a.depthBuffer && (a.depthBuffer = !0), void 0 === a.stencilBuffer && (a.stencilBuffer = !0), 
            a.addEventListener("dispose", Pb), a.__webglTexture = W.createTexture(), X.info.memory.textures++;
            var c = THREE.Math.isPowerOfTwo(a.width) && THREE.Math.isPowerOfTwo(a.height), d = B(a.format), e = B(a.type);
            if (b) {
                a.__webglFramebuffer = [], a.__webglRenderbuffer = [], W.bindTexture(W.TEXTURE_CUBE_MAP, a.__webglTexture), 
                w(W.TEXTURE_CUBE_MAP, a, c);
                for (var f = 0; 6 > f; f++) {
                    a.__webglFramebuffer[f] = W.createFramebuffer(), a.__webglRenderbuffer[f] = W.createRenderbuffer(), 
                    W.texImage2D(W.TEXTURE_CUBE_MAP_POSITIVE_X + f, 0, d, a.width, a.height, 0, d, e, null);
                    var g = a, h = W.TEXTURE_CUBE_MAP_POSITIVE_X + f;
                    W.bindFramebuffer(W.FRAMEBUFFER, a.__webglFramebuffer[f]), W.framebufferTexture2D(W.FRAMEBUFFER, W.COLOR_ATTACHMENT0, h, g.__webglTexture, 0), 
                    y(a.__webglRenderbuffer[f], a);
                }
                c && W.generateMipmap(W.TEXTURE_CUBE_MAP);
            } else a.__webglFramebuffer = W.createFramebuffer(), a.__webglRenderbuffer = a.shareDepthFrom ? a.shareDepthFrom.__webglRenderbuffer : W.createRenderbuffer(), 
            W.bindTexture(W.TEXTURE_2D, a.__webglTexture), w(W.TEXTURE_2D, a, c), W.texImage2D(W.TEXTURE_2D, 0, d, a.width, a.height, 0, d, e, null), 
            d = W.TEXTURE_2D, W.bindFramebuffer(W.FRAMEBUFFER, a.__webglFramebuffer), W.framebufferTexture2D(W.FRAMEBUFFER, W.COLOR_ATTACHMENT0, d, a.__webglTexture, 0), 
            a.shareDepthFrom ? a.depthBuffer && !a.stencilBuffer ? W.framebufferRenderbuffer(W.FRAMEBUFFER, W.DEPTH_ATTACHMENT, W.RENDERBUFFER, a.__webglRenderbuffer) : a.depthBuffer && a.stencilBuffer && W.framebufferRenderbuffer(W.FRAMEBUFFER, W.DEPTH_STENCIL_ATTACHMENT, W.RENDERBUFFER, a.__webglRenderbuffer) : y(a.__webglRenderbuffer, a), 
            c && W.generateMipmap(W.TEXTURE_2D);
            b ? W.bindTexture(W.TEXTURE_CUBE_MAP, null) : W.bindTexture(W.TEXTURE_2D, null), 
            W.bindRenderbuffer(W.RENDERBUFFER, null), W.bindFramebuffer(W.FRAMEBUFFER, null);
        }
        a ? (b = b ? a.__webglFramebuffer[a.activeCubeFace] : a.__webglFramebuffer, c = a.width, 
        a = a.height, e = d = 0) : (b = null, c = fb, a = gb, d = db, e = eb), b !== $ && (W.bindFramebuffer(W.FRAMEBUFFER, b), 
        W.viewport(d, e, c, a), $ = b), hb = c, ib = a;
    }, this.readRenderTargetPixels = function(a, b, c, d, e, f) {
        if (a instanceof THREE.WebGLRenderTarget) {
            if (a.__webglFramebuffer) if (a.format !== THREE.RGBAFormat) console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA format. readPixels can read only RGBA format."); else {
                var g = !1;
                a.__webglFramebuffer !== $ && (W.bindFramebuffer(W.FRAMEBUFFER, a.__webglFramebuffer), 
                g = !0), W.checkFramebufferStatus(W.FRAMEBUFFER) === W.FRAMEBUFFER_COMPLETE ? W.readPixels(b, c, d, e, W.RGBA, W.UNSIGNED_BYTE, f) : console.error("THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete."), 
                g && W.bindFramebuffer(W.FRAMEBUFFER, $);
            }
        } else console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
    }, this.initMaterial = function() {
        THREE.warn("THREE.WebGLRenderer: .initMaterial() has been removed.");
    }, this.addPrePlugin = function() {
        THREE.warn("THREE.WebGLRenderer: .addPrePlugin() has been removed.");
    }, this.addPostPlugin = function() {
        THREE.warn("THREE.WebGLRenderer: .addPostPlugin() has been removed.");
    }, this.updateShadowMap = function() {
        THREE.warn("THREE.WebGLRenderer: .updateShadowMap() has been removed.");
    };
}, THREE.WebGLRenderTarget = function(a, b, c) {
    this.width = a, this.height = b, c = c || {}, this.wrapS = void 0 !== c.wrapS ? c.wrapS : THREE.ClampToEdgeWrapping, 
    this.wrapT = void 0 !== c.wrapT ? c.wrapT : THREE.ClampToEdgeWrapping, this.magFilter = void 0 !== c.magFilter ? c.magFilter : THREE.LinearFilter, 
    this.minFilter = void 0 !== c.minFilter ? c.minFilter : THREE.LinearMipMapLinearFilter, 
    this.anisotropy = void 0 !== c.anisotropy ? c.anisotropy : 1, this.offset = new THREE.Vector2(0, 0), 
    this.repeat = new THREE.Vector2(1, 1), this.format = void 0 !== c.format ? c.format : THREE.RGBAFormat, 
    this.type = void 0 !== c.type ? c.type : THREE.UnsignedByteType, this.depthBuffer = void 0 !== c.depthBuffer ? c.depthBuffer : !0, 
    this.stencilBuffer = void 0 !== c.stencilBuffer ? c.stencilBuffer : !0, this.generateMipmaps = !0, 
    this.shareDepthFrom = void 0 !== c.shareDepthFrom ? c.shareDepthFrom : null;
}, THREE.WebGLRenderTarget.prototype = {
    constructor: THREE.WebGLRenderTarget,
    setSize: function(a, b) {
        this.width = a, this.height = b;
    },
    clone: function() {
        var a = new THREE.WebGLRenderTarget(this.width, this.height);
        return a.wrapS = this.wrapS, a.wrapT = this.wrapT, a.magFilter = this.magFilter, 
        a.minFilter = this.minFilter, a.anisotropy = this.anisotropy, a.offset.copy(this.offset), 
        a.repeat.copy(this.repeat), a.format = this.format, a.type = this.type, a.depthBuffer = this.depthBuffer, 
        a.stencilBuffer = this.stencilBuffer, a.generateMipmaps = this.generateMipmaps, 
        a.shareDepthFrom = this.shareDepthFrom, a;
    },
    dispose: function() {
        this.dispatchEvent({
            type: "dispose"
        });
    }
}, THREE.EventDispatcher.prototype.apply(THREE.WebGLRenderTarget.prototype), THREE.WebGLRenderTargetCube = function(a, b, c) {
    THREE.WebGLRenderTarget.call(this, a, b, c), this.activeCubeFace = 0;
}, THREE.WebGLRenderTargetCube.prototype = Object.create(THREE.WebGLRenderTarget.prototype), 
THREE.WebGLRenderTargetCube.prototype.constructor = THREE.WebGLRenderTargetCube, 
THREE.WebGLExtensions = function(a) {
    var b = {};
    this.get = function(c) {
        if (void 0 !== b[c]) return b[c];
        var d;
        switch (c) {
          case "EXT_texture_filter_anisotropic":
            d = a.getExtension("EXT_texture_filter_anisotropic") || a.getExtension("MOZ_EXT_texture_filter_anisotropic") || a.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
            break;

          case "WEBGL_compressed_texture_s3tc":
            d = a.getExtension("WEBGL_compressed_texture_s3tc") || a.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || a.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
            break;

          case "WEBGL_compressed_texture_pvrtc":
            d = a.getExtension("WEBGL_compressed_texture_pvrtc") || a.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
            break;

          default:
            d = a.getExtension(c);
        }
        return null === d && THREE.warn("THREE.WebGLRenderer: " + c + " extension not supported."), 
        b[c] = d;
    };
}, THREE.WebGLProgram = function() {
    var a = 0;
    return function(b, c, d, e) {
        var f = b.context, g = d.defines, h = d.__webglShader.uniforms, i = d.attributes, j = d.__webglShader.vertexShader, k = d.__webglShader.fragmentShader, l = d.index0AttributeName;
        void 0 === l && !0 === e.morphTargets && (l = "position");
        var m = "SHADOWMAP_TYPE_BASIC";
        e.shadowMapType === THREE.PCFShadowMap ? m = "SHADOWMAP_TYPE_PCF" : e.shadowMapType === THREE.PCFSoftShadowMap && (m = "SHADOWMAP_TYPE_PCF_SOFT");
        var n = "ENVMAP_TYPE_CUBE", o = "ENVMAP_MODE_REFLECTION", p = "ENVMAP_BLENDING_MULTIPLY";
        if (e.envMap) {
            switch (d.envMap.mapping) {
              case THREE.CubeReflectionMapping:
              case THREE.CubeRefractionMapping:
                n = "ENVMAP_TYPE_CUBE";
                break;

              case THREE.EquirectangularReflectionMapping:
              case THREE.EquirectangularRefractionMapping:
                n = "ENVMAP_TYPE_EQUIREC";
                break;

              case THREE.SphericalReflectionMapping:
                n = "ENVMAP_TYPE_SPHERE";
            }
            switch (d.envMap.mapping) {
              case THREE.CubeRefractionMapping:
              case THREE.EquirectangularRefractionMapping:
                o = "ENVMAP_MODE_REFRACTION";
            }
            switch (d.combine) {
              case THREE.MultiplyOperation:
                p = "ENVMAP_BLENDING_MULTIPLY";
                break;

              case THREE.MixOperation:
                p = "ENVMAP_BLENDING_MIX";
                break;

              case THREE.AddOperation:
                p = "ENVMAP_BLENDING_ADD";
            }
        }
        var q, r, s = 0 < b.gammaFactor ? b.gammaFactor : 1;
        q = [];
        for (var t in g) r = g[t], !1 !== r && (r = "#define " + t + " " + r, q.push(r));
        q = q.join("\n"), g = f.createProgram(), d instanceof THREE.RawShaderMaterial ? b = d = "" : (d = [ "precision " + e.precision + " float;", "precision " + e.precision + " int;", q, e.supportsVertexTextures ? "#define VERTEX_TEXTURES" : "", b.gammaInput ? "#define GAMMA_INPUT" : "", b.gammaOutput ? "#define GAMMA_OUTPUT" : "", "#define GAMMA_FACTOR " + s, "#define MAX_DIR_LIGHTS " + e.maxDirLights, "#define MAX_POINT_LIGHTS " + e.maxPointLights, "#define MAX_SPOT_LIGHTS " + e.maxSpotLights, "#define MAX_HEMI_LIGHTS " + e.maxHemiLights, "#define MAX_SHADOWS " + e.maxShadows, "#define MAX_BONES " + e.maxBones, e.map ? "#define USE_MAP" : "", e.envMap ? "#define USE_ENVMAP" : "", e.envMap ? "#define " + o : "", e.lightMap ? "#define USE_LIGHTMAP" : "", e.bumpMap ? "#define USE_BUMPMAP" : "", e.normalMap ? "#define USE_NORMALMAP" : "", e.specularMap ? "#define USE_SPECULARMAP" : "", e.alphaMap ? "#define USE_ALPHAMAP" : "", e.vertexColors ? "#define USE_COLOR" : "", e.flatShading ? "#define FLAT_SHADED" : "", e.skinning ? "#define USE_SKINNING" : "", e.useVertexTexture ? "#define BONE_TEXTURE" : "", e.morphTargets ? "#define USE_MORPHTARGETS" : "", e.morphNormals ? "#define USE_MORPHNORMALS" : "", e.wrapAround ? "#define WRAP_AROUND" : "", e.doubleSided ? "#define DOUBLE_SIDED" : "", e.flipSided ? "#define FLIP_SIDED" : "", e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", e.shadowMapEnabled ? "#define " + m : "", e.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "", e.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "", e.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", "uniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\n#ifdef USE_COLOR\n	attribute vec3 color;\n#endif\n#ifdef USE_MORPHTARGETS\n	attribute vec3 morphTarget0;\n	attribute vec3 morphTarget1;\n	attribute vec3 morphTarget2;\n	attribute vec3 morphTarget3;\n	#ifdef USE_MORPHNORMALS\n		attribute vec3 morphNormal0;\n		attribute vec3 morphNormal1;\n		attribute vec3 morphNormal2;\n		attribute vec3 morphNormal3;\n	#else\n		attribute vec3 morphTarget4;\n		attribute vec3 morphTarget5;\n		attribute vec3 morphTarget6;\n		attribute vec3 morphTarget7;\n	#endif\n#endif\n#ifdef USE_SKINNING\n	attribute vec4 skinIndex;\n	attribute vec4 skinWeight;\n#endif\n" ].join("\n"), 
        b = [ "precision " + e.precision + " float;", "precision " + e.precision + " int;", e.bumpMap || e.normalMap || e.flatShading ? "#extension GL_OES_standard_derivatives : enable" : "", q, "#define MAX_DIR_LIGHTS " + e.maxDirLights, "#define MAX_POINT_LIGHTS " + e.maxPointLights, "#define MAX_SPOT_LIGHTS " + e.maxSpotLights, "#define MAX_HEMI_LIGHTS " + e.maxHemiLights, "#define MAX_SHADOWS " + e.maxShadows, e.alphaTest ? "#define ALPHATEST " + e.alphaTest : "", b.gammaInput ? "#define GAMMA_INPUT" : "", b.gammaOutput ? "#define GAMMA_OUTPUT" : "", "#define GAMMA_FACTOR " + s, e.useFog && e.fog ? "#define USE_FOG" : "", e.useFog && e.fogExp ? "#define FOG_EXP2" : "", e.map ? "#define USE_MAP" : "", e.envMap ? "#define USE_ENVMAP" : "", e.envMap ? "#define " + n : "", e.envMap ? "#define " + o : "", e.envMap ? "#define " + p : "", e.lightMap ? "#define USE_LIGHTMAP" : "", e.bumpMap ? "#define USE_BUMPMAP" : "", e.normalMap ? "#define USE_NORMALMAP" : "", e.specularMap ? "#define USE_SPECULARMAP" : "", e.alphaMap ? "#define USE_ALPHAMAP" : "", e.vertexColors ? "#define USE_COLOR" : "", e.flatShading ? "#define FLAT_SHADED" : "", e.metal ? "#define METAL" : "", e.wrapAround ? "#define WRAP_AROUND" : "", e.doubleSided ? "#define DOUBLE_SIDED" : "", e.flipSided ? "#define FLIP_SIDED" : "", e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", e.shadowMapEnabled ? "#define " + m : "", e.shadowMapDebug ? "#define SHADOWMAP_DEBUG" : "", e.shadowMapCascade ? "#define SHADOWMAP_CASCADE" : "", e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", "uniform mat4 viewMatrix;\nuniform vec3 cameraPosition;\n" ].join("\n")), 
        j = new THREE.WebGLShader(f, f.VERTEX_SHADER, d + j), k = new THREE.WebGLShader(f, f.FRAGMENT_SHADER, b + k), 
        f.attachShader(g, j), f.attachShader(g, k), void 0 !== l && f.bindAttribLocation(g, 0, l), 
        f.linkProgram(g), l = f.getProgramInfoLog(g), !1 === f.getProgramParameter(g, f.LINK_STATUS) && THREE.error("THREE.WebGLProgram: shader error: " + f.getError(), "gl.VALIDATE_STATUS", f.getProgramParameter(g, f.VALIDATE_STATUS), "gl.getPRogramInfoLog", l), 
        "" !== l && THREE.warn("THREE.WebGLProgram: gl.getProgramInfoLog()" + l), f.deleteShader(j), 
        f.deleteShader(k), l = "viewMatrix modelViewMatrix projectionMatrix normalMatrix modelMatrix cameraPosition morphTargetInfluences bindMatrix bindMatrixInverse".split(" "), 
        e.useVertexTexture ? (l.push("boneTexture"), l.push("boneTextureWidth"), l.push("boneTextureHeight")) : l.push("boneGlobalMatrices"), 
        e.logarithmicDepthBuffer && l.push("logDepthBufFC");
        for (var u in h) l.push(u);
        for (h = l, u = {}, l = 0, b = h.length; b > l; l++) m = h[l], u[m] = f.getUniformLocation(g, m);
        for (this.uniforms = u, l = "position normal uv uv2 tangent color skinIndex skinWeight lineDistance".split(" "), 
        h = 0; h < e.maxMorphTargets; h++) l.push("morphTarget" + h);
        for (h = 0; h < e.maxMorphNormals; h++) l.push("morphNormal" + h);
        for (var v in i) l.push(v);
        for (e = l, i = {}, v = 0, h = e.length; h > v; v++) u = e[v], i[u] = f.getAttribLocation(g, u);
        return this.attributes = i, this.attributesKeys = Object.keys(this.attributes), 
        this.id = a++, this.code = c, this.usedTimes = 1, this.program = g, this.vertexShader = j, 
        this.fragmentShader = k, this;
    };
}(), THREE.WebGLShader = function() {
    var a = function(a) {
        a = a.split("\n");
        for (var b = 0; b < a.length; b++) a[b] = b + 1 + ": " + a[b];
        return a.join("\n");
    };
    return function(b, c, d) {
        return c = b.createShader(c), b.shaderSource(c, d), b.compileShader(c), !1 === b.getShaderParameter(c, b.COMPILE_STATUS) && THREE.error("THREE.WebGLShader: Shader couldn't compile."), 
        "" !== b.getShaderInfoLog(c) && THREE.warn("THREE.WebGLShader: gl.getShaderInfoLog()", b.getShaderInfoLog(c), a(d)), 
        c;
    };
}(), THREE.WebGLState = function(a, b) {
    var c = new Uint8Array(16), d = new Uint8Array(16), e = null, f = null, g = null, h = null, i = null, j = null, k = null, l = null, m = null, n = null, o = null, p = null, q = null, r = null, s = null, t = null;
    this.initAttributes = function() {
        for (var a = 0, b = c.length; b > a; a++) c[a] = 0;
    }, this.enableAttribute = function(b) {
        c[b] = 1, 0 === d[b] && (a.enableVertexAttribArray(b), d[b] = 1);
    }, this.disableUnusedAttributes = function() {
        for (var b = 0, e = d.length; e > b; b++) d[b] !== c[b] && (a.disableVertexAttribArray(b), 
        d[b] = 0);
    }, this.setBlending = function(c, d, l, m, n, o, p) {
        c !== e && (c === THREE.NoBlending ? a.disable(a.BLEND) : c === THREE.AdditiveBlending ? (a.enable(a.BLEND), 
        a.blendEquation(a.FUNC_ADD), a.blendFunc(a.SRC_ALPHA, a.ONE)) : c === THREE.SubtractiveBlending ? (a.enable(a.BLEND), 
        a.blendEquation(a.FUNC_ADD), a.blendFunc(a.ZERO, a.ONE_MINUS_SRC_COLOR)) : c === THREE.MultiplyBlending ? (a.enable(a.BLEND), 
        a.blendEquation(a.FUNC_ADD), a.blendFunc(a.ZERO, a.SRC_COLOR)) : c === THREE.CustomBlending ? a.enable(a.BLEND) : (a.enable(a.BLEND), 
        a.blendEquationSeparate(a.FUNC_ADD, a.FUNC_ADD), a.blendFuncSeparate(a.SRC_ALPHA, a.ONE_MINUS_SRC_ALPHA, a.ONE, a.ONE_MINUS_SRC_ALPHA)), 
        e = c), c === THREE.CustomBlending ? (n = n || d, o = o || l, p = p || m, (d !== f || n !== i) && (a.blendEquationSeparate(b(d), b(n)), 
        f = d, i = n), (l !== g || m !== h || o !== j || p !== k) && (a.blendFuncSeparate(b(l), b(m), b(o), b(p)), 
        g = l, h = m, j = o, k = p)) : k = j = i = h = g = f = null;
    }, this.setDepthTest = function(b) {
        l !== b && (b ? a.enable(a.DEPTH_TEST) : a.disable(a.DEPTH_TEST), l = b);
    }, this.setDepthWrite = function(b) {
        m !== b && (a.depthMask(b), m = b);
    }, this.setColorWrite = function(b) {
        n !== b && (a.colorMask(b, b, b, b), n = b);
    }, this.setDoubleSided = function(b) {
        o !== b && (b ? a.disable(a.CULL_FACE) : a.enable(a.CULL_FACE), o = b);
    }, this.setFlipSided = function(b) {
        p !== b && (a.frontFace(b ? a.CW : a.CCW), p = b);
    }, this.setLineWidth = function(b) {
        b !== q && (a.lineWidth(b), q = b);
    }, this.setPolygonOffset = function(b, c, d) {
        r !== b && (b ? a.enable(a.POLYGON_OFFSET_FILL) : a.disable(a.POLYGON_OFFSET_FILL), 
        r = b), !b || s === c && t === d || (a.polygonOffset(c, d), s = c, t = d);
    }, this.reset = function() {
        for (var a = 0; a < d.length; a++) d[a] = 0;
        p = o = n = m = l = e = null;
    };
}, THREE.LensFlarePlugin = function(a, b) {
    var c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s = a.context;
    this.render = function(t, u, v, w) {
        if (0 !== b.length) {
            t = new THREE.Vector3();
            var x = w / v, y = .5 * v, z = .5 * w, A = 16 / w, B = new THREE.Vector2(A * x, A), C = new THREE.Vector3(1, 1, 0), D = new THREE.Vector2(1, 1);
            if (void 0 === o) {
                var A = new Float32Array([ -1, -1, 0, 0, 1, -1, 1, 0, 1, 1, 1, 1, -1, 1, 0, 1 ]), E = new Uint16Array([ 0, 1, 2, 0, 2, 3 ]);
                m = s.createBuffer(), n = s.createBuffer(), s.bindBuffer(s.ARRAY_BUFFER, m), s.bufferData(s.ARRAY_BUFFER, A, s.STATIC_DRAW), 
                s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, n), s.bufferData(s.ELEMENT_ARRAY_BUFFER, E, s.STATIC_DRAW), 
                q = s.createTexture(), r = s.createTexture(), s.bindTexture(s.TEXTURE_2D, q), s.texImage2D(s.TEXTURE_2D, 0, s.RGB, 16, 16, 0, s.RGB, s.UNSIGNED_BYTE, null), 
                s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_S, s.CLAMP_TO_EDGE), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_T, s.CLAMP_TO_EDGE), 
                s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MAG_FILTER, s.NEAREST), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MIN_FILTER, s.NEAREST), 
                s.bindTexture(s.TEXTURE_2D, r), s.texImage2D(s.TEXTURE_2D, 0, s.RGBA, 16, 16, 0, s.RGBA, s.UNSIGNED_BYTE, null), 
                s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_S, s.CLAMP_TO_EDGE), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_T, s.CLAMP_TO_EDGE), 
                s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MAG_FILTER, s.NEAREST), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MIN_FILTER, s.NEAREST);
                var A = (p = 0 < s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS)) ? {
                    vertexShader: "uniform lowp int renderType;\nuniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nuniform sampler2D occlusionMap;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif( renderType == 2 ) {\nvec4 visibility = texture2D( occlusionMap, vec2( 0.1, 0.1 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.5, 0.1 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.9, 0.1 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.9, 0.9 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.1, 0.9 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) );\nvisibility += texture2D( occlusionMap, vec2( 0.5, 0.5 ) );\nvVisibility =        visibility.r / 9.0;\nvVisibility *= 1.0 - visibility.g / 9.0;\nvVisibility *=       visibility.b / 9.0;\nvVisibility *= 1.0 - visibility.a / 9.0;\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",
                    fragmentShader: "uniform lowp int renderType;\nuniform sampler2D map;\nuniform float opacity;\nuniform vec3 color;\nvarying vec2 vUV;\nvarying float vVisibility;\nvoid main() {\nif( renderType == 0 ) {\ngl_FragColor = vec4( 1.0, 0.0, 1.0, 0.0 );\n} else if( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * vVisibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"
                } : {
                    vertexShader: "uniform lowp int renderType;\nuniform vec3 screenPosition;\nuniform vec2 scale;\nuniform float rotation;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uv;\nvec2 pos = position;\nif( renderType == 2 ) {\npos.x = cos( rotation ) * position.x - sin( rotation ) * position.y;\npos.y = sin( rotation ) * position.x + cos( rotation ) * position.y;\n}\ngl_Position = vec4( ( pos * scale + screenPosition.xy ).xy, screenPosition.z, 1.0 );\n}",
                    fragmentShader: "precision mediump float;\nuniform lowp int renderType;\nuniform sampler2D map;\nuniform sampler2D occlusionMap;\nuniform float opacity;\nuniform vec3 color;\nvarying vec2 vUV;\nvoid main() {\nif( renderType == 0 ) {\ngl_FragColor = vec4( texture2D( map, vUV ).rgb, 0.0 );\n} else if( renderType == 1 ) {\ngl_FragColor = texture2D( map, vUV );\n} else {\nfloat visibility = texture2D( occlusionMap, vec2( 0.5, 0.1 ) ).a;\nvisibility += texture2D( occlusionMap, vec2( 0.9, 0.5 ) ).a;\nvisibility += texture2D( occlusionMap, vec2( 0.5, 0.9 ) ).a;\nvisibility += texture2D( occlusionMap, vec2( 0.1, 0.5 ) ).a;\nvisibility = ( 1.0 - visibility / 4.0 );\nvec4 texture = texture2D( map, vUV );\ntexture.a *= opacity * visibility;\ngl_FragColor = texture;\ngl_FragColor.rgb *= color;\n}\n}"
                }, E = s.createProgram(), F = s.createShader(s.FRAGMENT_SHADER), G = s.createShader(s.VERTEX_SHADER), H = "precision " + a.getPrecision() + " float;\n";
                s.shaderSource(F, H + A.fragmentShader), s.shaderSource(G, H + A.vertexShader), 
                s.compileShader(F), s.compileShader(G), s.attachShader(E, F), s.attachShader(E, G), 
                s.linkProgram(E), o = E, k = s.getAttribLocation(o, "position"), l = s.getAttribLocation(o, "uv"), 
                c = s.getUniformLocation(o, "renderType"), d = s.getUniformLocation(o, "map"), e = s.getUniformLocation(o, "occlusionMap"), 
                f = s.getUniformLocation(o, "opacity"), g = s.getUniformLocation(o, "color"), h = s.getUniformLocation(o, "scale"), 
                i = s.getUniformLocation(o, "rotation"), j = s.getUniformLocation(o, "screenPosition");
            }
            for (s.useProgram(o), s.enableVertexAttribArray(k), s.enableVertexAttribArray(l), 
            s.uniform1i(e, 0), s.uniform1i(d, 1), s.bindBuffer(s.ARRAY_BUFFER, m), s.vertexAttribPointer(k, 2, s.FLOAT, !1, 16, 0), 
            s.vertexAttribPointer(l, 2, s.FLOAT, !1, 16, 8), s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, n), 
            s.disable(s.CULL_FACE), s.depthMask(!1), E = 0, F = b.length; F > E; E++) if (A = 16 / w, 
            B.set(A * x, A), G = b[E], t.set(G.matrixWorld.elements[12], G.matrixWorld.elements[13], G.matrixWorld.elements[14]), 
            t.applyMatrix4(u.matrixWorldInverse), t.applyProjection(u.projectionMatrix), C.copy(t), 
            D.x = C.x * y + y, D.y = C.y * z + z, p || 0 < D.x && D.x < v && 0 < D.y && D.y < w) {
                s.activeTexture(s.TEXTURE1), s.bindTexture(s.TEXTURE_2D, q), s.copyTexImage2D(s.TEXTURE_2D, 0, s.RGB, D.x - 8, D.y - 8, 16, 16, 0), 
                s.uniform1i(c, 0), s.uniform2f(h, B.x, B.y), s.uniform3f(j, C.x, C.y, C.z), s.disable(s.BLEND), 
                s.enable(s.DEPTH_TEST), s.drawElements(s.TRIANGLES, 6, s.UNSIGNED_SHORT, 0), s.activeTexture(s.TEXTURE0), 
                s.bindTexture(s.TEXTURE_2D, r), s.copyTexImage2D(s.TEXTURE_2D, 0, s.RGBA, D.x - 8, D.y - 8, 16, 16, 0), 
                s.uniform1i(c, 1), s.disable(s.DEPTH_TEST), s.activeTexture(s.TEXTURE1), s.bindTexture(s.TEXTURE_2D, q), 
                s.drawElements(s.TRIANGLES, 6, s.UNSIGNED_SHORT, 0), G.positionScreen.copy(C), G.customUpdateCallback ? G.customUpdateCallback(G) : G.updateLensFlares(), 
                s.uniform1i(c, 2), s.enable(s.BLEND);
                for (var H = 0, I = G.lensFlares.length; I > H; H++) {
                    var J = G.lensFlares[H];
                    .001 < J.opacity && .001 < J.scale && (C.x = J.x, C.y = J.y, C.z = J.z, A = J.size * J.scale / w, 
                    B.x = A * x, B.y = A, s.uniform3f(j, C.x, C.y, C.z), s.uniform2f(h, B.x, B.y), s.uniform1f(i, J.rotation), 
                    s.uniform1f(f, J.opacity), s.uniform3f(g, J.color.r, J.color.g, J.color.b), a.state.setBlending(J.blending, J.blendEquation, J.blendSrc, J.blendDst), 
                    a.setTexture(J.texture, 1), s.drawElements(s.TRIANGLES, 6, s.UNSIGNED_SHORT, 0));
                }
            }
            s.enable(s.CULL_FACE), s.enable(s.DEPTH_TEST), s.depthMask(!0), a.resetGLState();
        }
    };
}, THREE.ShadowMapPlugin = function(a, b, c, d) {
    function e(a, b, d) {
        if (b.visible) {
            var f = c[b.id];
            if (f && b.castShadow && (!1 === b.frustumCulled || !0 === k.intersectsObject(b))) for (var g = 0, h = f.length; h > g; g++) {
                var i = f[g];
                b._modelViewMatrix.multiplyMatrices(d.matrixWorldInverse, b.matrixWorld), p.push(i);
            }
            for (g = 0, h = b.children.length; h > g; g++) e(a, b.children[g], d);
        }
    }
    var f, g, h, i, j = a.context, k = new THREE.Frustum(), l = new THREE.Matrix4(), m = new THREE.Vector3(), n = new THREE.Vector3(), o = new THREE.Vector3(), p = [], q = THREE.ShaderLib.depthRGBA, r = THREE.UniformsUtils.clone(q.uniforms);
    f = new THREE.ShaderMaterial({
        uniforms: r,
        vertexShader: q.vertexShader,
        fragmentShader: q.fragmentShader
    }), g = new THREE.ShaderMaterial({
        uniforms: r,
        vertexShader: q.vertexShader,
        fragmentShader: q.fragmentShader,
        morphTargets: !0
    }), h = new THREE.ShaderMaterial({
        uniforms: r,
        vertexShader: q.vertexShader,
        fragmentShader: q.fragmentShader,
        skinning: !0
    }), i = new THREE.ShaderMaterial({
        uniforms: r,
        vertexShader: q.vertexShader,
        fragmentShader: q.fragmentShader,
        morphTargets: !0,
        skinning: !0
    }), f._shadowPass = !0, g._shadowPass = !0, h._shadowPass = !0, i._shadowPass = !0, 
    this.render = function(c, q) {
        if (!1 !== a.shadowMapEnabled) {
            var r, s, t, u, v, w, x, y, z = [];
            for (u = 0, j.clearColor(1, 1, 1, 1), j.disable(j.BLEND), j.enable(j.CULL_FACE), 
            j.frontFace(j.CCW), j.cullFace(a.shadowMapCullFace === THREE.CullFaceFront ? j.FRONT : j.BACK), 
            a.state.setDepthTest(!0), r = 0, s = b.length; s > r; r++) if (t = b[r], t.castShadow) if (t instanceof THREE.DirectionalLight && t.shadowCascade) for (v = 0; v < t.shadowCascadeCount; v++) {
                var A;
                if (t.shadowCascadeArray[v]) A = t.shadowCascadeArray[v]; else {
                    x = t;
                    var B = v;
                    A = new THREE.DirectionalLight(), A.isVirtual = !0, A.onlyShadow = !0, A.castShadow = !0, 
                    A.shadowCameraNear = x.shadowCameraNear, A.shadowCameraFar = x.shadowCameraFar, 
                    A.shadowCameraLeft = x.shadowCameraLeft, A.shadowCameraRight = x.shadowCameraRight, 
                    A.shadowCameraBottom = x.shadowCameraBottom, A.shadowCameraTop = x.shadowCameraTop, 
                    A.shadowCameraVisible = x.shadowCameraVisible, A.shadowDarkness = x.shadowDarkness, 
                    A.shadowBias = x.shadowCascadeBias[B], A.shadowMapWidth = x.shadowCascadeWidth[B], 
                    A.shadowMapHeight = x.shadowCascadeHeight[B], A.pointsWorld = [], A.pointsFrustum = [], 
                    y = A.pointsWorld, w = A.pointsFrustum;
                    for (var C = 0; 8 > C; C++) y[C] = new THREE.Vector3(), w[C] = new THREE.Vector3();
                    y = x.shadowCascadeNearZ[B], x = x.shadowCascadeFarZ[B], w[0].set(-1, -1, y), w[1].set(1, -1, y), 
                    w[2].set(-1, 1, y), w[3].set(1, 1, y), w[4].set(-1, -1, x), w[5].set(1, -1, x), 
                    w[6].set(-1, 1, x), w[7].set(1, 1, x), A.originalCamera = q, w = new THREE.Gyroscope(), 
                    w.position.copy(t.shadowCascadeOffset), w.add(A), w.add(A.target), q.add(w), t.shadowCascadeArray[v] = A;
                }
                B = t, y = v, x = B.shadowCascadeArray[y], x.position.copy(B.position), x.target.position.copy(B.target.position), 
                x.lookAt(x.target), x.shadowCameraVisible = B.shadowCameraVisible, x.shadowDarkness = B.shadowDarkness, 
                x.shadowBias = B.shadowCascadeBias[y], w = B.shadowCascadeNearZ[y], B = B.shadowCascadeFarZ[y], 
                x = x.pointsFrustum, x[0].z = w, x[1].z = w, x[2].z = w, x[3].z = w, x[4].z = B, 
                x[5].z = B, x[6].z = B, x[7].z = B, z[u] = A, u++;
            } else z[u] = t, u++;
            for (r = 0, s = z.length; s > r; r++) {
                if (t = z[r], t.shadowMap || (v = THREE.LinearFilter, a.shadowMapType === THREE.PCFSoftShadowMap && (v = THREE.NearestFilter), 
                t.shadowMap = new THREE.WebGLRenderTarget(t.shadowMapWidth, t.shadowMapHeight, {
                    minFilter: v,
                    magFilter: v,
                    format: THREE.RGBAFormat
                }), t.shadowMapSize = new THREE.Vector2(t.shadowMapWidth, t.shadowMapHeight), t.shadowMatrix = new THREE.Matrix4()), 
                !t.shadowCamera) {
                    if (t instanceof THREE.SpotLight) t.shadowCamera = new THREE.PerspectiveCamera(t.shadowCameraFov, t.shadowMapWidth / t.shadowMapHeight, t.shadowCameraNear, t.shadowCameraFar); else {
                        if (!(t instanceof THREE.DirectionalLight)) {
                            THREE.error("THREE.ShadowMapPlugin: Unsupported light type for shadow", t);
                            continue;
                        }
                        t.shadowCamera = new THREE.OrthographicCamera(t.shadowCameraLeft, t.shadowCameraRight, t.shadowCameraTop, t.shadowCameraBottom, t.shadowCameraNear, t.shadowCameraFar);
                    }
                    c.add(t.shadowCamera), !0 === c.autoUpdate && c.updateMatrixWorld();
                }
                if (t.shadowCameraVisible && !t.cameraHelper && (t.cameraHelper = new THREE.CameraHelper(t.shadowCamera), 
                c.add(t.cameraHelper)), t.isVirtual && A.originalCamera == q) {
                    for (v = q, u = t.shadowCamera, w = t.pointsFrustum, x = t.pointsWorld, m.set(1/0, 1/0, 1/0), 
                    n.set(-1/0, -1/0, -1/0), B = 0; 8 > B; B++) y = x[B], y.copy(w[B]), y.unproject(v), 
                    y.applyMatrix4(u.matrixWorldInverse), y.x < m.x && (m.x = y.x), y.x > n.x && (n.x = y.x), 
                    y.y < m.y && (m.y = y.y), y.y > n.y && (n.y = y.y), y.z < m.z && (m.z = y.z), y.z > n.z && (n.z = y.z);
                    u.left = m.x, u.right = n.x, u.top = n.y, u.bottom = m.y, u.updateProjectionMatrix();
                }
                for (u = t.shadowMap, w = t.shadowMatrix, v = t.shadowCamera, v.position.setFromMatrixPosition(t.matrixWorld), 
                o.setFromMatrixPosition(t.target.matrixWorld), v.lookAt(o), v.updateMatrixWorld(), 
                v.matrixWorldInverse.getInverse(v.matrixWorld), t.cameraHelper && (t.cameraHelper.visible = t.shadowCameraVisible), 
                t.shadowCameraVisible && t.cameraHelper.update(), w.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), 
                w.multiply(v.projectionMatrix), w.multiply(v.matrixWorldInverse), l.multiplyMatrices(v.projectionMatrix, v.matrixWorldInverse), 
                k.setFromMatrix(l), a.setRenderTarget(u), a.clear(), p.length = 0, e(c, c, v), t = 0, 
                u = p.length; u > t; t++) x = p[t], w = x.object, x = x.buffer, B = w.material instanceof THREE.MeshFaceMaterial ? w.material.materials[0] : w.material, 
                y = void 0 !== w.geometry.morphTargets && 0 < w.geometry.morphTargets.length && B.morphTargets, 
                C = w instanceof THREE.SkinnedMesh && B.skinning, y = w.customDepthMaterial ? w.customDepthMaterial : C ? y ? i : h : y ? g : f, 
                a.setMaterialFaces(B), x instanceof THREE.BufferGeometry ? a.renderBufferDirect(v, b, null, y, x, w) : a.renderBuffer(v, b, null, y, x, w);
                for (t = 0, u = d.length; u > t; t++) x = d[t], w = x.object, w.visible && w.castShadow && (w._modelViewMatrix.multiplyMatrices(v.matrixWorldInverse, w.matrixWorld), 
                a.renderImmediateObject(v, b, null, f, w));
            }
            r = a.getClearColor(), s = a.getClearAlpha(), j.clearColor(r.r, r.g, r.b, s), j.enable(j.BLEND), 
            a.shadowMapCullFace === THREE.CullFaceFront && j.cullFace(j.BACK), a.resetGLState();
        }
    };
}, THREE.SpritePlugin = function(a, b) {
    function c(a, b) {
        return a.z !== b.z ? b.z - a.z : b.id - a.id;
    }
    var d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y = a.context, z = new THREE.Vector3(), A = new THREE.Quaternion(), B = new THREE.Vector3();
    this.render = function(C, D) {
        if (0 !== b.length) {
            if (void 0 === w) {
                var E = new Float32Array([ -.5, -.5, 0, 0, .5, -.5, 1, 0, .5, .5, 1, 1, -.5, .5, 0, 1 ]), F = new Uint16Array([ 0, 1, 2, 0, 2, 3 ]);
                u = y.createBuffer(), v = y.createBuffer(), y.bindBuffer(y.ARRAY_BUFFER, u), y.bufferData(y.ARRAY_BUFFER, E, y.STATIC_DRAW), 
                y.bindBuffer(y.ELEMENT_ARRAY_BUFFER, v), y.bufferData(y.ELEMENT_ARRAY_BUFFER, F, y.STATIC_DRAW);
                var E = y.createProgram(), F = y.createShader(y.VERTEX_SHADER), G = y.createShader(y.FRAGMENT_SHADER);
                y.shaderSource(F, [ "precision " + a.getPrecision() + " float;", "uniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform float rotation;\nuniform vec2 scale;\nuniform vec2 uvOffset;\nuniform vec2 uvScale;\nattribute vec2 position;\nattribute vec2 uv;\nvarying vec2 vUV;\nvoid main() {\nvUV = uvOffset + uv * uvScale;\nvec2 alignedPosition = position * scale;\nvec2 rotatedPosition;\nrotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;\nrotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;\nvec4 finalPosition;\nfinalPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\nfinalPosition.xy += rotatedPosition;\nfinalPosition = projectionMatrix * finalPosition;\ngl_Position = finalPosition;\n}" ].join("\n")), 
                y.shaderSource(G, [ "precision " + a.getPrecision() + " float;", "uniform vec3 color;\nuniform sampler2D map;\nuniform float opacity;\nuniform int fogType;\nuniform vec3 fogColor;\nuniform float fogDensity;\nuniform float fogNear;\nuniform float fogFar;\nuniform float alphaTest;\nvarying vec2 vUV;\nvoid main() {\nvec4 texture = texture2D( map, vUV );\nif ( texture.a < alphaTest ) discard;\ngl_FragColor = vec4( color * texture.xyz, texture.a * opacity );\nif ( fogType > 0 ) {\nfloat depth = gl_FragCoord.z / gl_FragCoord.w;\nfloat fogFactor = 0.0;\nif ( fogType == 1 ) {\nfogFactor = smoothstep( fogNear, fogFar, depth );\n} else {\nconst float LOG2 = 1.442695;\nfloat fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );\nfogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );\n}\ngl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );\n}\n}" ].join("\n")), 
                y.compileShader(F), y.compileShader(G), y.attachShader(E, F), y.attachShader(E, G), 
                y.linkProgram(E), w = E, s = y.getAttribLocation(w, "position"), t = y.getAttribLocation(w, "uv"), 
                d = y.getUniformLocation(w, "uvOffset"), e = y.getUniformLocation(w, "uvScale"), 
                f = y.getUniformLocation(w, "rotation"), g = y.getUniformLocation(w, "scale"), h = y.getUniformLocation(w, "color"), 
                i = y.getUniformLocation(w, "map"), j = y.getUniformLocation(w, "opacity"), k = y.getUniformLocation(w, "modelViewMatrix"), 
                l = y.getUniformLocation(w, "projectionMatrix"), m = y.getUniformLocation(w, "fogType"), 
                n = y.getUniformLocation(w, "fogDensity"), o = y.getUniformLocation(w, "fogNear"), 
                p = y.getUniformLocation(w, "fogFar"), q = y.getUniformLocation(w, "fogColor"), 
                r = y.getUniformLocation(w, "alphaTest"), E = document.createElement("canvas"), 
                E.width = 8, E.height = 8, F = E.getContext("2d"), F.fillStyle = "white", F.fillRect(0, 0, 8, 8), 
                x = new THREE.Texture(E), x.needsUpdate = !0;
            }
            y.useProgram(w), y.enableVertexAttribArray(s), y.enableVertexAttribArray(t), y.disable(y.CULL_FACE), 
            y.enable(y.BLEND), y.bindBuffer(y.ARRAY_BUFFER, u), y.vertexAttribPointer(s, 2, y.FLOAT, !1, 16, 0), 
            y.vertexAttribPointer(t, 2, y.FLOAT, !1, 16, 8), y.bindBuffer(y.ELEMENT_ARRAY_BUFFER, v), 
            y.uniformMatrix4fv(l, !1, D.projectionMatrix.elements), y.activeTexture(y.TEXTURE0), 
            y.uniform1i(i, 0), F = E = 0, (G = C.fog) ? (y.uniform3f(q, G.color.r, G.color.g, G.color.b), 
            G instanceof THREE.Fog ? (y.uniform1f(o, G.near), y.uniform1f(p, G.far), y.uniform1i(m, 1), 
            F = E = 1) : G instanceof THREE.FogExp2 && (y.uniform1f(n, G.density), y.uniform1i(m, 2), 
            F = E = 2)) : (y.uniform1i(m, 0), F = E = 0);
            for (var G = 0, H = b.length; H > G; G++) {
                var I = b[G];
                I._modelViewMatrix.multiplyMatrices(D.matrixWorldInverse, I.matrixWorld), I.z = -I._modelViewMatrix.elements[14];
            }
            b.sort(c);
            for (var J = [], G = 0, H = b.length; H > G; G++) {
                var I = b[G], K = I.material;
                y.uniform1f(r, K.alphaTest), y.uniformMatrix4fv(k, !1, I._modelViewMatrix.elements), 
                I.matrixWorld.decompose(z, A, B), J[0] = B.x, J[1] = B.y, I = 0, C.fog && K.fog && (I = F), 
                E !== I && (y.uniform1i(m, I), E = I), null !== K.map ? (y.uniform2f(d, K.map.offset.x, K.map.offset.y), 
                y.uniform2f(e, K.map.repeat.x, K.map.repeat.y)) : (y.uniform2f(d, 0, 0), y.uniform2f(e, 1, 1)), 
                y.uniform1f(j, K.opacity), y.uniform3f(h, K.color.r, K.color.g, K.color.b), y.uniform1f(f, K.rotation), 
                y.uniform2fv(g, J), a.state.setBlending(K.blending, K.blendEquation, K.blendSrc, K.blendDst), 
                a.state.setDepthTest(K.depthTest), a.state.setDepthWrite(K.depthWrite), K.map && K.map.image && K.map.image.width ? a.setTexture(K.map, 0) : a.setTexture(x, 0), 
                y.drawElements(y.TRIANGLES, 6, y.UNSIGNED_SHORT, 0);
            }
            y.enable(y.CULL_FACE), a.resetGLState();
        }
    };
}, THREE.GeometryUtils = {
    merge: function(a, b, c) {
        THREE.warn("THREE.GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead.");
        var d;
        b instanceof THREE.Mesh && (b.matrixAutoUpdate && b.updateMatrix(), d = b.matrix, 
        b = b.geometry), a.merge(b, d, c);
    },
    center: function(a) {
        return THREE.warn("THREE.GeometryUtils: .center() has been moved to Geometry. Use geometry.center() instead."), 
        a.center();
    }
}, THREE.ImageUtils = {
    crossOrigin: void 0,
    loadTexture: function(a, b, c, d) {
        var e = new THREE.ImageLoader();
        e.crossOrigin = this.crossOrigin;
        var f = new THREE.Texture(void 0, b);
        return e.load(a, function(a) {
            f.image = a, f.needsUpdate = !0, c && c(f);
        }, void 0, function(a) {
            d && d(a);
        }), f.sourceFile = a, f;
    },
    loadTextureCube: function(a, b, c, d) {
        var e = new THREE.ImageLoader();
        e.crossOrigin = this.crossOrigin;
        var f = new THREE.CubeTexture([], b);
        f.flipY = !1;
        var g = 0;
        b = function(b) {
            e.load(a[b], function(a) {
                f.images[b] = a, g += 1, 6 === g && (f.needsUpdate = !0, c && c(f));
            }, void 0, d);
        };
        for (var h = 0, i = a.length; i > h; ++h) b(h);
        return f;
    },
    loadCompressedTexture: function() {
        THREE.error("THREE.ImageUtils.loadCompressedTexture has been removed. Use THREE.DDSLoader instead.");
    },
    loadCompressedTextureCube: function() {
        THREE.error("THREE.ImageUtils.loadCompressedTextureCube has been removed. Use THREE.DDSLoader instead.");
    },
    getNormalMap: function(a, b) {
        var c = function(a) {
            var b = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
            return [ a[0] / b, a[1] / b, a[2] / b ];
        };
        b |= 1;
        var d = a.width, e = a.height, f = document.createElement("canvas");
        f.width = d, f.height = e;
        var g = f.getContext("2d");
        g.drawImage(a, 0, 0);
        for (var h = g.getImageData(0, 0, d, e).data, i = g.createImageData(d, e), j = i.data, k = 0; d > k; k++) for (var l = 0; e > l; l++) {
            var m = 0 > l - 1 ? 0 : l - 1, n = l + 1 > e - 1 ? e - 1 : l + 1, o = 0 > k - 1 ? 0 : k - 1, p = k + 1 > d - 1 ? d - 1 : k + 1, q = [], r = [ 0, 0, h[4 * (l * d + k)] / 255 * b ];
            for (q.push([ -1, 0, h[4 * (l * d + o)] / 255 * b ]), q.push([ -1, -1, h[4 * (m * d + o)] / 255 * b ]), 
            q.push([ 0, -1, h[4 * (m * d + k)] / 255 * b ]), q.push([ 1, -1, h[4 * (m * d + p)] / 255 * b ]), 
            q.push([ 1, 0, h[4 * (l * d + p)] / 255 * b ]), q.push([ 1, 1, h[4 * (n * d + p)] / 255 * b ]), 
            q.push([ 0, 1, h[4 * (n * d + k)] / 255 * b ]), q.push([ -1, 1, h[4 * (n * d + o)] / 255 * b ]), 
            m = [], o = q.length, n = 0; o > n; n++) {
                var p = q[n], s = q[(n + 1) % o], p = [ p[0] - r[0], p[1] - r[1], p[2] - r[2] ], s = [ s[0] - r[0], s[1] - r[1], s[2] - r[2] ];
                m.push(c([ p[1] * s[2] - p[2] * s[1], p[2] * s[0] - p[0] * s[2], p[0] * s[1] - p[1] * s[0] ]));
            }
            for (q = [ 0, 0, 0 ], n = 0; n < m.length; n++) q[0] += m[n][0], q[1] += m[n][1], 
            q[2] += m[n][2];
            q[0] /= m.length, q[1] /= m.length, q[2] /= m.length, r = 4 * (l * d + k), j[r] = (q[0] + 1) / 2 * 255 | 0, 
            j[r + 1] = (q[1] + 1) / 2 * 255 | 0, j[r + 2] = 255 * q[2] | 0, j[r + 3] = 255;
        }
        return g.putImageData(i, 0, 0), f;
    },
    generateDataTexture: function(a, b, c) {
        var d = a * b, e = new Uint8Array(3 * d), f = Math.floor(255 * c.r), g = Math.floor(255 * c.g);
        c = Math.floor(255 * c.b);
        for (var h = 0; d > h; h++) e[3 * h] = f, e[3 * h + 1] = g, e[3 * h + 2] = c;
        return a = new THREE.DataTexture(e, a, b, THREE.RGBFormat), a.needsUpdate = !0, 
        a;
    }
}, THREE.SceneUtils = {
    createMultiMaterialObject: function(a, b) {
        for (var c = new THREE.Object3D(), d = 0, e = b.length; e > d; d++) c.add(new THREE.Mesh(a, b[d]));
        return c;
    },
    detach: function(a, b, c) {
        a.applyMatrix(b.matrixWorld), b.remove(a), c.add(a);
    },
    attach: function(a, b, c) {
        var d = new THREE.Matrix4();
        d.getInverse(c.matrixWorld), a.applyMatrix(d), b.remove(a), c.add(a);
    }
}, THREE.FontUtils = {
    faces: {},
    face: "helvetiker",
    weight: "normal",
    style: "normal",
    size: 150,
    divisions: 10,
    getFace: function() {
        try {
            return this.faces[this.face][this.weight][this.style];
        } catch (a) {
            throw "The font " + this.face + " with " + this.weight + " weight and " + this.style + " style is missing.";
        }
    },
    loadFace: function(a) {
        var b = a.familyName.toLowerCase();
        return this.faces[b] = this.faces[b] || {}, this.faces[b][a.cssFontWeight] = this.faces[b][a.cssFontWeight] || {}, 
        this.faces[b][a.cssFontWeight][a.cssFontStyle] = a, this.faces[b][a.cssFontWeight][a.cssFontStyle] = a;
    },
    drawText: function(a) {
        var b = this.getFace(), c = this.size / b.resolution, d = 0, e = String(a).split(""), f = e.length, g = [];
        for (a = 0; f > a; a++) {
            var h = new THREE.Path(), h = this.extractGlyphPoints(e[a], b, c, d, h), d = d + h.offset;
            g.push(h.path);
        }
        return {
            paths: g,
            offset: d / 2
        };
    },
    extractGlyphPoints: function(a, b, c, d, e) {
        var f, g, h, i, j, k, l, m, n, o, p, q = [], r = b.glyphs[a] || b.glyphs["?"];
        if (r) {
            if (r.o) for (b = r._cachedOutline || (r._cachedOutline = r.o.split(" ")), i = b.length, 
            a = 0; i > a; ) switch (h = b[a++]) {
              case "m":
                h = b[a++] * c + d, j = b[a++] * c, e.moveTo(h, j);
                break;

              case "l":
                h = b[a++] * c + d, j = b[a++] * c, e.lineTo(h, j);
                break;

              case "q":
                if (h = b[a++] * c + d, j = b[a++] * c, m = b[a++] * c + d, n = b[a++] * c, e.quadraticCurveTo(m, n, h, j), 
                f = q[q.length - 1]) for (k = f.x, l = f.y, f = 1, g = this.divisions; g >= f; f++) {
                    var s = f / g;
                    THREE.Shape.Utils.b2(s, k, m, h), THREE.Shape.Utils.b2(s, l, n, j);
                }
                break;

              case "b":
                if (h = b[a++] * c + d, j = b[a++] * c, m = b[a++] * c + d, n = b[a++] * c, o = b[a++] * c + d, 
                p = b[a++] * c, e.bezierCurveTo(m, n, o, p, h, j), f = q[q.length - 1]) for (k = f.x, 
                l = f.y, f = 1, g = this.divisions; g >= f; f++) s = f / g, THREE.Shape.Utils.b3(s, k, m, o, h), 
                THREE.Shape.Utils.b3(s, l, n, p, j);
            }
            return {
                offset: r.ha * c,
                path: e
            };
        }
    }
}, THREE.FontUtils.generateShapes = function(a, b) {
    b = b || {};
    var c = void 0 !== b.curveSegments ? b.curveSegments : 4, d = void 0 !== b.font ? b.font : "helvetiker", e = void 0 !== b.weight ? b.weight : "normal", f = void 0 !== b.style ? b.style : "normal";
    for (THREE.FontUtils.size = void 0 !== b.size ? b.size : 100, THREE.FontUtils.divisions = c, 
    THREE.FontUtils.face = d, THREE.FontUtils.weight = e, THREE.FontUtils.style = f, 
    c = THREE.FontUtils.drawText(a).paths, d = [], e = 0, f = c.length; f > e; e++) Array.prototype.push.apply(d, c[e].toShapes());
    return d;
}, function(a) {
    var b = function(a) {
        for (var b = a.length, c = 0, d = b - 1, e = 0; b > e; d = e++) c += a[d].x * a[e].y - a[e].x * a[d].y;
        return .5 * c;
    };
    return a.Triangulate = function(a, c) {
        var d = a.length;
        if (3 > d) return null;
        var e, f, g, h = [], i = [], j = [];
        if (0 < b(a)) for (f = 0; d > f; f++) i[f] = f; else for (f = 0; d > f; f++) i[f] = d - 1 - f;
        var k = 2 * d;
        for (f = d - 1; d > 2; ) {
            if (0 >= k--) {
                THREE.warn("THREE.FontUtils: Warning, unable to triangulate polygon! in Triangulate.process()");
                break;
            }
            e = f, e >= d && (e = 0), f = e + 1, f >= d && (f = 0), g = f + 1, g >= d && (g = 0);
            var l;
            a: {
                var m = l = void 0, n = void 0, o = void 0, p = void 0, q = void 0, r = void 0, s = void 0, t = void 0, m = a[i[e]].x, n = a[i[e]].y, o = a[i[f]].x, p = a[i[f]].y, q = a[i[g]].x, r = a[i[g]].y;
                if (1e-10 > (o - m) * (r - n) - (p - n) * (q - m)) l = !1; else {
                    var u = void 0, v = void 0, w = void 0, x = void 0, y = void 0, z = void 0, A = void 0, B = void 0, C = void 0, D = void 0, C = B = A = t = s = void 0, u = q - o, v = r - p, w = m - q, x = n - r, y = o - m, z = p - n;
                    for (l = 0; d > l; l++) if (s = a[i[l]].x, t = a[i[l]].y, !(s === m && t === n || s === o && t === p || s === q && t === r) && (A = s - m, 
                    B = t - n, C = s - o, D = t - p, s -= q, t -= r, C = u * D - v * C, A = y * B - z * A, 
                    B = w * t - x * s, C >= -1e-10 && B >= -1e-10 && A >= -1e-10)) {
                        l = !1;
                        break a;
                    }
                    l = !0;
                }
            }
            if (l) {
                for (h.push([ a[i[e]], a[i[f]], a[i[g]] ]), j.push([ i[e], i[f], i[g] ]), e = f, 
                g = f + 1; d > g; e++, g++) i[e] = i[g];
                d--, k = 2 * d;
            }
        }
        return c ? j : h;
    }, a.Triangulate.area = b, a;
}(THREE.FontUtils), self._typeface_js = {
    faces: THREE.FontUtils.faces,
    loadFace: THREE.FontUtils.loadFace
}, THREE.typeface_js = self._typeface_js, THREE.Audio = function(a) {
    THREE.Object3D.call(this), this.type = "Audio", this.context = a.context, this.source = this.context.createBufferSource(), 
    this.source.onended = this.onEnded.bind(this), this.gain = this.context.createGain(), 
    this.gain.connect(this.context.destination), this.panner = this.context.createPanner(), 
    this.panner.connect(this.gain), this.autoplay = !1, this.startTime = 0, this.isPlaying = !1;
}, THREE.Audio.prototype = Object.create(THREE.Object3D.prototype), THREE.Audio.prototype.constructor = THREE.Audio, 
THREE.Audio.prototype.load = function(a) {
    var b = this, c = new XMLHttpRequest();
    return c.open("GET", a, !0), c.responseType = "arraybuffer", c.onload = function() {
        b.context.decodeAudioData(this.response, function(a) {
            b.source.buffer = a, b.autoplay && b.play();
        });
    }, c.send(), this;
}, THREE.Audio.prototype.play = function() {
    if (!0 === this.isPlaying) THREE.warn("THREE.Audio: Audio is already playing."); else {
        var a = this.context.createBufferSource();
        a.buffer = this.source.buffer, a.loop = this.source.loop, a.onended = this.source.onended, 
        a.connect(this.panner), a.start(0, this.startTime), this.isPlaying = !0, this.source = a;
    }
}, THREE.Audio.prototype.pause = function() {
    this.source.stop(), this.startTime = this.context.currentTime;
}, THREE.Audio.prototype.stop = function() {
    this.source.stop(), this.startTime = 0;
}, THREE.Audio.prototype.onEnded = function() {
    this.isPlaying = !1;
}, THREE.Audio.prototype.setLoop = function(a) {
    this.source.loop = a;
}, THREE.Audio.prototype.setRefDistance = function(a) {
    this.panner.refDistance = a;
}, THREE.Audio.prototype.setRolloffFactor = function(a) {
    this.panner.rolloffFactor = a;
}, THREE.Audio.prototype.setVolume = function(a) {
    this.gain.gain.value = a;
}, THREE.Audio.prototype.updateMatrixWorld = function() {
    var a = new THREE.Vector3();
    return function(b) {
        THREE.Object3D.prototype.updateMatrixWorld.call(this, b), a.setFromMatrixPosition(this.matrixWorld), 
        this.panner.setPosition(a.x, a.y, a.z);
    };
}(), THREE.AudioListener = function() {
    THREE.Object3D.call(this), this.type = "AudioListener", this.context = new (window.AudioContext || window.webkitAudioContext)();
}, THREE.AudioListener.prototype = Object.create(THREE.Object3D.prototype), THREE.AudioListener.prototype.constructor = THREE.AudioListener, 
THREE.AudioListener.prototype.updateMatrixWorld = function() {
    var a = new THREE.Vector3(), b = new THREE.Quaternion(), c = new THREE.Vector3(), d = new THREE.Vector3(), e = new THREE.Vector3(), f = new THREE.Vector3();
    return function(g) {
        THREE.Object3D.prototype.updateMatrixWorld.call(this, g), g = this.context.listener;
        var h = this.up;
        this.matrixWorld.decompose(a, b, c), d.set(0, 0, -1).applyQuaternion(b), e.subVectors(a, f), 
        g.setPosition(a.x, a.y, a.z), g.setOrientation(d.x, d.y, d.z, h.x, h.y, h.z), g.setVelocity(e.x, e.y, e.z), 
        f.copy(a);
    };
}(), THREE.Curve = function() {}, THREE.Curve.prototype.getPoint = function() {
    return THREE.warn("THREE.Curve: Warning, getPoint() not implemented!"), null;
}, THREE.Curve.prototype.getPointAt = function(a) {
    return a = this.getUtoTmapping(a), this.getPoint(a);
}, THREE.Curve.prototype.getPoints = function(a) {
    a || (a = 5);
    var b, c = [];
    for (b = 0; a >= b; b++) c.push(this.getPoint(b / a));
    return c;
}, THREE.Curve.prototype.getSpacedPoints = function(a) {
    a || (a = 5);
    var b, c = [];
    for (b = 0; a >= b; b++) c.push(this.getPointAt(b / a));
    return c;
}, THREE.Curve.prototype.getLength = function() {
    var a = this.getLengths();
    return a[a.length - 1];
}, THREE.Curve.prototype.getLengths = function(a) {
    if (a || (a = this.__arcLengthDivisions ? this.__arcLengthDivisions : 200), this.cacheArcLengths && this.cacheArcLengths.length == a + 1 && !this.needsUpdate) return this.cacheArcLengths;
    this.needsUpdate = !1;
    var b, c, d = [], e = this.getPoint(0), f = 0;
    for (d.push(0), c = 1; a >= c; c++) b = this.getPoint(c / a), f += b.distanceTo(e), 
    d.push(f), e = b;
    return this.cacheArcLengths = d;
}, THREE.Curve.prototype.updateArcLengths = function() {
    this.needsUpdate = !0, this.getLengths();
}, THREE.Curve.prototype.getUtoTmapping = function(a, b) {
    var c, d = this.getLengths(), e = 0, f = d.length;
    c = b ? b : a * d[f - 1];
    for (var g, h = 0, i = f - 1; i >= h; ) if (e = Math.floor(h + (i - h) / 2), g = d[e] - c, 
    0 > g) h = e + 1; else {
        if (!(g > 0)) {
            i = e;
            break;
        }
        i = e - 1;
    }
    return e = i, d[e] == c ? e / (f - 1) : (h = d[e], d = (e + (c - h) / (d[e + 1] - h)) / (f - 1));
}, THREE.Curve.prototype.getTangent = function(a) {
    var b = a - 1e-4;
    return a += 1e-4, 0 > b && (b = 0), a > 1 && (a = 1), b = this.getPoint(b), this.getPoint(a).clone().sub(b).normalize();
}, THREE.Curve.prototype.getTangentAt = function(a) {
    return a = this.getUtoTmapping(a), this.getTangent(a);
}, THREE.Curve.Utils = {
    tangentQuadraticBezier: function(a, b, c, d) {
        return 2 * (1 - a) * (c - b) + 2 * a * (d - c);
    },
    tangentCubicBezier: function(a, b, c, d, e) {
        return -3 * b * (1 - a) * (1 - a) + 3 * c * (1 - a) * (1 - a) - 6 * a * c * (1 - a) + 6 * a * d * (1 - a) - 3 * a * a * d + 3 * a * a * e;
    },
    tangentSpline: function(a) {
        return 6 * a * a - 6 * a + (3 * a * a - 4 * a + 1) + (-6 * a * a + 6 * a) + (3 * a * a - 2 * a);
    },
    interpolate: function(a, b, c, d, e) {
        a = .5 * (c - a), d = .5 * (d - b);
        var f = e * e;
        return (2 * b - 2 * c + a + d) * e * f + (-3 * b + 3 * c - 2 * a - d) * f + a * e + b;
    }
}, THREE.Curve.create = function(a, b) {
    return a.prototype = Object.create(THREE.Curve.prototype), a.prototype.constructor = a, 
    a.prototype.getPoint = b, a;
}, THREE.CurvePath = function() {
    this.curves = [], this.bends = [], this.autoClose = !1;
}, THREE.CurvePath.prototype = Object.create(THREE.Curve.prototype), THREE.CurvePath.prototype.constructor = THREE.CurvePath, 
THREE.CurvePath.prototype.add = function(a) {
    this.curves.push(a);
}, THREE.CurvePath.prototype.checkConnection = function() {}, THREE.CurvePath.prototype.closePath = function() {
    var a = this.curves[0].getPoint(0), b = this.curves[this.curves.length - 1].getPoint(1);
    a.equals(b) || this.curves.push(new THREE.LineCurve(b, a));
}, THREE.CurvePath.prototype.getPoint = function(a) {
    var b = a * this.getLength(), c = this.getCurveLengths();
    for (a = 0; a < c.length; ) {
        if (c[a] >= b) return b = c[a] - b, a = this.curves[a], b = 1 - b / a.getLength(), 
        a.getPointAt(b);
        a++;
    }
    return null;
}, THREE.CurvePath.prototype.getLength = function() {
    var a = this.getCurveLengths();
    return a[a.length - 1];
}, THREE.CurvePath.prototype.getCurveLengths = function() {
    if (this.cacheLengths && this.cacheLengths.length == this.curves.length) return this.cacheLengths;
    var a, b = [], c = 0, d = this.curves.length;
    for (a = 0; d > a; a++) c += this.curves[a].getLength(), b.push(c);
    return this.cacheLengths = b;
}, THREE.CurvePath.prototype.getBoundingBox = function() {
    var a, b, c, d, e, f, g = this.getPoints();
    a = b = Number.NEGATIVE_INFINITY, d = e = Number.POSITIVE_INFINITY;
    var h, i, j, k, l = g[0] instanceof THREE.Vector3;
    for (k = l ? new THREE.Vector3() : new THREE.Vector2(), i = 0, j = g.length; j > i; i++) h = g[i], 
    h.x > a ? a = h.x : h.x < d && (d = h.x), h.y > b ? b = h.y : h.y < e && (e = h.y), 
    l && (h.z > c ? c = h.z : h.z < f && (f = h.z)), k.add(h);
    return g = {
        minX: d,
        minY: e,
        maxX: a,
        maxY: b
    }, l && (g.maxZ = c, g.minZ = f), g;
}, THREE.CurvePath.prototype.createPointsGeometry = function(a) {
    return a = this.getPoints(a, !0), this.createGeometry(a);
}, THREE.CurvePath.prototype.createSpacedPointsGeometry = function(a) {
    return a = this.getSpacedPoints(a, !0), this.createGeometry(a);
}, THREE.CurvePath.prototype.createGeometry = function(a) {
    for (var b = new THREE.Geometry(), c = 0; c < a.length; c++) b.vertices.push(new THREE.Vector3(a[c].x, a[c].y, a[c].z || 0));
    return b;
}, THREE.CurvePath.prototype.addWrapPath = function(a) {
    this.bends.push(a);
}, THREE.CurvePath.prototype.getTransformedPoints = function(a, b) {
    var c, d, e = this.getPoints(a);
    for (b || (b = this.bends), c = 0, d = b.length; d > c; c++) e = this.getWrapPoints(e, b[c]);
    return e;
}, THREE.CurvePath.prototype.getTransformedSpacedPoints = function(a, b) {
    var c, d, e = this.getSpacedPoints(a);
    for (b || (b = this.bends), c = 0, d = b.length; d > c; c++) e = this.getWrapPoints(e, b[c]);
    return e;
}, THREE.CurvePath.prototype.getWrapPoints = function(a, b) {
    var c, d, e, f, g, h, i = this.getBoundingBox();
    for (c = 0, d = a.length; d > c; c++) e = a[c], f = e.x, g = e.y, h = f / i.maxX, 
    h = b.getUtoTmapping(h, f), f = b.getPoint(h), h = b.getTangent(h), h.set(-h.y, h.x).multiplyScalar(g), 
    e.x = f.x + h.x, e.y = f.y + h.y;
    return a;
}, THREE.Gyroscope = function() {
    THREE.Object3D.call(this);
}, THREE.Gyroscope.prototype = Object.create(THREE.Object3D.prototype), THREE.Gyroscope.prototype.constructor = THREE.Gyroscope, 
THREE.Gyroscope.prototype.updateMatrixWorld = function() {
    var a = new THREE.Vector3(), b = new THREE.Quaternion(), c = new THREE.Vector3(), d = new THREE.Vector3(), e = new THREE.Quaternion(), f = new THREE.Vector3();
    return function(g) {
        this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || g) && (this.parent ? (this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), 
        this.matrixWorld.decompose(d, e, f), this.matrix.decompose(a, b, c), this.matrixWorld.compose(d, b, f)) : this.matrixWorld.copy(this.matrix), 
        this.matrixWorldNeedsUpdate = !1, g = !0);
        for (var h = 0, i = this.children.length; i > h; h++) this.children[h].updateMatrixWorld(g);
    };
}(), THREE.Path = function(a) {
    THREE.CurvePath.call(this), this.actions = [], a && this.fromPoints(a);
}, THREE.Path.prototype = Object.create(THREE.CurvePath.prototype), THREE.Path.prototype.constructor = THREE.Path, 
THREE.PathActions = {
    MOVE_TO: "moveTo",
    LINE_TO: "lineTo",
    QUADRATIC_CURVE_TO: "quadraticCurveTo",
    BEZIER_CURVE_TO: "bezierCurveTo",
    CSPLINE_THRU: "splineThru",
    ARC: "arc",
    ELLIPSE: "ellipse"
}, THREE.Path.prototype.fromPoints = function(a) {
    this.moveTo(a[0].x, a[0].y);
    for (var b = 1, c = a.length; c > b; b++) this.lineTo(a[b].x, a[b].y);
}, THREE.Path.prototype.moveTo = function() {
    var a = Array.prototype.slice.call(arguments);
    this.actions.push({
        action: THREE.PathActions.MOVE_TO,
        args: a
    });
}, THREE.Path.prototype.lineTo = function(a, b) {
    var c = Array.prototype.slice.call(arguments), d = this.actions[this.actions.length - 1].args, d = new THREE.LineCurve(new THREE.Vector2(d[d.length - 2], d[d.length - 1]), new THREE.Vector2(a, b));
    this.curves.push(d), this.actions.push({
        action: THREE.PathActions.LINE_TO,
        args: c
    });
}, THREE.Path.prototype.quadraticCurveTo = function(a, b, c, d) {
    var e = Array.prototype.slice.call(arguments), f = this.actions[this.actions.length - 1].args, f = new THREE.QuadraticBezierCurve(new THREE.Vector2(f[f.length - 2], f[f.length - 1]), new THREE.Vector2(a, b), new THREE.Vector2(c, d));
    this.curves.push(f), this.actions.push({
        action: THREE.PathActions.QUADRATIC_CURVE_TO,
        args: e
    });
}, THREE.Path.prototype.bezierCurveTo = function(a, b, c, d, e, f) {
    var g = Array.prototype.slice.call(arguments), h = this.actions[this.actions.length - 1].args, h = new THREE.CubicBezierCurve(new THREE.Vector2(h[h.length - 2], h[h.length - 1]), new THREE.Vector2(a, b), new THREE.Vector2(c, d), new THREE.Vector2(e, f));
    this.curves.push(h), this.actions.push({
        action: THREE.PathActions.BEZIER_CURVE_TO,
        args: g
    });
}, THREE.Path.prototype.splineThru = function(a) {
    var b = Array.prototype.slice.call(arguments), c = this.actions[this.actions.length - 1].args, c = [ new THREE.Vector2(c[c.length - 2], c[c.length - 1]) ];
    Array.prototype.push.apply(c, a), c = new THREE.SplineCurve(c), this.curves.push(c), 
    this.actions.push({
        action: THREE.PathActions.CSPLINE_THRU,
        args: b
    });
}, THREE.Path.prototype.arc = function(a, b, c, d, e, f) {
    var g = this.actions[this.actions.length - 1].args;
    this.absarc(a + g[g.length - 2], b + g[g.length - 1], c, d, e, f);
}, THREE.Path.prototype.absarc = function(a, b, c, d, e, f) {
    this.absellipse(a, b, c, c, d, e, f);
}, THREE.Path.prototype.ellipse = function(a, b, c, d, e, f, g) {
    var h = this.actions[this.actions.length - 1].args;
    this.absellipse(a + h[h.length - 2], b + h[h.length - 1], c, d, e, f, g);
}, THREE.Path.prototype.absellipse = function(a, b, c, d, e, f, g) {
    var h = Array.prototype.slice.call(arguments), i = new THREE.EllipseCurve(a, b, c, d, e, f, g);
    this.curves.push(i), i = i.getPoint(1), h.push(i.x), h.push(i.y), this.actions.push({
        action: THREE.PathActions.ELLIPSE,
        args: h
    });
}, THREE.Path.prototype.getSpacedPoints = function(a) {
    a || (a = 40);
    for (var b = [], c = 0; a > c; c++) b.push(this.getPoint(c / a));
    return b;
}, THREE.Path.prototype.getPoints = function(a, b) {
    if (this.useSpacedPoints) return console.log("tata"), this.getSpacedPoints(a, b);
    a = a || 12;
    var c, d, e, f, g, h, i, j, k, l, m, n, o, p = [];
    for (c = 0, d = this.actions.length; d > c; c++) switch (e = this.actions[c], f = e.action, 
    e = e.args, f) {
      case THREE.PathActions.MOVE_TO:
        p.push(new THREE.Vector2(e[0], e[1]));
        break;

      case THREE.PathActions.LINE_TO:
        p.push(new THREE.Vector2(e[0], e[1]));
        break;

      case THREE.PathActions.QUADRATIC_CURVE_TO:
        for (g = e[2], h = e[3], k = e[0], l = e[1], 0 < p.length ? (f = p[p.length - 1], 
        m = f.x, n = f.y) : (f = this.actions[c - 1].args, m = f[f.length - 2], n = f[f.length - 1]), 
        e = 1; a >= e; e++) o = e / a, f = THREE.Shape.Utils.b2(o, m, k, g), o = THREE.Shape.Utils.b2(o, n, l, h), 
        p.push(new THREE.Vector2(f, o));
        break;

      case THREE.PathActions.BEZIER_CURVE_TO:
        for (g = e[4], h = e[5], k = e[0], l = e[1], i = e[2], j = e[3], 0 < p.length ? (f = p[p.length - 1], 
        m = f.x, n = f.y) : (f = this.actions[c - 1].args, m = f[f.length - 2], n = f[f.length - 1]), 
        e = 1; a >= e; e++) o = e / a, f = THREE.Shape.Utils.b3(o, m, k, i, g), o = THREE.Shape.Utils.b3(o, n, l, j, h), 
        p.push(new THREE.Vector2(f, o));
        break;

      case THREE.PathActions.CSPLINE_THRU:
        for (f = this.actions[c - 1].args, o = [ new THREE.Vector2(f[f.length - 2], f[f.length - 1]) ], 
        f = a * e[0].length, o = o.concat(e[0]), o = new THREE.SplineCurve(o), e = 1; f >= e; e++) p.push(o.getPointAt(e / f));
        break;

      case THREE.PathActions.ARC:
        for (g = e[0], h = e[1], l = e[2], i = e[3], f = e[4], k = !!e[5], m = f - i, n = 2 * a, 
        e = 1; n >= e; e++) o = e / n, k || (o = 1 - o), o = i + o * m, f = g + l * Math.cos(o), 
        o = h + l * Math.sin(o), p.push(new THREE.Vector2(f, o));
        break;

      case THREE.PathActions.ELLIPSE:
        for (g = e[0], h = e[1], l = e[2], j = e[3], i = e[4], f = e[5], k = !!e[6], m = f - i, 
        n = 2 * a, e = 1; n >= e; e++) o = e / n, k || (o = 1 - o), o = i + o * m, f = g + l * Math.cos(o), 
        o = h + j * Math.sin(o), p.push(new THREE.Vector2(f, o));
    }
    return c = p[p.length - 1], 1e-10 > Math.abs(c.x - p[0].x) && 1e-10 > Math.abs(c.y - p[0].y) && p.splice(p.length - 1, 1), 
    b && p.push(p[0]), p;
}, THREE.Path.prototype.toShapes = function(a, b) {
    function c(a) {
        for (var b = [], c = 0, d = a.length; d > c; c++) {
            var e = a[c], f = new THREE.Shape();
            f.actions = e.actions, f.curves = e.curves, b.push(f);
        }
        return b;
    }
    function d(a, b) {
        for (var c = b.length, d = !1, e = c - 1, f = 0; c > f; e = f++) {
            var g = b[e], h = b[f], i = h.x - g.x, j = h.y - g.y;
            if (1e-10 < Math.abs(j)) {
                if (0 > j && (g = b[f], i = -i, h = b[e], j = -j), !(a.y < g.y || a.y > h.y)) if (a.y == g.y) {
                    if (a.x == g.x) return !0;
                } else {
                    if (e = j * (a.x - g.x) - i * (a.y - g.y), 0 == e) return !0;
                    0 > e || (d = !d);
                }
            } else if (a.y == g.y && (h.x <= a.x && a.x <= g.x || g.x <= a.x && a.x <= h.x)) return !0;
        }
        return d;
    }
    var e = function(a) {
        var b, c, d, e, f = [], g = new THREE.Path();
        for (b = 0, c = a.length; c > b; b++) d = a[b], e = d.args, d = d.action, d == THREE.PathActions.MOVE_TO && 0 != g.actions.length && (f.push(g), 
        g = new THREE.Path()), g[d].apply(g, e);
        return 0 != g.actions.length && f.push(g), f;
    }(this.actions);
    if (0 == e.length) return [];
    if (!0 === b) return c(e);
    var f, g, h, i = [];
    if (1 == e.length) return g = e[0], h = new THREE.Shape(), h.actions = g.actions, 
    h.curves = g.curves, i.push(h), i;
    var j = !THREE.Shape.Utils.isClockWise(e[0].getPoints()), j = a ? !j : j;
    h = [];
    var k, l = [], m = [], n = 0;
    l[n] = void 0, m[n] = [];
    var o, p;
    for (o = 0, p = e.length; p > o; o++) g = e[o], k = g.getPoints(), f = THREE.Shape.Utils.isClockWise(k), 
    (f = a ? !f : f) ? (!j && l[n] && n++, l[n] = {
        s: new THREE.Shape(),
        p: k
    }, l[n].s.actions = g.actions, l[n].s.curves = g.curves, j && n++, m[n] = []) : m[n].push({
        h: g,
        p: k[0]
    });
    if (!l[0]) return c(e);
    if (1 < l.length) {
        for (o = !1, p = [], g = 0, e = l.length; e > g; g++) h[g] = [];
        for (g = 0, e = l.length; e > g; g++) for (f = m[g], j = 0; j < f.length; j++) {
            n = f[j], k = !0;
            for (var q = 0; q < l.length; q++) d(n.p, l[q].p) && (g != q && p.push({
                froms: g,
                tos: q,
                hole: j
            }), k ? (k = !1, h[q].push(n)) : o = !0);
            k && h[g].push(n);
        }
        0 < p.length && (o || (m = h));
    }
    for (o = 0, p = l.length; p > o; o++) for (h = l[o].s, i.push(h), g = m[o], e = 0, 
    f = g.length; f > e; e++) h.holes.push(g[e].h);
    return i;
}, THREE.Shape = function() {
    THREE.Path.apply(this, arguments), this.holes = [];
}, THREE.Shape.prototype = Object.create(THREE.Path.prototype), THREE.Shape.prototype.constructor = THREE.Shape, 
THREE.Shape.prototype.extrude = function(a) {
    return new THREE.ExtrudeGeometry(this, a);
}, THREE.Shape.prototype.makeGeometry = function(a) {
    return new THREE.ShapeGeometry(this, a);
}, THREE.Shape.prototype.getPointsHoles = function(a) {
    var b, c = this.holes.length, d = [];
    for (b = 0; c > b; b++) d[b] = this.holes[b].getTransformedPoints(a, this.bends);
    return d;
}, THREE.Shape.prototype.getSpacedPointsHoles = function(a) {
    var b, c = this.holes.length, d = [];
    for (b = 0; c > b; b++) d[b] = this.holes[b].getTransformedSpacedPoints(a, this.bends);
    return d;
}, THREE.Shape.prototype.extractAllPoints = function(a) {
    return {
        shape: this.getTransformedPoints(a),
        holes: this.getPointsHoles(a)
    };
}, THREE.Shape.prototype.extractPoints = function(a) {
    return this.useSpacedPoints ? this.extractAllSpacedPoints(a) : this.extractAllPoints(a);
}, THREE.Shape.prototype.extractAllSpacedPoints = function(a) {
    return {
        shape: this.getTransformedSpacedPoints(a),
        holes: this.getSpacedPointsHoles(a)
    };
}, THREE.Shape.Utils = {
    triangulateShape: function(a, b) {
        function c(a, b, c) {
            return a.x != b.x ? a.x < b.x ? a.x <= c.x && c.x <= b.x : b.x <= c.x && c.x <= a.x : a.y < b.y ? a.y <= c.y && c.y <= b.y : b.y <= c.y && c.y <= a.y;
        }
        function d(a, b, d, e, f) {
            var g = b.x - a.x, h = b.y - a.y, i = e.x - d.x, j = e.y - d.y, k = a.x - d.x, l = a.y - d.y, m = h * i - g * j, n = h * k - g * l;
            if (1e-10 < Math.abs(m)) {
                if (m > 0) {
                    if (0 > n || n > m) return [];
                    if (i = j * k - i * l, 0 > i || i > m) return [];
                } else {
                    if (n > 0 || m > n) return [];
                    if (i = j * k - i * l, i > 0 || m > i) return [];
                }
                return 0 == i ? !f || 0 != n && n != m ? [ a ] : [] : i == m ? !f || 0 != n && n != m ? [ b ] : [] : 0 == n ? [ d ] : n == m ? [ e ] : (f = i / m, 
                [ {
                    x: a.x + f * g,
                    y: a.y + f * h
                } ]);
            }
            return 0 != n || j * k != i * l ? [] : (h = 0 == g && 0 == h, i = 0 == i && 0 == j, 
            h && i ? a.x != d.x || a.y != d.y ? [] : [ a ] : h ? c(d, e, a) ? [ a ] : [] : i ? c(a, b, d) ? [ d ] : [] : (0 != g ? (a.x < b.x ? (g = a, 
            i = a.x, h = b, a = b.x) : (g = b, i = b.x, h = a, a = a.x), d.x < e.x ? (b = d, 
            m = d.x, j = e, d = e.x) : (b = e, m = e.x, j = d, d = d.x)) : (a.y < b.y ? (g = a, 
            i = a.y, h = b, a = b.y) : (g = b, i = b.y, h = a, a = a.y), d.y < e.y ? (b = d, 
            m = d.y, j = e, d = e.y) : (b = e, m = e.y, j = d, d = d.y)), m >= i ? m > a ? [] : a == m ? f ? [] : [ b ] : d >= a ? [ b, h ] : [ b, j ] : i > d ? [] : i == d ? f ? [] : [ g ] : d >= a ? [ g, h ] : [ g, j ]));
        }
        function e(a, b, c, d) {
            var e = b.x - a.x, f = b.y - a.y;
            b = c.x - a.x, c = c.y - a.y;
            var g = d.x - a.x;
            return d = d.y - a.y, a = e * c - f * b, e = e * d - f * g, 1e-10 < Math.abs(a) ? (b = g * c - d * b, 
            a > 0 ? e >= 0 && b >= 0 : e >= 0 || b >= 0) : e > 0;
        }
        var f, g, h, i, j, k = {};
        for (h = a.concat(), f = 0, g = b.length; g > f; f++) Array.prototype.push.apply(h, b[f]);
        for (f = 0, g = h.length; g > f; f++) j = h[f].x + ":" + h[f].y, void 0 !== k[j] && THREE.warn("THREE.Shape: Duplicate point", j), 
        k[j] = f;
        f = function(a, b) {
            function c(a, b) {
                var c = q.length - 1, d = a - 1;
                0 > d && (d = c);
                var f = a + 1;
                return f > c && (f = 0), (c = e(q[a], q[d], q[f], h[b])) ? (c = h.length - 1, d = b - 1, 
                0 > d && (d = c), f = b + 1, f > c && (f = 0), (c = e(h[b], h[d], h[f], q[a])) ? !0 : !1) : !1;
            }
            function f(a, b) {
                var c, e;
                for (c = 0; c < q.length; c++) if (e = c + 1, e %= q.length, e = d(a, b, q[c], q[e], !0), 
                0 < e.length) return !0;
                return !1;
            }
            function g(a, c) {
                var e, f, g, h;
                for (e = 0; e < r.length; e++) for (f = b[r[e]], g = 0; g < f.length; g++) if (h = g + 1, 
                h %= f.length, h = d(a, c, f[g], f[h], !0), 0 < h.length) return !0;
                return !1;
            }
            var h, i, j, k, l, m, n, o, p, q = a.concat(), r = [], s = [], t = 0;
            for (i = b.length; i > t; t++) r.push(t);
            n = 0;
            for (var u = 2 * r.length; 0 < r.length; ) {
                if (u--, 0 > u) {
                    console.log("Infinite Loop! Holes left:" + r.length + ", Probably Hole outside Shape!");
                    break;
                }
                for (j = n; j < q.length; j++) {
                    for (k = q[j], i = -1, t = 0; t < r.length; t++) if (l = r[t], m = k.x + ":" + k.y + ":" + l, 
                    void 0 === s[m]) {
                        for (h = b[l], o = 0; o < h.length; o++) if (l = h[o], c(j, o) && !f(k, l) && !g(k, l)) {
                            i = o, r.splice(t, 1), n = q.slice(0, j + 1), l = q.slice(j), o = h.slice(i), p = h.slice(0, i + 1), 
                            q = n.concat(o).concat(p).concat(l), n = j;
                            break;
                        }
                        if (i >= 0) break;
                        s[m] = !0;
                    }
                    if (i >= 0) break;
                }
            }
            return q;
        }(a, b);
        var l = THREE.FontUtils.Triangulate(f, !1);
        for (f = 0, g = l.length; g > f; f++) for (i = l[f], h = 0; 3 > h; h++) j = i[h].x + ":" + i[h].y, 
        j = k[j], void 0 !== j && (i[h] = j);
        return l.concat();
    },
    isClockWise: function(a) {
        return 0 > THREE.FontUtils.Triangulate.area(a);
    },
    b2p0: function(a, b) {
        var c = 1 - a;
        return c * c * b;
    },
    b2p1: function(a, b) {
        return 2 * (1 - a) * a * b;
    },
    b2p2: function(a, b) {
        return a * a * b;
    },
    b2: function(a, b, c, d) {
        return this.b2p0(a, b) + this.b2p1(a, c) + this.b2p2(a, d);
    },
    b3p0: function(a, b) {
        var c = 1 - a;
        return c * c * c * b;
    },
    b3p1: function(a, b) {
        var c = 1 - a;
        return 3 * c * c * a * b;
    },
    b3p2: function(a, b) {
        return 3 * (1 - a) * a * a * b;
    },
    b3p3: function(a, b) {
        return a * a * a * b;
    },
    b3: function(a, b, c, d, e) {
        return this.b3p0(a, b) + this.b3p1(a, c) + this.b3p2(a, d) + this.b3p3(a, e);
    }
}, THREE.LineCurve = function(a, b) {
    this.v1 = a, this.v2 = b;
}, THREE.LineCurve.prototype = Object.create(THREE.Curve.prototype), THREE.LineCurve.prototype.constructor = THREE.LineCurve, 
THREE.LineCurve.prototype.getPoint = function(a) {
    var b = this.v2.clone().sub(this.v1);
    return b.multiplyScalar(a).add(this.v1), b;
}, THREE.LineCurve.prototype.getPointAt = function(a) {
    return this.getPoint(a);
}, THREE.LineCurve.prototype.getTangent = function() {
    return this.v2.clone().sub(this.v1).normalize();
}, THREE.QuadraticBezierCurve = function(a, b, c) {
    this.v0 = a, this.v1 = b, this.v2 = c;
}, THREE.QuadraticBezierCurve.prototype = Object.create(THREE.Curve.prototype), 
THREE.QuadraticBezierCurve.prototype.constructor = THREE.QuadraticBezierCurve, THREE.QuadraticBezierCurve.prototype.getPoint = function(a) {
    var b = new THREE.Vector2();
    return b.x = THREE.Shape.Utils.b2(a, this.v0.x, this.v1.x, this.v2.x), b.y = THREE.Shape.Utils.b2(a, this.v0.y, this.v1.y, this.v2.y), 
    b;
}, THREE.QuadraticBezierCurve.prototype.getTangent = function(a) {
    var b = new THREE.Vector2();
    return b.x = THREE.Curve.Utils.tangentQuadraticBezier(a, this.v0.x, this.v1.x, this.v2.x), 
    b.y = THREE.Curve.Utils.tangentQuadraticBezier(a, this.v0.y, this.v1.y, this.v2.y), 
    b.normalize();
}, THREE.CubicBezierCurve = function(a, b, c, d) {
    this.v0 = a, this.v1 = b, this.v2 = c, this.v3 = d;
}, THREE.CubicBezierCurve.prototype = Object.create(THREE.Curve.prototype), THREE.CubicBezierCurve.prototype.constructor = THREE.CubicBezierCurve, 
THREE.CubicBezierCurve.prototype.getPoint = function(a) {
    var b;
    return b = THREE.Shape.Utils.b3(a, this.v0.x, this.v1.x, this.v2.x, this.v3.x), 
    a = THREE.Shape.Utils.b3(a, this.v0.y, this.v1.y, this.v2.y, this.v3.y), new THREE.Vector2(b, a);
}, THREE.CubicBezierCurve.prototype.getTangent = function(a) {
    var b;
    return b = THREE.Curve.Utils.tangentCubicBezier(a, this.v0.x, this.v1.x, this.v2.x, this.v3.x), 
    a = THREE.Curve.Utils.tangentCubicBezier(a, this.v0.y, this.v1.y, this.v2.y, this.v3.y), 
    b = new THREE.Vector2(b, a), b.normalize(), b;
}, THREE.SplineCurve = function(a) {
    this.points = void 0 == a ? [] : a;
}, THREE.SplineCurve.prototype = Object.create(THREE.Curve.prototype), THREE.SplineCurve.prototype.constructor = THREE.SplineCurve, 
THREE.SplineCurve.prototype.getPoint = function(a) {
    var b = this.points;
    a *= b.length - 1;
    var c = Math.floor(a);
    a -= c;
    var d = b[0 == c ? c : c - 1], e = b[c], f = b[c > b.length - 2 ? b.length - 1 : c + 1], b = b[c > b.length - 3 ? b.length - 1 : c + 2], c = new THREE.Vector2();
    return c.x = THREE.Curve.Utils.interpolate(d.x, e.x, f.x, b.x, a), c.y = THREE.Curve.Utils.interpolate(d.y, e.y, f.y, b.y, a), 
    c;
}, THREE.EllipseCurve = function(a, b, c, d, e, f, g) {
    this.aX = a, this.aY = b, this.xRadius = c, this.yRadius = d, this.aStartAngle = e, 
    this.aEndAngle = f, this.aClockwise = g;
}, THREE.EllipseCurve.prototype = Object.create(THREE.Curve.prototype), THREE.EllipseCurve.prototype.constructor = THREE.EllipseCurve, 
THREE.EllipseCurve.prototype.getPoint = function(a) {
    var b = this.aEndAngle - this.aStartAngle;
    return 0 > b && (b += 2 * Math.PI), b > 2 * Math.PI && (b -= 2 * Math.PI), a = !0 === this.aClockwise ? this.aEndAngle + (1 - a) * (2 * Math.PI - b) : this.aStartAngle + a * b, 
    b = new THREE.Vector2(), b.x = this.aX + this.xRadius * Math.cos(a), b.y = this.aY + this.yRadius * Math.sin(a), 
    b;
}, THREE.ArcCurve = function(a, b, c, d, e, f) {
    THREE.EllipseCurve.call(this, a, b, c, c, d, e, f);
}, THREE.ArcCurve.prototype = Object.create(THREE.EllipseCurve.prototype), THREE.ArcCurve.prototype.constructor = THREE.ArcCurve, 
THREE.LineCurve3 = THREE.Curve.create(function(a, b) {
    this.v1 = a, this.v2 = b;
}, function(a) {
    var b = new THREE.Vector3();
    return b.subVectors(this.v2, this.v1), b.multiplyScalar(a), b.add(this.v1), b;
}), THREE.QuadraticBezierCurve3 = THREE.Curve.create(function(a, b, c) {
    this.v0 = a, this.v1 = b, this.v2 = c;
}, function(a) {
    var b = new THREE.Vector3();
    return b.x = THREE.Shape.Utils.b2(a, this.v0.x, this.v1.x, this.v2.x), b.y = THREE.Shape.Utils.b2(a, this.v0.y, this.v1.y, this.v2.y), 
    b.z = THREE.Shape.Utils.b2(a, this.v0.z, this.v1.z, this.v2.z), b;
}), THREE.CubicBezierCurve3 = THREE.Curve.create(function(a, b, c, d) {
    this.v0 = a, this.v1 = b, this.v2 = c, this.v3 = d;
}, function(a) {
    var b = new THREE.Vector3();
    return b.x = THREE.Shape.Utils.b3(a, this.v0.x, this.v1.x, this.v2.x, this.v3.x), 
    b.y = THREE.Shape.Utils.b3(a, this.v0.y, this.v1.y, this.v2.y, this.v3.y), b.z = THREE.Shape.Utils.b3(a, this.v0.z, this.v1.z, this.v2.z, this.v3.z), 
    b;
}), THREE.SplineCurve3 = THREE.Curve.create(function(a) {
    this.points = void 0 == a ? [] : a;
}, function(a) {
    var b = this.points;
    a *= b.length - 1;
    var c = Math.floor(a);
    a -= c;
    var d = b[0 == c ? c : c - 1], e = b[c], f = b[c > b.length - 2 ? b.length - 1 : c + 1], b = b[c > b.length - 3 ? b.length - 1 : c + 2], c = new THREE.Vector3();
    return c.x = THREE.Curve.Utils.interpolate(d.x, e.x, f.x, b.x, a), c.y = THREE.Curve.Utils.interpolate(d.y, e.y, f.y, b.y, a), 
    c.z = THREE.Curve.Utils.interpolate(d.z, e.z, f.z, b.z, a), c;
}), THREE.ClosedSplineCurve3 = THREE.Curve.create(function(a) {
    this.points = void 0 == a ? [] : a;
}, function(a) {
    var b = this.points;
    a *= b.length - 0;
    var c = Math.floor(a);
    a -= c;
    var c = c + (c > 0 ? 0 : (Math.floor(Math.abs(c) / b.length) + 1) * b.length), d = b[(c - 1) % b.length], e = b[c % b.length], f = b[(c + 1) % b.length], b = b[(c + 2) % b.length], c = new THREE.Vector3();
    return c.x = THREE.Curve.Utils.interpolate(d.x, e.x, f.x, b.x, a), c.y = THREE.Curve.Utils.interpolate(d.y, e.y, f.y, b.y, a), 
    c.z = THREE.Curve.Utils.interpolate(d.z, e.z, f.z, b.z, a), c;
}), THREE.AnimationHandler = {
    LINEAR: 0,
    CATMULLROM: 1,
    CATMULLROM_FORWARD: 2,
    add: function() {
        THREE.warn("THREE.AnimationHandler.add() has been deprecated.");
    },
    get: function() {
        THREE.warn("THREE.AnimationHandler.get() has been deprecated.");
    },
    remove: function() {
        THREE.warn("THREE.AnimationHandler.remove() has been deprecated.");
    },
    animations: [],
    init: function(a) {
        if (!0 === a.initialized) return a;
        for (var b = 0; b < a.hierarchy.length; b++) {
            for (var c = 0; c < a.hierarchy[b].keys.length; c++) if (0 > a.hierarchy[b].keys[c].time && (a.hierarchy[b].keys[c].time = 0), 
            void 0 !== a.hierarchy[b].keys[c].rot && !(a.hierarchy[b].keys[c].rot instanceof THREE.Quaternion)) {
                var d = a.hierarchy[b].keys[c].rot;
                a.hierarchy[b].keys[c].rot = new THREE.Quaternion().fromArray(d);
            }
            if (a.hierarchy[b].keys.length && void 0 !== a.hierarchy[b].keys[0].morphTargets) {
                for (d = {}, c = 0; c < a.hierarchy[b].keys.length; c++) for (var e = 0; e < a.hierarchy[b].keys[c].morphTargets.length; e++) {
                    var f = a.hierarchy[b].keys[c].morphTargets[e];
                    d[f] = -1;
                }
                for (a.hierarchy[b].usedMorphTargets = d, c = 0; c < a.hierarchy[b].keys.length; c++) {
                    var g = {};
                    for (f in d) {
                        for (e = 0; e < a.hierarchy[b].keys[c].morphTargets.length; e++) if (a.hierarchy[b].keys[c].morphTargets[e] === f) {
                            g[f] = a.hierarchy[b].keys[c].morphTargetsInfluences[e];
                            break;
                        }
                        e === a.hierarchy[b].keys[c].morphTargets.length && (g[f] = 0);
                    }
                    a.hierarchy[b].keys[c].morphTargetsInfluences = g;
                }
            }
            for (c = 1; c < a.hierarchy[b].keys.length; c++) a.hierarchy[b].keys[c].time === a.hierarchy[b].keys[c - 1].time && (a.hierarchy[b].keys.splice(c, 1), 
            c--);
            for (c = 0; c < a.hierarchy[b].keys.length; c++) a.hierarchy[b].keys[c].index = c;
        }
        return a.initialized = !0, a;
    },
    parse: function(a) {
        var b = function(a, c) {
            c.push(a);
            for (var d = 0; d < a.children.length; d++) b(a.children[d], c);
        }, c = [];
        if (a instanceof THREE.SkinnedMesh) for (var d = 0; d < a.skeleton.bones.length; d++) c.push(a.skeleton.bones[d]); else b(a, c);
        return c;
    },
    play: function(a) {
        -1 === this.animations.indexOf(a) && this.animations.push(a);
    },
    stop: function(a) {
        a = this.animations.indexOf(a), -1 !== a && this.animations.splice(a, 1);
    },
    update: function(a) {
        for (var b = 0; b < this.animations.length; b++) this.animations[b].resetBlendWeights();
        for (b = 0; b < this.animations.length; b++) this.animations[b].update(a);
    }
}, THREE.Animation = function(a, b) {
    this.root = a, this.data = THREE.AnimationHandler.init(b), this.hierarchy = THREE.AnimationHandler.parse(a), 
    this.currentTime = 0, this.timeScale = 1, this.isPlaying = !1, this.loop = !0, this.weight = 0, 
    this.interpolationType = THREE.AnimationHandler.LINEAR;
}, THREE.Animation.prototype = {
    constructor: THREE.Animation,
    keyTypes: [ "pos", "rot", "scl" ],
    play: function(a, b) {
        this.currentTime = void 0 !== a ? a : 0, this.weight = void 0 !== b ? b : 1, this.isPlaying = !0, 
        this.reset(), THREE.AnimationHandler.play(this);
    },
    stop: function() {
        this.isPlaying = !1, THREE.AnimationHandler.stop(this);
    },
    reset: function() {
        for (var a = 0, b = this.hierarchy.length; b > a; a++) {
            var c = this.hierarchy[a];
            void 0 === c.animationCache && (c.animationCache = {
                animations: {},
                blending: {
                    positionWeight: 0,
                    quaternionWeight: 0,
                    scaleWeight: 0
                }
            });
            var d = this.data.name, e = c.animationCache.animations, f = e[d];
            for (void 0 === f && (f = {
                prevKey: {
                    pos: 0,
                    rot: 0,
                    scl: 0
                },
                nextKey: {
                    pos: 0,
                    rot: 0,
                    scl: 0
                },
                originalMatrix: c.matrix
            }, e[d] = f), c = 0; 3 > c; c++) {
                for (var d = this.keyTypes[c], e = this.data.hierarchy[a].keys[0], g = this.getNextKeyWith(d, a, 1); g.time < this.currentTime && g.index > e.index; ) e = g, 
                g = this.getNextKeyWith(d, a, g.index + 1);
                f.prevKey[d] = e, f.nextKey[d] = g;
            }
        }
    },
    resetBlendWeights: function() {
        for (var a = 0, b = this.hierarchy.length; b > a; a++) {
            var c = this.hierarchy[a].animationCache;
            void 0 !== c && (c = c.blending, c.positionWeight = 0, c.quaternionWeight = 0, c.scaleWeight = 0);
        }
    },
    update: function() {
        var a = [], b = new THREE.Vector3(), c = new THREE.Vector3(), d = new THREE.Quaternion(), e = function(a, b) {
            var c, d, e, g, h, i, j = [], k = [];
            return c = (a.length - 1) * b, d = Math.floor(c), c -= d, j[0] = 0 === d ? d : d - 1, 
            j[1] = d, j[2] = d > a.length - 2 ? d : d + 1, j[3] = d > a.length - 3 ? d : d + 2, 
            d = a[j[0]], g = a[j[1]], h = a[j[2]], i = a[j[3]], j = c * c, e = c * j, k[0] = f(d[0], g[0], h[0], i[0], c, j, e), 
            k[1] = f(d[1], g[1], h[1], i[1], c, j, e), k[2] = f(d[2], g[2], h[2], i[2], c, j, e), 
            k;
        }, f = function(a, b, c, d, e, f, g) {
            return a = .5 * (c - a), d = .5 * (d - b), (2 * (b - c) + a + d) * g + (-3 * (b - c) - 2 * a - d) * f + a * e + b;
        };
        return function(f) {
            if (!1 !== this.isPlaying && (this.currentTime += f * this.timeScale, 0 !== this.weight)) {
                f = this.data.length, (this.currentTime > f || 0 > this.currentTime) && (this.loop ? (this.currentTime %= f, 
                0 > this.currentTime && (this.currentTime += f), this.reset()) : this.stop()), f = 0;
                for (var g = this.hierarchy.length; g > f; f++) for (var h = this.hierarchy[f], i = h.animationCache.animations[this.data.name], j = h.animationCache.blending, k = 0; 3 > k; k++) {
                    var l = this.keyTypes[k], m = i.prevKey[l], n = i.nextKey[l];
                    if (0 < this.timeScale && n.time <= this.currentTime || 0 > this.timeScale && m.time >= this.currentTime) {
                        for (m = this.data.hierarchy[f].keys[0], n = this.getNextKeyWith(l, f, 1); n.time < this.currentTime && n.index > m.index; ) m = n, 
                        n = this.getNextKeyWith(l, f, n.index + 1);
                        i.prevKey[l] = m, i.nextKey[l] = n;
                    }
                    var o = (this.currentTime - m.time) / (n.time - m.time), p = m[l], q = n[l];
                    0 > o && (o = 0), o > 1 && (o = 1), "pos" === l ? this.interpolationType === THREE.AnimationHandler.LINEAR ? (c.x = p[0] + (q[0] - p[0]) * o, 
                    c.y = p[1] + (q[1] - p[1]) * o, c.z = p[2] + (q[2] - p[2]) * o, m = this.weight / (this.weight + j.positionWeight), 
                    h.position.lerp(c, m), j.positionWeight += this.weight) : (this.interpolationType === THREE.AnimationHandler.CATMULLROM || this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD) && (a[0] = this.getPrevKeyWith("pos", f, m.index - 1).pos, 
                    a[1] = p, a[2] = q, a[3] = this.getNextKeyWith("pos", f, n.index + 1).pos, o = .33 * o + .33, 
                    n = e(a, o), m = this.weight / (this.weight + j.positionWeight), j.positionWeight += this.weight, 
                    l = h.position, l.x += (n[0] - l.x) * m, l.y += (n[1] - l.y) * m, l.z += (n[2] - l.z) * m, 
                    this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD && (o = e(a, 1.01 * o), 
                    b.set(o[0], o[1], o[2]), b.sub(l), b.y = 0, b.normalize(), o = Math.atan2(b.x, b.z), 
                    h.rotation.set(0, o, 0))) : "rot" === l ? (THREE.Quaternion.slerp(p, q, d, o), 0 === j.quaternionWeight ? (h.quaternion.copy(d), 
                    j.quaternionWeight = this.weight) : (m = this.weight / (this.weight + j.quaternionWeight), 
                    THREE.Quaternion.slerp(h.quaternion, d, h.quaternion, m), j.quaternionWeight += this.weight)) : "scl" === l && (c.x = p[0] + (q[0] - p[0]) * o, 
                    c.y = p[1] + (q[1] - p[1]) * o, c.z = p[2] + (q[2] - p[2]) * o, m = this.weight / (this.weight + j.scaleWeight), 
                    h.scale.lerp(c, m), j.scaleWeight += this.weight);
                }
                return !0;
            }
        };
    }(),
    getNextKeyWith: function(a, b, c) {
        var d = this.data.hierarchy[b].keys;
        for (c = this.interpolationType === THREE.AnimationHandler.CATMULLROM || this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ? c < d.length - 1 ? c : d.length - 1 : c % d.length; c < d.length; c++) if (void 0 !== d[c][a]) return d[c];
        return this.data.hierarchy[b].keys[0];
    },
    getPrevKeyWith: function(a, b, c) {
        var d = this.data.hierarchy[b].keys;
        for (c = this.interpolationType === THREE.AnimationHandler.CATMULLROM || this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ? c > 0 ? c : 0 : c >= 0 ? c : c + d.length; c >= 0; c--) if (void 0 !== d[c][a]) return d[c];
        return this.data.hierarchy[b].keys[d.length - 1];
    }
}, THREE.KeyFrameAnimation = function(a) {
    this.root = a.node, this.data = THREE.AnimationHandler.init(a), this.hierarchy = THREE.AnimationHandler.parse(this.root), 
    this.currentTime = 0, this.timeScale = .001, this.isPlaying = !1, this.loop = this.isPaused = !0, 
    a = 0;
    for (var b = this.hierarchy.length; b > a; a++) {
        var c = this.data.hierarchy[a].sids, d = this.hierarchy[a];
        if (this.data.hierarchy[a].keys.length && c) {
            for (var e = 0; e < c.length; e++) {
                var f = c[e], g = this.getNextKeyWith(f, a, 0);
                g && g.apply(f);
            }
            d.matrixAutoUpdate = !1, this.data.hierarchy[a].node.updateMatrix(), d.matrixWorldNeedsUpdate = !0;
        }
    }
}, THREE.KeyFrameAnimation.prototype = {
    constructor: THREE.KeyFrameAnimation,
    play: function(a) {
        if (this.currentTime = void 0 !== a ? a : 0, !1 === this.isPlaying) {
            this.isPlaying = !0;
            var b, c, d = this.hierarchy.length;
            for (a = 0; d > a; a++) b = this.hierarchy[a], c = this.data.hierarchy[a], void 0 === c.animationCache && (c.animationCache = {}, 
            c.animationCache.prevKey = null, c.animationCache.nextKey = null, c.animationCache.originalMatrix = b.matrix), 
            b = this.data.hierarchy[a].keys, b.length && (c.animationCache.prevKey = b[0], c.animationCache.nextKey = b[1], 
            this.startTime = Math.min(b[0].time, this.startTime), this.endTime = Math.max(b[b.length - 1].time, this.endTime));
            this.update(0);
        }
        this.isPaused = !1, THREE.AnimationHandler.play(this);
    },
    stop: function() {
        this.isPaused = this.isPlaying = !1, THREE.AnimationHandler.stop(this);
        for (var a = 0; a < this.data.hierarchy.length; a++) {
            var b = this.hierarchy[a], c = this.data.hierarchy[a];
            if (void 0 !== c.animationCache) {
                var d = c.animationCache.originalMatrix;
                d.copy(b.matrix), b.matrix = d, delete c.animationCache;
            }
        }
    },
    update: function(a) {
        if (!1 !== this.isPlaying) {
            this.currentTime += a * this.timeScale, a = this.data.length, !0 === this.loop && this.currentTime > a && (this.currentTime %= a), 
            this.currentTime = Math.min(this.currentTime, a), a = 0;
            for (var b = this.hierarchy.length; b > a; a++) {
                var c = this.hierarchy[a], d = this.data.hierarchy[a], e = d.keys, d = d.animationCache;
                if (e.length) {
                    var f = d.prevKey, g = d.nextKey;
                    if (g.time <= this.currentTime) {
                        for (;g.time < this.currentTime && g.index > f.index; ) f = g, g = e[f.index + 1];
                        d.prevKey = f, d.nextKey = g;
                    }
                    g.time >= this.currentTime ? f.interpolate(g, this.currentTime) : f.interpolate(g, g.time), 
                    this.data.hierarchy[a].node.updateMatrix(), c.matrixWorldNeedsUpdate = !0;
                }
            }
        }
    },
    getNextKeyWith: function(a, b, c) {
        for (b = this.data.hierarchy[b].keys, c %= b.length; c < b.length; c++) if (b[c].hasTarget(a)) return b[c];
        return b[0];
    },
    getPrevKeyWith: function(a, b, c) {
        for (b = this.data.hierarchy[b].keys, c = c >= 0 ? c : c + b.length; c >= 0; c--) if (b[c].hasTarget(a)) return b[c];
        return b[b.length - 1];
    }
}, THREE.MorphAnimation = function(a) {
    this.mesh = a, this.frames = a.morphTargetInfluences.length, this.currentTime = 0, 
    this.duration = 1e3, this.loop = !0, this.currentFrame = this.lastFrame = 0, this.isPlaying = !1;
}, THREE.MorphAnimation.prototype = {
    constructor: THREE.MorphAnimation,
    play: function() {
        this.isPlaying = !0;
    },
    pause: function() {
        this.isPlaying = !1;
    },
    update: function(a) {
        if (!1 !== this.isPlaying) {
            this.currentTime += a, !0 === this.loop && this.currentTime > this.duration && (this.currentTime %= this.duration), 
            this.currentTime = Math.min(this.currentTime, this.duration), a = this.duration / this.frames;
            var b = Math.floor(this.currentTime / a), c = this.mesh.morphTargetInfluences;
            b != this.currentFrame && (c[this.lastFrame] = 0, c[this.currentFrame] = 1, c[b] = 0, 
            this.lastFrame = this.currentFrame, this.currentFrame = b), c[b] = this.currentTime % a / a, 
            c[this.lastFrame] = 1 - c[b];
        }
    }
}, THREE.BoxGeometry = function(a, b, c, d, e, f) {
    function g(a, b, c, d, e, f, g, i) {
        var j, k = h.widthSegments, l = h.heightSegments, m = e / 2, n = f / 2, o = h.vertices.length;
        "x" === a && "y" === b || "y" === a && "x" === b ? j = "z" : "x" === a && "z" === b || "z" === a && "x" === b ? (j = "y", 
        l = h.depthSegments) : ("z" === a && "y" === b || "y" === a && "z" === b) && (j = "x", 
        k = h.depthSegments);
        var p = k + 1, q = l + 1, r = e / k, s = f / l, t = new THREE.Vector3();
        for (t[j] = g > 0 ? 1 : -1, e = 0; q > e; e++) for (f = 0; p > f; f++) {
            var u = new THREE.Vector3();
            u[a] = (f * r - m) * c, u[b] = (e * s - n) * d, u[j] = g, h.vertices.push(u);
        }
        for (e = 0; l > e; e++) for (f = 0; k > f; f++) n = f + p * e, a = f + p * (e + 1), 
        b = f + 1 + p * (e + 1), c = f + 1 + p * e, d = new THREE.Vector2(f / k, 1 - e / l), 
        g = new THREE.Vector2(f / k, 1 - (e + 1) / l), j = new THREE.Vector2((f + 1) / k, 1 - (e + 1) / l), 
        m = new THREE.Vector2((f + 1) / k, 1 - e / l), n = new THREE.Face3(n + o, a + o, c + o), 
        n.normal.copy(t), n.vertexNormals.push(t.clone(), t.clone(), t.clone()), n.materialIndex = i, 
        h.faces.push(n), h.faceVertexUvs[0].push([ d, g, m ]), n = new THREE.Face3(a + o, b + o, c + o), 
        n.normal.copy(t), n.vertexNormals.push(t.clone(), t.clone(), t.clone()), n.materialIndex = i, 
        h.faces.push(n), h.faceVertexUvs[0].push([ g.clone(), j, m.clone() ]);
    }
    THREE.Geometry.call(this), this.type = "BoxGeometry", this.parameters = {
        width: a,
        height: b,
        depth: c,
        widthSegments: d,
        heightSegments: e,
        depthSegments: f
    }, this.widthSegments = d || 1, this.heightSegments = e || 1, this.depthSegments = f || 1;
    var h = this;
    d = a / 2, e = b / 2, f = c / 2, g("z", "y", -1, -1, c, b, d, 0), g("z", "y", 1, -1, c, b, -d, 1), 
    g("x", "z", 1, 1, a, c, e, 2), g("x", "z", 1, -1, a, c, -e, 3), g("x", "y", 1, -1, a, b, f, 4), 
    g("x", "y", -1, -1, a, b, -f, 5), this.mergeVertices();
}, THREE.BoxGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.BoxGeometry.prototype.constructor = THREE.BoxGeometry, 
THREE.CircleGeometry = function(a, b, c, d) {
    THREE.Geometry.call(this), this.type = "CircleGeometry", this.parameters = {
        radius: a,
        segments: b,
        thetaStart: c,
        thetaLength: d
    }, a = a || 50, b = void 0 !== b ? Math.max(3, b) : 8, c = void 0 !== c ? c : 0, 
    d = void 0 !== d ? d : 2 * Math.PI;
    var e, f = [];
    e = new THREE.Vector3();
    var g = new THREE.Vector2(.5, .5);
    for (this.vertices.push(e), f.push(g), e = 0; b >= e; e++) {
        var h = new THREE.Vector3(), i = c + e / b * d;
        h.x = a * Math.cos(i), h.y = a * Math.sin(i), this.vertices.push(h), f.push(new THREE.Vector2((h.x / a + 1) / 2, (h.y / a + 1) / 2));
    }
    for (c = new THREE.Vector3(0, 0, 1), e = 1; b >= e; e++) this.faces.push(new THREE.Face3(e, e + 1, 0, [ c.clone(), c.clone(), c.clone() ])), 
    this.faceVertexUvs[0].push([ f[e].clone(), f[e + 1].clone(), g.clone() ]);
    this.computeFaceNormals(), this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), a);
}, THREE.CircleGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.CircleGeometry.prototype.constructor = THREE.CircleGeometry, 
THREE.CubeGeometry = function(a, b, c, d, e, f) {
    return THREE.warn("THREE.CubeGeometry has been renamed to THREE.BoxGeometry."), 
    new THREE.BoxGeometry(a, b, c, d, e, f);
}, THREE.CylinderGeometry = function(a, b, c, d, e, f, g, h) {
    THREE.Geometry.call(this), this.type = "CylinderGeometry", this.parameters = {
        radiusTop: a,
        radiusBottom: b,
        height: c,
        radialSegments: d,
        heightSegments: e,
        openEnded: f,
        thetaStart: g,
        thetaLength: h
    }, a = void 0 !== a ? a : 20, b = void 0 !== b ? b : 20, c = void 0 !== c ? c : 100, 
    d = d || 8, e = e || 1, f = void 0 !== f ? f : !1, g = void 0 !== g ? g : 0, h = void 0 !== h ? h : 2 * Math.PI;
    var i, j, k = c / 2, l = [], m = [];
    for (j = 0; e >= j; j++) {
        var n = [], o = [], p = j / e, q = p * (b - a) + a;
        for (i = 0; d >= i; i++) {
            var r = i / d, s = new THREE.Vector3();
            s.x = q * Math.sin(r * h + g), s.y = -p * c + k, s.z = q * Math.cos(r * h + g), 
            this.vertices.push(s), n.push(this.vertices.length - 1), o.push(new THREE.Vector2(r, 1 - p));
        }
        l.push(n), m.push(o);
    }
    for (c = (b - a) / c, i = 0; d > i; i++) for (0 !== a ? (g = this.vertices[l[0][i]].clone(), 
    h = this.vertices[l[0][i + 1]].clone()) : (g = this.vertices[l[1][i]].clone(), h = this.vertices[l[1][i + 1]].clone()), 
    g.setY(Math.sqrt(g.x * g.x + g.z * g.z) * c).normalize(), h.setY(Math.sqrt(h.x * h.x + h.z * h.z) * c).normalize(), 
    j = 0; e > j; j++) {
        var n = l[j][i], o = l[j + 1][i], p = l[j + 1][i + 1], q = l[j][i + 1], r = g.clone(), s = g.clone(), t = h.clone(), u = h.clone(), v = m[j][i].clone(), w = m[j + 1][i].clone(), x = m[j + 1][i + 1].clone(), y = m[j][i + 1].clone();
        this.faces.push(new THREE.Face3(n, o, q, [ r, s, u ])), this.faceVertexUvs[0].push([ v, w, y ]), 
        this.faces.push(new THREE.Face3(o, p, q, [ s.clone(), t, u.clone() ])), this.faceVertexUvs[0].push([ w.clone(), x, y.clone() ]);
    }
    if (!1 === f && a > 0) for (this.vertices.push(new THREE.Vector3(0, k, 0)), i = 0; d > i; i++) n = l[0][i], 
    o = l[0][i + 1], p = this.vertices.length - 1, r = new THREE.Vector3(0, 1, 0), s = new THREE.Vector3(0, 1, 0), 
    t = new THREE.Vector3(0, 1, 0), v = m[0][i].clone(), w = m[0][i + 1].clone(), x = new THREE.Vector2(w.x, 0), 
    this.faces.push(new THREE.Face3(n, o, p, [ r, s, t ])), this.faceVertexUvs[0].push([ v, w, x ]);
    if (!1 === f && b > 0) for (this.vertices.push(new THREE.Vector3(0, -k, 0)), i = 0; d > i; i++) n = l[e][i + 1], 
    o = l[e][i], p = this.vertices.length - 1, r = new THREE.Vector3(0, -1, 0), s = new THREE.Vector3(0, -1, 0), 
    t = new THREE.Vector3(0, -1, 0), v = m[e][i + 1].clone(), w = m[e][i].clone(), x = new THREE.Vector2(w.x, 1), 
    this.faces.push(new THREE.Face3(n, o, p, [ r, s, t ])), this.faceVertexUvs[0].push([ v, w, x ]);
    this.computeFaceNormals();
}, THREE.CylinderGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.CylinderGeometry.prototype.constructor = THREE.CylinderGeometry, 
THREE.ExtrudeGeometry = function(a, b) {
    "undefined" != typeof a && (THREE.Geometry.call(this), this.type = "ExtrudeGeometry", 
    a = a instanceof Array ? a : [ a ], this.addShapeList(a, b), this.computeFaceNormals());
}, THREE.ExtrudeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.ExtrudeGeometry.prototype.constructor = THREE.ExtrudeGeometry, 
THREE.ExtrudeGeometry.prototype.addShapeList = function(a, b) {
    for (var c = a.length, d = 0; c > d; d++) this.addShape(a[d], b);
}, THREE.ExtrudeGeometry.prototype.addShape = function(a, b) {
    function c(a, b, c) {
        return b || THREE.error("THREE.ExtrudeGeometry: vec does not exist"), b.clone().multiplyScalar(c).add(a);
    }
    function d(a, b, c) {
        var d = 1, d = a.x - b.x, e = a.y - b.y, f = c.x - a.x, g = c.y - a.y, h = d * d + e * e;
        if (1e-10 < Math.abs(d * g - e * f)) {
            var i = Math.sqrt(h), j = Math.sqrt(f * f + g * g), h = b.x - e / i;
            if (b = b.y + d / i, f = ((c.x - g / j - h) * g - (c.y + f / j - b) * f) / (d * g - e * f), 
            c = h + d * f - a.x, a = b + e * f - a.y, d = c * c + a * a, 2 >= d) return new THREE.Vector2(c, a);
            d = Math.sqrt(d / 2);
        } else a = !1, d > 1e-10 ? f > 1e-10 && (a = !0) : -1e-10 > d ? -1e-10 > f && (a = !0) : Math.sign(e) == Math.sign(g) && (a = !0), 
        a ? (c = -e, a = d, d = Math.sqrt(h)) : (c = d, a = e, d = Math.sqrt(h / 2));
        return new THREE.Vector2(c / d, a / d);
    }
    function e(a, b) {
        var c, d;
        for (O = a.length; 0 <= --O; ) {
            c = O, d = O - 1, 0 > d && (d = a.length - 1);
            for (var e = 0, f = s + 2 * p, e = 0; f > e; e++) {
                var g = M * e, h = M * (e + 1), i = b + c + g, g = b + d + g, j = b + d + h, h = b + c + h, i = i + C, g = g + C, j = j + C, h = h + C;
                B.faces.push(new THREE.Face3(i, g, h, null, null, w)), B.faces.push(new THREE.Face3(g, j, h, null, null, w)), 
                i = x.generateSideWallUV(B, i, g, j, h), B.faceVertexUvs[0].push([ i[0], i[1], i[3] ]), 
                B.faceVertexUvs[0].push([ i[1], i[2], i[3] ]);
            }
        }
    }
    function f(a, b, c) {
        B.vertices.push(new THREE.Vector3(a, b, c));
    }
    function g(a, b, c) {
        a += C, b += C, c += C, B.faces.push(new THREE.Face3(a, b, c, null, null, v)), a = x.generateTopUV(B, a, b, c), 
        B.faceVertexUvs[0].push(a);
    }
    var h, i, j, k, l, m = void 0 !== b.amount ? b.amount : 100, n = void 0 !== b.bevelThickness ? b.bevelThickness : 6, o = void 0 !== b.bevelSize ? b.bevelSize : n - 2, p = void 0 !== b.bevelSegments ? b.bevelSegments : 3, q = void 0 !== b.bevelEnabled ? b.bevelEnabled : !0, r = void 0 !== b.curveSegments ? b.curveSegments : 12, s = void 0 !== b.steps ? b.steps : 1, t = b.extrudePath, u = !1, v = b.material, w = b.extrudeMaterial, x = void 0 !== b.UVGenerator ? b.UVGenerator : THREE.ExtrudeGeometry.WorldUVGenerator;
    t && (h = t.getSpacedPoints(s), u = !0, q = !1, i = void 0 !== b.frames ? b.frames : new THREE.TubeGeometry.FrenetFrames(t, s, !1), 
    j = new THREE.Vector3(), k = new THREE.Vector3(), l = new THREE.Vector3()), q || (o = n = p = 0);
    var y, z, A, B = this, C = this.vertices.length, t = a.extractPoints(r), r = t.shape, D = t.holes;
    if (t = !THREE.Shape.Utils.isClockWise(r)) {
        for (r = r.reverse(), z = 0, A = D.length; A > z; z++) y = D[z], THREE.Shape.Utils.isClockWise(y) && (D[z] = y.reverse());
        t = !1;
    }
    var E = THREE.Shape.Utils.triangulateShape(r, D), F = r;
    for (z = 0, A = D.length; A > z; z++) y = D[z], r = r.concat(y);
    var G, H, I, J, K, L, M = r.length, N = E.length, t = [], O = 0;
    for (I = F.length, G = I - 1, H = O + 1; I > O; O++, G++, H++) G === I && (G = 0), 
    H === I && (H = 0), t[O] = d(F[O], F[G], F[H]);
    var P, Q = [], R = t.concat();
    for (z = 0, A = D.length; A > z; z++) {
        for (y = D[z], P = [], O = 0, I = y.length, G = I - 1, H = O + 1; I > O; O++, G++, 
        H++) G === I && (G = 0), H === I && (H = 0), P[O] = d(y[O], y[G], y[H]);
        Q.push(P), R = R.concat(P);
    }
    for (G = 0; p > G; G++) {
        for (I = G / p, J = n * (1 - I), H = o * Math.sin(I * Math.PI / 2), O = 0, I = F.length; I > O; O++) K = c(F[O], t[O], H), 
        f(K.x, K.y, -J);
        for (z = 0, A = D.length; A > z; z++) for (y = D[z], P = Q[z], O = 0, I = y.length; I > O; O++) K = c(y[O], P[O], H), 
        f(K.x, K.y, -J);
    }
    for (H = o, O = 0; M > O; O++) K = q ? c(r[O], R[O], H) : r[O], u ? (k.copy(i.normals[0]).multiplyScalar(K.x), 
    j.copy(i.binormals[0]).multiplyScalar(K.y), l.copy(h[0]).add(k).add(j), f(l.x, l.y, l.z)) : f(K.x, K.y, 0);
    for (I = 1; s >= I; I++) for (O = 0; M > O; O++) K = q ? c(r[O], R[O], H) : r[O], 
    u ? (k.copy(i.normals[I]).multiplyScalar(K.x), j.copy(i.binormals[I]).multiplyScalar(K.y), 
    l.copy(h[I]).add(k).add(j), f(l.x, l.y, l.z)) : f(K.x, K.y, m / s * I);
    for (G = p - 1; G >= 0; G--) {
        for (I = G / p, J = n * (1 - I), H = o * Math.sin(I * Math.PI / 2), O = 0, I = F.length; I > O; O++) K = c(F[O], t[O], H), 
        f(K.x, K.y, m + J);
        for (z = 0, A = D.length; A > z; z++) for (y = D[z], P = Q[z], O = 0, I = y.length; I > O; O++) K = c(y[O], P[O], H), 
        u ? f(K.x, K.y + h[s - 1].y, h[s - 1].x + J) : f(K.x, K.y, m + J);
    }
    !function() {
        if (q) {
            var a;
            for (a = 0 * M, O = 0; N > O; O++) L = E[O], g(L[2] + a, L[1] + a, L[0] + a);
            for (a = s + 2 * p, a *= M, O = 0; N > O; O++) L = E[O], g(L[0] + a, L[1] + a, L[2] + a);
        } else {
            for (O = 0; N > O; O++) L = E[O], g(L[2], L[1], L[0]);
            for (O = 0; N > O; O++) L = E[O], g(L[0] + M * s, L[1] + M * s, L[2] + M * s);
        }
    }(), function() {
        var a = 0;
        for (e(F, a), a += F.length, z = 0, A = D.length; A > z; z++) y = D[z], e(y, a), 
        a += y.length;
    }();
}, THREE.ExtrudeGeometry.WorldUVGenerator = {
    generateTopUV: function(a, b, c, d) {
        return a = a.vertices, b = a[b], c = a[c], d = a[d], [ new THREE.Vector2(b.x, b.y), new THREE.Vector2(c.x, c.y), new THREE.Vector2(d.x, d.y) ];
    },
    generateSideWallUV: function(a, b, c, d, e) {
        return a = a.vertices, b = a[b], c = a[c], d = a[d], e = a[e], .01 > Math.abs(b.y - c.y) ? [ new THREE.Vector2(b.x, 1 - b.z), new THREE.Vector2(c.x, 1 - c.z), new THREE.Vector2(d.x, 1 - d.z), new THREE.Vector2(e.x, 1 - e.z) ] : [ new THREE.Vector2(b.y, 1 - b.z), new THREE.Vector2(c.y, 1 - c.z), new THREE.Vector2(d.y, 1 - d.z), new THREE.Vector2(e.y, 1 - e.z) ];
    }
}, THREE.ShapeGeometry = function(a, b) {
    THREE.Geometry.call(this), this.type = "ShapeGeometry", !1 == a instanceof Array && (a = [ a ]), 
    this.addShapeList(a, b), this.computeFaceNormals();
}, THREE.ShapeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.ShapeGeometry.prototype.constructor = THREE.ShapeGeometry, 
THREE.ShapeGeometry.prototype.addShapeList = function(a, b) {
    for (var c = 0, d = a.length; d > c; c++) this.addShape(a[c], b);
    return this;
}, THREE.ShapeGeometry.prototype.addShape = function(a, b) {
    void 0 === b && (b = {});
    var c, d, e, f = b.material, g = void 0 === b.UVGenerator ? THREE.ExtrudeGeometry.WorldUVGenerator : b.UVGenerator, h = this.vertices.length;
    c = a.extractPoints(void 0 !== b.curveSegments ? b.curveSegments : 12);
    var i = c.shape, j = c.holes;
    if (!THREE.Shape.Utils.isClockWise(i)) for (i = i.reverse(), c = 0, d = j.length; d > c; c++) e = j[c], 
    THREE.Shape.Utils.isClockWise(e) && (j[c] = e.reverse());
    var k = THREE.Shape.Utils.triangulateShape(i, j);
    for (c = 0, d = j.length; d > c; c++) e = j[c], i = i.concat(e);
    for (j = i.length, d = k.length, c = 0; j > c; c++) e = i[c], this.vertices.push(new THREE.Vector3(e.x, e.y, 0));
    for (c = 0; d > c; c++) j = k[c], i = j[0] + h, e = j[1] + h, j = j[2] + h, this.faces.push(new THREE.Face3(i, e, j, null, null, f)), 
    this.faceVertexUvs[0].push(g.generateTopUV(this, i, e, j));
}, THREE.LatheGeometry = function(a, b, c, d) {
    THREE.Geometry.call(this), this.type = "LatheGeometry", this.parameters = {
        points: a,
        segments: b,
        phiStart: c,
        phiLength: d
    }, b = b || 12, c = c || 0, d = d || 2 * Math.PI;
    for (var e = 1 / (a.length - 1), f = 1 / b, g = 0, h = b; h >= g; g++) for (var i = c + g * f * d, j = Math.cos(i), k = Math.sin(i), i = 0, l = a.length; l > i; i++) {
        var m = a[i], n = new THREE.Vector3();
        n.x = j * m.x - k * m.y, n.y = k * m.x + j * m.y, n.z = m.z, this.vertices.push(n);
    }
    for (c = a.length, g = 0, h = b; h > g; g++) for (i = 0, l = a.length - 1; l > i; i++) {
        b = k = i + c * g, d = k + c;
        var j = k + 1 + c, k = k + 1, m = g * f, n = i * e, o = m + f, p = n + e;
        this.faces.push(new THREE.Face3(b, d, k)), this.faceVertexUvs[0].push([ new THREE.Vector2(m, n), new THREE.Vector2(o, n), new THREE.Vector2(m, p) ]), 
        this.faces.push(new THREE.Face3(d, j, k)), this.faceVertexUvs[0].push([ new THREE.Vector2(o, n), new THREE.Vector2(o, p), new THREE.Vector2(m, p) ]);
    }
    this.mergeVertices(), this.computeFaceNormals(), this.computeVertexNormals();
}, THREE.LatheGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.LatheGeometry.prototype.constructor = THREE.LatheGeometry, 
THREE.PlaneGeometry = function(a, b, c, d) {
    console.info("THREE.PlaneGeometry: Consider using THREE.PlaneBufferGeometry for lower memory footprint."), 
    THREE.Geometry.call(this), this.type = "PlaneGeometry", this.parameters = {
        width: a,
        height: b,
        widthSegments: c,
        heightSegments: d
    }, this.fromBufferGeometry(new THREE.PlaneBufferGeometry(a, b, c, d));
}, THREE.PlaneGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.PlaneGeometry.prototype.constructor = THREE.PlaneGeometry, 
THREE.PlaneBufferGeometry = function(a, b, c, d) {
    THREE.BufferGeometry.call(this), this.type = "PlaneBufferGeometry", this.parameters = {
        width: a,
        height: b,
        widthSegments: c,
        heightSegments: d
    };
    var e = a / 2, f = b / 2;
    c = c || 1, d = d || 1;
    var g = c + 1, h = d + 1, i = a / c, j = b / d;
    b = new Float32Array(g * h * 3), a = new Float32Array(g * h * 3);
    for (var k = new Float32Array(g * h * 2), l = 0, m = 0, n = 0; h > n; n++) for (var o = n * j - f, p = 0; g > p; p++) b[l] = p * i - e, 
    b[l + 1] = -o, a[l + 2] = 1, k[m] = p / c, k[m + 1] = 1 - n / d, l += 3, m += 2;
    for (l = 0, e = new (65535 < b.length / 3 ? Uint32Array : Uint16Array)(c * d * 6), 
    n = 0; d > n; n++) for (p = 0; c > p; p++) f = p + g * (n + 1), h = p + 1 + g * (n + 1), 
    i = p + 1 + g * n, e[l] = p + g * n, e[l + 1] = f, e[l + 2] = i, e[l + 3] = f, e[l + 4] = h, 
    e[l + 5] = i, l += 6;
    this.addAttribute("index", new THREE.BufferAttribute(e, 1)), this.addAttribute("position", new THREE.BufferAttribute(b, 3)), 
    this.addAttribute("normal", new THREE.BufferAttribute(a, 3)), this.addAttribute("uv", new THREE.BufferAttribute(k, 2));
}, THREE.PlaneBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype), 
THREE.PlaneBufferGeometry.prototype.constructor = THREE.PlaneBufferGeometry, THREE.RingGeometry = function(a, b, c, d, e, f) {
    THREE.Geometry.call(this), this.type = "RingGeometry", this.parameters = {
        innerRadius: a,
        outerRadius: b,
        thetaSegments: c,
        phiSegments: d,
        thetaStart: e,
        thetaLength: f
    }, a = a || 0, b = b || 50, e = void 0 !== e ? e : 0, f = void 0 !== f ? f : 2 * Math.PI, 
    c = void 0 !== c ? Math.max(3, c) : 8, d = void 0 !== d ? Math.max(1, d) : 8;
    var g, h = [], i = a, j = (b - a) / d;
    for (a = 0; d + 1 > a; a++) {
        for (g = 0; c + 1 > g; g++) {
            var k = new THREE.Vector3(), l = e + g / c * f;
            k.x = i * Math.cos(l), k.y = i * Math.sin(l), this.vertices.push(k), h.push(new THREE.Vector2((k.x / b + 1) / 2, (k.y / b + 1) / 2));
        }
        i += j;
    }
    for (b = new THREE.Vector3(0, 0, 1), a = 0; d > a; a++) for (e = a * (c + 1), g = 0; c > g; g++) f = l = g + e, 
    j = l + c + 1, k = l + c + 2, this.faces.push(new THREE.Face3(f, j, k, [ b.clone(), b.clone(), b.clone() ])), 
    this.faceVertexUvs[0].push([ h[f].clone(), h[j].clone(), h[k].clone() ]), f = l, 
    j = l + c + 2, k = l + 1, this.faces.push(new THREE.Face3(f, j, k, [ b.clone(), b.clone(), b.clone() ])), 
    this.faceVertexUvs[0].push([ h[f].clone(), h[j].clone(), h[k].clone() ]);
    this.computeFaceNormals(), this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), i);
}, THREE.RingGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.RingGeometry.prototype.constructor = THREE.RingGeometry, 
THREE.SphereGeometry = function(a, b, c, d, e, f, g) {
    THREE.Geometry.call(this), this.type = "SphereGeometry", this.parameters = {
        radius: a,
        widthSegments: b,
        heightSegments: c,
        phiStart: d,
        phiLength: e,
        thetaStart: f,
        thetaLength: g
    }, a = a || 50, b = Math.max(3, Math.floor(b) || 8), c = Math.max(2, Math.floor(c) || 6), 
    d = void 0 !== d ? d : 0, e = void 0 !== e ? e : 2 * Math.PI, f = void 0 !== f ? f : 0, 
    g = void 0 !== g ? g : Math.PI;
    var h, i, j = [], k = [];
    for (i = 0; c >= i; i++) {
        var l = [], m = [];
        for (h = 0; b >= h; h++) {
            var n = h / b, o = i / c, p = new THREE.Vector3();
            p.x = -a * Math.cos(d + n * e) * Math.sin(f + o * g), p.y = a * Math.cos(f + o * g), 
            p.z = a * Math.sin(d + n * e) * Math.sin(f + o * g), this.vertices.push(p), l.push(this.vertices.length - 1), 
            m.push(new THREE.Vector2(n, 1 - o));
        }
        j.push(l), k.push(m);
    }
    for (i = 0; c > i; i++) for (h = 0; b > h; h++) {
        d = j[i][h + 1], e = j[i][h], f = j[i + 1][h], g = j[i + 1][h + 1];
        var l = this.vertices[d].clone().normalize(), m = this.vertices[e].clone().normalize(), n = this.vertices[f].clone().normalize(), o = this.vertices[g].clone().normalize(), p = k[i][h + 1].clone(), q = k[i][h].clone(), r = k[i + 1][h].clone(), s = k[i + 1][h + 1].clone();
        Math.abs(this.vertices[d].y) === a ? (p.x = (p.x + q.x) / 2, this.faces.push(new THREE.Face3(d, f, g, [ l, n, o ])), 
        this.faceVertexUvs[0].push([ p, r, s ])) : Math.abs(this.vertices[f].y) === a ? (r.x = (r.x + s.x) / 2, 
        this.faces.push(new THREE.Face3(d, e, f, [ l, m, n ])), this.faceVertexUvs[0].push([ p, q, r ])) : (this.faces.push(new THREE.Face3(d, e, g, [ l, m, o ])), 
        this.faceVertexUvs[0].push([ p, q, s ]), this.faces.push(new THREE.Face3(e, f, g, [ m.clone(), n, o.clone() ])), 
        this.faceVertexUvs[0].push([ q.clone(), r, s.clone() ]));
    }
    this.computeFaceNormals(), this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), a);
}, THREE.SphereGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.SphereGeometry.prototype.constructor = THREE.SphereGeometry, 
THREE.TextGeometry = function(a, b) {
    b = b || {};
    var c = THREE.FontUtils.generateShapes(a, b);
    b.amount = void 0 !== b.height ? b.height : 50, void 0 === b.bevelThickness && (b.bevelThickness = 10), 
    void 0 === b.bevelSize && (b.bevelSize = 8), void 0 === b.bevelEnabled && (b.bevelEnabled = !1), 
    THREE.ExtrudeGeometry.call(this, c, b), this.type = "TextGeometry";
}, THREE.TextGeometry.prototype = Object.create(THREE.ExtrudeGeometry.prototype), 
THREE.TextGeometry.prototype.constructor = THREE.TextGeometry, THREE.TorusGeometry = function(a, b, c, d, e) {
    THREE.Geometry.call(this), this.type = "TorusGeometry", this.parameters = {
        radius: a,
        tube: b,
        radialSegments: c,
        tubularSegments: d,
        arc: e
    }, a = a || 100, b = b || 40, c = c || 8, d = d || 6, e = e || 2 * Math.PI;
    for (var f = new THREE.Vector3(), g = [], h = [], i = 0; c >= i; i++) for (var j = 0; d >= j; j++) {
        var k = j / d * e, l = i / c * Math.PI * 2;
        f.x = a * Math.cos(k), f.y = a * Math.sin(k);
        var m = new THREE.Vector3();
        m.x = (a + b * Math.cos(l)) * Math.cos(k), m.y = (a + b * Math.cos(l)) * Math.sin(k), 
        m.z = b * Math.sin(l), this.vertices.push(m), g.push(new THREE.Vector2(j / d, i / c)), 
        h.push(m.clone().sub(f).normalize());
    }
    for (i = 1; c >= i; i++) for (j = 1; d >= j; j++) a = (d + 1) * i + j - 1, b = (d + 1) * (i - 1) + j - 1, 
    e = (d + 1) * (i - 1) + j, f = (d + 1) * i + j, k = new THREE.Face3(a, b, f, [ h[a].clone(), h[b].clone(), h[f].clone() ]), 
    this.faces.push(k), this.faceVertexUvs[0].push([ g[a].clone(), g[b].clone(), g[f].clone() ]), 
    k = new THREE.Face3(b, e, f, [ h[b].clone(), h[e].clone(), h[f].clone() ]), this.faces.push(k), 
    this.faceVertexUvs[0].push([ g[b].clone(), g[e].clone(), g[f].clone() ]);
    this.computeFaceNormals();
}, THREE.TorusGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TorusGeometry.prototype.constructor = THREE.TorusGeometry, 
THREE.TorusKnotGeometry = function(a, b, c, d, e, f, g) {
    function h(a, b, c, d, e) {
        var f = Math.cos(a), g = Math.sin(a);
        return a *= b / c, b = Math.cos(a), f *= d * (2 + b) * .5, g = d * (2 + b) * g * .5, 
        d = e * d * Math.sin(a) * .5, new THREE.Vector3(f, g, d);
    }
    THREE.Geometry.call(this), this.type = "TorusKnotGeometry", this.parameters = {
        radius: a,
        tube: b,
        radialSegments: c,
        tubularSegments: d,
        p: e,
        q: f,
        heightScale: g
    }, a = a || 100, b = b || 40, c = c || 64, d = d || 8, e = e || 2, f = f || 3, g = g || 1;
    for (var i = Array(c), j = new THREE.Vector3(), k = new THREE.Vector3(), l = new THREE.Vector3(), m = 0; c > m; ++m) {
        i[m] = Array(d);
        var n = m / c * 2 * e * Math.PI, o = h(n, f, e, a, g), n = h(n + .01, f, e, a, g);
        for (j.subVectors(n, o), k.addVectors(n, o), l.crossVectors(j, k), k.crossVectors(l, j), 
        l.normalize(), k.normalize(), n = 0; d > n; ++n) {
            var p = n / d * 2 * Math.PI, q = -b * Math.cos(p), p = b * Math.sin(p), r = new THREE.Vector3();
            r.x = o.x + q * k.x + p * l.x, r.y = o.y + q * k.y + p * l.y, r.z = o.z + q * k.z + p * l.z, 
            i[m][n] = this.vertices.push(r) - 1;
        }
    }
    for (m = 0; c > m; ++m) for (n = 0; d > n; ++n) e = (m + 1) % c, f = (n + 1) % d, 
    a = i[m][n], b = i[e][n], e = i[e][f], f = i[m][f], g = new THREE.Vector2(m / c, n / d), 
    j = new THREE.Vector2((m + 1) / c, n / d), k = new THREE.Vector2((m + 1) / c, (n + 1) / d), 
    l = new THREE.Vector2(m / c, (n + 1) / d), this.faces.push(new THREE.Face3(a, b, f)), 
    this.faceVertexUvs[0].push([ g, j, l ]), this.faces.push(new THREE.Face3(b, e, f)), 
    this.faceVertexUvs[0].push([ j.clone(), k, l.clone() ]);
    this.computeFaceNormals(), this.computeVertexNormals();
}, THREE.TorusKnotGeometry.prototype = Object.create(THREE.Geometry.prototype), 
THREE.TorusKnotGeometry.prototype.constructor = THREE.TorusKnotGeometry, THREE.TubeGeometry = function(a, b, c, d, e, f) {
    THREE.Geometry.call(this), this.type = "TubeGeometry", this.parameters = {
        path: a,
        segments: b,
        radius: c,
        radialSegments: d,
        closed: e
    }, b = b || 64, c = c || 1, d = d || 8, e = e || !1, f = f || THREE.TubeGeometry.NoTaper;
    var g, h, i, j, k, l, m, n, o, p, q = [], r = b + 1, s = new THREE.Vector3();
    for (n = new THREE.TubeGeometry.FrenetFrames(a, b, e), o = n.normals, p = n.binormals, 
    this.tangents = n.tangents, this.normals = o, this.binormals = p, n = 0; r > n; n++) for (q[n] = [], 
    i = n / (r - 1), m = a.getPointAt(i), g = o[n], h = p[n], k = c * f(i), i = 0; d > i; i++) j = i / d * 2 * Math.PI, 
    l = -k * Math.cos(j), j = k * Math.sin(j), s.copy(m), s.x += l * g.x + j * h.x, 
    s.y += l * g.y + j * h.y, s.z += l * g.z + j * h.z, q[n][i] = this.vertices.push(new THREE.Vector3(s.x, s.y, s.z)) - 1;
    for (n = 0; b > n; n++) for (i = 0; d > i; i++) f = e ? (n + 1) % b : n + 1, r = (i + 1) % d, 
    a = q[n][i], c = q[f][i], f = q[f][r], r = q[n][r], s = new THREE.Vector2(n / b, i / d), 
    o = new THREE.Vector2((n + 1) / b, i / d), p = new THREE.Vector2((n + 1) / b, (i + 1) / d), 
    g = new THREE.Vector2(n / b, (i + 1) / d), this.faces.push(new THREE.Face3(a, c, r)), 
    this.faceVertexUvs[0].push([ s, o, g ]), this.faces.push(new THREE.Face3(c, f, r)), 
    this.faceVertexUvs[0].push([ o.clone(), p, g.clone() ]);
    this.computeFaceNormals(), this.computeVertexNormals();
}, THREE.TubeGeometry.prototype = Object.create(THREE.Geometry.prototype), THREE.TubeGeometry.prototype.constructor = THREE.TubeGeometry, 
THREE.TubeGeometry.NoTaper = function() {
    return 1;
}, THREE.TubeGeometry.SinusoidalTaper = function(a) {
    return Math.sin(Math.PI * a);
}, THREE.TubeGeometry.FrenetFrames = function(a, b, c) {
    var d = new THREE.Vector3(), e = [], f = [], g = [], h = new THREE.Vector3(), i = new THREE.Matrix4();
    b += 1;
    var j, k, l;
    for (this.tangents = e, this.normals = f, this.binormals = g, j = 0; b > j; j++) k = j / (b - 1), 
    e[j] = a.getTangentAt(k), e[j].normalize();
    for (f[0] = new THREE.Vector3(), g[0] = new THREE.Vector3(), a = Number.MAX_VALUE, 
    j = Math.abs(e[0].x), k = Math.abs(e[0].y), l = Math.abs(e[0].z), a >= j && (a = j, 
    d.set(1, 0, 0)), a >= k && (a = k, d.set(0, 1, 0)), a >= l && d.set(0, 0, 1), h.crossVectors(e[0], d).normalize(), 
    f[0].crossVectors(e[0], h), g[0].crossVectors(e[0], f[0]), j = 1; b > j; j++) f[j] = f[j - 1].clone(), 
    g[j] = g[j - 1].clone(), h.crossVectors(e[j - 1], e[j]), 1e-4 < h.length() && (h.normalize(), 
    d = Math.acos(THREE.Math.clamp(e[j - 1].dot(e[j]), -1, 1)), f[j].applyMatrix4(i.makeRotationAxis(h, d))), 
    g[j].crossVectors(e[j], f[j]);
    if (c) for (d = Math.acos(THREE.Math.clamp(f[0].dot(f[b - 1]), -1, 1)), d /= b - 1, 
    0 < e[0].dot(h.crossVectors(f[0], f[b - 1])) && (d = -d), j = 1; b > j; j++) f[j].applyMatrix4(i.makeRotationAxis(e[j], d * j)), 
    g[j].crossVectors(e[j], f[j]);
}, THREE.PolyhedronGeometry = function(a, b, c, d) {
    function e(a) {
        var b = a.normalize().clone();
        b.index = i.vertices.push(b) - 1;
        var c = Math.atan2(a.z, -a.x) / 2 / Math.PI + .5;
        return a = Math.atan2(-a.y, Math.sqrt(a.x * a.x + a.z * a.z)) / Math.PI + .5, b.uv = new THREE.Vector2(c, 1 - a), 
        b;
    }
    function f(a, b, c) {
        var d = new THREE.Face3(a.index, b.index, c.index, [ a.clone(), b.clone(), c.clone() ]);
        i.faces.push(d), q.copy(a).add(b).add(c).divideScalar(3), d = Math.atan2(q.z, -q.x), 
        i.faceVertexUvs[0].push([ h(a.uv, a, d), h(b.uv, b, d), h(c.uv, c, d) ]);
    }
    function g(a, b) {
        for (var c = Math.pow(2, b), d = e(i.vertices[a.a]), g = e(i.vertices[a.b]), h = e(i.vertices[a.c]), j = [], k = 0; c >= k; k++) {
            j[k] = [];
            for (var l = e(d.clone().lerp(h, k / c)), m = e(g.clone().lerp(h, k / c)), n = c - k, o = 0; n >= o; o++) j[k][o] = 0 == o && k == c ? l : e(l.clone().lerp(m, o / n));
        }
        for (k = 0; c > k; k++) for (o = 0; 2 * (c - k) - 1 > o; o++) d = Math.floor(o / 2), 
        0 == o % 2 ? f(j[k][d + 1], j[k + 1][d], j[k][d]) : f(j[k][d + 1], j[k + 1][d + 1], j[k + 1][d]);
    }
    function h(a, b, c) {
        return 0 > c && 1 === a.x && (a = new THREE.Vector2(a.x - 1, a.y)), 0 === b.x && 0 === b.z && (a = new THREE.Vector2(c / 2 / Math.PI + .5, a.y)), 
        a.clone();
    }
    THREE.Geometry.call(this), this.type = "PolyhedronGeometry", this.parameters = {
        vertices: a,
        indices: b,
        radius: c,
        detail: d
    }, c = c || 1, d = d || 0;
    for (var i = this, j = 0, k = a.length; k > j; j += 3) e(new THREE.Vector3(a[j], a[j + 1], a[j + 2]));
    a = this.vertices;
    for (var l = [], m = j = 0, k = b.length; k > j; j += 3, m++) {
        var n = a[b[j]], o = a[b[j + 1]], p = a[b[j + 2]];
        l[m] = new THREE.Face3(n.index, o.index, p.index, [ n.clone(), o.clone(), p.clone() ]);
    }
    for (var q = new THREE.Vector3(), j = 0, k = l.length; k > j; j++) g(l[j], d);
    for (j = 0, k = this.faceVertexUvs[0].length; k > j; j++) b = this.faceVertexUvs[0][j], 
    d = b[0].x, a = b[1].x, l = b[2].x, m = Math.max(d, Math.max(a, l)), n = Math.min(d, Math.min(a, l)), 
    m > .9 && .1 > n && (.2 > d && (b[0].x += 1), .2 > a && (b[1].x += 1), .2 > l && (b[2].x += 1));
    for (j = 0, k = this.vertices.length; k > j; j++) this.vertices[j].multiplyScalar(c);
    this.mergeVertices(), this.computeFaceNormals(), this.boundingSphere = new THREE.Sphere(new THREE.Vector3(), c);
}, THREE.PolyhedronGeometry.prototype = Object.create(THREE.Geometry.prototype), 
THREE.PolyhedronGeometry.prototype.constructor = THREE.PolyhedronGeometry, THREE.DodecahedronGeometry = function(a, b) {
    this.parameters = {
        radius: a,
        detail: b
    };
    var c = (1 + Math.sqrt(5)) / 2, d = 1 / c;
    THREE.PolyhedronGeometry.call(this, [ -1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 0, -d, -c, 0, -d, c, 0, d, -c, 0, d, c, -d, -c, 0, -d, c, 0, d, -c, 0, d, c, 0, -c, 0, -d, c, 0, -d, -c, 0, d, c, 0, d ], [ 3, 11, 7, 3, 7, 15, 3, 15, 13, 7, 19, 17, 7, 17, 6, 7, 6, 15, 17, 4, 8, 17, 8, 10, 17, 10, 6, 8, 0, 16, 8, 16, 2, 8, 2, 10, 0, 12, 1, 0, 1, 18, 0, 18, 16, 6, 10, 2, 6, 2, 13, 6, 13, 15, 2, 16, 18, 2, 18, 3, 2, 3, 13, 18, 1, 9, 18, 9, 11, 18, 11, 3, 4, 14, 12, 4, 12, 0, 4, 0, 8, 11, 9, 5, 11, 5, 19, 11, 19, 7, 19, 5, 14, 19, 14, 4, 19, 4, 17, 1, 12, 14, 1, 14, 5, 1, 5, 9 ], a, b);
}, THREE.DodecahedronGeometry.prototype = Object.create(THREE.Geometry.prototype), 
THREE.DodecahedronGeometry.prototype.constructor = THREE.DodecahedronGeometry, THREE.IcosahedronGeometry = function(a, b) {
    var c = (1 + Math.sqrt(5)) / 2;
    THREE.PolyhedronGeometry.call(this, [ -1, c, 0, 1, c, 0, -1, -c, 0, 1, -c, 0, 0, -1, c, 0, 1, c, 0, -1, -c, 0, 1, -c, c, 0, -1, c, 0, 1, -c, 0, -1, -c, 0, 1 ], [ 0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1 ], a, b), 
    this.type = "IcosahedronGeometry", this.parameters = {
        radius: a,
        detail: b
    };
}, THREE.IcosahedronGeometry.prototype = Object.create(THREE.Geometry.prototype), 
THREE.IcosahedronGeometry.prototype.constructor = THREE.IcosahedronGeometry, THREE.OctahedronGeometry = function(a, b) {
    this.parameters = {
        radius: a,
        detail: b
    }, THREE.PolyhedronGeometry.call(this, [ 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1 ], [ 0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2 ], a, b), 
    this.type = "OctahedronGeometry", this.parameters = {
        radius: a,
        detail: b
    };
}, THREE.OctahedronGeometry.prototype = Object.create(THREE.Geometry.prototype), 
THREE.OctahedronGeometry.prototype.constructor = THREE.OctahedronGeometry, THREE.TetrahedronGeometry = function(a, b) {
    THREE.PolyhedronGeometry.call(this, [ 1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1 ], [ 2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1 ], a, b), 
    this.type = "TetrahedronGeometry", this.parameters = {
        radius: a,
        detail: b
    };
}, THREE.TetrahedronGeometry.prototype = Object.create(THREE.Geometry.prototype), 
THREE.TetrahedronGeometry.prototype.constructor = THREE.TetrahedronGeometry, THREE.ParametricGeometry = function(a, b, c) {
    THREE.Geometry.call(this), this.type = "ParametricGeometry", this.parameters = {
        func: a,
        slices: b,
        stacks: c
    };
    var d, e, f, g, h = this.vertices, i = this.faces, j = this.faceVertexUvs[0], k = b + 1;
    for (d = 0; c >= d; d++) for (g = d / c, e = 0; b >= e; e++) f = e / b, f = a(f, g), 
    h.push(f);
    var l, m, n, o;
    for (d = 0; c > d; d++) for (e = 0; b > e; e++) a = d * k + e, h = d * k + e + 1, 
    g = (d + 1) * k + e + 1, f = (d + 1) * k + e, l = new THREE.Vector2(e / b, d / c), 
    m = new THREE.Vector2((e + 1) / b, d / c), n = new THREE.Vector2((e + 1) / b, (d + 1) / c), 
    o = new THREE.Vector2(e / b, (d + 1) / c), i.push(new THREE.Face3(a, h, f)), j.push([ l, m, o ]), 
    i.push(new THREE.Face3(h, g, f)), j.push([ m.clone(), n, o.clone() ]);
    this.computeFaceNormals(), this.computeVertexNormals();
}, THREE.ParametricGeometry.prototype = Object.create(THREE.Geometry.prototype), 
THREE.ParametricGeometry.prototype.constructor = THREE.ParametricGeometry, THREE.AxisHelper = function(a) {
    a = a || 1;
    var b = new Float32Array([ 0, 0, 0, a, 0, 0, 0, 0, 0, 0, a, 0, 0, 0, 0, 0, 0, a ]), c = new Float32Array([ 1, 0, 0, 1, .6, 0, 0, 1, 0, .6, 1, 0, 0, 0, 1, 0, .6, 1 ]);
    a = new THREE.BufferGeometry(), a.addAttribute("position", new THREE.BufferAttribute(b, 3)), 
    a.addAttribute("color", new THREE.BufferAttribute(c, 3)), b = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors
    }), THREE.Line.call(this, a, b, THREE.LinePieces);
}, THREE.AxisHelper.prototype = Object.create(THREE.Line.prototype), THREE.AxisHelper.prototype.constructor = THREE.AxisHelper, 
THREE.ArrowHelper = function() {
    var a = new THREE.Geometry();
    a.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0));
    var b = new THREE.CylinderGeometry(0, .5, 1, 5, 1);
    return b.applyMatrix(new THREE.Matrix4().makeTranslation(0, -.5, 0)), function(c, d, e, f, g, h) {
        THREE.Object3D.call(this), void 0 === f && (f = 16776960), void 0 === e && (e = 1), 
        void 0 === g && (g = .2 * e), void 0 === h && (h = .2 * g), this.position.copy(d), 
        this.line = new THREE.Line(a, new THREE.LineBasicMaterial({
            color: f
        })), this.line.matrixAutoUpdate = !1, this.add(this.line), this.cone = new THREE.Mesh(b, new THREE.MeshBasicMaterial({
            color: f
        })), this.cone.matrixAutoUpdate = !1, this.add(this.cone), this.setDirection(c), 
        this.setLength(e, g, h);
    };
}(), THREE.ArrowHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.ArrowHelper.prototype.constructor = THREE.ArrowHelper, 
THREE.ArrowHelper.prototype.setDirection = function() {
    var a, b = new THREE.Vector3();
    return function(c) {
        .99999 < c.y ? this.quaternion.set(0, 0, 0, 1) : -.99999 > c.y ? this.quaternion.set(1, 0, 0, 0) : (b.set(c.z, 0, -c.x).normalize(), 
        a = Math.acos(c.y), this.quaternion.setFromAxisAngle(b, a));
    };
}(), THREE.ArrowHelper.prototype.setLength = function(a, b, c) {
    void 0 === b && (b = .2 * a), void 0 === c && (c = .2 * b), this.line.scale.set(1, a - b, 1), 
    this.line.updateMatrix(), this.cone.scale.set(c, b, c), this.cone.position.y = a, 
    this.cone.updateMatrix();
}, THREE.ArrowHelper.prototype.setColor = function(a) {
    this.line.material.color.set(a), this.cone.material.color.set(a);
}, THREE.BoxHelper = function(a) {
    var b = new THREE.BufferGeometry();
    b.addAttribute("position", new THREE.BufferAttribute(new Float32Array(72), 3)), 
    THREE.Line.call(this, b, new THREE.LineBasicMaterial({
        color: 16776960
    }), THREE.LinePieces), void 0 !== a && this.update(a);
}, THREE.BoxHelper.prototype = Object.create(THREE.Line.prototype), THREE.BoxHelper.prototype.constructor = THREE.BoxHelper, 
THREE.BoxHelper.prototype.update = function(a) {
    var b = a.geometry;
    null === b.boundingBox && b.computeBoundingBox();
    var c = b.boundingBox.min, b = b.boundingBox.max, d = this.geometry.attributes.position.array;
    d[0] = b.x, d[1] = b.y, d[2] = b.z, d[3] = c.x, d[4] = b.y, d[5] = b.z, d[6] = c.x, 
    d[7] = b.y, d[8] = b.z, d[9] = c.x, d[10] = c.y, d[11] = b.z, d[12] = c.x, d[13] = c.y, 
    d[14] = b.z, d[15] = b.x, d[16] = c.y, d[17] = b.z, d[18] = b.x, d[19] = c.y, d[20] = b.z, 
    d[21] = b.x, d[22] = b.y, d[23] = b.z, d[24] = b.x, d[25] = b.y, d[26] = c.z, d[27] = c.x, 
    d[28] = b.y, d[29] = c.z, d[30] = c.x, d[31] = b.y, d[32] = c.z, d[33] = c.x, d[34] = c.y, 
    d[35] = c.z, d[36] = c.x, d[37] = c.y, d[38] = c.z, d[39] = b.x, d[40] = c.y, d[41] = c.z, 
    d[42] = b.x, d[43] = c.y, d[44] = c.z, d[45] = b.x, d[46] = b.y, d[47] = c.z, d[48] = b.x, 
    d[49] = b.y, d[50] = b.z, d[51] = b.x, d[52] = b.y, d[53] = c.z, d[54] = c.x, d[55] = b.y, 
    d[56] = b.z, d[57] = c.x, d[58] = b.y, d[59] = c.z, d[60] = c.x, d[61] = c.y, d[62] = b.z, 
    d[63] = c.x, d[64] = c.y, d[65] = c.z, d[66] = b.x, d[67] = c.y, d[68] = b.z, d[69] = b.x, 
    d[70] = c.y, d[71] = c.z, this.geometry.attributes.position.needsUpdate = !0, this.geometry.computeBoundingSphere(), 
    this.matrix = a.matrixWorld, this.matrixAutoUpdate = !1;
}, THREE.BoundingBoxHelper = function(a, b) {
    var c = void 0 !== b ? b : 8947848;
    this.object = a, this.box = new THREE.Box3(), THREE.Mesh.call(this, new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
        color: c,
        wireframe: !0
    }));
}, THREE.BoundingBoxHelper.prototype = Object.create(THREE.Mesh.prototype), THREE.BoundingBoxHelper.prototype.constructor = THREE.BoundingBoxHelper, 
THREE.BoundingBoxHelper.prototype.update = function() {
    this.box.setFromObject(this.object), this.box.size(this.scale), this.box.center(this.position);
}, THREE.CameraHelper = function(a) {
    function b(a, b, d) {
        c(a, d), c(b, d);
    }
    function c(a, b) {
        d.vertices.push(new THREE.Vector3()), d.colors.push(new THREE.Color(b)), void 0 === f[a] && (f[a] = []), 
        f[a].push(d.vertices.length - 1);
    }
    var d = new THREE.Geometry(), e = new THREE.LineBasicMaterial({
        color: 16777215,
        vertexColors: THREE.FaceColors
    }), f = {};
    b("n1", "n2", 16755200), b("n2", "n4", 16755200), b("n4", "n3", 16755200), b("n3", "n1", 16755200), 
    b("f1", "f2", 16755200), b("f2", "f4", 16755200), b("f4", "f3", 16755200), b("f3", "f1", 16755200), 
    b("n1", "f1", 16755200), b("n2", "f2", 16755200), b("n3", "f3", 16755200), b("n4", "f4", 16755200), 
    b("p", "n1", 16711680), b("p", "n2", 16711680), b("p", "n3", 16711680), b("p", "n4", 16711680), 
    b("u1", "u2", 43775), b("u2", "u3", 43775), b("u3", "u1", 43775), b("c", "t", 16777215), 
    b("p", "c", 3355443), b("cn1", "cn2", 3355443), b("cn3", "cn4", 3355443), b("cf1", "cf2", 3355443), 
    b("cf3", "cf4", 3355443), THREE.Line.call(this, d, e, THREE.LinePieces), this.camera = a, 
    this.matrix = a.matrixWorld, this.matrixAutoUpdate = !1, this.pointMap = f, this.update();
}, THREE.CameraHelper.prototype = Object.create(THREE.Line.prototype), THREE.CameraHelper.prototype.constructor = THREE.CameraHelper, 
THREE.CameraHelper.prototype.update = function() {
    var a, b, c = new THREE.Vector3(), d = new THREE.Camera(), e = function(e, f, g, h) {
        if (c.set(f, g, h).unproject(d), e = b[e], void 0 !== e) for (f = 0, g = e.length; g > f; f++) a.vertices[e[f]].copy(c);
    };
    return function() {
        a = this.geometry, b = this.pointMap, d.projectionMatrix.copy(this.camera.projectionMatrix), 
        e("c", 0, 0, -1), e("t", 0, 0, 1), e("n1", -1, -1, -1), e("n2", 1, -1, -1), e("n3", -1, 1, -1), 
        e("n4", 1, 1, -1), e("f1", -1, -1, 1), e("f2", 1, -1, 1), e("f3", -1, 1, 1), e("f4", 1, 1, 1), 
        e("u1", .7, 1.1, -1), e("u2", -.7, 1.1, -1), e("u3", 0, 2, -1), e("cf1", -1, 0, 1), 
        e("cf2", 1, 0, 1), e("cf3", 0, -1, 1), e("cf4", 0, 1, 1), e("cn1", -1, 0, -1), e("cn2", 1, 0, -1), 
        e("cn3", 0, -1, -1), e("cn4", 0, 1, -1), a.verticesNeedUpdate = !0;
    };
}(), THREE.DirectionalLightHelper = function(a, b) {
    THREE.Object3D.call(this), this.light = a, this.light.updateMatrixWorld(), this.matrix = a.matrixWorld, 
    this.matrixAutoUpdate = !1, b = b || 1;
    var c = new THREE.Geometry();
    c.vertices.push(new THREE.Vector3(-b, b, 0), new THREE.Vector3(b, b, 0), new THREE.Vector3(b, -b, 0), new THREE.Vector3(-b, -b, 0), new THREE.Vector3(-b, b, 0));
    var d = new THREE.LineBasicMaterial({
        fog: !1
    });
    d.color.copy(this.light.color).multiplyScalar(this.light.intensity), this.lightPlane = new THREE.Line(c, d), 
    this.add(this.lightPlane), c = new THREE.Geometry(), c.vertices.push(new THREE.Vector3(), new THREE.Vector3()), 
    d = new THREE.LineBasicMaterial({
        fog: !1
    }), d.color.copy(this.light.color).multiplyScalar(this.light.intensity), this.targetLine = new THREE.Line(c, d), 
    this.add(this.targetLine), this.update();
}, THREE.DirectionalLightHelper.prototype = Object.create(THREE.Object3D.prototype), 
THREE.DirectionalLightHelper.prototype.constructor = THREE.DirectionalLightHelper, 
THREE.DirectionalLightHelper.prototype.dispose = function() {
    this.lightPlane.geometry.dispose(), this.lightPlane.material.dispose(), this.targetLine.geometry.dispose(), 
    this.targetLine.material.dispose();
}, THREE.DirectionalLightHelper.prototype.update = function() {
    var a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    return function() {
        a.setFromMatrixPosition(this.light.matrixWorld), b.setFromMatrixPosition(this.light.target.matrixWorld), 
        c.subVectors(b, a), this.lightPlane.lookAt(c), this.lightPlane.material.color.copy(this.light.color).multiplyScalar(this.light.intensity), 
        this.targetLine.geometry.vertices[1].copy(c), this.targetLine.geometry.verticesNeedUpdate = !0, 
        this.targetLine.material.color.copy(this.lightPlane.material.color);
    };
}(), THREE.EdgesHelper = function(a, b, c) {
    b = void 0 !== b ? b : 16777215, c = Math.cos(THREE.Math.degToRad(void 0 !== c ? c : 1));
    var d, e = [ 0, 0 ], f = {}, g = function(a, b) {
        return a - b;
    }, h = [ "a", "b", "c" ], i = new THREE.BufferGeometry();
    a.geometry instanceof THREE.BufferGeometry ? (d = new THREE.Geometry(), d.fromBufferGeometry(a.geometry)) : d = a.geometry.clone(), 
    d.mergeVertices(), d.computeFaceNormals();
    var j = d.vertices;
    d = d.faces;
    for (var k = 0, l = 0, m = d.length; m > l; l++) for (var n = d[l], o = 0; 3 > o; o++) {
        e[0] = n[h[o]], e[1] = n[h[(o + 1) % 3]], e.sort(g);
        var p = e.toString();
        void 0 === f[p] ? (f[p] = {
            vert1: e[0],
            vert2: e[1],
            face1: l,
            face2: void 0
        }, k++) : f[p].face2 = l;
    }
    e = new Float32Array(6 * k), g = 0;
    for (p in f) h = f[p], (void 0 === h.face2 || d[h.face1].normal.dot(d[h.face2].normal) <= c) && (k = j[h.vert1], 
    e[g++] = k.x, e[g++] = k.y, e[g++] = k.z, k = j[h.vert2], e[g++] = k.x, e[g++] = k.y, 
    e[g++] = k.z);
    i.addAttribute("position", new THREE.BufferAttribute(e, 3)), THREE.Line.call(this, i, new THREE.LineBasicMaterial({
        color: b
    }), THREE.LinePieces), this.matrix = a.matrixWorld, this.matrixAutoUpdate = !1;
}, THREE.EdgesHelper.prototype = Object.create(THREE.Line.prototype), THREE.EdgesHelper.prototype.constructor = THREE.EdgesHelper, 
THREE.FaceNormalsHelper = function(a, b, c, d) {
    this.object = a, this.size = void 0 !== b ? b : 1, a = void 0 !== c ? c : 16776960, 
    d = void 0 !== d ? d : 1, b = new THREE.Geometry(), c = 0;
    for (var e = this.object.geometry.faces.length; e > c; c++) b.vertices.push(new THREE.Vector3(), new THREE.Vector3());
    THREE.Line.call(this, b, new THREE.LineBasicMaterial({
        color: a,
        linewidth: d
    }), THREE.LinePieces), this.matrixAutoUpdate = !1, this.normalMatrix = new THREE.Matrix3(), 
    this.update();
}, THREE.FaceNormalsHelper.prototype = Object.create(THREE.Line.prototype), THREE.FaceNormalsHelper.prototype.constructor = THREE.FaceNormalsHelper, 
THREE.FaceNormalsHelper.prototype.update = function() {
    var a = this.geometry.vertices, b = this.object, c = b.geometry.vertices, d = b.geometry.faces, e = b.matrixWorld;
    b.updateMatrixWorld(!0), this.normalMatrix.getNormalMatrix(e);
    for (var f = b = 0, g = d.length; g > b; b++, f += 2) {
        var h = d[b];
        a[f].copy(c[h.a]).add(c[h.b]).add(c[h.c]).divideScalar(3).applyMatrix4(e), a[f + 1].copy(h.normal).applyMatrix3(this.normalMatrix).normalize().multiplyScalar(this.size).add(a[f]);
    }
    return this.geometry.verticesNeedUpdate = !0, this;
}, THREE.GridHelper = function(a, b) {
    var c = new THREE.Geometry(), d = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors
    });
    this.color1 = new THREE.Color(4473924), this.color2 = new THREE.Color(8947848);
    for (var e = -a; a >= e; e += b) {
        c.vertices.push(new THREE.Vector3(-a, 0, e), new THREE.Vector3(a, 0, e), new THREE.Vector3(e, 0, -a), new THREE.Vector3(e, 0, a));
        var f = 0 === e ? this.color1 : this.color2;
        c.colors.push(f, f, f, f);
    }
    THREE.Line.call(this, c, d, THREE.LinePieces);
}, THREE.GridHelper.prototype = Object.create(THREE.Line.prototype), THREE.GridHelper.prototype.constructor = THREE.GridHelper, 
THREE.GridHelper.prototype.setColors = function(a, b) {
    this.color1.set(a), this.color2.set(b), this.geometry.colorsNeedUpdate = !0;
}, THREE.HemisphereLightHelper = function(a, b) {
    THREE.Object3D.call(this), this.light = a, this.light.updateMatrixWorld(), this.matrix = a.matrixWorld, 
    this.matrixAutoUpdate = !1, this.colors = [ new THREE.Color(), new THREE.Color() ];
    var c = new THREE.SphereGeometry(b, 4, 2);
    c.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    for (var d = 0; 8 > d; d++) c.faces[d].color = this.colors[4 > d ? 0 : 1];
    d = new THREE.MeshBasicMaterial({
        vertexColors: THREE.FaceColors,
        wireframe: !0
    }), this.lightSphere = new THREE.Mesh(c, d), this.add(this.lightSphere), this.update();
}, THREE.HemisphereLightHelper.prototype = Object.create(THREE.Object3D.prototype), 
THREE.HemisphereLightHelper.prototype.constructor = THREE.HemisphereLightHelper, 
THREE.HemisphereLightHelper.prototype.dispose = function() {
    this.lightSphere.geometry.dispose(), this.lightSphere.material.dispose();
}, THREE.HemisphereLightHelper.prototype.update = function() {
    var a = new THREE.Vector3();
    return function() {
        this.colors[0].copy(this.light.color).multiplyScalar(this.light.intensity), this.colors[1].copy(this.light.groundColor).multiplyScalar(this.light.intensity), 
        this.lightSphere.lookAt(a.setFromMatrixPosition(this.light.matrixWorld).negate()), 
        this.lightSphere.geometry.colorsNeedUpdate = !0;
    };
}(), THREE.PointLightHelper = function(a, b) {
    this.light = a, this.light.updateMatrixWorld();
    var c = new THREE.SphereGeometry(b, 4, 2), d = new THREE.MeshBasicMaterial({
        wireframe: !0,
        fog: !1
    });
    d.color.copy(this.light.color).multiplyScalar(this.light.intensity), THREE.Mesh.call(this, c, d), 
    this.matrix = this.light.matrixWorld, this.matrixAutoUpdate = !1;
}, THREE.PointLightHelper.prototype = Object.create(THREE.Mesh.prototype), THREE.PointLightHelper.prototype.constructor = THREE.PointLightHelper, 
THREE.PointLightHelper.prototype.dispose = function() {
    this.geometry.dispose(), this.material.dispose();
}, THREE.PointLightHelper.prototype.update = function() {
    this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);
}, THREE.SkeletonHelper = function(a) {
    this.bones = this.getBoneList(a);
    for (var b = new THREE.Geometry(), c = 0; c < this.bones.length; c++) this.bones[c].parent instanceof THREE.Bone && (b.vertices.push(new THREE.Vector3()), 
    b.vertices.push(new THREE.Vector3()), b.colors.push(new THREE.Color(0, 0, 1)), b.colors.push(new THREE.Color(0, 1, 0)));
    c = new THREE.LineBasicMaterial({
        vertexColors: THREE.VertexColors,
        depthTest: !1,
        depthWrite: !1,
        transparent: !0
    }), THREE.Line.call(this, b, c, THREE.LinePieces), this.root = a, this.matrix = a.matrixWorld, 
    this.matrixAutoUpdate = !1, this.update();
}, THREE.SkeletonHelper.prototype = Object.create(THREE.Line.prototype), THREE.SkeletonHelper.prototype.constructor = THREE.SkeletonHelper, 
THREE.SkeletonHelper.prototype.getBoneList = function(a) {
    var b = [];
    a instanceof THREE.Bone && b.push(a);
    for (var c = 0; c < a.children.length; c++) b.push.apply(b, this.getBoneList(a.children[c]));
    return b;
}, THREE.SkeletonHelper.prototype.update = function() {
    for (var a = this.geometry, b = new THREE.Matrix4().getInverse(this.root.matrixWorld), c = new THREE.Matrix4(), d = 0, e = 0; e < this.bones.length; e++) {
        var f = this.bones[e];
        f.parent instanceof THREE.Bone && (c.multiplyMatrices(b, f.matrixWorld), a.vertices[d].setFromMatrixPosition(c), 
        c.multiplyMatrices(b, f.parent.matrixWorld), a.vertices[d + 1].setFromMatrixPosition(c), 
        d += 2);
    }
    a.verticesNeedUpdate = !0, a.computeBoundingSphere();
}, THREE.SpotLightHelper = function(a) {
    THREE.Object3D.call(this), this.light = a, this.light.updateMatrixWorld(), this.matrix = a.matrixWorld, 
    this.matrixAutoUpdate = !1, a = new THREE.CylinderGeometry(0, 1, 1, 8, 1, !0), a.applyMatrix(new THREE.Matrix4().makeTranslation(0, -.5, 0)), 
    a.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var b = new THREE.MeshBasicMaterial({
        wireframe: !0,
        fog: !1
    });
    this.cone = new THREE.Mesh(a, b), this.add(this.cone), this.update();
}, THREE.SpotLightHelper.prototype = Object.create(THREE.Object3D.prototype), THREE.SpotLightHelper.prototype.constructor = THREE.SpotLightHelper, 
THREE.SpotLightHelper.prototype.dispose = function() {
    this.cone.geometry.dispose(), this.cone.material.dispose();
}, THREE.SpotLightHelper.prototype.update = function() {
    var a = new THREE.Vector3(), b = new THREE.Vector3();
    return function() {
        var c = this.light.distance ? this.light.distance : 1e4, d = c * Math.tan(this.light.angle);
        this.cone.scale.set(d, d, c), a.setFromMatrixPosition(this.light.matrixWorld), b.setFromMatrixPosition(this.light.target.matrixWorld), 
        this.cone.lookAt(b.sub(a)), this.cone.material.color.copy(this.light.color).multiplyScalar(this.light.intensity);
    };
}(), THREE.VertexNormalsHelper = function(a, b, c, d) {
    this.object = a, this.size = void 0 !== b ? b : 1, b = void 0 !== c ? c : 16711680, 
    d = void 0 !== d ? d : 1, c = new THREE.Geometry(), a = a.geometry.faces;
    for (var e = 0, f = a.length; f > e; e++) for (var g = 0, h = a[e].vertexNormals.length; h > g; g++) c.vertices.push(new THREE.Vector3(), new THREE.Vector3());
    THREE.Line.call(this, c, new THREE.LineBasicMaterial({
        color: b,
        linewidth: d
    }), THREE.LinePieces), this.matrixAutoUpdate = !1, this.normalMatrix = new THREE.Matrix3(), 
    this.update();
}, THREE.VertexNormalsHelper.prototype = Object.create(THREE.Line.prototype), THREE.VertexNormalsHelper.prototype.constructor = THREE.VertexNormalsHelper, 
THREE.VertexNormalsHelper.prototype.update = function() {
    var a = new THREE.Vector3();
    return function(b) {
        b = [ "a", "b", "c", "d" ], this.object.updateMatrixWorld(!0), this.normalMatrix.getNormalMatrix(this.object.matrixWorld);
        for (var c = this.geometry.vertices, d = this.object.geometry.vertices, e = this.object.geometry.faces, f = this.object.matrixWorld, g = 0, h = 0, i = e.length; i > h; h++) for (var j = e[h], k = 0, l = j.vertexNormals.length; l > k; k++) {
            var m = j.vertexNormals[k];
            c[g].copy(d[j[b[k]]]).applyMatrix4(f), a.copy(m).applyMatrix3(this.normalMatrix).normalize().multiplyScalar(this.size), 
            a.add(c[g]), g += 1, c[g].copy(a), g += 1;
        }
        return this.geometry.verticesNeedUpdate = !0, this;
    };
}(), THREE.VertexTangentsHelper = function(a, b, c, d) {
    this.object = a, this.size = void 0 !== b ? b : 1, b = void 0 !== c ? c : 255, d = void 0 !== d ? d : 1, 
    c = new THREE.Geometry(), a = a.geometry.faces;
    for (var e = 0, f = a.length; f > e; e++) for (var g = 0, h = a[e].vertexTangents.length; h > g; g++) c.vertices.push(new THREE.Vector3()), 
    c.vertices.push(new THREE.Vector3());
    THREE.Line.call(this, c, new THREE.LineBasicMaterial({
        color: b,
        linewidth: d
    }), THREE.LinePieces), this.matrixAutoUpdate = !1, this.update();
}, THREE.VertexTangentsHelper.prototype = Object.create(THREE.Line.prototype), THREE.VertexTangentsHelper.prototype.constructor = THREE.VertexTangentsHelper, 
THREE.VertexTangentsHelper.prototype.update = function() {
    var a = new THREE.Vector3();
    return function(b) {
        b = [ "a", "b", "c", "d" ], this.object.updateMatrixWorld(!0);
        for (var c = this.geometry.vertices, d = this.object.geometry.vertices, e = this.object.geometry.faces, f = this.object.matrixWorld, g = 0, h = 0, i = e.length; i > h; h++) for (var j = e[h], k = 0, l = j.vertexTangents.length; l > k; k++) {
            var m = j.vertexTangents[k];
            c[g].copy(d[j[b[k]]]).applyMatrix4(f), a.copy(m).transformDirection(f).multiplyScalar(this.size), 
            a.add(c[g]), g += 1, c[g].copy(a), g += 1;
        }
        return this.geometry.verticesNeedUpdate = !0, this;
    };
}(), THREE.WireframeHelper = function(a, b) {
    var c = void 0 !== b ? b : 16777215, d = [ 0, 0 ], e = {}, f = function(a, b) {
        return a - b;
    }, g = [ "a", "b", "c" ], h = new THREE.BufferGeometry();
    if (a.geometry instanceof THREE.Geometry) {
        for (var i = a.geometry.vertices, j = a.geometry.faces, k = 0, l = new Uint32Array(6 * j.length), m = 0, n = j.length; n > m; m++) for (var o = j[m], p = 0; 3 > p; p++) {
            d[0] = o[g[p]], d[1] = o[g[(p + 1) % 3]], d.sort(f);
            var q = d.toString();
            void 0 === e[q] && (l[2 * k] = d[0], l[2 * k + 1] = d[1], e[q] = !0, k++);
        }
        for (d = new Float32Array(6 * k), m = 0, n = k; n > m; m++) for (p = 0; 2 > p; p++) k = i[l[2 * m + p]], 
        g = 6 * m + 3 * p, d[g + 0] = k.x, d[g + 1] = k.y, d[g + 2] = k.z;
        h.addAttribute("position", new THREE.BufferAttribute(d, 3));
    } else if (a.geometry instanceof THREE.BufferGeometry) {
        if (void 0 !== a.geometry.attributes.index) {
            i = a.geometry.attributes.position.array, n = a.geometry.attributes.index.array, 
            j = a.geometry.drawcalls, k = 0, 0 === j.length && (j = [ {
                count: n.length,
                index: 0,
                start: 0
            } ]);
            for (var l = new Uint32Array(2 * n.length), o = 0, r = j.length; r > o; ++o) for (var p = j[o].start, q = j[o].count, g = j[o].index, m = p, s = p + q; s > m; m += 3) for (p = 0; 3 > p; p++) d[0] = g + n[m + p], 
            d[1] = g + n[m + (p + 1) % 3], d.sort(f), q = d.toString(), void 0 === e[q] && (l[2 * k] = d[0], 
            l[2 * k + 1] = d[1], e[q] = !0, k++);
            for (d = new Float32Array(6 * k), m = 0, n = k; n > m; m++) for (p = 0; 2 > p; p++) g = 6 * m + 3 * p, 
            k = 3 * l[2 * m + p], d[g + 0] = i[k], d[g + 1] = i[k + 1], d[g + 2] = i[k + 2];
        } else for (i = a.geometry.attributes.position.array, k = i.length / 3, l = k / 3, 
        d = new Float32Array(6 * k), m = 0, n = l; n > m; m++) for (p = 0; 3 > p; p++) g = 18 * m + 6 * p, 
        l = 9 * m + 3 * p, d[g + 0] = i[l], d[g + 1] = i[l + 1], d[g + 2] = i[l + 2], k = 9 * m + (p + 1) % 3 * 3, 
        d[g + 3] = i[k], d[g + 4] = i[k + 1], d[g + 5] = i[k + 2];
        h.addAttribute("position", new THREE.BufferAttribute(d, 3));
    }
    THREE.Line.call(this, h, new THREE.LineBasicMaterial({
        color: c
    }), THREE.LinePieces), this.matrix = a.matrixWorld, this.matrixAutoUpdate = !1;
}, THREE.WireframeHelper.prototype = Object.create(THREE.Line.prototype), THREE.WireframeHelper.prototype.constructor = THREE.WireframeHelper, 
THREE.ImmediateRenderObject = function() {
    THREE.Object3D.call(this), this.render = function() {};
}, THREE.ImmediateRenderObject.prototype = Object.create(THREE.Object3D.prototype), 
THREE.ImmediateRenderObject.prototype.constructor = THREE.ImmediateRenderObject, 
THREE.MorphBlendMesh = function(a, b) {
    THREE.Mesh.call(this, a, b), this.animationsMap = {}, this.animationsList = [];
    var c = this.geometry.morphTargets.length;
    this.createAnimation("__default", 0, c - 1, c / 1), this.setAnimationWeight("__default", 1);
}, THREE.MorphBlendMesh.prototype = Object.create(THREE.Mesh.prototype), THREE.MorphBlendMesh.prototype.constructor = THREE.MorphBlendMesh, 
THREE.MorphBlendMesh.prototype.createAnimation = function(a, b, c, d) {
    b = {
        startFrame: b,
        endFrame: c,
        length: c - b + 1,
        fps: d,
        duration: (c - b) / d,
        lastFrame: 0,
        currentFrame: 0,
        active: !1,
        time: 0,
        direction: 1,
        weight: 1,
        directionBackwards: !1,
        mirroredLoop: !1
    }, this.animationsMap[a] = b, this.animationsList.push(b);
}, THREE.MorphBlendMesh.prototype.autoCreateAnimations = function(a) {
    for (var b, c = /([a-z]+)_?(\d+)/, d = {}, e = this.geometry, f = 0, g = e.morphTargets.length; g > f; f++) {
        var h = e.morphTargets[f].name.match(c);
        if (h && 1 < h.length) {
            var i = h[1];
            d[i] || (d[i] = {
                start: 1/0,
                end: -1/0
            }), h = d[i], f < h.start && (h.start = f), f > h.end && (h.end = f), b || (b = i);
        }
    }
    for (i in d) h = d[i], this.createAnimation(i, h.start, h.end, a);
    this.firstAnimation = b;
}, THREE.MorphBlendMesh.prototype.setAnimationDirectionForward = function(a) {
    (a = this.animationsMap[a]) && (a.direction = 1, a.directionBackwards = !1);
}, THREE.MorphBlendMesh.prototype.setAnimationDirectionBackward = function(a) {
    (a = this.animationsMap[a]) && (a.direction = -1, a.directionBackwards = !0);
}, THREE.MorphBlendMesh.prototype.setAnimationFPS = function(a, b) {
    var c = this.animationsMap[a];
    c && (c.fps = b, c.duration = (c.end - c.start) / c.fps);
}, THREE.MorphBlendMesh.prototype.setAnimationDuration = function(a, b) {
    var c = this.animationsMap[a];
    c && (c.duration = b, c.fps = (c.end - c.start) / c.duration);
}, THREE.MorphBlendMesh.prototype.setAnimationWeight = function(a, b) {
    var c = this.animationsMap[a];
    c && (c.weight = b);
}, THREE.MorphBlendMesh.prototype.setAnimationTime = function(a, b) {
    var c = this.animationsMap[a];
    c && (c.time = b);
}, THREE.MorphBlendMesh.prototype.getAnimationTime = function(a) {
    var b = 0;
    return (a = this.animationsMap[a]) && (b = a.time), b;
}, THREE.MorphBlendMesh.prototype.getAnimationDuration = function(a) {
    var b = -1;
    return (a = this.animationsMap[a]) && (b = a.duration), b;
}, THREE.MorphBlendMesh.prototype.playAnimation = function(a) {
    var b = this.animationsMap[a];
    b ? (b.time = 0, b.active = !0) : THREE.warn("THREE.MorphBlendMesh: animation[" + a + "] undefined in .playAnimation()");
}, THREE.MorphBlendMesh.prototype.stopAnimation = function(a) {
    (a = this.animationsMap[a]) && (a.active = !1);
}, THREE.MorphBlendMesh.prototype.update = function(a) {
    for (var b = 0, c = this.animationsList.length; c > b; b++) {
        var d = this.animationsList[b];
        if (d.active) {
            var e = d.duration / d.length;
            d.time += d.direction * a, d.mirroredLoop ? (d.time > d.duration || 0 > d.time) && (d.direction *= -1, 
            d.time > d.duration && (d.time = d.duration, d.directionBackwards = !0), 0 > d.time && (d.time = 0, 
            d.directionBackwards = !1)) : (d.time %= d.duration, 0 > d.time && (d.time += d.duration));
            var f = d.startFrame + THREE.Math.clamp(Math.floor(d.time / e), 0, d.length - 1), g = d.weight;
            f !== d.currentFrame && (this.morphTargetInfluences[d.lastFrame] = 0, this.morphTargetInfluences[d.currentFrame] = 1 * g, 
            this.morphTargetInfluences[f] = 0, d.lastFrame = d.currentFrame, d.currentFrame = f), 
            e = d.time % e / e, d.directionBackwards && (e = 1 - e), this.morphTargetInfluences[d.currentFrame] = e * g, 
            this.morphTargetInfluences[d.lastFrame] = (1 - e) * g;
        }
    }
}, !function(a, b, c) {
    function d(c, f) {
        if (!b[c]) {
            if (!a[c]) {
                var g = "function" == typeof require && require;
                if (!f && g) return g(c, !0);
                if (e) return e(c, !0);
                throw new Error("Cannot find module '" + c + "'");
            }
            var h = b[c] = {
                exports: {}
            };
            a[c][0].call(h.exports, function(b) {
                var e = a[c][1][b];
                return d(e ? e : b);
            }, h, h.exports);
        }
        return b[c].exports;
    }
    for (var e = "function" == typeof require && require, f = 0; f < c.length; f++) d(c[f]);
    return d;
}({
    1: [ function() {}, {} ],
    2: [ function(a, b) {
        var c = b.exports = function(a) {
            this.pos = 0, this._buf = [], this.size = a;
        };
        c.prototype.get = function(a) {
            return void 0 == a && (a = 0), a >= this.size ? void 0 : a >= this._buf.length ? void 0 : this._buf[(this.pos - a - 1) % this.size];
        }, c.prototype.push = function(a) {
            return this._buf[this.pos % this.size] = a, this.pos++;
        };
    }, {} ],
    3: [ function(a, b) {
        var c = a("../protocol").chooseProtocol, d = a("events").EventEmitter, e = a("underscore"), f = b.exports = function(a) {
            this.opts = e.defaults(a || {}, {
                host: "127.0.0.1",
                enableGestures: !1,
                port: 6437,
                background: !1,
                requestProtocolVersion: 4
            }), this.host = this.opts.host, this.port = this.opts.port, this.protocolVersionVerified = !1, 
            this.on("ready", function() {
                this.enableGestures(this.opts.enableGestures), this.setBackground(this.opts.background);
            });
        };
        f.prototype.getUrl = function() {
            return "ws://" + this.host + ":" + this.port + "/v" + this.opts.requestProtocolVersion + ".json";
        }, f.prototype.setBackground = function(a) {
            this.opts.background = a, this.protocol && this.protocol.sendBackground && this.background !== this.opts.background && (this.background = this.opts.background, 
            this.protocol.sendBackground(this, this.opts.background));
        }, f.prototype.handleOpen = function() {
            this.connected || (this.connected = !0, this.emit("connect"));
        }, f.prototype.enableGestures = function(a) {
            this.gesturesEnabled = a ? !0 : !1, this.send(this.protocol.encode({
                enableGestures: this.gesturesEnabled
            }));
        }, f.prototype.handleClose = function(a) {
            this.connected && (this.disconnect(), 1001 === a && this.opts.requestProtocolVersion > 1 && (this.protocolVersionVerified ? this.protocolVersionVerified = !1 : this.opts.requestProtocolVersion--), 
            this.startReconnection());
        }, f.prototype.startReconnection = function() {
            var a = this;
            this.reconnectionTimer = setInterval(function() {
                a.reconnect();
            }, 1e3);
        }, f.prototype.disconnect = function() {
            return this.socket ? (this.socket.close(), delete this.socket, delete this.protocol, 
            delete this.background, this.connected && (this.connected = !1, this.emit("disconnect")), 
            !0) : void 0;
        }, f.prototype.reconnect = function() {
            this.connected ? clearInterval(this.reconnectionTimer) : (this.disconnect(), this.connect());
        }, f.prototype.handleData = function(a) {
            var b, d = JSON.parse(a);
            void 0 === this.protocol ? (b = this.protocol = c(d), this.protocolVersionVerified = !0, 
            this.emit("ready")) : b = this.protocol(d), this.emit(b.type, b);
        }, f.prototype.connect = function() {
            return this.socket ? void 0 : (this.socket = this.setupSocket(), !0);
        }, f.prototype.send = function(a) {
            this.socket.send(a);
        }, f.prototype.reportFocus = function(a) {
            this.focusedState !== a && (this.focusedState = a, this.emit(this.focusedState ? "focus" : "blur"), 
            this.protocol && this.protocol.sendFocused && this.protocol.sendFocused(this, this.focusedState));
        }, e.extend(f.prototype, d.prototype);
    }, {
        "../protocol": 13,
        events: 19,
        underscore: 22
    } ],
    4: [ function(a, b) {
        var c = b.exports = a("./base"), d = a("underscore"), e = b.exports = function(a) {
            c.call(this, a);
            var b = this;
            this.on("ready", function() {
                b.startFocusLoop();
            }), this.on("disconnect", function() {
                b.stopFocusLoop();
            });
        };
        d.extend(e.prototype, c.prototype), e.prototype.setupSocket = function() {
            var a = this, b = new WebSocket(this.getUrl());
            return b.onopen = function() {
                a.handleOpen();
            }, b.onclose = function(b) {
                a.handleClose(b.code, b.reason);
            }, b.onmessage = function(b) {
                a.handleData(b.data);
            }, b;
        }, e.prototype.startFocusLoop = function() {
            if (!this.focusDetectorTimer) {
                var a = this, b = null;
                b = "undefined" != typeof document.hidden ? "hidden" : "undefined" != typeof document.mozHidden ? "mozHidden" : "undefined" != typeof document.msHidden ? "msHidden" : "undefined" != typeof document.webkitHidden ? "webkitHidden" : void 0, 
                void 0 === a.windowVisible && (a.windowVisible = void 0 === b ? !0 : document[b] === !1);
                var c = window.addEventListener("focus", function() {
                    a.windowVisible = !0, e();
                }), d = window.addEventListener("blur", function() {
                    a.windowVisible = !1, e();
                });
                this.on("disconnect", function() {
                    window.removeEventListener("focus", c), window.removeEventListener("blur", d);
                });
                var e = function() {
                    var c = void 0 === b ? !0 : document[b] === !1;
                    a.reportFocus(c && a.windowVisible);
                };
                this.focusDetectorTimer = setInterval(e, 100);
            }
        }, e.prototype.stopFocusLoop = function() {
            this.focusDetectorTimer && (clearTimeout(this.focusDetectorTimer), delete this.focusDetectorTimer);
        };
    }, {
        "./base": 3,
        underscore: 22
    } ],
    5: [ function(a, b) {
        var c = a("__browserify_process"), d = a("./frame"), e = a("./hand"), f = a("./pointable"), g = a("./circular_buffer"), h = a("./pipeline"), i = a("events").EventEmitter, j = a("./gesture").gestureListener, k = a("underscore"), l = b.exports = function(b) {
            var e = "undefined" != typeof c && c.versions && c.versions.node, f = this;
            b = k.defaults(b || {}, {
                inNode: e
            }), this.inNode = b.inNode, b = k.defaults(b || {}, {
                frameEventName: this.useAnimationLoop() ? "animationFrame" : "deviceFrame",
                suppressAnimationLoop: !this.useAnimationLoop(),
                loopWhileDisconnected: !1,
                useAllPlugins: !1
            }), this.animationFrameRequested = !1, this.onAnimationFrame = function() {
                f.emit("animationFrame", f.lastConnectionFrame), f.loopWhileDisconnected && (f.connection.focusedState || f.connection.opts.background) ? window.requestAnimationFrame(f.onAnimationFrame) : f.animationFrameRequested = !1;
            }, this.suppressAnimationLoop = b.suppressAnimationLoop, this.loopWhileDisconnected = b.loopWhileDisconnected, 
            this.frameEventName = b.frameEventName, this.useAllPlugins = b.useAllPlugins, this.history = new g(200), 
            this.lastFrame = d.Invalid, this.lastValidFrame = d.Invalid, this.lastConnectionFrame = d.Invalid, 
            this.accumulatedGestures = [], this.connectionType = void 0 === b.connectionType ? a(this.inBrowser() ? "./connection/browser" : "./connection/node") : b.connectionType, 
            this.connection = new this.connectionType(b), this.plugins = {}, this._pluginPipelineSteps = {}, 
            this._pluginExtendedMethods = {}, b.useAllPlugins && this.useRegisteredPlugins(), 
            this.setupConnectionEvents();
        };
        l.prototype.gesture = function(a, b) {
            var c = j(this, a);
            return void 0 !== b && c.stop(b), c;
        }, l.prototype.setBackground = function(a) {
            return this.connection.setBackground(a), this;
        }, l.prototype.inBrowser = function() {
            return !this.inNode;
        }, l.prototype.useAnimationLoop = function() {
            return this.inBrowser() && !this.inBackgroundPage();
        }, l.prototype.inBackgroundPage = function() {
            return "undefined" != typeof chrome && chrome.extension && chrome.extension.getBackgroundPage && chrome.extension.getBackgroundPage() === window;
        }, l.prototype.connect = function() {
            return this.connection.connect(), this;
        }, l.prototype.runAnimationLoop = function() {
            this.suppressAnimationLoop || this.animationFrameRequested || (this.animationFrameRequested = !0, 
            window.requestAnimationFrame(this.onAnimationFrame));
        }, l.prototype.disconnect = function() {
            return this.connection.disconnect(), this;
        }, l.prototype.frame = function(a) {
            return this.history.get(a) || d.Invalid;
        }, l.prototype.loop = function(a) {
            switch (a.length) {
              case 1:
                this.on(this.frameEventName, a);
                break;

              case 2:
                var b = this, c = function(d) {
                    a(d, function() {
                        b.lastFrame != d ? c(b.lastFrame) : b.once(b.frameEventName, c);
                    });
                };
                this.once(this.frameEventName, c);
            }
            return this.connect();
        }, l.prototype.addStep = function(a) {
            this.pipeline || (this.pipeline = new h(this)), this.pipeline.addStep(a);
        }, l.prototype.processFrame = function(a) {
            a.gestures && (this.accumulatedGestures = this.accumulatedGestures.concat(a.gestures)), 
            this.lastConnectionFrame = a, this.runAnimationLoop(), this.emit("deviceFrame", a);
        }, l.prototype.processFinishedFrame = function(a) {
            if (this.lastFrame = a, a.valid && (this.lastValidFrame = a), a.controller = this, 
            a.historyIdx = this.history.push(a), a.gestures) {
                a.gestures = this.accumulatedGestures, this.accumulatedGestures = [];
                for (var b = 0; b != a.gestures.length; b++) this.emit("gesture", a.gestures[b], a);
            }
            this.pipeline && (a = this.pipeline.run(a), a || (a = d.Invalid)), this.emit("frame", a);
        }, l.prototype.setupConnectionEvents = function() {
            var a = this;
            this.connection.on("frame", function(b) {
                a.processFrame(b);
            }), this.on(this.frameEventName, function(b) {
                a.processFinishedFrame(b);
            }), this.connection.on("disconnect", function() {
                a.emit("disconnect");
            }), this.connection.on("ready", function() {
                a.emit("ready");
            }), this.connection.on("connect", function() {
                a.emit("connect");
            }), this.connection.on("focus", function() {
                a.emit("focus"), a.runAnimationLoop();
            }), this.connection.on("blur", function() {
                a.emit("blur");
            }), this.connection.on("protocol", function(b) {
                a.emit("protocol", b);
            }), this.connection.on("deviceConnect", function(b) {
                a.emit(b.state ? "deviceConnected" : "deviceDisconnected");
            });
        }, l._pluginFactories = {}, l.plugin = function(a, b) {
            if (this._pluginFactories[a]) throw 'Plugin "' + a + '" already registered';
            return this._pluginFactories[a] = b;
        }, l.plugins = function() {
            return k.keys(this._pluginFactories);
        }, l.prototype.use = function(a, b) {
            var c, g, i, j, m;
            if (g = "function" == typeof a ? a : l._pluginFactories[a], !g) throw "Leap Plugin " + a + " not found.";
            if (b || (b = {}), this.plugins[a]) return k.extend(this.plugins[a], b), this;
            this.plugins[a] = b, j = g.call(this, b);
            for (i in j) if (c = j[i], "function" == typeof c) this.pipeline || (this.pipeline = new h(this)), 
            this._pluginPipelineSteps[a] || (this._pluginPipelineSteps[a] = []), this._pluginPipelineSteps[a].push(this.pipeline.addWrappedStep(i, c)); else {
                switch (this._pluginExtendedMethods[a] || (this._pluginExtendedMethods[a] = []), 
                i) {
                  case "frame":
                    m = d;
                    break;

                  case "hand":
                    m = e;
                    break;

                  case "pointable":
                    m = f;
                    break;

                  default:
                    throw a + ' specifies invalid object type "' + i + '" for prototypical extension';
                }
                k.extend(m.prototype, c), k.extend(m.Invalid, c), this._pluginExtendedMethods[a].push([ m, c ]);
            }
            return this;
        }, l.prototype.stopUsing = function(a) {
            var b, c, d = this._pluginPipelineSteps[a], e = this._pluginExtendedMethods[a], f = 0;
            if (this.plugins[a]) {
                if (d) for (f = 0; f < d.length; f++) this.pipeline.removeStep(d[f]);
                if (e) for (f = 0; f < e.length; f++) {
                    b = e[f][0], c = e[f][1];
                    for (var g in c) delete b.prototype[g], delete b.Invalid[g];
                }
                return delete this.plugins[a], this;
            }
        }, l.prototype.useRegisteredPlugins = function() {
            for (var a in l._pluginFactories) this.use(a);
        }, k.extend(l.prototype, i.prototype);
    }, {
        "./circular_buffer": 2,
        "./connection/browser": 4,
        "./connection/node": 18,
        "./frame": 6,
        "./gesture": 7,
        "./hand": 8,
        "./pipeline": 11,
        "./pointable": 12,
        __browserify_process: 20,
        events: 19,
        underscore: 22
    } ],
    6: [ function(a, b) {
        var c = a("./hand"), d = a("./pointable"), e = a("./gesture").createGesture, f = a("gl-matrix"), g = f.mat3, h = f.vec3, i = a("./interaction_box"), j = a("underscore"), k = b.exports = function(a) {
            this.valid = !0, this.id = a.id, this.timestamp = a.timestamp, this.hands = [], 
            this.handsMap = {}, this.pointables = [], this.tools = [], this.fingers = [], a.interactionBox && (this.interactionBox = new i(a.interactionBox)), 
            this.gestures = [], this.pointablesMap = {}, this._translation = a.t, this._rotation = j.flatten(a.r), 
            this._scaleFactor = a.s, this.data = a, this.type = "frame", this.currentFrameRate = a.currentFrameRate;
            for (var b = {}, f = 0, g = a.hands.length; f != g; f++) {
                var h = new c(a.hands[f]);
                h.frame = this, this.hands.push(h), this.handsMap[h.id] = h, b[h.id] = f;
            }
            for (var k = 0, l = a.pointables.length; k != l; k++) {
                var m = new d(a.pointables[k]);
                if (m.frame = this, this.pointables.push(m), this.pointablesMap[m.id] = m, (m.tool ? this.tools : this.fingers).push(m), 
                void 0 !== m.handId && b.hasOwnProperty(m.handId)) {
                    var h = this.hands[b[m.handId]];
                    h.pointables.push(m), (m.tool ? h.tools : h.fingers).push(m);
                }
            }
            if (a.gestures) for (var n = 0, o = a.gestures.length; n != o; n++) this.gestures.push(e(a.gestures[n]));
        };
        k.prototype.tool = function(a) {
            var b = this.pointable(a);
            return b.tool ? b : d.Invalid;
        }, k.prototype.pointable = function(a) {
            return this.pointablesMap[a] || d.Invalid;
        }, k.prototype.finger = function(a) {
            var b = this.pointable(a);
            return b.tool ? d.Invalid : b;
        }, k.prototype.hand = function(a) {
            return this.handsMap[a] || c.Invalid;
        }, k.prototype.rotationAngle = function(a, b) {
            if (!this.valid || !a.valid) return 0;
            var c = this.rotationMatrix(a), d = .5 * (c[0] + c[4] + c[8] - 1), e = Math.acos(d);
            if (e = isNaN(e) ? 0 : e, void 0 !== b) {
                var f = this.rotationAxis(a);
                e *= h.dot(f, h.normalize(h.create(), b));
            }
            return e;
        }, k.prototype.rotationAxis = function(a) {
            return this.valid && a.valid ? h.normalize(h.create(), [ this._rotation[7] - a._rotation[5], this._rotation[2] - a._rotation[6], this._rotation[3] - a._rotation[1] ]) : h.create();
        }, k.prototype.rotationMatrix = function(a) {
            if (!this.valid || !a.valid) return g.create();
            var b = g.transpose(g.create(), this._rotation);
            return g.multiply(g.create(), a._rotation, b);
        }, k.prototype.scaleFactor = function(a) {
            return this.valid && a.valid ? Math.exp(this._scaleFactor - a._scaleFactor) : 1;
        }, k.prototype.translation = function(a) {
            return this.valid && a.valid ? h.subtract(h.create(), this._translation, a._translation) : h.create();
        }, k.prototype.toString = function() {
            var a = "Frame [ id:" + this.id + " | timestamp:" + this.timestamp + " | Hand count:(" + this.hands.length + ") | Pointable count:(" + this.pointables.length + ")";
            return this.gestures && (a += " | Gesture count:(" + this.gestures.length + ")"), 
            a += " ]";
        }, k.prototype.dump = function() {
            var a = "";
            a += "Frame Info:<br/>", a += this.toString(), a += "<br/><br/>Hands:<br/>";
            for (var b = 0, c = this.hands.length; b != c; b++) a += "  " + this.hands[b].toString() + "<br/>";
            a += "<br/><br/>Pointables:<br/>";
            for (var d = 0, e = this.pointables.length; d != e; d++) a += "  " + this.pointables[d].toString() + "<br/>";
            if (this.gestures) {
                a += "<br/><br/>Gestures:<br/>";
                for (var f = 0, g = this.gestures.length; f != g; f++) a += "  " + this.gestures[f].toString() + "<br/>";
            }
            return a += "<br/><br/>Raw JSON:<br/>", a += JSON.stringify(this.data);
        }, k.Invalid = {
            valid: !1,
            hands: [],
            fingers: [],
            tools: [],
            gestures: [],
            pointables: [],
            pointable: function() {
                return d.Invalid;
            },
            finger: function() {
                return d.Invalid;
            },
            hand: function() {
                return c.Invalid;
            },
            toString: function() {
                return "invalid frame";
            },
            dump: function() {
                return this.toString();
            },
            rotationAngle: function() {
                return 0;
            },
            rotationMatrix: function() {
                return g.create();
            },
            rotationAxis: function() {
                return h.create();
            },
            scaleFactor: function() {
                return 1;
            },
            translation: function() {
                return h.create();
            }
        };
    }, {
        "./gesture": 7,
        "./hand": 8,
        "./interaction_box": 10,
        "./pointable": 12,
        "gl-matrix": 21,
        underscore: 22
    } ],
    7: [ function(a, b, c) {
        var d = a("gl-matrix"), e = d.vec3, f = a("events").EventEmitter, g = a("underscore"), h = (c.createGesture = function(a) {
            var b;
            switch (a.type) {
              case "circle":
                b = new i(a);
                break;

              case "swipe":
                b = new j(a);
                break;

              case "screenTap":
                b = new k(a);
                break;

              case "keyTap":
                b = new l(a);
                break;

              default:
                throw "unkown gesture type";
            }
            return b.id = a.id, b.handIds = a.handIds, b.pointableIds = a.pointableIds, b.duration = a.duration, 
            b.state = a.state, b.type = a.type, b;
        }, c.gestureListener = function(a, b) {
            var c = {}, d = {};
            a.on("gesture", function(a, e) {
                if (a.type == b) {
                    if (("start" == a.state || "stop" == a.state) && void 0 === d[a.id]) {
                        var f = new h(a, e);
                        d[a.id] = f, g.each(c, function(a, b) {
                            f.on(b, a);
                        });
                    }
                    d[a.id].update(a, e), "stop" == a.state && delete d[a.id];
                }
            });
            var e = {
                start: function(a) {
                    return c.start = a, e;
                },
                stop: function(a) {
                    return c.stop = a, e;
                },
                complete: function(a) {
                    return c.stop = a, e;
                },
                update: function(a) {
                    return c.update = a, e;
                }
            };
            return e;
        }, c.Gesture = function(a, b) {
            this.gestures = [ a ], this.frames = [ b ];
        });
        h.prototype.update = function(a, b) {
            this.lastGesture = a, this.lastFrame = b, this.gestures.push(a), this.frames.push(b), 
            this.emit(a.state, this);
        }, h.prototype.translation = function() {
            return e.subtract(e.create(), this.lastGesture.startPosition, this.lastGesture.position);
        }, g.extend(h.prototype, f.prototype);
        var i = function(a) {
            this.center = a.center, this.normal = a.normal, this.progress = a.progress, this.radius = a.radius;
        };
        i.prototype.toString = function() {
            return "CircleGesture [" + JSON.stringify(this) + "]";
        };
        var j = function(a) {
            this.startPosition = a.startPosition, this.position = a.position, this.direction = a.direction, 
            this.speed = a.speed;
        };
        j.prototype.toString = function() {
            return "SwipeGesture [" + JSON.stringify(this) + "]";
        };
        var k = function(a) {
            this.position = a.position, this.direction = a.direction, this.progress = a.progress;
        };
        k.prototype.toString = function() {
            return "ScreenTapGesture [" + JSON.stringify(this) + "]";
        };
        var l = function(a) {
            this.position = a.position, this.direction = a.direction, this.progress = a.progress;
        };
        l.prototype.toString = function() {
            return "KeyTapGesture [" + JSON.stringify(this) + "]";
        };
    }, {
        events: 19,
        "gl-matrix": 21,
        underscore: 22
    } ],
    8: [ function(a, b) {
        var c = a("./pointable"), d = a("gl-matrix"), e = d.mat3, f = d.vec3, g = a("underscore"), h = b.exports = function(a) {
            this.id = a.id, this.palmPosition = a.palmPosition, this.direction = a.direction, 
            this.palmVelocity = a.palmVelocity, this.palmNormal = a.palmNormal, this.sphereCenter = a.sphereCenter, 
            this.sphereRadius = a.sphereRadius, this.valid = !0, this.pointables = [], this.fingers = [], 
            this.tools = [], this._translation = a.t, this._rotation = g.flatten(a.r), this._scaleFactor = a.s, 
            this.timeVisible = a.timeVisible, this.stabilizedPalmPosition = a.stabilizedPalmPosition;
        };
        h.prototype.finger = function(a) {
            var b = this.frame.finger(a);
            return b && b.handId == this.id ? b : c.Invalid;
        }, h.prototype.rotationAngle = function(a, b) {
            if (!this.valid || !a.valid) return 0;
            var c = a.hand(this.id);
            if (!c.valid) return 0;
            var d = this.rotationMatrix(a), e = .5 * (d[0] + d[4] + d[8] - 1), g = Math.acos(e);
            if (g = isNaN(g) ? 0 : g, void 0 !== b) {
                var h = this.rotationAxis(a);
                g *= f.dot(h, f.normalize(f.create(), b));
            }
            return g;
        }, h.prototype.rotationAxis = function(a) {
            if (!this.valid || !a.valid) return f.create();
            var b = a.hand(this.id);
            return b.valid ? f.normalize(f.create(), [ this._rotation[7] - b._rotation[5], this._rotation[2] - b._rotation[6], this._rotation[3] - b._rotation[1] ]) : f.create();
        }, h.prototype.rotationMatrix = function(a) {
            if (!this.valid || !a.valid) return e.create();
            var b = a.hand(this.id);
            if (!b.valid) return e.create();
            var c = e.transpose(e.create(), this._rotation), d = e.multiply(e.create(), b._rotation, c);
            return d;
        }, h.prototype.scaleFactor = function(a) {
            if (!this.valid || !a.valid) return 1;
            var b = a.hand(this.id);
            return b.valid ? Math.exp(this._scaleFactor - b._scaleFactor) : 1;
        }, h.prototype.translation = function(a) {
            if (!this.valid || !a.valid) return f.create();
            var b = a.hand(this.id);
            return b.valid ? [ this._translation[0] - b._translation[0], this._translation[1] - b._translation[1], this._translation[2] - b._translation[2] ] : f.create();
        }, h.prototype.toString = function() {
            return "Hand [ id: " + this.id + " | palm velocity:" + this.palmVelocity + " | sphere center:" + this.sphereCenter + " ] ";
        }, h.prototype.pitch = function() {
            return Math.atan2(this.direction[1], -this.direction[2]);
        }, h.prototype.yaw = function() {
            return Math.atan2(this.direction[0], -this.direction[2]);
        }, h.prototype.roll = function() {
            return Math.atan2(this.palmNormal[0], -this.palmNormal[1]);
        }, h.Invalid = {
            valid: !1,
            fingers: [],
            tools: [],
            pointables: [],
            pointable: function() {
                return c.Invalid;
            },
            finger: function() {
                return c.Invalid;
            },
            toString: function() {
                return "invalid frame";
            },
            dump: function() {
                return this.toString();
            },
            rotationAngle: function() {
                return 0;
            },
            rotationMatrix: function() {
                return e.create();
            },
            rotationAxis: function() {
                return f.create();
            },
            scaleFactor: function() {
                return 1;
            },
            translation: function() {
                return f.create();
            }
        };
    }, {
        "./pointable": 12,
        "gl-matrix": 21,
        underscore: 22
    } ],
    9: [ function(a, b) {
        a("./_header"), b.exports = {
            Controller: a("./controller"),
            Frame: a("./frame"),
            Gesture: a("./gesture"),
            Hand: a("./hand"),
            Pointable: a("./pointable"),
            InteractionBox: a("./interaction_box"),
            CircularBuffer: a("./circular_buffer"),
            UI: a("./ui"),
            glMatrix: a("gl-matrix"),
            mat3: a("gl-matrix").mat3,
            vec3: a("gl-matrix").vec3,
            loopController: void 0,
            version: a("./version.js"),
            loop: function(a, b) {
                return void 0 === b && (b = a, a = {}), a.useAllPlugins || (a.useAllPlugins = !0), 
                this.loopController || (this.loopController = new this.Controller(a)), this.loopController.loop(b), 
                this.loopController;
            },
            plugin: function(a, b) {
                this.Controller.plugin(a, b);
            }
        };
    }, {
        "./_header": 1,
        "./circular_buffer": 2,
        "./controller": 5,
        "./frame": 6,
        "./gesture": 7,
        "./hand": 8,
        "./interaction_box": 10,
        "./pointable": 12,
        "./ui": 14,
        "./version.js": 17,
        "gl-matrix": 21
    } ],
    10: [ function(a, b) {
        var c = a("gl-matrix"), d = c.vec3, e = b.exports = function(a) {
            this.valid = !0, this.center = a.center, this.size = a.size, this.width = a.size[0], 
            this.height = a.size[1], this.depth = a.size[2];
        };
        e.prototype.denormalizePoint = function(a) {
            return d.fromValues((a[0] - .5) * this.size[0] + this.center[0], (a[1] - .5) * this.size[1] + this.center[1], (a[2] - .5) * this.size[2] + this.center[2]);
        }, e.prototype.normalizePoint = function(a, b) {
            var c = d.fromValues((a[0] - this.center[0]) / this.size[0] + .5, (a[1] - this.center[1]) / this.size[1] + .5, (a[2] - this.center[2]) / this.size[2] + .5);
            return b && (c[0] = Math.min(Math.max(c[0], 0), 1), c[1] = Math.min(Math.max(c[1], 0), 1), 
            c[2] = Math.min(Math.max(c[2], 0), 1)), c;
        }, e.prototype.toString = function() {
            return "InteractionBox [ width:" + this.width + " | height:" + this.height + " | depth:" + this.depth + " ]";
        }, e.Invalid = {
            valid: !1
        };
    }, {
        "gl-matrix": 21
    } ],
    11: [ function(a, b) {
        var c = b.exports = function(a) {
            this.steps = [], this.controller = a;
        };
        c.prototype.addStep = function(a) {
            this.steps.push(a);
        }, c.prototype.run = function(a) {
            for (var b = this.steps.length, c = 0; c != b && a; c++) a = this.steps[c](a);
            return a;
        }, c.prototype.removeStep = function(a) {
            var b = this.steps.indexOf(a);
            if (-1 === b) throw "Step not found in pipeline";
            this.steps.splice(b, 1);
        }, c.prototype.addWrappedStep = function(a, b) {
            var c = this.controller, d = function(d) {
                var e, f, g;
                for (e = "frame" == a ? [ d ] : d[a + "s"] || [], f = 0, g = e.length; g > f; f++) b.call(c, e[f]);
                return d;
            };
            return this.addStep(d), d;
        };
    }, {} ],
    12: [ function(a, b) {
        var c = a("gl-matrix"), d = (c.vec3, b.exports = function(a) {
            this.valid = !0, this.id = a.id, this.handId = a.handId, this.length = a.length, 
            this.tool = a.tool, this.width = a.width, this.direction = a.direction, this.stabilizedTipPosition = a.stabilizedTipPosition, 
            this.tipPosition = a.tipPosition, this.tipVelocity = a.tipVelocity, this.touchZone = a.touchZone, 
            this.touchDistance = a.touchDistance, this.timeVisible = a.timeVisible;
        });
        d.prototype.toString = function() {
            return 1 == this.tool ? "Pointable [ id:" + this.id + " " + this.length + "mmx | with:" + this.width + "mm | direction:" + this.direction + " ]" : "Pointable [ id:" + this.id + " " + this.length + "mmx | direction: " + this.direction + " ]";
        }, d.prototype.hand = function() {
            return this.frame.hand(this.handId);
        }, d.Invalid = {
            valid: !1
        };
    }, {
        "gl-matrix": 21
    } ],
    13: [ function(a, b, c) {
        var d = a("./frame"), e = function(a) {
            this.type = a.type, this.state = a.state;
        }, f = (c.chooseProtocol = function(a) {
            var b;
            switch (a.version) {
              case 1:
              case 2:
              case 3:
              case 4:
                b = f(a.version, function(a) {
                    return a.event ? new e(a.event) : new d(a);
                }), b.sendBackground = function(a, c) {
                    a.send(b.encode({
                        background: c
                    }));
                }, b.sendFocused = function(a, c) {
                    a.send(b.encode({
                        focused: c
                    }));
                };
                break;

              default:
                throw "unrecognized version";
            }
            return b;
        }, function(a, b) {
            var c = b;
            return c.encode = function(a) {
                return JSON.stringify(a);
            }, c.version = a, c.versionLong = "Version " + a, c.type = "protocol", c;
        });
    }, {
        "./frame": 6
    } ],
    14: [ function(a, b, c) {
        c.UI = {
            Region: a("./ui/region"),
            Cursor: a("./ui/cursor")
        };
    }, {
        "./ui/cursor": 15,
        "./ui/region": 16
    } ],
    15: [ function(a, b) {
        b.exports = function() {
            return function(a) {
                var b = a.pointables.sort(function(a, b) {
                    return a.z - b.z;
                })[0];
                return b && b.valid && (a.cursorPosition = b.tipPosition), a;
            };
        };
    }, {} ],
    16: [ function(a, b) {
        var c = a("events").EventEmitter, d = a("underscore"), e = b.exports = function(a, b) {
            this.start = new Vector(a), this.end = new Vector(b), this.enteredFrame = null;
        };
        e.prototype.hasPointables = function(a) {
            for (var b = 0; b != a.pointables.length; b++) {
                var c = a.pointables[b].tipPosition;
                if (c.x >= this.start.x && c.x <= this.end.x && c.y >= this.start.y && c.y <= this.end.y && c.z >= this.start.z && c.z <= this.end.z) return !0;
            }
            return !1;
        }, e.prototype.listener = function(a) {
            var b = this;
            return a && a.nearThreshold && this.setupNearRegion(a.nearThreshold), function(a) {
                return b.updatePosition(a);
            };
        }, e.prototype.clipper = function() {
            var a = this;
            return function(b) {
                return a.updatePosition(b), a.enteredFrame ? b : null;
            };
        }, e.prototype.setupNearRegion = function(a) {
            var b = this.nearRegion = new e([ this.start.x - a, this.start.y - a, this.start.z - a ], [ this.end.x + a, this.end.y + a, this.end.z + a ]), c = this;
            b.on("enter", function(a) {
                c.emit("near", a);
            }), b.on("exit", function(a) {
                c.emit("far", a);
            }), c.on("exit", function(a) {
                c.emit("near", a);
            });
        }, e.prototype.updatePosition = function(a) {
            return this.nearRegion && this.nearRegion.updatePosition(a), this.hasPointables(a) && null == this.enteredFrame ? (this.enteredFrame = a, 
            this.emit("enter", this.enteredFrame)) : this.hasPointables(a) || null == this.enteredFrame || (this.enteredFrame = null, 
            this.emit("exit", this.enteredFrame)), a;
        }, e.prototype.normalize = function(a) {
            return new Vector([ (a.x - this.start.x) / (this.end.x - this.start.x), (a.y - this.start.y) / (this.end.y - this.start.y), (a.z - this.start.z) / (this.end.z - this.start.z) ]);
        }, e.prototype.mapToXY = function(a, b, c) {
            var d = this.normalize(a), e = d.x, f = d.y;
            return e > 1 ? e = 1 : -1 > e && (e = -1), f > 1 ? f = 1 : -1 > f && (f = -1), [ (e + 1) / 2 * b, (1 - f) / 2 * c, d.z ];
        }, d.extend(e.prototype, c.prototype);
    }, {
        events: 19,
        underscore: 22
    } ],
    17: [ function(a, b) {
        b.exports = {
            full: "0.4.3",
            major: 0,
            minor: 4,
            dot: 3
        };
    }, {} ],
    18: [ function() {}, {} ],
    19: [ function(a, b, c) {
        function d(a, b) {
            if (a.indexOf) return a.indexOf(b);
            for (var c = 0; c < a.length; c++) if (b === a[c]) return c;
            return -1;
        }
        var e = a("__browserify_process");
        e.EventEmitter || (e.EventEmitter = function() {});
        var f = c.EventEmitter = e.EventEmitter, g = "function" == typeof Array.isArray ? Array.isArray : function(a) {
            return "[object Array]" === Object.prototype.toString.call(a);
        }, h = 10;
        f.prototype.setMaxListeners = function(a) {
            this._events || (this._events = {}), this._events.maxListeners = a;
        }, f.prototype.emit = function(a) {
            if ("error" === a && (!this._events || !this._events.error || g(this._events.error) && !this._events.error.length)) throw arguments[1] instanceof Error ? arguments[1] : new Error("Uncaught, unspecified 'error' event.");
            if (!this._events) return !1;
            var b = this._events[a];
            if (!b) return !1;
            if ("function" == typeof b) {
                switch (arguments.length) {
                  case 1:
                    b.call(this);
                    break;

                  case 2:
                    b.call(this, arguments[1]);
                    break;

                  case 3:
                    b.call(this, arguments[1], arguments[2]);
                    break;

                  default:
                    var c = Array.prototype.slice.call(arguments, 1);
                    b.apply(this, c);
                }
                return !0;
            }
            if (g(b)) {
                for (var c = Array.prototype.slice.call(arguments, 1), d = b.slice(), e = 0, f = d.length; f > e; e++) d[e].apply(this, c);
                return !0;
            }
            return !1;
        }, f.prototype.addListener = function(a, b) {
            if ("function" != typeof b) throw new Error("addListener only takes instances of Function");
            if (this._events || (this._events = {}), this.emit("newListener", a, b), this._events[a]) if (g(this._events[a])) {
                if (!this._events[a].warned) {
                    var c;
                    c = void 0 !== this._events.maxListeners ? this._events.maxListeners : h, c && c > 0 && this._events[a].length > c && (this._events[a].warned = !0, 
                    console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[a].length), 
                    console.trace());
                }
                this._events[a].push(b);
            } else this._events[a] = [ this._events[a], b ]; else this._events[a] = b;
            return this;
        }, f.prototype.on = f.prototype.addListener, f.prototype.once = function(a, b) {
            var c = this;
            return c.on(a, function d() {
                c.removeListener(a, d), b.apply(this, arguments);
            }), this;
        }, f.prototype.removeListener = function(a, b) {
            if ("function" != typeof b) throw new Error("removeListener only takes instances of Function");
            if (!this._events || !this._events[a]) return this;
            var c = this._events[a];
            if (g(c)) {
                var e = d(c, b);
                if (0 > e) return this;
                c.splice(e, 1), 0 == c.length && delete this._events[a];
            } else this._events[a] === b && delete this._events[a];
            return this;
        }, f.prototype.removeAllListeners = function(a) {
            return 0 === arguments.length ? (this._events = {}, this) : (a && this._events && this._events[a] && (this._events[a] = null), 
            this);
        }, f.prototype.listeners = function(a) {
            return this._events || (this._events = {}), this._events[a] || (this._events[a] = []), 
            g(this._events[a]) || (this._events[a] = [ this._events[a] ]), this._events[a];
        }, f.listenerCount = function(a, b) {
            var c;
            return c = a._events && a._events[b] ? "function" == typeof a._events[b] ? 1 : a._events[b].length : 0;
        };
    }, {
        __browserify_process: 20
    } ],
    20: [ function(a, b) {
        var c = b.exports = {};
        c.nextTick = function() {
            var a = "undefined" != typeof window && window.setImmediate, b = "undefined" != typeof window && window.postMessage && window.addEventListener;
            if (a) return function(a) {
                return window.setImmediate(a);
            };
            if (b) {
                var c = [];
                return window.addEventListener("message", function(a) {
                    if (a.source === window && "process-tick" === a.data && (a.stopPropagation(), c.length > 0)) {
                        var b = c.shift();
                        b();
                    }
                }, !0), function(a) {
                    c.push(a), window.postMessage("process-tick", "*");
                };
            }
            return function(a) {
                setTimeout(a, 0);
            };
        }(), c.title = "browser", c.browser = !0, c.env = {}, c.argv = [], c.binding = function() {
            throw new Error("process.binding is not supported");
        }, c.cwd = function() {
            return "/";
        }, c.chdir = function() {
            throw new Error("process.chdir is not supported");
        };
    }, {} ],
    21: [ function(a, b, c) {
        !function() {
            "use strict";
            var a = {};
            "undefined" == typeof c ? "function" == typeof define && "object" == typeof define.amd && define.amd ? (a.exports = {}, 
            define(function() {
                return a.exports;
            })) : a.exports = window : a.exports = c, !function(a) {
                var b = {};
                if (!c) var c = 1e-6;
                b.create = function() {
                    return new Float32Array(2);
                }, b.clone = function(a) {
                    var b = new Float32Array(2);
                    return b[0] = a[0], b[1] = a[1], b;
                }, b.fromValues = function(a, b) {
                    var c = new Float32Array(2);
                    return c[0] = a, c[1] = b, c;
                }, b.copy = function(a, b) {
                    return a[0] = b[0], a[1] = b[1], a;
                }, b.set = function(a, b, c) {
                    return a[0] = b, a[1] = c, a;
                }, b.add = function(a, b, c) {
                    return a[0] = b[0] + c[0], a[1] = b[1] + c[1], a;
                }, b.sub = b.subtract = function(a, b, c) {
                    return a[0] = b[0] - c[0], a[1] = b[1] - c[1], a;
                }, b.mul = b.multiply = function(a, b, c) {
                    return a[0] = b[0] * c[0], a[1] = b[1] * c[1], a;
                }, b.div = b.divide = function(a, b, c) {
                    return a[0] = b[0] / c[0], a[1] = b[1] / c[1], a;
                }, b.min = function(a, b, c) {
                    return a[0] = Math.min(b[0], c[0]), a[1] = Math.min(b[1], c[1]), a;
                }, b.max = function(a, b, c) {
                    return a[0] = Math.max(b[0], c[0]), a[1] = Math.max(b[1], c[1]), a;
                }, b.scale = function(a, b, c) {
                    return a[0] = b[0] * c, a[1] = b[1] * c, a;
                }, b.dist = b.distance = function(a, b) {
                    var c = b[0] - a[0], d = b[1] - a[1];
                    return Math.sqrt(c * c + d * d);
                }, b.sqrDist = b.squaredDistance = function(a, b) {
                    var c = b[0] - a[0], d = b[1] - a[1];
                    return c * c + d * d;
                }, b.len = b.length = function(a) {
                    var b = a[0], c = a[1];
                    return Math.sqrt(b * b + c * c);
                }, b.sqrLen = b.squaredLength = function(a) {
                    var b = a[0], c = a[1];
                    return b * b + c * c;
                }, b.negate = function(a, b) {
                    return a[0] = -b[0], a[1] = -b[1], a;
                }, b.normalize = function(a, b) {
                    var c = b[0], d = b[1], e = c * c + d * d;
                    return e > 0 && (e = 1 / Math.sqrt(e), a[0] = b[0] * e, a[1] = b[1] * e), a;
                }, b.dot = function(a, b) {
                    return a[0] * b[0] + a[1] * b[1];
                }, b.cross = function(a, b, c) {
                    var d = b[0] * c[1] - b[1] * c[0];
                    return a[0] = a[1] = 0, a[2] = d, a;
                }, b.lerp = function(a, b, c, d) {
                    var e = b[0], f = b[1];
                    return a[0] = e + d * (c[0] - e), a[1] = f + d * (c[1] - f), a;
                }, b.transformMat2 = function(a, b, c) {
                    var d = b[0], e = b[1];
                    return a[0] = d * c[0] + e * c[1], a[1] = d * c[2] + e * c[3], a;
                }, b.forEach = function() {
                    var a = new Float32Array(2);
                    return function(b, c, d, e, f, g) {
                        var h, i;
                        for (c || (c = 2), d || (d = 0), i = e ? Math.min(e * c + d, b.length) : b.length, 
                        h = d; i > h; h += c) a[0] = b[h], a[1] = b[h + 1], f(a, a, g), b[h] = a[0], b[h + 1] = a[1];
                        return b;
                    };
                }(), b.str = function(a) {
                    return "vec2(" + a[0] + ", " + a[1] + ")";
                }, "undefined" != typeof a && (a.vec2 = b);
                var d = {};
                if (!c) var c = 1e-6;
                d.create = function() {
                    return new Float32Array(3);
                }, d.clone = function(a) {
                    var b = new Float32Array(3);
                    return b[0] = a[0], b[1] = a[1], b[2] = a[2], b;
                }, d.fromValues = function(a, b, c) {
                    var d = new Float32Array(3);
                    return d[0] = a, d[1] = b, d[2] = c, d;
                }, d.copy = function(a, b) {
                    return a[0] = b[0], a[1] = b[1], a[2] = b[2], a;
                }, d.set = function(a, b, c, d) {
                    return a[0] = b, a[1] = c, a[2] = d, a;
                }, d.add = function(a, b, c) {
                    return a[0] = b[0] + c[0], a[1] = b[1] + c[1], a[2] = b[2] + c[2], a;
                }, d.sub = d.subtract = function(a, b, c) {
                    return a[0] = b[0] - c[0], a[1] = b[1] - c[1], a[2] = b[2] - c[2], a;
                }, d.mul = d.multiply = function(a, b, c) {
                    return a[0] = b[0] * c[0], a[1] = b[1] * c[1], a[2] = b[2] * c[2], a;
                }, d.div = d.divide = function(a, b, c) {
                    return a[0] = b[0] / c[0], a[1] = b[1] / c[1], a[2] = b[2] / c[2], a;
                }, d.min = function(a, b, c) {
                    return a[0] = Math.min(b[0], c[0]), a[1] = Math.min(b[1], c[1]), a[2] = Math.min(b[2], c[2]), 
                    a;
                }, d.max = function(a, b, c) {
                    return a[0] = Math.max(b[0], c[0]), a[1] = Math.max(b[1], c[1]), a[2] = Math.max(b[2], c[2]), 
                    a;
                }, d.scale = function(a, b, c) {
                    return a[0] = b[0] * c, a[1] = b[1] * c, a[2] = b[2] * c, a;
                }, d.dist = d.distance = function(a, b) {
                    var c = b[0] - a[0], d = b[1] - a[1], e = b[2] - a[2];
                    return Math.sqrt(c * c + d * d + e * e);
                }, d.sqrDist = d.squaredDistance = function(a, b) {
                    var c = b[0] - a[0], d = b[1] - a[1], e = b[2] - a[2];
                    return c * c + d * d + e * e;
                }, d.len = d.length = function(a) {
                    var b = a[0], c = a[1], d = a[2];
                    return Math.sqrt(b * b + c * c + d * d);
                }, d.sqrLen = d.squaredLength = function(a) {
                    var b = a[0], c = a[1], d = a[2];
                    return b * b + c * c + d * d;
                }, d.negate = function(a, b) {
                    return a[0] = -b[0], a[1] = -b[1], a[2] = -b[2], a;
                }, d.normalize = function(a, b) {
                    var c = b[0], d = b[1], e = b[2], f = c * c + d * d + e * e;
                    return f > 0 && (f = 1 / Math.sqrt(f), a[0] = b[0] * f, a[1] = b[1] * f, a[2] = b[2] * f), 
                    a;
                }, d.dot = function(a, b) {
                    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
                }, d.cross = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2], g = c[0], h = c[1], i = c[2];
                    return a[0] = e * i - f * h, a[1] = f * g - d * i, a[2] = d * h - e * g, a;
                }, d.lerp = function(a, b, c, d) {
                    var e = b[0], f = b[1], g = b[2];
                    return a[0] = e + d * (c[0] - e), a[1] = f + d * (c[1] - f), a[2] = g + d * (c[2] - g), 
                    a;
                }, d.transformMat4 = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2];
                    return a[0] = c[0] * d + c[4] * e + c[8] * f + c[12], a[1] = c[1] * d + c[5] * e + c[9] * f + c[13], 
                    a[2] = c[2] * d + c[6] * e + c[10] * f + c[14], a;
                }, d.transformQuat = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2], g = c[0], h = c[1], i = c[2], j = c[3], k = j * d + h * f - i * e, l = j * e + i * d - g * f, m = j * f + g * e - h * d, n = -g * d - h * e - i * f;
                    return a[0] = k * j + n * -g + l * -i - m * -h, a[1] = l * j + n * -h + m * -g - k * -i, 
                    a[2] = m * j + n * -i + k * -h - l * -g, a;
                }, d.forEach = function() {
                    var a = new Float32Array(3);
                    return function(b, c, d, e, f, g) {
                        var h, i;
                        for (c || (c = 3), d || (d = 0), i = e ? Math.min(e * c + d, b.length) : b.length, 
                        h = d; i > h; h += c) a[0] = b[h], a[1] = b[h + 1], a[2] = b[h + 2], f(a, a, g), 
                        b[h] = a[0], b[h + 1] = a[1], b[h + 2] = a[2];
                        return b;
                    };
                }(), d.str = function(a) {
                    return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
                }, "undefined" != typeof a && (a.vec3 = d);
                var e = {};
                if (!c) var c = 1e-6;
                e.create = function() {
                    return new Float32Array(4);
                }, e.clone = function(a) {
                    var b = new Float32Array(4);
                    return b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3], b;
                }, e.fromValues = function(a, b, c, d) {
                    var e = new Float32Array(4);
                    return e[0] = a, e[1] = b, e[2] = c, e[3] = d, e;
                }, e.copy = function(a, b) {
                    return a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = b[3], a;
                }, e.set = function(a, b, c, d, e) {
                    return a[0] = b, a[1] = c, a[2] = d, a[3] = e, a;
                }, e.add = function(a, b, c) {
                    return a[0] = b[0] + c[0], a[1] = b[1] + c[1], a[2] = b[2] + c[2], a[3] = b[3] + c[3], 
                    a;
                }, e.sub = e.subtract = function(a, b, c) {
                    return a[0] = b[0] - c[0], a[1] = b[1] - c[1], a[2] = b[2] - c[2], a[3] = b[3] - c[3], 
                    a;
                }, e.mul = e.multiply = function(a, b, c) {
                    return a[0] = b[0] * c[0], a[1] = b[1] * c[1], a[2] = b[2] * c[2], a[3] = b[3] * c[3], 
                    a;
                }, e.div = e.divide = function(a, b, c) {
                    return a[0] = b[0] / c[0], a[1] = b[1] / c[1], a[2] = b[2] / c[2], a[3] = b[3] / c[3], 
                    a;
                }, e.min = function(a, b, c) {
                    return a[0] = Math.min(b[0], c[0]), a[1] = Math.min(b[1], c[1]), a[2] = Math.min(b[2], c[2]), 
                    a[3] = Math.min(b[3], c[3]), a;
                }, e.max = function(a, b, c) {
                    return a[0] = Math.max(b[0], c[0]), a[1] = Math.max(b[1], c[1]), a[2] = Math.max(b[2], c[2]), 
                    a[3] = Math.max(b[3], c[3]), a;
                }, e.scale = function(a, b, c) {
                    return a[0] = b[0] * c, a[1] = b[1] * c, a[2] = b[2] * c, a[3] = b[3] * c, a;
                }, e.dist = e.distance = function(a, b) {
                    var c = b[0] - a[0], d = b[1] - a[1], e = b[2] - a[2], f = b[3] - a[3];
                    return Math.sqrt(c * c + d * d + e * e + f * f);
                }, e.sqrDist = e.squaredDistance = function(a, b) {
                    var c = b[0] - a[0], d = b[1] - a[1], e = b[2] - a[2], f = b[3] - a[3];
                    return c * c + d * d + e * e + f * f;
                }, e.len = e.length = function(a) {
                    var b = a[0], c = a[1], d = a[2], e = a[3];
                    return Math.sqrt(b * b + c * c + d * d + e * e);
                }, e.sqrLen = e.squaredLength = function(a) {
                    var b = a[0], c = a[1], d = a[2], e = a[3];
                    return b * b + c * c + d * d + e * e;
                }, e.negate = function(a, b) {
                    return a[0] = -b[0], a[1] = -b[1], a[2] = -b[2], a[3] = -b[3], a;
                }, e.normalize = function(a, b) {
                    var c = b[0], d = b[1], e = b[2], f = b[3], g = c * c + d * d + e * e + f * f;
                    return g > 0 && (g = 1 / Math.sqrt(g), a[0] = b[0] * g, a[1] = b[1] * g, a[2] = b[2] * g, 
                    a[3] = b[3] * g), a;
                }, e.dot = function(a, b) {
                    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
                }, e.lerp = function(a, b, c, d) {
                    var e = b[0], f = b[1], g = b[2], h = b[3];
                    return a[0] = e + d * (c[0] - e), a[1] = f + d * (c[1] - f), a[2] = g + d * (c[2] - g), 
                    a[3] = h + d * (c[3] - h), a;
                }, e.transformMat4 = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2], g = b[3];
                    return a[0] = c[0] * d + c[4] * e + c[8] * f + c[12] * g, a[1] = c[1] * d + c[5] * e + c[9] * f + c[13] * g, 
                    a[2] = c[2] * d + c[6] * e + c[10] * f + c[14] * g, a[3] = c[3] * d + c[7] * e + c[11] * f + c[15] * g, 
                    a;
                }, e.transformQuat = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2], g = c[0], h = c[1], i = c[2], j = c[3], k = j * d + h * f - i * e, l = j * e + i * d - g * f, m = j * f + g * e - h * d, n = -g * d - h * e - i * f;
                    return a[0] = k * j + n * -g + l * -i - m * -h, a[1] = l * j + n * -h + m * -g - k * -i, 
                    a[2] = m * j + n * -i + k * -h - l * -g, a;
                }, e.forEach = function() {
                    var a = new Float32Array(4);
                    return function(b, c, d, e, f, g) {
                        var h, i;
                        for (c || (c = 4), d || (d = 0), i = e ? Math.min(e * c + d, b.length) : b.length, 
                        h = d; i > h; h += c) a[0] = b[h], a[1] = b[h + 1], a[2] = b[h + 2], a[3] = b[h + 3], 
                        f(a, a, g), b[h] = a[0], b[h + 1] = a[1], b[h + 2] = a[2], b[h + 3] = a[3];
                        return b;
                    };
                }(), e.str = function(a) {
                    return "vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
                }, "undefined" != typeof a && (a.vec4 = e);
                var f = {}, g = new Float32Array([ 1, 0, 0, 1 ]);
                if (!c) var c = 1e-6;
                f.create = function() {
                    return new Float32Array(g);
                }, f.clone = function(a) {
                    var b = new Float32Array(4);
                    return b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3], b;
                }, f.copy = function(a, b) {
                    return a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = b[3], a;
                }, f.identity = function(a) {
                    return a[0] = 1, a[1] = 0, a[2] = 0, a[3] = 1, a;
                }, f.transpose = function(a, b) {
                    if (a === b) {
                        var c = b[1];
                        a[1] = b[2], a[2] = c;
                    } else a[0] = b[0], a[1] = b[2], a[2] = b[1], a[3] = b[3];
                    return a;
                }, f.invert = function(a, b) {
                    var c = b[0], d = b[1], e = b[2], f = b[3], g = c * f - e * d;
                    return g ? (g = 1 / g, a[0] = f * g, a[1] = -d * g, a[2] = -e * g, a[3] = c * g, 
                    a) : null;
                }, f.adjoint = function(a, b) {
                    var c = b[0];
                    return a[0] = b[3], a[1] = -b[1], a[2] = -b[2], a[3] = c, a;
                }, f.determinant = function(a) {
                    return a[0] * a[3] - a[2] * a[1];
                }, f.mul = f.multiply = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2], g = b[3], h = c[0], i = c[1], j = c[2], k = c[3];
                    return a[0] = d * h + e * j, a[1] = d * i + e * k, a[2] = f * h + g * j, a[3] = f * i + g * k, 
                    a;
                }, f.rotate = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2], g = b[3], h = Math.sin(c), i = Math.cos(c);
                    return a[0] = d * i + e * h, a[1] = d * -h + e * i, a[2] = f * i + g * h, a[3] = f * -h + g * i, 
                    a;
                }, f.scale = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2], g = b[3], h = c[0], i = c[1];
                    return a[0] = d * h, a[1] = e * i, a[2] = f * h, a[3] = g * i, a;
                }, f.str = function(a) {
                    return "mat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
                }, "undefined" != typeof a && (a.mat2 = f);
                var h = {}, i = new Float32Array([ 1, 0, 0, 0, 1, 0, 0, 0, 1 ]);
                if (!c) var c = 1e-6;
                h.create = function() {
                    return new Float32Array(i);
                }, h.clone = function(a) {
                    var b = new Float32Array(9);
                    return b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3], b[4] = a[4], b[5] = a[5], 
                    b[6] = a[6], b[7] = a[7], b[8] = a[8], b;
                }, h.copy = function(a, b) {
                    return a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = b[3], a[4] = b[4], a[5] = b[5], 
                    a[6] = b[6], a[7] = b[7], a[8] = b[8], a;
                }, h.identity = function(a) {
                    return a[0] = 1, a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 1, a[5] = 0, a[6] = 0, a[7] = 0, 
                    a[8] = 1, a;
                }, h.transpose = function(a, b) {
                    if (a === b) {
                        var c = b[1], d = b[2], e = b[5];
                        a[1] = b[3], a[2] = b[6], a[3] = c, a[5] = b[7], a[6] = d, a[7] = e;
                    } else a[0] = b[0], a[1] = b[3], a[2] = b[6], a[3] = b[1], a[4] = b[4], a[5] = b[7], 
                    a[6] = b[2], a[7] = b[5], a[8] = b[8];
                    return a;
                }, h.invert = function(a, b) {
                    var c = b[0], d = b[1], e = b[2], f = b[3], g = b[4], h = b[5], i = b[6], j = b[7], k = b[8], l = k * g - h * j, m = -k * f + h * i, n = j * f - g * i, o = c * l + d * m + e * n;
                    return o ? (o = 1 / o, a[0] = l * o, a[1] = (-k * d + e * j) * o, a[2] = (h * d - e * g) * o, 
                    a[3] = m * o, a[4] = (k * c - e * i) * o, a[5] = (-h * c + e * f) * o, a[6] = n * o, 
                    a[7] = (-j * c + d * i) * o, a[8] = (g * c - d * f) * o, a) : null;
                }, h.adjoint = function(a, b) {
                    var c = b[0], d = b[1], e = b[2], f = b[3], g = b[4], h = b[5], i = b[6], j = b[7], k = b[8];
                    return a[0] = g * k - h * j, a[1] = e * j - d * k, a[2] = d * h - e * g, a[3] = h * i - f * k, 
                    a[4] = c * k - e * i, a[5] = e * f - c * h, a[6] = f * j - g * i, a[7] = d * i - c * j, 
                    a[8] = c * g - d * f, a;
                }, h.determinant = function(a) {
                    var b = a[0], c = a[1], d = a[2], e = a[3], f = a[4], g = a[5], h = a[6], i = a[7], j = a[8];
                    return b * (j * f - g * i) + c * (-j * e + g * h) + d * (i * e - f * h);
                }, h.mul = h.multiply = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2], g = b[3], h = b[4], i = b[5], j = b[6], k = b[7], l = b[8], m = c[0], n = c[1], o = c[2], p = c[3], q = c[4], r = c[5], s = c[6], t = c[7], u = c[8];
                    return a[0] = m * d + n * g + o * j, a[1] = m * e + n * h + o * k, a[2] = m * f + n * i + o * l, 
                    a[3] = p * d + q * g + r * j, a[4] = p * e + q * h + r * k, a[5] = p * f + q * i + r * l, 
                    a[6] = s * d + t * g + u * j, a[7] = s * e + t * h + u * k, a[8] = s * f + t * i + u * l, 
                    a;
                }, h.str = function(a) {
                    return "mat3(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ")";
                }, "undefined" != typeof a && (a.mat3 = h);
                var j = {}, k = new Float32Array([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]);
                if (!c) var c = 1e-6;
                j.create = function() {
                    return new Float32Array(k);
                }, j.clone = function(a) {
                    var b = new Float32Array(16);
                    return b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3], b[4] = a[4], b[5] = a[5], 
                    b[6] = a[6], b[7] = a[7], b[8] = a[8], b[9] = a[9], b[10] = a[10], b[11] = a[11], 
                    b[12] = a[12], b[13] = a[13], b[14] = a[14], b[15] = a[15], b;
                }, j.copy = function(a, b) {
                    return a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = b[3], a[4] = b[4], a[5] = b[5], 
                    a[6] = b[6], a[7] = b[7], a[8] = b[8], a[9] = b[9], a[10] = b[10], a[11] = b[11], 
                    a[12] = b[12], a[13] = b[13], a[14] = b[14], a[15] = b[15], a;
                }, j.identity = function(a) {
                    return a[0] = 1, a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 0, a[5] = 1, a[6] = 0, a[7] = 0, 
                    a[8] = 0, a[9] = 0, a[10] = 1, a[11] = 0, a[12] = 0, a[13] = 0, a[14] = 0, a[15] = 1, 
                    a;
                }, j.transpose = function(a, b) {
                    if (a === b) {
                        var c = b[1], d = b[2], e = b[3], f = b[6], g = b[7], h = b[11];
                        a[1] = b[4], a[2] = b[8], a[3] = b[12], a[4] = c, a[6] = b[9], a[7] = b[13], a[8] = d, 
                        a[9] = f, a[11] = b[14], a[12] = e, a[13] = g, a[14] = h;
                    } else a[0] = b[0], a[1] = b[4], a[2] = b[8], a[3] = b[12], a[4] = b[1], a[5] = b[5], 
                    a[6] = b[9], a[7] = b[13], a[8] = b[2], a[9] = b[6], a[10] = b[10], a[11] = b[14], 
                    a[12] = b[3], a[13] = b[7], a[14] = b[11], a[15] = b[15];
                    return a;
                }, j.invert = function(a, b) {
                    var c = b[0], d = b[1], e = b[2], f = b[3], g = b[4], h = b[5], i = b[6], j = b[7], k = b[8], l = b[9], m = b[10], n = b[11], o = b[12], p = b[13], q = b[14], r = b[15], s = c * h - d * g, t = c * i - e * g, u = c * j - f * g, v = d * i - e * h, w = d * j - f * h, x = e * j - f * i, y = k * p - l * o, z = k * q - m * o, A = k * r - n * o, B = l * q - m * p, C = l * r - n * p, D = m * r - n * q, E = s * D - t * C + u * B + v * A - w * z + x * y;
                    return E ? (E = 1 / E, a[0] = (h * D - i * C + j * B) * E, a[1] = (e * C - d * D - f * B) * E, 
                    a[2] = (p * x - q * w + r * v) * E, a[3] = (m * w - l * x - n * v) * E, a[4] = (i * A - g * D - j * z) * E, 
                    a[5] = (c * D - e * A + f * z) * E, a[6] = (q * u - o * x - r * t) * E, a[7] = (k * x - m * u + n * t) * E, 
                    a[8] = (g * C - h * A + j * y) * E, a[9] = (d * A - c * C - f * y) * E, a[10] = (o * w - p * u + r * s) * E, 
                    a[11] = (l * u - k * w - n * s) * E, a[12] = (h * z - g * B - i * y) * E, a[13] = (c * B - d * z + e * y) * E, 
                    a[14] = (p * t - o * v - q * s) * E, a[15] = (k * v - l * t + m * s) * E, a) : null;
                }, j.adjoint = function(a, b) {
                    var c = b[0], d = b[1], e = b[2], f = b[3], g = b[4], h = b[5], i = b[6], j = b[7], k = b[8], l = b[9], m = b[10], n = b[11], o = b[12], p = b[13], q = b[14], r = b[15];
                    return a[0] = h * (m * r - n * q) - l * (i * r - j * q) + p * (i * n - j * m), a[1] = -(d * (m * r - n * q) - l * (e * r - f * q) + p * (e * n - f * m)), 
                    a[2] = d * (i * r - j * q) - h * (e * r - f * q) + p * (e * j - f * i), a[3] = -(d * (i * n - j * m) - h * (e * n - f * m) + l * (e * j - f * i)), 
                    a[4] = -(g * (m * r - n * q) - k * (i * r - j * q) + o * (i * n - j * m)), a[5] = c * (m * r - n * q) - k * (e * r - f * q) + o * (e * n - f * m), 
                    a[6] = -(c * (i * r - j * q) - g * (e * r - f * q) + o * (e * j - f * i)), a[7] = c * (i * n - j * m) - g * (e * n - f * m) + k * (e * j - f * i), 
                    a[8] = g * (l * r - n * p) - k * (h * r - j * p) + o * (h * n - j * l), a[9] = -(c * (l * r - n * p) - k * (d * r - f * p) + o * (d * n - f * l)), 
                    a[10] = c * (h * r - j * p) - g * (d * r - f * p) + o * (d * j - f * h), a[11] = -(c * (h * n - j * l) - g * (d * n - f * l) + k * (d * j - f * h)), 
                    a[12] = -(g * (l * q - m * p) - k * (h * q - i * p) + o * (h * m - i * l)), a[13] = c * (l * q - m * p) - k * (d * q - e * p) + o * (d * m - e * l), 
                    a[14] = -(c * (h * q - i * p) - g * (d * q - e * p) + o * (d * i - e * h)), a[15] = c * (h * m - i * l) - g * (d * m - e * l) + k * (d * i - e * h), 
                    a;
                }, j.determinant = function(a) {
                    var b = a[0], c = a[1], d = a[2], e = a[3], f = a[4], g = a[5], h = a[6], i = a[7], j = a[8], k = a[9], l = a[10], m = a[11], n = a[12], o = a[13], p = a[14], q = a[15], r = b * g - c * f, s = b * h - d * f, t = b * i - e * f, u = c * h - d * g, v = c * i - e * g, w = d * i - e * h, x = j * o - k * n, y = j * p - l * n, z = j * q - m * n, A = k * p - l * o, B = k * q - m * o, C = l * q - m * p;
                    return r * C - s * B + t * A + u * z - v * y + w * x;
                }, j.mul = j.multiply = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2], g = b[3], h = b[4], i = b[5], j = b[6], k = b[7], l = b[8], m = b[9], n = b[10], o = b[11], p = b[12], q = b[13], r = b[14], s = b[15], t = c[0], u = c[1], v = c[2], w = c[3];
                    return a[0] = t * d + u * h + v * l + w * p, a[1] = t * e + u * i + v * m + w * q, 
                    a[2] = t * f + u * j + v * n + w * r, a[3] = t * g + u * k + v * o + w * s, t = c[4], 
                    u = c[5], v = c[6], w = c[7], a[4] = t * d + u * h + v * l + w * p, a[5] = t * e + u * i + v * m + w * q, 
                    a[6] = t * f + u * j + v * n + w * r, a[7] = t * g + u * k + v * o + w * s, t = c[8], 
                    u = c[9], v = c[10], w = c[11], a[8] = t * d + u * h + v * l + w * p, a[9] = t * e + u * i + v * m + w * q, 
                    a[10] = t * f + u * j + v * n + w * r, a[11] = t * g + u * k + v * o + w * s, t = c[12], 
                    u = c[13], v = c[14], w = c[15], a[12] = t * d + u * h + v * l + w * p, a[13] = t * e + u * i + v * m + w * q, 
                    a[14] = t * f + u * j + v * n + w * r, a[15] = t * g + u * k + v * o + w * s, a;
                }, j.translate = function(a, b, c) {
                    var d, e, f, g, h, i, j, k, l, m, n, o, p = c[0], q = c[1], r = c[2];
                    return b === a ? (a[12] = b[0] * p + b[4] * q + b[8] * r + b[12], a[13] = b[1] * p + b[5] * q + b[9] * r + b[13], 
                    a[14] = b[2] * p + b[6] * q + b[10] * r + b[14], a[15] = b[3] * p + b[7] * q + b[11] * r + b[15]) : (d = b[0], 
                    e = b[1], f = b[2], g = b[3], h = b[4], i = b[5], j = b[6], k = b[7], l = b[8], 
                    m = b[9], n = b[10], o = b[11], a[0] = d, a[1] = e, a[2] = f, a[3] = g, a[4] = h, 
                    a[5] = i, a[6] = j, a[7] = k, a[8] = l, a[9] = m, a[10] = n, a[11] = o, a[12] = d * p + h * q + l * r + b[12], 
                    a[13] = e * p + i * q + m * r + b[13], a[14] = f * p + j * q + n * r + b[14], a[15] = g * p + k * q + o * r + b[15]), 
                    a;
                }, j.scale = function(a, b, c) {
                    var d = c[0], e = c[1], f = c[2];
                    return a[0] = b[0] * d, a[1] = b[1] * d, a[2] = b[2] * d, a[3] = b[3] * d, a[4] = b[4] * e, 
                    a[5] = b[5] * e, a[6] = b[6] * e, a[7] = b[7] * e, a[8] = b[8] * f, a[9] = b[9] * f, 
                    a[10] = b[10] * f, a[11] = b[11] * f, a[12] = b[12], a[13] = b[13], a[14] = b[14], 
                    a[15] = b[15], a;
                }, j.rotate = function(a, b, d, e) {
                    var f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D = e[0], E = e[1], F = e[2], G = Math.sqrt(D * D + E * E + F * F);
                    return Math.abs(G) < c ? null : (G = 1 / G, D *= G, E *= G, F *= G, f = Math.sin(d), 
                    g = Math.cos(d), h = 1 - g, i = b[0], j = b[1], k = b[2], l = b[3], m = b[4], n = b[5], 
                    o = b[6], p = b[7], q = b[8], r = b[9], s = b[10], t = b[11], u = D * D * h + g, 
                    v = E * D * h + F * f, w = F * D * h - E * f, x = D * E * h - F * f, y = E * E * h + g, 
                    z = F * E * h + D * f, A = D * F * h + E * f, B = E * F * h - D * f, C = F * F * h + g, 
                    a[0] = i * u + m * v + q * w, a[1] = j * u + n * v + r * w, a[2] = k * u + o * v + s * w, 
                    a[3] = l * u + p * v + t * w, a[4] = i * x + m * y + q * z, a[5] = j * x + n * y + r * z, 
                    a[6] = k * x + o * y + s * z, a[7] = l * x + p * y + t * z, a[8] = i * A + m * B + q * C, 
                    a[9] = j * A + n * B + r * C, a[10] = k * A + o * B + s * C, a[11] = l * A + p * B + t * C, 
                    b !== a && (a[12] = b[12], a[13] = b[13], a[14] = b[14], a[15] = b[15]), a);
                }, j.rotateX = function(a, b, c) {
                    var d = Math.sin(c), e = Math.cos(c), f = b[4], g = b[5], h = b[6], i = b[7], j = b[8], k = b[9], l = b[10], m = b[11];
                    return b !== a && (a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = b[3], a[12] = b[12], 
                    a[13] = b[13], a[14] = b[14], a[15] = b[15]), a[4] = f * e + j * d, a[5] = g * e + k * d, 
                    a[6] = h * e + l * d, a[7] = i * e + m * d, a[8] = j * e - f * d, a[9] = k * e - g * d, 
                    a[10] = l * e - h * d, a[11] = m * e - i * d, a;
                }, j.rotateY = function(a, b, c) {
                    var d = Math.sin(c), e = Math.cos(c), f = b[0], g = b[1], h = b[2], i = b[3], j = b[8], k = b[9], l = b[10], m = b[11];
                    return b !== a && (a[4] = b[4], a[5] = b[5], a[6] = b[6], a[7] = b[7], a[12] = b[12], 
                    a[13] = b[13], a[14] = b[14], a[15] = b[15]), a[0] = f * e - j * d, a[1] = g * e - k * d, 
                    a[2] = h * e - l * d, a[3] = i * e - m * d, a[8] = f * d + j * e, a[9] = g * d + k * e, 
                    a[10] = h * d + l * e, a[11] = i * d + m * e, a;
                }, j.rotateZ = function(a, b, c) {
                    var d = Math.sin(c), e = Math.cos(c), f = b[0], g = b[1], h = b[2], i = b[3], j = b[4], k = b[5], l = b[6], m = b[7];
                    return b !== a && (a[8] = b[8], a[9] = b[9], a[10] = b[10], a[11] = b[11], a[12] = b[12], 
                    a[13] = b[13], a[14] = b[14], a[15] = b[15]), a[0] = f * e + j * d, a[1] = g * e + k * d, 
                    a[2] = h * e + l * d, a[3] = i * e + m * d, a[4] = j * e - f * d, a[5] = k * e - g * d, 
                    a[6] = l * e - h * d, a[7] = m * e - i * d, a;
                }, j.fromRotationTranslation = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2], g = b[3], h = d + d, i = e + e, j = f + f, k = d * h, l = d * i, m = d * j, n = e * i, o = e * j, p = f * j, q = g * h, r = g * i, s = g * j;
                    return a[0] = 1 - (n + p), a[1] = l + s, a[2] = m - r, a[3] = 0, a[4] = l - s, a[5] = 1 - (k + p), 
                    a[6] = o + q, a[7] = 0, a[8] = m + r, a[9] = o - q, a[10] = 1 - (k + n), a[11] = 0, 
                    a[12] = c[0], a[13] = c[1], a[14] = c[2], a[15] = 1, a;
                }, j.frustum = function(a, b, c, d, e, f, g) {
                    var h = 1 / (c - b), i = 1 / (e - d), j = 1 / (f - g);
                    return a[0] = 2 * f * h, a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 0, a[5] = 2 * f * i, 
                    a[6] = 0, a[7] = 0, a[8] = (c + b) * h, a[9] = (e + d) * i, a[10] = (g + f) * j, 
                    a[11] = -1, a[12] = 0, a[13] = 0, a[14] = g * f * 2 * j, a[15] = 0, a;
                }, j.perspective = function(a, b, c, d, e) {
                    var f = 1 / Math.tan(b / 2), g = 1 / (d - e);
                    return a[0] = f / c, a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 0, a[5] = f, a[6] = 0, 
                    a[7] = 0, a[8] = 0, a[9] = 0, a[10] = (e + d) * g, a[11] = -1, a[12] = 0, a[13] = 0, 
                    a[14] = 2 * e * d * g, a[15] = 0, a;
                }, j.ortho = function(a, b, c, d, e, f, g) {
                    var h = 1 / (b - c), i = 1 / (d - e), j = 1 / (f - g);
                    return a[0] = -2 * h, a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 0, a[5] = -2 * i, a[6] = 0, 
                    a[7] = 0, a[8] = 0, a[9] = 0, a[10] = 2 * j, a[11] = 0, a[12] = (b + c) * h, a[13] = (e + d) * i, 
                    a[14] = (g + f) * j, a[15] = 1, a;
                }, j.lookAt = function(a, b, d, e) {
                    var f, g, h, i, k, l, m, n, o, p, q = b[0], r = b[1], s = b[2], t = e[0], u = e[1], v = e[2], w = d[0], x = d[1], y = d[2];
                    return Math.abs(q - w) < c && Math.abs(r - x) < c && Math.abs(s - y) < c ? j.identity(a) : (m = q - w, 
                    n = r - x, o = s - y, p = 1 / Math.sqrt(m * m + n * n + o * o), m *= p, n *= p, 
                    o *= p, f = u * o - v * n, g = v * m - t * o, h = t * n - u * m, p = Math.sqrt(f * f + g * g + h * h), 
                    p ? (p = 1 / p, f *= p, g *= p, h *= p) : (f = 0, g = 0, h = 0), i = n * h - o * g, 
                    k = o * f - m * h, l = m * g - n * f, p = Math.sqrt(i * i + k * k + l * l), p ? (p = 1 / p, 
                    i *= p, k *= p, l *= p) : (i = 0, k = 0, l = 0), a[0] = f, a[1] = i, a[2] = m, a[3] = 0, 
                    a[4] = g, a[5] = k, a[6] = n, a[7] = 0, a[8] = h, a[9] = l, a[10] = o, a[11] = 0, 
                    a[12] = -(f * q + g * r + h * s), a[13] = -(i * q + k * r + l * s), a[14] = -(m * q + n * r + o * s), 
                    a[15] = 1, a);
                }, j.str = function(a) {
                    return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
                }, "undefined" != typeof a && (a.mat4 = j);
                var l = {}, m = new Float32Array([ 0, 0, 0, 1 ]);
                if (!c) var c = 1e-6;
                l.create = function() {
                    return new Float32Array(m);
                }, l.clone = e.clone, l.fromValues = e.fromValues, l.copy = e.copy, l.set = e.set, 
                l.identity = function(a) {
                    return a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 1, a;
                }, l.setAxisAngle = function(a, b, c) {
                    c = .5 * c;
                    var d = Math.sin(c);
                    return a[0] = d * b[0], a[1] = d * b[1], a[2] = d * b[2], a[3] = Math.cos(c), a;
                }, l.add = e.add, l.mul = l.multiply = function(a, b, c) {
                    var d = b[0], e = b[1], f = b[2], g = b[3], h = c[0], i = c[1], j = c[2], k = c[3];
                    return a[0] = d * k + g * h + e * j - f * i, a[1] = e * k + g * i + f * h - d * j, 
                    a[2] = f * k + g * j + d * i - e * h, a[3] = g * k - d * h - e * i - f * j, a;
                }, l.scale = e.scale, l.rotateX = function(a, b, c) {
                    c *= .5;
                    var d = b[0], e = b[1], f = b[2], g = b[3], h = Math.sin(c), i = Math.cos(c);
                    return a[0] = d * i + g * h, a[1] = e * i + f * h, a[2] = f * i - e * h, a[3] = g * i - d * h, 
                    a;
                }, l.rotateY = function(a, b, c) {
                    c *= .5;
                    var d = b[0], e = b[1], f = b[2], g = b[3], h = Math.sin(c), i = Math.cos(c);
                    return a[0] = d * i - f * h, a[1] = e * i + g * h, a[2] = f * i + d * h, a[3] = g * i - e * h, 
                    a;
                }, l.rotateZ = function(a, b, c) {
                    c *= .5;
                    var d = b[0], e = b[1], f = b[2], g = b[3], h = Math.sin(c), i = Math.cos(c);
                    return a[0] = d * i + e * h, a[1] = e * i - d * h, a[2] = f * i + g * h, a[3] = g * i - f * h, 
                    a;
                }, l.calculateW = function(a, b) {
                    var c = b[0], d = b[1], e = b[2];
                    return a[0] = c, a[1] = d, a[2] = e, a[3] = -Math.sqrt(Math.abs(1 - c * c - d * d - e * e)), 
                    a;
                }, l.dot = e.dot, l.lerp = e.lerp, l.slerp = function(a, b, c, d) {
                    var e, f, g, h, i = b[0], j = b[1], k = b[2], l = b[3], m = c[0], n = c[1], o = c[2], p = b[3], q = i * m + j * n + k * o + l * p;
                    return Math.abs(q) >= 1 ? (a !== b && (a[0] = i, a[1] = j, a[2] = k, a[3] = l), 
                    a) : (e = Math.acos(q), f = Math.sqrt(1 - q * q), Math.abs(f) < .001 ? (a[0] = .5 * i + .5 * m, 
                    a[1] = .5 * j + .5 * n, a[2] = .5 * k + .5 * o, a[3] = .5 * l + .5 * p, a) : (g = Math.sin((1 - d) * e) / f, 
                    h = Math.sin(d * e) / f, a[0] = i * g + m * h, a[1] = j * g + n * h, a[2] = k * g + o * h, 
                    a[3] = l * g + p * h, a));
                }, l.invert = function(a, b) {
                    var c = b[0], d = b[1], e = b[2], f = b[3], g = c * c + d * d + e * e + f * f, h = g ? 1 / g : 0;
                    return a[0] = -c * h, a[1] = -d * h, a[2] = -e * h, a[3] = f * h, a;
                }, l.conjugate = function(a, b) {
                    return a[0] = -b[0], a[1] = -b[1], a[2] = -b[2], a[3] = b[3], a;
                }, l.len = l.length = e.length, l.sqrLen = l.squaredLength = e.squaredLength, l.normalize = e.normalize, 
                l.str = function(a) {
                    return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
                }, "undefined" != typeof a && (a.quat = l);
            }(a.exports);
        }();
    }, {} ],
    22: [ function(a, b, c) {
        !function() {
            var a = this, d = a._, e = {}, f = Array.prototype, g = Object.prototype, h = Function.prototype, i = f.push, j = f.slice, k = f.concat, l = g.toString, m = g.hasOwnProperty, n = f.forEach, o = f.map, p = f.reduce, q = f.reduceRight, r = f.filter, s = f.every, t = f.some, u = f.indexOf, v = f.lastIndexOf, w = Array.isArray, x = Object.keys, y = h.bind, z = function(a) {
                return a instanceof z ? a : this instanceof z ? void (this._wrapped = a) : new z(a);
            };
            "undefined" != typeof c ? ("undefined" != typeof b && b.exports && (c = b.exports = z), 
            c._ = z) : a._ = z, z.VERSION = "1.4.4";
            var A = z.each = z.forEach = function(a, b, c) {
                if (null != a) if (n && a.forEach === n) a.forEach(b, c); else if (a.length === +a.length) {
                    for (var d = 0, f = a.length; f > d; d++) if (b.call(c, a[d], d, a) === e) return;
                } else for (var g in a) if (z.has(a, g) && b.call(c, a[g], g, a) === e) return;
            };
            z.map = z.collect = function(a, b, c) {
                var d = [];
                return null == a ? d : o && a.map === o ? a.map(b, c) : (A(a, function(a, e, f) {
                    d[d.length] = b.call(c, a, e, f);
                }), d);
            };
            var B = "Reduce of empty array with no initial value";
            z.reduce = z.foldl = z.inject = function(a, b, c, d) {
                var e = arguments.length > 2;
                if (null == a && (a = []), p && a.reduce === p) return d && (b = z.bind(b, d)), 
                e ? a.reduce(b, c) : a.reduce(b);
                if (A(a, function(a, f, g) {
                    e ? c = b.call(d, c, a, f, g) : (c = a, e = !0);
                }), !e) throw new TypeError(B);
                return c;
            }, z.reduceRight = z.foldr = function(a, b, c, d) {
                var e = arguments.length > 2;
                if (null == a && (a = []), q && a.reduceRight === q) return d && (b = z.bind(b, d)), 
                e ? a.reduceRight(b, c) : a.reduceRight(b);
                var f = a.length;
                if (f !== +f) {
                    var g = z.keys(a);
                    f = g.length;
                }
                if (A(a, function(h, i, j) {
                    i = g ? g[--f] : --f, e ? c = b.call(d, c, a[i], i, j) : (c = a[i], e = !0);
                }), !e) throw new TypeError(B);
                return c;
            }, z.find = z.detect = function(a, b, c) {
                var d;
                return C(a, function(a, e, f) {
                    return b.call(c, a, e, f) ? (d = a, !0) : void 0;
                }), d;
            }, z.filter = z.select = function(a, b, c) {
                var d = [];
                return null == a ? d : r && a.filter === r ? a.filter(b, c) : (A(a, function(a, e, f) {
                    b.call(c, a, e, f) && (d[d.length] = a);
                }), d);
            }, z.reject = function(a, b, c) {
                return z.filter(a, function(a, d, e) {
                    return !b.call(c, a, d, e);
                }, c);
            }, z.every = z.all = function(a, b, c) {
                b || (b = z.identity);
                var d = !0;
                return null == a ? d : s && a.every === s ? a.every(b, c) : (A(a, function(a, f, g) {
                    return (d = d && b.call(c, a, f, g)) ? void 0 : e;
                }), !!d);
            };
            var C = z.some = z.any = function(a, b, c) {
                b || (b = z.identity);
                var d = !1;
                return null == a ? d : t && a.some === t ? a.some(b, c) : (A(a, function(a, f, g) {
                    return d || (d = b.call(c, a, f, g)) ? e : void 0;
                }), !!d);
            };
            z.contains = z.include = function(a, b) {
                return null == a ? !1 : u && a.indexOf === u ? -1 != a.indexOf(b) : C(a, function(a) {
                    return a === b;
                });
            }, z.invoke = function(a, b) {
                var c = j.call(arguments, 2), d = z.isFunction(b);
                return z.map(a, function(a) {
                    return (d ? b : a[b]).apply(a, c);
                });
            }, z.pluck = function(a, b) {
                return z.map(a, function(a) {
                    return a[b];
                });
            }, z.where = function(a, b, c) {
                return z.isEmpty(b) ? c ? null : [] : z[c ? "find" : "filter"](a, function(a) {
                    for (var c in b) if (b[c] !== a[c]) return !1;
                    return !0;
                });
            }, z.findWhere = function(a, b) {
                return z.where(a, b, !0);
            }, z.max = function(a, b, c) {
                if (!b && z.isArray(a) && a[0] === +a[0] && a.length < 65535) return Math.max.apply(Math, a);
                if (!b && z.isEmpty(a)) return -1/0;
                var d = {
                    computed: -1/0,
                    value: -1/0
                };
                return A(a, function(a, e, f) {
                    var g = b ? b.call(c, a, e, f) : a;
                    g >= d.computed && (d = {
                        value: a,
                        computed: g
                    });
                }), d.value;
            }, z.min = function(a, b, c) {
                if (!b && z.isArray(a) && a[0] === +a[0] && a.length < 65535) return Math.min.apply(Math, a);
                if (!b && z.isEmpty(a)) return 1/0;
                var d = {
                    computed: 1/0,
                    value: 1/0
                };
                return A(a, function(a, e, f) {
                    var g = b ? b.call(c, a, e, f) : a;
                    g < d.computed && (d = {
                        value: a,
                        computed: g
                    });
                }), d.value;
            }, z.shuffle = function(a) {
                var b, c = 0, d = [];
                return A(a, function(a) {
                    b = z.random(c++), d[c - 1] = d[b], d[b] = a;
                }), d;
            };
            var D = function(a) {
                return z.isFunction(a) ? a : function(b) {
                    return b[a];
                };
            };
            z.sortBy = function(a, b, c) {
                var d = D(b);
                return z.pluck(z.map(a, function(a, b, e) {
                    return {
                        value: a,
                        index: b,
                        criteria: d.call(c, a, b, e)
                    };
                }).sort(function(a, b) {
                    var c = a.criteria, d = b.criteria;
                    if (c !== d) {
                        if (c > d || void 0 === c) return 1;
                        if (d > c || void 0 === d) return -1;
                    }
                    return a.index < b.index ? -1 : 1;
                }), "value");
            };
            var E = function(a, b, c, d) {
                var e = {}, f = D(b || z.identity);
                return A(a, function(b, g) {
                    var h = f.call(c, b, g, a);
                    d(e, h, b);
                }), e;
            };
            z.groupBy = function(a, b, c) {
                return E(a, b, c, function(a, b, c) {
                    (z.has(a, b) ? a[b] : a[b] = []).push(c);
                });
            }, z.countBy = function(a, b, c) {
                return E(a, b, c, function(a, b) {
                    z.has(a, b) || (a[b] = 0), a[b]++;
                });
            }, z.sortedIndex = function(a, b, c, d) {
                c = null == c ? z.identity : D(c);
                for (var e = c.call(d, b), f = 0, g = a.length; g > f; ) {
                    var h = f + g >>> 1;
                    c.call(d, a[h]) < e ? f = h + 1 : g = h;
                }
                return f;
            }, z.toArray = function(a) {
                return a ? z.isArray(a) ? j.call(a) : a.length === +a.length ? z.map(a, z.identity) : z.values(a) : [];
            }, z.size = function(a) {
                return null == a ? 0 : a.length === +a.length ? a.length : z.keys(a).length;
            }, z.first = z.head = z.take = function(a, b, c) {
                return null == a ? void 0 : null == b || c ? a[0] : j.call(a, 0, b);
            }, z.initial = function(a, b, c) {
                return j.call(a, 0, a.length - (null == b || c ? 1 : b));
            }, z.last = function(a, b, c) {
                return null == a ? void 0 : null == b || c ? a[a.length - 1] : j.call(a, Math.max(a.length - b, 0));
            }, z.rest = z.tail = z.drop = function(a, b, c) {
                return j.call(a, null == b || c ? 1 : b);
            }, z.compact = function(a) {
                return z.filter(a, z.identity);
            };
            var F = function(a, b, c) {
                return A(a, function(a) {
                    z.isArray(a) ? b ? i.apply(c, a) : F(a, b, c) : c.push(a);
                }), c;
            };
            z.flatten = function(a, b) {
                return F(a, b, []);
            }, z.without = function(a) {
                return z.difference(a, j.call(arguments, 1));
            }, z.uniq = z.unique = function(a, b, c, d) {
                z.isFunction(b) && (d = c, c = b, b = !1);
                var e = c ? z.map(a, c, d) : a, f = [], g = [];
                return A(e, function(c, d) {
                    (b ? d && g[g.length - 1] === c : z.contains(g, c)) || (g.push(c), f.push(a[d]));
                }), f;
            }, z.union = function() {
                return z.uniq(k.apply(f, arguments));
            }, z.intersection = function(a) {
                var b = j.call(arguments, 1);
                return z.filter(z.uniq(a), function(a) {
                    return z.every(b, function(b) {
                        return z.indexOf(b, a) >= 0;
                    });
                });
            }, z.difference = function(a) {
                var b = k.apply(f, j.call(arguments, 1));
                return z.filter(a, function(a) {
                    return !z.contains(b, a);
                });
            }, z.zip = function() {
                for (var a = j.call(arguments), b = z.max(z.pluck(a, "length")), c = new Array(b), d = 0; b > d; d++) c[d] = z.pluck(a, "" + d);
                return c;
            }, z.object = function(a, b) {
                if (null == a) return {};
                for (var c = {}, d = 0, e = a.length; e > d; d++) b ? c[a[d]] = b[d] : c[a[d][0]] = a[d][1];
                return c;
            }, z.indexOf = function(a, b, c) {
                if (null == a) return -1;
                var d = 0, e = a.length;
                if (c) {
                    if ("number" != typeof c) return d = z.sortedIndex(a, b), a[d] === b ? d : -1;
                    d = 0 > c ? Math.max(0, e + c) : c;
                }
                if (u && a.indexOf === u) return a.indexOf(b, c);
                for (;e > d; d++) if (a[d] === b) return d;
                return -1;
            }, z.lastIndexOf = function(a, b, c) {
                if (null == a) return -1;
                var d = null != c;
                if (v && a.lastIndexOf === v) return d ? a.lastIndexOf(b, c) : a.lastIndexOf(b);
                for (var e = d ? c : a.length; e--; ) if (a[e] === b) return e;
                return -1;
            }, z.range = function(a, b, c) {
                arguments.length <= 1 && (b = a || 0, a = 0), c = arguments[2] || 1;
                for (var d = Math.max(Math.ceil((b - a) / c), 0), e = 0, f = new Array(d); d > e; ) f[e++] = a, 
                a += c;
                return f;
            }, z.bind = function(a, b) {
                if (a.bind === y && y) return y.apply(a, j.call(arguments, 1));
                var c = j.call(arguments, 2);
                return function() {
                    return a.apply(b, c.concat(j.call(arguments)));
                };
            }, z.partial = function(a) {
                var b = j.call(arguments, 1);
                return function() {
                    return a.apply(this, b.concat(j.call(arguments)));
                };
            }, z.bindAll = function(a) {
                var b = j.call(arguments, 1);
                return 0 === b.length && (b = z.functions(a)), A(b, function(b) {
                    a[b] = z.bind(a[b], a);
                }), a;
            }, z.memoize = function(a, b) {
                var c = {};
                return b || (b = z.identity), function() {
                    var d = b.apply(this, arguments);
                    return z.has(c, d) ? c[d] : c[d] = a.apply(this, arguments);
                };
            }, z.delay = function(a, b) {
                var c = j.call(arguments, 2);
                return setTimeout(function() {
                    return a.apply(null, c);
                }, b);
            }, z.defer = function(a) {
                return z.delay.apply(z, [ a, 1 ].concat(j.call(arguments, 1)));
            }, z.throttle = function(a, b) {
                var c, d, e, f, g = 0, h = function() {
                    g = new Date(), e = null, f = a.apply(c, d);
                };
                return function() {
                    var i = new Date(), j = b - (i - g);
                    return c = this, d = arguments, 0 >= j ? (clearTimeout(e), e = null, g = i, f = a.apply(c, d)) : e || (e = setTimeout(h, j)), 
                    f;
                };
            }, z.debounce = function(a, b, c) {
                var d, e;
                return function() {
                    var f = this, g = arguments, h = function() {
                        d = null, c || (e = a.apply(f, g));
                    }, i = c && !d;
                    return clearTimeout(d), d = setTimeout(h, b), i && (e = a.apply(f, g)), e;
                };
            }, z.once = function(a) {
                var b, c = !1;
                return function() {
                    return c ? b : (c = !0, b = a.apply(this, arguments), a = null, b);
                };
            }, z.wrap = function(a, b) {
                return function() {
                    var c = [ a ];
                    return i.apply(c, arguments), b.apply(this, c);
                };
            }, z.compose = function() {
                var a = arguments;
                return function() {
                    for (var b = arguments, c = a.length - 1; c >= 0; c--) b = [ a[c].apply(this, b) ];
                    return b[0];
                };
            }, z.after = function(a, b) {
                return 0 >= a ? b() : function() {
                    return --a < 1 ? b.apply(this, arguments) : void 0;
                };
            }, z.keys = x || function(a) {
                if (a !== Object(a)) throw new TypeError("Invalid object");
                var b = [];
                for (var c in a) z.has(a, c) && (b[b.length] = c);
                return b;
            }, z.values = function(a) {
                var b = [];
                for (var c in a) z.has(a, c) && b.push(a[c]);
                return b;
            }, z.pairs = function(a) {
                var b = [];
                for (var c in a) z.has(a, c) && b.push([ c, a[c] ]);
                return b;
            }, z.invert = function(a) {
                var b = {};
                for (var c in a) z.has(a, c) && (b[a[c]] = c);
                return b;
            }, z.functions = z.methods = function(a) {
                var b = [];
                for (var c in a) z.isFunction(a[c]) && b.push(c);
                return b.sort();
            }, z.extend = function(a) {
                return A(j.call(arguments, 1), function(b) {
                    if (b) for (var c in b) a[c] = b[c];
                }), a;
            }, z.pick = function(a) {
                var b = {}, c = k.apply(f, j.call(arguments, 1));
                return A(c, function(c) {
                    c in a && (b[c] = a[c]);
                }), b;
            }, z.omit = function(a) {
                var b = {}, c = k.apply(f, j.call(arguments, 1));
                for (var d in a) z.contains(c, d) || (b[d] = a[d]);
                return b;
            }, z.defaults = function(a) {
                return A(j.call(arguments, 1), function(b) {
                    if (b) for (var c in b) null == a[c] && (a[c] = b[c]);
                }), a;
            }, z.clone = function(a) {
                return z.isObject(a) ? z.isArray(a) ? a.slice() : z.extend({}, a) : a;
            }, z.tap = function(a, b) {
                return b(a), a;
            };
            var G = function(a, b, c, d) {
                if (a === b) return 0 !== a || 1 / a == 1 / b;
                if (null == a || null == b) return a === b;
                a instanceof z && (a = a._wrapped), b instanceof z && (b = b._wrapped);
                var e = l.call(a);
                if (e != l.call(b)) return !1;
                switch (e) {
                  case "[object String]":
                    return a == String(b);

                  case "[object Number]":
                    return a != +a ? b != +b : 0 == a ? 1 / a == 1 / b : a == +b;

                  case "[object Date]":
                  case "[object Boolean]":
                    return +a == +b;

                  case "[object RegExp]":
                    return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
                }
                if ("object" != typeof a || "object" != typeof b) return !1;
                for (var f = c.length; f--; ) if (c[f] == a) return d[f] == b;
                c.push(a), d.push(b);
                var g = 0, h = !0;
                if ("[object Array]" == e) {
                    if (g = a.length, h = g == b.length) for (;g-- && (h = G(a[g], b[g], c, d)); ) ;
                } else {
                    var i = a.constructor, j = b.constructor;
                    if (i !== j && !(z.isFunction(i) && i instanceof i && z.isFunction(j) && j instanceof j)) return !1;
                    for (var k in a) if (z.has(a, k) && (g++, !(h = z.has(b, k) && G(a[k], b[k], c, d)))) break;
                    if (h) {
                        for (k in b) if (z.has(b, k) && !g--) break;
                        h = !g;
                    }
                }
                return c.pop(), d.pop(), h;
            };
            z.isEqual = function(a, b) {
                return G(a, b, [], []);
            }, z.isEmpty = function(a) {
                if (null == a) return !0;
                if (z.isArray(a) || z.isString(a)) return 0 === a.length;
                for (var b in a) if (z.has(a, b)) return !1;
                return !0;
            }, z.isElement = function(a) {
                return !(!a || 1 !== a.nodeType);
            }, z.isArray = w || function(a) {
                return "[object Array]" == l.call(a);
            }, z.isObject = function(a) {
                return a === Object(a);
            }, A([ "Arguments", "Function", "String", "Number", "Date", "RegExp" ], function(a) {
                z["is" + a] = function(b) {
                    return l.call(b) == "[object " + a + "]";
                };
            }), z.isArguments(arguments) || (z.isArguments = function(a) {
                return !(!a || !z.has(a, "callee"));
            }), "function" != typeof /./ && (z.isFunction = function(a) {
                return "function" == typeof a;
            }), z.isFinite = function(a) {
                return isFinite(a) && !isNaN(parseFloat(a));
            }, z.isNaN = function(a) {
                return z.isNumber(a) && a != +a;
            }, z.isBoolean = function(a) {
                return a === !0 || a === !1 || "[object Boolean]" == l.call(a);
            }, z.isNull = function(a) {
                return null === a;
            }, z.isUndefined = function(a) {
                return void 0 === a;
            }, z.has = function(a, b) {
                return m.call(a, b);
            }, z.noConflict = function() {
                return a._ = d, this;
            }, z.identity = function(a) {
                return a;
            }, z.times = function(a, b, c) {
                for (var d = Array(a), e = 0; a > e; e++) d[e] = b.call(c, e);
                return d;
            }, z.random = function(a, b) {
                return null == b && (b = a, a = 0), a + Math.floor(Math.random() * (b - a + 1));
            };
            var H = {
                escape: {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#x27;",
                    "/": "&#x2F;"
                }
            };
            H.unescape = z.invert(H.escape);
            var I = {
                escape: new RegExp("[" + z.keys(H.escape).join("") + "]", "g"),
                unescape: new RegExp("(" + z.keys(H.unescape).join("|") + ")", "g")
            };
            z.each([ "escape", "unescape" ], function(a) {
                z[a] = function(b) {
                    return null == b ? "" : ("" + b).replace(I[a], function(b) {
                        return H[a][b];
                    });
                };
            }), z.result = function(a, b) {
                if (null == a) return null;
                var c = a[b];
                return z.isFunction(c) ? c.call(a) : c;
            }, z.mixin = function(a) {
                A(z.functions(a), function(b) {
                    var c = z[b] = a[b];
                    z.prototype[b] = function() {
                        var a = [ this._wrapped ];
                        return i.apply(a, arguments), N.call(this, c.apply(z, a));
                    };
                });
            };
            var J = 0;
            z.uniqueId = function(a) {
                var b = ++J + "";
                return a ? a + b : b;
            }, z.templateSettings = {
                evaluate: /<%([\s\S]+?)%>/g,
                interpolate: /<%=([\s\S]+?)%>/g,
                escape: /<%-([\s\S]+?)%>/g
            };
            var K = /(.)^/, L = {
                "'": "'",
                "\\": "\\",
                "\r": "r",
                "\n": "n",
                "	": "t",
                "\u2028": "u2028",
                "\u2029": "u2029"
            }, M = /\\|'|\r|\n|\t|\u2028|\u2029/g;
            z.template = function(a, b, c) {
                var d;
                c = z.defaults({}, c, z.templateSettings);
                var e = new RegExp([ (c.escape || K).source, (c.interpolate || K).source, (c.evaluate || K).source ].join("|") + "|$", "g"), f = 0, g = "__p+='";
                a.replace(e, function(b, c, d, e, h) {
                    return g += a.slice(f, h).replace(M, function(a) {
                        return "\\" + L[a];
                    }), c && (g += "'+\n((__t=(" + c + "))==null?'':_.escape(__t))+\n'"), d && (g += "'+\n((__t=(" + d + "))==null?'':__t)+\n'"), 
                    e && (g += "';\n" + e + "\n__p+='"), f = h + b.length, b;
                }), g += "';\n", c.variable || (g = "with(obj||{}){\n" + g + "}\n"), g = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + g + "return __p;\n";
                try {
                    d = new Function(c.variable || "obj", "_", g);
                } catch (h) {
                    throw h.source = g, h;
                }
                if (b) return d(b, z);
                var i = function(a) {
                    return d.call(this, a, z);
                };
                return i.source = "function(" + (c.variable || "obj") + "){\n" + g + "}", i;
            }, z.chain = function(a) {
                return z(a).chain();
            };
            var N = function(a) {
                return this._chain ? z(a).chain() : a;
            };
            z.mixin(z), A([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(a) {
                var b = f[a];
                z.prototype[a] = function() {
                    var c = this._wrapped;
                    return b.apply(c, arguments), "shift" != a && "splice" != a || 0 !== c.length || delete c[0], 
                    N.call(this, c);
                };
            }), A([ "concat", "join", "slice" ], function(a) {
                var b = f[a];
                z.prototype[a] = function() {
                    return N.call(this, b.apply(this._wrapped, arguments));
                };
            }), z.extend(z.prototype, {
                chain: function() {
                    return this._chain = !0, this;
                },
                value: function() {
                    return this._wrapped;
                }
            });
        }.call(this);
    }, {} ],
    23: [ function(a) {
        "undefined" != typeof window && "function" != typeof window.requestAnimationFrame && (window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) {
            setTimeout(a, 1e3 / 60);
        }), Leap = a("../lib/index");
    }, {
        "../lib/index": 9
    } ]
}, {}, [ 23 ]), function() {
    var a;
    a = function() {
        var a;
        return a = [], a.remove = function() {
            for (var a, b, c = arguments, d = c.length; d && this.length; ) for (a = c[--d]; -1 !== (b = this.indexOf(a)); ) this.splice(b, 1);
            return this;
        }, this.on("deviceDisconnected", function() {
            var b, c, d, e;
            for (e = [], c = 0, d = a.length; d > c; c++) b = a[c], e.push(this.emit("handLost", this.lastConnectionFrame.hand(b)));
            return e;
        }), {
            frame: function(b) {
                var c, d, e, f, g;
                d = b.hands.map(function(a) {
                    return a.id;
                });
                for (var h = 0, i = a.length; i > h; h++) c = a[h], -1 == d.indexOf(c) && (a.remove(c), 
                this.emit("handLost", this.frame(1).hand(c)), h--, i--);
                for (g = [], e = 0, f = d.length; f > e; e++) c = d[e], -1 === a.indexOf(c) ? (a.push(c), 
                g.push(this.emit("handFound", b.hand(c)))) : g.push(void 0);
                return g;
            }
        };
    }, "undefined" != typeof Leap && Leap.Controller ? Leap.Controller.plugin("handEntry", a) : module.exports.handEntry = a;
}.call(this), function() {
    var a;
    a = function() {
        var a;
        return a = {}, {
            hand: {
                data: function(b, c) {
                    var d, e, f;
                    if (a[e = this.id] || (a[e] = []), c) return a[this.id][b] = c;
                    if ("[object String]" === toString.call(b)) return a[this.id][b];
                    f = [];
                    for (d in b) c = b[d], f.push(void 0 === c ? delete a[this.id][d] : a[this.id][d] = c);
                    return f;
                },
                hold: function(a) {
                    return a ? this.data({
                        holding: a
                    }) : this.hold(this.hovering());
                },
                holding: function() {
                    return this.data("holding");
                },
                release: function() {
                    var a;
                    return a = this.data("holding"), this.data({
                        holding: void 0
                    }), a;
                },
                hoverFn: function(a) {
                    return this.data({
                        getHover: a
                    });
                },
                hovering: function() {
                    var a;
                    return (a = this.data("getHover")) ? this._hovering || (this._hovering = a.call(this)) : void 0;
                }
            }
        };
    }, "undefined" != typeof Leap && Leap.Controller ? Leap.Controller.plugin("handHold", a) : module.exports.handHold = a;
}.call(this), function() {
    var a;
    a = function(a) {
        var b, c, d, e;
        return null == a && (a = {}), a.positioning || (a.positioning = "absolute"), a.scale || (a.scale = 1), 
        a.scaleX || (a.scaleX = 1), a.scaleY || (a.scaleY = 1), a.scaleZ || (a.scaleZ = 1), 
        a.verticalOffset || (a.verticalOffset = 0), b = 6, c = -100, e = {
            absolute: function(d) {
                return [ window.innerWidth / 2 + d[0] * b * a.scale * a.scaleX, window.innerHeight + c + a.verticalOffset - d[1] * b * a.scale * a.scaleY, d[2] * b * a.scale * a.scaleZ ];
            }
        }, d = function(b, c) {
            var d;
            return null == c && (c = !1), d = "function" == typeof a.positioning ? a.positioning.call(this, b) : e[a.positioning].call(this, b), 
            c && (this.screenPositionVec3 = d), d;
        }, {
            hand: {
                screenPosition: function(a) {
                    return d.call(this, a || this.stabilizedPalmPosition, !a);
                }
            },
            pointable: {
                screenPosition: function(a) {
                    return d.call(this, a || this.stabilizedTipPosition, !a);
                }
            }
        };
    }, "undefined" != typeof Leap && Leap.Controller ? Leap.Controller.plugin("screenPosition", a) : module.exports.screenPosition = a;
}.call(this), THREE.OBJLoader = function(a) {
    this.manager = void 0 !== a ? a : THREE.DefaultLoadingManager;
}, THREE.OBJLoader.prototype = {
    constructor: THREE.OBJLoader,
    load: function(a, b) {
        var c = this, d = new THREE.XHRLoader(c.manager);
        d.setCrossOrigin(this.crossOrigin), d.load(a, function(a) {
            b(c.parse(a));
        });
    },
    parse: function(a) {
        function b(a, b, c) {
            return new THREE.Vector3(a, b, c);
        }
        function c(a, b) {
            return new THREE.Vector2(a, b);
        }
        function d(a, b, c, d) {
            return new THREE.Face3(a, b, c, d);
        }
        function e(a, b, c, e) {
            h.faces.push(void 0 === e ? d(parseInt(a) - (l + 1), parseInt(b) - (l + 1), parseInt(c) - (l + 1)) : d(parseInt(a) - (l + 1), parseInt(b) - (l + 1), parseInt(c) - (l + 1), [ n[parseInt(e[0]) - 1].clone(), n[parseInt(e[1]) - 1].clone(), n[parseInt(e[2]) - 1].clone() ]));
        }
        function f(a, b, c) {
            h.faceVertexUvs[0].push([ o[parseInt(a) - 1].clone(), o[parseInt(b) - 1].clone(), o[parseInt(c) - 1].clone() ]);
        }
        function g(a, b, c) {
            void 0 === a[3] ? (e(a[0], a[1], a[2], c), void 0 !== b && b.length > 0 && f(b[0], b[1], b[2])) : (void 0 !== c && c.length > 0 ? (e(a[0], a[1], a[3], [ c[0], c[1], c[3] ]), 
            e(a[1], a[2], a[3], [ c[1], c[2], c[3] ])) : (e(a[0], a[1], a[3]), e(a[1], a[2], a[3])), 
            void 0 !== b && b.length > 0 && (f(b[0], b[1], b[3]), f(b[1], b[2], b[3])));
        }
        var h, i, j, k = new THREE.Object3D(), l = 0;
        /^o /gm.test(a) === !1 && (h = new THREE.Geometry(), i = new THREE.MeshLambertMaterial(), 
        j = new THREE.Mesh(h, i), k.add(j));
        for (var m = 0, n = [], o = [], p = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/, q = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/, r = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/, s = /f( +\d+)( +\d+)( +\d+)( +\d+)?/, t = /f( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))?/, u = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))?/, v = /f( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))?/, w = a.split("\n"), x = 0; x < w.length; x++) {
            var y = w[x];
            y = y.trim();
            var z;
            0 !== y.length && "#" !== y.charAt(0) && (null !== (z = p.exec(y)) ? h.vertices.push(b(parseFloat(z[1]), parseFloat(z[2]), parseFloat(z[3]))) : null !== (z = q.exec(y)) ? n.push(b(parseFloat(z[1]), parseFloat(z[2]), parseFloat(z[3]))) : null !== (z = r.exec(y)) ? o.push(c(parseFloat(z[1]), parseFloat(z[2]))) : null !== (z = s.exec(y)) ? g([ z[1], z[2], z[3], z[4] ]) : null !== (z = t.exec(y)) ? g([ z[2], z[5], z[8], z[11] ], [ z[3], z[6], z[9], z[12] ]) : null !== (z = u.exec(y)) ? g([ z[2], z[6], z[10], z[14] ], [ z[3], z[7], z[11], z[15] ], [ z[4], z[8], z[12], z[16] ]) : null !== (z = v.exec(y)) ? g([ z[2], z[5], z[8], z[11] ], [], [ z[3], z[6], z[9], z[12] ]) : /^o /.test(y) ? (void 0 !== h && (l += h.vertices.length), 
            h = new THREE.Geometry(), i = new THREE.MeshLambertMaterial(), j = new THREE.Mesh(h, i), 
            j.name = y.substring(2).trim(), k.add(j), m = 0) : /^g /.test(y) || (/^usemtl /.test(y) ? i.name = y.substring(7).trim() : /^mtllib /.test(y) || /^s /.test(y)));
        }
        for (var x = 0, A = k.children.length; A > x; x++) {
            var h = k.children[x].geometry;
            h.computeCentroids(), h.computeFaceNormals(), h.computeBoundingSphere();
        }
        return k;
    }
}, particleVertexShader = [ "attribute vec3  customColor;", "attribute float customOpacity;", "attribute float customSize;", "attribute float customAngle;", "attribute float customVisible;", "varying vec4  vColor;", "varying float vAngle;", "void main()", "{", "if ( customVisible > 0.5 )", "vColor = vec4( customColor, customOpacity );", "else", "vColor = vec4(0.0, 0.0, 0.0, 0.0);", "vAngle = customAngle;", "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", "gl_PointSize = customSize * ( 300.0 / length( mvPosition.xyz ) );", "gl_Position = projectionMatrix * mvPosition;", "}" ].join("\n"), 
particleFragmentShader = [ "uniform sampler2D texture;", "varying vec4 vColor;", "varying float vAngle;", "void main()", "{", "gl_FragColor = vColor;", "float c = cos(vAngle);", "float s = sin(vAngle);", "vec2 rotatedUV = vec2(c * (gl_PointCoord.x - 0.5) + s * (gl_PointCoord.y - 0.5) + 0.5,", "c * (gl_PointCoord.y - 0.5) - s * (gl_PointCoord.x - 0.5) + 0.5);", "vec4 rotatedTexture = texture2D( texture,  rotatedUV );", "gl_FragColor = gl_FragColor * rotatedTexture;", "}" ].join("\n"), 
ParticleTween.prototype.lerp = function(a) {
    for (var b = 0, c = this.times.length; c > b && a > this.times[b]; ) b++;
    if (0 == b) return this.values[0];
    if (b == c) return this.values[c - 1];
    var d = (a - this.times[b - 1]) / (this.times[b] - this.times[b - 1]);
    return this.values[0] instanceof THREE.Vector3 ? this.values[b - 1].clone().lerp(this.values[b], d) : this.values[b - 1] + d * (this.values[b] - this.values[b - 1]);
}, Particle.prototype.update = function(a) {
    if (this.position.add(this.velocity.clone().multiplyScalar(a)), this.velocity.add(this.acceleration.clone().multiplyScalar(a)), 
    this.angle += .01745329251 * this.angleVelocity * a, this.angleVelocity += .01745329251 * this.angleAcceleration * a, 
    this.age += a, this.sizeTween.times.length > 0 && (this.size = this.sizeTween.lerp(this.age)), 
    this.colorTween.times.length > 0) {
        var b = this.colorTween.lerp(this.age);
        this.color = new THREE.Color().setHSL(b.x, b.y, b.z);
    }
    this.opacityTween.times.length > 0 && (this.opacity = this.opacityTween.lerp(this.age));
};

var Type = Object.freeze({
    CUBE: 1,
    SPHERE: 2
});

ParticleEngine.prototype.setValues = function(a) {
    if (void 0 !== a) {
        this.sizeTween = new ParticleTween(), this.colorTween = new ParticleTween(), this.opacityTween = new ParticleTween();
        for (var b in a) this[b] = a[b];
        Particle.prototype.sizeTween = this.sizeTween, Particle.prototype.colorTween = this.colorTween, 
        Particle.prototype.opacityTween = this.opacityTween, this.particleArray = [], this.emitterAge = 0, 
        this.emitterAlive = !0, this.particleCount = this.particlesPerSecond * Math.min(this.particleDeathAge, this.emitterDeathAge), 
        this.particleGeometry = new THREE.Geometry(), this.particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                texture: {
                    type: "t",
                    value: this.particleTexture
                }
            },
            attributes: {
                customVisible: {
                    type: "f",
                    value: []
                },
                customAngle: {
                    type: "f",
                    value: []
                },
                customSize: {
                    type: "f",
                    value: []
                },
                customColor: {
                    type: "c",
                    value: []
                },
                customOpacity: {
                    type: "f",
                    value: []
                }
            },
            vertexShader: particleVertexShader,
            fragmentShader: particleFragmentShader,
            transparent: !0,
            alphaTest: .5,
            blending: THREE.NormalBlending,
            depthTest: !0
        }), this.particleMesh = new THREE.PointCloud();
    }
}, ParticleEngine.prototype.randomValue = function(a, b) {
    return a + b * (Math.random() - .5);
}, ParticleEngine.prototype.randomVector3 = function(a, b) {
    var c = new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5);
    return new THREE.Vector3().addVectors(a, new THREE.Vector3().multiplyVectors(b, c));
}, ParticleEngine.prototype.createParticle = function() {
    var a = new Particle();
    if (this.positionStyle == Type.CUBE && (a.position = this.randomVector3(this.positionBase, this.positionSpread)), 
    this.positionStyle == Type.SPHERE) {
        var b = 2 * Math.random() - 1, c = 6.2832 * Math.random(), d = Math.sqrt(1 - b * b), e = new THREE.Vector3(d * Math.cos(c), d * Math.sin(c), b);
        a.position = new THREE.Vector3().addVectors(this.positionBase, e.multiplyScalar(this.positionRadius));
    }
    if (this.velocityStyle == Type.CUBE && (a.velocity = this.randomVector3(this.velocityBase, this.velocitySpread)), 
    this.velocityStyle == Type.SPHERE) {
        var f = new THREE.Vector3().subVectors(a.position, this.positionBase), g = this.randomValue(this.speedBase, this.speedSpread);
        a.velocity = f.normalize().multiplyScalar(g);
    }
    a.acceleration = this.randomVector3(this.accelerationBase, this.accelerationSpread), 
    a.angle = this.randomValue(this.angleBase, this.angleSpread), a.angleVelocity = this.randomValue(this.angleVelocityBase, this.angleVelocitySpread), 
    a.angleAcceleration = this.randomValue(this.angleAccelerationBase, this.angleAccelerationSpread), 
    a.size = this.randomValue(this.sizeBase, this.sizeSpread);
    var h = this.randomVector3(this.colorBase, this.colorSpread);
    return a.color = new THREE.Color().setHSL(h.x, h.y, h.z), a.opacity = this.randomValue(this.opacityBase, this.opacitySpread), 
    a.age = 0, a.alive = 0, a;
}, ParticleEngine.prototype.initialize = function() {
    for (var a = 0; a < this.particleCount; a++) this.particleArray[a] = this.createParticle(), 
    this.particleGeometry.vertices[a] = this.particleArray[a].position, this.particleMaterial.attributes.customVisible.value[a] = this.particleArray[a].alive, 
    this.particleMaterial.attributes.customColor.value[a] = this.particleArray[a].color, 
    this.particleMaterial.attributes.customOpacity.value[a] = this.particleArray[a].opacity, 
    this.particleMaterial.attributes.customSize.value[a] = this.particleArray[a].size, 
    this.particleMaterial.attributes.customAngle.value[a] = this.particleArray[a].angle;
    this.particleMaterial.blending = this.blendStyle, this.blendStyle != THREE.NormalBlending && (this.particleMaterial.depthTest = !1), 
    this.particleMesh = new THREE.PointCloud(this.particleGeometry, this.particleMaterial), 
    this.particleMesh.dynamic = !0, this.particleMesh.sortParticles = !0, app.add(this.particleMesh, this);
}, ParticleEngine.prototype.update = function(a) {
    for (var b = [], c = 0; c < this.particleCount; c++) this.particleArray[c].alive && (this.particleArray[c].update(a), 
    this.particleArray[c].age > this.particleDeathAge && (this.particleArray[c].alive = 0, 
    b.push(c)), this.particleMaterial.attributes.customVisible.value[c] = this.particleArray[c].alive, 
    this.particleMaterial.attributes.customColor.value[c] = this.particleArray[c].color, 
    this.particleMaterial.attributes.customOpacity.value[c] = this.particleArray[c].opacity, 
    this.particleMaterial.attributes.customSize.value[c] = this.particleArray[c].size, 
    this.particleMaterial.attributes.customAngle.value[c] = this.particleArray[c].angle);
    if (this.emitterAlive) {
        if (this.emitterAge < this.particleDeathAge) {
            var d = Math.round(this.particlesPerSecond * (this.emitterAge + 0)), e = Math.round(this.particlesPerSecond * (this.emitterAge + a));
            e > this.particleCount && (e = this.particleCount);
            for (var c = d; e > c; c++) this.particleArray[c].alive = 1;
        }
        for (var f = 0; f < b.length; f++) {
            var c = b[f];
            this.particleArray[c] = this.createParticle(), this.particleArray[c].alive = 1, 
            this.particleGeometry.vertices[c] = this.particleArray[c].position;
        }
        this.emitterAge += a, this.repeat || this.emitterAge > this.emitterDeathAge && (this.emitterAlive = !1);
    }
}, ParticleEngine.prototype.destroy = function() {
    app.remove(this.particleMesh);
};

var Type = Object.freeze({
    CUBE: 1,
    SPHERE: 2
});

ParticleEngineModels = {
    fountain: {
        positionStyle: Type.CUBE,
        positionBase: new THREE.Vector3(0, 5, 0),
        positionSpread: new THREE.Vector3(10, 0, 10),
        velocityStyle: Type.CUBE,
        velocityBase: new THREE.Vector3(0, 160, 0),
        velocitySpread: new THREE.Vector3(100, 20, 100),
        accelerationBase: new THREE.Vector3(0, -100, 0),
        angleBase: 0,
        angleSpread: 180,
        angleVelocityBase: 0,
        angleVelocitySpread: 1440,
        sizeTween: new ParticleTween([ 0, 1 ], [ 1, 20 ]),
        opacityTween: new ParticleTween([ 2, 3 ], [ 1, 0 ]),
        colorTween: new ParticleTween([ .5, 2 ], [ new THREE.Vector3(0, 1, .5), new THREE.Vector3(.8, 1, .5) ]),
        particlesPerSecond: 200,
        particleDeathAge: 3,
        emitterDeathAge: 60
    },
    fireball: {
        positionStyle: Type.SPHERE,
        positionBase: new THREE.Vector3(0, 50, 0),
        positionRadius: 2,
        velocityStyle: Type.SPHERE,
        speedBase: 40,
        speedSpread: 8,
        particleTexture: THREE.ImageUtils.loadTexture("img/smokeparticle.png"),
        sizeTween: new ParticleTween([ 0, .1 ], [ 1, 150 ]),
        opacityTween: new ParticleTween([ .7, 1 ], [ 1, 0 ]),
        colorBase: new THREE.Vector3(.02, 1, .4),
        blendStyle: THREE.AdditiveBlending,
        particlesPerSecond: 60,
        particleDeathAge: 1.5,
        emitterDeathAge: 60
    },
    smoke: {
        positionStyle: Type.CUBE,
        positionBase: new THREE.Vector3(0, 0, 0),
        positionSpread: new THREE.Vector3(10, 0, 10),
        velocityStyle: Type.CUBE,
        velocityBase: new THREE.Vector3(0, 150, 0),
        velocitySpread: new THREE.Vector3(80, 50, 80),
        accelerationBase: new THREE.Vector3(0, -10, 0),
        particleTexture: THREE.ImageUtils.loadTexture("img/smokeparticle.png"),
        angleBase: 0,
        angleSpread: 720,
        angleVelocityBase: 0,
        angleVelocitySpread: 720,
        sizeTween: new ParticleTween([ 0, 1 ], [ 32, 128 ]),
        opacityTween: new ParticleTween([ .8, 2 ], [ .5, 0 ]),
        colorTween: new ParticleTween([ .4, 1 ], [ new THREE.Vector3(0, 0, .2), new THREE.Vector3(0, 0, .5) ]),
        particlesPerSecond: 200,
        particleDeathAge: 2,
        emitterDeathAge: 60
    },
    clouds: {
        positionStyle: Type.CUBE,
        positionBase: new THREE.Vector3(-100, 100, 0),
        positionSpread: new THREE.Vector3(0, 50, 60),
        velocityStyle: Type.CUBE,
        velocityBase: new THREE.Vector3(40, 0, 0),
        velocitySpread: new THREE.Vector3(20, 0, 0),
        particleTexture: THREE.ImageUtils.loadTexture("img/smokeparticle.png"),
        sizeBase: 80,
        sizeSpread: 100,
        colorBase: new THREE.Vector3(0, 0, 1),
        opacityTween: new ParticleTween([ 0, 1, 4, 5 ], [ 0, 1, 1, 0 ]),
        particlesPerSecond: 50,
        particleDeathAge: 10,
        emitterDeathAge: 60
    },
    snow: {
        positionStyle: Type.CUBE,
        positionBase: new THREE.Vector3(0, 200, 0),
        positionSpread: new THREE.Vector3(500, 0, 500),
        velocityStyle: Type.CUBE,
        velocityBase: new THREE.Vector3(0, -60, 0),
        velocitySpread: new THREE.Vector3(50, 20, 50),
        accelerationBase: new THREE.Vector3(0, -10, 0),
        angleBase: 0,
        angleSpread: 720,
        angleVelocityBase: 0,
        angleVelocitySpread: 60,
        sizeTween: new ParticleTween([ 0, .25 ], [ 1, 10 ]),
        colorBase: new THREE.Vector3(.66, 1, .9),
        opacityTween: new ParticleTween([ 2, 3 ], [ .8, 0 ]),
        particlesPerSecond: 200,
        particleDeathAge: 4,
        emitterDeathAge: 60
    },
    rain: {
        positionStyle: Type.CUBE,
        positionBase: new THREE.Vector3(0, 200, 0),
        positionSpread: new THREE.Vector3(600, 0, 600),
        velocityStyle: Type.CUBE,
        velocityBase: new THREE.Vector3(0, -400, 0),
        velocitySpread: new THREE.Vector3(10, 50, 10),
        accelerationBase: new THREE.Vector3(0, -10, 0),
        sizeBase: 8,
        sizeSpread: 4,
        colorBase: new THREE.Vector3(.66, 1, .7),
        colorSpread: new THREE.Vector3(0, 0, .2),
        opacityBase: .6,
        particlesPerSecond: 1e3,
        particleDeathAge: 1,
        emitterDeathAge: 60
    },
    starfield: {
        positionStyle: Type.CUBE,
        positionBase: new THREE.Vector3(0, 200, 0),
        positionSpread: new THREE.Vector3(600, 400, 600),
        velocityStyle: Type.CUBE,
        velocityBase: new THREE.Vector3(0, 0, 0),
        velocitySpread: new THREE.Vector3(.5, .5, .5),
        angleBase: 0,
        angleSpread: 720,
        angleVelocityBase: 0,
        angleVelocitySpread: 4,
        sizeBase: 10,
        sizeSpread: 2,
        colorBase: new THREE.Vector3(.15, 1, .9),
        colorSpread: new THREE.Vector3(0, 0, .2),
        opacityBase: 1,
        particlesPerSecond: 2e4,
        particleDeathAge: 60,
        emitterDeathAge: .1
    },
    fireflies: {
        positionStyle: Type.CUBE,
        positionBase: new THREE.Vector3(0, 100, 0),
        positionSpread: new THREE.Vector3(400, 200, 400),
        velocityStyle: Type.CUBE,
        velocityBase: new THREE.Vector3(0, 0, 0),
        velocitySpread: new THREE.Vector3(60, 20, 60),
        sizeBase: 30,
        sizeSpread: 2,
        opacityTween: new ParticleTween([ 0, 1, 1.1, 2, 2.1, 3, 3.1, 4, 4.1, 5, 5.1, 6, 6.1 ], [ .2, .2, 1, 1, .2, .2, 1, 1, .2, .2, 1, 1, .2 ]),
        colorBase: new THREE.Vector3(.3, 1, .6),
        colorSpread: new THREE.Vector3(.3, 0, 0),
        particlesPerSecond: 20,
        particleDeathAge: 6.1,
        emitterDeathAge: 600
    },
    startunnel: {
        positionStyle: Type.CUBE,
        positionBase: new THREE.Vector3(0, 0, 0),
        positionSpread: new THREE.Vector3(10, 10, 10),
        velocityStyle: Type.CUBE,
        velocityBase: new THREE.Vector3(0, 100, 200),
        velocitySpread: new THREE.Vector3(40, 40, 80),
        angleBase: 0,
        angleSpread: 720,
        angleVelocityBase: 10,
        angleVelocitySpread: 0,
        sizeBase: 4,
        sizeSpread: 2,
        colorBase: new THREE.Vector3(.15, 1, .8),
        opacityBase: 1,
        blendStyle: THREE.AdditiveBlending,
        particlesPerSecond: 500,
        particleDeathAge: 4,
        emitterDeathAge: 60
    },
    firework: {
        positionStyle: Type.SPHERE,
        positionBase: new THREE.Vector3(0, 100, 0),
        positionRadius: 10,
        velocityStyle: Type.SPHERE,
        speedBase: 90,
        speedSpread: 10,
        accelerationBase: new THREE.Vector3(0, -80, 0),
        sizeTween: new ParticleTween([ .5, .7, 1.3 ], [ 5, 40, 1 ]),
        opacityTween: new ParticleTween([ .2, .7, 2.5 ], [ .75, 1, 0 ]),
        colorTween: new ParticleTween([ .4, .8, 1 ], [ new THREE.Vector3(0, 1, 1), new THREE.Vector3(0, 1, .6), new THREE.Vector3(.8, 1, .6) ]),
        blendStyle: THREE.AdditiveBlending,
        particlesPerSecond: 3e3,
        particleDeathAge: 2.5,
        emitterDeathAge: .2
    },
    candle: {
        positionStyle: Type.SPHERE,
        positionBase: new THREE.Vector3(0, 0, 0),
        positionRadius: 1,
        velocityStyle: Type.CUBE,
        velocityBase: new THREE.Vector3(0, 100, 0),
        velocitySpread: new THREE.Vector3(20, 0, 20),
        particleTexture: THREE.ImageUtils.loadTexture("img/smokeparticle.png"),
        sizeTween: new ParticleTween([ 0, .3, 1.2 ], [ 20, 150, 1 ]),
        opacityTween: new ParticleTween([ .9, 1.5 ], [ 1, 0 ]),
        colorTween: new ParticleTween([ .5, 1 ], [ new THREE.Vector3(.02, 1, .5), new THREE.Vector3(.05, 1, 0) ]),
        blendStyle: THREE.AdditiveBlending,
        particlesPerSecond: 20,
        particleDeathAge: 1.5,
        emitterDeathAge: 60,
        repeat: !0
    }
}, window.Physijs = function() {
    "use strict";
    var a, b, c, d, e, f, g, h, i, j = !1, k = l, l = {}, m = new THREE.Vector3(), n = new THREE.Vector3(), o = new THREE.Matrix4(), p = new THREE.Quaternion(), q = {
        WORLDREPORT: 0,
        COLLISIONREPORT: 1,
        VEHICLEREPORT: 2,
        CONSTRAINTREPORT: 3
    }, r = 14, s = 5, t = 9, u = 6;
    return l.scripts = {}, b = function() {
        this._eventListeners = {};
    }, b.prototype.addEventListener = function(a, b) {
        this._eventListeners.hasOwnProperty(a) || (this._eventListeners[a] = []), this._eventListeners[a].push(b);
    }, b.prototype.removeEventListener = function(a, b) {
        var c;
        return this._eventListeners.hasOwnProperty(a) && (c = this._eventListeners[a].indexOf(b)) >= 0 ? (this._eventListeners[a].splice(c, 1), 
        !0) : !1;
    }, b.prototype.dispatchEvent = function(a) {
        var b, c = Array.prototype.splice.call(arguments, 1);
        if (this._eventListeners.hasOwnProperty(a)) for (b = 0; b < this._eventListeners[a].length; b++) this._eventListeners[a][b].apply(this, c);
    }, b.make = function(a) {
        a.prototype.addEventListener = b.prototype.addEventListener, a.prototype.removeEventListener = b.prototype.removeEventListener, 
        a.prototype.dispatchEvent = b.prototype.dispatchEvent;
    }, c = function() {
        var a = 1;
        return function() {
            return a++;
        };
    }(), d = function(a, b, c, d) {
        return new THREE.Vector3(Math.atan2(2 * (a * d - b * c), d * d - a * a - b * b + c * c), Math.asin(2 * (a * c + b * d)), Math.atan2(2 * (c * d - a * b), d * d + a * a - b * b - c * c));
    }, e = function(a, b, c) {
        var d, e, f, g, h, i, j, k;
        return d = Math.cos(b), e = Math.sin(b), f = Math.cos(-c), g = Math.sin(-c), h = Math.cos(a), 
        i = Math.sin(a), j = d * f, k = e * g, {
            w: j * h - k * i,
            x: j * i + k * h,
            y: e * f * h + d * g * i,
            z: d * g * h - e * f * i
        };
    }, f = function(a, b) {
        return o.identity(), o.identity().makeRotationFromQuaternion(b.quaternion), o.getInverse(o), 
        m.copy(a), n.copy(b.position), m.sub(n).applyMatrix4(o);
    }, l.noConflict = function() {
        return window.Physijs = k, l;
    }, l.createMaterial = function(a, b, c) {
        var d = function() {};
        return d.prototype = a, d = new d(), d._physijs = {
            id: a.id,
            friction: void 0 === b ? .8 : b,
            restitution: void 0 === c ? .2 : c
        }, d;
    }, l.PointConstraint = function(a, b, d) {
        void 0 === d && (d = b, b = void 0), this.type = "point", this.appliedImpulse = 0, 
        this.id = c(), this.objecta = a._physijs.id, this.positiona = f(d, a).clone(), b && (this.objectb = b._physijs.id, 
        this.positionb = f(d, b).clone());
    }, l.PointConstraint.prototype.getDefinition = function() {
        return {
            type: this.type,
            id: this.id,
            objecta: this.objecta,
            objectb: this.objectb,
            positiona: this.positiona,
            positionb: this.positionb
        };
    }, l.HingeConstraint = function(a, b, d, e) {
        void 0 === e && (e = d, d = b, b = void 0), this.type = "hinge", this.appliedImpulse = 0, 
        this.id = c(), this.scene = a.parent, this.objecta = a._physijs.id, this.positiona = f(d, a).clone(), 
        this.position = d.clone(), this.axis = e, b && (this.objectb = b._physijs.id, this.positionb = f(d, b).clone());
    }, l.HingeConstraint.prototype.getDefinition = function() {
        return {
            type: this.type,
            id: this.id,
            objecta: this.objecta,
            objectb: this.objectb,
            positiona: this.positiona,
            positionb: this.positionb,
            axis: this.axis
        };
    }, l.HingeConstraint.prototype.setLimits = function(a, b, c, d) {
        this.scene.execute("hinge_setLimits", {
            constraint: this.id,
            low: a,
            high: b,
            bias_factor: c,
            relaxation_factor: d
        });
    }, l.HingeConstraint.prototype.enableAngularMotor = function(a, b) {
        this.scene.execute("hinge_enableAngularMotor", {
            constraint: this.id,
            velocity: a,
            acceleration: b
        });
    }, l.HingeConstraint.prototype.disableMotor = function() {
        this.scene.execute("hinge_disableMotor", {
            constraint: this.id
        });
    }, l.SliderConstraint = function(a, b, d, e) {
        void 0 === e && (e = d, d = b, b = void 0), this.type = "slider", this.appliedImpulse = 0, 
        this.id = c(), this.scene = a.parent, this.objecta = a._physijs.id, this.positiona = f(d, a).clone(), 
        this.axis = e, b && (this.objectb = b._physijs.id, this.positionb = f(d, b).clone());
    }, l.SliderConstraint.prototype.getDefinition = function() {
        return {
            type: this.type,
            id: this.id,
            objecta: this.objecta,
            objectb: this.objectb,
            positiona: this.positiona,
            positionb: this.positionb,
            axis: this.axis
        };
    }, l.SliderConstraint.prototype.setLimits = function(a, b, c, d) {
        this.scene.execute("slider_setLimits", {
            constraint: this.id,
            lin_lower: a,
            lin_upper: b,
            ang_lower: c,
            ang_upper: d
        });
    }, l.SliderConstraint.prototype.setRestitution = function(a, b) {
        this.scene.execute("slider_setRestitution", {
            constraint: this.id,
            linear: a,
            angular: b
        });
    }, l.SliderConstraint.prototype.enableLinearMotor = function(a, b) {
        this.scene.execute("slider_enableLinearMotor", {
            constraint: this.id,
            velocity: a,
            acceleration: b
        });
    }, l.SliderConstraint.prototype.disableLinearMotor = function() {
        this.scene.execute("slider_disableLinearMotor", {
            constraint: this.id
        });
    }, l.SliderConstraint.prototype.enableAngularMotor = function(a, b) {
        this.scene.execute("slider_enableAngularMotor", {
            constraint: this.id,
            velocity: a,
            acceleration: b
        });
    }, l.SliderConstraint.prototype.disableAngularMotor = function() {
        this.scene.execute("slider_disableAngularMotor", {
            constraint: this.id
        });
    }, l.ConeTwistConstraint = function(a, b, d) {
        if (void 0 === d) throw "Both objects must be defined in a ConeTwistConstraint.";
        this.type = "conetwist", this.appliedImpulse = 0, this.id = c(), this.scene = a.parent, 
        this.objecta = a._physijs.id, this.positiona = f(d, a).clone(), this.objectb = b._physijs.id, 
        this.positionb = f(d, b).clone(), this.axisa = {
            x: a.rotation.x,
            y: a.rotation.y,
            z: a.rotation.z
        }, this.axisb = {
            x: b.rotation.x,
            y: b.rotation.y,
            z: b.rotation.z
        };
    }, l.ConeTwistConstraint.prototype.getDefinition = function() {
        return {
            type: this.type,
            id: this.id,
            objecta: this.objecta,
            objectb: this.objectb,
            positiona: this.positiona,
            positionb: this.positionb,
            axisa: this.axisa,
            axisb: this.axisb
        };
    }, l.ConeTwistConstraint.prototype.setLimit = function(a, b, c) {
        this.scene.execute("conetwist_setLimit", {
            constraint: this.id,
            x: a,
            y: b,
            z: c
        });
    }, l.ConeTwistConstraint.prototype.enableMotor = function() {
        this.scene.execute("conetwist_enableMotor", {
            constraint: this.id
        });
    }, l.ConeTwistConstraint.prototype.setMaxMotorImpulse = function(a) {
        this.scene.execute("conetwist_setMaxMotorImpulse", {
            constraint: this.id,
            max_impulse: a
        });
    }, l.ConeTwistConstraint.prototype.setMotorTarget = function(a) {
        a instanceof THREE.Vector3 ? a = new THREE.Quaternion().setFromEuler(new THREE.Euler(a.x, a.y, a.z)) : a instanceof THREE.Euler ? a = new THREE.Quaternion().setFromEuler(a) : a instanceof THREE.Matrix4 && (a = new THREE.Quaternion().setFromRotationMatrix(a)), 
        this.scene.execute("conetwist_setMotorTarget", {
            constraint: this.id,
            x: a.x,
            y: a.y,
            z: a.z,
            w: a.w
        });
    }, l.ConeTwistConstraint.prototype.disableMotor = function() {
        this.scene.execute("conetwist_disableMotor", {
            constraint: this.id
        });
    }, l.DOFConstraint = function(a, b, d) {
        void 0 === d && (d = b, b = void 0), this.type = "dof", this.appliedImpulse = 0, 
        this.id = c(), this.scene = a.parent, this.objecta = a._physijs.id, this.positiona = f(d, a).clone(), 
        this.axisa = {
            x: a.rotation.x,
            y: a.rotation.y,
            z: a.rotation.z
        }, b && (this.objectb = b._physijs.id, this.positionb = f(d, b).clone(), this.axisb = {
            x: b.rotation.x,
            y: b.rotation.y,
            z: b.rotation.z
        });
    }, l.DOFConstraint.prototype.getDefinition = function() {
        return {
            type: this.type,
            id: this.id,
            objecta: this.objecta,
            objectb: this.objectb,
            positiona: this.positiona,
            positionb: this.positionb,
            axisa: this.axisa,
            axisb: this.axisb
        };
    }, l.DOFConstraint.prototype.setLinearLowerLimit = function(a) {
        this.scene.execute("dof_setLinearLowerLimit", {
            constraint: this.id,
            x: a.x,
            y: a.y,
            z: a.z
        });
    }, l.DOFConstraint.prototype.setLinearUpperLimit = function(a) {
        this.scene.execute("dof_setLinearUpperLimit", {
            constraint: this.id,
            x: a.x,
            y: a.y,
            z: a.z
        });
    }, l.DOFConstraint.prototype.setAngularLowerLimit = function(a) {
        this.scene.execute("dof_setAngularLowerLimit", {
            constraint: this.id,
            x: a.x,
            y: a.y,
            z: a.z
        });
    }, l.DOFConstraint.prototype.setAngularUpperLimit = function(a) {
        this.scene.execute("dof_setAngularUpperLimit", {
            constraint: this.id,
            x: a.x,
            y: a.y,
            z: a.z
        });
    }, l.DOFConstraint.prototype.enableAngularMotor = function(a) {
        this.scene.execute("dof_enableAngularMotor", {
            constraint: this.id,
            which: a
        });
    }, l.DOFConstraint.prototype.configureAngularMotor = function(a, b, c, d, e) {
        this.scene.execute("dof_configureAngularMotor", {
            constraint: this.id,
            which: a,
            low_angle: b,
            high_angle: c,
            velocity: d,
            max_force: e
        });
    }, l.DOFConstraint.prototype.disableAngularMotor = function(a) {
        this.scene.execute("dof_disableAngularMotor", {
            constraint: this.id,
            which: a
        });
    }, l.Scene = function(c) {
        var d = this;
        b.call(this), THREE.Scene.call(this), this._worker = new Worker(l.scripts.worker || "physijs_worker.js"), 
        this._worker.transferableMessage = this._worker.webkitPostMessage || this._worker.postMessage, 
        this._materials_ref_counts = {}, this._objects = {}, this._vehicles = {}, this._constraints = {};
        var e = new ArrayBuffer(1);
        this._worker.transferableMessage(e, [ e ]), a = 0 === e.byteLength, this._worker.onmessage = function(a) {
            var b, c = a.data;
            if (c instanceof ArrayBuffer && 1 !== c.byteLength && (c = new Float32Array(c)), 
            c instanceof Float32Array) switch (c[0]) {
              case q.WORLDREPORT:
                d._updateScene(c);
                break;

              case q.COLLISIONREPORT:
                d._updateCollisions(c);
                break;

              case q.VEHICLEREPORT:
                d._updateVehicles(c);
                break;

              case q.CONSTRAINTREPORT:
                d._updateConstraints(c);
            } else if (c.cmd) switch (c.cmd) {
              case "objectReady":
                b = c.params, d._objects[b] && d._objects[b].dispatchEvent("ready");
                break;

              case "worldReady":
                d.dispatchEvent("ready");
                break;

              case "vehicle":
                window.test = c;
                break;

              default:
                console.debug("Received: " + c.cmd), console.dir(c.params);
            } else switch (c[0]) {
              case q.WORLDREPORT:
                d._updateScene(c);
                break;

              case q.COLLISIONREPORT:
                d._updateCollisions(c);
                break;

              case q.VEHICLEREPORT:
                d._updateVehicles(c);
                break;

              case q.CONSTRAINTREPORT:
                d._updateConstraints(c);
            }
        }, c = c || {}, c.ammo = l.scripts.ammo || "ammo.js", c.fixedTimeStep = c.fixedTimeStep || 1 / 60, 
        c.rateLimit = c.rateLimit || !0, this.execute("init", c);
    }, l.Scene.prototype = new THREE.Scene(), l.Scene.prototype.constructor = l.Scene, 
    b.make(l.Scene), l.Scene.prototype._updateScene = function(b) {
        var c, d, e, f = b[1];
        for (d = 0; f > d; d++) e = 2 + d * r, c = this._objects[b[e]], void 0 !== c && (c.__dirtyPosition === !1 && c.position.set(b[e + 1], b[e + 2], b[e + 3]), 
        c.__dirtyRotation === !1 && c.quaternion.set(b[e + 4], b[e + 5], b[e + 6], b[e + 7]), 
        c._physijs.linearVelocity.set(b[e + 8], b[e + 9], b[e + 10]), c._physijs.angularVelocity.set(b[e + 11], b[e + 12], b[e + 13]));
        a && this._worker.transferableMessage(b.buffer, [ b.buffer ]), j = !1, this.dispatchEvent("update");
    }, l.Scene.prototype._updateVehicles = function(b) {
        var c, d, e, f;
        for (e = 0; e < (b.length - 1) / t; e++) f = 1 + e * t, c = this._vehicles[b[f]], 
        void 0 !== c && (d = c.wheels[b[f + 1]], d.position.set(b[f + 2], b[f + 3], b[f + 4]), 
        d.quaternion.set(b[f + 5], b[f + 6], b[f + 7], b[f + 8]));
        a && this._worker.transferableMessage(b.buffer, [ b.buffer ]);
    }, l.Scene.prototype._updateConstraints = function(b) {
        var c, d, e, f;
        for (e = 0; e < (b.length - 1) / u; e++) f = 1 + e * u, c = this._constraints[b[f]], 
        d = this._objects[b[f + 1]], void 0 !== c && void 0 !== d && (m.set(b[f + 2], b[f + 3], b[f + 4]), 
        o.extractRotation(d.matrix), m.applyMatrix4(o), c.positiona.addVectors(d.position, m), 
        c.appliedImpulse = b[f + 5]);
        a && this._worker.transferableMessage(b.buffer, [ b.buffer ]);
    }, l.Scene.prototype._updateCollisions = function(b) {
        var c, d, e, f, g, j, k, l = {}, n = {};
        for (c = 0; c < b[1]; c++) e = 2 + c * s, f = b[e], g = b[e + 1], n[f + "-" + g] = e + 2, 
        n[g + "-" + f] = -1 * (e + 2), l[f] || (l[f] = []), l[f].push(g), l[g] || (l[g] = []), 
        l[g].push(f);
        for (j in this._objects) if (this._objects.hasOwnProperty(j)) if (f = this._objects[j], 
        l[j]) {
            for (d = 0; d < f._physijs.touches.length; d++) -1 === l[j].indexOf(f._physijs.touches[d]) && f._physijs.touches.splice(d--, 1);
            for (d = 0; d < l[j].length; d++) if (k = l[j][d], g = this._objects[k], g && -1 === f._physijs.touches.indexOf(k)) {
                f._physijs.touches.push(k), m.subVectors(f.getLinearVelocity(), g.getLinearVelocity()), 
                h = m.clone(), m.subVectors(f.getAngularVelocity(), g.getAngularVelocity()), i = m.clone();
                var o = n[f._physijs.id + "-" + g._physijs.id];
                o > 0 ? m.set(-b[o], -b[o + 1], -b[o + 2]) : (o *= -1, m.set(b[o], b[o + 1], b[o + 2])), 
                f.dispatchEvent("collision", g, h, i, m);
            }
        } else f._physijs.touches.length = 0;
        this.collisions = l, a && this._worker.transferableMessage(b.buffer, [ b.buffer ]);
    }, l.Scene.prototype.addConstraint = function(a, b) {
        if (this._constraints[a.id] = a, this.execute("addConstraint", a.getDefinition()), 
        b) {
            var c;
            switch (a.type) {
              case "point":
                c = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshNormalMaterial()), 
                c.position.copy(a.positiona), this._objects[a.objecta].add(c);
                break;

              case "hinge":
                c = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshNormalMaterial()), 
                c.position.copy(a.positiona), this._objects[a.objecta].add(c);
                break;

              case "slider":
                c = new THREE.Mesh(new THREE.CubeGeometry(10, 1, 1), new THREE.MeshNormalMaterial()), 
                c.position.copy(a.positiona), c.rotation.set(a.axis.y, a.axis.x, a.axis.z), this._objects[a.objecta].add(c);
                break;

              case "conetwist":
                c = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshNormalMaterial()), 
                c.position.copy(a.positiona), this._objects[a.objecta].add(c);
                break;

              case "dof":
                c = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshNormalMaterial()), 
                c.position.copy(a.positiona), this._objects[a.objecta].add(c);
            }
        }
        return a;
    }, l.Scene.prototype.removeConstraint = function(a) {
        void 0 !== this._constraints[a.id] && (this.execute("removeConstraint", {
            id: a.id
        }), delete this._constraints[a.id]);
    }, l.Scene.prototype.execute = function(a, b) {
        this._worker.postMessage({
            cmd: a,
            params: b
        });
    }, g = function(a, b) {
        var c;
        for (c = 0; c < b.children.length; c++) b.children[c]._physijs && (b.children[c].updateMatrix(), 
        b.children[c].updateMatrixWorld(), m.getPositionFromMatrix(b.children[c].matrixWorld), 
        p.setFromRotationMatrix(b.children[c].matrixWorld), b.children[c]._physijs.position_offset = {
            x: m.x,
            y: m.y,
            z: m.z
        }, b.children[c]._physijs.rotation = {
            x: p.x,
            y: p.y,
            z: p.z,
            w: p.w
        }, a._physijs.children.push(b.children[c]._physijs)), g(a, b.children[c]);
    }, l.Scene.prototype.add = function(a) {
        if (THREE.Mesh.prototype.add.call(this, a), a._physijs) if (a.world = this, a instanceof l.Vehicle) this.add(a.mesh), 
        this._vehicles[a._physijs.id] = a, this.execute("addVehicle", a._physijs); else {
            a.__dirtyPosition = !1, a.__dirtyRotation = !1, this._objects[a._physijs.id] = a, 
            a.children.length && (a._physijs.children = [], g(a, a)), a.material._physijs && (this._materials_ref_counts.hasOwnProperty(a.material._physijs.id) ? this._materials_ref_counts[a.material._physijs.id]++ : (this.execute("registerMaterial", a.material._physijs), 
            a._physijs.materialId = a.material._physijs.id, this._materials_ref_counts[a.material._physijs.id] = 1)), 
            a._physijs.position = {
                x: a.position.x,
                y: a.position.y,
                z: a.position.z
            }, a._physijs.rotation = {
                x: a.quaternion.x,
                y: a.quaternion.y,
                z: a.quaternion.z,
                w: a.quaternion.w
            };
            {
                new THREE.Vector3(1, 1, 1);
            }
            a._physijs.width && (a._physijs.width *= a.scale.x), a._physijs.height && (a._physijs.height *= a.scale.y), 
            a._physijs.depth && (a._physijs.depth *= a.scale.z), this.execute("addObject", a._physijs);
        }
    }, l.Scene.prototype.remove = function(a) {
        if (a instanceof l.Vehicle) {
            for (this.execute("removeVehicle", {
                id: a._physijs.id
            }); a.wheels.length; ) this.remove(a.wheels.pop());
            this.remove(a.mesh), delete this._vehicles[a._physijs.id];
        } else THREE.Mesh.prototype.remove.call(this, a), a._physijs && (delete this._objects[a._physijs.id], 
        this.execute("removeObject", {
            id: a._physijs.id
        }));
        a.material && a.material._physijs && this._materials_ref_counts.hasOwnProperty(a.material._physijs.id) && (this._materials_ref_counts[a.material._physijs.id]--, 
        0 == this._materials_ref_counts[a.material._physijs.id] && (this.execute("unRegisterMaterial", a.material._physijs), 
        delete this._materials_ref_counts[a.material._physijs.id]));
    }, l.Scene.prototype.setFixedTimeStep = function(a) {
        a && this.execute("setFixedTimeStep", a);
    }, l.Scene.prototype.setGravity = function(a) {
        a && this.execute("setGravity", a);
    }, l.Scene.prototype.simulate = function(a, b) {
        var c, d, e;
        if (j) return !1;
        j = !0;
        for (c in this._objects) this._objects.hasOwnProperty(c) && (d = this._objects[c], 
        (d.__dirtyPosition || d.__dirtyRotation) && (e = {
            id: d._physijs.id
        }, d.__dirtyPosition && (e.pos = {
            x: d.position.x,
            y: d.position.y,
            z: d.position.z
        }, d.__dirtyPosition = !1), d.__dirtyRotation && (e.quat = {
            x: d.quaternion.x,
            y: d.quaternion.y,
            z: d.quaternion.z,
            w: d.quaternion.w
        }, d.__dirtyRotation = !1), this.execute("updateTransform", e)));
        return this.execute("simulate", {
            timeStep: a,
            maxSubSteps: b
        }), !0;
    }, l.Mesh = function(a, d, e) {
        a && (b.call(this), THREE.Mesh.call(this, a, d), a.boundingBox || a.computeBoundingBox(), 
        this._physijs = {
            type: null,
            id: c(),
            mass: e || 0,
            touches: [],
            linearVelocity: new THREE.Vector3(),
            angularVelocity: new THREE.Vector3()
        });
    }, l.Mesh.prototype = new THREE.Mesh(), l.Mesh.prototype.constructor = l.Mesh, b.make(l.Mesh), 
    l.Mesh.prototype.__defineGetter__("mass", function() {
        return this._physijs.mass;
    }), l.Mesh.prototype.__defineSetter__("mass", function(a) {
        this._physijs.mass = a, this.world && this.world.execute("updateMass", {
            id: this._physijs.id,
            mass: a
        });
    }), l.Mesh.prototype.applyCentralImpulse = function(a) {
        this.world && this.world.execute("applyCentralImpulse", {
            id: this._physijs.id,
            x: a.x,
            y: a.y,
            z: a.z
        });
    }, l.Mesh.prototype.applyImpulse = function(a, b) {
        this.world && this.world.execute("applyImpulse", {
            id: this._physijs.id,
            impulse_x: a.x,
            impulse_y: a.y,
            impulse_z: a.z,
            x: b.x,
            y: b.y,
            z: b.z
        });
    }, l.Mesh.prototype.applyCentralForce = function(a) {
        this.world && this.world.execute("applyCentralForce", {
            id: this._physijs.id,
            x: a.x,
            y: a.y,
            z: a.z
        });
    }, l.Mesh.prototype.applyForce = function(a, b) {
        this.world && this.world.execute("applyForce", {
            id: this._physijs.id,
            force_x: a.x,
            force_y: a.y,
            force_z: a.z,
            x: b.x,
            y: b.y,
            z: b.z
        });
    }, l.Mesh.prototype.getAngularVelocity = function() {
        return this._physijs.angularVelocity;
    }, l.Mesh.prototype.setAngularVelocity = function(a) {
        this.world && this.world.execute("setAngularVelocity", {
            id: this._physijs.id,
            x: a.x,
            y: a.y,
            z: a.z
        });
    }, l.Mesh.prototype.getLinearVelocity = function() {
        return this._physijs.linearVelocity;
    }, l.Mesh.prototype.setLinearVelocity = function(a) {
        this.world && this.world.execute("setLinearVelocity", {
            id: this._physijs.id,
            x: a.x,
            y: a.y,
            z: a.z
        });
    }, l.Mesh.prototype.setAngularFactor = function(a) {
        this.world && this.world.execute("setAngularFactor", {
            id: this._physijs.id,
            x: a.x,
            y: a.y,
            z: a.z
        });
    }, l.Mesh.prototype.setLinearFactor = function(a) {
        this.world && this.world.execute("setLinearFactor", {
            id: this._physijs.id,
            x: a.x,
            y: a.y,
            z: a.z
        });
    }, l.Mesh.prototype.setDamping = function(a, b) {
        this.world && this.world.execute("setDamping", {
            id: this._physijs.id,
            linear: a,
            angular: b
        });
    }, l.Mesh.prototype.setCcdMotionThreshold = function(a) {
        this.world && this.world.execute("setCcdMotionThreshold", {
            id: this._physijs.id,
            threshold: a
        });
    }, l.Mesh.prototype.setCcdSweptSphereRadius = function(a) {
        this.world && this.world.execute("setCcdSweptSphereRadius", {
            id: this._physijs.id,
            radius: a
        });
    }, l.PlaneMesh = function(a, b, c) {
        var d, e;
        l.Mesh.call(this, a, b, c), a.boundingBox || a.computeBoundingBox(), d = a.boundingBox.max.x - a.boundingBox.min.x, 
        e = a.boundingBox.max.y - a.boundingBox.min.y, this._physijs.type = "plane", this._physijs.normal = a.faces[0].normal.clone(), 
        this._physijs.mass = "undefined" == typeof c ? d * e : c;
    }, l.PlaneMesh.prototype = new l.Mesh(), l.PlaneMesh.prototype.constructor = l.PlaneMesh, 
    l.HeightfieldMesh = function(a, b, c, d, e) {
        l.Mesh.call(this, a, b, c), this._physijs.type = "heightfield", this._physijs.xsize = a.boundingBox.max.x - a.boundingBox.min.x, 
        this._physijs.ysize = a.boundingBox.max.y - a.boundingBox.min.y, this._physijs.xpts = "undefined" == typeof d ? Math.sqrt(a.vertices.length) : d + 1, 
        this._physijs.ypts = "undefined" == typeof e ? Math.sqrt(a.vertices.length) : e + 1, 
        this._physijs.absMaxHeight = Math.max(a.boundingBox.max.z, Math.abs(a.boundingBox.min.z));
        for (var f, g, h = [], i = 0; i < a.vertices.length; i++) f = i % this._physijs.xpts, 
        g = Math.round(i / this._physijs.xpts - i % this._physijs.xpts / this._physijs.xpts), 
        h[i] = a.vertices[f + (this._physijs.ypts - g - 1) * this._physijs.ypts].z;
        this._physijs.points = h;
    }, l.HeightfieldMesh.prototype = new l.Mesh(), l.HeightfieldMesh.prototype.constructor = l.HeightfieldMesh, 
    l.BoxMesh = function(a, b, c) {
        var d, e, f;
        l.Mesh.call(this, a, b, c), a.boundingBox || a.computeBoundingBox(), d = a.boundingBox.max.x - a.boundingBox.min.x, 
        e = a.boundingBox.max.y - a.boundingBox.min.y, f = a.boundingBox.max.z - a.boundingBox.min.z, 
        this._physijs.type = "box", this._physijs.width = d, this._physijs.height = e, this._physijs.depth = f, 
        this._physijs.mass = "undefined" == typeof c ? d * e * f : c;
    }, l.BoxMesh.prototype = new l.Mesh(), l.BoxMesh.prototype.constructor = l.BoxMesh, 
    l.SphereMesh = function(a, b, c) {
        l.Mesh.call(this, a, b, c), a.boundingSphere || a.computeBoundingSphere(), this._physijs.type = "sphere", 
        this._physijs.radius = a.boundingSphere.radius, this._physijs.mass = "undefined" == typeof c ? 4 / 3 * Math.PI * Math.pow(this._physijs.radius, 3) : c;
    }, l.SphereMesh.prototype = new l.Mesh(), l.SphereMesh.prototype.constructor = l.SphereMesh, 
    l.CylinderMesh = function(a, b, c) {
        var d, e, f;
        l.Mesh.call(this, a, b, c), a.boundingBox || a.computeBoundingBox(), d = a.boundingBox.max.x - a.boundingBox.min.x, 
        e = a.boundingBox.max.y - a.boundingBox.min.y, f = a.boundingBox.max.z - a.boundingBox.min.z, 
        this._physijs.type = "cylinder", this._physijs.width = d, this._physijs.height = e, 
        this._physijs.depth = f, this._physijs.mass = "undefined" == typeof c ? d * e * f : c;
    }, l.CylinderMesh.prototype = new l.Mesh(), l.CylinderMesh.prototype.constructor = l.CylinderMesh, 
    l.CapsuleMesh = function(a, b, c) {
        var d, e, f;
        l.Mesh.call(this, a, b, c), a.boundingBox || a.computeBoundingBox(), d = a.boundingBox.max.x - a.boundingBox.min.x, 
        e = a.boundingBox.max.y - a.boundingBox.min.y, f = a.boundingBox.max.z - a.boundingBox.min.z, 
        this._physijs.type = "capsule", this._physijs.radius = Math.max(d / 2, f / 2), this._physijs.height = e, 
        this._physijs.mass = "undefined" == typeof c ? d * e * f : c;
    }, l.CapsuleMesh.prototype = new l.Mesh(), l.CapsuleMesh.prototype.constructor = l.CapsuleMesh, 
    l.ConeMesh = function(a, b, c) {
        var d, e;
        l.Mesh.call(this, a, b, c), a.boundingBox || a.computeBoundingBox(), d = a.boundingBox.max.x - a.boundingBox.min.x, 
        e = a.boundingBox.max.y - a.boundingBox.min.y, this._physijs.type = "cone", this._physijs.radius = d / 2, 
        this._physijs.height = e, this._physijs.mass = "undefined" == typeof c ? d * e : c;
    }, l.ConeMesh.prototype = new l.Mesh(), l.ConeMesh.prototype.constructor = l.ConeMesh, 
    l.ConcaveMesh = function(a, b, c) {
        var d, e, f, g, h, i, j = [];
        for (l.Mesh.call(this, a, b, c), a.boundingBox || a.computeBoundingBox(), h = a.vertices, 
        d = 0; d < a.faces.length; d++) i = a.faces[d], i instanceof THREE.Face3 ? j.push([ {
            x: h[i.a].x,
            y: h[i.a].y,
            z: h[i.a].z
        }, {
            x: h[i.b].x,
            y: h[i.b].y,
            z: h[i.b].z
        }, {
            x: h[i.c].x,
            y: h[i.c].y,
            z: h[i.c].z
        } ]) : i instanceof THREE.Face4 && (j.push([ {
            x: h[i.a].x,
            y: h[i.a].y,
            z: h[i.a].z
        }, {
            x: h[i.b].x,
            y: h[i.b].y,
            z: h[i.b].z
        }, {
            x: h[i.d].x,
            y: h[i.d].y,
            z: h[i.d].z
        } ]), j.push([ {
            x: h[i.b].x,
            y: h[i.b].y,
            z: h[i.b].z
        }, {
            x: h[i.c].x,
            y: h[i.c].y,
            z: h[i.c].z
        }, {
            x: h[i.d].x,
            y: h[i.d].y,
            z: h[i.d].z
        } ]));
        e = a.boundingBox.max.x - a.boundingBox.min.x, f = a.boundingBox.max.y - a.boundingBox.min.y, 
        g = a.boundingBox.max.z - a.boundingBox.min.z, this._physijs.type = "concave", this._physijs.triangles = j, 
        this._physijs.mass = "undefined" == typeof c ? e * f * g : c;
    }, l.ConcaveMesh.prototype = new l.Mesh(), l.ConcaveMesh.prototype.constructor = l.ConcaveMesh, 
    l.ConvexMesh = function(a, b, c) {
        var d, e, f, g, h = [];
        for (l.Mesh.call(this, a, b, c), a.boundingBox || a.computeBoundingBox(), d = 0; d < a.vertices.length; d++) h.push({
            x: a.vertices[d].x,
            y: a.vertices[d].y,
            z: a.vertices[d].z
        });
        e = a.boundingBox.max.x - a.boundingBox.min.x, f = a.boundingBox.max.y - a.boundingBox.min.y, 
        g = a.boundingBox.max.z - a.boundingBox.min.z, this._physijs.type = "convex", this._physijs.points = h, 
        this._physijs.mass = "undefined" == typeof c ? e * f * g : c;
    }, l.ConvexMesh.prototype = new l.Mesh(), l.ConvexMesh.prototype.constructor = l.ConvexMesh, 
    l.Vehicle = function(a, b) {
        b = b || new l.VehicleTuning(), this.mesh = a, this.wheels = [], this._physijs = {
            id: c(),
            rigidBody: a._physijs.id,
            suspension_stiffness: b.suspension_stiffness,
            suspension_compression: b.suspension_compression,
            suspension_damping: b.suspension_damping,
            max_suspension_travel: b.max_suspension_travel,
            friction_slip: b.friction_slip,
            max_suspension_force: b.max_suspension_force
        };
    }, l.Vehicle.prototype.addWheel = function(a, b, c, d, e, f, g, h, i) {
        var j = new THREE.Mesh(a, b);
        j.castShadow = j.receiveShadow = !0, j.position.copy(d).multiplyScalar(f / 100).add(c), 
        this.world.add(j), this.wheels.push(j), this.world.execute("addWheel", {
            id: this._physijs.id,
            connection_point: {
                x: c.x,
                y: c.y,
                z: c.z
            },
            wheel_direction: {
                x: d.x,
                y: d.y,
                z: d.z
            },
            wheel_axle: {
                x: e.x,
                y: e.y,
                z: e.z
            },
            suspension_rest_length: f,
            wheel_radius: g,
            is_front_wheel: h,
            tuning: i
        });
    }, l.Vehicle.prototype.setSteering = function(a, b) {
        if (void 0 !== b && void 0 !== this.wheels[b]) this.world.execute("setSteering", {
            id: this._physijs.id,
            wheel: b,
            steering: a
        }); else if (this.wheels.length > 0) for (var c = 0; c < this.wheels.length; c++) this.world.execute("setSteering", {
            id: this._physijs.id,
            wheel: c,
            steering: a
        });
    }, l.Vehicle.prototype.setBrake = function(a, b) {
        if (void 0 !== b && void 0 !== this.wheels[b]) this.world.execute("setBrake", {
            id: this._physijs.id,
            wheel: b,
            brake: a
        }); else if (this.wheels.length > 0) for (var c = 0; c < this.wheels.length; c++) this.world.execute("setBrake", {
            id: this._physijs.id,
            wheel: c,
            brake: a
        });
    }, l.Vehicle.prototype.applyEngineForce = function(a, b) {
        if (void 0 !== b && void 0 !== this.wheels[b]) this.world.execute("applyEngineForce", {
            id: this._physijs.id,
            wheel: b,
            force: a
        }); else if (this.wheels.length > 0) for (var c = 0; c < this.wheels.length; c++) this.world.execute("applyEngineForce", {
            id: this._physijs.id,
            wheel: c,
            force: a
        });
    }, l.VehicleTuning = function(a, b, c, d, e, f) {
        this.suspension_stiffness = void 0 !== a ? a : 5.88, this.suspension_compression = void 0 !== b ? b : .83, 
        this.suspension_damping = void 0 !== c ? c : .88, this.max_suspension_travel = void 0 !== d ? d : 500, 
        this.friction_slip = void 0 !== e ? e : 10.5, this.max_suspension_force = void 0 !== f ? f : 6e3;
    }, l;
}();

var TWEEN = TWEEN || function() {
    var a, b, c, d, e = [];
    return {
        start: function(a) {
            c = setInterval(this.update, 1e3 / (a || 60));
        },
        stop: function() {
            clearInterval(c);
        },
        add: function(a) {
            e.push(a);
        },
        getAll: function() {
            return e;
        },
        removeAll: function() {
            e = [];
        },
        remove: function(b) {
            a = e.indexOf(b), -1 !== a && e.splice(a, 1);
        },
        update: function() {
            for (a = 0, b = e.length, d = new Date().getTime(); b > a; ) e[a].update(d) ? a++ : (e.splice(a, 1), 
            b--);
        }
    };
}();

TWEEN.Tween = function(a) {
    var b = {}, c = {}, d = {}, e = 1e3, f = 0, g = null, h = TWEEN.Easing.Linear.EaseNone, i = null, j = null, k = null;
    this.to = function(b, c) {
        null !== c && (e = c);
        for (var f in b) null !== a[f] && (d[f] = b[f]);
        return this;
    }, this.start = function() {
        TWEEN.add(this), g = new Date().getTime() + f;
        for (var e in d) null !== a[e] && (b[e] = a[e], c[e] = d[e] - a[e]);
        return this;
    }, this.stop = function() {
        return TWEEN.remove(this), this;
    }, this.delay = function(a) {
        return f = a, this;
    }, this.easing = function(a) {
        return h = a, this;
    }, this.chain = function(a) {
        i = a;
    }, this.onUpdate = function(a) {
        return j = a, this;
    }, this.onComplete = function(a) {
        return k = a, this;
    }, this.update = function(d) {
        var f, l;
        if (g > d) return !0;
        d = (d - g) / e, d = d > 1 ? 1 : d, l = h(d);
        for (f in c) a[f] = b[f] + c[f] * l;
        return null !== j && j.call(a, l), 1 == d ? (null !== k && k.call(a), null !== i && i.start(), 
        !1) : !0;
    };
}, TWEEN.Easing = {
    Linear: {},
    Quadratic: {},
    Cubic: {},
    Quartic: {},
    Quintic: {},
    Sinusoidal: {},
    Exponential: {},
    Circular: {},
    Elastic: {},
    Back: {},
    Bounce: {}
}, TWEEN.Easing.Linear.EaseNone = function(a) {
    return a;
}, TWEEN.Easing.Quadratic.EaseIn = function(a) {
    return a * a;
}, TWEEN.Easing.Quadratic.EaseOut = function(a) {
    return -a * (a - 2);
}, TWEEN.Easing.Quadratic.EaseInOut = function(a) {
    return (a *= 2) < 1 ? .5 * a * a : -.5 * (--a * (a - 2) - 1);
}, TWEEN.Easing.Cubic.EaseIn = function(a) {
    return a * a * a;
}, TWEEN.Easing.Cubic.EaseOut = function(a) {
    return --a * a * a + 1;
}, TWEEN.Easing.Cubic.EaseInOut = function(a) {
    return (a *= 2) < 1 ? .5 * a * a * a : .5 * ((a -= 2) * a * a + 2);
}, TWEEN.Easing.Quartic.EaseIn = function(a) {
    return a * a * a * a;
}, TWEEN.Easing.Quartic.EaseOut = function(a) {
    return -(--a * a * a * a - 1);
}, TWEEN.Easing.Quartic.EaseInOut = function(a) {
    return (a *= 2) < 1 ? .5 * a * a * a * a : -.5 * ((a -= 2) * a * a * a - 2);
}, TWEEN.Easing.Quintic.EaseIn = function(a) {
    return a * a * a * a * a;
}, TWEEN.Easing.Quintic.EaseOut = function(a) {
    return (a -= 1) * a * a * a * a + 1;
}, TWEEN.Easing.Quintic.EaseInOut = function(a) {
    return (a *= 2) < 1 ? .5 * a * a * a * a * a : .5 * ((a -= 2) * a * a * a * a + 2);
}, TWEEN.Easing.Sinusoidal.EaseIn = function(a) {
    return -Math.cos(a * Math.PI / 2) + 1;
}, TWEEN.Easing.Sinusoidal.EaseOut = function(a) {
    return Math.sin(a * Math.PI / 2);
}, TWEEN.Easing.Sinusoidal.EaseInOut = function(a) {
    return -.5 * (Math.cos(Math.PI * a) - 1);
}, TWEEN.Easing.Exponential.EaseIn = function(a) {
    return 0 == a ? 0 : Math.pow(2, 10 * (a - 1));
}, TWEEN.Easing.Exponential.EaseOut = function(a) {
    return 1 == a ? 1 : -Math.pow(2, -10 * a) + 1;
}, TWEEN.Easing.Exponential.EaseInOut = function(a) {
    return 0 == a ? 0 : 1 == a ? 1 : (a *= 2) < 1 ? .5 * Math.pow(2, 10 * (a - 1)) : .5 * (-Math.pow(2, -10 * (a - 1)) + 2);
}, TWEEN.Easing.Circular.EaseIn = function(a) {
    return -(Math.sqrt(1 - a * a) - 1);
}, TWEEN.Easing.Circular.EaseOut = function(a) {
    return Math.sqrt(1 - --a * a);
}, TWEEN.Easing.Circular.EaseInOut = function(a) {
    return (a /= .5) < 1 ? -.5 * (Math.sqrt(1 - a * a) - 1) : .5 * (Math.sqrt(1 - (a -= 2) * a) + 1);
}, TWEEN.Easing.Elastic.EaseIn = function(a) {
    var b, c = .1, d = .4;
    return 0 == a ? 0 : 1 == a ? 1 : (d || (d = .3), !c || 1 > c ? (c = 1, b = d / 4) : b = d / (2 * Math.PI) * Math.asin(1 / c), 
    -(c * Math.pow(2, 10 * (a -= 1)) * Math.sin(2 * (a - b) * Math.PI / d)));
}, TWEEN.Easing.Elastic.EaseOut = function(a) {
    var b, c = .1, d = .4;
    return 0 == a ? 0 : 1 == a ? 1 : (d || (d = .3), !c || 1 > c ? (c = 1, b = d / 4) : b = d / (2 * Math.PI) * Math.asin(1 / c), 
    c * Math.pow(2, -10 * a) * Math.sin(2 * (a - b) * Math.PI / d) + 1);
}, TWEEN.Easing.Elastic.EaseInOut = function(a) {
    var b, c = .1, d = .4;
    return 0 == a ? 0 : 1 == a ? 1 : (d || (d = .3), !c || 1 > c ? (c = 1, b = d / 4) : b = d / (2 * Math.PI) * Math.asin(1 / c), 
    (a *= 2) < 1 ? -.5 * c * Math.pow(2, 10 * (a -= 1)) * Math.sin(2 * (a - b) * Math.PI / d) : c * Math.pow(2, -10 * (a -= 1)) * Math.sin(2 * (a - b) * Math.PI / d) * .5 + 1);
}, TWEEN.Easing.Back.EaseIn = function(a) {
    return a * a * (2.70158 * a - 1.70158);
}, TWEEN.Easing.Back.EaseOut = function(a) {
    return (a -= 1) * a * (2.70158 * a + 1.70158) + 1;
}, TWEEN.Easing.Back.EaseInOut = function(a) {
    return (a *= 2) < 1 ? .5 * a * a * (3.5949095 * a - 2.5949095) : .5 * ((a -= 2) * a * (3.5949095 * a + 2.5949095) + 2);
}, TWEEN.Easing.Bounce.EaseIn = function(a) {
    return 1 - TWEEN.Easing.Bounce.EaseOut(1 - a);
}, TWEEN.Easing.Bounce.EaseOut = function(a) {
    return (a /= 1) < 1 / 2.75 ? 7.5625 * a * a : 2 / 2.75 > a ? 7.5625 * (a -= 1.5 / 2.75) * a + .75 : 2.5 / 2.75 > a ? 7.5625 * (a -= 2.25 / 2.75) * a + .9375 : 7.5625 * (a -= 2.625 / 2.75) * a + .984375;
}, TWEEN.Easing.Bounce.EaseInOut = function(a) {
    return .5 > a ? .5 * TWEEN.Easing.Bounce.EaseIn(2 * a) : .5 * TWEEN.Easing.Bounce.EaseOut(2 * a - 1) + .5;
}, function() {
    var a = this, b = a._, c = Array.prototype, d = Object.prototype, e = Function.prototype, f = c.push, g = c.slice, h = c.concat, i = d.toString, j = d.hasOwnProperty, k = Array.isArray, l = Object.keys, m = e.bind, n = function(a) {
        return a instanceof n ? a : this instanceof n ? void (this._wrapped = a) : new n(a);
    };
    "undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = n), 
    exports._ = n) : a._ = n, n.VERSION = "1.7.0";
    var o = function(a, b, c) {
        if (void 0 === b) return a;
        switch (null == c ? 3 : c) {
          case 1:
            return function(c) {
                return a.call(b, c);
            };

          case 2:
            return function(c, d) {
                return a.call(b, c, d);
            };

          case 3:
            return function(c, d, e) {
                return a.call(b, c, d, e);
            };

          case 4:
            return function(c, d, e, f) {
                return a.call(b, c, d, e, f);
            };
        }
        return function() {
            return a.apply(b, arguments);
        };
    };
    n.iteratee = function(a, b, c) {
        return null == a ? n.identity : n.isFunction(a) ? o(a, b, c) : n.isObject(a) ? n.matches(a) : n.property(a);
    }, n.each = n.forEach = function(a, b, c) {
        if (null == a) return a;
        b = o(b, c);
        var d, e = a.length;
        if (e === +e) for (d = 0; e > d; d++) b(a[d], d, a); else {
            var f = n.keys(a);
            for (d = 0, e = f.length; e > d; d++) b(a[f[d]], f[d], a);
        }
        return a;
    }, n.map = n.collect = function(a, b, c) {
        if (null == a) return [];
        b = n.iteratee(b, c);
        for (var d, e = a.length !== +a.length && n.keys(a), f = (e || a).length, g = Array(f), h = 0; f > h; h++) d = e ? e[h] : h, 
        g[h] = b(a[d], d, a);
        return g;
    };
    var p = "Reduce of empty array with no initial value";
    n.reduce = n.foldl = n.inject = function(a, b, c, d) {
        null == a && (a = []), b = o(b, d, 4);
        var e, f = a.length !== +a.length && n.keys(a), g = (f || a).length, h = 0;
        if (arguments.length < 3) {
            if (!g) throw new TypeError(p);
            c = a[f ? f[h++] : h++];
        }
        for (;g > h; h++) e = f ? f[h] : h, c = b(c, a[e], e, a);
        return c;
    }, n.reduceRight = n.foldr = function(a, b, c, d) {
        null == a && (a = []), b = o(b, d, 4);
        var e, f = a.length !== +a.length && n.keys(a), g = (f || a).length;
        if (arguments.length < 3) {
            if (!g) throw new TypeError(p);
            c = a[f ? f[--g] : --g];
        }
        for (;g--; ) e = f ? f[g] : g, c = b(c, a[e], e, a);
        return c;
    }, n.find = n.detect = function(a, b, c) {
        var d;
        return b = n.iteratee(b, c), n.some(a, function(a, c, e) {
            return b(a, c, e) ? (d = a, !0) : void 0;
        }), d;
    }, n.filter = n.select = function(a, b, c) {
        var d = [];
        return null == a ? d : (b = n.iteratee(b, c), n.each(a, function(a, c, e) {
            b(a, c, e) && d.push(a);
        }), d);
    }, n.reject = function(a, b, c) {
        return n.filter(a, n.negate(n.iteratee(b)), c);
    }, n.every = n.all = function(a, b, c) {
        if (null == a) return !0;
        b = n.iteratee(b, c);
        var d, e, f = a.length !== +a.length && n.keys(a), g = (f || a).length;
        for (d = 0; g > d; d++) if (e = f ? f[d] : d, !b(a[e], e, a)) return !1;
        return !0;
    }, n.some = n.any = function(a, b, c) {
        if (null == a) return !1;
        b = n.iteratee(b, c);
        var d, e, f = a.length !== +a.length && n.keys(a), g = (f || a).length;
        for (d = 0; g > d; d++) if (e = f ? f[d] : d, b(a[e], e, a)) return !0;
        return !1;
    }, n.contains = n.include = function(a, b) {
        return null == a ? !1 : (a.length !== +a.length && (a = n.values(a)), n.indexOf(a, b) >= 0);
    }, n.invoke = function(a, b) {
        var c = g.call(arguments, 2), d = n.isFunction(b);
        return n.map(a, function(a) {
            return (d ? b : a[b]).apply(a, c);
        });
    }, n.pluck = function(a, b) {
        return n.map(a, n.property(b));
    }, n.where = function(a, b) {
        return n.filter(a, n.matches(b));
    }, n.findWhere = function(a, b) {
        return n.find(a, n.matches(b));
    }, n.max = function(a, b, c) {
        var d, e, f = -1 / 0, g = -1 / 0;
        if (null == b && null != a) {
            a = a.length === +a.length ? a : n.values(a);
            for (var h = 0, i = a.length; i > h; h++) d = a[h], d > f && (f = d);
        } else b = n.iteratee(b, c), n.each(a, function(a, c, d) {
            e = b(a, c, d), (e > g || e === -1 / 0 && f === -1 / 0) && (f = a, g = e);
        });
        return f;
    }, n.min = function(a, b, c) {
        var d, e, f = 1 / 0, g = 1 / 0;
        if (null == b && null != a) {
            a = a.length === +a.length ? a : n.values(a);
            for (var h = 0, i = a.length; i > h; h++) d = a[h], f > d && (f = d);
        } else b = n.iteratee(b, c), n.each(a, function(a, c, d) {
            e = b(a, c, d), (g > e || 1 / 0 === e && 1 / 0 === f) && (f = a, g = e);
        });
        return f;
    }, n.shuffle = function(a) {
        for (var b, c = a && a.length === +a.length ? a : n.values(a), d = c.length, e = Array(d), f = 0; d > f; f++) b = n.random(0, f), 
        b !== f && (e[f] = e[b]), e[b] = c[f];
        return e;
    }, n.sample = function(a, b, c) {
        return null == b || c ? (a.length !== +a.length && (a = n.values(a)), a[n.random(a.length - 1)]) : n.shuffle(a).slice(0, Math.max(0, b));
    }, n.sortBy = function(a, b, c) {
        return b = n.iteratee(b, c), n.pluck(n.map(a, function(a, c, d) {
            return {
                value: a,
                index: c,
                criteria: b(a, c, d)
            };
        }).sort(function(a, b) {
            var c = a.criteria, d = b.criteria;
            if (c !== d) {
                if (c > d || void 0 === c) return 1;
                if (d > c || void 0 === d) return -1;
            }
            return a.index - b.index;
        }), "value");
    };
    var q = function(a) {
        return function(b, c, d) {
            var e = {};
            return c = n.iteratee(c, d), n.each(b, function(d, f) {
                var g = c(d, f, b);
                a(e, d, g);
            }), e;
        };
    };
    n.groupBy = q(function(a, b, c) {
        n.has(a, c) ? a[c].push(b) : a[c] = [ b ];
    }), n.indexBy = q(function(a, b, c) {
        a[c] = b;
    }), n.countBy = q(function(a, b, c) {
        n.has(a, c) ? a[c]++ : a[c] = 1;
    }), n.sortedIndex = function(a, b, c, d) {
        c = n.iteratee(c, d, 1);
        for (var e = c(b), f = 0, g = a.length; g > f; ) {
            var h = f + g >>> 1;
            c(a[h]) < e ? f = h + 1 : g = h;
        }
        return f;
    }, n.toArray = function(a) {
        return a ? n.isArray(a) ? g.call(a) : a.length === +a.length ? n.map(a, n.identity) : n.values(a) : [];
    }, n.size = function(a) {
        return null == a ? 0 : a.length === +a.length ? a.length : n.keys(a).length;
    }, n.partition = function(a, b, c) {
        b = n.iteratee(b, c);
        var d = [], e = [];
        return n.each(a, function(a, c, f) {
            (b(a, c, f) ? d : e).push(a);
        }), [ d, e ];
    }, n.first = n.head = n.take = function(a, b, c) {
        return null == a ? void 0 : null == b || c ? a[0] : 0 > b ? [] : g.call(a, 0, b);
    }, n.initial = function(a, b, c) {
        return g.call(a, 0, Math.max(0, a.length - (null == b || c ? 1 : b)));
    }, n.last = function(a, b, c) {
        return null == a ? void 0 : null == b || c ? a[a.length - 1] : g.call(a, Math.max(a.length - b, 0));
    }, n.rest = n.tail = n.drop = function(a, b, c) {
        return g.call(a, null == b || c ? 1 : b);
    }, n.compact = function(a) {
        return n.filter(a, n.identity);
    };
    var r = function(a, b, c, d) {
        if (b && n.every(a, n.isArray)) return h.apply(d, a);
        for (var e = 0, g = a.length; g > e; e++) {
            var i = a[e];
            n.isArray(i) || n.isArguments(i) ? b ? f.apply(d, i) : r(i, b, c, d) : c || d.push(i);
        }
        return d;
    };
    n.flatten = function(a, b) {
        return r(a, b, !1, []);
    }, n.without = function(a) {
        return n.difference(a, g.call(arguments, 1));
    }, n.uniq = n.unique = function(a, b, c, d) {
        if (null == a) return [];
        n.isBoolean(b) || (d = c, c = b, b = !1), null != c && (c = n.iteratee(c, d));
        for (var e = [], f = [], g = 0, h = a.length; h > g; g++) {
            var i = a[g];
            if (b) g && f === i || e.push(i), f = i; else if (c) {
                var j = c(i, g, a);
                n.indexOf(f, j) < 0 && (f.push(j), e.push(i));
            } else n.indexOf(e, i) < 0 && e.push(i);
        }
        return e;
    }, n.union = function() {
        return n.uniq(r(arguments, !0, !0, []));
    }, n.intersection = function(a) {
        if (null == a) return [];
        for (var b = [], c = arguments.length, d = 0, e = a.length; e > d; d++) {
            var f = a[d];
            if (!n.contains(b, f)) {
                for (var g = 1; c > g && n.contains(arguments[g], f); g++) ;
                g === c && b.push(f);
            }
        }
        return b;
    }, n.difference = function(a) {
        var b = r(g.call(arguments, 1), !0, !0, []);
        return n.filter(a, function(a) {
            return !n.contains(b, a);
        });
    }, n.zip = function(a) {
        if (null == a) return [];
        for (var b = n.max(arguments, "length").length, c = Array(b), d = 0; b > d; d++) c[d] = n.pluck(arguments, d);
        return c;
    }, n.object = function(a, b) {
        if (null == a) return {};
        for (var c = {}, d = 0, e = a.length; e > d; d++) b ? c[a[d]] = b[d] : c[a[d][0]] = a[d][1];
        return c;
    }, n.indexOf = function(a, b, c) {
        if (null == a) return -1;
        var d = 0, e = a.length;
        if (c) {
            if ("number" != typeof c) return d = n.sortedIndex(a, b), a[d] === b ? d : -1;
            d = 0 > c ? Math.max(0, e + c) : c;
        }
        for (;e > d; d++) if (a[d] === b) return d;
        return -1;
    }, n.lastIndexOf = function(a, b, c) {
        if (null == a) return -1;
        var d = a.length;
        for ("number" == typeof c && (d = 0 > c ? d + c + 1 : Math.min(d, c + 1)); --d >= 0; ) if (a[d] === b) return d;
        return -1;
    }, n.range = function(a, b, c) {
        arguments.length <= 1 && (b = a || 0, a = 0), c = c || 1;
        for (var d = Math.max(Math.ceil((b - a) / c), 0), e = Array(d), f = 0; d > f; f++, 
        a += c) e[f] = a;
        return e;
    };
    var s = function() {};
    n.bind = function(a, b) {
        var c, d;
        if (m && a.bind === m) return m.apply(a, g.call(arguments, 1));
        if (!n.isFunction(a)) throw new TypeError("Bind must be called on a function");
        return c = g.call(arguments, 2), d = function() {
            if (!(this instanceof d)) return a.apply(b, c.concat(g.call(arguments)));
            s.prototype = a.prototype;
            var e = new s();
            s.prototype = null;
            var f = a.apply(e, c.concat(g.call(arguments)));
            return n.isObject(f) ? f : e;
        };
    }, n.partial = function(a) {
        var b = g.call(arguments, 1);
        return function() {
            for (var c = 0, d = b.slice(), e = 0, f = d.length; f > e; e++) d[e] === n && (d[e] = arguments[c++]);
            for (;c < arguments.length; ) d.push(arguments[c++]);
            return a.apply(this, d);
        };
    }, n.bindAll = function(a) {
        var b, c, d = arguments.length;
        if (1 >= d) throw new Error("bindAll must be passed function names");
        for (b = 1; d > b; b++) c = arguments[b], a[c] = n.bind(a[c], a);
        return a;
    }, n.memoize = function(a, b) {
        var c = function(d) {
            var e = c.cache, f = b ? b.apply(this, arguments) : d;
            return n.has(e, f) || (e[f] = a.apply(this, arguments)), e[f];
        };
        return c.cache = {}, c;
    }, n.delay = function(a, b) {
        var c = g.call(arguments, 2);
        return setTimeout(function() {
            return a.apply(null, c);
        }, b);
    }, n.defer = function(a) {
        return n.delay.apply(n, [ a, 1 ].concat(g.call(arguments, 1)));
    }, n.throttle = function(a, b, c) {
        var d, e, f, g = null, h = 0;
        c || (c = {});
        var i = function() {
            h = c.leading === !1 ? 0 : n.now(), g = null, f = a.apply(d, e), g || (d = e = null);
        };
        return function() {
            var j = n.now();
            h || c.leading !== !1 || (h = j);
            var k = b - (j - h);
            return d = this, e = arguments, 0 >= k || k > b ? (clearTimeout(g), g = null, h = j, 
            f = a.apply(d, e), g || (d = e = null)) : g || c.trailing === !1 || (g = setTimeout(i, k)), 
            f;
        };
    }, n.debounce = function(a, b, c) {
        var d, e, f, g, h, i = function() {
            var j = n.now() - g;
            b > j && j > 0 ? d = setTimeout(i, b - j) : (d = null, c || (h = a.apply(f, e), 
            d || (f = e = null)));
        };
        return function() {
            f = this, e = arguments, g = n.now();
            var j = c && !d;
            return d || (d = setTimeout(i, b)), j && (h = a.apply(f, e), f = e = null), h;
        };
    }, n.wrap = function(a, b) {
        return n.partial(b, a);
    }, n.negate = function(a) {
        return function() {
            return !a.apply(this, arguments);
        };
    }, n.compose = function() {
        var a = arguments, b = a.length - 1;
        return function() {
            for (var c = b, d = a[b].apply(this, arguments); c--; ) d = a[c].call(this, d);
            return d;
        };
    }, n.after = function(a, b) {
        return function() {
            return --a < 1 ? b.apply(this, arguments) : void 0;
        };
    }, n.before = function(a, b) {
        var c;
        return function() {
            return --a > 0 ? c = b.apply(this, arguments) : b = null, c;
        };
    }, n.once = n.partial(n.before, 2), n.keys = function(a) {
        if (!n.isObject(a)) return [];
        if (l) return l(a);
        var b = [];
        for (var c in a) n.has(a, c) && b.push(c);
        return b;
    }, n.values = function(a) {
        for (var b = n.keys(a), c = b.length, d = Array(c), e = 0; c > e; e++) d[e] = a[b[e]];
        return d;
    }, n.pairs = function(a) {
        for (var b = n.keys(a), c = b.length, d = Array(c), e = 0; c > e; e++) d[e] = [ b[e], a[b[e]] ];
        return d;
    }, n.invert = function(a) {
        for (var b = {}, c = n.keys(a), d = 0, e = c.length; e > d; d++) b[a[c[d]]] = c[d];
        return b;
    }, n.functions = n.methods = function(a) {
        var b = [];
        for (var c in a) n.isFunction(a[c]) && b.push(c);
        return b.sort();
    }, n.extend = function(a) {
        if (!n.isObject(a)) return a;
        for (var b, c, d = 1, e = arguments.length; e > d; d++) {
            b = arguments[d];
            for (c in b) j.call(b, c) && (a[c] = b[c]);
        }
        return a;
    }, n.pick = function(a, b, c) {
        var d, e = {};
        if (null == a) return e;
        if (n.isFunction(b)) {
            b = o(b, c);
            for (d in a) {
                var f = a[d];
                b(f, d, a) && (e[d] = f);
            }
        } else {
            var i = h.apply([], g.call(arguments, 1));
            a = new Object(a);
            for (var j = 0, k = i.length; k > j; j++) d = i[j], d in a && (e[d] = a[d]);
        }
        return e;
    }, n.omit = function(a, b, c) {
        if (n.isFunction(b)) b = n.negate(b); else {
            var d = n.map(h.apply([], g.call(arguments, 1)), String);
            b = function(a, b) {
                return !n.contains(d, b);
            };
        }
        return n.pick(a, b, c);
    }, n.defaults = function(a) {
        if (!n.isObject(a)) return a;
        for (var b = 1, c = arguments.length; c > b; b++) {
            var d = arguments[b];
            for (var e in d) void 0 === a[e] && (a[e] = d[e]);
        }
        return a;
    }, n.clone = function(a) {
        return n.isObject(a) ? n.isArray(a) ? a.slice() : n.extend({}, a) : a;
    }, n.tap = function(a, b) {
        return b(a), a;
    };
    var t = function(a, b, c, d) {
        if (a === b) return 0 !== a || 1 / a === 1 / b;
        if (null == a || null == b) return a === b;
        a instanceof n && (a = a._wrapped), b instanceof n && (b = b._wrapped);
        var e = i.call(a);
        if (e !== i.call(b)) return !1;
        switch (e) {
          case "[object RegExp]":
          case "[object String]":
            return "" + a == "" + b;

          case "[object Number]":
            return +a !== +a ? +b !== +b : 0 === +a ? 1 / +a === 1 / b : +a === +b;

          case "[object Date]":
          case "[object Boolean]":
            return +a === +b;
        }
        if ("object" != typeof a || "object" != typeof b) return !1;
        for (var f = c.length; f--; ) if (c[f] === a) return d[f] === b;
        var g = a.constructor, h = b.constructor;
        if (g !== h && "constructor" in a && "constructor" in b && !(n.isFunction(g) && g instanceof g && n.isFunction(h) && h instanceof h)) return !1;
        c.push(a), d.push(b);
        var j, k;
        if ("[object Array]" === e) {
            if (j = a.length, k = j === b.length) for (;j-- && (k = t(a[j], b[j], c, d)); ) ;
        } else {
            var l, m = n.keys(a);
            if (j = m.length, k = n.keys(b).length === j) for (;j-- && (l = m[j], k = n.has(b, l) && t(a[l], b[l], c, d)); ) ;
        }
        return c.pop(), d.pop(), k;
    };
    n.isEqual = function(a, b) {
        return t(a, b, [], []);
    }, n.isEmpty = function(a) {
        if (null == a) return !0;
        if (n.isArray(a) || n.isString(a) || n.isArguments(a)) return 0 === a.length;
        for (var b in a) if (n.has(a, b)) return !1;
        return !0;
    }, n.isElement = function(a) {
        return !(!a || 1 !== a.nodeType);
    }, n.isArray = k || function(a) {
        return "[object Array]" === i.call(a);
    }, n.isObject = function(a) {
        var b = typeof a;
        return "function" === b || "object" === b && !!a;
    }, n.each([ "Arguments", "Function", "String", "Number", "Date", "RegExp" ], function(a) {
        n["is" + a] = function(b) {
            return i.call(b) === "[object " + a + "]";
        };
    }), n.isArguments(arguments) || (n.isArguments = function(a) {
        return n.has(a, "callee");
    }), "function" != typeof /./ && (n.isFunction = function(a) {
        return "function" == typeof a || !1;
    }), n.isFinite = function(a) {
        return isFinite(a) && !isNaN(parseFloat(a));
    }, n.isNaN = function(a) {
        return n.isNumber(a) && a !== +a;
    }, n.isBoolean = function(a) {
        return a === !0 || a === !1 || "[object Boolean]" === i.call(a);
    }, n.isNull = function(a) {
        return null === a;
    }, n.isUndefined = function(a) {
        return void 0 === a;
    }, n.has = function(a, b) {
        return null != a && j.call(a, b);
    }, n.noConflict = function() {
        return a._ = b, this;
    }, n.identity = function(a) {
        return a;
    }, n.constant = function(a) {
        return function() {
            return a;
        };
    }, n.noop = function() {}, n.property = function(a) {
        return function(b) {
            return b[a];
        };
    }, n.matches = function(a) {
        var b = n.pairs(a), c = b.length;
        return function(a) {
            if (null == a) return !c;
            a = new Object(a);
            for (var d = 0; c > d; d++) {
                var e = b[d], f = e[0];
                if (e[1] !== a[f] || !(f in a)) return !1;
            }
            return !0;
        };
    }, n.times = function(a, b, c) {
        var d = Array(Math.max(0, a));
        b = o(b, c, 1);
        for (var e = 0; a > e; e++) d[e] = b(e);
        return d;
    }, n.random = function(a, b) {
        return null == b && (b = a, a = 0), a + Math.floor(Math.random() * (b - a + 1));
    }, n.now = Date.now || function() {
        return new Date().getTime();
    };
    var u = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "`": "&#x60;"
    }, v = n.invert(u), w = function(a) {
        var b = function(b) {
            return a[b];
        }, c = "(?:" + n.keys(a).join("|") + ")", d = RegExp(c), e = RegExp(c, "g");
        return function(a) {
            return a = null == a ? "" : "" + a, d.test(a) ? a.replace(e, b) : a;
        };
    };
    n.escape = w(u), n.unescape = w(v), n.result = function(a, b) {
        if (null == a) return void 0;
        var c = a[b];
        return n.isFunction(c) ? a[b]() : c;
    };
    var x = 0;
    n.uniqueId = function(a) {
        var b = ++x + "";
        return a ? a + b : b;
    }, n.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };
    var y = /(.)^/, z = {
        "'": "'",
        "\\": "\\",
        "\r": "r",
        "\n": "n",
        "\u2028": "u2028",
        "\u2029": "u2029"
    }, A = /\\|'|\r|\n|\u2028|\u2029/g, B = function(a) {
        return "\\" + z[a];
    };
    n.template = function(a, b, c) {
        !b && c && (b = c), b = n.defaults({}, b, n.templateSettings);
        var d = RegExp([ (b.escape || y).source, (b.interpolate || y).source, (b.evaluate || y).source ].join("|") + "|$", "g"), e = 0, f = "__p+='";
        a.replace(d, function(b, c, d, g, h) {
            return f += a.slice(e, h).replace(A, B), e = h + b.length, c ? f += "'+\n((__t=(" + c + "))==null?'':_.escape(__t))+\n'" : d ? f += "'+\n((__t=(" + d + "))==null?'':__t)+\n'" : g && (f += "';\n" + g + "\n__p+='"), 
            b;
        }), f += "';\n", b.variable || (f = "with(obj||{}){\n" + f + "}\n"), f = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + f + "return __p;\n";
        try {
            var g = new Function(b.variable || "obj", "_", f);
        } catch (h) {
            throw h.source = f, h;
        }
        var i = function(a) {
            return g.call(this, a, n);
        }, j = b.variable || "obj";
        return i.source = "function(" + j + "){\n" + f + "}", i;
    }, n.chain = function(a) {
        var b = n(a);
        return b._chain = !0, b;
    };
    var C = function(a) {
        return this._chain ? n(a).chain() : a;
    };
    n.mixin = function(a) {
        n.each(n.functions(a), function(b) {
            var c = n[b] = a[b];
            n.prototype[b] = function() {
                var a = [ this._wrapped ];
                return f.apply(a, arguments), C.call(this, c.apply(n, a));
            };
        });
    }, n.mixin(n), n.each([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(a) {
        var b = c[a];
        n.prototype[a] = function() {
            var c = this._wrapped;
            return b.apply(c, arguments), "shift" !== a && "splice" !== a || 0 !== c.length || delete c[0], 
            C.call(this, c);
        };
    }), n.each([ "concat", "join", "slice" ], function(a) {
        var b = c[a];
        n.prototype[a] = function() {
            return C.call(this, b.apply(this._wrapped, arguments));
        };
    }), n.prototype.value = function() {
        return this._wrapped;
    }, "function" == typeof define && define.amd && define("underscore", [], function() {
        return n;
    });
}.call(this), BEE.version = "0.1", BEE.authors = [ {
    name: "Marco Stagni",
    website: "http://marcostagni.com"
} ], BEE.MAX_CHILDREN_COUNT = 2, BEE.MAX_PARENTS_COUNT = 1, BEE.MAX_ID_SIZE = 12, 
BEE.MAX_ROOT_NUMBER = 1, BEE.VALID_BEE = "Please use a valid BEE object.", BEE.UNTOUCHABLE = "Untouchable value. Get away.", 
BEE.VALID_BRANCH = "Please specify a valid branch.", BEE.NO_MORE_CHILDREN = "No more children allowed for this node.", 
BEE.NO_MORE_PARENTS = "This node already have a parent.", BEE.ERROR_NO_LEAVES = "Sorry, something wrong in your BEE. There are no leaves :(", 
BEE.ERROR_NO_PARENTS = "Sorry, something wrong in your BEE. There are no leaves :(", 
BEE.ERROR_STRANGE_ROOTS = "Sorry, something wrong in your BEE. Strange number of root nodes", 
BEE.ERROR_ALREADY_LEFT = "Sorry, this node already have a left branch.", BEE.ERROR_ALREADY_RIGHT = "Sorry, this node already have a right branch.", 
BEE.BAD_ARGUMENTS = "BAD ARGUMENTS, please check them.", BEE.prototype.createNode = function(a) {
    var b = new Node({
        tree: this,
        data: a
    });
    return b;
}, BEE.prototype.getAllLeaves = function() {
    var a = [];
    for (var b in this.nodes) this.nodes[b]._isLeaf && a.push(this.nodes[b]);
    if (0 == a.length) throw BEE.ERROR_NO_LEAVES;
    return a;
}, BEE.prototype.getRootNode = function() {
    var a = [];
    for (var b in this.nodes) this.nodes[b]._isRoot && a.push(this.nodes[b]);
    if (1 != a.length) throw BEE.ERROR_STRANGE_ROOTS;
    return a[0];
}, BEE.prototype.getAllParents = function() {
    var a = [];
    for (var b in this.nodes) this.nodes[b]._isParent && a.push(this.nodes[b]);
    if (0 == a.length) throw BEE.ERROR_NO_PARENTS;
    return a;
}, BEE.prototype.getPath = function(a) {
    var b, c, d = [];
    for (d.push({
        n: a,
        w: void 0
    }), b = a.parent, c = a; b; ) {
        var e = b.leftBranch._id == c._id ? b.leftWeight : b.rightWeight;
        d.push({
            n: b,
            w: e
        }), c = b, b = b.parent;
    }
    return d.reverse();
}, BEE.prototype.each = function(a, b) {
    var c = 0;
    if ("function" != typeof a) throw BEE.BAD_ARGUMENTS;
    "post" == b ? (console.log("inside post"), console.log(this.getRootNode()), _postEach(a, c, this.getRootNode())) : "pre" == b ? _preEach(a, c, this.getRootNode()) : _defEach(a, c, this.getRootNode());
}, BEE.prototype.has = function(a, b, c) {
    if ("function" != typeof b) throw BEE.BAD_ARGUMENTS;
    var d;
    if (c) if (_s = c.toLowerCase(), "ltr" == _s) d = _hasLTR(a, this.getRootNode(), b); else {
        if ("rtl" != _s) throw BEE.BAD_ARGUMENTS;
        d = _hasRTL(a, this.getRootNode(), b);
    } else d = _hasLTR(a, this.getRootNode(), b);
    return d;
}, BEE.prototype.orderedHas = function(a, b) {
    return _orderedIns(a, this.getRootNode(), b);
}, BEE.prototype.height = function() {
    var a = _height(this.getRootNode());
    return a;
}, BEE.prototype.orderedIns = function(a, b) {
    try {
        _orderedIns(a, this.getRootNode(), b);
    } catch (c) {
        return console.log("Something bad happened in ordIns"), !1;
    }
}, BEE.prototype.buildNode = function(a, b, c) {
    var d = this.createNode(a);
    return d.addLeaf(b, {
        branch: "left"
    }), d.addLeaf(c, {
        branch: "right"
    }), d;
}, Node.prototype.setRoot = function(a) {
    this._isRoot = a;
}, Node.prototype.setParent = function(a) {
    this._isParent = a;
}, Node.prototype.setLeaf = function(a) {
    this._isLeaf = a;
}, Node.prototype.update = function() {
    0 == this.children ? 0 == this.parents ? (this.setLeaf(!1), this.setRoot(!0), this.setParent(!1)) : (this.setLeaf(!0), 
    this.setRoot(!1), this.setParent(!1)) : 0 == this.parents ? (this.setLeaf(!1), this.setRoot(!0), 
    this.setParent(!0)) : (this.setLeaf(!1), this.setRoot(!1), this.setParent(!0));
}, Node.prototype.addLeaf = function(a, b) {
    if (this.children + 1 > BEE.MAX_CHILDREN_COUNT) throw BEE.NO_MORE_CHILDREN;
    if (!b.branch) throw BEE.BAD_ARGUMENTS;
    if ("left" == b.branch) {
        if (this.leftBranch) throw BEE.ERROR_ALREADY_LEFT;
        this.leftBranch = a, this.leftWeight = b.weights && b.weights.l ? b.weights.l : 0;
    } else {
        if ("right" != b.branch) throw BEE.VALID_BRANCH;
        if (this.rightBranch) throw BEE.ERROR_ALREADY_RIGHT;
        this.rightBranch = a, this.rightWeight = b.weights && b.weights.r ? b.weights.r : 1;
    }
    this.children += 1, a.parent = this, a.parents = 1, this.update(), a.update();
}, Node.prototype.addParent = function(a, b) {
    if (this.parents + 1 > BEE.MAX_PARENTS_COUNT) throw BEE.NO_MORE_PARENTS;
    if (a.children + 1 > BEE.MAX_CHILDREN_COUNT) throw BEE.NO_MORE_CHILDREN;
    a.addLeaf(this, b);
};

var __pool__ = {};

__class__ = function(a, b) {
    this.name = a, this.methods = b;
}, __class__.prototype.has = {}.hasOwnProperty, __class__.prototype._extends = function(a) {
    var b = (window[this.name], "string" == typeof a ? window[a] : a);
    if (!b) throw "NO UPPER CLASS";
    window[this.name].prototype = Object.create(b.prototype), window[this.name].prototype.constructor = window[this.name], 
    this._setMethods(), window[this.name].prototype.__getSuper = function() {
        return b;
    }, window.subClasses = window.subClasses || {}, window.subClasses[a] || (window.subClasses[a] = this.name), 
    window[this.name].prototype._super = "string" == typeof a ? window[a].call : a.call;
}, __class__.prototype._setMethods = function() {
    for (var a in this.methods) a != this.name && (window[__upperCaseFirstLetter__(this.name)].prototype[a] = this.methods[a]);
}, HashMap.prototype.clear = function() {
    for (key in this.map) this.map["" + key] = void 0;
    this.total = 0, this.keys = new Array();
}, HashMap.prototype.clone = function() {
    var a = new HashMap();
    for (key in this.map) a.map["" + key] = this.map["" + key];
    return a;
}, HashMap.prototype.containsKey = function(a) {
    var b = !1;
    for (innerkey in this.map) if (innerkey == a) {
        b = !0;
        break;
    }
    return b;
}, HashMap.prototype.containsValue = function(a) {
    var b = !1;
    for (key in this.map) if (this.map["" + key] == a) {
        b = !0;
        break;
    }
    return b;
}, HashMap.prototype.get = function(a) {
    for (innerkey in this.map) if (innerkey == a) return this.map["" + innerkey];
    return null;
}, HashMap.prototype.isEmpty = function() {
    return 0 == this.total;
}, HashMap.prototype.put = function(a, b) {
    return this.maxDimension ? this.total < this.maxDimension ? (this.map["" + a] = b, 
    this.keys.push(a), this.total += 1, !0) : !1 : (this.map["" + a] = b, this.keys.push(a), 
    this.total += 1, !0);
}, HashMap.prototype.remove = function(a) {
    try {
        for (innerkey in this.map) if (innerkey == a) {
            for (var b = this.keys.indexOf(innerkey), c = new Array(), d = 0; d < this.keys.length; d++) d != b && c.push(this.keys[d]);
            return this.keys = new Array(), this.keys = c, delete this.map["" + innerkey], this.total = 0, 
            !0;
        }
        return !1;
    } catch (e) {
        return console.log("HASHMAP ERROR "), console.error(e), console.trace(), !1;
    }
}, HashMap.prototype.size = function() {
    return this.total;
}, THREE.FlyControls = function(a, b) {
    function c(a, b) {
        return function() {
            b.apply(a, arguments);
        };
    }
    this.object = a, this.domElement = void 0 !== b ? b : document, b && this.domElement.setAttribute("tabindex", -1), 
    this.movementSpeed = 1, this.rollSpeed = .005, this.dragToLook = !1, this.autoForward = !1, 
    this.tmpQuaternion = new THREE.Quaternion(), this.mouseStatus = 0, this.moveState = {
        up: 0,
        down: 0,
        left: 0,
        right: 0,
        forward: 0,
        back: 0,
        pitchUp: 0,
        pitchDown: 0,
        yawLeft: 0,
        yawRight: 0,
        rollLeft: 0,
        rollRight: 0
    }, this.moveVector = new THREE.Vector3(0, 0, 0), this.rotationVector = new THREE.Vector3(0, 0, 0), 
    this.handleEvent = function(a) {
        "function" == typeof this[a.type] && this[a.type](a);
    }, this.keydown = function(a) {
        if (!a.altKey) {
            switch (a.keyCode) {
              case 16:
                this.movementSpeedMultiplier = .1;
                break;

              case 87:
                this.moveState.forward = 1;
                break;

              case 83:
                this.moveState.back = 1;
                break;

              case 65:
                this.moveState.left = 1;
                break;

              case 68:
                this.moveState.right = 1;
                break;

              case 82:
                this.moveState.up = 1;
                break;

              case 70:
                this.moveState.down = 1;
                break;

              case 38:
                this.moveState.pitchUp = 1;
                break;

              case 40:
                this.moveState.pitchDown = 1;
                break;

              case 37:
                this.moveState.yawLeft = 1;
                break;

              case 39:
                this.moveState.yawRight = 1;
                break;

              case 81:
                this.moveState.rollLeft = 1;
                break;

              case 69:
                this.moveState.rollRight = 1;
            }
            this.updateMovementVector(), this.updateRotationVector();
        }
    }, this.keyup = function(a) {
        switch (a.keyCode) {
          case 16:
            this.movementSpeedMultiplier = 1;
            break;

          case 87:
            this.moveState.forward = 0;
            break;

          case 83:
            this.moveState.back = 0;
            break;

          case 65:
            this.moveState.left = 0;
            break;

          case 68:
            this.moveState.right = 0;
            break;

          case 82:
            this.moveState.up = 0;
            break;

          case 70:
            this.moveState.down = 0;
            break;

          case 38:
            this.moveState.pitchUp = 0;
            break;

          case 40:
            this.moveState.pitchDown = 0;
            break;

          case 37:
            this.moveState.yawLeft = 0;
            break;

          case 39:
            this.moveState.yawRight = 0;
            break;

          case 81:
            this.moveState.rollLeft = 0;
            break;

          case 69:
            this.moveState.rollRight = 0;
        }
        this.updateMovementVector(), this.updateRotationVector();
    }, this.mousedown = function(a) {
        if (this.domElement !== document && this.domElement.focus(), a.preventDefault(), 
        a.stopPropagation(), this.dragToLook) this.mouseStatus++; else {
            switch (a.button) {
              case 0:
                this.moveState.forward = 1;
                break;

              case 2:
                this.moveState.back = 1;
            }
            this.updateMovementVector();
        }
    }, this.mousemove = function(a) {
        if (!this.dragToLook || this.mouseStatus > 0) {
            var b = this.getContainerDimensions(), c = b.size[0] / 2, d = b.size[1] / 2;
            this.moveState.yawLeft = -(a.pageX - b.offset[0] - c) / c, this.moveState.pitchDown = (a.pageY - b.offset[1] - d) / d, 
            this.updateRotationVector();
        }
    }, this.mouseup = function(a) {
        if (a.preventDefault(), a.stopPropagation(), this.dragToLook) this.mouseStatus--, 
        this.moveState.yawLeft = this.moveState.pitchDown = 0; else {
            switch (a.button) {
              case 0:
                this.moveState.forward = 0;
                break;

              case 2:
                this.moveState.back = 0;
            }
            this.updateMovementVector();
        }
        this.updateRotationVector();
    }, this.update = function(a) {
        var b = a * this.movementSpeed, c = a * this.rollSpeed;
        this.object.translateX(this.moveVector.x * b), this.object.translateY(this.moveVector.y * b), 
        this.object.translateZ(this.moveVector.z * b), this.tmpQuaternion.set(this.rotationVector.x * c, this.rotationVector.y * c, this.rotationVector.z * c, 1).normalize(), 
        this.object.quaternion.multiply(this.tmpQuaternion), this.object.rotation.setFromQuaternion(this.object.quaternion, this.object.rotation.order);
    }, this.updateMovementVector = function() {
        var a = this.moveState.forward || this.autoForward && !this.moveState.back ? 1 : 0;
        this.moveVector.x = -this.moveState.left + this.moveState.right, this.moveVector.y = -this.moveState.down + this.moveState.up, 
        this.moveVector.z = -a + this.moveState.back;
    }, this.updateRotationVector = function() {
        this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp, this.rotationVector.y = -this.moveState.yawRight + this.moveState.yawLeft, 
        this.rotationVector.z = -this.moveState.rollRight + this.moveState.rollLeft;
    }, this.getContainerDimensions = function() {
        return this.domElement != document ? {
            size: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
            offset: [ this.domElement.offsetLeft, this.domElement.offsetTop ]
        } : {
            size: [ window.innerWidth, window.innerHeight ],
            offset: [ 0, 0 ]
        };
    }, this.domElement.addEventListener("contextmenu", function(a) {
        a.preventDefault();
    }, !1), this.domElement.addEventListener("mousemove", c(this, this.mousemove), !1), 
    this.domElement.addEventListener("mousedown", c(this, this.mousedown), !1), this.domElement.addEventListener("mouseup", c(this, this.mouseup), !1), 
    this.domElement.addEventListener("keydown", c(this, this.keydown), !1), this.domElement.addEventListener("keyup", c(this, this.keyup), !1), 
    this.updateMovementVector(), this.updateRotationVector();
}, THREE.PointerLockControls = function(a) {
    var b = this;
    a.rotation.set(0, 0, 0);
    var c = new THREE.Object3D();
    c.add(a);
    var d = new THREE.Object3D();
    d.position.y = 10, d.add(c);
    var e = !1, f = !1, g = !1, h = !1, i = !1, j = !1, k = new THREE.Vector3(), m = Math.PI / 2, n = function(a) {
        if (b.enabled !== !1) {
            var e = a.movementX || a.mozMovementX || a.webkitMovementX || 0, f = a.movementY || a.mozMovementY || a.webkitMovementY || 0;
            d.rotation.y -= .002 * e, c.rotation.x -= .002 * f, c.rotation.x = Math.max(-m, Math.min(m, c.rotation.x));
        }
    }, o = function(a) {
        switch (l("inside pointer lock controls onKeyDown " + a.keyCode), a.keyCode) {
          case 38:
          case 87:
            e = !0;
            break;

          case 37:
          case 65:
            g = !0;
            break;

          case 40:
          case 83:
            f = !0;
            break;

          case 39:
          case 68:
            h = !0;
            break;

          case 32:
            j === !0 && (k.y += 10), j = !1;
        }
    }, p = function(a) {
        switch (a.keyCode) {
          case 38:
          case 87:
            e = !1;
            break;

          case 37:
          case 65:
            g = !1;
            break;

          case 40:
          case 83:
            f = !1;
            break;

          case 39:
          case 68:
            h = !1;
        }
    };
    document.addEventListener("mousemove", n, !1), document.addEventListener("keydown", o, !1), 
    document.addEventListener("keyup", p, !1), this.enabled = !1, this.getObject = function() {
        return d;
    }, this.isOnObject = function(a) {
        i = a, j = a;
    }, this.getDirection = function() {
        var a = new THREE.Vector3(0, 0, -1), b = new THREE.Euler(0, 0, 0, "YXZ");
        return function(e) {
            return b.set(c.rotation.x, d.rotation.y, 0), e.copy(a).applyEuler(b), e;
        };
    }(), this.update = function(a) {
        if (b.enabled === !1) return void l("pointerlock not enabled. please enable it.");
        a *= .1, k.y -= .25 * a;
        var c = .1;
        e && (k.z = -c), f && (k.z = c), f || e || (k.z = 0), g && (k.x = -c), h && (k.x = c), 
        h || g || (k.x = 0), i === !0 && (k.y = Math.max(0, k.y)), d.translateX(k.x), d.translateY(k.y), 
        d.translateZ(k.z), d.position.y < 10 && (k.y = 0, d.position.y = 10, j = !0);
    };
}, Class("Entity", {
    Entity: function() {},
    start: function() {},
    update: function() {},
    addScript: function(a, b) {
        var c = Game.SCRIPTS_DIR + (b || "");
        "/" != c[c.length - 1] && (c += "/"), Game.attachScriptToObject(this, a, c);
    },
    __loadScript: function(a) {
        for (var b in a) this[b] = a[b];
        try {
            this.start();
        } catch (c) {
            console.log("I told you, man. Check your start method inside your " + a.name + ".js script");
        }
    },
    addSound: function(a, b) {
        var c = b.autoplay || !1;
        this.isPlayingSound = c, this.sound = new Sound(a, {
            mesh: this.mesh,
            autoplay: c,
            effect: b.effect
        });
    },
    addDirectionalSound: function(a, b) {
        var c = b.autoplay || !1;
        this.isPlayingSound = c, this.sound = new DirectionalSound(a, {
            mesh: this.mesh,
            autoplay: c,
            effect: b.effect
        });
    },
    addAmbientSound: function(a, b) {
        var c = b.autoplay || !1, d = b.loop || !1;
        this.isPlayingSound = c, this.sound = new AmbientSound(a, {
            mesh: this.mesh,
            autoplay: c,
            loop: d,
            effect: b.effect
        });
    },
    addMesh: function(a) {
        this.mesh.add(a);
    },
    addLight: function(a, b, c) {
        var d = {
            x: this.mesh.position.x,
            y: this.mesh.position.y,
            z: this.mesh.position.z
        };
        this.light = new PointLight(a, b, c, d), this.addMesh(this.light.mesh.mesh);
    },
    playSound: function() {
        this.sound && (this.isPlayingSound || (this.sound.start(), this.isPlayingSound = !0));
    },
    stopSound: function() {
        this.sound && this.isPlayingSound && (this.sound.stop(), this.isPlayingSound = !1);
    },
    scale: function(a, b, c) {
        this.mesh && this.mesh.scale.set(a, b, c);
    }
}), Class("Camera", {
    Camera: function(a) {
        Entity.call(this), this.options = a, this.object = new THREE.PerspectiveCamera(a.fov, a.ratio, a.near, a.far);
    }
})._extends("Entity"), Class("Mesh", {
    Mesh: function(a, b, c) {
        if (Entity.call(this), this.geometry = a, this.material = b, this.script = {}, this.hasScript = !1, 
        this.mesh = new THREE.Mesh(a, b), app.add(this.mesh, this), c) for (var d in c) this[d] = c[d], 
        "script" == d && (this.hasScript = !0, this.addScript(c[d], c.dir));
    }
})._extends("Entity"), Class("ShaderMesh", {
    ShaderMesh: function(a, b, c, d, e) {
        Entity.call(this), this.geometry = a, this.attributes = c, this.uniforms = d, this.shaderName = b;
        var f = new Shader(this.shaderName, this.attributes, this.uniforms);
        if (c || (this.attributes = f.attributes), d || (this.uniforms = f.uniforms), this.script = {}, 
        this.hasScript = !1, this.mesh = new THREE.Mesh(a, f.material), app.add(this.mesh, this), 
        e) for (var g in e) this[g] = e[g], "script" == g && (this.hasScript = !0, this.addScript(e[g], e.dir));
    }
})._extends("Entity"), Class("AnimatedMesh", {
    AnimatedMesh: function(a, b, c) {
        Entity.call(this), this.animations = {}, this.weightSchedule = [], this.warpSchedule = [];
        var d = b[0];
        d.skinning = !0, this.meshVisible = !0, this.mesh = new THREE.SkinnedMesh(a, d), 
        this.mesh.visible = this.meshVisible, app.add(this.mesh, this);
        for (var e = 0; e < a.animations.length; ++e) {
            var f = a.animations[e].name;
            this.animations[f] = new THREE.Animation(this.mesh, a.animations[e]);
        }
        if (this.skeleton = new THREE.SkeletonHelper(this.mesh), this.skeleton.material.linediwth = 3, 
        this.mesh.add(this.skeleton), this.skeletonVisible = !1, this.skeleton.visible = this.skeletonVisible, 
        c) for (var g in c) this[g] = c[g], "script" == g && (this.hasScript = !0, this.addScript(c[g], c.dir));
    },
    toggleSkeleton: function() {
        this.skeletonVisible = !this.skeletonVisible, this.skeleton.visible = this.skeletonVisible;
    },
    toggleModel: function() {
        this.meshVisible = !this.meshVisible, this.mesh.visible = this.meshVisible;
    },
    setWeights: function(a) {
        for (name in a) this.animations[name] && (this.animations[name].weight = a[name]);
    },
    update: function(a) {
        this.animate(a);
    },
    animate: function(a) {
        for (var b = this.weightSchedule.length - 1; b >= 0; --b) {
            var c = this.weightSchedule[b];
            c.timeElapsed += a, c.timeElapsed > c.duration ? (c.anim.weight = c.endWeight, this.weightSchedule.splice(b, 1), 
            0 == c.anim.weight && c.anim.stop(0)) : c.anim.weight = c.startWeight + (c.endWeight - c.startWeight) * c.timeElapsed / c.duration;
        }
        this.updateWarps(a), this.skeleton.update(), THREE.AnimationHandler.update(a);
    },
    updateWarps: function(a) {
        for (var b = this.warpSchedule.length - 1; b >= 0; --b) {
            var c = this.warpSchedule[b];
            if (c.timeElapsed += a, c.timeElapsed > c.duration) c.to.weight = 1, c.to.timeScale = 1, 
            c.from.weight = 0, c.from.timeScale = 1, c.from.stop(0), this.warpSchedule.splice(b, 1); else {
                var d = c.timeElapsed / c.duration, e = c.from.data.length, f = c.to.data.length, g = e / f, h = f / e;
                c.from.timeScale = 1 - d + g * d, c.to.timeScale = d + h * (1 - d), c.from.weight = 1 - d, 
                c.to.weight = d;
            }
        }
    },
    play: function(a) {
        var b = void 0 === this.animations[a].weight ? this.animations[a] : 1;
        this.animations[a].play(0, b);
    },
    crossfade: function(a, b, c) {
        var d = this.animations[a], e = this.animations[b];
        d.play(0, 1), e.play(0, 0), this.weightSchedule.push({
            anim: d,
            startWeight: 1,
            endWeight: 0,
            timeElapsed: 0,
            duration: c
        }), this.weightSchedule.push({
            anim: e,
            startWeight: 0,
            endWeight: 1,
            timeElapsed: 0,
            duration: c
        });
    },
    warp: function(a, b, c) {
        var d = this.animations[a], e = this.animations[b];
        d.play(0, 1), e.play(0, 0), this.warpSchedule.push({
            from: d,
            to: e,
            timeElapsed: 0,
            duration: c
        });
    },
    applyWeight: function(a, b) {
        this.animations[a].weight = b;
    },
    pauseAll: function() {
        for (var a in this.animations) this.animations[a].isPlaying && this.animations[a].stop();
    },
    unPauseAll: function() {
        for (var a in this.animations) this.animations[a].isPlaying && this.animations[a].isPaused && this.animations[a].pause();
    },
    stopAll: function() {
        for (a in this.animations) this.animations[a].isPlaying && this.animations[a].stop(0), 
        this.animations[a].weight = 0;
        this.weightSchedule.length = 0, this.warpSchedule.length = 0;
    },
    getForward: function() {
        var a = new THREE.Vector3();
        return function() {
            return a.set(-this.matrix.elements[8], -this.matrix.elements[9], -this.matrix.elements[10]), 
            a;
        };
    }
})._extends("Entity"), function() {
    window.LightEngine = {
        delayFactor: .1,
        delayStep: 30,
        holderRadius: .01,
        holderSegments: 1,
        init: function() {
            LightEngine.map = new HashMap(), LightEngine.lights = [];
        },
        numLights: 0,
        add: function(a) {
            LightEngine.lights.push(a);
        },
        update: function() {
            var a = new Date();
            for (var b in LightEngine.lights) {
                var c = LightEngine.lights[b];
                if (c.update(app.clock.getDelta()), +new Date() - a > 50) return;
            }
        }
    }, LightEngine.init();
}(), Class("Light", {
    Light: function(a, b, c) {
        Entity.call(this), this.color = a, this.intensity = b, this.position = c || {
            x: 0,
            y: 0,
            z: 0
        }, this.isLightOn = !1, this.mesh = void 0, LightEngine.add(this);
    },
    on: function() {
        if (this.light) {
            var a = this, b = function() {
                a.light.intensity += LightEngine.delayFactor, a.light.intensity < a.intensity ? setTimeout(b, LightEngine.delayStep) : a.isLightOn = !0;
            };
            b();
        } else console.log("You should create your light, first");
    },
    off: function() {
        if (this.light) {
            var a = this, b = function() {
                a.light.intensity -= LightEngine.delayFactor, a.light.intensity > 0 ? setTimeout(b, LightEngine.delayStep) : a.isLightOn = !1;
            };
            b();
        } else console.log("You should create your light, first");
    }
})._extends("Entity"), Class("PointLight", {
    PointLight: function(a, b, c, d) {
        Light.call(this, a, b, d), this.geometry = new THREE.SphereGeometry(LightEngine.holderRadius, LightEngine.holderSegment, LightEngine.holderSegment), 
        this.material = new THREE.MeshPhongMaterial({
            color: this.color
        }), this.mesh = new Mesh(this.geometry, this.material), this.light = new THREE.PointLight(a, b, c), 
        this.mesh.mesh.position.set(this.position.x, this.position.y, this.position.z), 
        this.light.position = this.mesh.mesh.position, this.mesh.mesh.add(this.light);
    }
})._extends("Light"), window.Control = {}, Control = {
    type: void 0,
    allowedTypes: [ "fly", "fps", "custom" ],
    oldType: void 0,
    handler: void 0,
    clock: void 0,
    options: {
        fps: {
            height: 5,
            mouseFactor: .002,
            jumpHeight: 5,
            fallFactor: .25,
            delta: .1,
            velocity: .5,
            crouch: .25
        },
        fly: {}
    },
    set: function(a) {
        var b = "" + a, c = Control.allowedTypes.indexOf(b);
        if (-1 != c) switch (c) {
          case 0:
            1 == Control.oldType && (document.removeEventListener("pointerlockchange", Control.internal_pointerlockchange, !1), 
            document.removeEventListener("mozpointerlockchange", Control.internal_pointerlockchange, !1), 
            document.removeEventListener("webkitpointerlockchange", Control.internal_pointerlockchange, !1), 
            document.removeEventListener("pointerlockerror", Control.internal_pointerlockerror, !1), 
            document.removeEventListener("mozpointerlockerror", Control.internal_pointerlockerror, !1), 
            document.removeEventListener("webkitpointerlockerror", Control.internal_pointerlockerror, !1), 
            document.removeEventListener("fullscreenchange", Control.internal_fullscreenchange, !1), 
            document.removeEventListener("mozfullscreenchange", Control.internal_fullscreenchange, !1), 
            document.removeEventListener("mousemove", Control.handler.onMouseMove, !1), document.removeEventListener("keydown", Control.handler.onKeyDown, !1), 
            document.removeEventListener("keyup", Control.handler.onKeyUp, !1), document.removeEventListener("click", Control.internal_pointerlockonclick, !1), 
            Control.handler.enabled = !1, Control.handler = {}), Control.fly(app.camera.object), 
            Control.type = "fly", Control.oldType = 0;
            break;

          case 1:
            0 == Control.oldType && (document.removeEventListener("contextmenu", function(a) {
                a.preventDefault();
            }, !1), document.removeEventListener("mousemove", Control.handler.mousemove, !1), 
            document.removeEventListener("mousedown", Control.handler.mousedown, !1), document.removeEventListener("mouseup", Control.handler.mouseup, !1), 
            document.removeEventListener("keydown", Control.handler.keydown, !1), document.removeEventListener("keyup", Control.handler.keyup, !1)), 
            Control.fps(app.camera.object), app.add(Control.handler.getObject(), Control.handler), 
            Control.fps_uuid = Control.handler.getObject().uuid, Control.type = "fps", Control.oldType = 1;
        }
    },
    internal_fly: function(a, b) {
        function c(a, b) {
            return function() {
                b.apply(a, arguments);
            };
        }
        this.object = a, this.domElement = void 0 !== b ? b : document, b && this.domElement.setAttribute("tabindex", -1), 
        this.movementSpeed = 1, this.rollSpeed = .5, this.dragToLook = !1, this.autoForward = !1, 
        this.tmpQuaternion = new THREE.Quaternion(), this.mouseStatus = 0, this.moveState = {
            up: 0,
            down: 0,
            left: 0,
            right: 0,
            forward: 0,
            back: 0,
            pitchUp: 0,
            pitchDown: 0,
            yawLeft: 0,
            yawRight: 0,
            rollLeft: 0,
            rollRight: 0
        }, this.moveVector = new THREE.Vector3(0, 0, 0), this.rotationVector = new THREE.Vector3(0, 0, 0), 
        this.handleEvent = function(a) {
            "function" == typeof this[a.type] && this[a.type](a);
        }, this.keydown = function(a) {
            if (!a.altKey) {
                switch (a.keyCode) {
                  case 16:
                    this.movementSpeedMultiplier = .1;
                    break;

                  case 87:
                    this.moveState.forward = 1;
                    break;

                  case 83:
                    this.moveState.back = 1;
                    break;

                  case 65:
                    this.moveState.left = 1;
                    break;

                  case 68:
                    this.moveState.right = 1;
                    break;

                  case 82:
                    this.moveState.up = 1;
                    break;

                  case 70:
                    this.moveState.down = 1;
                    break;

                  case 38:
                    this.moveState.pitchUp = 1;
                    break;

                  case 40:
                    this.moveState.pitchDown = 1;
                    break;

                  case 37:
                    this.moveState.yawLeft = 1;
                    break;

                  case 39:
                    this.moveState.yawRight = 1;
                    break;

                  case 81:
                    this.moveState.rollLeft = 2.5;
                    break;

                  case 69:
                    this.moveState.rollRight = 2.5;
                }
                this.updateMovementVector(), this.updateRotationVector();
            }
        }, this.keyup = function(a) {
            switch (a.keyCode) {
              case 16:
                this.movementSpeedMultiplier = 1;
                break;

              case 87:
                this.moveState.forward = 0;
                break;

              case 83:
                this.moveState.back = 0;
                break;

              case 65:
                this.moveState.left = 0;
                break;

              case 68:
                this.moveState.right = 0;
                break;

              case 82:
                this.moveState.up = 0;
                break;

              case 70:
                this.moveState.down = 0;
                break;

              case 38:
                this.moveState.pitchUp = 0;
                break;

              case 40:
                this.moveState.pitchDown = 0;
                break;

              case 37:
                this.moveState.yawLeft = 0;
                break;

              case 39:
                this.moveState.yawRight = 0;
                break;

              case 81:
                this.moveState.rollLeft = 0;
                break;

              case 69:
                this.moveState.rollRight = 0;
            }
            this.updateMovementVector(), this.updateRotationVector();
        }, this.mousedown = function(a) {
            if (this.domElement !== document && this.domElement.focus(), a.preventDefault(), 
            a.stopPropagation(), this.dragToLook) this.mouseStatus++; else {
                switch (a.button) {
                  case 0:
                    this.moveState.forward = 1;
                    break;

                  case 2:
                    this.moveState.back = 1;
                }
                this.updateMovementVector();
            }
        }, this.mousemove = function(a) {
            if (!this.dragToLook || this.mouseStatus > 0) {
                var b = this.getContainerDimensions(), c = b.size[0] / 2, d = b.size[1] / 2;
                this.moveState.yawLeft = 3 * -((a.pageX - b.offset[0] - c) / c), this.moveState.pitchDown = (a.pageY - b.offset[1] - d) / d * 3, 
                this.updateRotationVector();
            }
        }, this.mouseup = function(a) {
            if (a.preventDefault(), a.stopPropagation(), this.dragToLook) this.mouseStatus--, 
            this.moveState.yawLeft = this.moveState.pitchDown = 0; else {
                switch (a.button) {
                  case 0:
                    this.moveState.forward = 0;
                    break;

                  case 2:
                    this.moveState.back = 0;
                }
                this.updateMovementVector();
            }
            this.updateRotationVector();
        }, this.update = function(a) {
            var b = a * this.movementSpeed, c = a * this.rollSpeed;
            this.object.translateX(this.moveVector.x * b), this.object.translateY(this.moveVector.y * b), 
            this.object.translateZ(this.moveVector.z * b), this.tmpQuaternion.set(this.rotationVector.x * c, this.rotationVector.y * c, this.rotationVector.z * c, 1).normalize(), 
            this.object.quaternion.multiply(this.tmpQuaternion), this.object.rotation.setFromQuaternion(this.object.quaternion, this.object.rotation.order);
        }, this.updateMovementVector = function() {
            var a = this.moveState.forward || this.autoForward && !this.moveState.back ? 1 : 0;
            this.moveVector.x = -this.moveState.left + this.moveState.right, this.moveVector.y = -this.moveState.down + this.moveState.up, 
            this.moveVector.z = -a + this.moveState.back;
        }, this.updateRotationVector = function() {
            this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp, this.rotationVector.y = -this.moveState.yawRight + this.moveState.yawLeft, 
            this.rotationVector.z = -this.moveState.rollRight + this.moveState.rollLeft;
        }, this.getContainerDimensions = function() {
            return this.domElement != document ? {
                size: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
                offset: [ this.domElement.offsetLeft, this.domElement.offsetTop ]
            } : {
                size: [ window.innerWidth, window.innerHeight ],
                offset: [ 0, 0 ]
            };
        }, this.domElement.addEventListener("contextmenu", function(a) {
            a.preventDefault();
        }, !1), this.domElement.addEventListener("mousemove", c(this, this.mousemove), !1), 
        this.domElement.addEventListener("mousedown", c(this, this.mousedown), !1), this.domElement.addEventListener("mouseup", c(this, this.mouseup), !1), 
        this.domElement.addEventListener("keydown", c(this, this.keydown), !1), this.domElement.addEventListener("keyup", c(this, this.keyup), !1), 
        this.updateMovementVector(), this.updateRotationVector();
    },
    fly: function() {
        $("body").css({
            cursor: "url(img/pointer_cross.png), auto"
        }), Control.handler = new Control.internal_fly(app.camera.object), Control.handler.movementSpeed = 3, 
        Control.handler.domElement = document, Control.handler.rollSpeed = .05, Control.handler.autoForward = !1, 
        Control.handler.dragToLook = !1;
    },
    internal_pointerlockchange: function() {
        Control.handler.enabled = !0;
    },
    internal_pointerlockonclick: function() {
        var a = document.body;
        a.requestPointerLock = a.requestPointerLock || a.mozRequestPointerLock || a.webkitRequestPointerLock, 
        /Firefox/i.test(navigator.userAgent) ? (document.addEventListener("fullscreenchange", Control.internal_fullscreenchange, !1), 
        document.addEventListener("mozfullscreenchange", Control.internal_fullscreenchange, !1), 
        a.requestFullscreen = a.requestFullscreen || a.mozRequestFullscreen || a.mozRequestFullScreen || a.webkitRequestFullscreen, 
        a.requestFullscreen()) : a.requestPointerLock();
    },
    internal_pointerlockerror: function() {
        app.log("POINTER LOCK ERROR");
    },
    internal_fullscreenchange: function() {
        (document.fullscreenElement === document || document.mozFullscreenElement === document || document.mozFullScreenElement === document) && (document.removeEventListener("fullscreenchange", Control.internal_fullscreenchange), 
        document.removeEventListener("mozfullscreenchange", Control.internal_fullscreenchange), 
        document.requestPointerLock());
    },
    fps_uuid: void 0,
    fps: function() {
        Control.handler = new Control.internal_fps(app.camera.object);
        var a = "pointerLockElement" in document || "mozPointerLockElement" in document || "webkitPointerLockElement" in document;
        a ? (app.log("we have pointer lock ability"), Control.handler.enabled = !0, document.addEventListener("pointerlockchange", Control.internal_pointerlockchange, !1), 
        document.addEventListener("mozpointerlockchange", Control.internal_pointerlockchange, !1), 
        document.addEventListener("webkitpointerlockchange", Control.internal_pointerlockchange, !1), 
        document.addEventListener("pointerlockerror", Control.internal_pointerlockerror, !1), 
        document.addEventListener("mozpointerlockerror", Control.internal_pointerlockerror, !1), 
        document.addEventListener("webkitpointerlockerror", Control.internal_pointerlockerror, !1), 
        document.addEventListener("click", Control.internal_pointerlockonclick, !1)) : app.log("BROWSER DOESN'T SUPPORT POINTER LOCK API.");
    },
    internal_fps: function(a) {
        var b = this;
        a.rotation.set(0, 0, 0);
        var c = new THREE.Object3D();
        c.add(a);
        var d = new THREE.Object3D();
        d.position.y = Control.options.fps.height, d.add(c);
        var e = !1, f = !1, g = !1, h = !1, i = !1, j = !1, k = new THREE.Vector3(), l = Math.PI / 2, m = !1;
        this._onKeyDown = function() {}, this.setKeyDownListener = function(a) {
            this._onKeyDown = a;
        }, this._onKeyUp = function() {}, this.setKeyUpListener = function(a) {
            this._onKeyUp = a;
        }, this._onMouseMove = function() {}, this.setMouseMoveListener = function(a) {
            this._onMouseMove = a;
        }, this.onMouseMove = function(a) {
            if (b.enabled !== !1) {
                var e = a.movementX || a.mozMovementX || a.webkitMovementX || 0, f = a.movementY || a.mozMovementY || a.webkitMovementY || 0;
                d.rotation.y -= e * Control.options.fps.mouseFactor, c.rotation.x -= f * Control.options.fps.mouseFactor, 
                c.rotation.x = Math.max(-l, Math.min(l, c.rotation.x)), Control.handler._onMouseMove(a);
            }
        }, this.onKeyDown = function(a) {
            switch (a.keyCode) {
              case 38:
              case 87:
                e = !0;
                break;

              case 37:
              case 65:
                g = !0;
                break;

              case 40:
              case 83:
                f = !0;
                break;

              case 39:
              case 68:
                h = !0;
                break;

              case 32:
                j === !0 && (k.y += Control.options.fps.jumpHeight), j = !1;
                break;

              case 16:
                Control.options.fps._oldV = Control.options.fps.velocity, Control.options.fps.velocity = Control.options.fps.crouch, 
                d.position.y = Control.options.fps.height / 2, j = !1, m = !0;
            }
            Control.handler._onKeyDown(a);
        }, this.onKeyUp = function(a) {
            switch (a.keyCode) {
              case 38:
              case 87:
                e = !1;
                break;

              case 37:
              case 65:
                g = !1;
                break;

              case 40:
              case 83:
                f = !1;
                break;

              case 39:
              case 68:
                h = !1;
                break;

              case 16:
                Control.options.fps.velocity = Control.options.fps._oldV, d.position.y = Control.options.fps.height, 
                j = !0, m = !1;
            }
            Control.handler._onKeyUp(a);
        }, document.addEventListener("mousemove", this.onMouseMove, !1), document.addEventListener("keydown", this.onKeyDown, !1), 
        document.addEventListener("keyup", this.onKeyUp, !1), this.enabled = !1, this.getObject = function() {
            return d;
        }, this.isOnObject = function(a) {
            i = a, j = a;
        }, this.getDirection = function() {
            var a = new THREE.Vector3(0, 0, -1), b = new THREE.Euler(0, 0, 0, "YXZ");
            return function(e) {
                return b.set(c.rotation.x, d.rotation.y, 0), e.copy(a).applyEuler(b), e;
            };
        }(), this.update = function(a) {
            if (b.enabled === !1) return void app.log("pointerlock not enabled. please enable it.");
            a *= Control.options.fps.delta, k.y -= Control.options.fps.fallFactor * a;
            var c = Control.options.fps.velocity;
            e && (k.z = -c), f && (k.z = c), f || e || (k.z = 0), g && (k.x = -c), h && (k.x = c), 
            h || g || (k.x = 0), i === !0 && (k.y = Math.max(0, k.y)), d.translateX(k.x), d.translateY(k.y), 
            d.translateZ(k.z), d.position.y < Control.options.fps.height && (k.y = 0, d.position.y = m ? Control.options.fps.height / 2 : Control.options.fps.height, 
            j = !0);
        };
    },
    update: function() {
        if (Control.handler) {
            {
                Control.clock.getDelta();
            }
            try {
                Control.handler.update(app.clock.getDelta());
            } catch (a) {
                console.error(a), console.trace();
            }
        }
    },
    init: function() {
        Control.clock = new THREE.Clock();
        try {
            app.keydown && app.keyup ? (Control.type = "custom", Control.oldType = 2, window.addEventListener("keydown", app.keydown), 
            window.addEventListener("keyup", app.keyup)) : (Control.type = "fly", Control.fly(app.camera.object), 
            Control.oldType = 0);
        } catch (a) {
            Control.type = "fly", Control.fly(app.camera.object), Control.oldType = 0;
        }
    }
}, window.Game = {}, Game.SCRIPTS_DIR = "app/scripts/", Game.update = function() {}, 
Game.script = function(a, b) {
    var c = {};
    c.name = a;
    for (var d in b) c[d] = b[d];
    c.start || (c.start = new Function("console.log('please, add a start method');")), 
    c.update || (c.update = new Function("console.log('please, add a update method');")), 
    a in Game.scripts || (Game.scripts[a] = c);
}, Game.attachScriptToObject = function(a, b, c) {
    var d = c + b;
    include(d, function() {
        a.__loadScript(Game.scripts[b]);
    });
}, Game.scripts = {};

var Gui = {};

Gui = {
    miniMap: void 0,
    menu: void 0,
    init: void 0
}, window.Universe = {}, Universe = {
    universe: void 0,
    loaded: !1,
    worker: void 0,
    init: function() {
        console.log("inside universe init"), Universe.loaded = !0, Universe.universe = new HashMap();
    },
    cube: void 0,
    addRandomCube: function() {
        var a = new THREE.CubeGeometry(1, 1, 1), b = new THREE.MeshBasicMaterial({
            color: 65280,
            wireframe: !0
        }), c = new THREE.Mesh(a, b);
        c.position.x = 5 * Math.random(), c.position.y = 5 * Math.random(), c.position.z = 5 * Math.random(), 
        c.auto_render = function() {
            this.rotation.x += .01;
        }, app.scene.add(c), Universe.universe.put(c.uuid, c);
    },
    testingShaders: function() {
        var a = new THREE.ShaderMaterial({
            uniforms: {
                tExplosion: {
                    type: "t",
                    value: THREE.ImageUtils.loadTexture("img/explosion.png", {}, function(a) {
                        console.log(a);
                    })
                },
                time: {
                    type: "f",
                    value: 0
                }
            },
            vertexShader: document.getElementById("vertexShader").textContent,
            fragmentShader: document.getElementById("fragmentShader").textContent
        }), b = new THREE.Mesh(new THREE.IcosahedronGeometry(20, 4), a);
        b.start_time = Date.now(), b.auto_render = function() {
            this.material.uniforms.time.value = 25e-5 * (Date.now() - this.start_time);
        }, app.scene.add(b), Universe.universe.put(b.uuid, b);
    },
    addPlanetAndSatellite: function() {
        var a = new THREE.MeshBasicMaterial({
            color: 16777215,
            wireframe: !0
        }), b = new THREE.SphereGeometry(15, 40, 40);
        b.dynamic = !0;
        var c = new THREE.Mesh(b, a);
        c.position.x = 0, c.position.y = 0, c.position.z = 0, c.auto_render = function() {
            this.rotation.y += 1e-4;
        }, app.scene.add(c), Universe.universe.put(c.uuid, c), l("PLANET GEOMETRY"), l(c.geometry.dynamic + " - " + c.geometry.verticesNeedUpdate + " - " + c.geometry.normalsNeedUpdate);
        var a = new THREE.MeshBasicMaterial({
            color: 16777215,
            wireframe: !0
        }), d = new THREE.Mesh(new THREE.SphereGeometry(30, 40, 40), a);
        d.position.x = 0, d.position.y = 400, d.position.z = 0, d.auto_render = function() {
            this.position.x += this.position.z += this.rotation.y += 1e-4;
        };
    },
    update: function() {
        var a = Universe.universe.keys.concat();
        if (0 != a.length) {
            var b = +new Date();
            do {
                var c = Universe.universe.get(a.shift());
                c.update && c.update(app.clock.getDelta());
            } while (a.length > 0 && +new Date() - b < 50);
        }
    }
}, Universe.init(), window.User = {}, User = {
    real_name: void 0,
    real_surname: void 0,
    username: void 0,
    clock: void 0,
    flyControl: void 0,
    fpsControl: void 0,
    init: function() {
        User.clock = new THREE.Clock(), User.fpsControl = new THREE.PointerLockControls(app.camera), 
        app.scene.add(User.fpsControl.getObject());
    },
    position: {
        x: void 0,
        y: void 0,
        z: void 0
    },
    handleUserInput: function() {}
}, window.AssetsManager = {}, AssetsManager.completed = {
    sound: !1,
    video: !0,
    images: !0,
    general: !0,
    shaders: !1
}, AssetsManager.load = function(a) {
    AssetsManager.callback = a, AudioEngine.load(), VideoEngine.load(), ImagesEngine.load(), 
    GeneralAssetsEngine.load(), fx.ShadersEngine.load(), AssetsManager.checkInterval = setInterval(AssetsManager.check, 100);
}, AssetsManager.loadingMessage = function() {}, AssetsManager.check = function() {
    AssetsManager.completed.sound && AssetsManager.completed.video && AssetsManager.completed.images && AssetsManager.completed.general ? (AssetsManager.loadingMessage(!0), 
    clearInterval(AssetsManager.checkInterval), AssetsManager.callback()) : AssetsManager.loadingMessage(!1);
}, window.fx = {}, function() {
    window.AudioEngine = {
        DELAY_FACTOR: .02,
        DELAY_STEP: 1,
        DELAY_MIN_VALUE: .2,
        DELAY_NORMAL_VALUE: 40,
        VOLUME: 80,
        _volume: 80,
        soundPath: "js/core/sound/",
        soundModules: [ "js/core/audio/beat", "js/core/audio/sound", "js/core/audio/ambientSound" ],
        numSound: 0,
        soundLoaded: 0,
        load: function() {
            AudioEngine.map = new HashMap(), AudioEngine.sounds = [], AudioEngine.AudioContext = window.AudioContext || window.webkitAudioContext || null, 
            AudioEngine.AudioContext ? (AudioEngine.context = new AudioEngine.AudioContext(), 
            AudioEngine.volume = AudioEngine.context.createGain(), AudioEngine.volume.gain.value = AudioEngine.VOLUME, 
            AudioEngine.volume.connect(AudioEngine.context.destination)) : console.error("No Audio Context available, sorry.");
            for (var a in Assets.Audio) AudioEngine.numSound++, AudioEngine.loadSingleFile(a, Assets.Audio[a]);
            0 == AudioEngine.numSound && (AssetsManager.completed.sound = !0);
        },
        get: function(a) {
            return AudioEngine.map.get(a) || !1;
        },
        loadSingleFile: function(a, b) {
            var c = new XMLHttpRequest();
            c.open("GET", b, !0), c.responseType = "arraybuffer", c.onload = function() {
                AudioEngine.context.decodeAudioData(this.response, function(b) {
                    AudioEngine.map.put(a, b), AudioEngine.soundLoaded++, AudioEngine.checkLoad();
                }, function() {
                    AudioEngine.map.put(a, null), AudioEngine.soundLoaded++, console.error("Decoding the audio buffer failed");
                });
            }, c.send();
        },
        checkLoad: function() {
            AudioEngine.soundLoaded == AudioEngine.numSound && (AssetsManager.completed.sound = !0);
        },
        add: function(a) {
            AudioEngine.sounds.push(a);
        },
        update: function() {
            var a = new Date();
            for (var b in AudioEngine.sounds) {
                var c = AudioEngine.sounds[b];
                c.update(app.clock.getDelta()), app.camera.object.updateMatrixWorld();
                var d = new THREE.Vector3();
                d.setFromMatrixPosition(app.camera.object.matrixWorld), AudioEngine.context.listener.setPosition(d.x, d.y, d.z);
                var e = app.camera.object.matrix;
                mx = e.elements[12], my = e.elements[13], mz = e.elements[14], e.elements[12] = e.elements[13] = e.elements[14] = 0;
                var f = new THREE.Vector3(0, 0, 1);
                f.applyProjection(e), f.normalize();
                var g = new THREE.Vector3(0, -1, 0);
                if (g.applyProjection(e), g.normalize(), AudioEngine.context.listener.setOrientation(f.x, f.y, f.z, g.x, g.y, g.z), 
                e.elements[12] = mx, e.elements[13] = my, e.elements[14] = mz, +new Date() - a > 50) return;
            }
        }
    }, Object.defineProperty(AudioEngine, "VOLUME", {
        set: function(a) {
            AudioEngine._volume = a, AudioEngine.volume.gain.value = AudioEngine._volume;
        },
        get: function() {
            return AudioEngine._volume ? AudioEngine._volume : void 0;
        }
    });
}(), Class("Beat", {
    Beat: function(a) {
        this.name = a, this.sound = {}, this.sound.source = AudioEngine.context.createBufferSource(), 
        this.sound.volume = AudioEngine.context.createGain(), this.sound.volume.gain.value = AudioEngine.VOLUME, 
        this.setListeners(), this.sound.source.connect(this.sound.volume), this.sound.volume.connect(AudioEngine.volume);
    },
    setListeners: function() {
        this.sound.source._caller = this;
    },
    reset: function() {
        this.sound.source.disconnect(), this.sound.source = AudioEngine.context.createBufferSource(), 
        this.sound.source.connect(this.sound.volume), this.setListeners();
    },
    start: function() {
        var a = AudioEngine.get(this.name);
        if (!a) return void console.error("Unable to load sound, sorry.");
        this.sound.source.buffer = a, this.sound.volume.gain.value = 0, this.sound.source.start(AudioEngine.context.currentTime);
        var b = this, c = function() {
            b.sound.volume.gain.value = b.sound.volume.gain.value + AudioEngine.DELAY_FACTOR, 
            b.sound.volume.gain.value < AudioEngine.DELAY_NORMAL_VALUE && setTimeout(c, AudioEngine.DELAY_STEP);
        };
        c();
    },
    stop: function() {
        var a = this, b = function() {
            a.sound.volume.gain.value = a.sound.volume.gain.value - AudioEngine.DELAY_FACTOR, 
            a.sound.volume.gain.value > AudioEngine.DELAY_MIN_VALUE ? setTimeout(b, AudioEngine.DELAY_STEP) : a.sound.source.stop();
        };
        b();
    },
    onEnd: function() {
        this._caller.onEndCallback && this._caller.onEndCallback(), this._caller.reset();
    },
    onLoopEnd: function() {
        this._caller.onLoopEndCallback && this._caller.onLoopEndCallback();
    },
    onLoopStart: function() {
        this._caller.onLoopStartCallback && this._caller.onLoopStartCallback();
    }
}), Class("Sound", {
    Sound: function(a, b) {
        Beat.call(this, a);
        var c = b || {};
        this.sound.panner = AudioEngine.context.createPanner(), this.sound.volume.disconnect(), 
        this.sound.volume.connect(this.sound.panner), this.sound.panner.connect(AudioEngine.volume), 
        c.mesh ? this.mesh = c.mesh : this.update = function() {}, c.effect && (this.convolver = AudioEngine.context.createConvolver(), 
        this.mixer = AudioEngine.createGain(), this.sound.panner.disconnect(), this.sound.panner.connect(this.mixer), 
        this.plainGain = AudioEngine.context.createGain(), this.convolverGain = AudioEngine.context.createGain(), 
        this.mixer.connect(plainGain), this.mixer.connect(convolverGain), this.plainGain.connect(AudioEngine.volume), 
        this.convolverGain.connect(AudioEngine.volume), this.convolver.buffer = AudioEngine.get(c.effect), 
        this.convolverGain.gain.value = .7, this.plainGain.gain.value = .3);
        var d = c.autoplay || !1;
        d && this.start(), AudioEngine.add(this);
    },
    update: function(a) {
        if (this.mesh) {
            var b = new THREE.Vector3();
            b.setFromMatrixPosition(this.mesh.matrixWorld);
            var c = b.x, d = b.y, e = b.z;
            this.mesh.updateMatrixWorld();
            var f = new THREE.Vector3();
            f.setFromMatrixPosition(this.mesh.matrixWorld);
            var g = f.x - c, h = f.y - d, i = f.z - e;
            try {
                this.sound.panner.setPosition(f.x, f.y, f.z), this.sound.panner.setVelocity(g / a, h / a, i / a);
            } catch (j) {}
        }
    }
})._extends("Beat"), Class("AmbientSound", {
    AmbientSound: function(a, b) {
        Beat.call(this, a), this.sound.source.loop = b.loop || !1, this.sound.panner = AudioEngine.context.createPanner(), 
        this.sound.volume.disconnect(), this.sound.volume.connect(this.sound.panner), this.sound.panner.connect(AudioEngine.volume), 
        this.mesh = b.mesh, b.effect && (this.convolver = AudioEngine.context.createConvolver(), 
        this.mixer = AudioEngine.createGain(), this.sound.panner.disconnect(), this.sound.panner.connect(this.mixer), 
        this.plainGain = AudioEngine.context.createGain(), this.convolverGain = AudioEngine.context.createGain(), 
        this.mixer.connect(plainGain), this.mixer.connect(convolverGain), this.plainGain.connect(AudioEngine.volume), 
        this.convolverGain.connect(AudioEngine.volume), this.convolver.buffer = AudioEngine.get(b.effect), 
        this.convolverGain.gain.value = .7, this.plainGain.gain.value = .3);
        var c = b.autoplay || !1;
        c && this.start(), AudioEngine.add(this);
    },
    update: function() {
        this.mesh.updateMatrixWorld();
        var a = new THREE.Vector3();
        a.setFromMatrixPosition(this.mesh.matrixWorld), this.sound.panner.setPosition(a.x, a.y, a.z);
    }
})._extends("Beat"), Class("DirectionalSound", {
    DirectionalSound: function(a, b, c) {
        Beat.call(this, a), this.sound.panner = AudioEngine.context.createPanner(), this.sound.volume.disconnect(), 
        this.sound.volume.connect(this.sound.panner), this.sound.panner.connect(AudioEngine.volume), 
        this.mesh = c.mesh, this.sound.panner.coneInnerAngle = b.innerAngleInDegrees, this.sound.panner.coneOuterAngle = b.outerAngleInDegrees, 
        this.sound.panner.coneOuterGain = b.outerGainFactor, c.effect && (this.convolver = AudioEngine.context.createConvolver(), 
        this.mixer = AudioEngine.createGain(), this.sound.panner.disconnect(), this.sound.panner.connect(this.mixer), 
        this.plainGain = AudioEngine.context.createGain(), this.convolverGain = AudioEngine.context.createGain(), 
        this.mixer.connect(plainGain), this.mixer.connect(convolverGain), this.plainGain.connect(AudioEngine.volume), 
        this.convolverGain.connect(AudioEngine.volume), this.convolver.buffer = AudioEngine.get(c.effect), 
        this.convolverGain.gain.value = .7, this.plainGain.gain.value = .3);
        var d = c.autoplay || !1;
        d && this.start(), AudioEngine.add(this);
    },
    update: function(a) {
        var b = new THREE.Vector3();
        b.setFromMatrixPosition(this.mesh.matrixWorld);
        var c = b.x, d = b.y, e = b.z;
        this.mesh.updateMatrixWorld();
        var f = new THREE.Vector3();
        f.setFromMatrixPosition(this.mesh.matrixWorld);
        var g = f.x - c, h = f.y - d, i = f.z - e;
        this.sound.panner.setPosition(f.x, f.y, f.z), this.sound.panner.setVelocity(g / a, h / a, i / a);
        var j = new THREE.Vector3(0, 0, 1), k = this.mesh.matrixWorld, l = k.elements[12], m = k.elements[13], n = k.elements[14];
        k.elements[12] = k.elements[13] = k.elements[14] = 0, j.applyProjection(k), j.normalize(), 
        this.sound.panner.setOrientation(j.x, j.y, j.z), k.elements[12] = l, k.elements[13] = m, 
        k.elements[14] = n;
    }
})._extends("Beat"), Class("BackgroundSound", {
    BackgroundSound: function(a, b) {
        Beat.call(this, a), this.sound.source.loop = b.loop || !0, this.mesh = b.mesh, b.effect && (this.convolver = AudioEngine.context.createConvolver(), 
        this.mixer = AudioEngine.context.createGain(), this.sound.panner.disconnect(), this.sound.panner.connect(this.mixer), 
        this.plainGain = AudioEngine.context.createGain(), this.convolverGain = AudioEngine.context.createGain(), 
        this.mixer.connect(plainGain), this.mixer.connect(convolverGain), this.plainGain.connect(AudioEngine.volume), 
        this.convolverGain.connect(AudioEngine.volume), this.convolver.buffer = AudioEngine.get(b.effect), 
        this.convolverGain.gain.value = .7, this.plainGain.gain.value = .3);
        var c = b.autoplay || !0;
        c && this.start(), AudioEngine.add(this);
    },
    update: function() {}
})._extends("Beat"), function() {
    window.VideoEngine = {}, VideoEngine.load = function() {};
}(), function() {
    window.ImagesEngine = {}, ImagesEngine.load = function() {};
}(), function() {
    window.GeneralAssetsEngine = {}, GeneralAssetsEngine.load = function() {};
}(), window.fx.ShadersEngine = {
    SHADERS_DIR: "app/shaders/",
    shaders: {},
    numShaders: 0,
    shadersLoaded: 0,
    update: function() {},
    load: function() {
        if (fx.ShadersEngine.map = new HashMap(), fx.ShadersEngine.shaders = [], Assets.Shaders) for (var a in Assets.Shaders) fx.ShadersEngine.numShaders++, 
        fx.ShadersEngine.loadSingleFile(a, Assets.Shaders[a]);
        0 == fx.ShadersEngine.numShaders && (AssetsManager.completed.shaders = !0);
    },
    get: function(a) {
        return fx.ShadersEngine.map.get(a) || !1;
    },
    loadSingleFile: function(a, b) {
        var c = b.split(".")[1];
        if ("js" == c) include(b.split(".js")[0], this.checkLoad); else {
            var d = new XMLHttpRequest();
            d.open("GET", b, !0), d.responseType = "text", d.onload = function() {
                var b = fx.ShadersEngine._parseShader(this.responseText);
                fx.ShadersEngine.map.put(a, b), fx.ShadersEngine.shadersLoaded++, fx.ShadersEngine.checkLoad();
            }, d.send();
        }
    },
    _parseShader: function(a) {
        var b = {};
        return b.name = a.substring(a.indexOf("<name>") + 6, a.indexOf("</name>")), b.vertex = a.substring(a.indexOf("<vertex>") + 8, a.indexOf("</vertex>")), 
        b.fragment = a.substring(a.indexOf("<fragment>") + 10, a.indexOf("</fragment>")), 
        b.options = {}, b.attributes = {}, b.uniforms = {}, b;
    },
    create: function(a, b) {
        var c = {};
        c.name = a, c.vertex = b.vertex || "", c.fragment = b.fragment || "", c.options = b.options || {}, 
        c.attributes = b.attributes || {}, c.uniforms = b.uniforms || {}, fx.ShadersEngine.map.put(a, c);
    },
    checkLoad: function() {
        fx.ShadersEngine.shadersLoaded == fx.ShadersEngine.numShaders && (AssetsManager.completed.shaders = !0);
    },
    add: function(a) {
        fx.ShadersEngine.shaders.push(a);
    }
}, Class("Shader", {
    Shader: function(a, b, c, d) {
        this.shader = fx.ShadersEngine.get(a), this.name = this.shader.name, this.vertex = this.shader.vertex, 
        this.fragment = this.shader.fragment, this.attributes = b ? b : this.shader.attributes, 
        this.uniforms = c ? c : this.shader.uniforms;
        var e = {
            attributes: this.attributes,
            uniforms: this.uniforms,
            vertexShader: this.shader.vertex,
            fragmentShader: this.shader.fragment
        }, f = d ? d : this.shader.options;
        for (o in f) e[o] = f[o];
        this.material = new THREE.ShaderMaterial(e);
    }
}), window.Util = window.Util || {}, Util.tests = [ "webgl", "webaudioapi", "webworker", "ajax" ], 
Util.start = function() {
    window.requestAnimFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(a) {
            window.setTimeout(a, 1e3 / 60);
        };
    }();
}, Util.check = {
    start: function(a, b) {
        var c = config.tests || Util.tests;
        -1 == c.indexOf("webgl") && c.push("webgl");
        for (var d in c) {
            if (-1 == Util.tests.indexOf(c[d])) return b("No Such Test", c[d]), !1;
            if (!Util.check[c[d]]()) return b("Test failed", c[d]), !1;
        }
        return a("All systems are go!"), !0;
    },
    webgl: function() {
        var a = document.createElement("canvas"), b = a.getContext("webgl") || a.getContext("experimental-webgl");
        return b ? !0 : !1;
    },
    webaudioapi: function() {
        return !(!window.webkitAudioContext && !window.AudioContext);
    },
    webworker: function() {
        return !!window.Worker;
    },
    ajax: function() {
        var a = null;
        try {
            a = new XMLHttpRequest();
        } catch (b) {}
        try {
            a = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (b) {}
        try {
            a = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (b) {}
        return null != a;
    }
}, Util.degToRad = function(a) {
    return a * (Math.PI / 180);
}, Util.getProportion = function(a, b, c) {
    return a * b / c;
}, Class("App", {
    App: function() {
        this.log_types = {
            e: "error",
            w: "warn",
            i: "info"
        }, this.util = {
            h: window.innerHeight,
            w: window.innerWidth,
            ratio: window.innerWidth / window.innerHeight,
            frameRate: 60,
            camera: {
                fov: 75,
                near: .1,
                far: 100
            }
        }, this.threeLib = void 0, this.camera = void 0, this.user = void 0, this.scene = void 0, 
        this.renderer = void 0, this.debug = !0, this.clock = new THREE.Clock(), this.mouseX = 0, 
        this.mouseY = 0, this.zoom = 0, this.windowHalfX = window.innerWidth / 2, this.windowHalfY = window.innerHeight / 2, 
        this.CAMERA_MAX_Z = 1e3, this.CAMERA_MIN_Z = 250;
    },
    onCreate: function() {},
    preload: function(a) {
        a();
    },
    prepareScene: function() {},
    progressAnimation: function(a) {
        $("#loader").animate({
            opacity: "0",
            "margin-top": "250px"
        }, 1e3, function() {
            $("#loader").remove(), $("body").animate({
                backgroundColor: "#fff"
            }, 200, a);
        });
    },
    customRender: function() {},
    setUpLeap: function() {},
    onLeapSocketConnected: function() {},
    onLeapDeviceConnected: function() {},
    onLeapDeviceDisconnected: function() {},
    render: function() {
        User.handleUserInput(), Game.update(), AudioEngine.update(), LightEngine.update(), 
        Universe.update(), Control.update(), app.camera.update && app.camera.update(app.clock.getDelta()), 
        app.renderer.autoClear = !1, app.renderer.clear(), app.customRender(), app.renderer.render(app.scene, app.camera.object), 
        setTimeout(function() {
            config.physics_enabled && Physijs._isLoaded && app.scene.simulate(), config.tween_enabled && TWEEN.update(), 
            requestAnimFrame(app.render);
        }, 1e3 / app.util.frameRate);
    },
    add: function(a, b) {
        this.scene.add(a), Universe.universe.put(a.uuid, b);
    },
    remove: function(a) {
        this.scene.remove(a), Universe.universe.remove(a.uuid);
    },
    init: function() {
        app.three = THREE;
        var a = app.util.camera, b = app.util;
        if (config) if (app.log("config loaded"), config.physics_enabled) {
            app.log("physics enabled.");
            try {
                Physijs.scripts.worker = "workers/physijs_worker.js", Physijs.scripts.ammo = "ammo.js", 
                app.scene = new Physijs.Scene(), Physijs._isLoaded = !0;
            } catch (c) {
                app.log("something bad trying to create physijs scene", "e"), app.log(c), Physijs._isLoaded = !1, 
                app.scene = new app.three.Scene();
            }
        } else app.log("physics not enabled."), Physijs._isLoaded = !1, app.scene = new app.three.Scene(); else app.log("config not loaded, switching to three.js"), 
        Physijs._isLoaded = !1, app.scene = new app.three.Scene();
        var d = {
            fov: a.fov,
            ratio: b.ratio,
            near: a.near,
            far: a.far
        };
        config && config.camera && (d.fov = config.camera.fov ? config.camera.fov : d.fov, 
        d.ratio = config.camera.ratio ? config.camera.ratio : d.ratio, d.near = config.camera.near ? config.camera.near : d.near, 
        d.far = config.camera.far ? config.camera.far : d.far), app.camera = new Camera(d);
        var e = !1;
        config.alpha && (e = !0), app.renderer = new app.three.WebGLRenderer({
            alpha: e
        }), config && 1 == config.cast_shadow && (app.renderer.shadowMapEnabled = !0, app.renderer.shadowMapType = THREE.PCFSoftShadowMap), 
        app.renderer.setSize(b.w, b.h), document.getElementById("gameContainer").appendChild(app.renderer.domElement), 
        User.handleUserInput(), Game.update(), Universe.update(), Control.init(), app.render(), 
        app.onCreate instanceof Function ? app.onCreate() : console.log("Something wrong in your onCreate method");
    },
    load: function() {
        console.log("inside load"), "function" != typeof this.progressAnimation && (this.progressAnimation = function(a) {
            console.log("def progressAnimation"), a();
        }), this.progressAnimation(app.init);
    },
    log: function() {
        this.debug && (arguments.length > 1 && arguments[1] in this.log_types ? console[this.log_types[arguments[1]]](arguments[0]) : console.log(arguments[0]));
    },
    onDocumentMouseWheel: function(a) {
        a.preventDefault(), app.zoom = .05 * a.wheelDelta, app.camera.object.position.z += app.zoom;
    },
    onDocumentMouseMove: function(a) {
        app.mouseX = a.clientX - app.windowHalfX, app.mouseY = a.clientY - app.windowHalfY;
    },
    onDocumentTouchStart: function(a) {
        1 === a.touches.length && (a.preventDefault(), app.mouseX = a.touches[0].pageX - app.windowHalfX, 
        app.mouseY = a.touches[0].pageY - app.windowHalfY);
    },
    onDocumentTouchMove: function(a) {
        1 === a.touches.length && (a.preventDefault(), app.mouseX = a.touches[0].pageX - app.windowHalfX, 
        app.mouseY = a.touches[0].pageY - app.windowHalfY);
    },
    keyup: function() {},
    keydown: function() {},
    onFailedTest: function() {},
    onSuccededTest: function() {}
});

var app;

window.onload = function() {
    if (console.log("inside window onload"), window.subClasses.App) {
        var a = window.subClasses.App;
        app = new window[a]();
    } else app = new App();
    Util.start(), Util.check.start(function() {
        app.preload(function() {
            AssetsManager.load(function() {
                app.prepareScene(), app.load();
            });
        });
    }, function(a, b) {
        app.onFailedTest(a, b), console.warn(a), console.warn(b);
    });
}, window.onresize = function() {
    app.util.h = window.innerHeight, app.util.w = window.innerWidth, app.util.ratio = app.util.w / app.util.h, 
    app.camera.object.aspect = app.util.ratio, app.camera.object.updateProjectionMatrix(), 
    app.renderer.setSize(app.util.w, app.util.h);
};