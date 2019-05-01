/*jshint globalstrict: true*/
/*jshint node: true */
/*jshint esversion: 6 */
/*jshint latedef: false */
"use strict";

const request = require("request");
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const async = require("async");
const utilities = require("./utilities");
const cmdConfig = require("./cmdconfig");
const validator = require("./validator");

function spiderLinks( currentUrl, body, nesting, callback)
{ 
	if( nesting === 0) 
		return process.nextTick( callback);
	
	const links = utilities.getPageLinks( currentUrl, body);
	if( links.length === 0) 
		return process.nextTick( callback);
	
	async.eachSeries( links, 
		function( link, callback) 
		{ 
			spider( link, nesting - 1, callback);
		},
		callback);
} 

function download( url, filename, callback)
 { 
console.log(" Downloading " + url); 
let body; 
async.series([ function( callback) 
{ 
request( url, 
	function( err, response, resBody) 
{
if( err)
  return callback( err);
 body = resBody; 
callback();
 });
 }, 
mkdirp.bind( null, path.dirname( filename)), 
function( callback) { 
fs.writeFile( filename, body, callback); } ], function( err) { 
 console.log(" Downloaded and saved: " + url); if( err) 
	return callback( err);
 callback( null, body); });
}


let spidering = new Map();
function spider(url, nesting, callback) {
  if(spidering.has(url)) {
    return process.nextTick(callback);
  }
  spidering.set(url, true);

  const filename = utilities.urlToFilename(url);
  fs.readFile(filename, "utf8", function(err, body) {
    if(err) {
      if(err.code !== "ENOENT") {
        return callback(err);
      }

      return download(url, filename, function(err, body) {
        if(err) {
          return callback(err);
        }
        spiderLinks(url, body, nesting, callback);
      });
    }

    spiderLinks(url, body, nesting, callback);
		
  });
}

if (!validator.validate())
	process.exit();

spider(cmdConfig.get("url"), cmdConfig.get("nesting",1), (err) => {
  if(err) {
    console.log(err);
    process.exit();
  } else {
    console.log("Download complete");
  }
});
