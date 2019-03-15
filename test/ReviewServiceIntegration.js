var assert = require('assert');

const reviewService = require("../src/ReviewService");
const reviewStorageServiceImpl = require('./ReviewStorageService');
const reviewAdapter = require("../src/ReviewAdapter");
const dotev = require('dotenv').config();
var expect = require('chai').expect;
    
describe('#checkS3BucketStorage',() => {
    
    
    it('should upload to AWS S3 bucket',async () => {
        
        var fs = require('fs');
        var buffer = new Buffer('blackOps 4 is the best game of all time dude');
        var imgBuffer = fs.readFileSync('entrypoint.png', 'base64');
        var email = 'testuser';
        
        var fileName = 'test.txt';
        //fileName,buffer,email,thumbNailBuffer,thumbNailName
        var storageResponse = await reviewStorageServiceImpl.uploadToStorage(fileName,buffer,email,imgBuffer,'entrypoint.png');
        expect(storageResponse).to.equal(true);
        
    });
    
    it('should read file from AWs s3 bucket ', async () => {
        
        
        var email = 'testuser';
        
        var fileName = 'test.txt';
                    
        var fileData = await reviewStorageServiceImpl.readFileFromStorage(email,fileName,'entrypoint.png');
        
        expect(fileData.reviewText).to.equal('blackOps 4 is the best game of all time dude');
        
    });	

    it('should return a list of singed urls given a list of Reviews', () => {

        var Reviews = [{'username' : 'mazarag2','thumbNailName' : 'help.png','key' : '-L_0Fac6GOzK1qQD2gL_'},
        {'username' : 'testuser','thumbNailName' : 'entrypoint.png','key' : '-LYdkPyjjDxOnIHBsg_3'}];
        var reviews = reviewStorageServiceImpl.getLinksFromS3(Reviews);
        console.log(reviews);
        expect(reviews).to.be.an.instanceof(Array);
        expect(reviews).to.have.lengthOf(Reviews.length);

    });
    
});