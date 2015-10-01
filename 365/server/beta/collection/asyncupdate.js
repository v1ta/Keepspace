/*
 * Query Invites
 */
(function() {
  Meteor.methods({
    countInvites: function() {
      return Invites.find({}, {
        fields: {
          "_id": 1
        }
      }).count();
    }
  });

}).call(this);

/*
 * Beta Tokens
 */
(function() {
  Meteor.methods({
    validateBetaToken: function(user) {
      var id, testInvite;
      check(user, {
        email: String,
        password: String,
        betaToken: String
      });
      testInvite = Invites.findOne({
        email: user.email,
        token: user.betaToken
      }, {
        fields: {
          "_id": 1,
          "email": 1,
          "token": 1
        }
      });
      if (!testInvite) {
        throw new Meteor.Error("bad-match", "Hmm, this token doesn't match your email. Try again?");
      } else {
        id = Accounts.createUser({
          email: user.email,
          password: user.password
        });
        Roles.addUsersToRoles(id, ['tester']);
        Invites.update(testInvite._id, {
          $set: {
            accountCreated: true
          },
          $unset: {
            token: ""
          }
        });
        return true;
      }
    }
  });

}).call(this);

/*
 * Send Invite
 */
(function() {
  Meteor.methods({
    sendInvite: function(invitee, url) {
      var token;
      check(invitee, {
        id: String,
        email: String
      });
      check(url, String);
      token = Random.hexString(10);
      return Invites.update(invitee.id, {
        $set: {
          token: token,
          dateInvited: (new Date()).getTime(),
          invited: true,
          accountCreated: false
        }
      }, function(error) {
        if (error) {
          return console.log(error);
        } else {
          return Email.send({
            to: invitee.email,
            from: "do-not-reply@mykeepspace.com",
            subject: "Welcome to Keepspace!",
            html: Handlebars.templates['send-invite']({
              token: token,
              url: url,
              urlWithToken: url + ("/" + token)
            })
          });
        }
      });
    }
  });

}).call(this);

/* 
 * Add to Invites
 */
(function() {
  Meteor.methods({
    addToInvitesList: function(invitee) {
      var emailExists, inviteCount;
      check(invitee, {
        email: String,
        requested: Number,
        invited: Boolean
      });
      emailExists = Invites.findOne({
        "email": invitee.email
      });
      if (emailExists) {
        throw new Meteor.Error("email-exists", "It looks like you've already signed up for our beta. Thanks!");
      } else {
        inviteCount = Invites.find({}, {
          fields: {
            "_id": 1
          }
        }).count();
        invitee.inviteNumber = inviteCount + 1;
        return Invites.insert(invitee, function(error) {
          if (error) {
            return console.log(error);
          }
        });
      }
    }
  });

}).call(this);


