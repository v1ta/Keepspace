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
        if (result) {
            this.deny();
        }
    },
    'click [data-action=unfriend]': function() { // user object methods

        var result = confirm("Are you sure you want to end your friendship?"); //assumes context is a instance of a user
        if (result){
            this.unfriend();
        }
    },
    "click .icon-addfriend": function(event){   
        var sendTo = Meteor.users.findOne({_id:this._id});
        if (sendTo != undefined){
            sendTo.requestFriendship();
            sAlert.success('Friend Request Sent', {position: 'bottom'});
        }else{
            sAlert.error('Could Not Send Request', {position: 'bottom'});
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
        var requests = results.fetch();
        var numRequests = 0;
        var userId = Meteor.userId();
        for (var i = 0; i < requests.length; i++){
            if (requests[i].userId == userId){
                numRequests += 1;
                console.log(requests[i]);
            }
        }
        Session.set("numRequests", numRequests);
        // console.log(ready);
        return {
              data: results,
              ready: ready
          };
    },
    numRequests: function(){
        return Session.get("numRequests");
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
            return true;
        } else {
            return false;
        }
    },
    mutualFriends: function(requesterId){
        // var myFriends =  getFriendIds();
        // theirFriendsAsUsers = Meteor.users.findOne("M3EaWLmSDBCPuZ2w8").friendsAsUsers().fetch();
        // console.log("mutual friends:");
        // console.log(getFriendIds());
        // console.log(requesterId);
        callback = function(err, data){
            console.log(data);
            if (err)
                console.log(err);
            else{
                Session.set(requesterId, data);
                // console.log(Session.get(requesterId))
            }
        }
        Meteor.call("commonFriends", requesterId, callback);
        return Session.get(requesterId);
    },
    numFriends: function(friendId){
        callback = function(err, data){
            if (err)
                console.log(err);
            else{
                // console.log("num friends:");
                // console.log(data);
                result = "";
                if (data == 1){
                    result = " friend";
                }
                else{
                    result = " friends";
                }

                // console.log(friendId);
                Session.set(friendId, data.toString() + result);
                // console.log(Session.get(friendId));
            }
        };
        numFriends = Meteor.call('numFriends',friendId, callback);
        return Session.get(friendId);
    },
    searchFriendInput: function(){
        console.log("searchFriendInput");
        var searchString = Session.get('friendSearchString');
        if (searchString && searchString.length > 0)
            return true;
        else
            return false;
    },
    friendSearchResult: function(){
        // console.log("friendSearchResult");
        var ready = Meteor.subscribe('SearchUsers', Session.get('friendSearchString')).ready();
        users = searchUsers(Session.get("friendSearchString")).fetch();
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
                        user.isFriend = true;
                        isFriend = true;
                        break
                    }
                }
                if (!isFriend){
                    // console.log(friends);
                    // console.log(user._id);
                    // console.log(user);
                    user.isFriend = false;
                    theRest.push(user);
                }
            }
        }
        // console.log(Meteor.users.find().fetch());
        // console.log(friends);
        
        var data = $.merge(topResults, theRest);
        return{
            data: data,
            ready: ready
        };
        // return Meteor.users.find().fetch();
    }
});


Tracker.autorun(function() {
    Meteor.subscribe('SearchUsers', Session.get('friendSearchString'));
});
