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
    'click .username': function(event) {
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
    var loggedIn = localStorage.getItem("justLoggedIn");
    if (loggedIn == "true"){
        var rand = Math.random();
        if (rand < 0.33){
            showOldPost();
        }
	
        localStorage.setItem("justLoggedIn", "false");
    };
});

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

//set time in header
setTime = function(){
    var actualTime = new Date(Date.now());
    var endOfDay = new Date(actualTime.getFullYear(), actualTime.getMonth(), actualTime.getDate() + 1, 0, 0, 0);
    var totalSec = Math.floor((endOfDay.getTime() - actualTime.getTime())/1000);
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    $("#time").text(result);
}
