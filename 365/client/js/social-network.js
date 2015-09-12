//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
//                                                                      //
// If you are using Chrome, open the Developer Tools and click the gear //
// icon in its lower right corner. In the General Settings panel, turn  //
// on 'Enable source maps'.                                             //
//                                                                      //
// If you are using Firefox 23, go to `about:config` and set the        //
// `devtools.debugger.source-maps-enabled` preference to true.          //
// (The preference should be on by default in Firefox 24; versions      //
// older than 23 do not support source maps.)                           //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var User = Package['socialize:user-model'].User;
var BaseModel = Package['socialize:base-model'].BaseModel;
var Accounts = Package['accounts-base'].Accounts;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;
var SimpleSchema = Package['aldeed:simple-schema'].SimpleSchema;
var MongoObject = Package['aldeed:simple-schema'].MongoObject;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;

/* Package-scope variables */
var Friend, Request, Block, FriendsCollection, RequestsCollection, BlocksCollection;

(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize:friendships/friend-model/common/friend-model.js                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/**                                                                                                                  // 1
 * The Friend Class                                                                                                  // 2
 * @class Friend                                                                                                     // 3
 * @param {Object} document An object representing a Friend ususally a Mongo document                                // 4
 */                                                                                                                  // 5
Friend =  BaseModel.extendAndSetupCollection("friends");                                                             // 6
                                                                                                                     // 7
/**                                                                                                                  // 8
 * Get the User instance for the friend                                                                              // 9
 * @function user                                                                                                    // 10
 * @memberof Friend                                                                                                  // 11
 */                                                                                                                  // 12
Friend.prototype.user = function () {                                                                                // 13
    if(this.friendId){                                                                                               // 14
        return  Meteor.users.findOne(this.friendId);                                                                 // 15
    }                                                                                                                // 16
};                                                                                                                   // 17
                                                                                                                     // 18
FriendsCollection = Friend.collection;                                                                               // 19
                                                                                                                     // 20
//Create the schema for a friend                                                                                     // 21
Friend.appendSchema({                                                                                                // 22
    "userId":{                                                                                                       // 23
        type:String,                                                                                                 // 24
        regEx:SimpleSchema.RegEx.Id,                                                                                 // 25
        autoValue:function () {                                                                                      // 26
            if(this.isInsert){                                                                                       // 27
                return Meteor.userId();                                                                              // 28
            }                                                                                                        // 29
        },                                                                                                           // 30
        denyUpdate:true                                                                                              // 31
    },                                                                                                               // 32
    "friendId":{                                                                                                     // 33
        type:String,                                                                                                 // 34
        regEx:SimpleSchema.RegEx.Id                                                                                  // 35
    },                                                                                                               // 36
    "date":{                                                                                                         // 37
        type:Date,                                                                                                   // 38
        autoValue:function() {                                                                                       // 39
            if(this.isInsert){                                                                                       // 40
                return new Date();                                                                                   // 41
            }                                                                                                        // 42
        },                                                                                                           // 43
        denyUpdate:true                                                                                              // 44
    }                                                                                                                // 45
});                                                                                                                  // 46
                                                                                                                     // 47
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize:friendships/friend-model/common/user-extensions.js                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
User.methods({                                                                                                       // 1
                                                                                                                     // 2
    /**                                                                                                              // 3
     * Retrieve a list of friend connections                                                                         // 4
     * @method friends                                                                                               // 5
     * @param   {Number}        The number of records to limit the result set too                                    // 6
     * @param   {number}        The number of records to skip                                                        // 7
     * @returns {Mongo.Cursor}  A cursor of which returns Friend instances                                           // 8
     */                                                                                                              // 9
    friends:function (limit, skip) {                                                                                 // 10
        var options = {limit:limit, skip:skip, sort:{date:-1}};                                                      // 11
        return FriendsCollection.find({userId:this._id}, options);                                                   // 12
    },                                                                                                               // 13
                                                                                                                     // 14
    /**                                                                                                              // 15
     * Retrieves friend connections as the users they represent                                                      // 16
     * @method friendsAsUsers                                                                                        // 17
     * @param   {Number}       limit     The maximum number or friends to return                                     // 18
     * @param   {Number}       skip      The number of records to skip                                               // 19
     * @returns {Mongo.Cursor} A cursor which returns user instances                                                 // 20
     */                                                                                                              // 21
    friendsAsUsers:function (limit, skip) {                                                                          // 22
        var ids = this.friends(limit, skip).map(function(friend){                                                    // 23
            return friend.friendId;                                                                                  // 24
        });                                                                                                          // 25
                                                                                                                     // 26
        return Meteor.users.find({_id:{$in:ids}});                                                                   // 27
    },                                                                                                               // 28
                                                                                                                     // 29
    /**                                                                                                              // 30
     * Remove the friendship connection between the user and the logged in user                                      // 31
     * @method unfriend                                                                                              // 32
     */                                                                                                              // 33
    unfriend:function () {                                                                                           // 34
        var friend = FriendsCollection.findOne({userId:Meteor.userId(), friendId:this._id});                         // 35
                                                                                                                     // 36
        //if we have a friend record, remove it. FriendsCollection.after.remove will                                 // 37
        //take care of removing reverse friend connection for other user                                             // 38
        friend && friend.remove();                                                                                   // 39
    },                                                                                                               // 40
                                                                                                                     // 41
    /**                                                                                                              // 42
     * Check if the user is friends with another                                                                     // 43
     * @method isFriendsWith                                                                                         // 44
     * @param   {Object}  user The user to check                                                                     // 45
     * @returns {Boolean} Whether the user is friends with the other                                                 // 46
     */                                                                                                              // 47
    isFriendsWith: function (user) {                                                                                 // 48
        var userId = user._id || Meteor.userId();                                                                    // 49
        return !!FriendsCollection.findOne({userId:this._id, friendId:userId});                                      // 50
    }                                                                                                                // 51
                                                                                                                     // 52
});                                                                                                                  // 53
                                                                                                                     // 54
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize:friendships/request-model/common/request-model.js                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/**                                                                                                                  // 1
 * The Request Class                                                                                                 // 2
 * @class Request                                                                                                    // 3
 * @param {Object} document An object representing a request, usually a Mongo document                               // 4
 */                                                                                                                  // 5
Request = BaseModel.extendAndSetupCollection("requests");                                                            // 6
                                                                                                                     // 7
/**                                                                                                                  // 8
 * Get the User instance for the user who made the request                                                           // 9
 * @returns {User} The user who made the request                                                                     // 10
 */                                                                                                                  // 11
Request.prototype.requester = function () {                                                                          // 12
    return Meteor.users.findOne(this.requesterId);                                                                   // 13
};                                                                                                                   // 14
                                                                                                                     // 15
/**                                                                                                                  // 16
 * Get the User instance for the user who is recieving the request                                                   // 17
 * @returns {User} The user who recieved the request                                                                 // 18
 */                                                                                                                  // 19
Request.prototype.user = function () {                                                                               // 20
    return Meteor.users.findOne(this.userId);                                                                        // 21
};                                                                                                                   // 22
                                                                                                                     // 23
/**                                                                                                                  // 24
 * Accept the friend request                                                                                         // 25
 * @method approve                                                                                                   // 26
 */                                                                                                                  // 27
Request.prototype.accept = function () {                                                                             // 28
    new Friend({userId:this.userId, friendId:this.requesterId}).save();                                              // 29
};                                                                                                                   // 30
                                                                                                                     // 31
/**                                                                                                                  // 32
 * Deny the friend request                                                                                           // 33
 * @method deny                                                                                                      // 34
 */                                                                                                                  // 35
Request.prototype.deny = function() {                                                                                // 36
    this.update({$set:{denied:new Date()}});                                                                         // 37
};                                                                                                                   // 38
                                                                                                                     // 39
/**                                                                                                                  // 40
 * Ignore the friend request so that it can be accpted or denied later                                               // 41
 * @method ignore                                                                                                    // 42
 */                                                                                                                  // 43
Request.prototype.ignore = function() {                                                                              // 44
    this.update({$set:{ignored:new Date()}});                                                                        // 45
};                                                                                                                   // 46
                                                                                                                     // 47
/**                                                                                                                  // 48
 * Cancel the friend request                                                                                         // 49
 * @method cancel                                                                                                    // 50
 */                                                                                                                  // 51
Request.prototype.cancel = function () {                                                                             // 52
    this.remove();                                                                                                   // 53
};                                                                                                                   // 54
                                                                                                                     // 55
/**                                                                                                                  // 56
 * Check if the request had been denied                                                                              // 57
 * @returns {Boolean} Whether the request has been denied                                                            // 58
 */                                                                                                                  // 59
Request.prototype.wasRespondedTo = function() {                                                                      // 60
    return !!this.denied || !!this.ignored;                                                                          // 61
};                                                                                                                   // 62
                                                                                                                     // 63
RequestsCollection = Request.collection;                                                                             // 64
                                                                                                                     // 65
//Create the schema for a friend                                                                                     // 66
Request.appendSchema({                                                                                               // 67
    "userId":{                                                                                                       // 68
        type:String,                                                                                                 // 69
        regEx:SimpleSchema.RegEx.Id,                                                                                 // 70
        denyUpdate:true                                                                                              // 71
    },                                                                                                               // 72
    "requesterId":{                                                                                                  // 73
        type:String,                                                                                                 // 74
        regEx:SimpleSchema.RegEx.Id,                                                                                 // 75
        autoValue:function () {                                                                                      // 76
            if(this.isInsert){                                                                                       // 77
                return Meteor.userId();                                                                              // 78
            }                                                                                                        // 79
        },                                                                                                           // 80
        denyUpdate:true                                                                                              // 81
    },                                                                                                               // 82
    "date":{                                                                                                         // 83
        type:Date,                                                                                                   // 84
        autoValue:function() {                                                                                       // 85
            if(this.isInsert){                                                                                       // 86
                return new Date();                                                                                   // 87
            }                                                                                                        // 88
        },                                                                                                           // 89
        denyUpdate:true                                                                                              // 90
    },                                                                                                               // 91
    "denied":{                                                                                                       // 92
        type:Date,                                                                                                   // 93
        optional:true                                                                                                // 94
    },                                                                                                               // 95
    "ignored":{                                                                                                      // 96
        type:Date,                                                                                                   // 97
        optional:true,                                                                                               // 98
    }                                                                                                                // 99
});                                                                                                                  // 100
                                                                                                                     // 101
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize:friendships/request-model/common/user-extensions.js                                            //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
//Configurable number of days to restrict a user from re-requesting a friendship                                     // 1
User.restrictRequestDays = 30;                                                                                       // 2
                                                                                                                     // 3
User.methods({                                                                                                       // 4
    /**                                                                                                              // 5
     * Get the friend requests the user currently has                                                                // 6
     * @param   {Number}       limit     The maximum number of requests to return                                    // 7
     * @param   {Number}       skip      The number of records to skip                                               // 8
     * @param   {String}       sortBy    The key to sort on                                                          // 9
     * @param   {Number}       sortOrder The order in which to sort the result. 1 for ascending, -1 for descending   // 10
     * @returns {Mongo.Cursor} A cursor which returns request instances                                              // 11
     */                                                                                                              // 12
    requests: function (limit, skip) {                                                                               // 13
        var options = {limit:limit, skip:skip};                                                                      // 14
        return RequestsCollection.find({userId:this._id, denied:{$exists:false}, ignored:{$exists:false}}, options); // 15
    },                                                                                                               // 16
                                                                                                                     // 17
    /**                                                                                                              // 18
     * Retrieve the number of pending friend requests the user has                                                   // 19
     * @method numPendingRequests                                                                                    // 20
     * @returns {Number} The number of pending requests                                                              // 21
     */                                                                                                              // 22
    numRequests: function () {                                                                                       // 23
        return this.requests().count();                                                                              // 24
    },                                                                                                               // 25
                                                                                                                     // 26
    /**                                                                                                              // 27
     * Get the pending requests from this user to other users                                                        // 28
     * @param   {Number}       limit     The maximum number of requests to return                                    // 29
     * @param   {Number}       skip      The number of records to skip                                               // 30
     * @param   {String}       sortBy    The key to sort on                                                          // 31
     * @param   {Number}       sortOrder The order in which to sort the result. 1 for ascending, -1 for descending   // 32
     *                                   @returns {Mongo.Cursor} A cursor which returns request instances            // 33
     */                                                                                                              // 34
    pendingRequests: function (limit, skip) {                                                                        // 35
        var options = {limit:limit, skip:skip};                                                                      // 36
        return RequestsCollection.find({requesterId:this._id, denied:{$exists:false}, ignored:{$exists:false}}, options);
    },                                                                                                               // 38
                                                                                                                     // 39
    /**                                                                                                              // 40
     * Retrieve the number of pending friend requests the user has                                                   // 41
     * @method numPendingRequests                                                                                    // 42
     * @returns {Number} The number of pending requests                                                              // 43
     */                                                                                                              // 44
    numPendingRequests: function () {                                                                                // 45
        return this.pendingRequests().count();                                                                       // 46
    },                                                                                                               // 47
                                                                                                                     // 48
    /**                                                                                                              // 49
     * Check if the user has a pending request from someone                                                          // 50
     * @method hasRequstForm                                                                                         // 51
     * @param   {Object}  user The user to check if there is a request from                                          // 52
     * @returns {Boolean} Whether or not there is a pending request                                                  // 53
     */                                                                                                              // 54
    hasRequestFrom: function (user) {                                                                                // 55
        var request = RequestsCollection.findOne({userId:this._id, requesterId:user._id}, {fields:{_id:true, denied:true}});
                                                                                                                     // 57
        if(request){                                                                                                 // 58
            var minDate =  request.denied && request.denied.getTime() + (3600000 * 24 * User.restrictRequestDays);   // 59
            if(!request.denied || minDate > Date.now()){                                                             // 60
                return true;                                                                                         // 61
            }                                                                                                        // 62
        }                                                                                                            // 63
    },                                                                                                               // 64
                                                                                                                     // 65
    /**                                                                                                              // 66
     * Send a freindship request to a user                                                                           // 67
     * @method requestFriendship                                                                                     // 68
     */                                                                                                              // 69
    requestFriendship: function () {                                                                                 // 70
        //insert the request, simple-schema takes care of default fields and values and allow takes care of permissions
        new Request({userId:this._id}).save();                                                                       // 72
    },                                                                                                               // 73
                                                                                                                     // 74
    /**                                                                                                              // 75
     * Cancel a friendship request sent to the user                                                                  // 76
     * @method cancelFrienshipRequest                                                                                // 77
     */                                                                                                              // 78
    cancelFriendshipRequest: function () {                                                                           // 79
        var request = Meteor.requests.findOne({requesterId:Meteor.userId(), userId:this._id});                       // 80
        request && request.cancel();                                                                                 // 81
    },                                                                                                               // 82
                                                                                                                     // 83
    /**                                                                                                              // 84
     * Accept frienship request from the user                                                                        // 85
     * @method  acceptFriendshipRequest                                                                              // 86
     */                                                                                                              // 87
    acceptFriendshipRequest: function() {                                                                            // 88
        var request = Meteor.requests.findOne({requesterId:this._id, userId:Meteor.userId()});                       // 89
        request && request.accept();                                                                                 // 90
    },                                                                                                               // 91
                                                                                                                     // 92
    /**                                                                                                              // 93
     * Deny friendship request from the user                                                                         // 94
     * @method denyFriendshipRequest                                                                                 // 95
     */                                                                                                              // 96
    denyFriendshipRequest: function() {                                                                              // 97
        var request = Meteor.requests.findOne({requesterId:this._id, userId:Meteor.userId()});                       // 98
        request && request.deny();                                                                                   // 99
    },                                                                                                               // 100
                                                                                                                     // 101
    /**                                                                                                              // 102
     * Ignore friendship request from the user                                                                       // 103
     * @method ignoreFriendshipRequest                                                                               // 104
     */                                                                                                              // 105
    ignoreFriendshipRequest: function() {                                                                            // 106
        var request = Meteor.requests.findOne({requesterId:this._id, userId:Meteor.userId()});                       // 107
        request && request.ignore();                                                                                 // 108
    }                                                                                                                // 109
});                                                                                                                  // 110
                                                                                                                     // 111
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize:friendships/block-model/common/block-model.js                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/**                                                                                                                  // 1
 * The Block Class                                                                                                   // 2
 * @class Block                                                                                                      // 3
 * @param {Object} document An object representing a Block ususally a Mongo document                                 // 4
 */                                                                                                                  // 5
Block = BaseModel.extendAndSetupCollection("blocks");                                                                // 6
                                                                                                                     // 7
BlocksCollection = Block.collection;                                                                                 // 8
                                                                                                                     // 9
Block.methods({                                                                                                      // 10
   isDuplicate: function() {                                                                                         // 11
       return !!BlocksCollection.findOne({userId:this.userId, blockedUserId:this.blockedUserId});                    // 12
   }                                                                                                                 // 13
});                                                                                                                  // 14
                                                                                                                     // 15
//Create the schema for a Block                                                                                      // 16
Block.appendSchema({                                                                                                 // 17
    "userId":{                                                                                                       // 18
        type:String,                                                                                                 // 19
        regEx:SimpleSchema.RegEx.Id,                                                                                 // 20
        autoValue:function () {                                                                                      // 21
            if(this.isInsert){                                                                                       // 22
                return Meteor.userId();                                                                              // 23
            }                                                                                                        // 24
        },                                                                                                           // 25
        denyUpdate:true                                                                                              // 26
    },                                                                                                               // 27
    "blockedUserId":{                                                                                                // 28
        type:String,                                                                                                 // 29
        regEx:SimpleSchema.RegEx.Id                                                                                  // 30
    },                                                                                                               // 31
    "date":{                                                                                                         // 32
        type:Date,                                                                                                   // 33
        autoValue:function() {                                                                                       // 34
            if(this.isInsert){                                                                                       // 35
                return new Date();                                                                                   // 36
            }                                                                                                        // 37
        },                                                                                                           // 38
        denyUpdate:true                                                                                              // 39
    }                                                                                                                // 40
});                                                                                                                  // 41
                                                                                                                     // 42
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/socialize:friendships/block-model/common/user-extensions.js                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
//Array to store additional blocking check functions                                                                 // 1
var blockHooks = [];                                                                                                 // 2
                                                                                                                     // 3
/**                                                                                                                  // 4
 * Register a new function that if returns true signifies that a user is blocked                                     // 5
 * @param {Function} hook A function which returns true if the user should be considered blocked                     // 6
 */                                                                                                                  // 7
User.registerBlockingHook = function(hook) {                                                                         // 8
    if(_.isFunction(hook)){                                                                                          // 9
        //add the hook to the blockHooks array                                                                       // 10
        blockHooks.push(hook);                                                                                       // 11
    }                                                                                                                // 12
};                                                                                                                   // 13
                                                                                                                     // 14
                                                                                                                     // 15
User.methods({                                                                                                       // 16
    /**                                                                                                              // 17
     * Check if the user blocks another by running checks which                                                      // 18
     * have been registered with User.registerBlockingHook()                                                         // 19
     * @method blocksUser                                                                                            // 20
     * @param   {Object}  [user=Meteor.user()] The user instance to check. Defaults to                               // 21
     *                                       Meteor.user()                                                           // 22
     * @returns {Boolean} Whether or not the user is blocked                                                         // 23
     */                                                                                                              // 24
    blocksUser: function (user) {                                                                                    // 25
        var self = this;                                                                                             // 26
        var blocked = false;                                                                                         // 27
        user = user || Meteor.user();                                                                                // 28
                                                                                                                     // 29
        if(!this.isSelf(user) && !this.isFriendsWith(user._id)){                                                     // 30
                                                                                                                     // 31
            _.all(blockHooks, function (hook) {                                                                      // 32
                if(hook.call(self, user)){                                                                           // 33
                    blocked = true;                                                                                  // 34
                    return;                                                                                          // 35
                }                                                                                                    // 36
            });                                                                                                      // 37
        }                                                                                                            // 38
        return blocked;                                                                                              // 39
    },                                                                                                               // 40
                                                                                                                     // 41
    /**                                                                                                              // 42
     * Check if user blocks another by thier _id                                                                     // 43
     * @param   {Object}  user The User instance to check against                                                    // 44
     * @returns {Boolean} Whether the user is blocked or not                                                         // 45
     */                                                                                                              // 46
    blocksUserById: function (user) {                                                                                // 47
        return !!BlocksCollection.findOne({userId:this._id, blockedUserId:user._id});                                // 48
    },                                                                                                               // 49
                                                                                                                     // 50
    /**                                                                                                              // 51
     * Block a user by their _id                                                                                     // 52
     * @method block                                                                                                 // 53
     */                                                                                                              // 54
    block: function () {                                                                                             // 55
        new Block({blockedUserId:this._id}).save();                                                                  // 56
    },                                                                                                               // 57
                                                                                                                     // 58
    /**                                                                                                              // 59
     * Unblock a user that was previously blocked by their _id                                                       // 60
     * @method unblock                                                                                               // 61
     */                                                                                                              // 62
    unblock: function () {                                                                                           // 63
        //find then remove because you must remove records by _id on client                                          // 64
        var block = BlocksCollection.findOne({userId:Meteor.userId(), blockedUserId:this._id});                      // 65
                                                                                                                     // 66
        block && block.remove();                                                                                     // 67
    },                                                                                                               // 68
                                                                                                                     // 69
    /**                                                                                                              // 70
     * Get a list of userIds who are blocking the user                                                               // 71
     * @method blockedByUsers                                                                                        // 72
     */                                                                                                              // 73
    blockedByUserIds: function (limit, skip) {                                                                       // 74
        var options = {limit:limit, skip:skip};                                                                      // 75
        return BlocksCollection.find({blockedUserId:this._id}, options).map(function (block) {                       // 76
            return block.userId;                                                                                     // 77
        });                                                                                                          // 78
    },                                                                                                               // 79
                                                                                                                     // 80
    /**                                                                                                              // 81
     * Get a cursor of User instances who are blocking the user                                                      // 82
     * @param   {Number}       limit The number of records to limit the result set to                                // 83
     * @param   {Number}       skip  The number of records to skip                                                   // 84
     * @returns {Mongo.Cursor} A cursor which when iterated over returns User instances                              // 85
     */                                                                                                              // 86
    blockedByUsers: function (limit, skip) {                                                                         // 87
        var ids = this.blockedByUserIds(limit, skip);                                                                // 88
        return Meteor.users.find({_id:{$in:ids}});                                                                   // 89
    },                                                                                                               // 90
                                                                                                                     // 91
    /**                                                                                                              // 92
     * Get a list of userIds that the user blocks                                                                    // 93
     * @method blockedUsers                                                                                          // 94
     */                                                                                                              // 95
    blockedUserIds: function (limit, skip) {                                                                         // 96
        var options = {limit:limit, skip:skip};                                                                      // 97
        return BlocksCollection.find({userId:this._id}, options).map(function (block) {                              // 98
            return block.blockedUserId;                                                                              // 99
        });                                                                                                          // 100
    },                                                                                                               // 101
                                                                                                                     // 102
    /**                                                                                                              // 103
     * Get a cursor of User instances that the user is blocking                                                      // 104
     * @param   {Number}       limit The number of records to limit the result set to                                // 105
     * @param   {Number}       skip  The number of records to skip                                                   // 106
     * @returns {Mongo.Cursor} A cursor which when iterated over returns User instances                              // 107
     */                                                                                                              // 108
    blockedUsers: function (limit, skip) {                                                                           // 109
        var ids = this.blockedUserIds(limit, skip);                                                                  // 110
        return Meteor.users.find({_id:{$in:ids}})                                                                    // 111
    }                                                                                                                // 112
                                                                                                                     // 113
});                                                                                                                  // 114
                                                                                                                     // 115
//Register a hook to check if the user block another by _id field                                                    // 116
User.registerBlockingHook(function (user) {                                                                          // 117
    return this.blocksUserById(user);                                                                                // 118
});                                                                                                                  // 119
                                                                                                                     // 120
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['socialize:friendships'] = {
  Friend: Friend,
  Request: Request,
  Block: Block
};

})();
