Router.route("mainPage", {
  path:"/",
  onBeforeAction: function(){
    if (!Meteor.user()){
      Session.set('c_login', false);
      this.redirect('splash');
    }
    else{
      this.next();
    }
  },
  waitOn: function() {
    return [Meteor.subscribe("thoughts"), Meteor.subscribe('friendRequests'), Meteor.subscribe('friends'), Meteor.subscribe('Notifications')];
  },
  action: function() {
    this.layout("header");
    this.render("mainPage");
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
Router.route("calendar", function(){
  this.layout("header");
  this.render("calendar");
});

Router.route('/user/:_id', function () {
    this.render('user', {data: this.params._id});
});

//splash page and accoiated routing
Router.route('splash', function() { 
  this.layout("splashBanner");
  this.render('carousel');
});
Router.route('about', function() {
  this.layout("splashBanner");
  this.render('aboutPage');
});
Router.route('team', function() {
  this.layout("splashBanner");
  this.render('teamPage');
});
Router.route('loginPage', function() {
  this.layout("splashBanner");
  // this.render('signupPage');
  this.render("loginPage");
});
Router.route('signup', {
  onBeforeAction: function(){
    if (Meteor.user()){
      this.redirect('mainPage');
    }
    else{
      this.next();
    }
  },
  action: function() {
    this.layout("splashBanner");
    this.render('signupPage');
  }
});

Router.route('verifyEmail', {
    template: 'verifyemail',
    controller: 'AccountController',
    path: '/verify-email/:token',
    action: 'verifyEmail'
});

Router.route('verified', {
    path: '/verified',
    template: 'verified'
});

Router.route('checkemail', {
    path: '/checkemail',
    template: 'checkemail'
});

Router.route('changeEmail', {
    path: '/changeEmail',
    template: 'changeEmail'
});

Router.route('/users/:username', {
  name: 'userPage',
  waitOn: function() {
    Meteor.subscribe('friendRequest');
  },
  data: function() {
    return Meteor.users.findOne({username: this.params.username })
  }
});

 


AccountController = RouteController.extend({
    verifyEmail: function () {
        Accounts.verifyEmail(this.params.token, function () {
            Router.go('/verified');
            setTimeout(function(){
              Router.go('/splash');
            },2000);
        });
    }
});

