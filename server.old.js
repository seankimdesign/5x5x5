//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');
var express = require('express');
var app = express();
var adaro = require('adaro');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/drawapp';

// below three lines set up the rendering engine as dust
app.engine('dust', adaro.dust());
app.set('view engine', 'dust');
app.set('views', __dirname+'/templates');

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
	console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
	//HURRAY!! We are connected. :)
	console.log('Connection established to', url);

	var entryCol = db.collection('entry');
	var entries = entryCol.find({"age":{"$lt":30}}).toArray(function(err, doc){

		var records = [];

		if (err){

			console.log(err)

		} else if (doc){

			console.log(doc);

			db.close();

			app.get('/', function(req,res){
				res.render('index', {"rec":doc})
			}).listen(8080);
		}
	});
  }
});
