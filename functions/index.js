const functions = require('firebase-functions');

//bring express node js
//npm install --save express
const app = require('express')();

//bring FBAuth middleware to protect routes
const FBAuth = require('./util/fbAuth');

// const { db } = require('./util/admin');

//npm install --save cors
const cors = require('cors');
app.use(cors());

//bring methods from functions/handlers
const { 
    getAllFeedback,
    createFeedback,
    getFeedback,
    deleteFeedback
 } = require('./handlers/feedback');
const {
    signup,
    login,
    addUserDetails,
    uploadImage,
    getAuthenticatedUser
 } = require('./handlers/users');

//post.js routes
app.get('/feedback', getAllFeedback);
app.post('/feedback', FBAuth, createFeedback);
app.get('/feedback/:feedbackId', getFeedback);
app.delete('/feedback/:feedbackId', FBAuth, deleteFeedback);

//users.js routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user', FBAuth, addUserDetails);
app.post('/user/image', FBAuth, uploadImage);
app.get('/user', FBAuth, getAuthenticatedUser);

//add /api extention to api links for convention
exports.api = functions.https.onRequest(app);