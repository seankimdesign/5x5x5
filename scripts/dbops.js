// Certain databse related operations
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/drawapp';

var connectDB = function(callback){
    MongoClient.connect(url, function (err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        console.log('db connected');
        callback(db);
      }
    });
}

exports.retrieveData = function(collectionName, filterObj, sortObj, callback){
    connectDB(function(db){
        var onCollection = db.collection(collectionName);
        var collectionObj = onCollection.find(filterObj)
        if (sortObj && typeof sortObj == 'object'){
            collectionObj.sort(sortObj)
        } else if (typeof sortObj == 'function'){
            callback = sortObj
        }
        collectionObj.toArray(function(err, doc){
            if (err){
                console.log(err);
            } else if (doc){
                if (typeof callback == 'function') callback(doc);
            }
            db.close();
            console.log('closing DB');
        });
    });
}

// Needs to be refactored. Too much params / params that require use of null
exports.operateAndReturnData = function(operation, collectionName, filterObj, returnFilterObj, updateOptions, callback){

    console.log('operation start');

    var opsList = {
        "insert":"insert",
        "delete":"deleteOne",
        "update":"updateOne",
        "upsert":"updateOne"
    }
    var onOps = opsList[operation.toLowerCase()];

    // crafting the array of arguments to be applied to a chosen operation
    var argsArray = [filterObj];

    if (onOps == "insert" || onOps == "deleteOne"){
        if (typeof updateOptions == "function") callback = updateOptions;
    } else{
        if (operation.toLowerCase() == "upsert"){
            if (updateOptions && typeof updateOptions == "object"){
                updateOptions.upsert = true;
            } else{
                updateOptions = {"upsert":true};
            }
        }
        argsArray.push(updateOptions);
    }

    // The operation-level callback
    argsArray.push(function(err, result){
        if (err){
            console.log(err);
            db.close();
        } else if (returnFilterObj) {
            _returnData(onCollection, result, returnFilterObj, function(data){
                console.log(onOps+' operation complete - data returned - db closing');
                db.close();
                if (typeof callback == 'function') callback(data);
            });
        } else{
            console.log(onOps+' operation complete - no data return - db closing');
            db.close();
            if (typeof callback == 'function') callback();
        }
    });

    // perform the operation with the array of arguments
    connectDB(function(db){
        this.db = db;
        this.onCollection = db.collection(collectionName);
        onCollection[onOps].apply(onCollection, argsArray);
    });
}


function _returnData(onCollection, result, returnFilterObj, callback){
    if (result.result.ok){
        onCollection.find(returnFilterObj).toArray(function(err, doc){
            if (err){
                console.log(err)
            } else if (doc){
                callback(doc);
            }
        });
    }
}

var common = {};

common.formatId = function(originalId){
    return new mongodb.ObjectId(originalId.toString());
}

common.exists = function(collection, filter, cb){
    exports.retrieveData(collection, filter, function(data){
        cb(data.length > 0);
    })
}

exports.common = common;