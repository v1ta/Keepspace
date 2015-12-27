// Website has loaded
/*
window.onload = function(event){
    //close dropdowns on outside click
    $(document).mouseup(function (event){
        var container = $(".dropdown-menu");
        // if the target of the click isn't the container... nor a descendant of the container
        if (!container.is(event.target) && container.has(event.target).length === 0){
            container.hide();
            $("#changePasswordForm").hide();
            $(".dropButton").show();
        }
        container = $("#main-menu");
        if (!container.is(event.target) && container.has(event.target).length === 0){
            hideMainMenu();
        }
    });
    var configuration = {"location": null};
    if (!configuration){
        getLocation()
    }
    
    // Set countdown timer
    Meteor.setInterval(setTime, 1000);
}

//put in username
Template.mainPage.helpers({
    username: function(event){
        if (Meteor.user()) {
            var username = Meteor.user().username;
            return username.split(" ")[0];
        }
    },
});

Template.mainPage.events({
    'click #btn-user-data': function(event) {
        Meteor.call('getFBUserData', function(err, data) {
            console.log(JSON.stringify(data, undefined, 4));
         });
        Meteor.call('getFBPostData', function(err, data) {
            console.log(JSON.stringify(data, undefined, 4));
            console.log(data["data"]);
            //check whose post it is using
            //data[(post number)][from][name]
            //only want the one's from the user
        });
    },
    'click #btn-import-facebook': function(event){
        Meteor.call('getFBPostData', function(err, data) {
            if (err){
                console.log(err);
            }
            else{
                var posts = data["data"];
                console.log(data);

                // var thoughtId = Meteor.call("addPost", posts[0],function(err, data) {
                //     if (err){
                //         console.log(err);
                //     }
                //     console.log(data)
                // });
                // getLocationThought(thoughtId)
                return false;
            }
        });
    },
    'click .feed-search-icon': function(event) {
        $(event.target.nextElementSibling).animate({width: "toggle"}, 'fast');
    },
    'click .friend-search-icon': function(event) {
        $(event.target.nextElementSibling).animate({width: "toggle"}, 'fast');
    },
    'click .feed-user-icon, click .badge.success': function(e) {
        // $(event.target.nextElementSibling).animate({width: "toggle"}, 'fast');
        e.stopPropagation();
        // $("#friendRequests").show();
        Session.set("showFriendPage", true);
    },
});
    */