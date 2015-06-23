(function ($) {
	String.prototype.escapeForSMS = function () {
		return this.replace(/‘|’/g, "'").replace(/“|”/g, '"').replace(/—|–/g, "-");
	}

	String.prototype.getUrlFromCSS = function () {
		return this.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
	}

	var IFTTTMenu = function () {
		var _selected;
		var _selectEvent;
		var _secretKey;
		var _popup;
		var _popupId = 'ifttt-chrome-popup';
		var _debug = false;
		var _request;
		var _successTimeout;

		var _togglePopup = function (boo) {
			if (!_popup) return;

			_popup.attr('class', '');
			_popup.attr('style', '');

			if (boo) {
				_popup.show();

				_popup.css({
					top: _selectEvent.pageY + 'px',
					left: _selectEvent.pageX + 'px'
				});

				var top = _selectEvent.pageY;
				if (_popup.is(':off-bottom')) top -= _popup.outerHeight(true);

				var left = _selectEvent.pageX;
				if (_popup.is(':off-right')) left -= _popup.outerWidth(true);

				_popup.css({
					top: top + 'px',
					left: left + 'px'
				});
			} else {
				_popup.hide();
			}
		}

		var _onMediaError = function () {
			alert('Your selection does not appear to contain a valid media path.');
		}

		var _getUrl = function (action) {
			return 'https://maker.ifttt.com/trigger/chrome-' + action + '/with/key/' + _secretKey;
		}

		var _doIFTTTRequest = function (action, value1) {
			_popup.addClass('sending-request');

			// IFTT doesn't respond with JSON, so inject a container.
			// @todo
			// timeout error
			var container = $('<img />');

			container.css({
				position: 'absolute',
				width: '500px',
				height: '500px',
				left: '-99999px'
			});
			
			container.on('load error', function () {
				if (!_debug) {
					$(this).remove();
				}

				$('ul', _popup).html('<li class="success">Success!</li>');
				
				if (_successTimeout) clearTimeout(_successTimeout);
				
				_successTimeout = setTimeout(function () {
					_togglePopup(false);
				}, 1500);
			});

			var src = _getUrl(action) + '?value1=' + encodeURIComponent(value1);

			container.attr('src', src);
			$('body').append(container);
		}

		var _onSMSLink = function () {
			var str = _request.info.linkUrl;
			if (_request.info.selectionText && _request.info.selectionText != str) str += ' | ' + _request.info.selectionText.escapeForSMS();
			_doIFTTTRequest('sms', str);
		}

		var _onSMSSelection = function () {
			var str = _request.info.selectionText.escapeForSMS();
			if (_request.info.pageUrl) str += ' | via ' + _request.info.pageUrl;
			_doIFTTTRequest('sms', str);
		}

		var _onSMSPage = function () {
			var str = _request.info.pageUrl;
			
			if ($('head > title').length) {
				str += ' | ' + $.trim($('head > title').text());
			}

			_doIFTTTRequest('sms', str);
		}

		var _onDropbox = function () {
			var src = _getMediaSrcUrl();

			if (src) {
				_doIFTTTRequest('save-media-to-dropbox', src);
			} else {
				_onMediaError();
			}
		}

		var _getMediaSrcUrl = function () {
			var src = false;
			var isMedia = (_selected.attr('src') || _request.info.srcUrl);
			
			if (isMedia) {
				src = _selected.attr('src');

				if (_request.info.srcUrl) {
					src = _request.info.srcUrl;
				}
			} else {
				// super-brittle special handling for flickr
				if (document.domain.indexOf('flickr.com') >= 0) {
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

				// super-brittle special handling for instagram
				if (document.domain.indexOf('instagram.com') >= 0) {
					var video = $('video', _selected.parents('article').get(0));

					if (video.length == 1) {
						if (video.attr('src')) {
							return video.attr('src');
						}
					}

					if (_selected.siblings('img').length) {
						var img = _selected.siblings('img');

						img.each(function () {
							if ($(this).width() > 200) {
								src = $(this).attr('src');
							}
						});	
					}
				}
			}

			return src;
		}

		var _onPopupSelect = function (e) {
			switch ($(this).data('action')) {
				case 'dropbox-save-media':
					_onDropbox();
					break;
				case 'sms-link':
					_onSMSLink();
					break;
				case 'sms-selection':
					_onSMSSelection();
					break;
				case 'sms-page':
					_onSMSPage();
					break;
			}

			return false;
		}

		var _insertTip = function (request) {
			if (!_selected) return;

			_request = request;			
			
			$('a', _popup).off('click');
			_popup.empty();
			
			var ul = $('<ul />');
			var src = _getMediaSrcUrl();
			
			if (src) {
				// add media option
				ul.append('<li class="dropbox"><a data-action="dropbox-save-media" href="#">Save Media to Dropbox</a></li>');
			}			

			if (request.info.linkUrl) {
				// add link option
				ul.append('<li class="sms"><a data-action="sms-link" href="#">Send Link to SMS</a></li>');
			}

			if (request.info.selectionText) {
				// add selection option
				ul.append('<li class="sms"><a data-action="sms-selection" href="#">Send Selection to SMS</a></li>');
			}

			if (!request.info.linkUrl && request.info.pageUrl) {
				// add page link option
				ul.append('<li class="sms"><a data-action="sms-page" href="#">Send Page to SMS</a></li>');
			}

			$('a', ul).on('click', _onPopupSelect);

			ul.css({
				'backgroundImage': 'url(' + chrome.extension.getURL('icons/ifttt.svg') + ')'
			});

			_popup.append(ul);
			_togglePopup(true);
		}

		var _cacheAssets = function () {
			// cache the popup logo
			var img = $('<img src="' + chrome.extension.getURL('icons/ifttt.svg') + '" />');
			
			img.css({
				position: 'absolute',
				left: '-999999999px'
			});

			$('body').append(img);
		}

		this.initialize = function () {
			_cacheAssets();			
			
			// create and insert popup
			_popup = $('<div />');
			_popup.attr('id', _popupId);
			$('body').append(_popup);

			// track current selection
			$(document).on('contextmenu', function (e) {
				_selected = $(e.target);
				_selectEvent = e;
			});

			// listen for context menu
			chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
				if (request.secretKey) {
					_secretKey = request.secretKey;
				}

				if (request.ifttt) {
					_insertTip(request);	
				}
			});

			// close popup
			$(document).on('mousedown', function (e) {
				if (!$(e.target).closest('#' + _popupId).length) {
			        if (_popup.is(':visible')) {
			        	_togglePopup(false);
			        }
			    }
			});

			$(window).on('scroll', function (e) {
				if (_popup.is(':visible')) {
		        	_togglePopup(false);
		        }
			});
		}

		this.initialize();
	}

	var foo = new IFTTTMenu();
})(jQuery);
