const functions = require('firebase-functions')
const app = require('express')()

const { getAllMurmurs, postMurmur, getMurmur, deleteMurmur, makeComment, likeComment, unlikeComment } = require('./handlers/murmurs')
const { signup, login, uploadImage, addUserDetails, getUserInfo } = require('./handlers/users')
const fbAuth = require('./utility/fbAuth')
const { db } = require('./utility/admin')

// Murmurs  routes 
app.get('/murmurs', getAllMurmurs)
app.post('/murmur', fbAuth, postMurmur)
app.get('/murmur/:murmurId', getMurmur)
app.delete('/murmur/:murmurId', fbAuth, deleteMurmur)
app.post('/murmur/:murmurId/comment', fbAuth, makeComment)
app.get('/murmur/:murmurId/like', fbAuth, likeComment)
app.get('/murmur/:murmurId/unlike', fbAuth, unlikeComment)


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

//the purpose of using different functions for notification??

exports.createNotificationOnLike = functions
    .region('us-central1')
    .firestore.document('likes/{id}')
    .onCreate( (snapshot) => {
        db.doc(`/murmurs/${snapshot.data().murmurId}`).get()
        .then( (doc) => {
            if (doc.exists) {
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    type: 'like',
                    read: false,
                    murmurId: doc.id
                })
            } 
        })
        .then( () => {
            return
        })
        .catch( (err) => {
            console.error(err)
            return
        })
    })


exports.deleteNotificatiOnUnlike = functions
    .region('us-central1')
    .firestore.document('likes/{id}')
    .onDelete( (snapshot) => {
        db.doc(`/notifications/${snapshot.id}`).delete()
        .then(() => {
            return
        })
        .catch( (err) => {
            console.error(err)
            return
        })
    })


exports.createNotificationOnComment = functions
    .region('us-central1')
    .firestore.document('comments/{id}')
    .onCreate( (snapshot) => {
        db.doc(`/murmurs/${snapshot.data().murmurId}`).get()
        .then( (doc) => {
            if (doc.exists) {
                return db.doc(`/notifications/${snapshot.id}`).set({
                    createdAt: new Date().toISOString(),
                    recipient: doc.data().userHandle,
                    sender: snapshot.data().userHandle,
                    type: 'comment',
                    read: false,
                    murmurId: doc.id
                })
            } 
        })
        .then( () => {
            return
        })
        .catch( (err) => {
            console.error(err)
            return
        })
    })

