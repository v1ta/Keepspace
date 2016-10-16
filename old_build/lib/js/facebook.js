Meteor.methods({
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
            position: null,
            randomIndex: Math.floor(Math.random() * 100000000) + 1,  
        }, 
        function(err,thoughtInserted){
                thoughtId = thoughtInserted
        });
        collect();
        return thoughtId
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
        // return this.query('/me/feed?limit=5');
        result = []
        offset = 0;
        console.log(offset.toString());
        query = this.query('/me/feed?offset=' + offset.toString());
        numTimes = 0;
        while (query && numTimes < 5){
            result = result.concat(query["data"]);
            offset += 25;
            query = this.query('/me/feed?offset=' + offset.toString());
            numTimes += 1;
        }
        return result;
}
