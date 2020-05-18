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
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    }
    //新增newMurmur 在firestore database collection裡的murmur
    db.collection('murmurs').add(newMurmur) 
    .then((doc) => {
        const resMurmur = newMurmur
        resMurmur.murmurId = doc.id
        res.json(resMurmur)
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


exports.likeComment = (req, res) => {
    const likeDoc = db.collection('likes').where('userHandle', '==', req.user.handle)
    .where('murmurId', '==', req.params.murmurId).limit(1)

    const murmurDoc = db.doc(`/murmurs/${req.params.murmurId}`)

    let murmurData

    murmurDoc.get()
    .then( (doc) => {
        if(doc.exists){
            murmurData = doc.data()
            murmurData.murmurId = doc.id

            return likeDoc.get()
        } else {
            return res.status(404).json({ error: "Murmur Not found"})
        }
    })
    .then( (data) => {
        if(data.empty){
            return db.collection('likes').add({
                murmurId: req.params.murmurId,
                userHandle: req.user.handle
            })
            .then(() => {
                console.log(murmurData.likeCount)
                murmurData.likeCount += 1
                return murmurDoc.update({ likeCount: murmurData.likeCount })
            })
            .then(() => {
                return res.json(murmurData)
            })
        } else {
            return res.status(400).json({ error: "Murmur already liked" })
        }
    })
    .catch( (err) => {
        console.error(err)
        res.status(500).json({ error: err.code })
    })
}

