FindFriends = new Mongo.Collection("FindFriends");
Thoughts = new Mongo.Collection("Thoughts"); //TODO Shard for scaling
//Friends = new Mongo.Collection("Friends");
RankRecord = new Mongo.Collection("RankRecord");
SavedPosts = new Mongo.Collection("SavedPosts");
betaEmailCollection = new Mongo.Collection("betaSignup");
Avatars = new FS.Collection("avatars", {
    filter: {
        maxSize: 10000000, // 10MB
        allow: {
            contentTypes: ['image/*'],
            extensions: ['png','jpg','gif']
        },
        onInvalid: function (message) {
          if (Meteor.isClient) {
            alert(message);
          } else {
            console.log(message);
          }
        }
    },
    stores: [new FS.Store.GridFS("avatars")]
})


Thoughts.attachSchema(Schemas.Thought);
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

    function isLoggedIn() {
        return Meteor.user() ? true : false
    }
    Avatars.allow({
        insert: isLoggedIn,
        update: isLoggedIn
    });
}


Meteor.methods({
    /*
     * Call after confirmed friend
     */
    addFriend: function (friendId) { 
        var currentUser = Meteor.user();
        /*
        Friends.update(
            {userId: Meteor.userId()},
            {
                $set: {userId: Meteor.userId()},
                $addToSet: {friendList: friendId}
            },
            {upsert: true}
        );   
        */
    },
    addThought: function (text, location) {
        // Make sure the user is logged in before inserting a thought
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
            privacy: 'private'
            //friendList: friendList ? friendList.friendList : [],
        };
        var thoughtId = Thoughts.insert(newThought);
        collect();
        return thoughtId;
    },
    addToMyCollection: function(thoughtID){
        collect();
        var userID = Meteor.userId();
        Thoughts.update(
            {"_id" : thoughtID},
            {$addToSet : {'collectedBy': userID}}
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
        collect();
        return thoughtId
    },
    changeRank: function(thoughtId, action){
        if(!UserLoggedIn) return false
        RankRecord.find({thoughtId: thoughtId}, {UserId:Meteor.userId()})
    },
    deleteThought: function (thoughtId) {
        if(!UserLoggedIn) return false
        var thought = Thoughts.findOne(thoughtId);
        if (thought.privacy === 'private' && thought.userId !== Meteor.userId()) {
            /*
             * If the thought is private, make sure only the owner can delete it
             */
            throw new Meteor.Error("not-authorized");
        }
        if (thoughtId === Meteor.user().profile.lastShared.thoughtId) {
            // Reset lastShared
            profile.lastShared.date = 0;
            profile.lastShared.thoughtId = 0;
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
    }
  
    /*
    addBetaEmail: function(email){
        
        var createdAt = new Date();
        var time = createdAt.toISOString();
        betaEmailCollection.insert({
            email: email,
            createdAt: time
        });
        Accounts.createUser({
            username: email,
            password: "password"
        });

    }
    */
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

function collect() {
    if(!UserLoggedIn) return false;
    var profile = Meteor.user().profile;
    profile.collects += 1;
    Meteor.users.update(Meteor.userId(), { $set: {profile: profile} });
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

User.registerBlockingHook(function(user){
    console.log("called");
    if(currentUser.blockAnnoyingUsers && user.flaggedCount > 10){
        return true;
    }
});


