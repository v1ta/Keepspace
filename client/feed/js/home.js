Meteor.subscribe("users");
Meteor.subscribe("avatars");
Meteor.subscribe("outgoingFriendRequests");
Meteor.subscribe('ignoredFriendRequests');
var thoughtsList = [];

Template.home.created = function() {
    var self = this;

    self.limit = new ReactiveVar;
    self.limit.set(parseInt(Meteor.settings.public.recordsPerPage));
    Tracker.autorun(function() {
        Meteor.subscribe('images');
    });
}

Template.home.onRendered(function(){
    Session.setDefault('showFriendFeed', true);
    Session.setDefault('centerfeed', thoughtsList)
    Session.set('showFriendFeed', true);
    Session.set("maximized", false);
    $("#newThoughtBox").keypress(function(e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13){
            $('.new-thought').submit();
            return false;  // stop propagation of the keypress
        }
        return true;
    });
    var self = this;
    // is triggered every time we scroll
    $(window).scroll(function() {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
            incrementLimit(self);
        }
    });
});

window.onload = function(event){ // Website has loaded
    $(document).mouseup(function (event){ //close dropdowns on outside click
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
    setTime(); // Set countdown timer
    Meteor.setInterval(setTime, 1000);
}

Template.friendFeed.helpers({
    friendPosts: function() {
        var start = new Date();
        var friends = getFriends();
        start.setHours(0,0,0,0);// Only find posts made after 00:00 of today
        return Thoughts.find({
           $and: [
               {$or: [
                   {userId: {$in: friends}},
                   {userId: Meteor.userId()}
               ]},
               {privacy: "friends"},
               {createdAt: {$gte: start}},
               {collectedBy: {$not: Meteor.userId()}}
           ]},
        {sort: {createdAt: -1}});
    }
});

Template.myFeed.helpers({
    thoughts: function () {
        // Only find posts made after 00:00 of today
        var start = new Date();
        start.setHours(0,0,0,0);
        return Thoughts.find({
            $or: [
                {$and: [
                    {userId: Meteor.userId()},
                    {privacy: "private"},
                    {createdAt: {$gte: start}}
                ]},
                {$and :[
                    {collectedBy: Meteor.userId()},
                    {createdAt: {$gte: start}}
                ]},
            ]},
        {sort: {createdAt: -1}});
    }
});

Template.worldFeed.helpers({
    worldPosts: function () {
        var start = new Date(); // Only find posts made after 00:00 of today
        start.setHours(0,0,0,0);
        return Thoughts.find({
            $and: [
                {createdAt: {$gte:start}},
                {privacy: 'public'},
                {collectedBy: {$not: Meteor.userId()}},
            ]},
        {sort: {createdAt: -1}});
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
        return thoughts
    },
    showFriendFeed: function() {
        return Session.get('showFriendFeed');
    },
    'images': function() {
        return Images.find({}, {sort:{uploadedAt:-1}});
    }
});

//request facebook data
Template.home.events({
    'click' : function(event) {
        if (Session.get("maximized")) {
            //minimize selected bubble
        }
    },
    "click #submit-new-thought": function(event) {
        event.preventDefault();
        // This function is called when the new thought form is submitted
        var text = $("#newThoughtBox").val();

        var thoughtId = Meteor.call("addThought", text, null,
            function(err, data) {
                if (err){
                    console.log(err);
                }
                var thought = Thoughts.findOne({_id:data});
                thoughtsList.push(thought);
            });

        // Clear form
        $("#newThoughtBox").val("");
        return false;
    },
    "submit .new-thought": function (event) {
        event.preventDefault();
        // This function is called when the new thought form is submitted
        var text = $("#newThoughtBox").val();

        var thoughtId = Meteor.call("addThought", text, null,
            function(err, data) {
                if (err){
                    console.log(err);
                }
                var thought = Thoughts.findOne({_id:data});
                thoughtsList.push(thought);
            });

        // Clear form
        $("#newThoughtBox").val("");
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
        $('#newThoughtBox').animate({height: '150px'},300);
        $('#time-container').animate({height: '200px'},300);
    },
    'blur #newThoughtBox': function(event) {
        $('#newThoughtBox').animate({height: '34px'},300);
        $('#time-container').animate({height: '65px'},300);
    },
    'click .toggleFriendFeed': function() {
        $('.flipper').removeClass('flipped');
        setTimeout(function() {
            Session.set('showFriendFeed', true);
        },200);

    },
    'click .toggleWorldFeed': function() {
        $('.flipper').addClass('flipped');
        setTimeout(function() {
            Session.set('showFriendFeed', false);
        },200);

    }
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY",
    requestPermissions: {
        facebook: ['email', 'user_friends', 'user_location', 'user_status',
            'user_posts']
    }
});

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

function setTime(){ //set time in header
    var actualTime = new Date(Date.now());
    var endOfDay = new Date(actualTime.getFullYear(), actualTime.getMonth(), actualTime.getDate() + 1, 0, 0, 0);
    var totalSec = Math.floor((endOfDay.getTime() - actualTime.getTime())/1000);
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;
    var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    $("#time").text(result);
}

/* from old renderFeed source file */
resetAllFeeds = function () {
    // Reset Session variables for feeds
    delete Session.keys['leftfeed'];
    delete Session.keys['centerfeed'];
    delete Session.keys['rightfeed'];
    delete Session.keys['leftqueue'];
    delete Session.keys['centerqueue'];
    delete Session.keys['rightqueue'];
}

getFriends = function() {
    var arr = Meteor.friends.find({userId:Meteor.userId()},{friendId: 1, _id:0}).fetch();
    var distinctArr = _.uniq(arr, false, function(d) {
        return d.friendId});
    return _.pluck(distinctArr, 'friendId');
}

var incrementLimit = function(templateInstance) {
    var newLimit = templateInstance.limit.get() +
        parseInt(Meteor.settings.public.recordsPerPage);
    templateInstance.limit.set(newLimit);
};

getFriendsAsUsers = function() {
    var friends = Meteor.friends.find();
    var friendsAsUsers = [];
    friends.forEach(function (friend) {
        friendsAsUsers.push(friend.user());
    });
    // console.log("getFriendsAsUsers");
    Meteor.subscribe("friends").ready();
    // console.log(friends.fetch());
    // console.log(friendsAsUsers);
    // console.log(friendsAsUsers);
    return friendsAsUsers;
}

getFriendIds = function() {
    var friends = getFriendsAsUsers();
    // console.log(friends);
    var friendIds = [];
    for (var i = 0; i < friends.length; i++) {
        friendIds.push(friends[i]._id);
    }
    return friendIds;
}
    */
