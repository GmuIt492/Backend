//npm install --save firebase
const admin = require('firebase-admin');
admin.initializeApp();

//use db to refer to firestore
const db = admin.firestore();

//export  admin and db to other files
module.exports = { admin, db};