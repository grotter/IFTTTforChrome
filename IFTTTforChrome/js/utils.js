String.prototype.escapeForSMS = function () {
	return this.replace(/‘|’/g, "'").replace(/“|”/g, '"').replace(/—|–/g, "-");
}

String.prototype.getUrlFromCSS = function () {
	return this.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
}

var IFTTTUtils = {
	isDomain: function (check) {
		return (document.domain.indexOf(check) >= 0);
	}
};
