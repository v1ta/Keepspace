//header functions
Template.header.events({
    /*'click #postButton': function(e) {
        if ($("#tempForm").css("display") === "none") {
            $("#tempForm").show();
        } else {
            $("#tempForm").hide();
        }
    },*/
    'click #date': function(e) {
        Router.go("calendar");
    },
    'click #header': function(event){

        $("#changePassword").hide();
    },
    'click #homeButton': function(e) {
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
        $("#changePassword").show();
    },
    'click #changePassword': function(event){
        $("#changePassword").hide();
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
            $("#changePassword").hide();
        }
        else if (newPassword == newConfirm){
            Accounts.changePassword(oldPassword, newPassword, function(err){
            if (err){
                alert(err.reason);
                $("#changePassword").hide();
            }
            else{
                console.log("success");
                $("#changePassword").hide();
            }
        });
        }
        else{
            //TODO Send error to user
            alert("Passwords no not match");
            $("#changePassword").hide();
        }
    },
    'click #dropdownDiv, click #main-menu': function(e) {
        e.stopPropagation();
        if ($("#main-menu").css("display") === "block") {
            hideMainMenu();
        } else {
            showMainMenu();
        }
    },
    'click #homeLogo': function(e){
        Router.go("mainPage");
    },
    'mouseenter #dropdownDiv': function(e) {
        $("#dropdownDiv").css("background-color", "#E0E0E0");
        $("#homeLogo").css("background-color", "#f9f9f9");
    },
    'mouseenter #homeLogo': function(e) {
        $("#dropdownDiv").css("background-color", "#f9f9f9");
        $("#homeLogo").css("background-color", "#E0E0E0");
    },
    'mouseleave #logo': function(e) {
        if ($("#main-menu").css("display") !== "block") {
            $("#dropdownDiv").css("background-color", "");
            $("#homeLogo").css("background-color", "");
        }
    },
    'mouseenter .menu-item': function(e) {
        $(e.target).css("background-color", "#32c0d2");
    },
    'mouseleave .menu-item': function(e) {
        $(e.target).css("background-color", "");
    },
    'click #profile-picture': function() {
        // TODO: encrypt userId
        Session.set('showProfile', Meteor.user());
    },
    'click #close-profile': function() {
        Session.set('showProfile', false);
    },
    'mouseenter #profile-picture-large': function(e) {
        if (Meteor.userId() === Session.get('showProfile')._id) {
            if (e.relatedTarget.id !== "change-picture")
                $("#change-picture").show();
            else if ($("#upload-picture").css("display") === "none")
                $("#change-picture").hide();
        }
    },
    'mouseleave #change-picture': function() {
        if ($("#upload-picture").css("display") === "none") {
            $("#change-picture").hide();
        }
    },
    'click [data-action=accept]': function() {
        this.accept();
    },
    'click [data-action=deny]': function() {
        this.deny();
    },
    // user object methods
    'click [data-action=unfriend]': function() {
        //assumes context is a instance of a user
        this.unfriend();
    },
    'click #closeFriends': function(){
        $("#friendRequests").hide();
    },
    'click #friendRequests':function(event){
        event.stopPropagation();
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
    }
});

Template.header.onCreated(function() {
    $(window).resize(function() { setMidPadding(); });
});
Template.header.onDestroyed(function() {
    $(window).off('resize');
});

Template.header.onRendered(function() {
    var today = new Date();
    $("#dayNum").text(today.getDOY());
    var currentDate = $.format.date(today, "MMMM D");
    $("#date").text(currentDate);
    localStorage.setItem("selectedDate", $.format.date(today, "M d yyyy"));
    setMidPadding();
    Session.set('showProfile', false);
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
            $("#friendRequests").hide();
        }
        else if(!$("#profile").is(e.target) // if the target of the click isn't the container...
            && $("#profile").has(e.target).length === 0) // ... nor a descendant of the container
        {
            $("#profile").hide();
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
    collects: function() {
        return Session.get('showProfile').profile.collects;
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
    }
})

logoutFunction = function(){
    Router.go("main");
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
showMainMenu = function() {
    // $("#logo").css({"border-bottom-right-radius": "0",
    //                 "border-bottom-left-radius" : "0",
    //                 "background-color": "#f9f9f9"});
    $("#dropdownDiv").css("background-color", "#E0E0E0");
    $("#homeLogo").css("background-color", "#f9f9f9");
    $("#main-menu").slideDown('fast');
}
hideMainMenu = function() {
    $("#main-menu").slideUp('fast', function() {
        $("#logo").css({"border-radius": "5px", "background-color": ""}); 
        $("#homeLogo").css({"background-color": ""}); 
        $("#dropdownDiv").css({"background-color": ""}); 
    });
}
