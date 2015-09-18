var express = require('express');
var app = express();

var request = require('request');




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
                res.send([{accessToken : response.access_token}, {expires : response.expires_in}]);
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

app.listen(1006);
console.log('Listening on port 1006');