Meteor.startup(function () {

    sAlert.config({
        effect: 'flip',
        position: 'top-left',
        timeout: 2500,
        html: false,
        onRouteClose: true,
        stack: true,
        offset: 0
    });

});