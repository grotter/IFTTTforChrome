String.prototype.escapeForSMS = function () {
	return this.replace(/‘|’/g, "'").replace(/“|”/g, '"').replace(/—|–/g, "-");
}

String.prototype.getUrlFromCSS = function () {
	return this.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
}

var IFTTTUtils = {
	isDomain: function (check) {
		return document.domain.indexOf(check) >= 0;
	},
	isIframed: function () {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	},
	getQueryString: function (variable, input) {
		if (!input) {
			input =  window.location.search;
		}

		var query = input.substring(1);
		var vars = query.split('&');
		
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			
			if (pair[0] == variable) {
				return decodeURIComponent($.trim(pair[1]));
			}
		}

		return false;
	}
};
