Meteor.methods({
	clearNotifications: function(userId){
        Notifications.remove({userId:userId});
    },
    seeNotifications: function(userId){
        var things = Notifications.find({userId:userId});
        Notifications.update({userId:userId}, {$set:{seen:true}}, {multi:true});
    },
    readNotification: function(notificationId){
        Notifications.update({_id:notificationId}, {$set:{read:true}});
        // console.log("read");
    }
});

Thoughts.after.update(function(userId, doc){
    var index = doc.collectedBy.length
    console.log(doc.collectedBy)
    if(index > 0) {
        //this isn't 100% fullproof but the chance of it making a notfication for a non collected thought are slim
        if(userId === doc.collectedBy[index-1]){ 
            Notifications.insert({userId:doc.userId, friendId:doc.collectedBy[index-1], type:"collectThought",createdAt: new Date(), 
                seen:false, read:false});
        }
    }
    else return;
});
/*
Notifications.after.find(function(userId, doc){
    Notifications.update({_id:doc._id}, {$set: {seen:true}});
});
*/