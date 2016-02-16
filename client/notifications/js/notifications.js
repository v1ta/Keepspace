Template.notifications.helpers({
	notifications: function(){
        
        // console.log("all notifications");
        // console.log(notifications);
        result = JSON.parse(localStorage.getItem("notifications"));
		var ready = Meteor.subscribe('Notifications').ready();

        return{
            data: result,
            ready: ready
        };
    },
    numNotifications: function(){
        var ready = Session.get("loadedNotifications");
        return{
            data: Session.get("numUnread"),
            ready: ready
        }
    }
});

getTimeString = function(diffHours){
	var timeString;
	if (diffHours < 1){
        diffHours = diffHours * 60;
        var numMinutes = Math.floor(diffHours);
        if (numMinutes == 1){
            timeString = numMinutes.toString() + " min ago";
        }
        else{
            timeString = numMinutes.toString() + " mins ago";
        }
    }
    else if (diffHours > 24){
        diffHours = diffHours / 24;
        var numDays = Math.floor(diffHours);
        if (numDays == 1){
            timeString = numDays.toString() + " day ago";
        }
        else{
            timeString = numDays.toString() + " days ago";
        }
    }
    else{
        var numHours = Math.floor(diffHours);
        if (numHours == 1){
            timeString = numHours.toString() + " hr ago";
        }
        else{
            timeString = numHours.toString() + " hrs ago";
        }
    }
    return timeString;
}

Template.notifications.events({
	'click [data-action=read]': function() {
		Meteor.call("readNotification", this._id);
    },
});



