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
      this.redirect('login');
    } else {
      this.next();
    }
  }
})
Router.route("calendar")

Router.route('/user/:_id', function () {

    this.render('user', {data: this.params._id});
});

Router.route('login', function() { 
  this.layout('loginPage');
  this.render('carousel');
});
Router.route('whatwedo', function() {
  this.layout('loginPage');
  this.render('whatwedo');
});
Router.route('blog', function() {
  this.layout('loginPage');
  this.render('blog');
});
