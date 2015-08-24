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
        return Meteor.users.find({_id: this.userId},{fields: {'services': 1}});
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


Accounts.onCreateUser(function(options, user){
    
    if (options.profile){
        user.profile = options.profile; 
    }
    // To give FB-created accounts a username
    user.username = ( user.username || options.profile.name);

    
    (function(){
        FindFriends.insert({userId: user._id, username: user.username});
        return true;
    })();
    

    return user;
});




