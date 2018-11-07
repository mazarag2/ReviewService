var express = require("express");
var express = require('express')
var router = express.Router() 
const qstring = require('querystring');
const url = require('url');

router.get('/review',function(req,res){
	
	res.render('CreateReview')


});
