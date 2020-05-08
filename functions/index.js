const functions = require('firebase-functions')
const admin = require('firebase-admin')
const firebase = require('firebase')
const app = require('express')()
const db = admin.firestore()
const firebaseConfig = {
    apiKey: "AIzaSyDl3rOGtSFsTaLJPPaQYSjB5lceU8frA3Q",
    authDomain: "socialapp0427.firebaseapp.com",
    // databaseURL: "https://socialapp0427.firebaseio.com",
    databaseURL: "http://localhost:8080",
    projectId: "socialapp0427",
    storageBucket: "socialapp0427.appspot.com",
    messagingSenderId: "628482789237",
    appId: "1:628482789237:web:344fba7b59d8e6a8d70d3c",
    measurementId: "G-1M46YDGYX0"
}
admin.initializeApp(firebaseConfig)
firebase.initializeApp(firebaseConfig)

// https://baseurl.com/api/
exports.api = functions.https.onRequest(app)

// Murmurs
// first parameter is the name of the route, second is the handler
app.get('/murmurs', (req, res) => {
    db.collection("murmurs").orderBy('createdAt','desc').get()
    .then(data => {
        let murmurs = []
        data.forEach(doc => {
            murmurs.push({
                murmurId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            })
        })
        return res.json(murmurs)
    })
    .catch(err => console.error(err))
})
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

app.post('/murmur', (req, res) => {
    const newMurmur = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        // createdAt: admin.firestore.Timestamp.fromDate(new Date())
        createdAt: new Date().toISOString()
    }

    db.collection('murmurs').add(newMurmur) //新增newMurmur 在firestore database collection裡的murmur
    .then((doc) => {
        res.json({ message: `document ${doc.id} was created successfully`})
    })
    .catch((err) => {
        res.status(500).json({ error: "something went wrong"})
        console.error(err)
    })
})

// User's registration
// Signup route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmedPassword: req.body.confirmedPassword,
        handle: req.body.handle,
    }

    //TODO: validate data

    firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
        return res.status(201).json({ message: `User ${data.user.uid} signed up successfully`})
    })
    .catch((err) => {
        console.error(err)
        return res.status(500).json({ error: err.code })
    })
})


