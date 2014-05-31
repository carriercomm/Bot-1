var server = require('./server.js');
var plugins = require('./plugin-loader.syn.js');
var devices = server.devices;

var u = require('./util.js');

function mergeRecursive(obj2, obj1) {
  for (var p in obj2) {
    try {
      if ( obj2[p].constructor==Object ) {
        obj1[p] = mergeRecursive(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
    } catch(e) {
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}

module.exports = function api (device) {

	u.debug('Creating new instance of API')

	this.device = device;

	this.print = function (text, config) {
		config = mergeRecursive (config, {
			sound: false,
			notify: false,
			target: 'default'
		});

		if (config.target == 'default') {
			device.send(JSON.stringify({'type': 'text', 'text': text, 'flags': ['read-only']}));
		}

		if (config.target == 'web') {
			server.devices.web.forEach(function(ws){
				ws.send(JSON.stringify({'type': 'text', 'text': text}));
			});
		}
		
		u.debug('Sending message: '+text);
		//TODO: add other device types  
	}

	this.send_multimedia = function (data, config) {
		config = mergeRecursive (config, {
			sound: false,
			notify: false,
			target: 'default',
			type: null
		});
		
		if (config.type == 'audio') {
			if (config.target == 'default') {
				device.send(JSON.stringify({'type': config.type, 'audio': data}));
			}

			if (config.target == 'web') {
				server.devices.web.forEach(function(ws){
					ws.send(JSON.stringify({'type': config.type, 'audio': data}));
				});
			}
		} else if (config.type == 'audio-playlist') {
			if (config.target == 'default') {
				device.send(JSON.stringify({'type': config.type, 'audios': data));
			}

			if (config.target == 'web') {
				server.devices.web.forEach(function(ws){
					ws.send(JSON.stringify({'type': config.type, 'audios': data}));
				});
			}
		} else {
			if (config.target == 'default') {
				device.send(JSON.stringify({'type': config.type, 'src': data}));
			}

			if (config.target == 'web') {
				server.devices.web.forEach(function(ws){
					ws.send(JSON.stringify({'type': config.type, 'src': data}));
				});
			}
		}

		u.debug('Sending multi-media');
		//TODO: add other device types  
	}

	// alias
	this.echo = this.print;

	// interface to lexics and actions
	// @function ([data]) if argument given - setter, else - getter
	this.answers = plugins.answers;
	this.phrases = plugins.phrases;
	this.actions = plugins.actions;

	//!TODO
	this.language = function (){return "ru"};
}
