Router.route('splash', {
  path:'/splash',
  onBeforeAction: function() {
    Session.set('currentRoute', 'splash');
    this.next();
  },
  waitOn: function() {
     return Meteor.subscribe("splashThoughts");
  },
  action: function(){
    this.layout('splashBanner');
    this.render('loading');
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

Router.route('logout', function(){
  Meteor.logout(function(err) {
    if (err) console.log('Error loggin out!');
    if (Session.get("isTestAcct") == true) {
      Meteor.loginWithPassword({email: "admin@thekeepspace.com"},"rashdoggystyle", function(err){
        if (!err) {
          Session.set("isTestAcct", false);
          Router.go("invites");
        } else {
          console.log(err);
          Router.go("/");
        }
      });
    } else {
      Router.go("/");
    }
  });
  this.render("logout");
});