// Router.route('/', function () {
//   this.render('main');
// });

// Router.route('/signin', function () {
//   this.render('sign');
// });

// Router.route('/items/:_id', function () {
//   var item = Items.findOne({_id: this.params._id});
//   this.render('ShowItem', {data: item});
// });

// Router.route('/files/:filename', function () {
//   this.response.end('hi from the server\n');
// }, {where: 'server'});

// Router.route('/restful', {where: 'server'})
//   .get(function () {
//     this.response.end('get request\n');
//   })
//   .post(function () {
//     this.response.end('post request\n');
//   });


// Always route to splash page if not logged in
/*
Router.onBeforeAction(function() {
	if (! Meteor.userId()) {
		this.render('splash');
	} else {
    if (Meteor.loggingIn()) {
      this.render('loggingIn');
    } else {
  		this.next();
    }
	}
});
*/

Router.route("main",{
  path:"/",
  onBeforeAction: function() {
    if (! Meteor.userId() ) {
      Session.set('c_login', false);
      this.redirect('splash');
    } else {
      this.redirect("mainPage");
    }
  }
})

Router.route("mainPage", {
  onBeforeAction: function(){
    if (!Meteor.user()){
      this.redirect('splash');
    }
    else{
      this.next();
    }
  },
  waitOn: function() {
    return [Meteor.subscribe("thoughts"), Meteor.subscribe('friendRequests'), Meteor.subscribe('friends')];
  },
  action: function() {
    this.layout("header");
    this.render("main");
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
            setInterval(function(){
              Router.go('/splash');
            },2000);
        });
    }
});

