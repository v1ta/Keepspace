Schemas = {};


Schemas.FriendEdge = new SimpleSchema({
    userId: {
        type: String,
        label: "userId",
        max: 100
    },
    friendList: {
        type: [String],
        label: "friendList",
        max:1000 //1000 friends cap
    }
});

Schemas.FindFriend = new SimpleSchema({
    userId: {
        type: String,
        label: "userId",
        max: 100
    },
    username: {
        type: String,
        label: "username",
        max: 50
    }
});

Scheme.Notification = new SimpleSchema({
    type: {
        type: String,
        label: "type",
        max: 100
    },
    to: { //use email as unique id?
        type: String,
        label: "to",
        max: 100
    },
    from: { //use email as unique id?
        type: String,
        label: "from",
        max: 100
    }
})

Schemas.Thought = new SimpleSchema({
    friendList: {
        type: [String],
        label: "friendList",
        max: 1000
        //optional: true //might break non-friend queries in aggregate collection
    },
    userId: {
        type: String,
        label: "userId",
        max: 100
    },
    text: {
        type: String,
        label: "text",
        max: 3000,
    },
    createdAt: {
        type: Date,
        label: "createdAt"
    },
    rank :{
        type: Number,
        label: "rank",
        max: 1000,
        optional: true // until the scoring feature is implemented
    },
    username: {
        type: String,
        label: "username",
        max: 200
    },
    position: {
        type: Object,
        label: "position",
        optional: true
    }

});
