function getFriendList(){
    return Meteor.friends.find({userId: this.userId}, {friendId:1,userId:0,_id:0}).fetch();
}

Meteor.publish("friends", function (options) {
    if(!this.userId){
        return this.ready();
    }
    options = options || {};
    options = _.pick(options, "limit", "skip", "sort");
    Meteor.publishWithRelations({
        handle: this,
        collection: Meteor.friends,
        filter: {userId:this.userId, friendId:{$ne:this.userId}},
        options:options,
        mappings: [{
            key: 'friendId',
            collection: Meteor.users,
            options:{fields:{username:true, avatarId:true, status:true}}
        }]
    });
});

Meteor.publish('friendRequests', function(options){
    if(!this.userId){
        return this.ready();
    }
    options = options || {};
    options = _.pick(options, "limit", "skip", "sort");
    Meteor.publishWithRelations({
        handle: this,
        collection: Meteor.requests,
        filter: {userId:this.userId, denied:{$exists:false}, ignored:{$exists:false}},
        options:options,
        mappings: [{
            key: 'requesterId',
            collection: Meteor.users,
            options:{fields:{username:true, avatarId:true}}
        }]
    });

});

Meteor.publish('ignoredFriendRequests', function(options){
    if(!this.userId){
        return this.ready();
    }
    options = options || {};
    options = _.pick(options, "limit", "skip", "sort");
    Meteor.publishWithRelations({
        handle: this,
        collection: Meteor.requests,
        filter: {userId:this.userId, denied:{$exists:false}, ignored:{$exists:true}},
        options:options,
        mappings: [{
            key: 'requesterId',
            collection: Meteor.users,
            options:{fields:{username:true, avatarId:true}}
        }]
    });

});

Meteor.publish('outgoingFriendRequests', function(options){
    if(!this.userId){
        return this.ready();
    }
    options = options || {};
    options = _.pick(options, "limit", "skip", "sort"); //only allow the limit and skip options
    Meteor.publishWithRelations({
        handle: this,
        collection: Meteor.requests,
        filter: {requesterId:this.userId, denied:{$exists:false}},
        options:options,
        mappings: [{
            key: 'requesterId',
            collection: Meteor.users,
            options:{fields:{username:true, avatarId:true}}
        }]
    });

});