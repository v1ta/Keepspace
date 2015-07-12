// This code only runs on the client
if (Meteor.isClient) {


    Meteor.subscribe("thoughts");
    Meteor.subscribe("userdata");

    // Website has loaded
  window.onload = function(){

  //close dropdowns on outside click
  $(document).mouseup(function (e)
  {
      var container = $(".dropdown-menu");

      if (!container.is(e.target) // if the target of the click isn't the container...
          && container.has(e.target).length === 0) // ... nor a descendant of the container
      {
          container.hide();
          $("#changePasswordForm").hide();
          $(".dropButton").show();
      }
  });

  var configuration = {"location": null}

      if (!configuration){
          getLocation()
      }
    setInterval(setTime, 1000);

  }

  Template.feed.helpers({
    thoughts: function () {
      // Show all thoughts
      var thoughts = Thoughts.find({}, {sort: {createdAt: -1}});
      // console.log(thoughts.fetch());
      // console.log(Meteor.user().username);
      return thoughts
    }
  });

  Template.feed.events({
    "submit .new-thought": function (event) {
      event.preventDefault();
      // This function is called when the new thought form is submitted
      var text = event.target.text.value;

      var thoughtId = Meteor.call("addThought", text, null,
        function(err, data) {
            if (err){
                console.log(err);
            } 
            console.log(data)
        });

      // Clear form
      event.target.text.value = "";

      // Prevent default form submit

      return false;
    },
    "click #btn-cancel-post": function(e){
      $("#tempForm").hide();
    }
  });

  Template.thought.events({

    "click .delete": function () {
      Meteor.call("deleteThought", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });

  Template.thought.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  //custom login/register functionas
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
      {
         requestPermissions: ['email', 'user_friends', 'user_location', 'user_status',
        'user_posts']
        
      }, function(err){
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

  //put in username
  Template.main.helpers({
    username: function(){
        var username = Meteor.user().username;
        return username.split(" ")[0];
    },
    posts: function(){
      var thoughts = Thoughts.find({}, {sort: {createdAt: -1}});
       console.log(thoughts.fetch());
       console.log(Meteor.user().username);
       console.log("here");
      return thoughts
    }
  });

  //header functions
  Template.header.events({
        'click #postButton': function(e) {
          $("#tempForm").show();
        },
        'click #calendarButton': function(e) {
         Router.go("calendar");
        },
        'click #homeButton': function(e) {
          Router.go("main");;
        },
        'click #settingsButton': function(event){
          event.preventDefault();
          // console.log($("#settingDropDown").css("display"));
          // $("#settingDropDown").toggle();
          if ($("#settingDropDown").css("display") == "none"){
            $("#settingDropDown").css("display", "inline-block");
          }
          else{
            $("#settingDropDown").css("display", none);
          }
        },
        'click .logout': function(event){
          event.preventDefault();
          Meteor.logout();
        },
        'click #changePassword': function(event){
          event.preventDefault();
          $(".dropButton").toggle();
          $("#changePasswordForm").toggle();
        },
        'submit #changePasswordForm': function(event){
          event.preventDefault();
          var oldPassword = event.target.oldPass.value;
          var newPassword = event.target.newPass.value;
          var newConfirm = event.target.newPassConfirm.value;
          if (Session.get("isFB")){
            alert("You logged in with FB!");
          }
          else if (newPassword == newConfirm){
            Accounts.changePassword(oldPassword, newPassword, function(err){
              if (err){
                alert(err.reason);
              }
              else{
                console.log("success");
              }
            });
          }
          else{
            //TODO Send error to user
            alert("Passwords no not match");
          }
          
        }
  });

  //request facebook data
  Template.main.events({
        'click #btn-user-data': function(e) {
            Meteor.call('getFBUserData', function(err, data) {
                console.log(JSON.stringify(data, undefined, 4));
             });
            Meteor.call('getFBPostData', function(err, data) {
                console.log(JSON.stringify(data, undefined, 4));
                console.log(data["data"]);
                //check whose post it is using
                //data[(post number)][from][name]
                //only want the one's from the user
            });
        },
        'click #btn-import-facebook': function(e){
          Meteor.call('getFBPostData', function(err, data) {
              var posts = data["data"];
              console.log(posts[0]);
              var thoughtId = Meteor.call("addPost", posts[0],
                            function(err, data) {
                                  if (err)
                                    console.log(err);
                                  console.log(data)
                                });
              // getLocationThought(thoughtId)
              return false;
            });
        }
    });

    Template.user.helpers({
        'isUser': function(){
            return this.owner === Meteor.userId()
        },
        'Name' : function() {
            return "Robert"
        }
    })
    // Accounts
    //
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY",
        requestPermissions: {
            facebook: ['email', 'user_friends', 'user_location', 'user_status',
                'user_posts']
        }
    });

    //calendar loading
    Template.calendar.rendered = function() {
      if(!this._rendered) {
        this._rendered = true;
        var date = new Date();
        loadCalendar(date, true);
        var otherDate = getDate(date.getDate() - 1, " 1, ");
        getCalFeed(otherDate);
      }
    }
    Template.calendar.helpers({

    });
    Template.calendar.events({
      'click .datepicker-td': function(e){
        //console.log(e.currentTarget.innerHTML);
        var element = e.currentTarget.childNodes[0];
        var day = element.innerHTML;
        var date = getDate(day - 1, " 1, ");
        setCalText(date, false, true);
        getCalFeed(date);
      },
      'click .datepicker-prev': function(e){
        var date = getDate(-7, " 1, ");
        loadCalendar(date, false);
      },
      'click .datepicker-next': function(e){
        var date = getDate(7, " 28, ");
        loadCalendar(date, false);
      }
    });
}


// Helper Functions
//

//load the calendar
function loadCalendar(date, shouldSelect){
    var tbody = $(".datepicker-body");
    tbody.empty();
    var day = 01;
    //if this is true, want to highlight the current date
    if (shouldSelect){
      day = date.getDate();
    }
    var month=date.getMonth(); // read the current month
    var year=date.getFullYear(); // read the current year 
    var dt=new Date(year, month, 01);//Year , month,date format

    var first_day=dt.getDay(); //, first day of present month

    dt.setMonth(month+1,0); // Set to next month and one day backward. 
    var last_date=dt.getDate(); // Last date of present month

    var dy=1; // day variable for adjustment of starting date. 
    var string = "";
    var numAdded = 0; //count actual days added. 
    for(i=0;i<=41;i++){
    if((i%7)==0){string = string.concat("</tr><tr>");} // if week is over then start a new line 
    if((i>= first_day) && (dy<= last_date)){
      numAdded += 1;
      var classString = "";
      if (numAdded == day && shouldSelect){
        string = string.concat("<td class=today><a href=''>"+ dy +"</a></td>");
      }
      else{
        string = string.concat("<td class=datepicker-td><a href=''>"+ dy +"</a></td>");
      }
      dy=dy+1;
    }else {string = string.concat("<td class=datepicker-td> </td>");} // Blank dates. 
    } // end of for loop

    string.concat("</tr>")
    tbody.append(string);
    $(".today").addClass("datepicker-td");
    dt.setDate(day);
    setCalText(dt, true, shouldSelect);
}
//show posts for a given day
function getCalFeed(date){
  
  var startDate = new Date(date); 
  startDate.setSeconds(0);
  startDate.setHours(0);
  startDate.setMinutes(0);
  var dateMidnight = new Date(startDate);
  dateMidnight.setHours(23);
  dateMidnight.setMinutes(59);
  dateMidnight.setSeconds(59);

  var thoughts = Thoughts.find({"createdAt": {
              $gt:startDate,
              $lt:dateMidnight
  }}).fetch();
  $("#calFeed").empty();
  if (thoughts.length > 0){
    var string = "<ul></ul>"
    for (var i = 0; i < thoughts.length; i++){
      var thought = thoughts[i];
      console.log(thought);
      var string = "<li>" + thought.text + "</li>";
      $("#calFeed").append(string);
    }
  }
  else{
    var string = "<p>Looks like you don't have any posts in your collection on this day!</p>";
    $("#calFeed").append(string);
  }
}
//set calendar feed header + calendar month/year
function setCalText(date, setCal, setHead){
    var monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
    var year = date.getFullYear().toString();
    var month = monthNames[date.getMonth()];
    var day = date.getDate();
    if (setCal)
      $(".datepicker-title").text(month + " " + year);
    if (setHead)
      $("#calFeedHead").text(month + " " + day + ", " + year);
}
//get date for previous or next month
function getDate(val, string){
  var calendarDate = $(".datepicker-title").text();
  calendarDate = calendarDate.split(" ");
  calendarDate = Date.parse(calendarDate[0] + string + calendarDate[1]);
  var newDate = new Date(1970,0,1);
  newDate.setSeconds(calendarDate / 1000);
  newDate.setDate(newDate.getDate() + val);
  return newDate;
}
//set time in header
function setTime(){
    var actualTime = new Date(Date.now());
    var endOfDay = new Date(actualTime.getFullYear(), actualTime.getMonth(), actualTime.getDate() + 1, 0, 0, 0);
    var totalSec = Math.floor((endOfDay.getTime() - actualTime.getTime())/1000);
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    $("#time").text(result);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            configuration.location = position
        },showLocationError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}
function showLocationError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.")
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.")
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.")
            break;
    }
}