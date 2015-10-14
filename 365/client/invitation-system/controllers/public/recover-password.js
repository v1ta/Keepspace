Template.recoverPassword.created = function() {};

  Template.recoverPassword.rendered = function() {
    return $('#application-recover-password').validate({
      rules: {
        emailAddress: {
          required: true,
          email: true
        }
      },
      messages: {
        emailAddress: {
          required: "Please enter your email address to recover your password.",
          email: "Please enter a valid email address."
        }
      },
      submitHandler: function() {
        var email;
        email = $('[name="emailAddress"]').val();
        return Accounts.forgotPassword({
          email: email
        }, function(error) {
          if (error) {
            return alert(error.reason);
          }
        });
      }
    });
  };

  Template.recoverPassword.helpers({
    example: function() {}
  });

  Template.recoverPassword.events({
    'submit form': function(e) {
      return e.preventDefault();
    }
  });

