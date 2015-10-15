Template.header.onRendered(function(event) {
	Session.set('showProfile', false);

	$(document).mouseup(function (e){
        if(!$("#profile").is(e.target) // if the target of the click isn't the container...
            && $("#profile").has(e.target).length === 0) // ... nor a descendant of the container
        {
            Session.set('showProfile', false);
        }
    });
});

Template.header.helpers({
    showProfile: function() {
        return Session.get('showProfile');
    },
});

Template.profile.helpers({
    username: function() {
        return Session.get('showProfile').username;
    },
    picture: function() {
        var picture = Session.get('showProfile').profile.picture;
        var customAvatar = Avatars.findOne({ _id: picture });
        if (customAvatar) { 
            return customAvatar.url();
        } else {
            return picture;
        }
    },
    joined: function() {
        return $.format.date(Session.get('showProfile').createdAt, 'M/d/yyyy');
    },
    collects: function(event) {
        return Session.get('showProfile').profile.collects;
    },
    notifications: function(){
        var notifications = Notifications.find().fetch();
        result = [];
        notifications.forEach(function (notification) {    
            console.log(notification);     
            var user = Meteor.users.findOne({_id:notification.friendId});
            var element = {};

            if (notification.type == "acceptRequest"){
                element.notification = user.username + " accepted your friend request!";
            }
            else{
                element.notification = user.username + ' collected your thought!';
            }
            var date = new Date();
            var createdAt = new Date(notification.createdAt);
            var diffHours = Math.abs((date - createdAt) / 36e5);
            var timeString;
            if (diffHours < 1){
                diffHours = diffHours * 60;
                var numMinutes = Math.floor(diffHours);
                if (numMinutes == 1){
                    timeString = numMinutes.toString() + " min";
                }
                else{
                    timeString = numMinutes.toString() + " mins";
                }
            }
            else if (diffHours > 24){
                diffHours = diffHours / 24;
                var numDays = Math.floor(diffHours);
                if (numDays == 1){
                    timeString = numDays.toString() + " day";
                }
                else{
                    timeString = numDays.toString() + " days";
                }
            }
            else{
                var numHours = Math.floor(diffHours);
                if (numHours == 1){
                    timeString = numHours.toString() + " hr";
                }
                else{
                    timeString = numHours.toString() + " hrs";
                }
            }

            element.timeString = timeString;
            element.username = user.username;
            element["type"] = notification.type;
            result.push(element);
            // if (notification.type == "acceptRequest")
            //     sAlert.success(user.username + ' accepted your friend request!', {position: 'bottom'});
            // else
            //     sAlert.success(user.username + ' collected your thought!', {position: 'bottom'});
        });
        console.log(result);
        console.log(result[0]);
        return result;
    }
});

Template.profile.events({
    'change #new-picture': function(event, template) {
        FS.Utility.eachFile(event, function(file) {
          Avatars.insert(file, function (err, fileObj) {
            // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
            if (err) {
                console.log(err);
            } else {
                $('#upload-picture').modal('hide');
                $('#change-picture').hide();
                var avatarUrl = {
                    'profile.picture' : fileObj._id
                }
                Meteor.users.update(Meteor.userId(), {$set: avatarUrl});
                Session.set('showProfile', Meteor.user());
            }
          });
        });
    },

})