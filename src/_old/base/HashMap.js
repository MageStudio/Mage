function HashMap() {
	if (arguments.length == 0) {
		//costruttore di default
		this.total = 0;
		this.keys = new Array();
		this.maxDimension = undefined;
	}
	else {
		if (arguments.length == 1) {
			if (!isNaN(arguments[0])) {
				
				/*------------------------------
				INITIALIZING MAP with a 
				prefixed max dimension.				
				------------------------------*/

				this.total = 0;
				this.maxDimension = arguments[0];
				this.keys = new Array();

			}
			else {
				
				/*------------------------------
				 we must implement constructor 
				 from another map.
				------------------------------*/

				this.total = 0;
				this.keys = new Array();
				this.maxDimension = undefined;

			}		

		}

	}

	/*------------------------------
	anyway, we must create a 
	map object inside out object
	------------------------------*/

	this.map = {};
	
}


HashMap.prototype.clear = function() {
	
	/*------------------------------
	clearing every element of our 
	map.
	------------------------------*/

	for (key in this.map) {
		this.map[""+key] = undefined;
	}
	this.total = 0;
	this.keys = new Array();
}


HashMap.prototype.clone = function() {

	/*------------------------------
	creating a temporary object
	exact clone of this.
	------------------------------*/

	var temp = new HashMap();
	for (key in this.map) {
		temp.map[""+key] = this.map[""+key];
	}

	return temp;
}

HashMap.prototype.containsKey = function( key ) {

	/*------------------------------
	searching across the map for
	the key selected.
	------------------------------*/

	var found = false;
	for (innerkey in this.map) {
		if (innerkey == key ) {
			found = true;
			break;
		}
	}

	return found;
}

HashMap.prototype.containsValue = function( value ) {

	/*------------------------------
	searching across the map for
	the key selected.
	------------------------------*/

	var found = false;
	for (key in this.map) {
		if (this.map[""+key] == value ) {
			found = true;
			break;
		}
	}

	return found;
}

HashMap.prototype.get = function( key ) {
	
	/*------------------------------
	searching across the map for
	the key selected.
	------------------------------*/	
	for (innerkey in this.map) {
		if (innerkey == key ) {
			return this.map[""+innerkey];
		}
	} 

	return null;
}

HashMap.prototype.isEmpty = function() {

	return (this.total == 0);
}

HashMap.prototype.put = function( key, value) {
	if (this.maxDimension) {
		if (this.total < this.maxDimension) {
			this.map[""+key] = value;
			this.keys.push(key);
			this.total += 1;
			return true;
		}
		else {
			return false;
		}
	}
	else {
		this.map[""+key] = value;
		this.keys.push(key);
		this.total += 1;
		return true;
	}
}



HashMap.prototype.remove = function ( key ) {
	//must return true or false if our deletion
	//is succesful or not.
	try {
		for (innerkey in this.map) {
			if (innerkey == key) {
				var index = this.keys.indexOf(innerkey);
				var b = new Array();
				for (var i =0; i < this.keys.length; i++) {
					if (i!=index) {
						b.push(this.keys[i]);
					}
				}
				this.keys = new Array();
				this.keys = b;
				delete this.map[""+innerkey];
				this.total = 0;
				return true;
			}
		}

		return false;
	}
	catch ( error ) {
		console.log("HASHMAP ERROR ");
		console.error(error);
		console.trace();
		return false;
	}

}

HashMap.prototype.size = function () {

	return this.total;
}