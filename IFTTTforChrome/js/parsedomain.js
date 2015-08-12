var ParseDomain = function (selected) {
	var $ = jQuery;
	var _selected = selected;

	this.getSrc = function () {
		var src = false;
		
		// Flickr
		if (IFTTTUtils.isDomain('flickr.com')) {
			var img = $('img.zoom-large');
			if (!img.length) img = $('img.main-photo');

			if (img.length == 1) {
				var flickrSrc = img.attr('src');
				
				// prepend protocol
				if (flickrSrc.indexOf('//') == 0) {
					flickrSrc = 'https:' + flickrSrc;
				}

				return flickrSrc;
			}

			var parent = _selected.parents('.photo-list-photo-view');
			
			if (parent.length == 1) {
				if (parent.css('background-image').indexOf('http') >= 0) {
					var str = parent.css('background-image').getUrlFromCSS();
					if (str) return str;
				}
			}
		}

		// Instagram
		if (IFTTTUtils.isDomain('instagram.com')) {
			var article = _selected.parents('article').get(0);
			var video = $('video', article);

			if (video.length == 1) {
				if (video.attr('src')) {
					return video.attr('src');
				}
			}

			var img = $('img', article);
			
			if (img.length) {
				img.each(function () {
					if ($(this).width() > 200) {
						src = $(this).attr('src');
					}
				});	
			}
		}

		// New York Times
		if (IFTTTUtils.isDomain('nytimes.com')) {
			if (_selected.siblings('img').length) {
				var img = _selected.siblings('img');

				img.each(function () {
					if ($(this).width() > 200) {
						src = $(this).attr('src');
					}
				});	
			}
		}

		// Vimeo
		if (IFTTTUtils.isDomain('vimeo.com')) {
			var container = _selected.parents('.player');

			if ($('video', container).length == 1) {
				return $('video', container).attr('src');
			}
		}

		return src;
	}

	this.initialize = function () {}	
}
