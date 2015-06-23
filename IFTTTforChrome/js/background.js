(function ($) {
	var IFTTTMenu = function () {
		var _openOptionsPage = function () {
			window.open('options.html', 'ifttt-options', 'width=500,height=350');
		}

		var _onIFTTT = function (info, tab) {
			// make sure we have secret key
			if (!localStorage['secret-key']) {
				if (confirm('You need to specify a secret key for the Maker Channel.')) {
					_openOptionsPage();	
				}

				return;
			}

			// tell content page to inject IFTTT UI
			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function (tabs) {
				chrome.tabs.sendMessage(tab.id, {
					ifttt: true,
					info: info,
					secretKey: localStorage['secret-key']
				});
			});
		}

		this.initialize = function () {
			// launch options on install
			chrome.runtime.onInstalled.addListener(_openOptionsPage);

			// create global context menu
			chrome.contextMenus.create({
				title: 'IFTTT',
				id: 'ifttt',
				contexts: [
					'image',
					'video',
					'audio',
					'link',
					'page',
					'selection'
				]
			});
			
			// add context menu callback
			chrome.contextMenus.onClicked.addListener(_onIFTTT);
		}

		this.initialize();
	}

	var foo = new IFTTTMenu();
})(jQuery);
