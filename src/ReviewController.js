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

router.get('/review',function(req,res){
	
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
	//need to access token from cookies
	var bodyData = '';
	req.on('data', function (chunk) {
		bodyData += chunk.toString();
	});
	req.on('end', function() {
		//console.log(req); we can grab the token from here too
		console.log(bodyData);
		console.log(req.body);
		console.log(bodyData.split("=")[1]);
		  var file = bodyData.split("=")[1]; 
		  fs.readFile(file, function (err, data) {
			 if(err) console.log(err);
			 console.log(data);
			 var buf = new Buffer(data);
			 console.log(buf.toString());
			 var newEmail = reviewServiceImpl.getEmailEscapedfromDomain(email);
			 reviewServiceImpl.uploadToStorage(file,newEmail);
			 //console.log(len);
			 //upload file to google storageBucket
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
module.exports = router