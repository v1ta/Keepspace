Template.header2.created = function() {};

  Template.header2.rendered = function() {};

  Template.header2.helpers({
    example: function() {}
  });

  Template.header2.events({
    'click .logout': function(e, t) {
      return Meteor.logout(function(error) {
        if (error) {
          return alert(error.reason);
        }
      });
    }
  });

