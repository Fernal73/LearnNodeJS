/*jshint globalstrict: true*/
/*jshint node: true */

/*jshint globalstrict: true*/
/*jshint node: true */

"use strict";
const cmdOptions = [{
        name: 'help',
        description: 'Display usage guide.',
        alias: 'h',
        type: Boolean,
        group: 'main'
    },
    {
        name: 'debug',
        description: 'Set debug mode.',
        alias: 'd',
        type: Boolean,
        group: 'main'
    },
    {
        name: 'nesting',
        type: Number,
        alias: 'n',
        group: 'main',
        description: 'Depth to which the starting url is to be traversed'
    },
    {
        name: 'concurrency',
        type: Number,
        alias: 'c',
        group: 'main',
        description: 'Number of concurrent connections'
    },
    {
        name: 'url',
        type: url => fullURL(url),
        alias: 'u',
        defaultOption: true,
        group: 'main',
        description: 'Web url to be traversed'
    }
]

function fullURL(url) {
    if (!url.startsWith('http'))
        return 'http://' + url;
    return url;
}

const sections = [{
        header: 'Webcrawler app',
        content: 'Crawls the url provided and downloads page links recursively to the nesting level specified.'
    },
    {
        header: 'Main options',
        optionList: cmdOptions,
        group: ['main']
    },
    {
        header: 'Misc',
        optionList: cmdOptions,
        group: '_none'
    }
]

var config = require('config');
const commandLineArgs = require('command-line-args');
const options = commandLineArgs(cmdOptions);
const commandLineUsage = require('command-line-usage');
const usage = commandLineUsage(sections);
// The command line options
module.exports.options = options;
// The config file options
module.exports.config = config;

module.exports.usage = usage;
// return config values with command line values overriding configuration file values
module.exports.get = function getValue(key, defaultValue) {
    if (key in options['_all']) {
        return options['_all'][key];
    }
    if (config.has(key)) {
        return config.get(key);
    }
    return (defaultValue === undefined) ? null : defaultValue;
}
