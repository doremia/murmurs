const admin = require('firebase-admin')
const firebaseConfig = require('./config')

admin.initializeApp(firebaseConfig)
const db = admin.firestore()

module.exports = { admin, db }