Meteor.startup(function () {
  Accounts.emailTemplates.from = 'do-not-reply@mykeepspace.com';
  Accounts.emailTemplates.siteName = 'mykeepspace';
});

