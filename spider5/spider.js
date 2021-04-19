/*jshint globalstrict: true*/
/*jshint node: true */
/*jshint esversion: 6*/
/*jshint latedef: false */
"use strict";

const request = require("request");
const fs = require("fs");
const mkdirp = require("mkdirp");
const path = require("path");
const utilities = require("./utilities");
const cmdConfig = require("./cmdconfig");
const TaskQueue = require("./taskQueue");
const validator = require("./validator");

function spiderLinks(currentUrl, body, nesting, callback) {
    if (nesting === 0)
        return process.nextTick(callback);

    const links = utilities.getPageLinks(currentUrl, body);
    if (links.length === 0)
        return process.nextTick(callback);
    let downloadQueue = new TaskQueue(cmdConfig.get("concurrency", 2));

    let completed = 0,
        hasErrors = false;
    links.forEach(link => {
        downloadQueue.pushTask(done => {
            spider(link, nesting - 1, err => {
                if (err) {
                    hasErrors = true;
                    return callback(err);
                }
                if (++completed === links.length && !hasErrors) {
                    callback();
                }
                done();
            });
        });
    });
}

function saveFile(filename, contents, callback) {
    mkdirp(path.dirname(filename), err => {
        if (err) {
            return callback(err);
        }
        fs.writeFile(filename, contents, callback);
    });
}

function download(url, filename, callback) {
    console.log(`Downloading ${url}`);
    request(url, (err, response, body) => {
        if (err) {
            return callback(err);
        }
        saveFile(filename, body, err => {
            if (err) {
                return callback(err);
            }
            console.log(`Downloaded and saved: ${url}`);
            callback(null, body);
        });
    });
}

let spidering = new Map();

function spider(url, nesting, callback) {
    if (spidering.has(url)) {
        return process.nextTick(callback);
    }
    spidering.set(url, true);

    const filename = utilities.urlToFilename(url);
    fs.readFile(filename, "utf8", function(err, body) {
        if (err) {
            if (err.code !== "ENOENT") {
                return callback(err);
            }

            return download(url, filename, function(err, body) {
                if (err) {
                    return callback(err);
                }
                spiderLinks(url, body, nesting, callback);
            });
        }

        spiderLinks(url, body, nesting, callback);

    });
}

const errors = validator.validate();
if (errors.length || cmdConfig.get("help")) {
    console.log(cmdConfig.usage);
    errors.forEach((err) => {
        console.error(err);
    });
    process.exit(errors.length);
}

spider(cmdConfig.get("url"), cmdConfig.get("nesting", 1), (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    } else {
        console.log("Download complete");
        process.exit(0);
    }
});