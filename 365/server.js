if (Meteor.isServer) {
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


  if (options.profile)
    user.profile = options.profile;
  // To give FB-created accounts a username
  user.username = ( user.username || options.profile.name)

  return user;
  })

    //facebook type
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
      return this.query('me');
  }
  Facebook.prototype.getPostData = function() {
    return this.query('/me/feed');
  }
  
  Meteor.methods({
  //Facebook request
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
  });

}