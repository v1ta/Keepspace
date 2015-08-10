// Only publish thoughts that are public or belong to the current user
Meteor.publish("thoughts", function () {
    return Thoughts.find({
        $or: [
            { private: {$ne: true} },
            { owner: this.userId }
        ]
    });
});

Meteor.publish("userdata", function() {
    if (this.userId){
        return Meteor.users.find({_id: this.userId},{fields: {'services': 1}});
    } else {
        this.ready();
    }
});

Accounts.onCreateUser(function(options, user){
    if (options.profile){
        user.profile = options.profile; 
    }
    // To give FB-created accounts a username
    user.username = ( user.username || options.profile.name)
    return user;
})

Meteor.methods({
    //Facebook request

});