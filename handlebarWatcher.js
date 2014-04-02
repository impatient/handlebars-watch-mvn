#!/usr/bin/env node
/**
 * Created by sdillender on 1/28/14.
 */

require('colors')

var handlebars = require('handlebars'), fs = require('fs'), fileTest = new RegExp("(.*)\/(.*\.html$)"),
	basename = require('path').basename;


function processTemplate(template, root, options, output) {
	console.log("Inspecting " + template);
	var path = template,
		stat = fs.statSync(path);
	if (stat.isDirectory()) {
		fs.readdirSync(template).map(function (file) {
			var path = template + '/' + file;

			if (path.indexOf('.svn') == -1 && (options.extension.test(path) || fs.statSync(path).isDirectory())) {
				processTemplate(path, root || template, options, output);
			}
		});
	} else if (options.extension.test(path)) {
		var data = fs.readFileSync(path, 'utf8');

		var hbOptions = {
		};

		// Clean the template name
		template = basename(template);
		template = template.replace(options.extension, '');

		try {
			output.push('templates[\'' + template + '\'] = template(' + handlebars.precompile(data, hbOptions) + ');\n');
		}
		catch (e) {
			console.log("Error: ".red, e.message.red);
		}

	}
}


function runHandlebars(parentDir, extension) {

	console.log(basename(parentDir));

	var extension = extension.replace(/[\\^$*+?.():=!|{}\-\[\]]/g, function (arg) {
		return '\\' + arg;
	});
	extension = new RegExp('\\.' + extension + '$');


	var output = [],
		options = {
			namespace: 'Handlebars.templates',
			extension: extension
		};

	output.push('(function() {\n');
	output.push('  var template = Handlebars.template, templates = ');
	output.push(options.namespace);
	output.push(' = ');
	output.push(options.namespace);
	output.push(' || {};\n');

	processTemplate(parentDir, options.root, options, output);

	output.push('})();');
	output = output.join('');

	var destination = parentDir + '/' + basename(parentDir) + '.js'

	console.log("Writing to " + destination);
	fs.writeFileSync(destination, output, 'utf8');


}

var onChange = function (base) {

   return function (changeType, file) {
       var filePath = base + '/' + file;
    console.log('a change event occured:', changeType,filePath);
    if (fileTest.test(filePath)) {
        if (filePath.indexOf('.svn') == -1) {

            var parent = fileTest.exec(filePath)[1];
            console.log("Parent directory is ", parent);
            fs.readdir(parent, function (err, files) {

                runHandlebars(parent, "html");

            });

        }


    }
}
};

var getDirs = function (path, memo) {

    fs.readdirSync(path).map( function(file) {

        if (file.indexOf('.svn') == -1 && fs.statSync(path + '/' + file).isDirectory()) {
            memo.push(path + '/' + file);
            getDirs(path + '/' + file,memo);
        }

    });


    return memo;
};

var todo = getDirs(process.cwd(),[]);
console.log(todo);

todo.map(function(path) {

    runHandlebars(path, "html");
    fs.watch(path, {persistent:true}, onChange(path));

});


