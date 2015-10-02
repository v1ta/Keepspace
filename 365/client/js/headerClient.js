//header functions
Template.header.events({
    /*'click #postButton': function(e) {
        if ($("#tempForm").css("display") === "none") {
            $("#tempForm").show();
        } else {
            $("#tempForm").hide();
        }
    },*/
    'click #date': function(event) {
        Router.go("calendar");
    },
    'click #header': function(event){
        Session.set("showChangePassword", false);
        // $("#changePassword").hide();
    },
    'click #homeButton': function(event) {
        // Router.go("mainPage");
        Router.go("calendar");
    },
    'click #settingsButton': function(event){
        console.log(Meteor.user());
        event.preventDefault();
        // console.log($("#settingDropDown").css("display"));
        // $("#settingDropDown").toggle();
        if ($("#settingDropDown").css("display") == "none"){
            $("#settingDropDown").css("display", "inline-block");
        }
        else{
            $("#settingDropDown").css("display", none);
        }
    },
    'click .logout': function(event){
        event.preventDefault();
        Meteor.logout(logoutFunction);
    },
    'click .dropdownAbout': function(event){
        Router.go("mainAbout");
    },
    'click .dropdownTeam': function(event){
        Router.go("mainTeam");
    },
    'click #changePasswordButton': function(event){
        event.preventDefault();
        event.stopPropagation();
        hideMainMenu();
        Session.set("showChangePassword", true);
        //$("#changePassword").show();
    },
    'click #changePassword': function(event){
        Session.set("showChangePassword", false);
        //$("#changePassword").hide();
    },
    'click #changePassForm': function(event){
        event.stopPropagation();
    },
    'submit #changePassForm': function(event){
        event.preventDefault();
        var oldPassword = event.target.oldPass.value;
        var newPassword = event.target.newPass.value;
        var newConfirm = event.target.newPassConfirm.value;
        if (Session.get("isFB")){
            alert("You logged in with FB!");
            Session.set("showChangePassword", false);
            // $("#changePassword").hide();
        }
        else if (newPassword == newConfirm){
            Accounts.changePassword(oldPassword, newPassword, function(err){
            if (err){
                alert(err.reason);
                Session.set("showChangePassword", false);
                // $("#changePassword").hide();
            }
            else{
                console.log("success");
                Session.set("showChangePassword", false);
                // $("#changePassword").hide();
            }
        });
        }
        else{
            //TODO Send error to user
            alert("Passwords no not match");
            Session.set("showChangePassword", false);
            // $("#changePassword").hide();
        }
    },
    'click #dropdownDiv, click #main-menu, click .menu-dropdown': function(event) {
        event.stopPropagation();
        if ($("#main-menu").css("display") === "block") {
            hideMainMenu();
        } else {
            showMainMenu();
        }
    },
    'click #homeLogo': function(event){
        Router.go("mainPage");
    },
    'mouseenter #dropdownDiv': function(event) {
        // $("#dropdownDiv").css("background-color", "#E0E0E0");
        // $("#homeLogo").css("background-color", "#f9f9f9");
    },
    'mouseenter #homeLogo': function(event) {
        // $("#dropdownDiv").css("background-color", "#f9f9f9");
        // $("#homeLogo").css("background-color", "#E0E0E0");
    },
    'mouseleave #logo': function(event) {
        if ($("#main-menu").css("display") !== "block") {
            $("#dropdownDiv").css("background-color", "");
            $("#homeLogo").css("background-color", "");
        }
    },
    'mouseenter .menu-item': function(event) {
        $(event.target).css("background-color", "#32c0d2");
    },
    'mouseleave .menu-item': function(event) {
        $(event.target).css("background-color", "");
    },
    'click #profile-picture': function(event) {
        // TODO: encrypt userId
        Session.set('showProfile', Meteor.user());
        event.stopPropagation();
    },
    'click #close-profile': function(event) {
        Session.set('showProfile', false);
    },
    'mouseenter #profile-picture-large': function(event) {
        if (Meteor.userId() === Session.get('showProfile')._id) {
            if (event.relatedTarget.id !== "change-picture")
                $("#change-picture").show();
            else if ($("#upload-picture").css("display") === "none")
                $("#change-picture").hide();
        }
    },
    'mouseleave #change-picture': function(event) {
        if ($("#upload-picture").css("display") === "none") {
            $("#change-picture").hide();
        }
    },
    'click #closeFriends': function(){
        Session.set("showFriendPage", false);
        // $("#friendRequests").hide();
    },
    'click #friendRequests':function(event){
        event.stopPropagation();
    },
    'click #profile': function(event){
        event.stopPropagation();
    },
    'click #markAsRead': function(event){
        Meteor.call("clearNotifications", Meteor.userId());
    }
});

Template.header.helpers({
    username: function(){
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    },
    picture: function() {
        if (Meteor.user()) {
            var picture = Meteor.user().profile.picture;
            var customAvatar = Avatars.findOne({ _id: picture });
            if (customAvatar) { 
                return customAvatar.url();
            }
        }
        return picture;
    },
    showProfile: function() {
        return Session.get('showProfile');
    },
    showFriendPage: function(){
        return Session.get("showFriendPage");
    },
    showChangePassword: function(){
        return Session.get("showChangePassword");
    },
    requests: function() {
        var results =  Meteor.requests.find({
            $or: [
                {userId:Meteor.userId()},
                {requesterId:Meteor.userId()}
            ]
        });
        alert("here");
        console.log(results.fetch());
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
    }
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
        console.log(results.fetch());
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
    }
});
Template.header.onCreated(function(event) {
    $(window).resize(function() { setMidPadding(); });
});
Template.header.onDestroyed(function(event) {
    $(window).off('resize');
});

Template.header.onRendered(function(event) {
    var today = new Date();
    $("#dayNum").text(today.getDOY());
    var currentDate = $.format.date(today, "MMMM D");
    $("#date").text(currentDate);
    localStorage.setItem("selectedDate", $.format.date(today, "M d yyyy"));
    setMidPadding();
    Session.set('showProfile', false);
    Session.set('showFriendPage', false);
    Session.set("showChangePassword", false);
    var loggedIn = localStorage.getItem("justLoggedIn");
    if (loggedIn == "true"){
        var rand = Math.random();
        if (rand < 0.33){
            showOldPost();
        }
	
        localStorage.setItem("justLoggedIn", "false");
    };
    $(document).mouseup(function (e){
        if (!$("#friendRequests").is(e.target) // if the target of the click isn't the container...
            && $("#friendRequests").has(e.target).length === 0) // ... nor a descendant of the container
        {
            // $("#friendRequests").hide();
            Session.set("showFriendPage", false);
        }
        if(!$("#profile").is(e.target) // if the target of the click isn't the container...
            && $("#profile").has(e.target).length === 0) // ... nor a descendant of the container
        {
            Session.set('showProfile', false);
        }
    });
});

Template.profile.helpers({
    username: function() {
        return Session.get('showProfile').username;
    },
    picture: function() {
        var picture = Session.get('showProfile').profile.picture;
        var customAvatar = Avatars.findOne({ _id: picture });
        if (customAvatar) { 
            return customAvatar.url();
        } else {
            return picture;
        }
    },
    joined: function() {
        return $.format.date(Session.get('showProfile').createdAt, 'M/d/yyyy');
    },
    collects: function(event) {
        return Session.get('showProfile').profile.collects;
    },
    notifications: function(){
        var notifications = Notifications.find().fetch();
        result = [];
        notifications.forEach(function (notification) {    
            console.log(notification);     
            var user = Meteor.users.findOne({_id:notification.friendId});
            var element = {};

            if (notification.type == "acceptRequest"){
                element.notification = user.username + " accepted your friend request!";
            }
            else{
                element.notification = user.username + ' collected your thought!';
            }
            var date = new Date();
            var createdAt = new Date(notification.createdAt);
            var diffHours = Math.abs((date - createdAt) / 36e5);
            var timeString;
            if (diffHours < 1){
                diffHours = diffHours * 60;
                var numMinutes = Math.floor(diffHours);
                if (numMinutes == 1){
                    timeString = numMinutes.toString() + " min";
                }
                else{
                    timeString = numMinutes.toString() + " mins";
                }
            }
            else if (diffHours > 24){
                diffHours = diffHours / 24;
                var numDays = Math.floor(diffHours);
                if (numDays == 1){
                    timeString = numDays.toString() + " day";
                }
                else{
                    timeString = numDays.toString() + " days";
                }
            }
            else{
                var numHours = Math.floor(diffHours);
                if (numHours == 1){
                    timeString = numHours.toString() + " hr";
                }
                else{
                    timeString = numHours.toString() + " hrs";
                }
            }

            element.timeString = timeString;
            element.username = user.username;
            element["type"] = notification.type;
            result.push(element);
            // if (notification.type == "acceptRequest")
            //     sAlert.success(user.username + ' accepted your friend request!', {position: 'bottom'});
            // else
            //     sAlert.success(user.username + ' collected your thought!', {position: 'bottom'});
        });
        console.log(result);
        console.log(result[0]);
        return result;
    }
});

Template.profile.events({
    'change #new-picture': function(event, template) {
        FS.Utility.eachFile(event, function(file) {
          Avatars.insert(file, function (err, fileObj) {
            // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
            if (err) {
                console.log(err);
            } else {
                $('#upload-picture').modal('hide');
                $('#change-picture').hide();
                var avatarUrl = {
                    'profile.picture' : fileObj._id
                }
                Meteor.users.update(Meteor.userId(), {$set: avatarUrl});
                Session.set('showProfile', Meteor.user());
            }
          });
        });
    },

})

logoutFunction = function(){
    Router.go("mainPage");
}

function setMidPadding() {
    var padding = parseInt($(".mid").css("width")) - ( parseInt($("#homeButton").css("width"))+parseInt($("#date").css("width"))-parseInt($("#date").css("padding-left")) );
    $(".mid").css("padding-left", padding/2);
}

function showOldPost(){
    rand = Math.floor(Math.random() * 100000000) + 1;
    result = Thoughts.findOne( { userId:Meteor.userId(), randomIndex : { $gte : rand } } );
    if ( result == null ) {
        result = Thoughts.findOne( { userId:Meteor.userId(), randomIndex : { $lte : rand } } );
    }
    var time = result.createdAt;
    var newDate = new Date(time);
    var text = result.text;
    var day = "Day " + newDate.getDOY();
    var hours = newDate.getHours() == 12 ? newDate.getHours() : newDate.getHours() % 12;
    var minutes = newDate.getMinutes() < 10 ? "0" + newDate.getMinutes().toString() : newDate.getMinutes();
    var time = hours + ":" + minutes;

    $(".oldPostDay").text(day);
    $(".oldPostTime").text(time);
    $(".oldPostText").text(text);
    $("#mainAlert").show();

    $(".alertBubble").click(function(event){
        event.stopPropagation();
    });
    $(".alertDiv").click(closeAlert);
    $(".closeAlert").click(closeAlert);
}

// Handlers for showing and hiding main menu
showMainMenu = function(event) {
    // $("#logo").css({"border-bottom-right-radius": "0",
    //                 "border-bottom-left-radius" : "0",
    //                 "background-color": "#f9f9f9"});
    // $("#dropdownDiv").css("background-color", "#E0E0E0");
    // $("#homeLogo").css("background-color", "#f9f9f9");
    $("#main-menu").slideDown('fast');
}
hideMainMenu = function(event) {
    $("#main-menu").slideUp('fast', function() {
        $("#logo").css({"border-radius": "5px", "background-color": ""}); 
        $("#homeLogo").css({"background-color": ""}); 
        // $("#dropdownDiv").css({"background-color": ""}); 
    });
}
