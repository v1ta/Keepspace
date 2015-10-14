
  Accounts.emailTemplates.resetPassword.siteName = "Keepspace";

  Accounts.emailTemplates.resetPassword.from = "Application Admin Email <admin@thekeepspace>";

  Accounts.emailTemplates.resetPassword.subject = function(user) {
    return "[Application Name] Reset Your Password";
  };

  Accounts.emailTemplates.resetPassword.text = function(user, url) {
    var email, removeHash;
    email = user.emails[0].address;
    removeHash = url.replace('#/', '');
    return "A password reset has been requested for the account related to this address(" + email + "). To reset the password, visit the following link:\n\n " + removeHash + "\n\n If you did not request this reset, please ignore this email. If you feel something is wrong, please contact support: admin@thekeepspace.com.";
  };

