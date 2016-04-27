var express = require('express')
var router = express.Router()
var bodyParser = require('body-parser')
var path = require('path')

var fsops = require('../scripts/fsops')
var dbops = require('../scripts/dbops')
var ops = require('../scripts/ops')
var model = require('../scripts/model')

var topic = require('../scripts/topic')
var challenge = require('../scripts/challenge')
var configurations = require('../scripts/configurations')

router.get('/', function(req,res){
    challenge.length(function(len){
        topic.organizeTopics(function(data){
            res.render('index', configurations({"topics":data, "page":"manage", "colorScheme":ops.dualColor(len)}));
        })
    })
})


// bodyParser middleware
router.use(bodyParser.urlencoded({ extended: true }));

router.delete('/', function(req,res){
    var reqId = req.body.topic;
    console.log('attempting to remove a topic with _id of '+reqId);
    if (reqId){
        var formattedId = {"_id": dbops.common.formatId(reqId)};
        console.log(formattedId);
        dbops.retrieveData('topic', formattedId, function(data){
            var topicData = data[0];
            if (topicData.iconSrc) fsops.markAsDelete(topicData.iconSrc)
            dbops.operateAndReturnData('delete', 'topic', formattedId, null, function(){
                console.log(reqId+' successfully removed');
                res.status(200).end();
            })
        })
    }
})

router.post('/', function(req, res){

    if (req.body.action){
        var action = req.body.action.toLowerCase();

        if (action == "insert"){
            req.designation = "";
            if (req.body.type == "drawingTopic"){
                req.designation = "drawing";
            } else if (req.body.type == "designTopic"){
                req.designation = "design";
            } else{
                console.log('no match');
            }

            if (req.body.value && req.designation){
                dbops.common.exists('topic', {"name":req.body.value, "designation":req.designation}, function(exists){
                    if (!exists){
                        var newTopic = model.newTopic(req.body.value, req.designation);
                        dbops.operateAndReturnData('insert', 'topic', newTopic, null, function(){
                            res.status(201).json(newTopic).end();
                        })
                    } else{
                        res.status(409).json(ops.error('Conflict')).end();
                    }
                });
            }

        } else if (action == "modify"){
            if (req.body.topic && req.body.value){
                var formattedId = dbops.common.formatId(req.body.topic);
                console.log(formattedId);
                console.log(req.body.value);

                dbops.operateAndReturnData('update', 'topic', {"_id": formattedId}, null, {"$set":{"name":req.body.value}}, function(){
                    console.log(req.body.topic+' successfully updated');
                    res.status(200).json({"_id":req.body.topic, "name":req.body.value}).end();
                })
            }

        }
    }
})

module.exports = router;