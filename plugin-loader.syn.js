var fs = require('fs');
var u = require('./util.js');
var pluginApi = require('./plugin-api.js');

var state = {language: 'ru'}

var phrases = {
	phrase_forgot: {
		ru: ['Упс.. Я не знаю, как выразить свою мысль.', "Не знаю как тебе ответить", 'Я забыл как выразить эту мысль...', 'Мой словарный запас видимо мал', "Что-то слов не хватает", "Эм...Хмм..ЭЭэмммм...", "Кароч я не знаю, как это выразить.", "Я умею правильно излагать свои мысли.. сорри..", "Сударь, вы меня запутали", "Программисты поставили меня в дурацкое положение, не научив меня выгоравивать эту фразу..", "Учитель, ты меня этому не учил", "Хочу на курсы по языку, а то опять забыл фразу..", "Забыл эту фразу, вот тока вот хотел сказать и забыл.."],
		en: ['Sorry.. I don\'t know how to answer you']
	}
};

var answers = {
	"dynamic": [],
	"static": [],
}

var actions = {};


function sphrase (id) {
	var phrases_rnd = (phrases[id][state.language] || phrases['phrase_forgot'][state.language]);
	return phrases_rnd[Math.floor(Math.random()*phrases_rnd.length)];
}

function preprocess (a) {
	return a.toLowerCase().replace(/([?!.\)\(]+)/g, '').replace(/(\s{2,})/g, '').replace('/^(\s)/g', '').replace('/x+d+/gi', '').replace('/:[dpo{|c]+/gi', '').replace('/([a-zа-я])\1{2,}/g', '$1').replace('\n','');
}

function equal(saved, recieved) {
	return preprocess(saved) == recieved;
}

function equal_any (all, one) {
	var result = false;

	all.forEach(function(saved){
		if (result) {return;}
		if (preprocess(saved) == one) {
			result = true;
		}
	});

	return result;
}

exports.parse = function (phrase, device) {

	var phrase = preprocess(phrase);
	var found = false;

	function dynamic (a) {
		found = true;
		actions[a.a](new pluginApi(device), {'src_text': phrase});
	}
	function static (a, readonly) {
		found = true;
		device.send(JSON.stringify({'type': 'text', 'text': sphrase(a.a)}));
	}

	answers.dynamic.forEach(function(a){
		if (!found) {
			if (Array.isArray(a.q)) {
				if (equal_any(a.q, phrase)) {
					dynamic(a);
				}
			} else if (a.q.test) {
				if (a.q.test(phrase)) {
					dynamic(a);
				}
			} else if (typeof a.q === "string") {
				if (equal(a.q, phrase)) {
					dynamic(a);
				}
			}
		}
	});
	answers.static.forEach(function(a){
		if (!found) {
			if (Array.isArray(a.q)) {
				if (equal_any(a.q, phrase)) {
					static(a);
				}
			} else if (a.q.test) {
				if (a.q.test(phrase)) {
					static(a);
				}
			} else if (typeof a.q === "string") {
				if (equal(a.q, phrase)) {
					static(a, true);
				}
			}
		}
	});

	if (!found) {
		device.send(JSON.stringify({'type': 'text', 'text': 'Не поняла.. исправь, пожалуйста..', invalid: true}));
	}
}

// now load plugins

var plugin_dirs = fs.readdirSync('./plugin');

plugin_dirs.forEach(function(dir){
	if (fs.existsSync('./plugin/'+dir+'/plugin.json')){
		
		var plugin = JSON.parse(fs.readFileSync('./plugin/'+dir+'/plugin.json'));

		u.debug('Loaded plugin "'+plugin.name+'"');

		if (fs.existsSync('./plugin/'+dir+'/lexic.json')){

			var lexics = JSON.parse(fs.readFileSync('./plugin/'+dir+'/lexic.json'));

			phrases = u.merge(phrases, lexics.phrases);
			answers = u.merge(answers, lexics.answers);
		}

		if (fs.existsSync('./plugin/'+dir+'/main.js')){
			var a = require('./plugin/'+dir+'/main.js');
			actions = u.merge(actions, a);
			if (typeof a.main == 'function') {a.main()}
		}

		if (fs.existsSync('./plugin/'+dir+'/actions.js')){
			var a = require('./plugin/'+dir+'/actions.js');
			actions = u.merge(actions, a);
			if (typeof a.main == 'function') {a.main()}
		}
	}
});


exports.actions = function (a) {return a?(actions=a):actions};
exports.answers = function (a) {return a?(answers=a):answers};
exports.phrases = function (a) {return a?(phrases=a):phrases};