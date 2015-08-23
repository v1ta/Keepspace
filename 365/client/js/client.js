Meteor.subscribe("thoughts");
Meteor.subscribe("users");
Meteor.subscribe("friends");

Tracker.autorun(function() {
  var searchString = Session.get('searchString');
  Meteor.subscribe('findFriends', searchString);
});


// Website has loaded
window.onload = function(){
    //close dropdowns on outside click
    $(document).mouseup(function (e){
        var container = $(".dropdown-menu");
        // if the target of the click isn't the container... nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0){
            container.hide();
            $("#changePasswordForm").hide();
            $(".dropButton").show();
        }
    });
    var configuration = {"location": null};
    if (!configuration){
        getLocation()
    }
    
    // Set countdown timer
    Meteor.setInterval(setTime, 1000);
}




Template.myFeed.helpers({
    thoughts: function () {
        // Show all thoughts
        var thoughts = Thoughts.find({userId:Meteor.userId()}, {sort: {createdAt: -1}});
        // console.log(thoughts.fetch());
        // console.log(Meteor.user().username);
        return thoughts
    }
});




Template.worldFeed.helpers({
    worldPosts: function () {
        // Show all thoughts
        var thoughts = Thoughts.find({userId:{$ne: Meteor.userId()}}, {sort: {createdAt: -1}});
        // var thoughts = Thoughts.find({userId:Meteor.userId()}, {sort: {createdAt: -1}});
        console.log(thoughts.fetch());
        // console.log(Meteor.user().username);
        return thoughts
    }
});




Template.worldFeed.events({
    "click .addToCollection": function(){
        Meteor.call("addToMyCollection", this._id);
    }
});



Template.post.events({
    "submit .new-thought": function (event) {
        event.preventDefault();
        // This function is called when the new thought form is submitted
        var text = event.target.text.value;

        var thoughtId = Meteor.call("addThought", text, null,
        function(err, data) {
            if (err){
                console.log(err);
            } 
            console.log(data)
        });
        // Clear form
        event.target.text.value = "";
        // Prevent default form submit
        return false;
    },
    "click #btn-cancel-post": function(e){
        $("#tempForm").hide();
    }
});




Template.thought.events({
    "click .delete": function () {
        Meteor.call("deleteThought", this._id);
    },
    "click .toggle-private": function () {
        Meteor.call("setPrivate", this._id, ! this.private);
    },
});




Template.thought.helpers({
    isuserId: function () {
        return this.userId === Meteor.userId();
    }
});




//put in username
Template.main.helpers({
    username: function(){
        if (Meteor.user()) {
            var username = Meteor.user().username.toUpperCase();
            return username.split(" ")[0];
        }
    },
    posts: function(){
        var thoughts = Thoughts.find({}, {sort: {createdAt: -1}});
        console.log(thoughts.fetch());
        console.log(Meteor.user().username);
        console.log("here");
        return thoughts
    }
    
});




    //request facebook data
Template.main.events({
    "submit .new-thought": function (event) {
        event.preventDefault();
        // This function is called when the new thought form is submitted
        var text = event.target.text.value;

        var thoughtId = Meteor.call("addThought", text, null,
        function(err, data) {
            if (err){
                console.log(err);
            } 
            console.log(data)
            // Add a new bubble
            addThoughtsToStage([data], myStage); 
        });

        // Clear form
        event.target.text.value = "";

        // Prevent default form submit

        return false;
    },
    'click #btn-user-data': function(e) {
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
    'click #btn-import-facebook': function(e){
        Meteor.call('getFBPostData', function(err, data) {
            if (err){
                console.log(err);
            }
            else{
                var posts = data["data"];
                console.log(posts[0]);
                var thoughtId = Meteor.call("addPost", posts[0],function(err, data) {
                    if (err){
                        console.log(err);
                    }
                    console.log(data)
                });
                // getLocationThought(thoughtId)
                return false;
            }
        });
    },
    'click .feed-search-icon': function(e) {
        $(e.target.nextElementSibling).animate({width: "toggle"}, 'fast');
    },
    'click .fa-caret-down, click .fa-caret-up': function(e) {
        $("#worldButtons").slideToggle('fast');
        $(e.target).toggleClass("fa-caret-down fa-caret-up");
    }


});



Template.user.helpers({
    'isUser': function(){
        return this.userId === Meteor.userId()
    },
    'Name' : function() {
        return "Robert"
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
function getLocation() {
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



Template.friendSearch.events({
    "click #search-friends": function(event) {
        var searchString = $('#search-friends').val();
        Session.set('searchString', searchString);
    },
    'click .feed-search-icon': function(e) {
        $(e.target.nextElementSibling).animate({width: "toggle"}, 'fast');

    },
    "keyup #search-friends": _.throttle(function(ev) {
    var searchString = $('#search-friends').val();
    Session.set('searchString', searchString);
  }, 1000)
});


Template.friendSearch.helpers({
    users: function() {
        return FindFriends.find();
    },
    friendCount: function() {
        return FindFriends.find().count();
    }
});

Template.friendSearch.rendered = function() {
  Session.set('searchString', '');
};

