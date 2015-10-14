Template.resetPassword.created = function() {};

  Template.resetPassword.rendered = function() {
    return $('#application-reset-password').validate({
      rules: {
        newPassword: {
          required: true,
          minlength: 6
        },
        repeatNewPassword: {
          required: true,
          minlength: 6,
          equalTo: "[name='newPassword']"
        }
      },
      messages: {
        newPassword: {
          required: "Please enter a new password.",
          minlength: "Please use at least six characters."
        },
        repeatNewPassword: {
          required: "Please repeat your new password.",
          equalTo: "Your password do not match. Please try again."
        }
      },
      submitHandler: function() {
        var password, token;
        token = Session.get('resetPasswordToken');
        password = {
          newPassword: $('[name="newPassword"]').val(),
          repeatPassword: $('[name="repeatNewPassword"]').val()
        };
        return Accounts.resetPassword(token, password.newPassword, function(error) {
          if (error) {
            return alert(error.reason);
          } else {
            return Session.set('resetPasswordToken', null);
          }
        });
      }
    });
  };

  Template.resetPassword.helpers({
    example: function() {}
  });

  Template.resetPassword.events({
    'submit form': function(e) {
      return e.preventDefault();
    }
  });

