(function() {
	$(document).ready(function() {
		var dom = {
			message : $('#message'),
			picture : $('#picture'),
			website : $('#website')
		};
		var resizePicture = function() {
			var css = {
				'max-height' : window.innerHeight,
				'max-width' : window.innerWidth
			};
			dom.picture.css(css);
			dom.picture.find('img').css(css);
		};
		resizePicture();
		var showPicture = function(src) {
			dom.website.hide();
			resizePicture();
			dom.picture.find('img').attr('src', src);
			dom.picture.show();
		};
		var showWebsite = function(src) {
			dom.picture.hide();
			dom.website.attr('src', src).show();
		};
		socket = io.connect('/');
		socket.on('switch-activity', function(data) {
			data = JSON.parse(data);
			if (data.type === 'picture') {
				showPicture(data.value);
			} else if (data.type === 'website') {
				showWebsite(data.value);
			}
		});

		socket.on('broadcast-message', function(data) {
			$('#message').html(data).fadeIn();
			setTimeout(function() {
				$('#message').hide();
			}, 30000);
		});

		setTimeout(function() {
			$('#message').hide();
		}, 30000);
	});
})();
