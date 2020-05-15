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
        return db.collection('comments').where('murmurId', '==', req.params.murmurId).get()
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