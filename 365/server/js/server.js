// Only publish thoughts that are public or belong to the current user
Meteor.publish("thoughts", function () {
    return Thoughts.find({
        $or: [
            { private: {$ne: true} },
            { userId: this.userId },
            { friendList: this.userId }
        ]
    });
});

Meteor.publish("users", function() {
    if (this.userId){
        return Meteor.users.find({_id: this.userId},{fields: {'services': 1, 'createdAt': 1}});
    } else {
        this.ready();
    }
});


Meteor.publish("findFriends", function(searchString){
    var filter = new RegExp('^' + searchString, 'i');
    return FindFriends.find(
        {username: filter},
        {sort: {username: 1}, limit:20}
    );
    
});

Meteor.publish("friends", function() {
        return Friends.find({userId: this.userId});
});

Meteor.publish("avatars", function() {
    return Avatars.find();
});


Accounts.onCreateUser(function(options, user){
    
    if (options.profile){
        if (user.services.facebook)
            options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?height=200&width=200";
        else
            options.profile.picture = "/avatars/default.png";
        user.profile = options.profile;
    } else {
        user.profile.picture = "/avatars/default.png";
    }
    // To give FB-created accounts a username
    user.username = ( user.username || options.profile.name);

    user.profile.collects = 0;

    
    (function(){
        FindFriends.insert({userId: user._id, username: user.username});
        return true;
    })();
    

    return user;
});


