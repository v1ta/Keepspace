// will moves these once it's fully functional
Router.route('index', {
  path: '/index',
  template: 'index',
  onBeforeAction: function() {
    Session.set('currentRoute', 'index');
    return this.next();
  }
});

Router.route('signup2', {
  path: '/signup2',
  template: 'signup2',
  onBeforeAction: function() {
    Session.set('currentRoute', 'signup2');
    Session.set('betaToken', '');
    return this.next();
  }
});

Router.route('signup2/:token', {
  path: '/signup/:token',
  template: 'signup',
  onBeforeAction: function() {
    Session.set('currentRoute', 'signup2');
    Session.set('betaToken', this.params.token);
    return this.next();
  }
});

Router.route('login2', {
  path: '/login2',
  template: 'login2',
  onBeforeAction: function() {
    Session.set('currentRoute', 'login2');
    return this.next();
  }
});

Router.route('recover-password', {
  path: '/recover-password',
  template: 'recoverPassword',
  onBeforeAction: function() {
    Session.set('currentRoute', 'recover-password');
    return this.next();
  }
});

Router.route('reset-password', {
  path: '/reset-password/:token',
  template: 'resetPassword',
  onBeforeAction: function() {
    Session.set('currentRoute', 'reset-password');
    Session.set('resetPasswordToken', this.params.token);
    return this.next();
  }
});
