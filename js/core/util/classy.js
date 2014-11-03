var __pool__ = {};
function Class(name, methods) {
	var upper = __upperCaseFirstLetter__(name);
	__pool__[upper] = new __class__(upper, methods);
	//constructor not found
	if (!methods[upper]) throw "NO CONSTRUCTOR PROVIDED";
	window[upper] = methods[upper];
	for (var k in methods) {
		if (k != name) window[upper].prototype[k] = methods[k];
	}
	//adding a few useful methods
	window[upper].prototype['__print__'] = function() {console.table(this)}
	return __pool__[upper];
}

__class__ = function(name, methods) {
	this.name = name;
	this.methods = methods;
}

__class__.prototype.has = {}.hasOwnProperty;
__class__.prototype._extends = function(toextend) {
	var c = window[this.name];
	var sup = (typeof(toextend) == "string") ? window[toextend] : toextend;
	if (!sup) throw "NO UPPER CLASS"
	window[this.name].prototype = Object.create(sup.prototype);
	window[this.name].prototype.constructor = window[this.name];
	this._setMethods();
	//apparently useless code below.
	window[this.name].prototype.__getSuper = function() {
		console.log(c);
		console.log(sup);
		return sup;
	}
	/*
	window[this.name].prototype._super = function() {
		this.__getSuper().apply(this, arguments);
	};*/
	window[this.name].prototype._super = (typeof(toextend) == "string") ? window[toextend].call : toextend.call;
}

__class__.prototype._setMethods = function() {
	for (var k in this.methods) {
		if (k != this.name) window[__upperCaseFirstLetter__(this.name)].prototype[k] = this.methods[k];
	}
}

function __upperCaseFirstLetter__ (s) {
	return (s.length > 2) ? s[0].toUpperCase() + s.substring(1, s.length) : s.toUpperCase();
}

function include(scriptname) {
	var s = document.createElement("script");
	s.src = scriptname+".js";
	s.async = false;
	document.getElementsByTagName('head')[0].appendChild(s);
}