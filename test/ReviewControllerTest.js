var assert = require('assert');

const reviewService = require("../src/ReviewService");
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
	
	describe('#CheckReviewService',() => {
		
		it('should return the latest reviews',(done) => {
			
			var reviews = reviewService.getLatestReviews(firebase);
			done();
			console.log(reviews);
			
			assert.isNotNull(reviews);
			assert.isNotEmpty(reviews)
			
		});
	});
	
});