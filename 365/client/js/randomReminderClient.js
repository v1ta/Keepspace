Template.header.onRendered(function(event) {
	Session.set("showRandomReminder", false);

	$(document).mouseup(function (e){
        if(!$("#mainAlert").is(e.target) // if the target of the click isn't the container...
            && $("#mainAlert").has(e.target).length === 0) // ... nor a descendant of the container
        {
            Session.set('showRandomReminder', false);
        }
    });

	var loggedIn = localStorage.getItem("justLoggedIn");
    if (loggedIn == "true"){
        var rand = Math.random();
        if (rand < 0.33){
            showOldPost();
        }
        localStorage.setItem("justLoggedIn", "false");
    };
});

Template.header.helpers({
    showRandomReminder: function(){
        return Session.get("showRandomReminder");
    }
});

function showOldPost(){
	Session.set("showRandomReminder", true);
    rand = Math.floor(Math.random() * 100000000) + 1;
    result = Thoughts.findOne( { userId:Meteor.userId(), randomIndex : { $gte : rand } } );
    if ( result == null ) {
        result = Thoughts.findOne( { userId:Meteor.userId(), randomIndex : { $lte : rand } } );
    }
    var time = result.createdAt;
    var newDate = new Date(time);
    var text = result.text;
    var day = "Day " + newDate.getDOY();
    var hours = newDate.getHours() == 12 ? newDate.getHours() : newDate.getHours() % 12;
    var minutes = newDate.getMinutes() < 10 ? "0" + newDate.getMinutes().toString() : newDate.getMinutes();
    var time = hours + ":" + minutes;

    $(".oldPostDay").text(day);
    $(".oldPostTime").text(time);
    $(".oldPostText").text(text);
    $("#mainAlert").show();

    $(".alertBubble").click(function(event){
        event.stopPropagation();
    });
    $(".alertDiv").click(function(){
    	closeAlert();
    	console.log("close");
    	Session.set("showRandomReminder", false);

    });
    $(".closeAlert").click(function(){
    	closeAlert();
    	console.log("close");
    	Session.set("showRandomReminder", false);
    });
}