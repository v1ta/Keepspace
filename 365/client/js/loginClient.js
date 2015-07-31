//custom login/register functionas
Template.login.events({
	//login function
	'submit form': function(event) {
		event.preventDefault();
		if ($("#passwordAgain").is(":visible"))
		{
			var emailVar = event.target.loginEmail.value;
			var passwordVar = event.target.loginPassword.value;
			var repeat = event.target.loginPasswordAgain.value;
			if (passwordVar == repeat){
				Accounts.createUser({
				    username: emailVar,
				    password: passwordVar
				});
			}
			else{
			//passwords do not match 
			}
		}
		else{
			var emailVar = event.target.loginEmail.value;
			var passwordVar = event.target.loginPassword.value;
			Meteor.loginWithPassword(emailVar, passwordVar, function(err){
				if (!err){
					Session.set("isFB", false);
				  // $("#changePassword").show();
				}
			});
		}        
	},
	//login with facebook
	'click #login-buttons-facebook': function(){
	  	Meteor.loginWithFacebook(
	  		{requestPermissions: ['email', 'user_friends', 'user_location', 'user_status',
				'user_posts']}, 
			function(err){
			    if (!err){
			      Session.set("isFB", true);
			      // $("#changePassword").hide();
			    }
			    else{
			      console.log(err);
			    }
			}
		)},
	  //  if you hit create account button
	'click #createAccount': function(){
		if ($("#passwordAgain").is(":visible"))
		{
			$("#passwordAgain").hide();
			$("#createAccount").text("Create Account");
			$("#signIn").val("Sign In");
		}
		else{
			$("#passwordAgain").show();
			$("#createAccount").text("Cancel");
			$("#signIn").val("Create");
		}
	}
});