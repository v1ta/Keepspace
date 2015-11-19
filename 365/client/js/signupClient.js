Template.verifyemail.rendered = function() {
    return $('#verify').validate({
        rules: {
            emailAddress: {
                email: true,
                required: true
            }
        },
        messages: {
            emailAddress: {
                email: "Please use a valid email address.",
                required: "An email address is required to get your invite."
            }
        },
        submitHandler: function () {
            var invitee;
            invitee = {
                email: $('[name="emailAddress"]').val().toLowerCase(),
                invited: false,
                requested: (new Date()).getTime()
            };
            return Meteor.call('validateEmailAddress', invitee.email, function (error, response) {
                if (error) {
                    return alert(error.reason);
                } else {
                    if (response.error) {
                        return alert(response.error);
                    } else {
                        return Meteor.call('addToInvitesList', invitee, function (error, response) {
                            if (error) {
                                sAlert.error(error.reason, {effect: 'genie', position: 'top', offset: '91px'});
                            } else {
                                sAlert.info("Invite requested. We'll be in touch soon. Thanks for your interest in Keepspace!", {
                                    effect: 'genie',
                                    position: 'top',
                                    offset: '91px'
                                });
                            }
                        });
                    }
                }
            });
        }
    });
}

Template.verifyemail.events({
    'submit form': function (event) {
        event.preventDefault();
    },
    'click #verifyButton': function (event){
        event.preventDefault();
        $('#verify').submit();
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
                    localStorage.setItem("justLoggedIn", "true");
                    resetAllFeeds();
                    Router.go("mainPage");
                  // $("#changePassword").hide();
                }
                else{
                  console.log(err);
                }
            }
        )},
    'click #createButton': function(event) {
        var userName = $("#username").val();
        var DOB = $("#dateOfBirth").val();
        var userEmail = $("#signupEmail").val();
        var passwordVar = $("#password").val();
        var repeat = $("#passwordAgain").val();
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
                        localStorage.setItem("justLoggedIn", "true");
                        resetAllFeeds();
                        Router.go("mainPage");
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
    'click .backButton': function(){
        $("#firstSignPage").show();
        $("#nextLoginButton").show();
        $("#secondSignPage").hide();
        $(".backButton").hide();
        $("#splashTitle").css("margin-right", "0px");
    },
    
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
customAlert = function(title, detail, alertID){
	$(".alertTextTitle").html(title);
	$(".alertTextDetail").html(detail);
	$(alertID).show();
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

function betaSignup(){
	var email = $("#betaEmail").val();
	var valid = validateEmail(email);
	if (!valid){
		console.log(email);
		alert("Please enter a valid email address");
	}
	else{
		var detail = "<span>Thank you.</span> <span>Now get ready to make every day count.</span>";
		customAlert("You've signed up for beta.", detail, "#betaDiv");
		Meteor.call("addBetaEmail", email);
	}
}