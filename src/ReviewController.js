var express = require("express");
var router = express.Router() 
const qstring = require('querystring');
const url = require('url');
const index = require('./index');
const reviewServiceImpl = require('./ReviewService');
const {google} = require('googleapis');
var multer = require('multer');
const upload = multer();
var fs = require('fs');
var cookieParser = require('cookie-parser');
var axios = require('axios');
app.use(cookieParser());
var path = require('path');
const oauth2Client = new google.auth.OAuth2(
  process.env.LOCAL_CLIENT_ID,
  process.env.LOCAL_CLIENT_SECRET,
  'http://localhost:8080/oauthRedirect'
);

router.get('/StorageBuckets',async function(req,res){
	
	/*
	const {Storage} = require('@google-cloud/storage');

	// Instantiates a client. If you don't specify credentials when constructing
	// the client, the client library will look for credentials in the
	// environment.
	const storage = new Storage();

	// Makes an authenticated API request.
	storage
	  .getBuckets()
	  .then((results) => {
		const buckets = results[0];

		console.log('Buckets:');
		buckets.forEach((bucket) => {
		  console.log(bucket.name);
		  res.send(bucket.name);
		});
	  })
	  .catch((err) => {
		console.error('ERROR:', err);
	  });
	  */
	  const {Storage} = require('@google-cloud/storage');
      const BUCKET_NAME = 'entrypoint-9aa5e.appspot.com';
		  // Creates a client
	  const storage = new Storage();

	  /**
	   * TODO(developer): Uncomment the following lines before running the sample.
	   */
	  // const bucketName = 'Name of a bucket, e.g. my-bucket';
	  // const filename = 'Local file to upload, e.g. ./local/path/to/file.txt';

	  // Uploads a local file to the bucket
	  await storage.bucket(BUCKET_NAME).upload(file, {
		// Support for HTTP requests made with `Accept-Encoding: gzip`
		gzip: true,
		metadata: {
		  // Enable long-lived HTTP caching headers
		  // Use only if the contents of the file will never change
		  // (If the contents will change, use cacheControl: 'no-cache')
		  cacheControl: 'no-cache',
		},
	  });

	  console.log('succesfully uploaded');
	
	
	
});

router.get('/clearCookies',function(req,res){
	
	var Email = Object.keys(req.cookies)[0];
	res.clearCookie(Email);
	res.clearCookie('token');
	res.send('Cookies Cleaered');

});

var checkForToken = function(req,res,next){
	//check if we have an object
	
	var firebase = require('firebase');
	var isConnectSid = Object.keys(req.cookies)[0] == 'connect.sid';
	var emptyObject = Object.keys(req.cookies).length == 0;
	console.log(isConnectSid);
	//cookies will usually contain user email if its only sid they need to log in
	//firebase.auth().currentUser (!isConnectSid || emptyObject
	if(firebase.auth().currentUser){
	  //console.dir(req.cookies);
	  //console.log(Object.keys(req.cookies)[0]);
	  var Email = Object.keys(req.cookies)[0];
	  console.log(Email);
	  var token = req.cookies[Email].access_token;
	  if(token){
		  var url = '';
		  res.render('CreateReview',{google_auth_url : url,authenticated : true,email : Email});
	  }
	}
	else{
		return next();
	}
}



router.get('/reviews',function(req,res){
	
	
	
	
	
	
});

router.get('/review',checkForToken,function(req,res){
	
	
	var url = generateAuthUrl();
	res.render('CreateReview',{google_auth_url : url});
	
});

function generateAuthUrl(){

	var scopes = ['email','profile','https://www.googleapis.com/auth/drive'];
	
	const url = oauth2Client.generateAuthUrl({
	  // 'online' (default) or 'offline' (gets refresh_token)
	  access_type: 'offline',
	  scope: scopes,
	  prompt: 'consent'
	});
	console.log(url);
	return url;
}	

router.post('/reviews/:email',upload.array(),function(req,res){
	var email = req.params.email;
	console.log(email);
	console.log('Req Cookies  ' + req.cookies[email]);
	console.dir(req.cookies);
	var token = req.cookies[email].access_token;
	console.log(token);
	console.log(req.cookies['name']);
	var fullname = req.cookies['name'];
	//need to access token from cookies
	var bodyData = '';
	req.on('data', function (chunk) {
		bodyData += chunk.toString();
	});
	req.on('end', function() {
		//console.log(req); we can grab the token from here too
		console.log(bodyData);
		console.log(bodyData.split("=")[1]);
		  var file = bodyData.split("&")[0];
		  file = file.split("=")[1];
		  var reviewName = bodyData.split("&")[1];
		  reviewName = reviewName.split("=")[1];
		  console.log(reviewName);
		  fs.readFile(file, function (err, data) {
			 if(err) console.log(err);
			 console.log(data);
			 var buf = new Buffer(data);
			 console.log(buf.toString());
			 
			 var newEmail = reviewServiceImpl.getEmailEscapedfromDomain(email);
			 var date = new Date();
			 var reviewInfo = {
				 
				 email : newEmail,
				 author : fullname,
			     reviewName : reviewName,	 
				 DatePosted : date,
				 reviewFileName : path.basename(file) 
			 }
			 
			 console.dir(reviewInfo);
			 
			 
			 reviewServiceImpl.createReview(reviewInfo);
			 
			 //reviewServiceImpl.uploadToStorage(file,newEmail);
			 
			 var url = '';
			 res.render('CreateReview',{google_auth_url : url,fileUploaded : true,authenticated : true,email : email});
		  });
	});	
});
module.exports = router