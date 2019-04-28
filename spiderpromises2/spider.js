/*jshint globalstrict: true*/
/*jshint node: true */
/*jshint esversion: 6 */
/*jshint latedef: false */
"use strict";

var Promise = require('bluebird');
var utilities = require('./utilities');
var request = utilities.promisify(require('request'));
var mkdirp = utilities.promisify(require('mkdirp'));
var fs = require('fs');
var readFile = utilities.promisify(fs.readFile);
var writeFile = utilities.promisify(fs.writeFile);


const path = require('path');
const cmdConfig = require('./cmdconfig');
const validator = require('./validator');
const debug = require('debug')('spider');
debug.enabled = cmdConfig.get('debug', false);

function download(url, filename) {
    console.log('Downloading ' + url);
    var body;
    return request(url).
    then(function(results) {
        body = results[1];
        return mkdirp(path.dirname(filename));
    }).
    then(function() {
        return writeFile(filename, body);
    }).
    then(function() {
        console.log('Downloaded and saved: ' + url);
        return body;
    });
}

function spiderLinks(currentUrl,body,nesting) { 
	if( nesting === 0)
		return Promise.resolve();
	var links = utilities.getPageLinks(currentUrl, body);
	var promises = links.map(function(link)
	{
		return spider( link, nesting - 1);
	});
	return Promise.all(promises);
}

function spider( url, nesting) 
{ 
	var filename = utilities.urlToFilename(url); return readFile( filename, 'utf8').
		then( function( body) 
			{ 
				return spiderLinks( url, body, nesting);}, 
			function( err) { 
				if( err.code !== 'ENOENT') 
					throw err;
				return download(url,filename).then(function(body) 
					{ 
						return spiderLinks( url, body, nesting); 
					});
		}
	);
}

if (!validator.validate())
    process.exit();

spider(cmdConfig.get('url'),cmdConfig.get('nesting',1)).
	then( function() {
		console.log('Download complete'); }).catch( function( err) 
			{ console.log( err); 
}); 
