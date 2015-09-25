Meteor.startup(function () {
  Accounts.emailTemplates.from = 'do-no-reply@mykeepspace.com';
  Accounts.emailTemplates.siteName = 'mykeepspace';
});

