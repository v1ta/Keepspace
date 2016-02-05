Template.signup.rendered = function () {
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
            },
            firstName: {
                required: true
            },
            lastName: {
                required: true
            },
            phone: {
                required:false
            },

        },
        messages: {
            emailAddress: {
                // required: "Please enter your email address to sign up.",
                required: "",
                email: "",
                // email: "Please enter a valid email address."
            },
            password: {
                // required: "Please enter a password to sign up.",
                required: "",
                minlength: "",
                // minlength: "Please use at least six characters."
            },
            betaToken: {
                // required: "A valid beta token is required to sign up."
                required: "",
            },
            firstName: {
                // required: "Please enter your first name"
                required: "",
            },
            lastName: {
                // required: "Please enter your last name"
                required: "",
            },
            phone: {

            }
        },
        submitHandler: function () {
            var user;
            user = {
                email: $('[name="emailAddress"]').val().toLowerCase(),
                password: $('[name="password"]').val(),
                betaToken: $('[name="betaToken"]').val(),
                firstName: $('[name="firstName"]').val(),
                lastName: $('[name="lastName"]').val(),
                phone: $('[name="phone"]').val(),
            };
            return Meteor.call('validateBetaToken', user, function (error) {
                if (error) {
                    return alert(error.reason);
                } else {
                    return Meteor.loginWithPassword(user.email, user.password, function (error) {
                        if (error) {
                            return alert(error.reason);
                        } else {
                            return Router.go('/');
                        }
                    });
                }
            });
        }
    });
};

Template.signup.helpers({
    betaToken: function () {
        return Session.get('betaToken');
    }
});

Template.signup.events({
    'submit form': function (event) {
        console.log("debugging3");
        return event.preventDefault();
    },
    'click #signupButton': function(event) {
        return event.preventDefault();
    },
    'click #homeLogo': function (event) {
        Router.go("splash");
    }
});

