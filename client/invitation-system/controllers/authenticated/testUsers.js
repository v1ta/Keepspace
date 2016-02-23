/**
 * Created by Joseph on 2/22/16.
 */
Session.setDefault("isTestAcct",false);

Template.testUsers.events({
    'click .test-user-button' : function() {
        Meteor.call('createTestUsers');
    },
    'click .test-user-login' : function(ui) {
        Meteor.loginWithPassword({"id": ui.currentTarget.id}, "blacksheep", function(err){
            if (!err){
                Session.set("isFB", false);
                Session.set("isTestAcct", true);
                localStorage.setItem("justLoggedIn", true);
                Router.go("home");
            }
            else{
                alert(err);
            }
        });
    },
    'click .test-user-delete' : function(ui) {
        Meteor.call('deleteTestUser',ui.currentTarget.id);
    }
});

Template.testUsers.helpers({

    'testUsers' : function () {
        var getTestUsers;
        getTestUsers = Meteor.users.find({
            'profile.testUser': true
        }, {
            fields: {
                "_id": 1,
                "profile.testUser": 1
            }
        }).fetch();
        return getTestUsers.length > 0;
    },
    'testUser' : function () {
        return Meteor.users.find({
            'profile.testUser' : true
        }, {
            sort: {
                dateInvited: -1
            }
        }, {
            fields: {
                "_id": 1,
                "profile.name": 1,
                "profile.collects": 1,
                "profile.lastShared.date": 1,
                "createdAt": 1,
                "testUser": 1,
                "accountCreated": 1
            }
        });
    }
});