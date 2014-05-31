function $(a){return document.getElementById(a);}

function render_message (message, own) {
	var msg_wrap = document.createElement('div');
	var msg = document.createElement('div');
		
	msg.className = (own)?"message my":"message his";
	msg.innerText = message;

	msg_wrap.appendChild(msg);

	
	var msg_space = document.createElement('div');
	msg_space.className = 'fill';
	msg_space.innerText = message;
	msg_wrap.appendChild(msg_space);
	

	$('history').appendChild(msg_wrap);
}

function connect () {
	var ws = new WebSocket('ws://paulll.cc:8000');
	ws.onopen = function () {
		ws.send('{"is_initial":true, "device": "web"}');
		$('write').onkeydown = function (event) {
		if (event.which == 13) {
			ws.send(JSON.stringify({is_phrase:true, phrase: $('write').value}));
			render_message($('write').value, true);
			$('write').value = '';
			return false;
		}
	}
	}
	ws.onclose = function () {
		console.log('DISCONNECTED!!!!');
	}
	ws.onmessage = function (event) {
		var message = JSON.parse(event.data);

		if (message.type === 'text') {
			render_message(message.data, false);
		}
	}
}

connect();