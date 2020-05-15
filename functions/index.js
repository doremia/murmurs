const functions = require('firebase-functions')
const app = require('express')()

const { getAllMurmurs, postMurmur } = require('./handlers/murmurs')
const { signup, login, uploadImage, addUserDetails, getUserInfo } = require('./handlers/users')
const fbAuth = require('./utility/fbAuth')

// Murmurs  routes 
app.get('/murmurs', getAllMurmurs)
app.post('/murmur', fbAuth, postMurmur)

// Users routes
app.post('/signup', signup)
app.post('/login', login)
app.post('/user/image',fbAuth, uploadImage)
app.post('/user', fbAuth, addUserDetails)
app.get('/user', fbAuth, getUserInfo)

// exports.getMurmurs = functions.https.onRequest((req, res)=> {
//     admin.firestore().collection("murmurs").get()
//     .then(data => {
//         let murmurs = []
//         data.forEach(doc => {
//             murmurs.push(doc.data())
//         })
//         return res.json(murmurs)
//     })
//     .catch(err => console.error(err))
// })


// https://baseurl.com/api/
exports.api = functions.https.onRequest(app)
