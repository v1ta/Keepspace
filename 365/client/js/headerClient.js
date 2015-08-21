//header functions
Template.header.events({
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
        Router.go("mainPage");;
    },
    'click #settingsButton': function(event){
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
    }
});

Template.header.onRendered(function() {
    var today = new Date();
    $("#dayNum").text(today.getDOY());
    var currentDate = $.format.date(today, "MMMM D, yyyy");
    $("#date").text(currentDate);
    localStorage.setItem("selectedDate", $.format.date(today, "M d yyyy"));
});

Date.prototype.getDOY = function() {
    var onejan = new Date(this.getFullYear(),0,1);
    return Math.ceil((this - onejan) / 86400000);
}

logoutFunction = function(){
    Router.go("main");
}