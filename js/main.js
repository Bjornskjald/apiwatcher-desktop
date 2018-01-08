const fs = require('fs')
const path = require('path')
const util = require('util')
const request = require('superagent/superagent')

const table = document.querySelector('#table')
const modal = {
	name: document.querySelector('#modal-name'),
	url: document.querySelector('#modal-url'),
	path: document.querySelector('#modal-path')
}

var data
const confpath = process.platform === "win32" ? path.join(process.env.appdata, 'APIWatcher', 'data.json') : path.join(require('os').homedir(), '.abucoins')
const refresh = () => {
	table.innerHTML = ''
	data.entries.forEach((entry, index) => {
		request.get(entry.url).then(res => {
			addrow(entry, index, res.body)
		}).catch(err => {
			addrow(entry, index, err.toString())
		})
	})
}

const addrow = (entry, index, result) => {
	let row = table.insertRow()
	let name = row.insertCell()
	name.innerHTML = entry.name

	let value = row.insertCell()
	//var val = byString(result, entry.path)
	var val
	try {
		val = entry.path ? eval('result.' + entry.path) : result
	} catch(e) {
		val = e.toString()
		console.error(e)
	}
	value.innerHTML = typeof val === 'string' ? val : util.inspect(val)
	
	let edit = row.insertCell()
	edit.innerHTML = `<a href="#!"><i data-id="${index}" class="material-icons">edit</i></a>`
	edit.addEventListener('click', (ev) => {
		var entry = data.entries[ev.target.dataset.id];
		['name', 'url', 'path'].forEach(e => {modal[e].value = entry[e]})
		var button = document.querySelector('#modal-button')
		button.innerHTML = 'Save'
		button.href = `javascript:save(${ev.target.dataset.id})`
		M.Modal.init(document.querySelector('#modal')).open()
	})
	
	let remove = row.insertCell()
	remove.innerHTML = `<a href="#!"><i data-id="${index}" class="material-icons">delete</i></a>`
	remove.addEventListener('click', (ev) => {
		console.log(ev.target.dataset.id)
		ev.path[3].remove()
		data.entries.splice(ev.target.dataset.id, 1)
		saveconf()
	})
}

const showmodal = () => {
	[modal.name, modal.url, modal.path].forEach(e => {e.value = ''})
	M.Modal.init(document.querySelector('#modal')).open()
}

const add = () => {
	data.entries.push({
		name: modal.name.value,
		url: modal.url.value,
		path: modal.path.value
	})
	saveconf()
}

const save = (id) => {
	var entry = data.entries[id];
	['name', 'url', 'path'].forEach(e => {entry[e] = modal[e].value})
	refresh()
	var button = document.querySelector('#modal-button')
	button.innerHTML = 'Add'
	button.href = `javascript:add()`
	saveconf()
}

const saveconf = () => { fs.writeFileSync(confpath, JSON.stringify(data), 'utf8') }

document.querySelector('footer').children[0].children[0].innerHTML += '; version: ' + require('./package.json').version
try {
	data = JSON.parse(fs.readFileSync(confpath, 'utf8'))
} catch(err) {
	data = {
		entries: [
			{ name: 'Placeholder API', url: 'https://jsonplaceholder.typicode.com/posts/1', path: 'title' }
		]
	}
	saveconf()
}
refresh()

/*
const byString = (o, s) => {
	if (s === '' || typeof s === 'undefined') {
		return o
	}
    var a = s.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.')
    for (var i = 0, n = a.length; i < n; ++i) {
        if (a[i] in o) { o = o[a[i]] } else { return }
    }
    return o
}
*/