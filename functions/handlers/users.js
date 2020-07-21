const { admin,db } = require('../util/admin');

const config = require('../util/config');

//bring firebase
const firebase = require('firebase');
firebase.initializeApp(config);

//bring validation services
const {
	validateSignupData,
	validateLoginData,
	reduceUserDetails 
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
	
	//default signup profile image
    const noImg = 'no-img.png';

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
			imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
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

//TODO add more variables for profile??
//add to profile method
exports.addUserDetails = (request, response) => {
    let userDetails = reduceUserDetails(request.body);

    //take json to add to db after authenticating data
    db.doc(`/users/${request.user.handle}`).update(userDetails)
	.then(() => {
		return response.json({ message: 'details added successfully'});
	})
	.catch((err) => {
		console.error(err);
		return response.status(500).json({ error: err.code });
	})
}

//upload profile image method
exports.uploadImage = (request, response) => {
    //npm install --save busboy
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    //store authorization token
    const busboy = new BusBoy({ headers: request.headers });

    let imageFileName;
    let imageToBeUploaded = {};
    
	//format image
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
            return response.status(400).json({ error: 'wrong file type submitted'});
        }
        //get .png from my.image.png
        const imageExtension = filename.split('.')[filename.split('.').length-1];
        //1232131.png
        imageFileName = `${Math.round(Math.random()*100000000)}.${imageExtension}`;
        //concat filepath
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        //create file
        file.pipe(fs.createWriteStream(filepath));
    });
    //execute
    busboy.on('finish', () => {
        //upload file
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        //construct image url
        .then(() => {
            //alt media to show on browser rather than download
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            //store url into user db
            //request.user can be used: already authenticate passed FBAuth
            return db.doc(`/users/${request.user.handle}`).update({ imageUrl });
        })
        //return success status
        .then(() => {
            return response.json({ message: "image uploaded successfully"});
        })
        .catch((err) => {
            console.error(err);
            return response.status(500).json({ error: err.code })
        });
    });
    busboy.end(request.rawBody);
}

//get user details method
exports.getAuthenticatedUser = (request,response) => {
    let userData = {};

    //get user details from db
    db.doc(`/users/${request.user.handle}`).get()
	.then((doc) => {
		if(doc.exists){
			userData.credentials = doc.data();
			return db.collection('likes').where('userHandle', '==', request.user.handle).get();
		}
	})
	//get number of likes
	.then((data) => {
		userData.likes = [];
		data.forEach((doc) => {
			userData.likes.push(doc.data());
		})
		return response.json(userData);
	})
	.catch(err => {
		console.error(err);
		return response.status(500).json({ error: err.code })
	})
}