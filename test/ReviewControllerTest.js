var assert = require('assert');

const reviewService = require("../src/ReviewService");
const reviewAdapter = require("../src/ReviewAdapter");
const dotev = require('dotenv').config();
var expect = require('chai').expect;

var firebase = require("firebase");
var config = {
    apiKey: process.env.API_KEY,
    authDomain: "entrypoint-9aa5e.firebaseapp.com",
    databaseURL: "https://entrypoint-9aa5e.firebaseio.com",
    projectId: "entrypoint-9aa5e",
    storageBucket: "entrypoint-9aa5e.appspot.com",
    messagingSenderId: "951702162449"
};

firebase.initializeApp(config);

describe('TestreviewService', function() {
	
	describe('#CheckUtilFunctions()', function(){

		it('should return email without Domain',function(){
			
			
			var email = 'mazarag2@gmail.com'; 
			
			var result = reviewService.getEmailEscapedfromDomain(email);
			console.log(result);
			expect(result).to.equal("mazarag2");
		});
		
	});
	
	
	describe('#CheckReviewAdapter',() =>{
		
		it('should return reviews in an array format',() =>{
			    var assert = require('assert');
				var reviews = {
					 '-LTnEYdfgIsdkD72HoQj':
						{ "DatePosted": 1544900458841,
						 "author": 'Mike Zaragoza',
						 "reviewFileName": 'README.md',
						 "reviewName": 'review+this+b' },
					  '-LTnEydftIsdyD12Hewa':
					   { "DatePosted": 1544900458844,
						 "author": 'Tom Zaragoza',
						 "reviewFileName": 'README2.md',
						 "reviewName": 'review+this+b+bb' }
				}
			
				var result = reviewAdapter.returnReviewsforView(reviews);
			
				expect(result).to.be.an.instanceof(Array);
				expect(result[0]).to.have.property('key');
				expect(result[0]).to.have.property('DatePosted');
				expect(result[0]).to.have.property('author');
				expect(result[0]).to.have.property('reviewFileName');
				expect(result[0]).to.have.property('reviewName');
				

			
		});
		
	});
	describe('#CheckReviewService',() => {
		
		it('should return the latest reviews',(done) => {
			
			var reviews = reviewService.getLatestReviews(firebase);
			done();
			//console.log(reviews);
			
			assert.isNotNull(reviews);
			assert.isNotEmpty(reviews)
			
		});
		it('should return a single Review', async () => {
			var key = '-LX1WAJ5MGJvqIu_XQ-v';
			var review = await reviewService.getSingleReview(key,firebase);
			console.log(review);
			expect(review).to.be.an.instanceof(Object);
			
			
		});
	});
	describe('#CheckAdapterFunctions',() => {
		
		it('should return a new object ',(done) => {
			
			var reviews = [
				{ key: '-L_0AsncgFEYnMHimge6',
				DatePosted: 'Sat Mar 02 2019',
				author: 'Mike Zaragoza',
				reviewSummary: 'testing this with a png',
				reviewFileName: 'backup.txt',
				reviewName: 'MeReview',
				thumbNailFileName: 'me.png',
				userName : 'mazarag2' },
			  { key: '-L_0CV_mySav-TeUeyDt',
				DatePosted: 'Sat Mar 02 2019',
				author: 'Mike Zaragoza',
				reviewSummary: 'testagain32',
				reviewFileName: 'link to laptop fix.txt',
				reviewName: 'testagain32',
				thumbNailFileName: 'help.png' ,
				userName : 'boblow3'},]
		

			var newReviews = reviewAdapter.getListofPicLinksforReviews(reviews);
			done();
			expect(newReviews).to.have.lengthOf(reviews.length);			
			assert.include(newReviews[0], { username: 'mazarag2',thumbNail : 'me.png' }, 'object contains property');

		});
	});
	describe('#checkS3BucketStorage',() => {
		
		
		it('should upload to AWS S3 bucket',async () => {
			
			var fs = require('fs');
			var buffer = new Buffer('blackOps 4 is the best game of all time dude');
			var imgBuffer = fs.readFileSync('entrypoint.png', 'base64');
			var email = 'testuser';
			
			var fileName = 'test.txt';
			//fileName,buffer,email,thumbNailBuffer,thumbNailName
			var storageResponse = await reviewService.uploadToStorage(fileName,buffer,email,imgBuffer,'entrypoint.png');
			expect(storageResponse).to.equal(true);
			
		});
		
		it('should read file from AWs s3 bucket ', async () => {
			
			
			var email = 'testuser';
			
			var fileName = 'test.txt';
						
			var fileData = await reviewService.readFileFromStorage(email,fileName,'entrypoint.png');
			
			expect(fileData.reviewText).to.equal('blackOps 4 is the best game of all time dude');
			
		});	
		
	});
	
});