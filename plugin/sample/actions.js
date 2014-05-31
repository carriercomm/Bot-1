//
// This file will be run on startup;
// Here you can add Bot actions
//

//
// To add an action just add a property to 'actions' global object
//
exports.sample = function (api, params) {
	//
	// To display text use 'api.print' or '.echo';
	// You may also add some options
	//
	var options = {
		//
		// Notify with sound;
		// Default value: FALSE
		// Also you can specify audio URL,
		// if set as 'true' default sound will be used
		//
		"sound": true,

		//
		// Indicate in tray / gnome-shell-notify / android-notify-panel
		// Default value: FALSE
		//
		"notify": true,

		//
		// Device to display the text
		// Allowed devices: console, phone,
		// pc-chat, vk-page, default;
		// 'default' is the current device
		//
		"target": "default",
	};

	//
	// 'text' can be String and Array of Objects (for colored text) 
	// example: [{'text': 'hello, ', 'color': '#111'}, {text: 'world', 'color': '#000', 'bold': true}]; 
	//
	var text = 'pong';

	api.print(text, options);

	//
	// To read text from input device use 'api.read'. 
	// This method needs 2 arguments: prompt & callback
	// 'prompt' is the same type as 'text' in 'api.print', but
	// also there is a property 'blink'
	//
	var prompt = [{'text':'>', 'blink': true}];

	//
	// callback will be called when user pressed 'enter'.
	// callback will be called with one argument with text;
	//
	var callback = function(text) {
		//
		// 'text' can be multiline, as user can press CTRL+Enter
		//
	}

	api.read(prompt, callback);

	
}