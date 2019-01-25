var ReviewService = {
	uploadToStorage : async function(fileName,buffer,email){

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

		// call S3 to retrieve upload file to specified bucket
		return new Promise((resolve,reject) => {
			
			s3.upload (uploadParams, function (err, data) {
			  if (err) {
				console.log("Error", err);
				reject(err);
			  } if (data) {
				console.log("Upload Success", data.Location);
				resolve(true);
			  }
			});
			
		});
	
	},
	readFileFromStorage : function(userName,filename) {
		
		var AWS = require('aws-sdk');
		// Set the region 
		AWS.config.update({region: 'us-west-1'});
		AWS.config.update({
			accessKeyId: process.env.aws_key_id,
			secretAccessKey: process.env.aws_access_key
		});
		
		s3 = new AWS.S3({apiVersion: '2006-03-01'});
		

		var params = {Bucket: 'reviewservice-reviews', Key: userName + '/' + filename};
		
		
	
		return new Promise((resolve,reject) =>{
		
			s3.getObject(params,(err,data) => {
				
				if(err) reject(err);
				resolve(data.Body.toString());
		
			});
		
		});
		
	},
	createReview : function(reviewInfo){
		
		var firebase = require("firebase");
		console.log(firebase.auth().currentUser);
		console.log('UID ' + firebase.auth().currentUser.uid);
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
			reviewFileName : reviewInfo.reviewFileName
		});
		
		newReviewByDateRef.set({
			
			userName : reviewInfo.email,
			DatePosted : firebase.database.ServerValue.TIMESTAMP,
			author : reviewInfo.author,
			reviewSummary : reviewInfo.reviewSummary,
			reviewFileName : reviewInfo.reviewFileName,
			reviewName : reviewInfo.reviewName
			
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
