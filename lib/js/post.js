Meteor.methods({
	addThought: function (text, location) {
        // Make sure the user is logged in before inserting a thought
        //defined in method.js
        if(!UserLoggedIn) return false;

        //var friendList = Friends.findOne({userId:Meteor.userId()},{friendList:1,_id:0});
        var newThought = {
            text: text,
            createdAt: new Date(),
            userId: Meteor.userId(),
            rank: 0,
            username: Meteor.user().username,
            position: location,
            collectedBy: [],
            randomIndex: Math.floor(Math.random() * 100000000) + 1, 
            privacy: 'private',
        };
        var thoughtId = Thoughts.insert(newThought);
        collect();
        return thoughtId;
    },
    /* currently for debugging */
    updatePrivacy : function(id, value, ownerId) {
        thought = Thoughts.findOne({_id: id});
        if (ownerId == thought.userId) {
            Thoughts.update({_id: id}, {$set: {privacy: value}});
        }
    }
});