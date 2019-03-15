var ReviewService = {
	createReview : function(reviewInfo){
		
		var firebase = require("firebase");
		console.log(firebase.auth().currentUser);
		console.log('UID ' + firebase.auth().currentUser.uid);
		//if null need to get a refresh totken or go back to login
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
			reviewFileName : reviewInfo.reviewFileName,
			thumbNailFileName : reviewInfo.thumbNailFileName
		});
		
		newReviewByDateRef.set({
			
			userName : reviewInfo.email,
			DatePosted : firebase.database.ServerValue.TIMESTAMP,
			author : reviewInfo.author,
			reviewSummary : reviewInfo.reviewSummary,
			reviewFileName : reviewInfo.reviewFileName,
			reviewName : reviewInfo.reviewName,
			thumbNailFileName : reviewInfo.thumbNailFileName
			
		});
		
	},
	getEmailEscapedfromDomain: function(email){
		
		if(!email) return email;
		
		var pos = email.indexOf('@');
		
		var newEmail = email.substring(0,pos); 
		
		return newEmail;
	},
	getSingleReview: function(key,firebase){
		
		//var reviewRef = firebase.database().ref("ReviewsByDate/" + key);
		
		return firebase.database().ref('/ReviewsByDate/' + key).once('value').then(function(snapshot) {
			return snapshot.val();
		});
		
		
		
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
