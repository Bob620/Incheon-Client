const config = require('./config/config.json');

const uws = require('uws'),
      promptSync = require('prompt-sync')();

const conn = new uws(`ws://${promptSync('Host: ', config.host)}`);

const data = {
	isConnected: false,
	isLoggedIn: false,
	protocol: 'none'
};

conn.on('open', async () => {
	data.isConnected = true;
});

conn.on('close', async () => {
	console.log('Connection Closed');
});

conn.on('message', async (message) => {
	message = JSON.parse(message);
	switch(message.type) {
		// All protocols support this stuff the same
		case 'protocol':
			data.protocol = message.response;

			sendMessage('auth', {
				username: promptSync('username: ', config.username),
				password: promptSync.hide('password: ', )
			});
			break;
		case 'auth':
			if (message.response.success) {
				data.isLoggedIn = true;
				console.log('Connected to Incheon');
			} else if(message.response.needs.includes('twoFactor')) {
				sendMessage('twofactor', {
					code: promptSync('twofactor authorization code: ', '')
				});
			}
			break;
		case 'message':
			console.log(message.response);
			break;
		case 'error':
			console.log(message.response);
			break;
		case 'ping':
			conn.send('pong');
			break;

		// Protocol specific commands
		default:
			switch(data.protocol) {
				case 'none':
					break;
				case 'incheon-v1':
					break;
				case 'incheon-recovery':
					switch(message) {
						case 'servererror':
							console.log(message.response);
							break;
					}
					break;
			}
			break;
	}
});

function sendMessage(type, request) {
	if (data.isConnected)
		conn.send(JSON.stringify({
			type,
			request
		}));
}