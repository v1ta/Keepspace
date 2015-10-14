
Thoughts = new Mongo.Collection("Thoughts"); //TODO Shard for scaling
RankRecord = new Mongo.Collection("RankRecord");
SavedPosts = new Mongo.Collection("SavedPosts");
Notifications = new Mongo.Collection("Notifications");

Thoughts.attachSchema(Schemas.Thought);
Notifications.attachSchema(Schemas.Notifications);

if (Meteor.isServer){
    Thoughts.allow({
      insert: function (userId, doc) {
        return true;
      }
    });
}

UserLoggedIn = function() {
    if (! Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
    }
    return false;
}

collect = function() {
    if(!UserLoggedIn) return false;
    var profile = Meteor.user().profile;
    profile.collects += 1;
    Meteor.users.update(Meteor.userId(), { $set: {profile: profile} });
}