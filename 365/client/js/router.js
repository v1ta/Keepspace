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
      this.next();
    }
  }
})
Router.route("mainPage", function(){
  this.layout("header");
  this.render("main");
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


AccountController = RouteController.extend({
    verifyEmail: function () {
        Accounts.verifyEmail(this.params.token, function () {
            Router.go('/verified');
        });
    }
});

