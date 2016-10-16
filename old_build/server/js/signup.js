Accounts.urls.verifyEmail = function (token) {
    return Meteor.absoluteUrl('verify-email/' + token);
};

Meteor.methods({
    serverVerifyEmail: function(email, userId, callback) {
        console.log("Email to verify:" +email + " | userId: "+userId);
        Accounts.sendVerificationEmail(userId, email);
        if (typeof callback !== 'undefined') {
            callback();
        }
    }
});

Accounts.onCreateUser(function(options, user){
    if (options.profile){
        user.profile = options.profile;
        user.username = ( user.profile.firstName || options.profile.name );
        if (user.services.facebook) {
            options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?height=200&width=200";
        } else if (options.profile.picture == undefined){
            console.log(options.profile.picture);
            options.profile.picture = "/avatars/default.png";
        }
        user.profile = options.profile;
    } else {
        user.profile = {};
        user.profile.picture = "/avatars/default.png";
        user.username = ( user.username || user.emails[0].address);
    }
    user.profile.collects = 0;
    user.profile.lastShared = {
        date: 0,
        thoughtId: 0
    };
    user.profile.firstName = options.firstName;
    user.profile.lastName = options.lastName;
    user.profile.phone = options.phone;
    return user;
});