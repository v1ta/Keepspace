Template.mainPage.events({
	"submit .new-thought": function (event) {
        console.log("here");
        event.preventDefault();
        // This function is called when the new thought form is submitted
        var text = $("#newThoughtBox").val();
        console.log(text);

        var thoughtId = Meteor.call("addThought", text, null,
        function(err, data) {
            if (err){
                console.log(err);
            } 
            console.log(data)
            var thought = Thoughts.findOne({_id:data});
            console.log(thought);
            // Add a new bubble
            var thoughtsList = Session.get('centerfeed');
            thoughtsList.push(thought);
            Session.set('centerfeed', thoughtsList);
            addThoughtsToStage([thought], 'center');
        });

        // Clear form
        $("#newThoughtBox").val("");

        // Prevent default form submit

        return false;
    },
});