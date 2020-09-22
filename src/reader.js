/*** reader.js ***/

'use strict';

// required modules

// chalk - https://www.npmjs.com/package/chalk
const chalk = require('chalk');

// rss parser - https://www.npmjs.com/package/rss-parser
let Parser = require('rss-parser');
let parser = new Parser({
    timeout: 15000,
});

// create reader class
function reader(url) {

    this.url = url;
    this.feed = {};

};

// pull command can be run from the CLI and also runs on app start
reader.prototype.pull = function(callback) {

    var self = this;
    
    // method to fetch and parse the RSS feed
    parser.parseURL(this.url, function(err, feed) {
        if (err) throw err;

        // going to add the current timestap to the feed object fnar
        let d = new Date();
        let diso = d.toISOString();
        feed.date = diso;  
        self.feed = feed;
        let res = "> RSS Feed Pulled";

        callback(res);
    });
    
};

// menu command to list each rss article pulled with an index for retrieval with the read/open commands
reader.prototype.titles = function(callback) {

    let res = "";
    
    // has the feed been pulled yet?
    if (Object.keys(this.feed).length === 0 && this.feed.constructor === Object) {
        // should just replace console with a return err val
        
        res = "> No feed exists, execute 'pull' first!";
    }
    else {
        let i = 0;
        // cycle through the feed object and print out the titles, with link and published date
        this.feed.items.forEach(item => {
            i++;
            res += chalk.yellow("[" + i + "] ") + item.title + ": " + chalk.cyan(item.link) + " (" + item.pubDate + ")\n";
            
        });
    }
    
    callback(res);
};

// read an article's details: Title, pubdate, and summary
reader.prototype.read = function(args, callback) {

    let res = "";
    
    // has the feed been pulled yet?
    if (Object.keys(this.feed).length === 0 && this.feed.constructor === Object) {
        res = "> No feed exists, execute 'pull' first!";
    }
    else {

        let argcheck = true;

        // input should be only int
        let intreg = /^\d+$/;

        let index = null;

        if ((args !== undefined) && (args !== null)) {
            if ((intreg.test(args)) && (args >= 1) && (args <= this.feed.items.length)) {
                index = parseInt(args);
            }
            else {
                argcheck = false;
            }
        }
        
        // get the current item selected from the feed object
        let curItem = this.feed.items[index - 1];
        if (argcheck) {
            res += chalk.red.bold(curItem.title) + "\n";
            res += chalk.white.bold(curItem.pubDate) + "\n";
            res += chalk.white.inverse(curItem.contentSnippet) + "\n";
            res += chalk.cyan(curItem.link) + "\n";
        }
        else {
            res = "> Unknown news index, try read [int].  Check 'titles' for available indices.";
        }

    }
    
    callback(res);
    
};

module.exports = reader;