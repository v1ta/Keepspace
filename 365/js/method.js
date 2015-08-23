FindFriends = new Mongo.Collection("FindFriends");
Thoughts = new Mongo.Collection("Thoughts"); //TODO Shard for scaling
Friends = new Mongo.Collection("Friends");


<<<<<<< Updated upstream
    addThought: function (text, location) {
        // Make sure the user is logged in before inserting a thought
        if(!UserLoggedIn) return false
        Thoughts.insert({
=======
Thoughts.attachSchema(Schemas.Thought);
Friends.attachSchema(Schemas.FriendEdge);
FindFriends.attachSchema(Schemas.FindFriend);

if (Meteor.isServer) {
    Friends._ensureIndex({ userId: 1, friendId: 1});
    Thoughts._ensureIndex({ userId: 1, createdAt: 1});
}

Meteor.methods({
    /*
     * Call after confirmed friend
     */
    addSearchFriend: function(userId, user) {
        FindFriends.insert(
            {userid: userId},
            {username: user.username}
            );
    },
    addFriend: function (friendId) { 
        if (!UserLoggedIn) return false;
        Friends.update(
            {userId: Meteor.userId()}, 
            {$push: {friendList: friendId}},
            {upsert: true}
        );
    },
    addThought: function (text, location, visibility) {
        /* 
         * Make sure the user is logged in before inserting a thought
         */
        if(!UserLoggedIn) return false;
        visibility = typeof visibility !== 'undefined' ? visibility : 'public';
        
        var newThought = {
            userId: Meteor.userId(),
>>>>>>> Stashed changes
            text: text,
            createdAt: new Date(),
            rank: 0,
            username: Meteor.user().username,
<<<<<<< Updated upstream
            position: location
        });
        return
=======
            position: location,
            filter: visibility
        };
        if (visibility === 'friends') {
            friendList = Friends.find({userID: Meteor.usedId()}, {friendList:1,  _id:0}).fetch();
        }
        Thoughts.insert(newThought);
        return newThought;
>>>>>>> Stashed changes
    },
    /*
     * specifically for adding facebook posts
     */
    addPost: function(post){
        if(!UserLoggedIn) return false
        var thoughtId;
        var text = post["message"];
        var postString = JSON.stringify(post);
        Thoughts.insert({
            text: text,
            createdAt: new Date(),
            userId: Meteor.userId(),
            rank: 0,
            username: Meteor.user().username,
            postString: postString,
            position: null  
        }, 
        function(err,thoughtInserted){
                thoughtId = thoughtInserted
        });
        return thoughtId
    },
    changeRank: function(thoughtId, action){
        if(!UserLoggedIn) return false
        RankRecord.find({thoughtId: thoughtId}, {UserId:Meteor.userId()})
    },
    deleteThought: function (thoughtId) {
        if(!UserLoggedIn) return false
        var thought = Thoughts.findOne(thoughtId);
        if (thought.private && thought.owner !== Meteor.userId()) {
            /*
             * If the thought is private, make sure only the owner can delete it
             */
            throw new Meteor.Error("not-authorized");
        }
        Thoughts.remove(thoughtId);
    },
    findFriend: function (friendId){
        if (!UserLoggedIn) return false;
        var friend = Meteor.users.find({userId: friendId}, {username:1}).fetch();
        if (friend !== 'undefined') {
            console.log(friend);
        }else {
            console.log("That person doesn't exist");
        }
    },
    addToMyCollection: function(thoughtId){
        console.log(thoughtId);
    },
    changePrivacy: function (thoughtId, setChecked) {
        if(!UserLoggedIn) return false
        var thought = Thoughts.findOne(thoughtId);
        if (thought.private && thought.owner !== Meteor.userId()) {
            // If the thought is private, make sure only the owner can check it off
            throw new Meteor.Error("not-authorized");
        }
        Thoughts.update(thoughtId, { $set: { checked: setChecked} });
    },
    setPrivate: function (thoughtId, setToPrivate) {
        if(!UserLoggedIn) return false
        var thought = Thoughts.findOne(thoughtId);
        // Make sure only the thought owner can make a thought private
        if (thought.owner !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Thoughts.update(thoughtId, { $set: { private: setToPrivate } });
    },
    getUserName: function(){
        return Meteor.user().username;
    },
    getFBUserData: function() {
            console.log("here");
            var fb = new Facebook(Meteor.user().services.facebook.accessToken);
            var data = fb.getUserData();
            return data;
        },
        getFBPostData: function() {
            var fb = new Facebook(Meteor.user().services.facebook.accessToken);
            var data = fb.getPostData();
            return data;
        },
        isFBSession: function(){
            var fb = new Facebook(Meteor.user().services.facebook.accessToken);
            if (fb){
                return true;
            }
            else{
                return false;
            }
        }
});

function Facebook(accessToken) {
        this.fb = Meteor.require('fbgraph');
        this.accessToken = accessToken;
        this.fb.setAccessToken(this.accessToken);
        this.options = {
            timeout: 3000,
            pool: {maxSockets: Infinity},
            headers: {connection: "keep-alive"}
        }
        this.fb.setOptions(this.options);
}

function UserLoggedIn() {
    if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
    }
    return false;
}

Facebook.prototype.query = function(query, method) {
        var self = this;
        var method = (typeof method === 'undefined') ? 'get' : method;
        var data = Meteor.sync(function(done) {
            self.fb[method](query, function(err, res) {
                done(null, res);
            });
        });
        return data.result;
}

Facebook.prototype.getUserData = function() {
        console.log("here");
        return this.query('me');
}

Facebook.prototype.getPostData = function() {
        return this.query('/me/feed?limit=5');
}

/**
 * Remove a callback from a hook
 * @param {string} hook - The name of the hook
 * @param {string} functionName - The name of the function to remove
 */



