Template.changePass.events({
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
});

Template.header.events({
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
});

Template.header.onRendered(function(event) {
	Session.set("showChangePassword", false);
});