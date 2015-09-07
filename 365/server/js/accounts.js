Meteor.startup(function () {
  smtp = {
    server:   'localhost',  // eg: mail.gandi.net
    port: 25
  }
  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.server) + ':' + smtp.port;
});

