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
    return Meteor.users.find({});
    /*
    if (this.userId){
        return Meteor.users.find({_id: this.userId},{fields: {'services': 1, 'createdAt': 1}});
    } else {
        this.ready();
    }
    */
});


Meteor.publish("findFriends", function(searchString){
    var filter = new RegExp('^' + searchString, 'i');
    return FindFriends.find(
        {username: filter},
        {sort: {username: 1}, limit:20}
    );
    
});

/*
Meteor.publish("friends", function() {
        return Friends.find({userId: this.userId});
});
*/

Meteor.publish("avatars", function() {
    return Avatars.find();
});


Accounts.onCreateUser(function(options, user){
    
    if (options.profile){
        user.profile = options.profile; 
        user.username = ( user.username || options.profile.name );
        if (user.services.facebook)
            options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?height=200&width=200";
        else
            options.profile.picture = "/avatars/default.png";
        user.profile = options.profile;
    } else {
        user.profile = {};
        user.profile.picture = "/avatars/default.png";
        user.username = ( user.username || user.emails[0].address);
    }

    user.profile.collects = 0;

    

    (function(){
        FindFriends.insert({userId: user._id, username: user.username});
        return true;
    })();

    return user;
});

Meteor.publish("friends", function (options) {
    if(!this.userId){
        return this.ready();
    }

    options = options || {};

    //only allow the limit and skip options
    options = _.pick(options, "limit", "skip", "sort");



    Meteor.publishWithRelations({
        handle: this,
        collection: Meteor.friends,
        filter: {userId:this.userId, friendId:{$ne:this.userId}},
        options:options,
        mappings: [{
            key: 'friendId',
            collection: Meteor.users,
            options:{fields:{username:true, avatarId:true, status:true}}
        }]
    });
});

Meteor.publish('friendRequests', function(options){
    if(!this.userId){
        return this.ready();
    }

    options = options || {};

    //only allow the limit and skip options
    options = _.pick(options, "limit", "skip", "sort");

    Meteor.publishWithRelations({
        handle: this,
        collection: Meteor.requests,
        filter: {userId:this.userId, denied:{$exists:false}, ignored:{$exists:false}},
        options:options,
        mappings: [{
            key: 'requesterId',
            collection: Meteor.users,
            options:{fields:{username:true, avatarId:true}}
        }]
    });

});

Meteor.publish('ignoredFriendRequests', function(options){
    if(!this.userId){
        return this.ready();
    }

    options = options || {};

    //only allow the limit and skip options
    options = _.pick(options, "limit", "skip", "sort");

    Meteor.publishWithRelations({
        handle: this,
        collection: Meteor.requests,
        filter: {userId:this.userId, denied:{$exists:false}, ignored:{$exists:true}},
        options:options,
        mappings: [{
            key: 'requesterId',
            collection: Meteor.users,
            options:{fields:{username:true, avatarId:true}}
        }]
    });

});

Meteor.publish('outgoingFriendRequests', function(options){
    if(!this.userId){
        return this.ready();
    }

    options = options || {};

    //only allow the limit and skip options
    options = _.pick(options, "limit", "skip", "sort");

    Meteor.publishWithRelations({
        handle: this,
        collection: Meteor.requests,
        filter: {requesterId:this.userId, denied:{$exists:false}},
        options:options,
        mappings: [{
            key: 'requesterId',
            collection: Meteor.users,
            options:{fields:{username:true, avatarId:true}}
        }]
    });

});

