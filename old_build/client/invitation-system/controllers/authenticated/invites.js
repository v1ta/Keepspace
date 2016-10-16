Template.invites.events({
    'click #homeLogo': function (event) {
        event.preventDefault();
        Router.go("logout");
    }
});

