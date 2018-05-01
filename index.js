const config = require('./config/config.json'),
      CommandLine = require('./util/commandline');

const uws = require('uws'),
      prompt = require('prompt-promise');

const data = {
	isConnected: false,
	isLoggedIn: false,
	protocol: 'none'
};

CommandLine.requestLine('Host: ');
prompt('').then((host) => {
	const conn = new uws(`ws://${host}`);

	conn.on('open', async () => {
		data.isConnected = true;
	});

	conn.on('close', async () => {
		CommandLine.clearLine();
		CommandLine.printLine('Connection Closed');
		console.log('\n');
		process.exit(0);
	});

	conn.on('message', async message => {
		message = JSON.parse(message);
		switch(message.type) {
			// All protocols support this stuff the same
			case 'protocol':
				data.protocol = message.response;


				CommandLine.requestLine('username: ');
				const username = await prompt('');

				CommandLine.requestLine('password: ');
				const password = await prompt.password('');

				sendMessage('auth', {
					username,
					password
				});

				CommandLine.printLine('Logging in...');
				break;
			case 'auth':
				if (message.response.success) {
					data.isLoggedIn = true;
					if (data.protocol.startsWith('incheon-v')) {
						CommandLine.printLine('Logged into Incheon');
						await promptLoop();
					} else {
						CommandLine.printLine('Logged into Incheon-Recovery');
						await promptLoop();
					}
				} else if(message.response.needs.includes('twoFactor')) {

					CommandLine.requestLine('twofactor authorization code: ');
					const code = await prompt('');

					sendMessage('twofactor', {
						code
					});
				}
				break;
			case 'message':
				CommandLine.printLine(message.response);
				CommandLine.printLine('');
				break;
			case 'error':
				CommandLine.printLine(message.response);
				break;
			case 'ping':
				sendMessage('pong', {});
				break;
			case 'pong':
				CommandLine.printLine('pong');
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
								CommandLine.printLine(message.response);
								break;
						}
						break;
				}
				break;
		}
	});

	async function promptLoop() {
		if (data.isLoggedIn) {
			if (data.protocol.startsWith('incheon-v')) {
				CommandLine.requestLine('Incheon> ');
				await runCommand(await prompt(''));
			} else {
				CommandLine.requestLine('Recovery> ');
				await runCommand(await prompt(''));
			}
		}
	}

	async function runCommand(command) {
		command = command.split(' ');
		if (command[0] === 'exit') {
			conn.close();
		} else {
			sendMessage(command.shift(), command.join(' '));
			await promptLoop();
		}
	}

	function sendMessage(type, request) {
		if (data.isConnected)
			conn.send(JSON.stringify({
				type,
				request
			}));
	}
});