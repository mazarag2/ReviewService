var express = require("express");
var router = express.Router() 
const qstring = require('querystring');
const url = require('url');
const index = require('./index');
const reviewServiceImpl = require('./ReviewService');
const reviewStorageServiceImpl = require('./ReviewStorageService');
const {google} = require('googleapis');
var multer = require('multer');
const upload = multer();
var fs = require('fs');
var cookieParser = require('cookie-parser');
var axios = require('axios');
app.use(cookieParser());
var path = require('path');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + '../test')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})


//process.env.oauthRedirect = 'https://entrypointreviewservice.herokuapp.com/oauthRedirect';
const oauth2Client = new google.auth.OAuth2(
  process.env.Client_id,
  process.env.Client_secret,
  process.env.oauthRedirect
);

const bodyParser = require("body-parser");

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

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
	
	var isEmailDefined = Object.keys(req.cookies)[2] !== undefined;
	console.log(firebase.auth().currentUser);
	if(firebase.auth().currentUser && isEmailDefined){
	  console.log('in firebase');
	  console.dir(req.cookies);
	  
	  var email = Object.keys(req.cookies)[1];
	  console.log(email);
	  var Email = Object.keys(req.cookies)[2];
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


router.get('/getReview',async (req,res) => {
	
	
	var firebase = require('firebase');
	var key = req.query.key;
	var review = await reviewServiceImpl.getSingleReview(key,firebase);
	
	var date = new Date(review.DatePosted);
	review.DatePosted = date.toDateString();
	console.dir(review);
	var userName = review.userName;
	var fileName = review.reviewFileName;
	var thumbNailName = review.thumbNailFileName;
	var Review = await reviewStorageServiceImpl.readFileFromStorage(userName,fileName,thumbNailName);
	console.log(Review.reviewText);
	
	var thumbNailURL = Review.reviewThumbNail;
	console.log(thumbNailURL);
	//res.send(file);
	res.render('review',{review : review,content : Review.reviewText,thumbNail : thumbNailURL});
	
	
});


router.get('/CreateReview',checkForToken,function(req,res){

		
	var url = generateAuthUrl();
	res.render('CreateReview',{google_auth_url : url});
	
});

function generateAuthUrl(){

	var scopes = ['email','profile'];
	
	const url = oauth2Client.generateAuthUrl({
	  // 'online' (default) or 'offline' (gets refresh_token)
	  access_type: 'online',
	  scope: scopes,
	  prompt: 'consent'
	});
	console.log(url);
	return url;
}	

router.post('/reviews/:email',upload.any(),async function(req,res){
	console.log(req.files);
	var reviewBuffer = req.files[0].buffer.toString();
    var thumbNailBuffer = req.files[1].buffer;
	var email = req.params.email;
	console.log(req.params);
	console.log(email);
	//console.log('Req Cookies  ' + req.cookies[email]);
	//console.dir(req.cookies);
	var token = req.cookies[email].access_token;
	console.log(token);
	console.log(req.cookies['name']);
	var fullname = req.cookies['name']; 
	console.log(req.file);
	//var fileName = req.file.originalname;
	var fileName = req.files[0].originalname;
	var thumbNailName = req.files[1].originalname; 
	var reviewName = req.body.reviewName;
	var reviewSubText = req.body.reviewSubText;
	var newEmail = reviewServiceImpl.getEmailEscapedfromDomain(email);
	var date = new Date();
	var reviewInfo = {
		 
		 email : newEmail,
		 author : fullname,
		 reviewSummary : reviewSubText,
		 reviewName : reviewName,	 
		 DatePosted : date,
		 reviewFileName : fileName,
		 thumbNailFileName : thumbNailName
	 }
 
	console.dir(reviewInfo);
	
	try {	
	
		reviewServiceImpl.createReview(reviewInfo);
		var result = await reviewStorageServiceImpl.uploadToStorage(fileName,reviewBuffer,newEmail,thumbNailBuffer,thumbNailName);	
		var url = '';
		res.render('CreateReview',{google_auth_url : url,fileUploaded : true,authenticated : true,email : email});
	}
	catch(ex){
		console.log(ex);
		res.status(500).send({ url: req.originalUrl + 'Unable to write to S3'});	
	}
	
	
});
module.exports = router