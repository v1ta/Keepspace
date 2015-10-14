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

