Router.route("home", {
    path:'/',
    onBeforeAction: function(){
        if (!Meteor.user()){
            this.redirect('splash');
            this.next();
        } else {
            Session.set('currentRoute', 'home');
            this.next();
        }
    },
    waitOn: function() {
        return [
            Meteor.subscribe("thoughts"),
            Meteor.subscribe('friendRequests'),
            Meteor.subscribe('friends'),
            Meteor.subscribe('Notifications')
        ];
    },
    action: function() {
        this.layout("header");
        this.render("home");
    }
});

Router.route("calendar", {
    onBeforeAction: function() {
        Session.set('currentRoute', 'home');
        return this.next();
    },
   action: function() {
       this.layout("header");
       this.render("calendar");
   }
});

Router.route('team', {
    onBeforeAction: function() {
        Session.set('currentRoute', 'team');
        return this.next();
    },
    action: function(){
        this.layout("splashBanner");
        this.render('teamPage');
    }
});

Router.route('loginPage', {

    onBeforeAction: function() {
        Session.set('currentRoute', 'loginPage');
        return this.next();
    },
    action: function(){
        this.layout("splashBanner");
        // this.render('signupPage');
        this.render("loginPage");
    }
});

/*
Router.route('signup', {
  onBeforeAction: function(){
    if (Meteor.user()){
      this.redirect('mainPage');
    }
      Session.set('currentRoute', 'signup');
  this.next();
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
*/

Router.route('changeEmail', {
    path: '/changeEmail',
    template: 'changeEmail'
});
/*

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

*/