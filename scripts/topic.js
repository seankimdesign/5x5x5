var dbops = require('../scripts/dbops');
var model = require('../scripts/model');

exports.organizeTopics = function(callback){

    var output = {};

    dbops.retrieveData('topic', {}, {'name':1}, function(data){

        for (var i = 0; i < data.length; i++) {
            if (data[i].iconSrc) data[i].hasIcon = true;
            if (data[i].categories &&
                Array.isArray(data[i].categories)){
                data[i].count = data[i].categories.length
            } else{
                data[i].count = 0;
            }
            output[data[i].designation] = output[data[i].designation] || [];
            output[data[i].designation].push(data[i])
        }
        callback(output);

    })

}