(function() {
  Meteor.publish('/invites', function() {
    if (Roles.userIsInRole(this.userId, ['admin'])) {
      return Invites.find({}, {
        fields: {
          "_id": 1,
          "inviteNumber": 1,
          "requested": 1,
          "email": 1,
          "token": 1,
          "dateInvited": 1,
          "invited": 1,
          "accountCreated": 1
        }
      });
    }
  });

  Meteor.publish('inviteCount', function() {
    return Invites.find({}, {
      fields: {
        "_id": 1
      }
    });
  });

}).call(this);
