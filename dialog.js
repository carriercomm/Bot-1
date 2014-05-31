
// delete this file

var phrases = {
	greeting: {
		ru: [],
		en: []
	}
};

var actions = {

};

function say () {}

//

var answers = {}; // a -> b

var answers_regular = []; // /a/ -> b

var answers_multiple = [ // a,c -> b
	{
		q: "привет здраствуй здрасте здраститя здарова прив привет хай хелло хеллоу приветствую доброе_утро добрый_день добрый_вечер алоха боброе_утро бобрый_вечер hello hi aloha alloha helo privet zdarova zdrastvuj zdrastvui good_morning good_afternoon good_evening dobroe_ytro".split(' '),
		a: phrases.greeting
	}
];

var answers_dynamic = {}; // a -> b()

var answers_multiple_dynamic = [ // a,c -> b()
	{
		q: ['что нового на хабре', "чего нового на хабре", "какие на хабре сегодня новости", "что с хабром", "хабрахабр", "хабр", "хабралента"],
		a: actions.habrafeed
	},
	{
		q: ['Расскажи анекдот', "скажи анекдот", "скучно", "шуткани", "развесели меня", "скажи прикол", "скажи шутку", "расскажи шутку", "го байки травить", "расскажи байку"],
		a: actions.jokes // bashorg | pikabu | xkcd
	}
];

var answers_regular_dynamic = []; // /a/ -> b()

//

function input (str) {

}