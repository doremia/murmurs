const { db } = require('../utility/admin')
const { validateUserSignup, validateLogin } = require('../utility/validation')
const firebase = require('firebase')
const firebaseConfig = require('../utility/config')

firebase.initializeApp(firebaseConfig)

exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmedPassword: req.body.confirmedPassword,
        handle: req.body.handle,
    }
    // Validate the data before sending to the server to check if the handle or email is taken.
    const { errors, valid } = validateUserSignup(newUser)
    if (!valid) return res.status(400).json(errors)

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
}


exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    }

    const { errors, valid } = validateLogin(user)
    if (!valid) return res.status(400).json(errors)

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
        return data.user.getIdToken()
    })
    .then((token) => {
        return res.json({ Token: token })
    })
    .catch((err) =>{
        console.log(err)
        if (err.code ==='auth/wrong-password'){
            return res.status(403).json({ general: 'Wrong password'})
        } else {
        return res.status(500).json({ error: err.code })
        }
    })
}
