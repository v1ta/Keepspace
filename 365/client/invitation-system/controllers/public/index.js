Template.index.rendered = function() {
    return $('#request-beta-invite').validate({
      rules: {
        emailAddress: {
          email: true,
          required: true
        }
      },
      messages: {
        emailAddress: {
          email: "Please use a valid email address.",
          required: "An email address is required to get your invite."
        }
      },
      submitHandler: function() {
        var invitee;
        invitee = {
          email: $('[name="emailAddress"]').val().toLowerCase(),
          invited: false,
          requested: (new Date()).getTime()
        };
        return Meteor.call('validateEmailAddress', invitee.email, function(error, response) {
          if (error) {
            return alert(error.reason);
          } else {
            if (response.error) {
              return alert(response.error);
            } else {
              return Meteor.call('addToInvitesList', invitee, function(error, response) {
                if (error) {
                  return alert(error.reason);
                } else {
                  return alert("Invite requested. We'll be in touch soon. Thanks for your interest in Urkelforce!");
                }
              });
            }
          }
        });
      }
    });
  };

  Template.index.events({
    'submit form': function(e) {
      return e.preventDefault();
    }
  });


