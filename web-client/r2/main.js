function $(a){return document.getElementById(a);}
String.prototype.last = function(num) {
	return this.substring(this.length-num, this.length);
};
function specialChars (text) {
	var div = document.createElement('div');
 	var text = document.createTextNode(text);
 	div.appendChild(text);
 	return div.innerHTML;
}
function detectLinkType (url) {
	if (~["png", "jpg", "gif", "bmp", "svg", "peg"].indexOf(url.last(3))){
		return 'image';
	}
	if (~["mp4", "m4v", "ebm", "flv", "avi"].indexOf(url.last(3))){
		return 'video';
	}
	if (~["mp3", "m4a", "wav", "ogg"].indexOf(url.last(3))){
		return 'audio';
	}
	if (url.substr(0,29)=="http://www.youtube.com/watch?") {
		return 'youtube';
	}
	return 'web';
}

//@deprecated
function render_message (message, own, invalid, onedit) {
	var wrapper = document.createElement('div');
	var text = document.createElement('span');
	var content = document.createElement('div');

	wrapper.className = (own)?"message own":"message bot";
	content.className = "content";
	text.innerText = message;

	content.appendChild(text);
	wrapper.appendChild(content);

	if (!own) {
		if (invalid){
			wrapper.classList.add('invalid');
			text.className = "red";
			text.onclick = function () {
				text.contentEditable = true;
				text.innerHTML = '';
				text.onkeydown = function (e) {
					if (e.which == 13) {
						text.className = '';
						text.contentEditable = false;
						text.onclick = null;
						text.onkeydown = null;
						onedit(text.innerText, wrapper.previousSibling.innerText);
						return false;
					}
				} 
			}
		}
	}
	$('history').appendChild(wrapper);
}
function parse_message (data, socket) {
	if (data.own) {
		if (/^https?:\/\/[^ ]+$/.test(data.text)){
			switch (detectLinkType(data.text)) {
				case "image":
					render_image(data.text, true);
					break;
				case "video":
					render_video(data.text, true);
					break;
				case "audio":
					render_audio(data.text, true);
					break;
				default:
					render_text(data.text, true);
					break;
			}
		} else {
			render_text(data.text, true);
		}
	} else {
		switch (data.type){
			case "image":
				render_image(data.src, false);
				break;
			case "video":
				render_video(data.src, false);
				break;
			case "audio":
				render_audio(data.audio, false);
				break;
			case "audio-playlist":
				render_audios(data.audios);
				break;
			case "text":
				render_text(data.text, false, data.invalid?socket:false);
				break;
			default:
				render_text('Ой, я хотела отправить тебе объект типа "'+data.type+'", но он не отправляется.. Может быть зайдешь через другую программу?', false)
				break;
		}
	}
}

function render_image (src, own) {
	var container = document.createElement('div');
	var wrapper = document.createElement('div');
	var img = document.createElement('img');

	container.className = own?'message own image':'message bot image';
	wrapper.className	= 'content';

	img.src = src;

	wrapper.appendChild(img);
	container.appendChild(wrapper);
	$('history').appendChild(container);

	return false;
}
function render_video (src, own) {
	var container = document.createElement('div');
	var wrapper = document.createElement('div');
	var video = document.createElement('video');
	var progress_wrap = document.createElement('span');
	var progress = document.createElement('span');

	container.className = own?'message own video':'message bot video';
	wrapper.className	= 'content';
	progress_wrap.className = 'progressbar';

	video.src = src;
	video.onclick = function () {
		if (video.paused) {
			localStorage.setItem('stop_sounds', '1');
			window.onstorage = function () {
				if (localStorage.getItem('stop_sounds') == '1') {
					video.pause();
					localStorage.setItem('stop_sounds', '0');
				}
			}
			video.play();
		} else {
			video.pause();
		}
	};
	video.ontimeupdate = function () {
		var value = 0;
		if (video.currentTime > 0) {
			value = (100 / video.duration) * video.currentTime;
		}
		progress.style.width = value + "%";
	};


	progress_wrap.appendChild(progress);
	wrapper.appendChild(video);
	wrapper.appendChild(progress_wrap);
	container.appendChild(wrapper);
	$('history').appendChild(container);

	return false;
}
function render_audio (src, own) {

	if (own) {src = {src:src,title:'Unknown - unknown'}}

	var container = document.createElement('div');
	var wrapper = document.createElement('div');
	var progress_wrap = document.createElement('span');
	var progress = document.createElement('span');
	var textlayer = document.createElement('span');
	var playbtn = document.createElement('span');
	var btnico = document.createElement('div');

	var audio = new Audio();

	container.className = own?'message own music':'message bot music';
	wrapper.className	= 'content';
	progress_wrap.className = 'progress';
	playbtn.className = 'playbtn';
	btnico.className = 'icon-play';
	textlayer.className = 'textlayer';

	textlayer.innerText = src.title;

	audio.src = src.src;


	playbtn.onclick = function () {
		if (audio.paused) {
			localStorage.setItem('stop_sounds', '1');
			if (window.onstorage){window.onstorage()};
			window.onstorage = function () {
				if (localStorage.getItem('stop_sounds') == '1') {
					console.log('=1');
					audio.pause();
					btnico.className = 'icon-play';
				}
				setTimeout(function(){localStorage.setItem('stop_sounds', '0')}, 500);
			}
			audio.play();
			btnico.className = 'icon-pause';
		} else {
			audio.pause();
			btnico.className = 'icon-play';
		}
	};
	audio.ontimeupdate = function () {
		var value = 0;
		if (audio.currentTime > 0) {
			value = (100 / audio.duration) * audio.currentTime;
		}
		progress.style.width = value + "%";
		if (value == 100) {
			audio.stop();
			btnico.className = 'icon-play';
		}
	};

	playbtn.appendChild(btnico);
	progress_wrap.appendChild(textlayer);
	progress_wrap.appendChild(progress);
	wrapper.appendChild(playbtn);
	wrapper.appendChild(progress_wrap);
	container.appendChild(wrapper);
	$('history').appendChild(container);

	return false;
}
function render_audios(audios) {
	var container = document.createElement('div');
	var wrapper = document.createElement('div');
	container.className = 'message bot music-pack';
	wrapper.className	= 'content';

	$('history').appendChild(container);

	var audio = new Audio();

	audios.forEach(function(audio_data, i){
		var track = document.createElement('div');
		var playbtn = document.createElement('span');
		var progress_wrap = document.createElement('span');
		var progress = document.createElement('span');
		var textlayer = document.createElement('span');
		var btnico = document.createElement('div');

		track.className = 'track';
		playbtn.className = 'playbtn';
		progress_wrap.className = 'progress';
		textlayer.className = 'textlayer';

		playbtn.appendChild(btnico);
		track.appendChild(playbtn);
		track.appendChild(progress_wrap);
		progress_wrap.appendChild(textlayer);
		progress_wrap.appendChild(progress);
		wrapper.appendChild(track);
		btnico.className = 'icon-play';

		textlayer.innerText = audio_data.title;
		//audio.src = audio_data.src;

		btnico.className = 'icon-play';

		playbtn.onclick = function () {
			audio.ontimeupdate = function () {
				var value = 0;
				if (audio.currentTime > 0) {
					value = (100 / audio.duration) * audio.currentTime;
				}
				progress.style.width = value + "%";
				if (value==100){
					if (track.nextSibling) {
						track.nextSibling.querySelector('.playbtn').onclick();
					} else {
						track.parentNode.querySelector('.playbtn').onclick();
					}
					
				}
			};

			if (audio.src == audio_data.src) {
				if (audio.paused){
					localStorage.setItem('stop_sounds', '1');
					if (window.onstorage){window.onstorage()};
					window.onstorage = function () {
						if (localStorage.getItem('stop_sounds') == '1') {
							console.log('=1');
							audio.pause();
							btnico.className = 'icon-play';
						}
					};
					setTimeout(function(){localStorage.setItem('stop_sounds', '0')}, 500);
					audio.play()
					btnico.className = 'icon-pause';
				} else {
					audio.pause();
					btnico.className = 'icon-play';
				}
			} else {
				localStorage.setItem('stop_sounds', '1');
				window.onstorage = function () {
					if (localStorage.getItem('stop_sounds') == '1') {
						audio.pause();
						localStorage.setItem('stop_sounds', '0');
					}
				}
				audio.src = audio_data.src;
				audio.play()
			}
		}
	});
}
function render_text  (data, own, socket) {
	var container = document.createElement('div');
	var wrapper = document.createElement('div');
	var text = document.createElement('span');

	container.className = own?'message own':'message bot';
	wrapper.className	= 'content';

	// links..
	text.innerHTML = specialChars(data).replace(/(https?:\/\/[A-Za-z0-9А-Яа-я.-_%#!@]+)/g, '<a href="$1">$1</a>').replace(/>https?:\/\/([^<]+)<\/a>/g, '/>$1</a>');

	// socket given only if message is invalid
	if (socket) {
		container.classList.add('invalid');
		text.className = "red";
		text.onclick = function () {
			text.contentEditable = true;
			text.innerHTML = '';
			text.onkeydown = function (e) {
				if (e.which == 13) {
					text.className = '';
					text.contentEditable = false;
					text.onclick = undefined;
					text.onkeydown = undefined;
					socket.send(JSON.stringify({action: 'addMessage', params: {question: container.previousSibling.innerText, answer: text.innerText}}));
					return false;
				}
			} 
		}
	}

	wrapper.appendChild(text);
	container.appendChild(wrapper);
	$('history').appendChild(container);

	return false;
}

function connect () {

	// standard initialization
	var ws = new WebSocket('ws://paulll.cc:8000');
	ws.onopen = function () {
		ws.send('{"is_initial":true, "device": "web"}');
		$('write').onkeydown = function (event) {
			if (event.which == 13) {
				ws.send(JSON.stringify({is_phrase:true, phrase: $('write').value}));
				parse_message({text:$('write').value, own:true},ws);
				$('write').value = '';
				return false;
			}
		}
	}
	ws.onclose = function () {
		setTimeout(connect,5000);
		console.log('reconnecting..')
	}
	ws.onmessage = function (event) {
		var message = JSON.parse(event.data);
		message.own = false;
		parse_message(message, ws);
	}
}

connect();

var observer = new MutationObserver(function() {
    $('history').scrollTop = $('history').scrollHeight;
}).observe($('history'), { childList: true });