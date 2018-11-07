var express = require("express");
var path = require("path");
var serveStatic = require("serve-static");
app = express();
app.use(serveStatic(path.join(__dirname, "dist")));
console.log(path.join(__dirname, "dist"));
app.use(express.static(__dirname));
const jade = require('pug');
var port = process.env.PORT || 8080;
const qstring = require('querystring');
app.listen(port);
console.log("server started "+port);
const dotev = require('dotenv').config();

app.set('view engine', 'jade');
app.engine('jade', jade.__express);
app.set('views', path.join(__dirname, '../src/views'));

var cors = require('cors');
app.use(cors());

var firebase = require("firebase");
var config = {
    apiKey: process.env.API_KEY,
    authDomain: "entrypoint-9aa5e.firebaseapp.com",
    databaseURL: "https://entrypoint-9aa5e.firebaseio.com",
    projectId: "entrypoint-9aa5e",
    storageBucket: "entrypoint-9aa5e.appspot.com",
    messagingSenderId: "951702162449"
};

firebase.initializeApp(config);
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.LOCAL_CLIENT_ID);

console.log(process.env.LOCAL_CLIENT_ID);

const axios = require('axios');



app.get('/home',function(req,res){
	
	var local_id = process.env.LOCAL_CLIENT_ID
	res.render('home',{LOCAL_CLIENT_ID : local_id});
	
});

app.post('/authenticate',cors(),function(req,res){
	
	var bodyData = '';
	req.on('data', function (chunk) {
		bodyData += chunk.toString();
	});
	req.on('end', function() {
		
		var postData = qstring.parse(bodyData);
		console.log(postData);
		var idtokenObj = Object.keys(postData)[0];
		
		var idTokenParsed = JSON.parse(idtokenObj);

		var authCode = idTokenParsed.idtoken;
		
		console.log(authCode);
		
		 var oauth2Client = getOAuthClient();

		oauth2Client.getToken(authCode, function(err, tokens) {
		  // Now tokens contains an access_token and an optional refresh_token. Save them.
		  if(!err) {
			oauth2Client.setCredentials(tokens);
			session["tokens"]=tokens;
			res.send();
		  }
		  else{
			res.send();
		  }
		});
		
		axios.post('https://accounts.google.com/o/oauth2/token',{
			Code:authCode,
			Client_id:process.env.LOCAL_CLIENT_ID,
			Client_secret:process.env.LOCAL_CLIENT_SECRET,
			redirect_uri:'http://localhost:8081/home',
			Grant_type:'authorization_code'
		},{'Content-Type': 'application/x-www-form-urlencoded'}).then(function(response){
			
			res.send(response.Id_token);
			
		})
		
		/*
		async function verify(token,res) {
		  const ticket = await client.verifyIdToken({
			  idToken: token,
			  audience: [process.env.LOCAL_CLIENT_ID,process.env.PROD_CLIENT_ID]
			  // Specify the CLIENT_ID of the app that accesses the backend
			  // Or, if multiple clients access the backend:
			  //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
			  //Ideally we want to pass the client id as part fo the request from vue rather than always get
			  //from env
		  });
		  const payload = ticket.getPayload();
		  console.log(payload);
		  const userid = payload['sub'];
		  
		  
		  
		  var username = payload['name'];
		  //res.send('Welcome ' + username);
		  res.send(username);
		  // If request specified a G Suite domain:
		  //const domain = payload['hd'];
		}
		verify(token,res).catch(console.log("Invalid Token recieved " + console.error)); 
		*/
	});
	
});
function getOAuthClient () {
    return new OAuth2(process.env.Client_id ,  process.env.Client_secret, "http://localhost:8081/home");
}

function renderIndex(res,username){
	
	
	
	
	
	
}