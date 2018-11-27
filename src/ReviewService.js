var ReviewService = {
	uploadToStorage : function(axios,file,email,token){
		
		var FILE_LENGTH = file.length
		console.log(FILE_LENGTH);
		const STORAGE_URL = 'https://www.googleapis.com/upload/storage/v1/b/entrypoint-9aa5e.appspot.com/o'; 
		return FILE_LENGTH;
		/*
		axios.post(STORAGE_URL,{
			'Authorization' : 'Bearer ' + token,
			'Content-Type' : 'multipart/form-related',
			'Content-Length' : FILE_LENGTH
		}).then(function(res){
			
			return res;
			
		)};
		*/
	}
}
module.exports = ReviewService;
