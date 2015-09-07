Meteor.startup(function () {

  Accounts.emailTemplates.from = 'veet@mykeepspace.com';

  
  Accounts.emailTemplates.siteName = 'mykeepspace';


  Accounts.emailTemplates.verifyEmail.subject = function(user) {
    return 'Confirm Your Email Address';
  };

  Accounts.emailTemplates.verifyEmail.text = function(user, url) {
    return 'click on the following link to verify your email address: ' + url;

  };

});

Accounts.config({
	sendVerificationEmail: true,
	forbidClientAccountCreation: false
});
