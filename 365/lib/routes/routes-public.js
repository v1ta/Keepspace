Router.route('splash', {
  path:'/',
  onBeforeAction: function() {
    Session.set('currentRoute', 'splashBanner');
    return this.next();
  },
  action: function(){
    this.layout('splashBanner');
    this.render('carousel');
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

Router.route("mainAbout", function(){
  this.layout("header");
  this.render("aboutPage");
});

Router.route("mainTeam", function(){
  this.layout("header");
  this.render("teamPage");
});

Router.route('about', {
  onBeforeAction: function() {
    Session.set('currentRoute', 'about');
    return this.next();
  },
  action: function(){
    this.layout("splashBanner");
    this.render('aboutPage');
  }
});