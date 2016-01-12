Template.header.onRendered(function(event) {
    // Session.set('showFriendPage', false);
    Session.set("friendSearchString", false);
    $(document).mouseup(function (e){
        if (!$("#friendRequests").is(e.target) // if the target of the click isn't the container...
            && $("#friendRequests").has(e.target).length === 0) // ... nor a descendant of the container
        {
            // $("#friendRequests").hide();
            // Session.set("showFriendPage", false);
        }
    });
    // $(document).keyup(function (e) {
    //     if ($("#friendSearch:focus") && (e.keyCode === 13)) {
    //        Session.set("friendSearchString", $("#friendSearch").val());
    //     }
    //  });
});

Template.header.helpers({
    // showFriendPage: function(){
    //     return Session.get("showFriendPage");
    // },
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
    "keyup #friendSearch": _.throttle(function(ev) {
        var searchString = $('#friendSearch').val();
            Session.set('friendSearchString', searchString);
      }, 1500),
    'click #friendSearchIcon': _.throttle(function(ev) {
        var searchString = $('#friendSearch').val();
            Session.set('friendSearchString', searchString);
      }, 1500),
})
Template.friendRequestPage.helpers({
    friendRequests: function() {
        var results =  Meteor.requests.find({
            $or: [
                {userId:Meteor.userId()},
                {requesterId:Meteor.userId()}
            ]
        });
        // console.log(Meteor.users.findOne("M3EaWLmSDBCPuZ2w8"))
        // console.log("friend request results:");
        // console.log(results.fetch());
        // return results;
        var ready = Meteor.subscribe('friendRequests').ready();
        // console.log(ready);
        return {
              data: results,
              ready: ready
          };
    },
    friends: function(){
        var ready = Meteor.subscribe('friends').ready();
        var data = getFriendsAsUsers();
        return{
            data: data,
            ready: ready
        };
    },
    isOutgoing: function(requesterId){
        var userId = Meteor.userId();
        if (requesterId == userId){
            // console.log("true");
            return true;
        }
        else{
            return false;
        }
    },
    mutualFriends: function(requesterId){
        // var myFriends =  getFriendIds();
        // theirFriendsAsUsers = Meteor.users.findOne("M3EaWLmSDBCPuZ2w8").friendsAsUsers().fetch();
        // console.log("mutual friends:");
        // console.log(getFriendIds());
        // console.log(requesterId);
        Meteor.call("commonFriends", requesterId, function(returnValue){
            if (err)
                console.log(err);
            else
                Session.set(requesterId, returnValue);
        });
        return Session.get(requesterId);
    },
    numFriends: function(friendId){
        callback = function(err, data){
            if (err)
                console.log(err);
            else{
                // console.log("num friends:");
                // console.log(data);
                // console.log(friendId);
                Session.set(friendId, data);
                // console.log(Session.get(friendId));
            }
        };
        numFriends = Meteor.call('numFriends',friendId, callback);
        return Session.get(friendId);
    },
    searchFriendInput: function(){
        // console.log("searchFriendInput");
        var searchString = Session.get('friendSearchString');
        if (searchString && searchString.length > 0)
            return true;
        else
            return false;
    },
    friendSearchResult: function(){
        // console.log("friendSearchResult");
        users = searchUsers(Session.get("searchString")).fetch();
        friends = getFriendIds();
        // console.log(users);
        // console.log(friends);

        topResults = [];
        theRest = [];

        for (var i = 0; i < users.length; i++){
            user = users[i];
            if (user._id != Meteor.userId()){
                var isFriend = false;
                for(var j = 0; j < friends.length; j++){
                    if (friends[j] == user._id){
                        topResults.push(user);
                        friends.splice(j);
                        isFriend = true;
                        break
                    }
                }
                if (!isFriend){
                    theRest.push(user);
                }
            }
        }
        // console.log(Meteor.users.find().fetch());
        return $.merge(topResults, theRest);
    }
});


Tracker.autorun(function() {
    Meteor.subscribe('SearchUsers', Session.get('friendSearchString'));
});
