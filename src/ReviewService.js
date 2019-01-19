var ReviewService = {
	uploadToStorage : async function(fileName,buffer,email){
		const BUCKET_NAME = 'entrypoint-9aa5e.appspot.com';
		var fs = require('fs');
		
		fs.writeFile('files/' + email + '-' + fileName,buffer.toString(),() =>{
		});
		
		
		
		//fs.createReadStream(file).pipe(fs.createWriteStream(email +'-'+ file));
		const STORAGE_URL = 'https://www.googleapis.com/upload/storage/v1/b/entrypoint-9aa5e.appspot.com/o'; 	
		  // [START storage_upload_file]
		  // Imports the Google Cloud client library
	    const {Storage} = require('@google-cloud/storage');

	    // Creates a client
	    const storage = new Storage({
			
			keyFilename : process.env.JSON_KEY,
			projectID : process.env.PROJECT_ID
			
		});
		
	  /**
	   * TODO(developer): Uncomment the following lines before running the sample.
	   */
	  // const bucketName = 'Name of a bucket, e.g. my-bucket';
	  // const filename = 'Local file to upload, e.g. ./local/path/to/file.txt';

	  // Uploads a local file to the bucket
	  try {
	    await storage.bucket(BUCKET_NAME).upload('files/' + email +'-'+ fileName, {
		  // Support for HTTP requests made with `Accept-Encoding: gzip`
		  gzip: true,
		  metadata: {
		  // Enable long-lived HTTP caching headers
		  // Use only if the contents of the file will never change
		  // (If the contents will change, use cacheControl: 'no-cache')
		    cacheControl: 'no-cache',
		  },
	    });
	  }
	  catch(ex){
		console.log(ex);
	  }
	  fs.unlinkSync('files/' + email +'-'+ fileName);
	  console.log('succesfully uploaded');
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
