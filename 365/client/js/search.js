Template.friendSearch.helpers({
    users: function() {
            return searchUsers(Session.get("searchString"));
    },
    /* count not worth the extra compute power
    friendCount: function() {
            return searchUsers(Session.get("searchString")).count();
    },
    */
    canRequest: function(userId){
        var request = Meteor.requests.findOne({
            $or: [
                {userId: Meteor.userId(),requesterId:userId},
                {userId: userId,requesterId:Meteor.userId()}
            ]
        });

        if (request === undefined)
            return true
        else
            return false;
    },
    notCurrentUser: function(userId){
        if (userId != Meteor.userId())
            return true;
        else
            return false;
    },
    notFriend: function(userId){
        var friend = Meteor.friends.findOne({userId:Meteor.userId(), friendId:userId});
        if (friend == undefined)
            return true;
        else
            return false;
    },
    'selectedClass': function(){
        var userFound = this._id;
        var selectedUser = Session.get('selectedUser');
        if(userFound == selectedUser){
            return "selected"
        }
    },
    'hasInput': function() {
        var searchString = Session.get('searchString');
        if (searchString.length > 0)
            return true;

    }

});

Template.friendSearch.events({
    "click #search-friends": function(event) {
        var searchString = $('#search-friends').val();
        Session.set('searchString', searchString);
    },
    "click .searchUser": function(e){
        var userFound = this._id;
        Session.set('selectedUser', userFound);
    },
    "click #send-friend-request": function(){   
        var sendTo = Meteor.users.findOne({_id:this._id});
        if (sendTo != undefined){
            sendTo.requestFriendship();
            sAlert.success('Friend Request Sent', {position: 'bottom'});
        }else{
            sAlert.error('Could Not Send Request', {position: 'bottom'});
        }
    },
    "click #cancel-friend-request": function(){
        var sendTo = Meteor.users.findOne({_id:this._id});
        if (sendTo != undefined){
            sendTo.cancelFriendshipRequest();
            sAlert.success('Friend Request Cancelled', {position: 'bottom'});
        }else{
            sAlert.error('Could Not Cancel Request', {position: 'bottom'});
        }
    },
    "keyup #search-friends": _.throttle(function(ev) {
    var searchString = $('#search-friends').val();
        Session.set('searchString', searchString);
  }, 1500)
});

Template.friendSearch.onCreated(function() {
        Session.set('searchString', '');
});

Tracker.autorun(function() {
    Meteor.subscribe('SearchUsers', Session.get('searchString'));
});