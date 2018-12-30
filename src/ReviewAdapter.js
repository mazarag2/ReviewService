var ReviewAdapter = {
	//trasnform the review object from the Database to be consumed by the view
	returnReviewsforView : function(reviews){
		
		var keySet = Object.keys(reviews);
	
		var viewReviews = [];
		for(var index = 0 ; index <= keySet.length - 1; index++){
			
			var currentKey = keySet[index];
			var currentReviewData = reviews[currentKey];
			
			viewReviews.push({
				
				"DatePosted" : currentReviewData.DatePosted,
				"author" : currentReviewData.author,
				"reviewSummary" : currentReviewData.reviewSummary,
				"reviewFileName" : currentReviewData.reviewFileName,
				"reviewName" : currentReviewData.reviewName
				
			});
		}
		console.log(viewReviews);
		return viewReviews;
	}

}
module.exports = ReviewAdapter;