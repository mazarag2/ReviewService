var ReviewAdapter = {
	//trasnform the review object from the Database to be consumed by the view
	returnReviewsforView : function(reviews){
		
		var keySet = Object.keys(reviews);
	
		var viewReviews = [];
		for(var index = 0 ; index <= keySet.length - 1; index++){
			
			var currentKey = keySet[index];
			var currentReviewData = reviews[currentKey];
			
			var date = new Date(currentReviewData.DatePosted);
			
			viewReviews.push({
				
				"key" : currentKey,
				"DatePosted" : date.toDateString(),
				"author" : currentReviewData.author,
				"reviewSummary" : currentReviewData.reviewSummary,	
				"reviewFileName" : currentReviewData.reviewFileName,
				"reviewName" : currentReviewData.reviewName,
				"userName" : currentReviewData.userName,
				"thumbNailFileName" : currentReviewData.thumbNailFileName
				
			});
		}
		console.log(viewReviews);
		return viewReviews;
	},
	getListofPicLinksforReviews : function(Reviews){
		
	
		var ThumbNails = [];
		for(var x = 0 ; x <= Reviews.length - 1 ; x++){
			
			var thumbNailParam = {};
			
			thumbNailParam.username = Reviews[x].userName;
			thumbNailParam.thumbNail = Reviews[x].thumbNailFileName;
			thumbNailParam.key = Reviews[x].key;
			
			ThumbNails.push(thumbNailParam);
			
		}
		return ThumbNails;

		
	}

}
module.exports = ReviewAdapter;