Template.invites.events({
    'click #homeLogo': function (event) {
        event.preventDefault();
        Meteor.logout(logoutFunction);
        Router.go("splash");
    }
});

