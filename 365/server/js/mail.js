Meteor.startup(function () {

  Accounts.emailTemplates.from = 'mykeepspace <no-reply@mykeepspace.com>';

  
  Accounts.emailTemplates.siteName = 'mykeepspace';


  Accounts.emailTemplates.verifyEmail.subject = function(user) {
    return 'Confirm Your Email Address';
  };

  Accounts.emailTemplates.verifyEmail.text = function(user, url) {
    return 'click on the following link to verify your email address: ' + url;

  };

});

Accounts.validateLoginAttempt(function(attempt){
  if (attempt.user && attempt.user.emails && !attempt.user.emails[0].verified ) {
    console.log('email not verified');

    return false; // the login is aborted
  }
  return true;
}); 


Accounts.config({
    sendVerificationEmail: true
});
