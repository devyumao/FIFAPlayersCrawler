var fs = require('fs');
var $ = require('jquery');
var path = require('path');

var fileType = 'json';
var domain = 'http://sofifa.com';
var pagesAmount = 333;

var mkdirs = function(dirpath, mode, callback) {
	mode = mode || 0755;
    callback = callback || function(){};
    fs.exists(dirpath, function(exists) {
        if(exists) {
            callback(dirpath);
        } else {
            mkdirs(path.dirname(dirpath), mode, function(){
                fs.mkdir(dirpath, mode, callback);
            });
        }
    });
};

