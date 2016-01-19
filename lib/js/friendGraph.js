Meteor.methods({
	findFriend: function (friendId){
        if (!UserLoggedIn) return false;
        var friend = Meteor.users.find({userId: friendId}, {username:1}).fetch();
        if (friend !== 'undefined') {
            console.log(friend);
        }else {
            console.log("That person doesn't exist");
        }
    },
    commonFriends: function(their_id, callback) {
        var yourFriends = Meteor.friends.find({userId: this.userId}, {friendList: {}, _id: 0}).fetch();
        var theirFriends = Meteor.friends.find({userId: their_id}, {friendList: {}, _id: 0}).fetch();
        var matches = []
        for(var i = 0 ; i < yourFriends.length; i += 1) {
            for(var j = 0; j < theirFriends.length; j += 1) {
                if (yourFriends[i].friendId == theirFriends[j].friendId) {
                    matches.push(yourFriends[i]);
                }
            }
        }
        return matches.length;
    },
    numFriends: function(userId, callback){
        var numFriends = Meteor.friends.find({userId: userId}, {friendList: {}, _id: 0}).fetch().length;
        // console.log(numFriends);
        return numFriends;
    }
})

function getFriendList(callback){
    var friends = Meteor.friends.find({userId: this.userId}, {friendList:{},  _id:0}).fetch();
    // console.log(friends);
    return friends;
}

Meteor.friends.after.insert(function (userId, doc){
    if (doc.userId != Meteor.userId()){
        Notifications.insert({userId:doc.userId, friendId:doc.friendId, type:"acceptRequest", createdAt: new Date(), seen:false, read:false});
    }
});