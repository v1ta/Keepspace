Template.login2.created = function() {};

  Template.login2.rendered = function() {
    return $('#application-login').validate({
      rules: {
        emailAddress: {
          required: true,
          email: true
        },
        password: {
          required: true
        }
      },
      messages: {
        emailAddress: {
          required: "Please enter your email address to login.",
          email: "Please enter a valid email address."
        },
        password: {
          required: "Please enter your password to login."
        }
      },
      submitHandler: function() {
        var user;
        user = {
          email: $('[name="emailAddress"]').val(),
          password: $('[name="password"]').val()
        };
        return Meteor.loginWithPassword(user.email, user.password, function(error) {
          if (error) {
            return alert(error.reason);
          }
        });
      }
    });
  };

  Template.login2.helpers({
    example: function() {}
  });

  Template.login2.events({
    'submit form': function(e, t) {
      return e.preventDefault();
    }
  });


