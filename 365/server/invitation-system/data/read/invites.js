Meteor.methods({
    countInvites: function() {
      return Invites.find({}, {
        fields: {
          "_id": 1
        }
      }).count();
    }
  });


