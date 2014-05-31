// file to save&load Bot state
// module exports content of state.json

var fs = require('fs');

// load state (runs once at startup)
fs.readFile('./state.json', function (error, data) {
	if (error) {
		console.log('[FATAL] Can not read bot state');
		throw error;
	}
	console.log('[DEBUG] bot state:'+data)
	module.exports = {state: JSON.parse(data)};
});

// save state
setInterval(function(){
	fs.writeFile('./state.json', JSON.stringify(module.exports.state), function (error) {
		if (error) {
			console.log('[FATAL] Can not write bot state');
			throw error;
		}
	});
},10000);
// Yes, bot will not remember last ~10 seconds before shutting down