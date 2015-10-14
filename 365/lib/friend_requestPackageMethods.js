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
})

function getFriendList(callback){
    return Friends.find({userId: this.userId}, {friendList:{},  _id:0}).fetch();
}

Meteor.friends.after.insert(function (userId, doc){
    if (doc.userId != Meteor.userId()){
        Notifications.insert({userId:doc.userId, friendId:doc.friendId, type:"acceptRequest", createdAt: new Date(), seen:false});
    }
});