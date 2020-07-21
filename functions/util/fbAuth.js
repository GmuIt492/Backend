const { admin,db } = require('../util/admin');

//middleware for firebase authentication to post
module.exports = (request,response,next) => {
    let idToken; //initialize token for auth
    if(request.headers.authorization && request.headers.authorization.startsWith('Bearer ')){
        //"Bearer {token}"
        idToken = request.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('no token found');
        return response.status(403).json({ error: 'unauthorized'})
    }

    //verify token issued by our app after token found
    admin.auth().verifyIdToken(idToken)
	//decodes token
	.then((decodedToken) => {
		request.user = decodedToken;
		return db.collection('users')
			.where('userId', '==', request.user.uid)
			.limit(1)
			.get();
	})
	//return data
	.then((data) => {
		//first handle element of array from data function
		request.user.handle = data.docs[0].data().handle;
		request.user.imageUrl = data.docs[0].data().imageUrl;
		return next();
	})
	.catch((err) => {
		console.error('error while verifying token', err);
		return response.status(403).json({err});
	})
}