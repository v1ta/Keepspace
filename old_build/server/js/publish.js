Meteor.startup(function () {
  Accounts.emailTemplates.from = 'do-not-reply@thekeepspace.com';
  Accounts.emailTemplates.siteName = 'thekeepspace';
});

Meteor.publish("thoughts", function () { // Only publish thoughts that are public or belong to the current user
    return Thoughts.find({
        $or: [
            { private: {$ne: true} },
            { userId: this.userId }
        ]
    });
});

Meteor.publish("splashThoughts", function() {
    return SplashThoughts.find({});
});

Meteor.publish("users", function() {
    return Meteor.users.find({});
});

Meteor.publish("SearchUsers", searchUsers);

Meteor.publish("Notifications", function() {
    var cursor = Notifications.find({userId: this.userId});
    Counts.publish(this, "Notifications-Counter", Notifications.find({userId: this.userId}), {noReady: true});
    return cursor;
});

Meteor.publish("avatars", function() {
    return Avatars.find();
});
/*
Meteor.publish('images', function(limit) {
    //check(limit, Number);
    limit = 20;
    return Images.find({}, {
        limit: limit,
        sort: {uploadedAt:-1}
    });
});
    */