const { admin,db } = require('../util/admin');

const config = require('../util/config');

//bring firebase
const firebase = require('firebase');
firebase.initializeApp(config);

//bring validation services
const {
	validateSignupData,
	validateLoginData
 } = require('../util/validate');

//signup method
exports.signup = (request, response) => {
    //forms for user signup
    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle,
    };

    //bring validation method and validates signup
    const { valid,errors } = validateSignupData(newUser);
    if (!valid) {
        return response.status(400).json(errors);
    }

    let token,userId; //initialize token and userId object
    //take json to add to db after authenticating data
    db.doc(`/users/${newUser.handle}`).get()
	//check if user exist: create user
	.then((doc) => {
		if(doc.exists){
			return response.status(400).json({ handle: 'this handle is already taken'});
		} else {
			return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
		}
	})
	//return token after user created
	.then((data) => {
		userId = data.user.uid; //get user uid
		return data.user.getIdToken();
	})
	//fields for return token
	.then((idtoken) => {
		token = idtoken;
		const userCredentials = {
			handle: newUser.handle,
			email: newUser.email,
			createdAt: new Date().toISOString(),
			userId
		};
		return db.doc(`/users/${newUser.handle}`).set(userCredentials);
	})
	.then(() => {
		return response.status(201).json({ token })
	})
	.catch((err) => {
		console.error(err);
		if(err.code === 'auth/email-already-in-use'){
			return response.status(400).json({ email: 'email is already in use'});
		} else {
			return response.status(500).json({ general: 'something went wrong, please try again'});
		}
	});
}

//login method
exports.login = (request,response) => {
	//store json into user object
    const user = {
        email: request.body.email,
        password: request.body.password
    }

	//validate user object
    const { valid,errors } = validateLoginData(user);
    if (!valid) {
        return response.status(400).json(errors);
    }

    //login user
    firebase.auth().signInWithEmailAndPassword(user.email,user.password)
	//return token
	.then((data) => {
		return data.user.getIdToken();
	})
	.then((token) => {
		return response.json({token});
	})
	.catch((err) => {
		console.error(err);
		//auth/wrong-password
		//auth/user-not-found 
		if(err.code === 'auth/wrong-password') {
			return response.status(403).json({ general: 'wrong credentials, please try again' });
		}
		else {
			return response.status(500).json({ general: 'wrong credentials, please try again' });
		}
	});
}