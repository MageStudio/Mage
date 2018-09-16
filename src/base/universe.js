window.M = window.M || {};

M.universe =  {

	reality: undefined,

	loaded: false,

	worker: undefined,

	bigbang: function(){
		console.log("inside universe init");

		M.universe.loaded = true;
		M.universe.reality = {};
	},

	update: function() {

		const keys = Object.keys(M.universe.reality);
		if (keys.length != 0) {
			var start = +new Date();
			do {
				const o = M.universe.reality[keys_list.shift()];
				if (o && o.update) {
					o.update(app.clock.getDelta());
				}
				o.render();
			} while (keys.length > 0 && (+new Date() - start < 50));
		}
	}
};

M.universe.bigbang();
