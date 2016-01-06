var feed;
var thought_id;

Template.thought.onRendered(function() {
    var thought = this.data;
    var node = $('#' + thought._id);
    var radius = 75 * (thought.rank+1);


    node.css({
        'height' : radius*2 + 'px',
        'width'  : radius*2 + 'px',
        'border-radius' : radius + 'px',
        'line-height' : radius*2 + 'px'
    });

    $('.thought').draggable({
        revert: 'invalid',
        stack: '.thought',
        helper: 'clone',
        appendTo: 'body',

        /*
            thought_id -> BSON _id associated w/Thought
            feed -> <div> feed id
            hide's the actual thought and creates a clone to faciliate dragging
            over the 'feedwrapper' <div>
         */
        start: function(event, ui) {
            thought_id = this.id;
            feed = $(this).parent().get(0).id;
            $(this).hide();
        },

        /*
            If the drag was successful, delete the thought currently masked by hide(),
             else show() the original thought. The clone will be GCd
         */
        stop: function(event, ui) {
            if (feed != $(this).parent().get(0).id) {
                $(this).remove();
            } else {
                $(this).show();
            }
        }
    });

});

Template.myFeed.onRendered(function() {
    /*
     Sets #myFeed as a droppable jQueryGUI zone, if the drop thought's
     feed differs from the origin feed, update the privacy settings and append
     the thought to the new feed, else do nothing.
     */
    $( "#myFeed" ).droppable({ //set container droppable
        drop: function(event, ui) { //on drop
            if (event.target.id != feed) {
                Meteor.call("updatePrivacy", thought_id, "private");
                ui.draggable.css({ // set absolute position of dropped object
                    position: 'absolute',
                    top: ui.position.top - 95, //subtract height of header
                    left: ui.position.left
                }).appendTo('#myFeed'); //append to container
            }
        }
    });
});

Template.friendFeed.onRendered(function() {
    /*
     Sets #friendFeed as a droppable jQueryGUI zone, if the drop thought's
     feed differs from the origin feed, update the privacy settings and append
     the thought to the new feed, else do nothing.
     */
    $( "#friendFeed" ).droppable({
        drop: function(event, ui) {
            if (event.target.id != feed) {
                Meteor.call("updatePrivacy", thought_id, "friends");
                ui.draggable.css({ // set absolute position of dropped object
                    position: 'absolute',
                    top: ui.position.top - 95, //subtract height of header
                    left: ui.position.left
                }).appendTo('#friendFeed'); //append to container
            }
        }
    });
});

Template.worldFeed.onRendered(function() {
    /*
     Sets #worldFeed as a droppable jQueryGUI zone, if the drop thought's
     feed differs from the origin feed, update the privacy settings and append
     the thought to the new feed, else do nothing.
     */
    $( "#worldFeed" ).droppable({ //set container droppable
        drop: function(event, ui) { //on drop
            if (event.target.id != feed) {
                Meteor.call("updatePrivacy", thought_id, "public");
                ui.draggable.css({ // set absolute position of dropped object
                    position: 'absolute',
                    top: ui.position.top - 95, //subtract height of header
                    left: ui.position.left
                }).appendTo('#worldFeed'); //append to container
            }
        }
    });
});

Template.thought.events({
    /*
        Expand a thought
     */
    'click .condensed': function(event) {
        var bubble = $(event.currentTarget);
        var span = bubble.children('span');
        var del = bubble.children('button')
        var p = bubble.children('p');
        var container = $(event.currentTarget.parentNode);
        var radius = Math.min( parseInt(container.css('width')), parseInt(container.css('height')) - 65 );

        bubble.animate({
            width: radius,
            height: radius,
            borderRadius: radius
        });
        bubble.toggleClass('condensed expanded');

        span.removeClass('text');
        span.addClass('text-expanded');
        span.css({'margin-top': radius * 0.10 + 'px'});
        span.fadeOut(function(){
            span.fadeIn();
        });

        p.css({'display': 'block'});

        del.css({'visibility': 'visible'})
        del.css({'margin-top':'20px'})
    },

    /*
        Condense a thought
     */
    'click .expanded': function(event) {
        var bubble = $(event.currentTarget);
        var span = bubble.children('span');
        var del = bubble.children('button')
        var p = bubble.children('p');
        bubble.animate({
            width: 150,
            height: 150
        });
        bubble.toggleClass('condensed expanded');
        span.hide();
        span.removeClass('text-expanded');
        span.css({'margin-top':'0px'})
        span.addClass('text');
        span.fadeIn(1000);

        del.css({'visibility': 'hidden'})
        del.css({'margin-top': '0' + 'px'})

        p.css({'display': 'none'});


    },

    /*
        Deletes a thought
     */
    "click .delete": function (event) {
        Meteor.call("deleteThought", this._id);
    },

    /*
        Sets a thought's privacy setting to private
     */
    "click .toggle-private": function (event) {
        Meteor.call("setPrivate", this._id, ! this.private);
    }
});

// Added after merge
Template.thought.helpers({
    author: function (event) {
        if (Meteor.user()) {
            return Meteor.user().username;
        }
    }
});
