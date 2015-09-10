Accounts.onLogin(function(){
	Router.go("mainPage");
});


Template.login.events({
	'submit form': function(event) {
		event.preventDefault();
		if ($("#passwordAgain").is(":visible"))
		{
			var emailVar = event.target.loginEmail.value;
			var passwordVar = event.target.loginPassword.value;
			var repeat = event.target.loginPasswordAgain.value;
			if (passwordVar == repeat){
				Accounts.createUser({
				    username: emailVar,
				    password: passwordVar
				});
			}
			else{
			//passwords do not match 
			}
		}
		else{
			var emailVar = event.target.loginEmail.value;
			var passwordVar = event.target.loginPassword.value;
			Meteor.loginWithPassword(emailVar, passwordVar, function(err){
				if (!err){
					Session.set("isFB", false);
				  // $("#changePassword").show();
				}
			});
		}        
	},
	'click #createAccount': function(){
	if ($("#passwordAgain").is(":visible"))
	{
		$("#passwordAgain").hide();
		$("#createAccount").text("Create Account");
		$("#signIn").val("Sign In");
	}
	else{
		$("#passwordAgain").show();
		$("#createAccount").text("Cancel");
		$("#signIn").val("Create");
	}
}
});

Template.signupPage.events({
	'click .backButton': function(){
		$("#firstSignPage").show();
		$("#nextLoginButton").show();
		$("#secondSignPage").hide();
		$(".backButton").hide();
		$("#splashTitle").css("margin-right", "0px");
	}
});

Template.splashBanner.events({
	'click #loginLink': function(){
		Router.go("loginPage");
	},
	'click #aboutLink': function() { Router.go('about'); },
  	'click #teamLink': function() { Router.go('team'); },
  	'click #splashBannerLogo': function(){ Router.go('splash');}
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

Template.verifyemail.events({
  'click #verify': function (e) {
    e.preventDefault(); // prevent refreshing the page

    var email = $('#headeremail').val(),
    //password = makeTempPassword(); // generate temporary password 
    password = "password";
    email = trimInput(email);

    if (validateEmail(email)){ 

      Accounts.createUser({email: email, password : password}, function(err){
        if (err) {
          // Inform the user that account creation failed
          	alert("We weren't able to register your email :/")
          if(err.reason === "Email already exists."){
          	alert("The email is already in use")
          }
        } else {
          var userId = Meteor.userId();
          Meteor.call('serverVerifyEmail', email, userId, function(){
            Router.go('/checkemail');
          });   
        }

      });   
    }
  }
});

Template.loginPage.events({
	'click #facebookButton': function(){
	  	Meteor.loginWithFacebook(
	  		{requestPermissions: ['email', 'user_friends', 'user_location', 'user_status',
				'user_posts','publish_actions']}, 
			function(err){
			    if (!err){
			      Session.set("isFB", true);
            resetAllFeeds();
			      // $("#changePassword").hide();
			    }
			    else{
			      console.log(err);
			    }
			}
		)
	},
	'submit form': function(){
		event.preventDefault();
		var emailVar = event.target.email.value;
		var passwordVar = event.target.password.value;
		Meteor.loginWithPassword(emailVar, passwordVar, function(err){
			if (!err){
				Session.set("isFB", false);
        resetAllFeeds();
			}
			else{
				alert(err);
			}
		});
	}
});

//custom login/register functionas
Template.signupPage.events({
	//login with facebook
	'click #login-buttons-facebook': function(){
	  	Meteor.loginWithFacebook(
	  		{requestPermissions: ['email', 'user_friends', 'user_location', 'user_status',
				'user_posts','publish_actions']}, 
			function(err){
			    if (!err){
			      Session.set("isFB", true);
            resetAllFeeds();
			      // $("#changePassword").hide();
			    }
			    else{
			      console.log(err);
			    }
			}
		)},
	'submit form': function(event) {
		event.preventDefault();
		console.log("submit");
		var userName = event.target.userName.value;
		var userEmail = event.target.userEmail.value;
		var DOB = event.target.dateOfBirth.value;
		var passwordVar = event.target.userPassword.value;
		var repeat = event.target.userPasswordAgain.value;

		var emailValidate = validateEmail(userEmail);
		var validate = true;
		if (passwordVar != repeat){
			//passwords don't match
			alert("Passwords don't match!");
			validate = false;
		}
		else if (!emailValidate){
			alert("Please enter a valid email.");
			validate = false;
		}
		else{
			Accounts.createUser(
				{
					username: userName,
					email: userEmail,
					password: passwordVar,
					profile: {
						dateOfBirth: DOB
					}
				}, 
				function(err){
					if (err){
						alert(err);
					}
					else{
            resetAllFeeds();
					}
				}
			);
		}   
	},
	'click #nextLoginButton': function(){
		var checkDate = isValidDate($("#dateOfBirth").val());
		var name = $("#username").val();
		if (!name && checkDate){
			alert("Please enter your name!");
		}
		else if (checkDate && name){
			$("#firstSignPage").hide();
			$("#nextLoginButton").hide();
			$("#secondSignPage").show();
			$(".backButton").show();
			$("#splashTitle").css("margin-right", "76px");
		}
	},
	
});

Template.splashBanner.onRendered(function(){
	$(".alertDiv").click(closeAlert);
	$(".closeAlert").click(closeAlert);
})
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

Template.teamPage.onRendered(function(){
	$(".bioDiv").each(function(index, element){
		console.log(index);
		console.log($(this).height());
	});
});

Template.aboutPage.onRendered(function(){
// (function(){

//   var parallax = document.querySelectorAll(".parallax"),
//       speed = 0.3;

//   window.onscroll = function(){
//     [].slice.call(parallax).forEach(function(el,i){

//       var windowYOffset = window.pageYOffset,
//           elBackgrounPos = "50% " + (windowYOffset * speed) + "px";

//       el.style.backgroundPosition = elBackgrounPos;

//     });
//   };

// })();
	$('.parallax-window').parallax(
		{
			imageSrc: "images/keepspace_seamlessbg.png",
			bleed:0,
			speed:0.4,
			zIndex:0
		}
	);
});

// Validates that the input string is a valid date formatted as "mm/dd/yyyy"
function isValidDate(dateString)
{
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)){
    	alert("Please enter a valid date of birth");
        return false;
    }

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    var now = new Date();
    var entered = new Date(year, month - 1, day);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12){
    	alert("Please enter a valid date of birth");
        return false;
    }
    // Check the range of the day
    else if(!(day > 0 && day <= monthLength[month - 1])) {
    	alert("Please enter a valid date of birth");
        return false;
    }
    //check if the day has already happened
    else if (entered > now){
    	alert("Please enter a valid date of birth");
    	return false;
    }
    else{
    	return true;
    }
};

show_signup_fields = function() {
  if ($("#passwordAgain").is(":visible"))
  {
    $("#passwordAgain").hide();
    $("#createAccount").text("Create Account");
    $("#signIn").val("Sign In");
  }
  else{
    $("#passwordAgain").show();
    $("#createAccount").text("Cancel");
    $("#signIn").val("Create");
  }
}
closeAlert = function(){
	$(".alertTextTitle").empty();
	$(".alertTextDetail").empty();
	$(".alertDiv").hide();
}
customAlert = function(title, detail){
	$(".alertTextTitle").html(title);
	$(".alertTextDetail").html(detail);
	$(".alertDiv").show();
}

var trimInput = function(val) {
  return val.replace(/^\s*|\s*$/g, "");
};

function makeTempPassword() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

Template.login.events({
	//login function
	'submit form': function(event) {
		event.preventDefault();
		if ($("#passwordAgain").is(":visible"))
		{
			var emailVar = event.target.loginEmail.value;
			var passwordVar = event.target.loginPassword.value;
			var repeat = event.target.loginPasswordAgain.value;
			if (passwordVar == repeat){
				Accounts.createUser({
				    username: emailVar,
				    password: passwordVar
				});
			}
			else{
			//passwords do not match 
			}
		}
		else{
			var emailVar = event.target.loginEmail.value;
			var passwordVar = event.target.loginPassword.value;
			Meteor.loginWithPassword(emailVar, passwordVar, function(err){
				if (!err){
					Session.set("isFB", false);
				  // $("#changePassword").show();
				}
			});
		}        
	},
	//login with facebook
	'click #login-buttons-facebook': function(){
	  	Meteor.loginWithFacebook(
	  		{requestPermissions: ['email', 'user_friends', 'user_location', 'user_status',
				'user_posts','publish_actions']}, 
			function(err){
			    if (!err){
			      Session.set("isFB", true);
			      // $("#changePassword").hide();
			    }
			    else{
			      console.log(err);
			    }
			}
		)},
	  //  if you hit create account button
	'click #createAccount': function(){
		if ($("#passwordAgain").is(":visible"))
		{
			$("#passwordAgain").hide();
			$("#createAccount").text("Create Account");
			$("#signIn").val("Sign In");
		}
		else{
			$("#passwordAgain").show();
			$("#createAccount").text("Cancel");
			$("#signIn").val("Create");
		}
	}
});
