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
var http = require('http');
var util = require('util');
app.set('view engine', 'jade');
app.engine('jade', jade.__express);
app.set('views', path.join(__dirname, '../src/views'));
var multer = require('multer');
const upload = multer();
var cors = require('cors');
app.use(cors());
var fs = require('fs');
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
const {google} = require('googleapis');
const axios = require('axios');

const oauth2Client = new google.auth.OAuth2(
  process.env.LOCAL_CLIENT_ID,
  process.env.LOCAL_CLIENT_SECRET,
  'http://localhost:8080/oauthRedirect'
);


app.get('/home',function(req,res){
	
	var local_id = process.env.LOCAL_CLIENT_ID
	res.render('home',{LOCAL_CLIENT_ID : local_id});
	
});


app.get('/review',function(req,res){
	
	
	
	const url = oauth2Client.generateAuthUrl({
	  // 'online' (default) or 'offline' (gets refresh_token)
	  access_type: 'offline',
	  // If you only need one scope you can pass it as a string
	  scope: 'https://www.googleapis.com/auth/drive',
	  prompt: 'consent'
	});
	console.log(url);
	res.render('CreateReview',{google_auth_url : url});
	
});


app.get('/oauthRedirect', async (req,res) => {
	
	console.log(req.query.code);
	var authCode = req.query.code; 
	const {tokens} = await oauth2Client.getToken(authCode);
	console.log(tokens);
	oauth2Client.setCredentials(tokens);
	res.render('CreateReview');
	
});


app.get('/authenticate',function(req,res){
	



	
(async () => {	
	//const client = await OAuth2Client.getClient();
	oauth2Client.on('tokens',(tokens) =>{
		
		console.log(tokens.access_token);
		res.send(tokens.access_token);
	})
	
})();
	
});

app.post('/review',upload.array(),function(req,res){
	console.log(req.body);
	console.log(req.files);
	var bodyData = '';
	req.on('data', function (chunk) {
		bodyData += chunk.toString();
	});
	req.on('end', function() {
		console.log(req.body);
		console.log(bodyData.split("=")[1]);
		  var file = bodyData.split("=")[1]; 
		  fs.readFile(file, function (err, data) {
			 if(err) console.log(err);
			 console.log(data);
			 var buf = new Buffer(data);
			 console.log(buf.toString());
			 res.end(data);
		  });
		
	});
	/*
	var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
	  console.log(files);
	  console.log(fields);
	  console.log(fields.uploadFile);
	  console.log(fields.uploadFile.path + "");
      // The next function call, and the require of 'fs' above, are the only
      // changes I made from the sample code on the formidable github
      // 
      // This simply reads the file from the tempfile path and echoes back
      // the contents to the response.
      fs.readFile(fields.uploadFile.path + "", function (err, data) {
		  console.log(data);
        res.end(data);
      });
    });
	*/
	
	
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