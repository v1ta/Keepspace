
Thoughts = new Mongo.Collection("Thoughts");
Friends = new Mongo.Collection("Friends");
RankRecord = new Mongo.Collection("RankRecord");

Meteor.methods({

  addThought: function (text, location) {
    // Make sure the user is logged in before inserting a thought
    if(!UserLoggedIn) return false
    Thoughts.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      rank: 0,
      username: Meteor.user().username,
      position: location});

    return
  },
  //specifically for adding facebook posts
  addPost: function(post){
    if(!UserLoggedIn) return false
    var thoughtId;
    var text = post["message"];
    var postString = JSON.stringify(post);
    Thoughts.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      rank: 0,
      username: Meteor.user().username,
      postString: postString,
      position: null  }, function(err,thoughtInserted){
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
      // If the thought is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    Thoughts.remove(thoughtId);
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

  //get username
  getUserName: function(){
    return Meteor.user().username;
  },
});

thoughtHelpers ={

}
function UserLoggedIn() {
  if (! Meteor.userId()) {
    throw new Meteor.Error("not-authorized");
  }
  return false
}