exports.merge = function (o1, o2) {
	if (Array.isArray(o1) && Array.isArray(o2)) {
		return o1.concat(o2);
	} else if (typeof o1 === 'object' && o1 !== null && typeof o2 === 'object' && o2 !== null) {
		for (var prop in o2) {
			if (o2.hasOwnProperty(prop)) {
				o1[prop] = exports.merge(o1[prop], o2[prop]);
			}
		}
		return o1;
	} else {
		// o2 ~ string, num, bool, null, undefined || typeof o2 !== typeof o1
		return o2;
	}
}

/// @constant
var DEBUG_ENABLED = true;

/// @constant
var ERROR_CODES = {
	4001: "NETWORK:UNKNOWN_DEVICE",
	4002: "NETWORK:ALREADY_CONNECTED",
	4101: "FS:COULD_NOT_ACCESS_FILE",
	4102: "FS:FILE_DOES_NOT_EXISTS",
}

exports.error = function (error, code) {
	if (error) {
		console.log('[ERROR]', ERROR_CODES[code]);
		throw error;
		process.exit(1);
	}
}

exports.debug = function (message) {
	if (DEBUG_ENABLED) {
		console.log('[DEBUG]', message)
	}
}