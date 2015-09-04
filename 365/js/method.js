FindFriends = new Mongo.Collection("FindFriends");
Thoughts = new Mongo.Collection("Thoughts"); //TODO Shard for scaling
Friends = new Mongo.Collection("Friends");
RankRecord = new Mongo.Collection("RankRecord");
SavedPosts = new Mongo.Collection("SavedPosts");
betaEmailCollection = new Mongo.Collection("betaSignup");


Thoughts.attachSchema(Schemas.Thought);
//Friends.attachSchema(Schemas.FriendEdge);
FindFriends.attachSchema(Schemas.FindFriend);

if (Meteor.isServer){
    Thoughts.allow({
      insert: function (userId, doc) {
        return true;
      }
    });

    FindFriends.allow({
      insert: function (userId, doc) {
        return true;
      }
    });

    Friends.allow({
      insert: function (userId, doc) {
        return true;
      }
    });

    //Friends._ensureIndex({ userId: 1, friendId: 1});
    //Thoughts._ensureIndex({ userId: 1, createdAt: 1});
}


Meteor.methods({
    /*
     * Call after confirmed friend
     */
    addFriend: function (friendId) { 
        Friends.update(
            {userId: Meteor.userId()},
            {
                $set: {userId: Meteor.userId()},
                $addToSet: {friendList: friendId}
            },
            {upsert: true}
        );   
    },
    addThought: function (text, location) {
        // Make sure the user is logged in before inserting a thought
        if(!UserLoggedIn) return false;

        var friendList = Friends.findOne({userId:Meteor.userId()},{friendList:1,_id:0});

        var newThought = {
            text: text,
            createdAt: new Date(),
            userId: Meteor.userId(),
            rank: 0,
            username: Meteor.user().username,
            position: location,
            collectedBy: [],
            friendList: friendList ? friendList.friendList : [],
            
        };
        Thoughts.insert(newThought);
        return newThought;
    },
    addToMyCollection: function(thoughtID){
        var id = Meteor.userId();
        var thought = Thoughts.findOne(thoughtId);

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
        if (thought.private && thought.userId !== Meteor.userId()) {
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
        if (thought.private && thought.userId !== Meteor.userId()) {
            // If the thought is private, make sure only the owner can check it off
            throw new Meteor.Error("not-authorized");
        }
        Thoughts.update(thoughtId, { $set: { checked: setChecked} });
    },
    setPrivate: function (thoughtId, setToPrivate) {
        if(!UserLoggedIn) return false
        var thought = Thoughts.findOne(thoughtId);
        // Make sure only the thought owner can make a thought private
        if (thought.userId !== Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Thoughts.update(thoughtId, { $set: { private: setToPrivate } });
    },
    getUserName: function(){
        return Meteor.user().username;
    },
    getFBUserData: function() {
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
    },
    addBetaEmail: function(email){
        
        var createdAt = new Date();
        var time = createdAt.toISOString();
        betaEmailCollection.insert({
            email: email,
            createdAt: time
        });
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

function getFriendList(callback){
    return Friends.find({userId: this.userId}, {friendList:{},  _id:0}).fetch();
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



