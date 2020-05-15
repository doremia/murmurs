let db = {
    users: [
        {
            userId:'meow',
            email: 'user@email.com',
            handle: 'user',
            imageUrl: 'image/fgre/ferfece',
            bio: 'What is inside your butthole?',
            website: 'https://users.com',
            location:'london, UK',
        }
    ],
    murmurs: [
        {
            userHandle: 'user',
            body: "from dbschema.js",
            createdAt: "2020-05-06T23:38:58.665Z"
            likeCount: 5,
            commentCount: 2
        }
    ],
    comments: [
        {
            userHandle: 'user',
            murmurId: '3XMLH5Vw5LT5y4JYTiTT',
            body: 'Nice',
            createdAt: '2020-05-06T23:38:58.665Z'
        }
    ]
}

const userDetails = {
    //Redux data
    credentials: {
        userId: "WJ8vPFU72sVyTcnSMnBOWAWX5XW2",
        bio: "Meow",
        createdAt: "2020-05-14T22:03:54.283Z",
        email: "test00@gmail.com",
        handle: "test00",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/socialapp0427.appspot.com/o/no-img.png?alt=media",
        location: "london",
        website: "https://google.com"
    },
    likes: [
        {
            userHandle: 'test00',
            murmurId: ''
        },
        {
            userHandle: 'test00',
            murmurId: ''
        },
    ]
}