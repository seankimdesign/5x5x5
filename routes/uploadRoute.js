var express = require('express')
var router = express.Router()
var busboy = require('connect-busboy')
var fs = require('fs')
var path = require('path')

var fsops = require('../scripts/fsops')
var dbops = require('../scripts/dbops')
var model = require('../scripts/model')

var challenge = require('../scripts/challenge')

var uploadPath = './uploads/'

var subPaths = {
    uploadEntry: "entries/"
}

var filePrefix = {
    uploadEntry: "/ent_"
}

var nameFnWrap = function(){
    var count = 0
    return function(reset){
        if (reset) count = 0
        count++
        var cstr = count.toString()
        while (cstr.length < 6){
            cstr = "0"+cstr
        }
        return "image_"+cstr
    }
}

var getUploadPath = nameFnWrap();

router.use(busboy());

router.use('/', function(req,res,next){

    if (req.method == "POST"){
        console.log('pre-prep');
        fsops.uploadPrep(uploadPath, next);
    } else{
        console.log('Invalid Attempt');
    }

})

router.post('/', function(req, res){

    var fileData = {}

    req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
        fileData.id = value
    });

    req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        if (subPaths.hasOwnProperty(fieldname)){
            var uploadName = getUploadPath()+path.extname(filename);
            var uploadFullPath = uploadPath+subPaths[fieldname]+uploadName;
            fileData.type = fieldname
            fileData.path = uploadFullPath
            fsops.uploadPrep(uploadFullPath, function(){
                file.pipe(fs.createWriteStream(uploadFullPath));
            })
        } else{
            console.log('invalid upload attempt')
            file.resume();
        }
    })

    req.busboy.on('finish', function(){
        console.log('req busboy on finish');

        var newFilePath = path.dirname(fileData.path)+(filePrefix[fileData.type])+fileData.id+path.extname(fileData.path);

        fs.rename(fileData.path, newFilePath, function(err){
            if (err){
                console.log(err)
            } else{
                if (fileData.type == "uploadIcon") registerIcon();
                if (fileData.type == "uploadEntry") registerEntry();
            }
        })

        function registerIcon(){

            var idObj = {_id: dbops.common.formatId(fileData.id)};
            dbops.operateAndReturnData('update', 'topic', idObj, null, {"$set":{"iconSrc":newFilePath}}, function(){
                res.status(201).json({path: newFilePath});
            })

        }

        function registerEntry(){

            challenge.getCurrentChallenge(function(parentData){
                var idObj = {_id: parentData._id};
                var curEntries = parentData.entries;
                var newEntry = model.newEntry(fileData.name, newFilePath, fileData.detail, parentData._id, curEntries.length);
                curEntries.push(newEntry);

                dbops.operateAndReturnData('update', 'challenge', idObj, null, {$set:{"entries":curEntries}}), function(){

                    var returnObj = {"entries": curEntries}
                    if (curEntries.length >= 5){

                    }
                    res.status(201).json(returnObj);
                }
            });
        }
    })

    req.pipe(req.busboy)
})

module.exports = router;