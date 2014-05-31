// adds following actions:
// weather_today, weather_nextday, weather_raintoday, weather_rainnextday

var Forecast = require('forecast.io');
var util = require('util');
var options = {
	APIKey: '2361fcc4262fd91178106710cdcf8029',
	requestTimeout: 1000
};
var forecast = new Forecast(options);

function f2c(f) {
	return Math.round((f - 32) / 1.8);
}

function rnd(array) {
	return array[Math.floor(Math.random()*array.length)];
}

var cache = {}, last_update = {};

exports.weather_today = function(api, params) {

	function weather(now){

		var summary = '';

		if (!now.precipIntensity) {
			// повторение, чтобы была мелкая вероятность выпадения "Дождя или снега нет"
			summary = summary+rnd(['Осадков нет', 'Сейчас осадков нет', "Осадков сейчас нет", "На данный момент осадков нет", "На сей момент осадков нет", "Сейчас нет осадков", "Осадков на сей момент нет", "Осадки на данный момент отсутствуют", "Сейчас осадки отсутствуют" ,'Нет осадков', "Дождя или снега нет"]);
			if (!now.precipProbability) {
				summary = summary+rnd([' и не ожидается.', ' и не будет.', " да и не будет.", " да и не ожидается."]);
			} else {
				if (now.precipProbability < 0.2) {
					summary = summary+rnd([', но возможны, хотя и с ничтожно малой вероятностью.', ', но вероятны.', ", но могут внезапно выпасть.", ", но их вероятность отрицать не стану.", ", однако с малой вероятностью возможны.", ", однако теоритически возможны.", ", но может быть да и выпадут."]);
				} else if (now.precipProbability < 0.5) {
					summary = summary+rnd([', но, возможно, будут.', ", но возможны.", ", однако стоит их ожидать.", ", но, возможно, стоит к ним приготовиться", ", но, возможно, стоит к ним подготовиться"]);
				} else if (now.precipProbability < 0.7) {
					summary = summary+rnd([', хотя скорее всего все-же будут.', ", но я их предвижу.", ", но я чуствую их приближение.", ", но скорее всего будут.", ", но синоптики их предвещают.", ", но видимо скоро будут."]);
				} else {
					summary = summary+rnd([', но я уверен что будут.', ', но будут.', ", но синпотики их обещают.", ", но точно будут.", ", но очевидно они выпадут."]);
				}
			}
		} else {
			summary = summary+rnd([' Есть осадки, с интенсивностью где-то ', ' Имеются осадки интенсивностью в ', " Имеются осадки с интенсивностью порядка ", " Есть осадки с интенсивностью ", " Есть осадки интенсивностью в ", " Осадки интенсивностью ", " Осадки с интенсивностью ", " Осадки "])+now.precipIntensity+' баллов.';
		}

		summary = summary+' Ветер '+now.windSpeed+' м/с.';
		summary = summary+' Давление '+now.pressure+' мм.';

		if (now.cloudCover) {
			if (now.cloudCover < 0.2) {
				summary = summary+rnd([' Небольшие облака.', ' Небо чисто.', " Небо чистое. ", " Небо синее.", " Безоблачно."]);
			} else if (now.cloudCover < 0.5) {
				summary = summary+rnd([' Немного облачно.', ' Небольшая облачность.', " Слегка облачно.", " Мало облаков"]);
			} else if (now.cloudCover < 0.7) {
				summary = summary+rnd([' Достаточно облачно.', " Весьма облачно.", " Небо почти всё в облаках.", "Небо почти укрыто облаками."]);
			} else {
				summary = summary+rnd([' Небо укрыто облаками.', " Небо всё в облаках.", " Небо всё закрыто.", "Неба не видно за облаками.", "Пасмурно."]);
			}
		}

		summary = summary+rnd([' Температура около ', ' Температура ', " ", " В среднем около", " Температура примерно ", " Температура где-то "])+f2c(now.temperature)+rnd([' градусов Цельсия', ' градусов', ' градусов по Цельсию', '°C'])

		api.print(summary, {});
		}

	if (!last_update.today) {
		forecast.get(59.95, 30.316667, function (err, res, data) {
			if (err) {
				api.print([{text:'[ERROR]', color:'#F00'}, {text:''+err}], {notify: true, sound: 'error.mp3'});
				return false;
			}
			weather(data.currently);
			cache.today = data.currently;
			last_update.today = Date.now();
		});
	} else if (Date.now() - last_update.today > 60*60*1000) {
		forecast.get(59.95, 30.316667, function (err, res, data) {
			if (err) {
				api.print([{text:'[ERROR]', color:'#F00'}, {text:''+err}], {notify: true, sound: 'error.mp3'});
				return false;
			}
			weather(data.currently);
			cache.today = data.currently;
			last_update.today = Date.now();
		});
	} else {
		weather(cache.today);
	}
};

exports.weather_raintoday = function (api, params) {

	function weather (now) {

		var summary = '';

		if (!now.precipIntensity) {
			summary = summary+rnd(['Осадков нет', 'Сейчас осадков нет', "Осадков сейчас нет", "На данный момент осадков нет", "На сей момент осадков нет", "Сейчас нет осадков", "Осадков на сей момент нет", "Осадки на данный момент отсутствуют", "Сейчас осадки отсутствуют" ,'Нет осадков', "Дождя или снега нет"]);
			if (!now.precipProbability) {
				summary = summary+rnd([' и не ожидается.', ' и не будет.', " да и не будет.", " да и не ожидается."]);
			} else {
				if (now.precipProbability < 0.2) {
					summary = summary+rnd([', но возможны, хотя и с ничтожно малой вероятностью.', ', но вероятны.', ", но могут внезапно выпасть.", ", но их вероятность отрицать не стану.", ", однако с малой вероятностью возможны.", ", однако теоритически возможны.", ", но может быть да и выпадут."]);
				} else if (now.precipProbability < 0.5) {
					summary = summary+rnd([', но, возможно, будут.', ", но возможны.", ", однако стоит их ожидать.", ", но, возможно, стоит к ним приготовиться", ", но, возможно, стоит к ним подготовиться"]);
				} else if (now.precipProbability < 0.7) {
					summary = summary+rnd([', хотя скорее всего все-же будут.', ", но я их предвижу.", ", но я чуствую их приближение.", ", но скорее всего будут.", ", но синоптики их предвещают.", ", но видимо скоро будут."]);
				} else {
					summary = summary+rnd([', но я уверен что будут.', ', но будут.', ", но синпотики их обещают.", ", но точно будут.", ", но очевидно они выпадут."]);
				}
			}
		} else {
			summary = summary+rnd([' Есть осадки, с интенсивностью где-то ', ' Имеются осадки интенсивностью в ', " Имеются осадки с интенсивностью порядка ", " Есть осадки с интенсивностью ", " Есть осадки интенсивностью в ", " Осадки интенсивностью ", " Осадки с интенсивностью ", " Осадки "])+precipIntensity+' баллов.';
		}

		api.print(summary, {});
	}


	if (!last_update.today) {
		forecast.get(59.95, 30.316667, function (err, res, data) {
			if (err) {
				api.print([{text:'[ERROR]', color:'#F00'}, {text:''+err}], {notify: true, sound: 'error.mp3'});
				return false;
			}
			weather(data.currently);
			cache.today = data.currently;
			last_update.today = Date.now();
		});
	} else if (Date.now() - last_update.today > 60*60*1000) {
		forecast.get(59.95, 30.316667, function (err, res, data) {
			if (err) {
				api.print([{text:'[ERROR]', color:'#F00'}, {text:''+err}], {notify: true, sound: 'error.mp3'});
				return false;
			}
			weather(data.currently);
			cache.today = data.currently;
			last_update.today = Date.now();
		});
	} else {
		weather(cache.today);
	}
};

exports.weather_nextday = function (api, params) {

	function weather (now) {
		var summary = '';

		if (!now.precipIntensity) {
			// повторение, чтобы была мелкая вероятность выпадения "Дождя или снега нет"
			summary = summary+rnd(['Осадков нет', 'Сейчас осадков нет', "Осадков сейчас нет", "На данный момент осадков нет", "На сей момент осадков нет", "Сейчас нет осадков", "Осадков на сей момент нет", "Осадки на данный момент отсутствуют", "Сейчас осадки отсутствуют" ,'Нет осадков', "Дождя или снега нет"]);
			if (!now.precipProbability) {
				summary = summary+rnd([' и не ожидается.', ' и не будет.', " да и не будет.", " да и не ожидается."]);
			} else {
				if (now.precipProbability < 0.2) {
					summary = summary+rnd([', но возможны, хотя и с ничтожно малой вероятностью.', ', но вероятны.', ", но могут внезапно выпасть.", ", но их вероятность отрицать не стану.", ", однако с малой вероятностью возможны.", ", однако теоритически возможны.", ", но может быть да и выпадут."]);
				} else if (now.precipProbability < 0.5) {
					summary = summary+rnd([', но, возможно, будут.', ", но возможны.", ", однако стоит их ожидать.", ", но, возможно, стоит к ним приготовиться", ", но, возможно, стоит к ним подготовиться"]);
				} else if (now.precipProbability < 0.7) {
					summary = summary+rnd([', хотя скорее всего все-же будут.', ", но я их предвижу.", ", но я чуствую их приближение.", ", но скорее всего будут.", ", но синоптики их предвещают.", ", но видимо скоро будут."]);
				} else {
					summary = summary+rnd([', но я уверен что будут.', ', но будут.', ", но синпотики их обещают.", ", но точно будут.", ", но очевидно они выпадут."]);
				}
			}
		} else {
			summary = summary+rnd([' Есть осадки, с интенсивностью где-то ', ' Имеются осадки интенсивностью в ', " Имеются осадки с интенсивностью порядка ", " Есть осадки с интенсивностью ", " Есть осадки интенсивностью в ", " Осадки интенсивностью ", " Осадки с интенсивностью ", " Осадки "])+precipIntensity+' баллов.';
		}

		summary = summary+' Ветер: '+now.windSpeed+' м/с.';
		summary = summary+' Давление: '+now.pressure+'.';

		if (now.cloudCover) {
			if (now.cloudCover < 0.2) {
				summary = summary+rnd([' Небольшие облака.', ' Небо чисто.', " Небо чистое. ", " Небо синее.", " Безоблачно."]);
			} else if (now.cloudCover < 0.5) {
				summary = summary+rnd([' Немного облачно.', ' Небольшая облачность.', " Слегка облачно.", " Мало облаков"]);
			} else if (now.cloudCover < 0.7) {
				summary = summary+rnd([' Достаточно облачно.', " Весьма облачно.", " Небо почти всё в облаках.", "Небо почти укрыто облаками."]);
			} else {
				summary = summary+rnd([' Небо укрыто облаками.', " Небо всё в облаках.", " Небо всё закрыто.", "Неба не видно за облаками.", "Пасмурно."]);
			}
		}

		summary = summary+rnd([' Температура около ', ' Температура ', " ", " В среднем около", " Температура примерно ", " Температура где-то "])+f2c(now.temperature)+rnd([' градусов Цельсия', ' градусов', ' градусов по Цельсию', '°C'])

		api.print(summary, {});
	}


	if (!last_update.nextday) {
		forecast.get(59.95, 30.316667, Math.round(Date.now()/1000)+24*60*60, function (err, res, data) {
			if (err) {
				api.print([{text:'[ERROR]', color:'#F00'}, {text:''+err}], {notify: true, sound: 'error.mp3'});
				return false;
			}
			weather(data.daily);
			cache.nextday = data.daily;
			last_update.nextday = Date.now();
		});
	} else if (Date.now() - last_update.nextday > 60*60*1000) {
		forecast.get(59.95, 30.316667, Math.round(Date.now()/1000)+24*60*60, function (err, res, data) {
			if (err) {
				api.print([{text:'[ERROR]', color:'#F00'}, {text:''+err}], {notify: true, sound: 'error.mp3'});
				return false;
			}
			weather(data.daily);
			cache.nextday = data.daily;
			last_update.nextday = Date.now();
		});
	} else {
		weather(cache.nextday);
	}
};