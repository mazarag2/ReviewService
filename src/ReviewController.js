var express = require("express");
var router = express.Router() 
const qstring = require('querystring');
const url = require('url');
const index = require('./index');
const reviewService = require('./ReviewService');
const {google} = require('googleapis');
var multer = require('multer');
const upload = multer();
var fs = require('fs');
var cookieParser = require('cookie-parser');
app.use(cookieParser());

const oauth2Client = new google.auth.OAuth2(
  process.env.LOCAL_CLIENT_ID,
  process.env.LOCAL_CLIENT_SECRET,
  'http://localhost:8080/oauthRedirect'
);

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
	console.log('Req Cookies  ' + req.cookies.email);
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