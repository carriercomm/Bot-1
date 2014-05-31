// adds following actions:
// weather_today, weather_nextday, weather_raintoday, weather_rainnextday

var Forecast = require('forecast.io');
var util = require('util');
var options = {
	APIKey: '2361fcc4262fd91178106710cdcf8029',
	requestTimeout: 1000
};

var forecast = new Forecast(options);

var weather_nextday = function (api, callback) {

	var date = new Date();
	var unix = Date.now();
	var unix_seconds = Math.floor(Date.now()/1000)+24*60*60;

	forecast.getAtTime(60, 30, unix_seconds, function (err, res, data) {
		if (err) {
			throw err;
		}
		console.log(data.daily);
	});
}

weather_nextday();