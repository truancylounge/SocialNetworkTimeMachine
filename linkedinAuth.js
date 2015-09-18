
var express = require('express');
var app = express();

var mongo = require('./mongodb');

var request = require('request');

var API_KEY = 'bfmp2ib63af4';
var API_SECRET = 'nW0PfYgt3Kl0hWBc';
var REDIRECT_URL = 'http://localhost:1006/accept';
var STATE = 'BOMBOMBOMBHAMBHAMBHAMbombombombhambhambham';
var SCOPE = ['r_fullprofile', 'r_emailaddress', 'r_network', 'rw_groups'];

app.get('/test', function(req, res) {
	res.send([{name : 'Lalith'}, {profession: 'Software Engineer'}]);
});

app.get('/authorize', function(req, res) {

	var path = "https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=" + 
				API_KEY +"&scope=" + SCOPE +"&state=" + STATE + "&redirect_uri=" + REDIRECT_URL;
	console.log("Calling redirect with path : " + path);

	res.redirect(path);

});

app.get('/accept', function(req, res) {
	var code = req.query.code;
	var state_linkedin = req.query.state;

	console.log('Code : ' + code );
	console.log('State : ' + state_linkedin);

	if(state_linkedin === STATE) {

		console.log('Posting authorization code.');
		
        var path = "https://www.linkedin.com/uas/oauth2/accessToken?grant_type=authorization_code&code=" + code +  "&redirect_uri=" + REDIRECT_URL +
        			"&client_id=" + API_KEY + "&client_secret=" +  API_SECRET;   

        console.log(path);			                              

        request({ method: 'POST', uri : path}, 
        function(error, response, body) {
            if(!error) {                
                console.log("status code : " + response.statusCode);
                console.log("body : " + body);
                console.log("headers : " + JSON.stringify(response.headers));
                var response =  JSON.parse(body);

                mongo.insertAccessToken(
                    {
                        '_id' : 'linkedIn', 
                        'accessToken' : response.access_token, 
                        'expires' : response.expires_in,
                        'lastChanged' : new Date() 
                    });

                //res.send([{accessToken : response.access_token}, {expires : response.expires_in}]);

                mongo.findByTokenNetwork('linkedIn', function(accessTokens) {
                    res.send(accessTokens);
                });
                 
            }                
            else {
                console.log("Problem with request: " + error.message);  
                res.send(error.message);                                                            
            } 

    	});
	}
	else {
		res.send('Rejecting the request as it may be a result of CSRF.');

	}
	

});

app.get('/people', function(req, res) {

    var accessTokens;

    console.log('Getting access token -- /people');

    mongo.findByTokenNetwork('linkedIn', function(accessTokens) {
        
        console.log('AccessToken : ' + accessTokens);

        var path = "https://api.linkedin.com/v1/people/~?oauth2_access_token=" + accessTokens[0].accessToken;  

        //var path = "api.linkedin.com/v1/people/~";

        console.log('Path : ' + path);
        sendRequest(path, res);
    });
});

app.get('/groups', function(req, res) {

	var path = "https://api.linkedin.com/v1/people/~?oauth2_access_token=" + accessToken + "/job-bookmarks";	

	request({ method: 'GET', 
		uri : path,
		headers: {'x-li-format' : 'json'}        
		}, 
        function(error, response, body) {
            if(!error) {                
                console.log("status code : " + response.statusCode);
                console.log("body : " + body);
                console.log("headers : " + JSON.stringify(response.headers));
                //var response =  JSON.parse(body);
                res.send(body);
            }                
            else {
                console.log("Problem with request: " + error.message);  
                res.send(error.message);                                                            
            } 

    });
});

function sendRequest(path, res) {

    console.log("Connecting to url " + path);        

    request({ method: 'GET', 
        uri : path,
        headers: {'x-li-format' : 'json'}
        }, 
        function(error, response, body) {
            if(!error) {                
                console.log("status code : " + response.statusCode);
                console.log("body : " + body);
                console.log("headers : " + JSON.stringify(response.headers));
                //var response =  JSON.parse(body);
                res.send(body);
            }                
            else {
                console.log("Problem with request: " + error.message);  
                res.send(error.message);                                                            
            } 

        });
}

app.listen(1006);
console.log('Listening on port 1006');