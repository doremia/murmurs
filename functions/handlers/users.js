const { admin, db } = require('../utility/admin')
const { validateUserSignup, validateLogin, reduceUserDetails } = require('../utility/validation')
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

    const noImg = 'no-img.png'
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
            imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
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


exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body)
    db.doc(`/users/${req.user.handle}`).update(userDetails)
    .then(() => {
        return res.json({ message :'Details added.' })
    })
    .catch((err) => {
        console.error(err)
        return res.status(500).json({ error: err.code})
    })
}


exports.getUserInfo = (req, res) => {
    let userData = {}
    db.doc(`/users/${req.user.handle}`).get()
    .then((doc) => {
        if(doc.exists) {
            userData.credentials = doc.data()
            return db.collection('likes').where('userHandle', '==', req.user.handle).get()        
        }
    })
    .then( (data) => {
        userData.likes = []
        data.forEach((doc) => {
            userData.likes.push(doc.data())
        })
        return db.collection('notifications').where('recipient', '==', req.user.handle)
            .orderBy('createdAt', 'desc').limit(10).get()
    })
    .then( (data) => {
        userData.notifications = []
        data.forEach( (doc) => {
            userData.notifications.push({
                recipient: doc.data().recipient,
                sender: doc.data().sender,
                createdAt: doc.data().createdAt,
                murmurId: doc.data().murmurId,
                type: doc.data().type,
                read: doc.data().read,
                notificationId: doc.id
            })
        })
        return res.json(userData)
    })
    .catch((err) => {
        console.error(err)
        return res.status(500).json({ error: err.code })
    })
}


exports.uploadImage = (req,res) => {
    const Busboy = require('busboy')
    const path = require('path')
    const os = require('os')
    const fs = require('fs')

    const busboy = new Busboy({ headers: req.headers })

    let imageToBeUploaded = {}
    let imageFilename

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ message: "uh oh! Wrong media type." })
        }
        //.png
        const imageExtension = filename.split('.')[filename.split('.').length - 1]
        // 39779856349.png
        imageFilename = `${Math.round(Math.random()*100000000000)}.${imageExtension}`
        // what does it look like ? 
        const filepath = path.join(os.tmpdir(), imageFilename)
        imageToBeUploaded = { filepath, mimetype }
        // create a file
        file.pipe(fs.createWriteStream(filepath))
    })

    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        }) //upload the file to storage?
        .then(() => {
            // adding alt=media will show the image in the browser instead of downloading it. 
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFilename}?alt=media`
            // add the URL to our db of users. It's authenticated already so we have a user obejct here for the use.
            return db.doc(`/users/${req.user.handle}`).update({ imageUrl })
        })
        .then(() => {
            return res.json({ message: 'Image was uploaded successfully'})
        })
        .catch((err) => {
            console.error(err)
            return res.status(500).json({ error: err.code })
        })
    })

    busboy.end(req.rawBody)
}


