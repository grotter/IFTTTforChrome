(function ($) {
	var Options = function () {
		var _onSubmit = function () {
			var secretKey = $.trim($('#secret-key').val());
			
			if (!secretKey) {
				alert('Please specify a secret key.');
			} else {
				$('#options').submit(false);
				$('#options').addClass('submitting');

				localStorage['secret-key'] = $.trim($('#secret-key').val());
				
				$('iframe').css('height', '90px');
				$('#options').hide();
				$('#recipes').show();	
			}

			return false;
		}

		this.initialize = function () {
			if (localStorage['secret-key']) {
				$('#secret-key').val(localStorage['secret-key']);
			}

			$('#options').on('submit', _onSubmit);
		}

		this.initialize();
	};

	$(document).ready(function () {
		var foo = new Options();
	});
})(jQuery);
