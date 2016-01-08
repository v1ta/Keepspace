Template.header.onRendered(function(event) {
    Session.set('showFriendPage', false);
    $(document).mouseup(function (e){
        if (!$("#friendRequests").is(e.target) // if the target of the click isn't the container...
            && $("#friendRequests").has(e.target).length === 0) // ... nor a descendant of the container
        {
            // $("#friendRequests").hide();
            Session.set("showFriendPage", false);
        }
    });
});

Template.header.helpers({
    showFriendPage: function(){
        return Session.get("showFriendPage");
    },
});

Template.friendRequestPage.events({
    'click [data-action=accept]': function() {
        this.accept();
    },
    'click [data-action=deny]': function() {
        var result = confirm("Are you sure you don't want to be friends?");
        if (result){
            this.deny();
        }
        else{
            
        }
    },
    // user object methods
    'click [data-action=unfriend]': function() {
        //assumes context is a instance of a user
        var result = confirm("Are you sure you want to end your friendship?");
        if (result){
            this.unfriend();
        }
        else{
            
        }
    },
})
Template.friendRequestPage.helpers({
    friendRequests: function() {
        var results =  Meteor.requests.find({
            $or: [
                {userId:Meteor.userId()},
                {requesterId:Meteor.userId()}
            ]
        });
        console.log(Meteor.users.findOne("M3EaWLmSDBCPuZ2w8"))
        return results;
    },
    isOutgoing: function(requesterId){
        var userId = Meteor.userId();
        if (requesterId == userId){
            console.log("true");
            return true;
        }
        else{
            return false;
        }
    },
    mutualFriends: function(requesterId){
        var myFriends =  getFriendIds();
        theirFriendsAsUsers = Meteor.users.findOne("M3EaWLmSDBCPuZ2w8").friendsAsUsers().fetch();

        var theirFriends = [];
        for (var i = 0; i < theirFriendsAsUsers.length; i++) {
            theirFriends.push(friends[i]._id);
        }

        myFriends.sort();
        theirFriends.sort();
        numMutualFriends = 0;
        myIndex = 0;
        theirIndex = 0;
        while (myIndex < myFriends.length && theirIndex < theirFriends.length){
            if (myFriends[myIndex] == theirFriends[theirIndex]){
                numMutualFriends += 1;
                myIndex += 1;
                theirIndex += 1;
            }
            else if (myFriends[myIndex] < theirFriends[theirIndex]){
                myIndex += 1;
            }
            else{
                theirIndex += 1;
            }
        }
        return numMutualFriends.toString() + " mutual friends";
    },
    numFriends: function(friendId){
        //console.log(Meteor.users.findOne({_id:"M3EaWLmSDBCPuZ2w8"}));
        theirFriendsAsUsers = Meteor.users.findOne({_id:friendId}).friendsAsUsers().fetch();
        console.log(Meteor.users.findOne({_id:friendId}));
        console.log(Meteor.users.findOne({_id:friendId}).friendsAsUsers());
        console.log(theirFriendsAsUsers);
        theirFriends = Meteor.friends.find();
        console.log(theirFriends.fetch());
    }
});
