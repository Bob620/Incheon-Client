const colors = require('colors');

class CommandLine {
	constructor() {
		this.data = {
			currentLine: ''
		}
	}

	clearLine() {
		this.data.currentLine = '';
		this.printLine('');
	}

	requestLine(line) {
		process.stdout.write('\r');
		for (let i = 0; i < this.data.currentLine.length; i++)
			process.stdout.write(' ');
		process.stdout.write('\r');
		process.stdout.write(line.yellow);
		this.data.currentLine = line;
	}

	printLine(line) {
		process.stdout.write('\r');
		for (let i = 0; i < this.data.currentLine.length; i++)
			process.stdout.write(' ');
		process.stdout.write('\r');
		console.log(line);
		this.requestLine(this.data.currentLine);
	}
}

module.exports = new CommandLine();