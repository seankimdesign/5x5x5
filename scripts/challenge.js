var dbops = require('../scripts/dbops');
var model = require('../scripts/model');

function _nextCategory(lastId, list){
    var segregate = {}
    var categoryList = []
    var curCategory = ""

    for (var i = list.length - 1, inGroup; i >= 0; i--) {
        var onDesignation = list[i].designation;
        segregate[onDesignation] = segregate[onDesignation] || []
        segregate[onDesignation].push(list[i])

        if (!~categoryList.indexOf(onDesignation)) categoryList.push(onDesignation)

        if (list[i]._id.toString() == lastId){
            curCategory = list[i].designation;
        }
    }
    categoryList.sort(function(a,b){
        if (a > b) return 1
        if (a < b) return -1
        return 0
    })

    var curDesPos = categoryList.indexOf(onDesignation)+1;
    if (curDesPos >= categoryList.length-1) curDesPos = 0;

    return _sortByArrayLength(segregate[categoryList[curDesPos]], 'challenges')
}

function _sortByArrayLength(objList, arrayName){
    console.log(objList)
    return objList.sort(function(a,b){ return a[arrayName].length - b[arrayName].length})
}

function _newChallengeOperation(topicid, callback){
    var idObj = {"_id":dbops.common.formatId(topicid)}
    exports.getTopic(topicid, function(curTopic){
        dbops.operateAndReturnData('insert', 'challenge', model.newChallenge(topicid), {topic:topicid}, function(curChallenge){
            curTopic.challenges.push(curChallenge._id);
            dbops.operateAndReturnData('update', 'topic', idObj, null, {"$set":{"challenges":curTopic.challenges}}, function(){
                callback(curChallenge)
            })
        })
    })
}

function _closeChallenge(id, callback){
    var idObj = {"_id":dbops.common.formatId(id)}
    dbops.operateAndReturnData('update', 'challenge', idObj, null, {"$set":{"isCurrent":false, "dateClosed":new Date()}}, callback);
}

exports.getCurrentChallenge = function(callback){

    console.log('in getCurrentChallenge')

    dbops.retrieveData('challenge', {'isCurrent':true}, function(data){
        console.log(data)
        callback(data[0])
    });
}

exports.getTopic = function(topicId, callback){
    dbops.retrieveData('topic', {'_id': topicId}, function(data){
        callback(data[0])
    });
}

exports.assignNewChallenge = function(lastChallenge, lastTopic, callback){

    console.log('in assignNewChallenge')
    console.log(lastChallenge + ' / ' + lastTopic)

    if (lastChallenge){
        _closeChallenge(lastChallenge, setNewChallenge)
    } else{
        setNewChallenge()
    }

    function setNewChallenge(){

        console.log('in assignNewChallenge - setNewChallenge')

        dbops.retrieveData('topic', {}, function(list){
            var topicsList = _nextCategory(lastTopic, list);
            // choose a random topic from the top 25% least popular topics
            var getRange = Math.floor(Math.random()*topicsList.length/4)

            _newChallengeOperation(topicsList[getRange]._id, function(challenge){
                callback(challenge);
            });

        })
    }


}

exports.insertAnyChallenge = function(callback){
    dbops.retrieveData('topic', {}, function(data){
        if (data.length){
            dbops.operateAndReturnData('insert', 'challenge', model.newChallenge(data[0]._id), null, callback)
        } else{
            console.log('No topic found - challenge cannot be inserted')
        }
    });
}

exports.insertAnyEntry = function(callback){

    console.log('insertAnyEntry called')

    exports.getCurrentChallenge(function(data){
        console.log('post getCurrentChallenge')
        var curEntries = data.entries;
        if (curEntries.length < 5){
            curEntries.push(model.newEntry("Cousin", "", data._id, "Lorem ipsum dolor amit", curEntries.length))
            console.log('Inserting Entry')
            var idObj = {"_id":dbops.common.formatId(data._id)}
            dbops.operateAndReturnData('update', 'challenge', idObj, null, {"$set":{"entries":curEntries}}, callback)
        } else{
            console.log('Entry full');
        }
    })
}

exports.length = function(callback){
    dbops.retrieveData('challenge', {}, function(data){
        callback(data.length);
    })
}

exports.organizeChallenges = function(callback){

    dbops.retrieveData('challenge', {}, {'dateCreated':-1}, function(chData){

        console.log('retrieving challenges')

        if (!chData.length) exports.assignNewChallenge(null, null, function(){})

        dbops.retrieveData('topic', {}, function(tpData){

            console.log('retrieving topic')

            var requiresNew = [];
            var curFound = 0;

            for (var i = chData.length - 1; i >= 0; i--) {
                var id = chData[i].topic

                if (id){
                    for (var j = tpData.length - 1; j >= 0; j--) {
                        if (tpData[j]._id.toString() == id){
                            chData[i].designation = tpData[j].designation
                            chData[i].name = tpData[j].name
                            chData[i].iconSrc = tpData[j].iconSrc
                        }
                    }

                    if (chData[i].isCurrent){
                        curFound++
                        if (chData[i].entries.length >= 5){
                            requiresNew = [chData[i]._id, id]
                            _closeChallenge(chData[i]._id, resolveChallenge)
                        }
                    }

                } else{
                    console.log('Faulty data - id not found')
                    return null
                }
            }

            if (!curFound){
                chData.sort(function(a,b){
                    return b.dateCreated - a.dateCreated
                })
                requiresNew = [chData[0]._id, chData[0].topic]

                _closeChallenge(chData[0]._id, resolveChallenge)
            } else{
                resolveChallenge()
            }

            function resolveChallenge(){
                if (requiresNew.length){
                console.log('requires new found')
                exports.assignNewChallenge(requiresNew[0], requiresNew[1], function(newChallenge){
                    chData.push(newChallenge);
                    callback(chData)
                });
                } else{
                    console.log('no need to extend');
                    callback(chData)
                }
            }
        })
    });
}