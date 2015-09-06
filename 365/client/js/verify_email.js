Template.verifyemail.events({
  'click #verify': function (e) {
    e.preventDefault(); // prevent refreshing the page

    var email = $('#betaEmail').val(),
    password = makeTempPassword(); // generate temporary password 

    email = trimInput(email);

    if (validateEmail(email)){ 

      Accounts.createUser({email: email, password : password}, function(err){
        if (err) {
          if(err.reason === "Email already exists."){
          // handle user exists.
          }
        } else {
          var userId = Meteor.userId();
          Meteor.call('serverVerifyEmail', email, userId, function(){
            console.log("Verification Email Sent")
          });   
        }

      });   
    }else{
      alert("Please enter a valid email address");
    }
  }
});

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