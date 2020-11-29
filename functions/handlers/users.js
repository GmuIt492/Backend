const { admin,db } = require('../util/admin');

const config = require('../util/config');

//bring firebase
const firebase = require('firebase');
firebase.initializeApp(config);

//bring nodemailer
const {resolve} = require('path')
require('dotenv').config({
    path: resolve(__dirname,"../.env")
})
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

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
			return response.status(400).json({ handle: 'This handle is already taken'});
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
			return response.status(400).json({ email: 'Email is already in use'});
		} else {
			return response.status(500).json({ general: 'Something went wrong, please try again'});
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
	//get token
	.then((data) => {
		return data.user.getIdToken();
    })
    //store token and code
	.then((token) => {
		db.doc(`/users/${user.email}`).update({
            'token': token,
            'code': Math.floor(1000 + Math.random() * 8999)
        })
    })
    //send verification email
    .then(() => {
        let mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Everyday Eyecare Verification Code',
            text: 'Verification Code: ' + Math.floor(1000 + Math.random() * 8999)
        }
        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
                console.error('Error sending email');
            }
            else {
                console.error('Email sent');
            }
        });
    })
    //return success
    .then(() => {
        const result = {'status':true};
        return response.json(result);
    })
	.catch((err) => {
		console.error(err);
		//auth/wrong-password
		//auth/user-not-found 
		if(err.code === 'auth/wrong-password') {
			return response.status(403).json({ general: 'Error' });
		}
		else {
			return response.status(500).json({ general: 'Error' });
		}
	});
}

//verify code to get token
exports.loginVerification = (request,response) => {
    //store json into user object
    const user = {
        email: request.body.email,
        code: request.body.code
    }

    db.doc(`/users/${user.email}`).get()
	.then((doc) => {
		if(doc.exists){
            userData = doc.data();
            const result = {'token':''};
            console.log(userData);
            console.log(user);
            if (userData.code == user.code) {
                result.token = userData.token;
            }
            return response.json(result);
		}
	})
	.catch(err => {
		console.error(err);
		return response.status(500).json({ error: err.code })
	})
}

//get user details method
exports.getAuthenticatedUser = (request,response) => {
    let userData = {};

    //get user details from db
    db.doc(`/users/${request.user.handle}`).get()
	.then((doc) => {
		if(doc.exists){
            userData.credentials = doc.data();
            return response.json(userData);
		}
	})
	.catch(err => {
		console.error(err);
		return response.status(500).json({ error: err.code })
	})
}