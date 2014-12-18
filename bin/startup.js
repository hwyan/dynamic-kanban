var server = require('../server');
var port = global.config.server.port || 9191;
server.listen(port);
