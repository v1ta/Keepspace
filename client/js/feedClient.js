Template.thought.onRendered(function() {
    thought = this.data;
    node = $('#' + thought._id);
    radius = 75 * (thought.rank+1);
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
        start: function() {
            $(this).hide(); //hide original when showing clone
        },
        stop: function() {
            $(this).show(); //show original when hiding clone
        }
    });

    // TODO - just a placeholder to test droppables
    $( "#friendFeed" ).droppable({ //set container droppable
        drop: function( event, ui ) { //on drop
            ui.draggable.css({ // set absolute position of dropped object
                position: 'absolute',
                top: ui.position.top - 95, //subtract height of header
                left: ui.position.left
            }).appendTo('#friendFeed'); //append to container
        }
    });
});

Template.thought.events({
    'click .condensed': function(event) {
        console.log('click');
        var bubble = $(event.currentTarget);
        var container = $(event.currentTarget.parentNode);
        var radius = Math.min( parseInt(container.css('width')), parseInt(container.css('height')) - 65 );
        bubble.animate({
            width: radius,
            height: radius,
            borderRadius: radius
        });
        bubble.toggleClass('condensed expanded');
    },
    'click .expanded': function(event) {
        console.log('condese it');
        var bubble = $(event.currentTarget);
        bubble.animate({
            width: 150,
            height: 150
        });
        bubble.toggleClass('condensed expanded');
    }
});