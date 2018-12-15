var express = require("express");
var path = require("path");
var serveStatic = require("serve-static");
app = express();
app.use(serveStatic(path.join(__dirname, "dist")));
console.log(path.join(__dirname, "dist"));
app.use(express.static(__dirname));

var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(session({secret : "secret",cookie : { expires: 100000 }}));
const jade = require('pug');
var port = process.env.PORT || 8080;
const qstring = require('querystring');
app.listen(port);
console.log("server started "+port);
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
const dotenv = require('dotenv').config();
const reviewServiceImpl = require('./ReviewService');

if (dotenv.error) {
  throw dotenv.error
}
 
console.log(dotenv.parsed)
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


const {google} = require('googleapis');
const axios = require('axios');

const NodeCache = require( "node-cache" );
const authCache = new NodeCache();

const oauth2Client = new google.auth.OAuth2(
  process.env.LOCAL_CLIENT_ID,
  process.env.LOCAL_CLIENT_SECRET,
  'http://localhost:8080/oauthRedirect'
);


const index = require("./ReviewController");
app.use('/',index);

app.get('/home',function(req,res){
	
	var local_id = process.env.LOCAL_CLIENT_ID;
	var reviews = reviewServiceImpl.getReviews();
	
	
	res.render('home',{LOCAL_CLIENT_ID : local_id});
	
});

/*
app.get('/review',function(req,res){
	
	
	var scopes = ['email','profile','https://www.googleapis.com/auth/drive'];
	
	const url = oauth2Client.generateAuthUrl({
	  // 'online' (default) or 'offline' (gets refresh_token)
	  access_type: 'offline',
	  // If you only need one scope you can pass it as a string
	  scope: scopes,
	  prompt: 'consent'
	});
	console.log(url);
	res.render('CreateReview',{google_auth_url : url});
	
});
*/

app.get('/oauthRedirect', async (req,res) => {
	
	
	console.log(req.query.code);
	
	var authCode = req.query.code; 
	//var id_token = req.query.id_token;
	

	
	const {tokens} = await oauth2Client.getToken(authCode);
	console.log(tokens);
	console.log(tokens.id_token);
	var id_token = tokens.id_token;
	oauth2Client.setCredentials(tokens);
	var credential = firebase.auth.GoogleAuthProvider.credential(id_token);
	
	firebase.auth().signInAndRetrieveDataWithCredential(credential).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
		console.log(errorCode);
        var errorMessage = error.message;
		console.log(errorMessage);
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
		console.log(credential);
        // ...
    });
	
	async function verify(id_token,res) {
	  const ticket = await client.verifyIdToken({
		  idToken: id_token,
		  audience: [process.env.LOCAL_CLIENT_ID,process.env.PROD_CLIENT_ID] 
      });
	  const payload = ticket.getPayload();
	  console.log(payload);	
	  var email = payload.email;
	  
	  const userid = payload['sub'];
	  
	  console.log(userid);
	  return payload;
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    }
   var payload = await verify(id_token).catch(console.error);
   console.log(payload);
   var fullname = payload.given_name + ' ' + payload.family_name;
   var userAuth = {email : payload.email,token : tokens};
   authCache.set( payload.email, userAuth, 100000);
   res.cookie(payload.email,tokens);
   res.cookie('name',fullname);
   
   //set uid in users ref
   /*
   var uid = firebase.auth().uid;
	
   var usersRef = firebase.database().ref("Users");
	
   usersRef.set({uid : fullname});
   */
   const url = '';
   res.render('CreateReview',{google_auth_url : url,authenticated : true,email : payload.email});
	
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
