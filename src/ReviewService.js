var ReviewService = {
	uploadToStorage : async function(file,email){
		const BUCKET_NAME = 'entrypoint-9aa5e.appspot.com';
		var FILE_LENGTH = file.length
		console.log(FILE_LENGTH);
		
		var fs = require('fs');

		fs.createReadStream(file).pipe(fs.createWriteStream(email +'-'+ file));
		const STORAGE_URL = 'https://www.googleapis.com/upload/storage/v1/b/entrypoint-9aa5e.appspot.com/o'; 	
		  // [START storage_upload_file]
		  // Imports the Google Cloud client library
	    const {Storage} = require('@google-cloud/storage');

	    // Creates a client
	    const storage = new Storage();
		
	  /**
	   * TODO(developer): Uncomment the following lines before running the sample.
	   */
	  // const bucketName = 'Name of a bucket, e.g. my-bucket';
	  // const filename = 'Local file to upload, e.g. ./local/path/to/file.txt';

	  // Uploads a local file to the bucket
	  try {
	    await storage.bucket(BUCKET_NAME).upload(email +'-'+ file, {
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
	  fs.unlinkSync(email +'-'+ file);
	  console.log('succesfully uploaded');
	},
	createReview : function(reviewInfo){
		
		var firebase = require("firebase");
		/*
		var config = {
			apiKey: process.env.API_KEY,
			authDomain: "entrypoint-9aa5e.firebaseapp.com",
			databaseURL: "https://entrypoint-9aa5e.firebaseio.com",
			projectId: "entrypoint-9aa5e",
			storageBucket: "entrypoint-9aa5e.appspot.com",
			messagingSenderId: "951702162449"
		};

		firebase.initializeApp(config);
		*/
		console.log(firebase.auth().currentUser);
		console.log('UID ' + firebase.auth().currentUser.uid);
		var reviewRef = firebase.database().ref("Reviews");
		var id = reviewRef.child(firebase.auth().currentUser.uid);
		
		var newRef = id.push();
		
		newRef.set({
			author : reviewInfo.author,
			reviewName : reviewInfo.reviewName,
			DatePosted : firebase.database.ServerValue.TIMESTAMP,
			reviewFileName : reviewInfo.reviewFileName,
			
		});
		
		
	},
	getEmailEscapedfromDomain: function(email){
		
		if(!email) return email;
		
		var pos = email.indexOf('@');
		
		var newEmail = email.substring(0,pos); 
		
		return newEmail;
	},
	getLatestReviews: async function(firebase){
		
		//var firebase = require("firebase");
		
		var reviewRef = firebase.database().ref("Reviews");
		
		return reviewRef.once('value').then((snapshot) => {
			console.log(snapshot.val());
			return snapshot.val();
		});

		
	}
}
module.exports = ReviewService;
