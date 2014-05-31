var fs = require('fs');
var u = require('./util.js');
var pluginApi = require('./plugin-api.js');

//var state = require('./state.js');
var state = {language: 'ru'}

var phrases = {
	phrase_forgot: {
		ru: ['Упс.. Я не знаю, как выразить свою мысль.', "Не знаю как тебе ответить", 'Я забыл как выразить эту мысль...', 'Мой словарный запас видимо мал', "Что-то слов не хватает", "Эм...Хмм..ЭЭэмммм...", "Кароч я не знаю, как это выразить.", "Я умею правильно излагать свои мысли.. сорри..", "Сударь, вы меня запутали", "Программисты поставили меня в дурацкое положение, не научив меня выгоравивать эту фразу..", "Учитель, ты меня этому не учил", "Хочу на курсы по языку, а то опять забыл фразу..", "Забыл эту фразу, вот тока вот хотел сказать и забыл.."],
		en: ['Sorry.. I don\'t know how to answer you']
	}
};

var answers = {
	"dynamic": { // q: ~, a: id_of_action
		"basic": [],
		"multiple": [],
		"regular": []
	},
	"static": { // q: ~, a: id_of_phrase
		"basic": [], // q: str, a: id_of_phrase
		"multiple": [], // q: arr, a: id_of_phrase
		"regular": [] // q: regexp, a: id_of_phrase
	},
}

var actions = {};

fs.readdir('./plugin', function (error, list) {

	u.debug(list.length+' directories in ./plugin/');


	list.forEach(function(plugin_dir) {

		var actions_file = './plugin/'+plugin_dir+'/actions.js';
		var main_file = './plugin/'+plugin_dir+'/main.js';
		var plugin_file = './plugin/'+plugin_dir+'/plugin.json';
		var lexic_file = './plugin/'+plugin_dir+'/lexic.json';
		
		fs.exists(plugin_file, function (exists_plugin_file) {
			if (exists_plugin_file) {
				fs.readFile(plugin_file, function(error, data) {
					u.error(error, 4101);
					
					var plugin_data = JSON.parse(data);

					u.debug('Found plugin "'+plugin_data.name+'".');

					fs.exists(actions_file, function (exists) {
						if (exists) {
							actions = u.merge(actions, require(actions_file));
							u.debug('Loaded actions for "'+plugin_data.name+'" plugin');
						}
					});
					fs.exists(main_file, function (exists) {
						if (exists) {
							actions = u.merge(actions, require(main_file));
							u.debug('Loaded main for "'+plugin_data.name+'" plugin');
						}
					});
					fs.exists(lexic_file, function (exists) {
						if (exists) {
							fs.readFile(lexic_file, function(error, data) {
								u.error(error, 4101)
			 
								var content = JSON.parse(data);


								answers = u.merge(answers, content.answers || {});
								phrases = u.merge(phrases, content.phrases || {})

								u.debug('Loaded q&a for "'+plugin_data.name+'" plugin');
								u.debug('Added '+Object.keys(content.phrases).length+' phrases');
								console.log(content.answers, answers);
							});
						}
					});
				});
			} else {
				u.debug('plugin.json not found in ./plugin/'+plugin_dir);
			}
		});
	});
});

function sphrase (id) {
	var phrases_rnd = (phrases[id][state.language] || phrases['phrase_forgot'][state.language]);
	return phrases_rnd[Math.floor(Math.random()*phrases_rnd.length)];
}

function preprocess (a) {
	u.debug(a);
	return a.toLowerCase().replace(/([?!.\)\(]+)/g, '').replace(/(\s{2,})/g, '').replace('/^(\s)/g', '').replace('/x+d+/gi', '').replace('/:[dpo{|c]+/gi', '');
}

function equal(saved, recieved) {
	u.debug(preprocess(saved)+' vs '+preprocess(recieved));
	return preprocess(saved) == preprocess(recieved);
}
function equal_any (all, one) {
	var result = false;
	var preprocessed = preprocess(one);

	all.forEach(function(saved){
		if (result) {return;}
		if (preprocess(saved) == preprocessed) {
			result = true;
		}
	});

	return result;
}

exports.parse = function (phrase, device) {

	u.debug('Looking for phrase in lists..');
	u.debug(Object.keys(answers.static.multiple).length)

	answers.dynamic.basic.forEach(function(a){
		if (equal(phrase,a.q)) {
			u.debug('Found phrase in lexics');
			actions[a.a](new pluginApi(device), {'src_text': phrase});
		}
	});
	answers.dynamic.multiple.forEach(function(a){
		if (equal_any(a.q, phrase)) {
			u.debug('Found phrase in lexics');
			actions[a.a](new pluginApi(device), {'src_text': phrase});
		}
	});
	answers.dynamic.regular.forEach(function(a){
		if (a.q.test(phrase)) {
			u.debug('Found phrase in lexics');
			actions[a.a](new pluginApi(device), {'src_text': phrase});
		}
	});
	answers.static.basic.forEach(function(a) {
		if (equal(phrase,a.q)) {
			u.debug('Found phrase in lexics');
			device.send(JSON.stringify({'type': 'text', 'data': sphrase(a.a)}));
		}
	});
	answers.static.multiple.forEach(function(a) {
		if (equal_any(a.q, phrase)) {
			u.debug('Found phrase in lexics');
			device.send(JSON.stringify({'type': 'text', 'data': sphrase(a.a)}));
		}
	});
	answers.static.regular.forEach(function(a) {
		if (a.q.test(phrase)) {
			u.debug('Found phrase in lexics');
			device.send(JSON.stringify({'type': 'text', 'data': sphrase(a.a)}));
		}
	});
}