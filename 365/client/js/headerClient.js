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
    'click #logo': function(e) {
        $("#main-menu").toggle();
        $(e.currentTarget).children('i').toggleClass("fa-caret-down fa-caret-up");
        if ($("#main-menu").css("display") === "block") {
            $("#logo").css({"border-bottom-right-radius": "0",
                            "border-bottom-left-radius" : "0"});
        } else {
            $("#logo").css("border-radius", "5px");
        }
    },
    'mouseenter #logo': function(e) {
        $("#logo").css("background-color", "#bbbbbb");
    },
    'mouseleave #logo': function(e) {
        if ($("#main-menu").css("display") !== "block") {
            $("#logo").css("background-color", "");
        }
    },
    'mouseenter .menu-item': function(e) {
        $(e.target).css("background-color", "#01C2CF");
    },
    'mouseleave .menu-item': function(e) {
        $(e.target).css("background-color", "");
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
    avatar: function() {
        var user = Meteor.user();
        if (user.services)
            if (user.services.facebook) {
                return "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=large";
            } else return "/avatars/default.png";
    }
});

Template.header.onRendered(function() {
    var today = new Date();
    $("#dayNum").text(today.getDOY());
    var currentDate = $.format.date(today, "MMMM D");
    $("#date").text(currentDate);
    localStorage.setItem("selectedDate", $.format.date(today, "M d yyyy"));

    var padding = parseInt($(".mid").css("width")) - ( parseInt($("#homeButton").css("width"))+parseInt($("#date").css("width"))-parseInt($("#date").css("padding-left")) );
    $(".mid").css("padding-left", padding/2);
    $(".mid").css("padding-right", padding/2);
});

Date.prototype.getDOY = function() {
    var onejan = new Date(this.getFullYear(),0,1);
    return Math.ceil((this - onejan) / 86400000);
}

logoutFunction = function(){
    Router.go("main");
}