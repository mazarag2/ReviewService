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
	getEmailEscapedfromDomain: function(email){
		
		if(!email) return email;
		
		var pos = email.indexOf('@');
		
		var newEmail = email.substring(0,pos); 
		
		return newEmail;
	}
}
module.exports = ReviewService;
