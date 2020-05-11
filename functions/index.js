const functions = require('firebase-functions')
const admin = require('firebase-admin')
const firebase = require('firebase')
const app = require('express')()

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
const db = admin.firestore()

// ***************  Murmurs  ************
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
        createdAt: new Date().toISOString()
    }
    //新增newMurmur 在firestore database collection裡的murmur
    db.collection('murmurs').add(newMurmur) 
    .then((doc) => {
        res.json({ message: `document ${doc.id} was created successfully`})
    })
    .catch((err) => {
        res.status(500).json({ error: "something went wrong"})
        console.error(err)
    })
})
//helper functions
const isEmpty = (string) => {
    if (string.trim() === '') return true
    else return false
}

const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (email.match(emailRegEx)) return true
    else return false
}

// ***************User's registration************

app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmedPassword: req.body.confirmedPassword,
        handle: req.body.handle,
    }
    // Validate the data before sending to the server to check if the handle or email is taken.
    let errors = {}
    if (isEmpty(newUser.email)) {
        errors.email = 'Must not be empty.'
    } else if (!isEmail(newUser.email)) {
            errors.email = 'Must be a valid email address'
    }
    if (isEmpty(newUser.password)) errors.password = 'Must not be empty'
    if (newUser.confirmedPassword !== newUser.password ) errors.confirmedPassword = 'Password is not the same'
    if (isEmpty(newUser.handle)) errors.handle = 'Must not be empty'
    
    if (Object.keys(errors).length > 0) return res.status(400).json(errors)

    //check if the handle or email is taken. 
    let token, userId
    db.doc(`/users/${newUser.handle}`).get()
    .then( (doc) => {
        if (doc.exists) {
            return res.status(400).json({ message: `${newUser.handle} is already taken.`})
        } else {
            return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
        }
    })
    .then((data) => {
        userId = data.user.uid
        return data.user.getIdToken()
    })
    .then((idToken) => {
        token = idToken //Why? token = token would return an empty object
        const userCredentials = {
            handle: newUser.handle,
            createdAt: new Date().toISOString(),
            email: newUser.email,
            userId
        }
                                                //.set() creates a doc
        return db.doc(`/users/${newUser.handle}`).set(userCredentials) 
    })
    .then(() => {
        return res.status(201).json({ token })
    })
    .catch((err) => {
        console.error(err)
        if (err.code === 'auth/email-already-in-use') {
            return res.status(400).json({ email: `Email is already taken.`})
        } else {
            return res.status(500).json({ error: err.code })
        }
    })
})


app.post('/login',(req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    }
    let errors = {}
    if (isEmpty(user.email)) errors.email = 'Must not be empty'
    if (isEmpty(user.password)) errors.password = 'Must not be empty'  
    if (Object.keys(errors).length > 0) return res.status(400).json( errors)

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
        return data.user.getIdToken()
    })
    .then((token) => {
        return res.json({ Token: token })
    })
    .catch((err) =>{
        console.log(err)
        return res.status(500).json({ error: err.code })
    })
})


// https://baseurl.com/api/
exports.api = functions.https.onRequest(app)
