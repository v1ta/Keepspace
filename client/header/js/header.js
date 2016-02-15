Template.header.events({
    /*'click #postButton': function(e) {
     if ($("#tempForm").css("display") === "none") {
     $("#tempForm").show();
     } else {
     $("#tempForm").hide();
     }
     },*/
    'click #date': function(event) {
        // Router.go("calendar");
    },
    'click #header': function(event){
        Session.set("showChangePassword", false);
        // $("#changePassword").hide();
    },
    'click #homeButton': function(event) {
        // Router.go("mainPage");
        // Router.go("calendar");
    },
    'click .icon-friendsiconnavbar': function(){
        Router.go("friends");
    },
    'click .icon-bellnavbar': function(){
        Router.go("notifications");
    },
    'click #settingsButton': function(event){
        console.log(Meteor.user());
        event.preventDefault();
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
                    Session.set("showChangePassword", false);
                    // $("#changePassword").hide();
                }
            });
        }
        else{
            alert("Passwords no not match"); //TODO Send error to user
            Session.set("showChangePassword", false);
            // $("#changePassword").hide();
        }
    },
    'click .icon-moreiconnavbar': function(event) {
        event.stopPropagation();
        if ($("#main-menu").css("display") === "block") {
            hideMainMenu();
        } else {
            showMainMenu();
        }
    },
    'click #homeLogo': function(event){
        Router.go("home");
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
    'mouseenter .username, mouseenter #profile-picture': function(event) {
        $(".username").css("text-decoration", "underline");
    },
    'mouseleave .username, mouseenter #profile-picture': function(event) {
        $(".username").css("text-decoration", "none");
    },
    'click #profile-picture': function(event) {
        // TODO: encrypt userId
        Router.go("calendar");
        // Session.set('showProfile', Meteor.user());
        event.stopPropagation();
    },
    'click .username': function(event) {
        // TODO: encrypt userId
        Router.go("calendar");
        // Session.set('showProfile', Meteor.user());
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
            var user = Meteor.user().profile.firstName;
            if (!user){
                user = Meteor.user().username;
            }
            var result = user.split(" ");
            return result[0];
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
    numNotifications: function(){
        var ready = Session.get("loadedNotifications");
        return{
            data: Session.get("numUnread"),
            ready: ready
        }
    }
});

Template.header.onCreated(function(event) {
   // $(window).resize(function() { setMidPadding(); });
});

Template.header.onDestroyed(function(event) {
    $(window).off('resize');
});

Template.header.onRendered(function(event) {
    var today = new Date();
    $("#dayNum").text(today.getDOY());
    var currentDate = $.format.date(today, "MMM d");
    currentDate = currentDate.toUpperCase();
    $("#date").text(currentDate);
    localStorage.setItem("selectedDate", $.format.date(today, "M d yyyy"));
    //setMidPadding();
    Session.set('showProfile', false);
    Session.set('showFriendPage', false);
    Session.set("showChangePassword", false);
    var loggedIn = localStorage.getItem("justLoggedIn");
    if (loggedIn == "true"){
        var rand = Math.random();
        if (rand < 0.33) {
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
            } else {
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
                } else {
                    timeString = numMinutes.toString() + " mins";
                }
            }
            else if (diffHours > 24){
                diffHours = diffHours / 24;
                var numDays = Math.floor(diffHours);
                if (numDays == 1){
                    timeString = numDays.toString() + " day";
                } else {
                    timeString = numDays.toString() + " days";
                }
            } else {
                var numHours = Math.floor(diffHours);
                if (numHours == 1){
                    timeString = numHours.toString() + " hr";
                } else {
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
                if (err) { // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
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
    Router.go("home");
}

function setMidPadding() {
    //var padding = parseInt($(".mid").css("width")) - ( parseInt($("#homeButton").css("width"))+parseInt($("#date").css("width"))-parseInt($("#date").css("padding-left")) );
    //$(".mid").css("padding-left", padding/2);
}

function showOldPost(){
    rand = Math.floor(Math.random() * 100000000) + 1;
    result = Thoughts.findOne( { userId:Meteor.userId(), randomIndex : { $gte : rand } } );
    if (result == null) {
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
