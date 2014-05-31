var WebSocketServer = require('ws').Server
var wss = new WebSocketServer({port: 8000});

var plugins = require('./plugin-loader.syn.js');
var pluginApi = require('./plugin-api.js')
var u = require('./util.js');

var devices = {
	phone: false,
	tv: false,
	web: []
}

Array.prototype.exterminate = function (value) {
    this.splice(this.indexOf(value), 1);
}

wss.on('connection', function(ws) {

    u.debug('Client connected');

	var device = '';

    ws.on('message', function(message) {
        var msg = JSON.parse(message);
        if (msg.is_initial) {

        	device = msg.device;
        	
        	if (['tv', 'web', 'phone'].indexOf(device) == -1) {
        		
                u.debug('4000');

        		// ERROR 4000 - no such device
        		ws.close(4000, 'THIS IS SPARTAAA!!');
        	} else {
        		if (devices[device] && device !== 'web') {
        			
                    u.debug('4001');

        			// ERROR 4001 - already connected
        			ws.close(4001, 'THIS IS SPARTAAA!!!');
        		} else {
        			if (device == 'web') {
        				devices.web.push(ws);
        			} else {
	        			devices[device] = ws;
    				}
        		}
        	}
        } else {
            if (msg.is_phrase) {

                u.debug('Client said: '+msg.phrase);

                plugins.parse(msg.phrase, ws);
            } else {

                u.debug('Client wants to emit event');

                // is_action
                plugins.actions()[msg.action](new pluginApi(ws), msg.params);
            }
        }
    });
    ws.on('close', function(){

        u.debug('Client disconnected');

    	if (device == 'web') {

        	devices.web.exterminate(ws);
        } else {
	    	devices[device] = undefined;
    	}
    });
});
