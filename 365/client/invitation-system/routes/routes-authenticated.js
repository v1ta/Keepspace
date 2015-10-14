// will moves these once it's fully functional
  Router.route('dashboard', {
    path: '/dashboard',
    template: 'dashboard',
    onBeforeAction: function() {
      Session.set('currentRoute', 'dashboard');
      return this.next();
    }
  });

  Router.route('invites', {
    path: '/invites',
    template: 'invites',
    waitOn: function() {
      return Meteor.subscribe('/invites');
    },
    onBeforeAction: function() {
      Session.set('currentRoute', 'invites');
      return this.next();
    }
  });

