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
          return sAlert.error(error.reason, {effect: 'genie', position: 'top-left', offset: '320px'});
      }
        else {
          sAlert.info("We've sent you an email on how to recover your password.",{effect: 'genie', position: 'top-left', offset: '320px'})
          Meteor.setTimeout(function(){
            Router.go('splash');
          },3000);

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
  },
  'click #homeLogo': function(event){
    Router.go("splash");
  }
});

