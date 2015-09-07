Meteor.startup(function () {
  process.env.MAIL_URL = "smtp://localhost:25";

  Accounts.emailTemplates.from = 'keepspace <no-reply@mykeepspace.com>';

  
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

Meteor.methods({
  serverVerifyEmail: function(email, userId, callback) {
    console.log("Email to verify:" +email + " | userId: "+userId);
    // this needs to be done on the server.
    Accounts.sendVerificationEmail(userId, email);
    if (typeof callback !== 'undefined') {
      callback();
    }
  }
})