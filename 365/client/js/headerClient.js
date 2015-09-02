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
    'click #homeButton': function(e) {
        Router.go("mainPage");
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
    'click #changePassword': function(event){
        event.preventDefault();
        $(".dropButton").toggle();
        $("#changePasswordForm").toggle();
    },
    'submit #changePasswordForm': function(event){
        event.preventDefault();
        var oldPassword = event.target.oldPass.value;
        var newPassword = event.target.newPass.value;
        var newConfirm = event.target.newPassConfirm.value;
        if (Session.get("isFB")){
            alert("You logged in with FB!");
        }
        else if (newPassword == newConfirm){
            Accounts.changePassword(oldPassword, newPassword, function(err){
            if (err){
                alert(err.reason);
            }
            else{
                console.log("success");
            }
        });
        }
        else{
            //TODO Send error to user
            alert("Passwords no not match");
        }
    },
    'click #logo, click #main-menu': function(e) {
        if ($("#main-menu").css("display") === "block") {
            hideMainMenu();
        } else {
            showMainMenu();
        }
    },
    'mouseenter #logo': function(e) {
        $("#logo").css("background-color", "#f9f9f9");
    },
    'mouseleave #logo': function(e) {
        if ($("#main-menu").css("display") !== "block") {
            $("#logo").css("background-color", "");
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
    }
    // 'click #btn-import-facebook': function(e) {
    //     Meteor.call('getFBUserData', function(err, data) {
    //         console.log(JSON.stringify(data, undefined, 4));
    //      });
    //     Meteor.call('getFBPostData', function(err, data) {
    //         console.log(data);
    //         console.log(JSON.stringify(data, undefined, 4));
    //         // console.log(data["data"]);
    //         //check whose post it is using
    //         //data[(post number)][from][name]
    //         //only want the one's from the user
    //     });
    // },
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


Date.prototype.getDOY = function() {
    var onejan = new Date(this.getFullYear(),0,1);
    return Math.ceil((this - onejan) / 86400000);
}

logoutFunction = function(){
    Router.go("main");
}

function setMidPadding() {
    var padding = parseInt($(".mid").css("width")) - ( parseInt($("#homeButton").css("width"))+parseInt($("#date").css("width"))-parseInt($("#date").css("padding-left")) );
    $(".mid").css("padding-left", padding/2);
}

// Handlers for showing and hiding main menu
showMainMenu = function() {
    $("#logo").css({"border-bottom-right-radius": "0",
                    "border-bottom-left-radius" : "0",
                    "background-color": "#f9f9f9"});
    $("#main-menu").slideDown('fast');
}
hideMainMenu = function() {
    $("#main-menu").slideUp('fast', function() {
        $("#logo").css({"border-radius": "5px", "background-color": ""});    
    });
}