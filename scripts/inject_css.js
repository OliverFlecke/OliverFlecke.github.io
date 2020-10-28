#!/usr/bin/env node

var fs = require('fs');
var filename = process.argv[2];

fs.readFile('manifest.json', 'utf8', (err, data) => {
	if (err) {
		console.error(err);
		return;
	}

	var manifest = JSON.parse(data);
	var cssFilename = manifest['main.css'];
	console.log(`Hashed css name: ${cssFilename}`);

	fs.readFile(filename, 'utf8', function (err, data) {
		if (err) {
			return console.log(err);
		}
		var result = data.replace(/css\/main\..*\.css/g, `css/${cssFilename}`);

		fs.writeFile(filename, result, 'utf8', function (err) {
			if (err) return console.log(err);
		});
	});
});
