// Retrieve
var MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server,
	db;


// Test Connect to the db
/*
MongoClient.connect("mongodb://localhost:27017/socialNetworkDb", function(err, db) {
  if(err) { return console.dir(err); }

  var collection = db.collection('access');
  var accessLinkedIn = {'accessToken ':'abcdefgh'};
  
  collection.insert(accessLinkedIn, {w:1}, function(err, result) {});
  
});*/


var mongoClient = new MongoClient(new Server('localhost', 27017));
mongoClient.open(function(err, mongoClient) {
	db = mongoClient.db('socialNetworkDb');
	db.collection('access', {strict:true}, function(err, collection) {
        if (err) {
            console.log("The 'access' collection doesn't exist. Creating it....");
        }
    });
});

exports.findByTokenNetwork = function(socialNetwork, callback) {

	var collection = db.collection('access');

	console.log('findByTokenNetwork : ' + socialNetwork);

	collection.find({'_id' : socialNetwork}).toArray(function(err, items) {
		console.log(items);
		callback(items);		
	});	
}; 

exports.insertAccessToken = function(accessToken) {
	console.log("Inserting accessToken : " + JSON.stringify(accessToken));

	var collection = db.collection('access');
    
    collection.save(accessToken, {w:1}, function(err, result) {});	
};


