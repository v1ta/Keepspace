Template.splashBanner.events({
	'click #loginLink': function(){
		Router.go("loginPage");
	},
	'click #aboutLink': function() { Router.go('about'); },
	'click #teamLink': function() { Router.go('team'); },
	'click #splashBannerLogo': function(){ Router.go('splash');},
  'click #facebookSignButton': function(){
    Meteor.loginWithFacebook(
      {requestPermissions: ['email', 'user_friends', 'user_location', 'user_status',
      'user_posts','publish_actions']}, 
      function(err){
          if (!err){
          Session.set("isFB", true);
          localStorage.setItem("justLoggedIn", "true");
          resetAllFeeds();
          Router.go("mainPage");
            // $("#changePassword").hide();
          }
          else{
            console.log(err);
          }
      }
    )
  },
  'click #topSlide':function(event){
    $(".signOptions").hide();
    $("#mainSlide").show();
  },
  'click #goSignupButton': function(event){
    event.stopPropagation();
    $("#mainSlide").hide();
    $("#signupOptionsSlide").show();
    $("#signHereOption").show();
  },
  'click .signOptions': function(event){
    event.stopPropagation();
  },

  	/*
  	'click #betaLink': function(){
  		betaSignup();
  	},
  	"submit form": function(){
  		event.preventDefault();
  		betaSignup();
  	}
  	*/
});

Template.splashBanner.onRendered(function(){
	$(".alertDiv").click(closeAlert);
	$(".closeAlert").click(closeAlert);
});
Template.carousel.onRendered(function() {
	$('#carousel').on('slide.bs.carousel', function (event) {
  		if (event.relatedTarget.id == "loginSlide"){
  			$(".right.carousel-control").hide();
  		}
  		else{
  			$(".right.carousel-control").show();
  		}
	})
  	if (Session.get('c_login')) {
    	$('#carousel').carousel(3);
    	$('#carousel').carousel('pause');
  	}
	else
    	$('#carousel').carousel(0);
});


