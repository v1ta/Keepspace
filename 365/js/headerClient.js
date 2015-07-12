// This code only runs on the client
if (Meteor.isClient) {

    //header functions
    Template.header.events({
        'click #postButton': function(e) {
            $("#tempForm").show();
        },
        'click #calendarButton': function(e) {
            Router.go("calendar");
        },
        'click #homeButton': function(e) {
            Router.go("main");;
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
            Meteor.logout();
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
        }
    });
}