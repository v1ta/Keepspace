/*
	This functionality is currently implemented in splashClient.js
 */
Template.loginPage.events({
	'click #facebookButton': function(){
	  	Meteor.loginWithFacebook(
	  		{requestPermissions: ['email', 'user_friends', 'user_location', 'user_status',
				'user_posts','publish_actions']}, 
			function(err){
			    if (!err){
					Session.set("isFB", true);
					localStorage.setItem("justLoggedIn", true);
					resetAllFeeds();
					Router.go("home");
			      // $("#changePassword").hide();
			    }
			    else{
			      console.log(err);
			    }
			}
		)
	},
	'submit loginForm': function(event){
		event.preventDefault();
		var emailVar = $("#loginEmail").val();
		var passwordVar = $("#loginPassword").val();
		Meteor.loginWithPassword({email: emailVar}, passwordVar, function(err){
			if (!err){
				Session.set("isFB", false);
				localStorage.setItem("justLoggedIn", true);
				resetAllFeeds();
				if (emailVar === "admin@thekeepspace.com") {
					Router.go('invites');
				} else {
					console.log("not as bad as me!");
					Router.go("home");
				}
				// $("#changePassword").show();
			}
			else{
				alert(err);
			}
		});
	},
	'click #forgotPass': function(){
		var email = $("#loginEmail").val();
		if (email == ""){
			alert("Please enter your email address.");
		}
		else{

			Accounts.forgotPassword({email: email}, function(err) {
				if (err) {
					if (err.message === 'User not found [403]') {
						console.log('This email does not exist.');
					} else {
						console.log('We are sorry but something went wrong.');
					}
				} else {
					Router.go('/changeEmail');
					setInterval(function(){
						Router.go('/loginPage');
					},5000);
				}
			});
		}
	}
});

if (Accounts._resetPasswordToken) {
  Session.set('resetPassword', Accounts._resetPasswordToken);
}

Template.ResetPassword.helpers({
 resetPassword: function(){
  return Session.get('resetPassword');
 }
});

Template.ResetPassword.events({
  'submit #resetPasswordForm': function(e, t) {
    e.preventDefault();

    var resetPasswordForm = $(e.currentTarget),
        password = resetPasswordForm.find('#resetPasswordPassword').val(),
        passwordConfirm = resetPasswordForm.find('#resetPasswordPasswordConfirm').val();

    if (isNotEmpty(password) && areValidPasswords(password, passwordConfirm)) {
      Accounts.resetPassword(Session.get('resetPassword'), password, function(err) {
        if (err) {
          console.log('We are sorry but something went wrong.');
        } else {
          console.log('Your password has been changed. Welcome back!');
          Session.set('resetPassword', null);
        }
      });
    }
    return false;
  }
});