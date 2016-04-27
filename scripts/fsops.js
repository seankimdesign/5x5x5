var fs = require('fs');
var path = require('path');

exports.uploadPrep = function(filePath, callback) {

    var filePathParsed = path.parse(filePath);
    var pathOnly = filePathParsed.dir;
    var fileOnly = filePathParsed.name;

    _checkAndMakeDir(pathOnly, function(err){
        if (err){
            console.log(err);
        } else{
            fs.readdir(pathOnly, function(err, files){
                if (err){
                    console.log('error accessing file path');
                } else {
                    callback();
                }
            });
        }
    })
}

exports.markAsDelete = function(filePath, callback){
    var newFilePath = path.dirname(filePath)+'/deleted/'
    _checkAndMakeDir(newFilePath, function(err){
        if (err){
            console.log(err)
        } else{
            fs.rename(filePath, newFilePath+path.basename(filePath), function(err){
                if (err){
                    console.log(err)
                } else{
                    if (typeof callback == 'function') callback();
                }
            })
        }
    })
}

function _checkAndMakeDir(usePath, cb){
    fs.access(usePath, function(err){
        if (err){
            fs.mkdir(usePath, cb);
        } else{
            cb();
        }
    })
}