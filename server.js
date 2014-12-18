// Read system config from json
global.config = require('./config.json');

var app = require('./app');
var server = require('http').Server(app);
global.io = require('socket.io')(server);
global.io.on('connection', function() {
	
});
module.exports = server;