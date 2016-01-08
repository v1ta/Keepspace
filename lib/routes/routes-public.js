Router.route('splash', {
  path:'/splash',
  onBeforeAction: function() {
    Session.set('currentRoute', 'splashBanner');
    return this.next();
  },
  action: function(){
    this.layout('splashBanner');
    this.render('carousel');
  }

});

Router.route('signup', {
  path: '/signup',
  template: 'signup',
  onBeforeAction: function() {
    Session.set('currentRoute', 'signup');
    Session.set('betaToken', '');
    return this.next();
  }
});

Router.route('signup/:token', {
  path: '/signup/:token',
  template: 'signup',
  onBeforeAction: function() {
    Session.set('currentRoute', 'signup');
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