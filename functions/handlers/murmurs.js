const { db } = require('../utility/admin')

exports.getAllMurmurs = (req, res) => {
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
}


exports.postMurmur = (req, res) => {
    const newMurmur = {
        body: req.body.body,
        userHandle: req.user.handle, //From FBAuth line66
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
}


exports.getMurmur = (req,res) => {
    let murmurData = {}
    db.doc(`/murmurs/${req.params.murmurId}`).get()
    .then((doc) => {
        if (!doc.exists) {
            return res.status(404).json({ message: 'Murmur not found' })
        }
        murmurData = doc.data()
        murmurData.murmurId = doc.id
        return db.collection('comments').orderBy('createdAt','desc').where('murmurId', '==', req.params.murmurId).get()
    })
    .then((data) => {
        murmurData.comments = []
        data.forEach((doc) => {
            murmurData.comments.push(doc.data())
        })
        return res.json(murmurData)
    })
    .catch((err) => {
        console.error(err)
        res.status(500).json({ error: err.code})
    })
}


exports.makeComment = (req,res) => {
    if(req.body.body.trim() === '') return res.status(400).json({ message: 'Comment must not be empty'})

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        murmurId: req.params.murmurId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    }
    db.doc(`/murmurs/${req.params.murmurId}`).get()
    .then((doc) => {
        if (!doc.exists) {
            return res.status(404).json({ error: 'Murmur not found' })
        }
        return db.collection('comments').add(newComment)
    })
    .then(()=> {
        res.json(newComment)
    })
    .catch((err) => {
        console.error(err)
        return res.status(500).json({ message: 'something went wrong' })
    })
}

