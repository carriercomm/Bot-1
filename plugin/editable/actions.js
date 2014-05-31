var fs = require('fs');
var lexics = JSON.parse(fs.readFileSync('./plugin/editable/lexic.json'));
var u = require('../../util.js');
/*
{
	"answers": {
		"dynamic": [],
		"static": []
	},
	"phrases": {}
}
*/

function preprocess (a) {
	return a.toLowerCase().replace(/([?!.\)\(]+)/g, '').replace(/(\s{2,})/g, '').replace('/^(\s)/g', '').replace('/x+d+/gi', '').replace('/:[dpo{|c]+/gi', '').replace('/([a-zа-я])\1{2,}/g', '$1').replace('\n','');
}

function equal_any (all, one) {
	var result = false;

	one = preprocess(one);

	all.forEach(function(saved){
		if (result) {return;}
		if (preprocess(saved) == one) {
			result = true;
		}
	});

	return result;
}

function translit (a) {
	// str, obj
	function replace(a,b) {
		for (var i in b) {
			a = a.replace(i, b[i]);
		}
		return a;
	}
	return replace(a,{а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"jz",з:"z",и:"i",й:"j",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"tz",ч:"ch",ш:"sh",щ:"sh",ъ:"",ы:"u",ь:"",э:"e",ю:"you",я:"ja"})
}


// многозначные ответы.
var BLACKLIST = ['да', "нет", "наверное", "не знаю", "хрен знает", "черт знает", "не знаю", "понятия не имею", "хмм", "амм", "эмм", "Эмм", "Хмм", "Хмм...", "Эмм..", "Эмм...", "Хмм..", "Хм", "Хм.."];

exports.addMessage = function (api, params) {

	api.print("Не поправляй меня!");
	return false;

	if (params.answer.charAt(0) == "$") {
		lexics.answers.dynamic.push({q: params.question, a: params.answer.substr(1)});
	} else if (params.answer.charAt(0) == '#') {
		lexics.answers.static.push({q: params.question, a: params.answer});
	} else {
		var found = false;

		var phases_all = api.phrases();

		if (!~BLACKLIST.indexOf(params.answer)) {
			for(var phrase_id in phases_all) {
				var phrase_data = phases_all[phrase_id][api.language()];
				if (equal_any(phrase_data, params.answer)) {
					lexics.answers.static.push({q:preprocess(params.question), a:phrase_id});
					found = true;
				}
			}
		}
		if (!found) {
			id = "answer_to_"+translit(preprocess(params.question)).replace(' ', '_');
			lexics.answers.static.push({q:preprocess(params.question), a:id});
			if (lexics.phrases[id]) {
				if (lexics.phrases[id][api.language()]) {
					lexics.phrases[id][api.language()].push(params.answer);
				} else {
					lexics.phrases[id][api.language()] = [params.answer];
				}
			} else {
				lexics.phrases[id] = {};
				lexics.phrases[id][api.language()] = [params.answer];
			}
		}
	}
		
	save(api);
}

function optimize () {

}

function save (api) {
	api.phrases(u.merge(api.phrases(),lexics.phrases));
	api.answers(u.merge(api.answers(),lexics.answers));
	fs.writeFileSync('./plugin/editable/lexic.json', JSON.stringify(lexics));
}

// 
// actions - send music (+genre/type),
// timer,
// read pikabu,
// search photo,
// who's online,
// what to do
// start ide,
// control game servers (start ghost-/future-craft, gmod)
//   --op,limit,cleanup,restart,start,stop,gamemode,say
// control PC 
//   -- bash
//   -- add crontab
//   -- add hosts
//   -- open crontab,hosts,.conf, ...
// sleep
// get serials
// notify /vk,email/
// start i2p, tor..
//