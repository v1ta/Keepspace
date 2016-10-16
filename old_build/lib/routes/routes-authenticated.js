/* Admin only routes */
Router.route('invites', {
    path: '/invites',
    template: 'invites',
    waitOn: function () {
        return [
            Meteor.subscribe('/invites'),
            Meteor.subscribe('users')
        ];
    },
    onBeforeAction: function () {
        Session.set('currentRoute', 'invites');
        return this.next();
    }
});