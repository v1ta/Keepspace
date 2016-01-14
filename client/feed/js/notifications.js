var count = Counts.get('Notifications-Counter');
Session.set('count', count);

Tracker.autorun(function () {
    Session.get('count');
    getNotifications();
});

Meteor.startup(function () {

    sAlert.config({
        effect: 'flip',
        position: 'top-left',
        timeout: 2500,
        html: false,
        onRouteClose: true,
        stack: true,
        offset: 0
    });

});

function getNotifications() {
    if (Counts.get('Notifications-Counter') > 0) {
        var notfications = Notifications.find({userId: Meteor.userId(),seen: false}).fetch();
        notfications.forEach(function (notification) {
            var user = Meteor.users.findOne({_id: notification.friendId});
            console.log(Meteor.userId());
            console.log(notification);
            if (notification.type == "acceptRequest") {
                sAlert.success(user.username + ' accepted your friend request!', {position: 'bottom'});
            } else if (notification.friendId != Meteor.userId()) {
                sAlert.success(user.username + ' collected your thought!', {position: 'bottom'});
            }
        });
        Meteor.call("seeNotifications", Meteor.userId());
    }
}