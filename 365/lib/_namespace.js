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
        max: 1000 //1000 friends cap
    }
});

Schemas.Notifications = new SimpleSchema({
    userId: {
        type: String,
        label: "userId",
        max: 100
    },
    friendId: {
        type: String,
        label: "friendId",
        max: 100
    },
    type: {
        type: String,
        label: "type",
        max: 100,
        optional: true
    },
    text: {
        type: String,
        label: "text",
        max: 200,
        optional: true
    },
    createdAt: {
        type: Date,
        label: "createdAt"
    },
    seen: {
        type: Boolean,
        label: "seen",
        optional: true
    }

});


Schemas.Thought = new SimpleSchema({
    friendList: {
        type: [String],
        label: "friendList",
        max: 1000,
        optional: true //might break non-friend queries in aggregate collection
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
    rank: {
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
    },
    collectedBy: {
        type: [String],
        label: "collectedBy",
        max: 1000
    },
    randomIndex: {
        type: Number, // between 1 and 100000000
        label: "randomIndex",
        optional: false
    },
    privacy: {
        type: String,
        label: "privacy",
        allowedValues: ['private', 'friends', 'public']
    }
});

searchUsers = function (searchString) {
    var filter = new RegExp('^' + searchString, 'i');
    check(filter, RegExp);
    var cursor = Meteor.users.find(
        {username: filter},
        {sort: {username: 1}, limit: 20}
    );
    return cursor;
}

friendUsers = function () {
    return Meteor.friends.find({userId: Meteor.userId()}, {_id: 0, userId: 0, friendId: 1});
}
