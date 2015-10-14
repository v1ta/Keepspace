Template.mainPage.events({
	'click .fa-caret-down, click .fa-caret-up': function(event) {
        $("#worldButtons").slideToggle('fast');
        $(event.target).toggleClass("fa-caret-down fa-caret-up");
    }
});

Template.myFeed.helpers({
    thoughts: function () {
        // Show all thoughts
        var thoughts = Thoughts.find({userId:Meteor.userId()}, {sort: {createdAt: -1}});
        // console.log(thoughts.fetch());
        // console.log(Meteor.user().username);
        return thoughts
    }
});

Template.worldFeed.helpers({
    worldPosts: function () {
        // Show all thoughts
        var thoughts = Thoughts.find({userId:{$ne: Meteor.userId()}}, {sort: {createdAt: -1}});
        // var thoughts = Thoughts.find({userId:Meteor.userId()}, {sort: {createdAt: -1}});
        console.log(thoughts.fetch());
        // console.log(Meteor.user().username);
        return thoughts
    }
});

Template.worldFeed.events({
    "click .addToCollection": function(){
        Meteor.call("addToMyCollection", this._id);
    }
});

Template.thought.events({
    "click .delete": function (event) {
        Meteor.call("deleteThought", this._id);
    },
    "click .toggle-private": function (event) {
        Meteor.call("setPrivate", this._id, ! this.private);
    },
});

Template.thought.helpers({
    isuserId: function (event) {
        return this.userId === Meteor.userId();
    }
});