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
    deleteFeedback
 } = require('./handlers/feedback');
const { 
    getHeader,
    createHeader,
    deleteHeader,
    getHour,
    createHour
 } = require('./handlers/edit');
const {
    signup,
    login,
    getAuthenticatedUser
 } = require('./handlers/users');

//feedback.js routes
app.get('/feedback', FBAuth, getAllFeedback);
app.post('/feedback', createFeedback);
app.delete('/feedback/:feedbackId', FBAuth, deleteFeedback);

//edit.js routes
app.get('/header', getHeader);
app.post('/header', FBAuth, createHeader);
app.delete('/header', FBAuth, deleteHeader);
app.get('/hour', getHour);
app.post('/hour', FBAuth, createHour);

//users.js routes
app.post('/signup', signup);
app.post('/login', login);
app.get('/user', FBAuth, getAuthenticatedUser);

//add /api extention to api links for convention
exports.api = functions.https.onRequest(app);