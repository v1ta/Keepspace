/*
 * 3rd party API for custom keys
 */
(function() {
  var Future;

  Future = Npm.require('fibers/future');

  Meteor.methods({
    validateEmailAddress: function(address) {
      var validateEmail;
      check(address, String);
      validateEmail = new Future();
      HTTP.call("GET", "https://api.kickbox.io/v1/verify", {
        params: {
          email: address,
          apikey: ""
        }
      }, function(error, response) {
        if (error) {
          return validateEmail["return"](error);
        } else {
          if (response.data.result === "invalid" || response.data.result === "unknown") {
            return validateEmail["return"]({
              error: "Sorry, your email was returned as invalid. Please try another address."
            });
          } else {
            return validateEmail["return"](true);
          }
        }
      });
      return validateEmail.wait();
    }
  });

}).call(this);
