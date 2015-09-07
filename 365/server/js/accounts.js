Meteor.startup(function () {
  smtp = {
    username: 'root',
    server:   'localhost',  // eg: mail.gandi.net
    port: 25
  }
  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
});

