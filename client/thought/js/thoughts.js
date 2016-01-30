var feed;
var direction = 1;

function randDir() {
    return (Math.random() < 0.5 ? -1 : 1);
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

Template.thought.onRendered(function() {
    var thought = this.data;
    var node = $('#' + thought._id);
    var radius = 75 * (thought.rank+1);
    var container = this.firstNode.parentNode.classList[0];
    /* set css & available buttons based off starting feed */
    var animationName = 'float' + thought._id;
    $.keyframe.define([{
        name: animationName,
        '0%': {
            'transform': 'translatex(0px) translatey(0px)'
        },
        '12.5%': {
            'transform': 'translatex(' + (randDir() * (getRandom(5,10))) +'px) translatey(' + (randDir() * (getRandom(5,10))) + 'px)'
        },
        '37.5%': {
            'transform': 'translatex(' + (randDir() * (getRandom(5,10))) + 'px) translatey(' + (randDir() * (getRandom(5,10))) + 'px)'
        },
        '62.5%': {
            'transform': 'translatex(' + (randDir() * (getRandom(5,10))) + 'px) translatey(' + (randDir() * (getRandom(5,10))) + 'px)'
        },
        '87.5%': {
            'transform': 'translatex(' + (randDir() * (getRandom(5,10))) + 'px) translatey(' + (randDir() * (getRandom(5,10))) + 'px)'
        },
        '100%': {
            'transform': 'translatex(0px) translatey(0px)'
        }
    }]);
    node.css({
        'height' : radius*2 + 'px',
        'width'  : radius*2 + 'px',
        'border-radius' : radius + 'px',
        'line-height' : radius*2 + 'px'
    });
    if (thought.userId == Meteor.userId()) {
        node.css({'background-color' : "#F38286"});
        //node.children().get(4).className += " edit-thought";
        //node.children().get(4).className += " delete-thought";
    } else if ((container == "friendFeed" && thought.userId != Meteor.userId())
        || thought.collectedBy.includes(Meteor.userId()) && thought.privacy != "public") {
        var avatar = Meteor.users.findOne({_id: thought.userId});
        node.css({'background-color' : "#32C0D2"});
        /*

         background-repeat: no-repeat;
         background-position: 100%;

        node.children().css({'background-image' : 'url('+avatar.profile.picture+')'});
        node.children().css({'background-size' : radius * 2 + 'px ' + radius * 2 + 'px'});
        node.children().get(0).className += "avatarWrapper";
        node.children().css({
            'height' : radius*2 + 'px',
            'width'  : radius*2 + 'px',
            'border-radius' : radius + 'px',
            'line-height' : radius*2 + 'px'
        });
        */
        //node.parent().get(4).className += " bubble-row";
        //node.children().get(4).className += " collect-thought";
        //node.children().get(4).className += " hide-thought";
    } else {
        node.css({'background-color': "#FAA43A"});
        //node.children().get(4).className += " collect-thought";
        //node.children().get(4).className += " hide-thought";
    }
    /*
    $('#' + thought._id).draggable({
        //revert: 'invalid',
        containment: "parent",
        //revertDuration: 300,
        stack: '.thought',
        helper: 'clone',
        appendTo: 'body',
        refreshPosition: true,
        //connectToSortable: '.thought',
        /*
            thought_id -> BSON _id associated w/Thought
            feed -> <div> feed id
            hide's the actual thought and creates a clone to faciliate dragging
            over the 'feedwrapper' <div>
         */
    /*
        start: function(event, ui) {
            /*
            $('#' + thought._id + ".ui-draggable-dragging").css({
                'height' : radius*2 + 'px',
                'width'  : radius*2 + 'px',
                'border-radius' : radius + 'px',
                'line-height' : radius*2 + 'px'
            });
            console.log($('#' + thought._id + ".ui-draggable-dragging"));
            console.log($('#' + thought._id));
            */
    /*
            thought_id = this.id;
            feed = $(this).parent().get(0).id;
            $(this).css({
                'visibility': 'hidden'
            })
        },
        /*
            If the drag was successful, delete the thought currently masked by hide(),
             else show() the original thought. The clone will be GCd
         */
    /*
        stop: function(event, ui) {
            if (feed != $(this).parent().get(0).id) {
                $(this).remove();
            } else {
                $(this).css({
                    'visibility': 'visible'
                })
            }
        }

    });
*/
    $('#' + thought._id).playKeyframe({
        name: animationName, // name of the keyframe you want to bind to the selected element
        duration: '17s', // [optional, default: 0, in ms] how long you want it to last in milliseconds
        //delay:  getRandom(0,1)+'s', //[optional, default: 0s]  how long you want to wait before the animation starts
        iterationCount: 'infinite' //[optional, default:1]  how many times you want the animation to repeat
    });
});

var cloneThoughts = function() {
    $('.thought').each(function(i) {
        var item = $(this);
        if (item.parent().get(0).classList[0] != "myFeed") {
            i -= 1;
            return;
        }
        var item_clone = item.clone();
        item.data("clone", item_clone);
        var position = item.position();
        console.log(position);
        item_clone
            .css({
                left: position.left,
                top: position.top,
                visibility: "hidden"
            })
            .attr("data-pos", i+1);

        $("#cloned-myFeed").append(item_clone);
    });
}

Template.myFeed.onRendered(function() {
    cloneThoughts();
    /*
     Sets #myFeed as a droppable jQueryGUI zone, if the drop thought's
     feed differs from the origin feed, update the privacy settings and append
     the thought to the new feed, else do nothing.
     */
    $('.myFeed').sortable({
        revert: 'true',
        //revertDuration: 1000,
        tolerance: 'pointer',
        placeholder: 'sortable-placeholder',
        cursor: 'move',
        items: "> li",
        connectWith: ['.friendFeed','.worldFeed'],
        appendTo: 'body',
        //helper: 'clone',
        start: function(event, ui) {
            /*
            feed = this.id;
            $(ui.placeholder).hide(300);
            */

            ui.helper.addClass("exclude-me");
            $(".myFeed .thought:not(.exclude-me)").css({"visibility": "hidden"});
            ui.helper.data("clone").hide();
            $(".cloned-myFeed .thought").css({"visibility": "visible"});
        },
        stop :function(event, ui) {

            $(".myFeed .thought.exclude-me").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "myFeed") {
                    return;
                }
                var clone = item.data("clone");
                var position = item.position();

                clone.css("left", position.left);
                clone.css("top", position.top);
                clone.show();

                item.removeClass("exclude-me");
            });

            $(".myFeed .thought").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "myFeed") {
                    return;
                }
                var clone = item.data("clone");
                clone.attr("data-pos", item.index());
            });

            $(".myFeed .thought").css("visibility", "visible");
            $(".cloned-myFeed .thought").css("visibility", "hidden");
        },
        change: function(event, ui) {
            /*
            $(ui.placeholder).hide().show(300);
            */
            $(".myFeed .thought:not(.exclude-me)").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "myFeed") {
                    return;
                }
                var clone = item.data("clone");
                clone.stop(true, false);
                var position = item.position();
                clone.animate({
                    left: position.left,
                    top: position.top
                }, 200);
            });
        },
        update: function (event,ui) {
            $(".myFeed .thought:not(.exclude-me)").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "myFeed") {
                    return;
                }
                var clone = item.data("clone");
                clone.stop(true, false);
                var position = item.position();
                clone.animate({
                    left: position.left,
                    top: position.top
                }, 200);
            });
        },
        receive: function(event,ui) {
            console.log("AHH");
            Meteor.call("updatePrivacy", ui.item.get(0).id, "private", Meteor.userId());
            if (Meteor.userId() != Thoughts.findOne({_id: ui.item.get(0).id}).userId) {
                Meteor.call("addToMyCollection", ui.item.get(0).id);
            }
        }
    });


    /*
    $( "#myFeed" ).droppable({ //set container droppable
        drop: function(event, ui) { //on drop
            if (event.target.id != feed) {
                Meteor.call("updatePrivacy", thought_id, "private", Meteor.userId());
                if (Meteor.userId() != Thoughts.findOne({_id: thought_id}).userId) {
                    Meteor.call("addToMyCollection", thought_id);
                }
                ui.draggable.css({ // set absolute position of dropped object
                    position: 'absolute',
                    top: ui.position.top - 95, //subtract height of header
                    left: ui.position.left
                }).appendTo('#myFeed'); //append to container
            }
        }
    });
    */
});

Template.friendFeed.onRendered(function() {
    $(".friendFeed").sortable({
        revert: 'invalid',
        tolerance: 'pointer',
        placeholder: 'sortable-placeholder',
        cursor: 'move',
        items: "> li",
        connectWith: ['.friendFeed','.worldFeed'],
        appendTo: 'body',
        helper: 'clone',
        start: function(event, ui) {
            $(ui.placeholder).hide(300);
        },
        change: function(event, ui) {
             $(ui.placeholder).hide().show(300);
        },
        receive: function(event,ui) {
            console.log(ui.item);
            Meteor.call("updatePrivacy", ui.item.get(0).id, "friends", Meteor.userId());
        }
    });
    /*
     Sets #friendFeed as a droppable jQueryGUI zone, if the drop thought's
     feed differs from the origin feed, update the privacy settings and append
     the thought to the new feed, else do nothing.
     */
    /*
    $( ".friendFeed" ).droppable({
        drop: function(event, ui) {
            if (event.target.id != feed && Thoughts.findOne({_id: thought_id}).userId == Meteor.userId()) {
                Meteor.call("updatePrivacy", thought_id, "friends", Meteor.userId());
                ui.draggable.css({ // set absolute position of dropped object
                    position: 'absolute',
                    top: ui.position.top - 95, //subtract height of header
                    left: ui.position.left
                }).appendTo('.friendFeed'); //append to container
            }
        }
    });
    */
});

Template.worldFeed.onRendered(function() {
    $(".worldFeed").sortable({
        items: "> li",
        connectWith: ['.myFeed','.friendFeed'],
        appendTo: 'body',
        helper: 'clone',
        start: function(event, ui) {
            feed = this.id;
        },
        receive: function(event,ui) {
            console.log(ui.item);
            Meteor.call("updatePrivacy", ui.item.get(0).id, "public", Meteor.userId());
        }
    });
    /*
     Sets #worldFeed as a droppable jQueryGUI zone, if the drop thought's
     feed differs from the origin feed, update the privacy settings and append
     the thought to the new feed, else do nothing.
     */
    /*
    $( ".worldFeed" ).droppable({ //set container droppable
        drop: function(event, ui) { //on drop
            if (event.target.id != feed && Thoughts.findOne({_id: thought_id}).userId == Meteor.userId()) {
                Meteor.call("updatePrivacy", thought_id, "public", Meteor.userId());
                    ui.draggable.css({ // set absolute position of dropped object
                        position: 'absolute',
                        top: ui.position.top - 95, //subtract height of header
                        left: ui.position.left
                    }).appendTo('.worldFeed'); //append to container
            }
        }
    });
    */
});

Template.thought.events({
    /* Expand a thought */
    'click .condensed': function(event) {
        var bubble = $(event.currentTarget);
        if (bubble.get(0).classList.contains("exclude-me")) {
            return;
        }
        var author = $(bubble.children().get(0));//.children();
        var text = $(bubble.children().get(1)).children();
        var buttons = $(bubble.children().get(2)).children();
        var container = $(event.currentTarget.parentNode);
        var radius = Math.min( parseInt(container.css('width')), parseInt(container.css('height')) - 65 );
        /* smallest value the bubble can resize to w/o element overlap */
        if (radius < 608) {
            radius = 608;
        }
        bubble.animate({
            width: radius,
            height: radius,
            borderRadius: radius
        });
        $(bubble.children().get(1)).removeClass('text');
        $(bubble.children().get(1)).addClass('text-container');
        $(bubble.children().get(1)).css({
            'display' : 'block',
            'height' : radius - (radius * .33),
            'width' : '100%',
            'position': 'relative'
        });
        radius = (radius + 75) / 2;
        var width = Math.min( parseInt(container.css('width')), parseInt(container.css('height')) - 65 ) - radius;
        var thought = Thoughts.findOne({_id: bubble.get(0).id});
        var avatar = Meteor.users.findOne({_id: thought.userId});
        /* avatar container */
        var pictureScale = (radius - (radius * Math.sin(0.785398)));
        $(author.children().get(0)).css({
            'borderRadius': (pictureScale * 1.10) + 'px',
            'background-image': 'url('+avatar.profile.picture+')',
            'background-size' : '100% auto',
            'background-repeat': 'no-repeat',
            'background-position': '100%',
            'opacity': 0.8,
            'height':  (pictureScale * 1.10) + 'px',
            'width': (pictureScale * 1.10) + 'px',
            'max-width': (pictureScale * 1.10) + 'px',
            'left': 0,
            'top' :0,
            'position': 'absolute'
        });
        /* header contaienr */
        author.css({
            'height': (radius - (radius * Math.sin(0.785398))) + 'px'
        })
        /* author container */
        $(author.children().get(1)).css({
            'line-height': (radius - (radius * Math.sin(0.785398))) + 'px'
        });
        /* button container */
        $(bubble.children().get(2)).css({
            'height' : (radius - (radius * Math.sin(0.785398))) + 'px',
        });
        bubble.toggleClass('condensed expanded');
        text.get(0).className = 'text-expanded';
        text.css({'left': (radius - (radius * Math.cos(0.785398))) + 'px'});
        text.fadeOut(function(){
            text.fadeIn();
        });
        author.toggleClass('header-show header-hide');
        $($(bubble.children().get(0)).children().get(1)).children().toggleClass('buttons-show buttons-hide');
        buttons.toggleClass('buttons-show buttons-hide');
    },

    /* Condense a thought */
    'click .expanded': function(event) {
        var bubble = $(event.currentTarget);
        var author = $(bubble.children().get(0));//.children();
        var text = $(bubble.children().get(1)).children();
        var buttons = $(bubble.children().get(2)).children();
        bubble.animate({
            width: 150,
            height: 150
        });
        bubble.toggleClass('condensed expanded');
        $(bubble.children().get(1)).removeClass('text-container');
        $(bubble.children().get(1)).addClass('text');
        text.get(0).className = 'text';
        $(bubble.children().get(1)).removeAttr('style');
        author.toggleClass('header-show header-hide');
        $($(bubble.children().get(0)).children().get(1)).children().toggleClass('buttons-show buttons-hide');
        buttons.toggleClass('buttons-show buttons-hide');
    },
    /* Deletes a thought */
    "click #action-1": function (event) {
        Meteor.call("deleteThought", this._id);
    },
    /* Sets a thought's privacy setting to private */
    "click #action-2": function (event) {
        Meteor.call("setPrivate", this._id, ! this.private);
    },
});

Template.thought.helpers({
    author: function (event) {
        return this.username;
    }
});