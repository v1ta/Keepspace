Meteor.methods({
	addThought: function (text, location) {
        if(!UserLoggedIn) return false; // Make sure the user is logged in before inserting a thought
        //var friendList = Friends.findOne({userId:Meteor.userId()},{friendList:1,_id:0});
        var newThought = {
            text: text,
            createdAt: new Date(),
            userId: Meteor.userId(),
            rank: (Math.random() / 2),
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
    updatePrivacy : function(id, value, ownerId) {
        thought = Thoughts.findOne({_id: id});
        if (ownerId == thought.userId) {
            Thoughts.update({_id: id}, {$set: {privacy: value}});
        }
    }
});