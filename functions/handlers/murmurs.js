const { db } = require('../utility/admin')

const getAllMurmurs = (req, res) => {
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

const postMurmur = (req, res) => {
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

module.exports = { getAllMurmurs, postMurmur }