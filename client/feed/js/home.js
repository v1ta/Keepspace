Meteor.subscribe("users");
Meteor.subscribe("avatars");
Meteor.subscribe("outgoingFriendRequests");
Meteor.subscribe('ignoredFriendRequests');

// Website has loaded
window.onload = function(event){
    //close dropdowns on outside click
    $(document).mouseup(function (event){
        var container = $(".dropdown-menu");
        // if the target of the click isn't the container... nor a descendant of the container
        if (!container.is(event.target) && container.has(event.target).length === 0){
            container.hide();
            $("#changePasswordForm").hide();
            $(".dropButton").show();
        }
        container = $("#main-menu");
        if (!container.is(event.target) && container.has(event.target).length === 0){
            hideMainMenu();
        }
    });
    var configuration = {"location": null};
    if (!configuration){
        getLocation()
    }

    // Set countdown timer
    setTime();
    Meteor.setInterval(setTime, 1000);
}

function getFriendsAsUsers() {
    var friends = Meteor.friends.find();
    var friendsAsUsers = [];
    friends.forEach(function (friend) {
        friendsAsUsers.push(friend.user());
    });
    return friendsAsUsers;
}
function getFriendIds() {
    var friends = getFriendsAsUsers();
    var friendIds = [];
    for (var i = 0; i < friends.length; i++) {
        friendIds.push(friends[i]._id);
    }
    return friendIds;
}

Template.friendFeed.helpers({
    friendPosts: function() {
        // Only find posts made after 00:00 of today
        var start = new Date();
        start.setHours(0,0,0,0);
        // TODO: Do better than O(n)?
        var friends = getFriendsAsUsers();
        var thought, thoughts = [];
        // Get user's last shared thought from today, if it exists
        if (Meteor.user().profile.lastShared.date >= start) {
            thought = Thoughts.findOne(Meteor.user().profile.lastShared.thoughtId);
            if (thought && thought.privacy === 'friends') {
                thoughts.push(thought);
            }
        }
        for (var i = 0; i < friends.length; i++) {
            thought = Thoughts.findOne(friends[i].profile.lastShared.thoughtId);
            if (thought && thought.collectedBy.indexOf(Meteor.userId()) === -1) {
                thoughts.push(thought);
            };
        }
        return thoughts;
    }
});

Template.myFeed.helpers({
    thoughts: function () {
        // Only find posts made after 00:00 of today
        var start = new Date();
        start.setHours(0,0,0,0);
        // Get user's posts and collected posts, but not the one they shared
        thoughts = Thoughts.find({
            $and: [
                {_id: {$not: Meteor.user().profile.lastShared.thoughtId}},
                {createdAt: {$gte:start}},
                {$or: [
                    {userId: Meteor.userId()},
                    {collectedBy: Meteor.userId()}
                ]}
            ]}, { sort: {createdAt: -1} });
        console.log(thoughts.fetch());
        return thoughts;
    }
});

Template.worldFeed.helpers({
    worldPosts: function () {
        // Only find posts made after 00:00 of today
        var start = new Date();
        start.setHours(0,0,0,0);
        var thought, thoughts = [];
        // Get user's last shared thought from today, if it exists
        if (Meteor.user().profile.lastShared.date >= start) {
            thought = Thoughts.findOne(Meteor.user().profile.lastShared.thoughtId);
            if (thought && thought.privacy === 'public') {
                thoughts.push(thought);
            }
        }
        var friendIds = getFriendIds();
        thoughts = thoughts.concat(Thoughts.find({
                $and: [
                    {createdAt: {$gte:start}},
                    {privacy: 'public'},
                    {$nor: [
                        {userId: Meteor.userId()},
                        {userId: {$in: friendIds}},
                        {collectedBy: Meteor.userId()}
                    ]}
                ]},
            { sort: {createdAt: -1} }).fetch());
        return thoughts;
    }
});

Template.worldFeed.events({
    "click .addToCollection": function(){
        Meteor.call("addToMyCollection", this._id);
    }
});


//put in username
Template.home.helpers({
    username: function(event){
        if (Meteor.user()) {
            var username = Meteor.user().username;
            return username.split(" ")[0];
        }
    },
    posts: function(event){
        var thoughts = Thoughts.find({}, {sort: {createdAt: -1}});
        console.log(thoughts.fetch());
        console.log(Meteor.user().username);
        console.log("zooddady");
        return thoughts
    },
    showFriendFeed: function() {
        return Session.get('showFriendFeed');
    }
});

Template.home.onRendered(function(){
    if (Session.get('showFriendFeed') === undefined) {
        Session.set('showFriendFeed', true);
        console.log('set showFriendFeed');
    }

    $("#newThoughtBox").keypress(function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13){
            $('.new-thought').submit();
            return false;  // stop propagation of the keypress
        }
        return true;
    });
})

//request facebook data
Template.home.events({
    "submit .new-thought": function (event) {
        console.log("here");
        event.preventDefault();
        // This function is called when the new thought form is submitted
        var text = $("#newThoughtBox").val();
        console.log(text);

        var thoughtId = Meteor.call("addThought", text, null,
            function(err, data) {
                if (err){
                    console.log(err);
                }
                console.log(data)
                var thought = Thoughts.findOne({_id:data});
                console.log(thought);
                // Add a new bubble
                var thoughtsList = Session.get('centerfeed');
                thoughtsList.push(thought);
                Session.set('centerfeed', thoughtsList);
                addThoughtsToStage([thought], 'center');
            });

        // Clear form
        $("#newThoughtBox").val("");

        // Prevent default form submit

        return false;
    },
    'click #btn-user-data': function(event) {
        Meteor.call('getFBUserData', function(err, data) {
            console.log(JSON.stringify(data, undefined, 4));
        });
        Meteor.call('getFBPostData', function(err, data) {
            console.log(JSON.stringify(data, undefined, 4));
            console.log(data["data"]);
            //check whose post it is using
            //data[(post number)][from][name]
            //only want the one's from the user
        });
    },
    'click #btn-import-facebook': function(event){
        Meteor.call('getFBPostData', function(err, data) {
            if (err){
                console.log(err);
            }
            else{
                var posts = data["data"];
                console.log(data);



                // var thoughtId = Meteor.call("addPost", posts[0],function(err, data) {
                //     if (err){
                //         console.log(err);
                //     }
                //     console.log(data)
                // });
                // getLocationThought(thoughtId)
                return false;
            }
        });
    },
    'click .feed-search-icon': function(event) {
        $(event.target.nextElementSibling).animate({width: "toggle"}, 'fast');
    },
    'click .friend-search-icon': function(event) {
        $(event.target.nextElementSibling).animate({width: "toggle"}, 'fast');
    },
    'click .feed-user-icon, click .badge.success': function(e) {
        // $(event.target.nextElementSibling).animate({width: "toggle"}, 'fast');
        e.stopPropagation();
        // $("#friendRequests").show();
        Session.set("showFriendPage", true);
    },
    'click .fa-caret-down, click .fa-caret-up': function(event) {
        $("#worldButtons").slideToggle('fast');
        $(event.target).toggleClass("fa-caret-down fa-caret-up");
    },
    'focus #newThoughtBox': function(event) {
        $(event.currentTarget).attr('rows', '4');
        $('#time-container').css('height', '109px');
    },
    'blur #newThoughtBox': function(event) {
        $(event.currentTarget).attr('rows', '1');
        $('#time-container').css('height', '65px');
    },
    'click .toggleFriendFeed': function() {
        Session.set('showFriendFeed', true);
    },
    'click .toggleWorldFeed': function() {
        Session.set('showFriendFeed', false);
    }
});

// Accounts
//
Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
    requestPermissions: {
        facebook: ['email', 'user_friends', 'user_location', 'user_status',
            'user_posts']
    }
});

// Helper Functions
//
function getLocation(event) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            configuration.location = position
        },showLocationError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}
function showLocationError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.")
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.")
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.")
            break;
    }
}


//set time in header
function setTime(){
    var actualTime = new Date(Date.now());
    var endOfDay = new Date(actualTime.getFullYear(), actualTime.getMonth(), actualTime.getDate() + 1, 0, 0, 0);
    var totalSec = Math.floor((endOfDay.getTime() - actualTime.getTime())/1000);
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    $("#time").text(result);
}



