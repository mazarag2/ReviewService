var assert = require('assert');

const reviewService = require("../src/ReviewService");
const dotev = require('dotenv').config();
var expect = require('chai').expect;

describe('TestreviewService', function() {
	
	describe('#CheckUtilFunctions()', function(){

		it('should return email without Domain',function(){
			
			
			var email = 'mazarag2@gmail.com'; 
			
			var result = reviewService.getEmailEscapedfromDomain(email);
			console.log(result);
			expect(result).to.equal("mazarag2");
		});
		
	});
	
});