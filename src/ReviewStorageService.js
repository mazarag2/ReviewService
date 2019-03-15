var ReviewStorageService = {

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

	}

}
module.exports = ReviewStorageService;