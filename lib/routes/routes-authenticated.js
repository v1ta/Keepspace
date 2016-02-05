/* Admin only routes */
Router.route('invites', {
    path: '/invites',
    template: 'invites',
    waitOn: function () {
        return Meteor.subscribe('invites');
    },
    onBeforeAction: function () {
        Session.set('currentRoute', 'invites');
        return this.next();
    }
});