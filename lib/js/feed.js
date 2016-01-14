Meteor.methods({
	addToMyCollection: function(thoughtID){
        //collect defined in method.js
        collect();
        var userID = Meteor.userId();
        Thoughts.update(
            {"_id" : thoughtID},
            {$push : {'collectedBy': userID}}
        );
    },
    /*
     * posting a thought to other feeds/recalling that thought
     * Assumes the posting is valid! (i.e. user hasn't already posted a thought today)
     */
    shareThought: function (thought, setPrivacy) {
        var profile = Meteor.user().profile;
        if (setPrivacy === 'private') {
            // Reset lastShared
            profile.lastShared.date = 0;
            profile.lastShared.thoughtId = 0;
        } else {
            // Update user's profile.lastShared info to this thought
            profile.lastShared.date = new Date();
            profile.lastShared.thoughtId = thought._id;   
        }
        Meteor.users.update(Meteor.userId(), {$set : { profile: profile }});
        // Update privacy setting of the thought itself
        Thoughts.update({'_id': thought._id}, {$set: {privacy: setPrivacy}});
    },
    deleteThought: function (thoughtId) {
        //userLoggedIn defined in method.js
        if(!UserLoggedIn) return false
        var thought = Thoughts.findOne(thoughtId);
        if (thought.privacy === 'private' && thought.userId !== Meteor.userId()) {
            /*
             * If the thought is private, make sure only the owner can delete it
             */
            throw new Meteor.Error("not-authorized");
        }
        var profile = Meteor.user().profile;
        if (thoughtId === profile.lastShared.thoughtId) {
            // Reset lastShared
            profile.lastShared.date = 0;
            profile.lastShared.thoughtId = 0;
            Meteor.users.update(Meteor.userId(), { $set: {profile: profile} });
        }
        Thoughts.remove(thoughtId);
    },
    changePrivacy: function (thoughtId, setChecked) {
        //userLoggedIn defined in method.js
        if(!UserLoggedIn) return false
        var thought = Thoughts.findOne(thoughtId);
        if (thought.private && thought.userId !== Meteor.userId()) {
            // If the thought is private, make sure only the owner can check it off
            throw new Meteor.Error("not-authorized");
        }
        Thoughts.update(thoughtId, { $set: { checked: setChecked} });
    },
    setPrivate: function (thoughtId, setToPrivate) {
        //userLoggedIn defined in method.js
        if(!UserLoggedIn) return false
        var thought = Thoughts.findOne(thoughtId);
        // Make sure only the thought owner can make a thought private
        if (thought.userId !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Thoughts.update(thoughtId, { $set: { private: setToPrivate } });
    },
});

function Thought(text, location, callback){
    var getFriendListSync = Meteor.wrapAsync(getFriendList);  
    var friends = getFriendListSync();
    var newThought = {
        userId: this.userId,
        text: text,
        createdAt: new Date(),
        rank: 0,
        username: Meteor.user().username,
        position: location,
        filter: 'friends',
        friendList: friends
    };
    return newThought;
}

User.registerBlockingHook(function(user){
    if(currentUser.blockAnnoyingUsers && user.flaggedCount > 10){
        return true;
    }
});