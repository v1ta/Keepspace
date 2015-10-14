
  Template.signup2.created = function() {};

  Template.signup2.rendered = function() {
    return $('#application-signup').validate({
      rules: {
        emailAddress: {
          required: true,
          email: true
        },
        password: {
          required: true,
          minlength: 6
        },
        betaToken: {
          required: true
        }
      },
      messages: {
        emailAddress: {
          required: "Please enter your email address to sign up.",
          email: "Please enter a valid email address."
        },
        password: {
          required: "Please enter a password to sign up.",
          minlength: "Please use at least six characters."
        },
        betaToken: {
          required: "A valid beta token is required to sign up."
        }
      },
      submitHandler: function() {
        var user;
        user = {
          email: $('[name="emailAddress"]').val().toLowerCase(),
          password: $('[name="password"]').val(),
          betaToken: $('[name="betaToken"]').val()
        };
        return Meteor.call('validateBetaToken', user, function(error) {
          if (error) {
            return alert(error.reason);
          } else {
            return Meteor.loginWithPassword(user.email, user.password, function(error) {
              if (error) {
                return alert(error.reason);
              } else {
                return Router.go('/dashboard');
              }
            });
          }
        });
      }
    });
  };

  Template.signup2.helpers({
    betaToken: function() {
      return Session.get('betaToken');
    }
  });

  Template.signup2.events({
    'submit form': function(e) {
      return e.preventDefault();
    }
  });

