var feed;
var selectedUi;
var selected;
var direction = 1;
var myFeedThoughts = 0;
var friendFeedThoughts = 0;
var worldFeedThoughts = 0;

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
    } else if ((container == "friendFeed" && thought.userId != Meteor.userId())
        || thought.collectedBy.includes(Meteor.userId()) && thought.privacy != "public") {
        var avatar = Meteor.users.findOne({_id: thought.userId});
        node.css({'background-color' : "#32C0D2"});
    } else {
        node.css({'background-color': "#FAA43A"});
    }
    $('#' + thought._id).playKeyframe({
        name: animationName, // name of the keyframe you want to bind to the selected element
        duration: '17s', // [optional, default: 0, in ms] how long you want it to last in milliseconds
        //delay:  getRandom(0,1)+'s', //[optional, default: 0s]  how long you want to wait before the animation starts
        iterationCount: 'infinite' //[optional, default:1]  how many times you want the animation to repeat
    });
});

Template.thought.hooks({
    rendered: function() {
        var thought = this.data;
        var bubble = $('#' + thought._id);
        var item_clone = bubble.clone();
        bubble.data("clone", item_clone);
        var position = bubble.position();
        item_clone
            .css({
                left: position.left,
                top: position.top,
                visibility: "hidden"
            });
        var feedName = "";
        var index = 0;
        if (this.data.privacy == "private") {
            feedName = "myFeed";
            myFeedThoughts += 1;
            index = myFeedThoughts;
        } else if (this.data.privacy == "friends") {
            feedName = "friendFeed";
            friendFeedThoughts += 1;
            index = friendFeedThoughts;
        } else if (this.data.privacy == "public") {
            feedName = "worldFeed";
            worldFeedThoughts += 1;
            index = worldFeedThoughts;
        }
        item_clone.attr("data-pos",index);
        $("#cloned-"+feedName).append(item_clone);

    }
});

var cloneThoughts = function(feedName) {
    $('#cloned-'+feedName).empty();
    $('.thought').each(function() {
        var item = $(this);
        if (item.parent().get(0).classList[0] != feedName) {
            return;
        }
        console.log(item);
        var item_clone = item.clone();
        item.data("clone", item_clone);
        var position = item.position();
        item_clone
            .css({
                left: position.left,
                top: position.top,
                visibility: "hidden"
            })
            var index;
            if (feedName == "myFeed") {
                myFeedThoughts += 1;
                index = myFeedThoughts;
            } else if (feedName == "friendFeed") {
                friendFeedThoughts += 1;
                index = friendFeedThoughts;
            } else {
                worldFeedThoughts += 1;
                index = worldFeedThoughts;
            }
        item_clone.attr("data-pos",index);
        $("#cloned-"+feedName).append(item_clone);
    });
};

Template.myFeed.onRendered(function() {
    cloneThoughts("myFeed");
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
            feed = "myFeed";
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
            $(".myFeed .thought:not(.exclude-me)").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "myFeed") {
                    return;
                }
                var clone = item.data("clone");
                if (clone == undefined) {
                    return;
                }
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
                if (clone === undefined) {
                    return;
                }
                clone.stop(true, false);
                var position = item.position();
                clone.animate({
                    left: position.left,
                    top: position.top
                }, 200);
            });
        },
        receive: function(event,ui) {
            console.log("myFeed receive called");
            $('#cloned-'+feed+' #'+ ui.item.get(0).id).remove();
            Meteor.call("updatePrivacy", ui.item.get(0).id, "private", Meteor.userId());
            if (Meteor.userId() != Thoughts.findOne({_id: ui.item.get(0).id}).userId) {
                Meteor.call("addToMyCollection", ui.item.get(0).id);
            }
        }
    });
});

Template.friendFeed.onRendered(function() {
    cloneThoughts("friendFeed");
    $('.friendFeed').sortable({
        revert: 'true',
        //revertDuration: 1000,
        tolerance: 'pointer',
        placeholder: 'sortable-placeholder',
        cursor: 'move',
        items: "> li",
        connectWith: ['.worldFeed','.myFeed'],
        appendTo: 'body',
        //helper: 'clone',
        start: function(event, ui) {
            feed = "friendFeed";
            ui.helper.addClass("exclude-me");
            $(".friendFeed .thought:not(.exclude-me)").css({"visibility": "hidden"});
            ui.helper.data("clone").hide();
            $(".cloned-friendFeed .thought").css({"visibility": "visible"});
        },
        stop :function(event, ui) {
            $(".friendFeed .thought.exclude-me").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "friendFeed") {
                    return;
                }
                var clone = item.data("clone");
                if (clone == undefined) {
                    return;
                }
                var position = item.position();

                clone.css("left", position.left);
                clone.css("top", position.top);
                clone.show();

                item.removeClass("exclude-me");
            });

            $(".friendFeed .thought").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "friendFeed") {
                    return;
                }
                var clone = item.data("clone");
                clone.attr("data-pos", item.index());
            });

            $(".friendFeed .thought").css("visibility", "visible");
            $(".cloned-friendFeed .thought").css("visibility", "hidden");
        },
        change: function(event, ui) {
            $(".friendFeed .thought:not(.exclude-me)").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "friendFeed") {
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
            $(".friendFeed .thought:not(.exclude-me)").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "friendFeed") {
                    return;
                }
                var clone = item.data("clone");
                if (clone === undefined) {
                    return;
                }
                clone.stop(true, false);
                var position = item.position();
                clone.animate({
                    left: position.left,
                    top: position.top
                }, 200);
            });
        },
        receive: function(event,ui) {
            console.log("friendFeed receive called");
            $('#cloned-'+feed+' #'+ ui.item.get(0).id).remove();
            Meteor.call("updatePrivacy", ui.item.get(0).id, "friends", Meteor.userId());
        }
    });
});

Template.worldFeed.onRendered(function() {
    cloneThoughts("worldFeed");
    $('.worldFeed').sortable({
        revert: 'true',
        //revertDuration: 1000,
        tolerance: 'pointer',
        placeholder: 'sortable-placeholder',
        cursor: 'move',
        items: "> li",
        connectWith: ['.friendFeed','.myFeed'],
        appendTo: 'body',
        //helper: 'clone',
        start: function(event, ui) {
            feed = "worldFeed";
            ui.helper.addClass("exclude-me");
            $(".worldFeed .thought:not(.exclude-me)").css({"visibility": "hidden"});
            ui.helper.data("clone").hide();
            $(".cloned-worldFeed .thought").css({"visibility": "visible"});
        },
        stop :function(event, ui) {

            $(".worldFeed .thought.exclude-me").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "worldFeed") {
                    return;
                }
                var clone = item.data("clone");
                var position = item.position();

                clone.css("left", position.left);
                clone.css("top", position.top);
                clone.show();

                item.removeClass("exclude-me");
            });

            $(".worldFeed .thought").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "worldFeed") {
                    return;
                }
                var clone = item.data("clone");
                clone.attr("data-pos", item.index());
            });

            $(".worldFeed .thought").css("visibility", "visible");
            $(".cloned-worldFeed .thought").css("visibility", "hidden");
        },
        change: function(event, ui) {
            /*
             $(ui.placeholder).hide().show(300);
             */
            $(".worldFeed .thought:not(.exclude-me)").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "worldFeed") {
                    return;
                }
                var clone = item.data("clone");
                if (clone == undefined) {
                    return;
                }
                clone.stop(true, false);
                var position = item.position();
                clone.animate({
                    left: position.left,
                    top: position.top
                }, 200);
            });
        },
        update: function (event,ui) {
            $(".worldFeed .thought:not(.exclude-me)").each(function() {
                var item = $(this);
                if (item.parent().get(0).classList[0] != "worldFeed") {
                    return;
                }
                var clone = item.data("clone");
                if (clone == undefined) {
                    return;
                }
                clone.stop(true, false);
                var position = item.position();
                clone.animate({
                    left: position.left,
                    top: position.top
                }, 200);
            });
        },
        receive: function(event,ui) {
            console.log(ui);
            $('#cloned-'+feed+' #'+ ui.item.get(0).id).remove();
            Meteor.call("updatePrivacy", ui.item.get(0).id, "public", Meteor.userId());
        }
    });
});

Template.thought.events({
    /* Expand a thought */
    'click .condensed': function(event, ui) {
        var bubble = $(event.currentTarget);
        selected = bubble;
        selectedUi = ui;
        console.log(ui.data);
        feed = bubble.parent().get(0).classList[0];
        if (bubble.get(0).classList.contains("exclude-me")) {
            return;
        }
        Session.set("maximized", true);
        var author = $(bubble.children().get(0));//.children();
        var text = $(bubble.children().get(1)).children();
        var buttons = $(bubble.children().get(2)).children();
        var container = $(event.currentTarget.parentNode);
        var radius = Math.min( parseInt(container.css('width')), parseInt(container.css('height')) - 75 );
        radius -= 20;
        if (feed == "calFeed") {
            radius = 500;
        }
        bubble.animate({
            width: radius,
            height: radius,
            borderRadius: radius
        });
        $(bubble.children().get(1)).removeClass('text');
        $(bubble.children().get(1)).addClass('text-container');
        //console.log($(bubble.children().get(1)));
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
        //console.log(bubble);
        var author = $(bubble.children().get(0));//.children();
        var text = $(bubble.children().get(1)).children();
        var buttons = $(bubble.children().get(2)).children();
        bubble.animate({
            width: ((this.rank+1) * 75)*2,
            height: ((this.rank+1) * 75)*2
        });
        bubble.toggleClass('condensed expanded');
        $(bubble.children().get(1)).removeClass('text-container');
        $(bubble.children().get(1)).addClass('text');
        text.get(0).className = 'text-inner';
        $(text.get(0)).removeAttr('style');
        console.log(text.get(0));
        $(bubble.children().get(1)).removeAttr('style');
        author.toggleClass('header-show header-hide');
        author.removeAttr('style');
        $($(bubble.children().get(0)).children().get(1)).children().toggleClass('buttons-show buttons-hide');
        buttons.toggleClass('buttons-show buttons-hide');
        $(bubble.children().get(2)).removeAttr('style');
    },
    /* Deletes a thought */
    "click #action-2": function (event) {
        var id = this._id;
        Meteor.setTimeout( function() {
            $('#cloned-'+feed+' #'+id).remove();
                Meteor.call("deleteThought", id);
            }, 300
        );
    },
    /* Collect a thought */
    "click #action-1": function (event, ui) {
        var bubble = selected;
        if (feed == 'myFeed') {
            return;
        }
        Meteor.setTimeout(function () {
            $('#cloned-'+feed+' #'+ bubble.get(0).id).remove();
            if (Meteor.userId() == Thoughts.findOne({_id: bubble.get(0).id}).userId) {
                Meteor.call("updatePrivacy", bubble.get(0).id, "private", Meteor.userId());
            } else {
                Meteor.call("addToMyCollection", bubble.get(0).id);
            }
        }, 300);
    }
});

Template.thought.helpers({
    author: function (event) {
        return this.username;
    }
});