var ReviewService = {
	uploadToStorage : async function(fileName,buffer,email,thumbNailBuffer,thumbNailName){

	    var AWS = require('aws-sdk');
		// Set the region 
		AWS.config.update({region: 'us-west-1'});
		AWS.config.update({
			accessKeyId: process.env.aws_key_id,
			secretAccessKey: process.env.aws_access_key
		});
		
		s3 = new AWS.S3({apiVersion: '2006-03-01'});
		
		var bucketParams = {Bucket: 'reviewservice-reviews'};
		
		var uploadParams = {Bucket: 'reviewservice-reviews', Key: '', Body: ''};
		var fs = require('fs');
		
		const { Readable } = require('stream');
		const stream = new Readable();
		stream.push(buffer);
		stream.push(null);
		uploadParams.Body = stream;

		var path = require('path');
		uploadParams.Key = email + '/' + fileName;

		
		
		var thumbNailuploadParams = {Bucket: 'reviewservice-reviews', Key: '', Body: ''};
		
		//const { Readable } = require('stream');
		const stream2 = new Readable();
		stream2.push(thumbNailBuffer);
		stream2.push(null);
		thumbNailuploadParams.Body = thumbNailBuffer;

		var path = require('path');
		thumbNailuploadParams.Key = email + '/' + thumbNailName;
		
		
		// call S3 to retrieve upload file to specified bucket
		return new Promise((resolve,reject) => {
			
			s3.upload (uploadParams, function (err, data) {
			  if (err) {
				console.log("Error", err);
				reject(err);
			  } if (data) {
				console.log("Upload Success for : ", data.Location);
				s3.upload (thumbNailuploadParams, function (err, data) {
				  if (err) {
					console.log("Error", err);
					reject(err);
				  } if (data) {
					console.log("Upload Success for : ", data.Location);
					resolve(true);
				  }
				});
			  }
			});
			

			
			
			
		});
	
	},
	readFileFromStorage : function(userName,filename,thumbNailName) {
		
		var AWS = require('aws-sdk');
		// Set the region 
		AWS.config.update({region: 'us-west-1'});
		AWS.config.update({
			accessKeyId: process.env.aws_key_id,
			secretAccessKey: process.env.aws_access_key
		});
		
		s3 = new AWS.S3({apiVersion: '2006-03-01'});
		

		var params = {Bucket: 'reviewservice-reviews', Key: userName + '/' + filename};
		
	    var ThumbNailParams = {Bucket: 'reviewservice-reviews', Key: userName + '/' + thumbNailName}
	
	
	
		
	
		return new Promise((resolve,reject) =>{
		
			s3.getObject(params,(err,data) => {
				
				if(err) reject(err);
				/*
				s3.getObject(ThumbNailParams, function (err, thumbNailData) {
				  console.dir('Signed URL: ' + thumbNailData);
				  var Review = {reviewText : '', reviewThumbNail : ''};
				  
				  Review.reviewText = data.Body.toString();
				  Review.reviewThumbNail = thumbNailData;
				  
				  resolve(Review);
				});
				*/
				
				s3.getSignedUrl('getObject', ThumbNailParams, function (err, url) {
				  console.log('Signed URL: ' + url);
				  var Review = {reviewText : '', reviewThumbNail : ''};
				  
				  Review.reviewText = data.Body.toString();
				  Review.reviewThumbNail = url;
				  
				  resolve(Review);
				});
				
				
		
			});

			
		});
		
	},
	getLinksFromS3 : function(Reviews){

		var AWS = require('aws-sdk');
		// Set the region 
		AWS.config.update({region: 'us-west-1'});
		AWS.config.update({
			accessKeyId: process.env.aws_key_id,
			secretAccessKey: process.env.aws_access_key
		});
		
		s3 = new AWS.S3({apiVersion: '2006-03-01'});


		var newReviews = [];
		for(var x = 0 ; x <= Reviews.length -1 ; x++){

			var ThumbNailParams = {Bucket: 'reviewservice-reviews', Key: Reviews[x].userName + '/' + Reviews[x].thumbNailFileName}
			var url = s3.getSignedUrl('getObject', ThumbNailParams);
			Reviews[x]["thumbNailUrl"] = url;

		}
		console.log(newReviews); 

		return Reviews;

	},
	createReview : function(reviewInfo){
		
		var firebase = require("firebase");
		console.log(firebase.auth().currentUser);
		console.log('UID ' + firebase.auth().currentUser.uid);
		//if null need to get a refresh totken or go back to login
		var reviewRef = firebase.database().ref("Reviews");
		var reviewByDateRef = firebase.database().ref("ReviewsByDate"); 
		var id = reviewRef.child(firebase.auth().currentUser.uid);
		
		
		var newRef = id.push();
		
		var newReviewByDateRef = reviewByDateRef.child(newRef.key);
		
		newRef.set({
			author : reviewInfo.author,
			reviewName : reviewInfo.reviewName,
			reviewSummary : reviewInfo.reviewSummary,
			DatePosted : firebase.database.ServerValue.TIMESTAMP,
			reviewFileName : reviewInfo.reviewFileName,
			thumbNailFileName : reviewInfo.thumbNailFileName
		});
		
		newReviewByDateRef.set({
			
			userName : reviewInfo.email,
			DatePosted : firebase.database.ServerValue.TIMESTAMP,
			author : reviewInfo.author,
			reviewSummary : reviewInfo.reviewSummary,
			reviewFileName : reviewInfo.reviewFileName,
			reviewName : reviewInfo.reviewName,
			thumbNailFileName : reviewInfo.thumbNailFileName
			
		});
		
	},
	getEmailEscapedfromDomain: function(email){
		
		if(!email) return email;
		
		var pos = email.indexOf('@');
		
		var newEmail = email.substring(0,pos); 
		
		return newEmail;
	},
	getSingleReview: function(key,firebase){
		
		//var reviewRef = firebase.database().ref("ReviewsByDate/" + key);
		
		return firebase.database().ref('/ReviewsByDate/' + key).once('value').then(function(snapshot) {
			return snapshot.val();
		});
		
		
		
	},
	getLatestReviews: function(firebase){
			
		//limitTolast to achieve DESC order 
		var reviewRef = firebase.database().ref("ReviewsByDate").limitToLast(10);
		/*
		return reviewRef.once('value').then((snapshot) => {
			console.log(snapshot.val());
			return snapshot.val();
		});
		*/
		return reviewRef.orderByChild("DatePosted").once('value').then((snapshot) => {
			//console.log(snapshot.val());
			return snapshot.val();
		});

		
	}
}
module.exports = ReviewService;
