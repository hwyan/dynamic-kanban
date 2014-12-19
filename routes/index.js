var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.render('index', {
		title : 'Dynamic Kanban',
		currentActivity : global.currentActivity,
		currentMessage : global.currentMessage
	});
});

router.get('/broadcast', function(req, res) {
	res.render('broadcast', {
		title : 'Broadcast Message'
	});
});

router.post('/message', function(req, res) {
	global.io.emit('broadcast-message', req.body.message);
	global.currentMessage = req.body.message;
	res.send('ok');
});

module.exports = router;
