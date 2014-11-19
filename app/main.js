/********************************************************************************
	MAIN SCRIPT
	copyright© 2014 Marco Stagni. http://marcostagni.com
********************************************************************************/

/********************************************************************************
	onLeapSocketConnected()

	@params null
	@output null

	@desc fired when Leap socket is connected.
********************************************************************************/

function onLeapSocketConnected() {
	l("Leap socket connected.", "i");
}

/********************************************************************************
	onLeapDeviceConnected()

	@params null
	@output null

	@desc fired when leap device is connected.
********************************************************************************/

function onLeapDeviceConnected() {
	l("Leap Device connected.", "i");
}

/********************************************************************************
	onLeapDeviceDisconnected()

	@params null
	@output null

	@desc fired when leap device is disconnected.
********************************************************************************/

function onLeapDeviceDisconnected() {
	l("Leap Device disconnected.", "i");
}

/********************************************************************************
	onCreate()

	@params null
	@output null

	@desc called when scene is created. Use this method
	to perform operations (such as adding elements) on your scene.
********************************************************************************/

function onCreate() {
	//oncreate method
}

/********************************************************************************
	progressAnimation()

	@params callback[function]
	@output null

	@desc called to perform custom progress animation when loading scene
	if not set, default progress animation will be used.
********************************************************************************/

progressAnimation = function(callback) {
	$('#loader').animate({"opacity" : "0", "margin-top" : "250px"}, 1000 , function () {
		$('#loader').remove();	
		$('body').animate({backgroundColor : "#fff"}, 200 , callback);
	});
}

/********************************************************************************
	preLoad()

	@params callback[function]
	@output null

	@desc called to perform custom progress animation when loading scene
	if not set, default progress animation will be used.
********************************************************************************/

function preload(callback) {
	//use this method to perform heavy tasks
	//loading json models

	callback();
}

/********************************************************************************
	displayMessage()

	@params message[string], type[string]
	@output null

	@desc display console messages. type can be "error", "warning", "info", or 
	null.
********************************************************************************/

function displayMessage(message, type) {
	switch(type) {
		case "error": {
			console.err(message);
		}

		case "warning": {
			console.warn(message)
		}

		case "info": {
			console.info(message)
		}

		default : {
			console.log(message);
		}

	}
}

/********************************************************************************
	input.keydown()

	@params event[object]
	@output null

	@desc fired when a key is pressed on keyboard.
********************************************************************************/

input.keydown = function(event) {
	//l(event);
};

/********************************************************************************
	input.keyup()

	@params event[object]
	@output null

	@desc fired when a key is released on keyboard.
********************************************************************************/

input.keyup = function(event) {

};

/********************************************************************************
	setUpLeap()

	@params null
	@output null

	@desc Use this to setUp your leap motion! If you don't have a leap
	motion, your app will still work fine.
********************************************************************************/

function setUpLeap() {

}

