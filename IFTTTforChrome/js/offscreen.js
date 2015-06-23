// @see
// https://gist.github.com/claviska/7240757
(function($) {
	$.extend($.expr[':'], {
		'off-top': function(el) {
			return $(el).offset().top < $(window).scrollTop();
		},
		'off-right': function(el) {
			return $(el).offset().left + $(el).outerWidth() - $(window).scrollLeft() > $(window).width();
		},
		'off-bottom': function(el) {
			return $(el).offset().top + $(el).outerHeight() - $(window).scrollTop() > $(window).height();
		},
		'off-left': function(el) {
			return $(el).offset().left < $(window).scrollLeft();
		}
	});
})(jQuery);
