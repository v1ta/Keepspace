Template.notifications.helpers({
	notifications: function(){
        
        console.log("all notifications");
        console.log(notifications);
        result = [];
		var ready = Meteor.subscribe('Notifications').ready();
        var notifications = Notifications.find().fetch();
        


        notifications.forEach(function (notification) {  
        	console.log("single");  
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
            var timeString = getTimeString(diffHours);
            

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
        return{
            data: result,
            ready: ready
        };
    }
});

function getTimeString(diffHours){
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
    return timeString;
}