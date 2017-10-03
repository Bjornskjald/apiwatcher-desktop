const fs = require('fs')
const path = require('path')
const confpath = process.platform == "win32" ? path.join(process.env.appdata, 'APIWatcher', 'data.json') : path.join(require('os').homedir(), '.abucoins')

$(() => {
	document.querySelector('footer').children[0].children[0].innerHTML += '; version: ' + require('./package.json').version
	try {
		data = JSON.parse(fs.readFileSync(confpath, 'utf8'))
	} catch(err) {
		data = {}
	}
});
