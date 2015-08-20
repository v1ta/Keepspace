/* Global vars for the feeds */
myStage = {}, friendStage = {}, worldStage = {};

Template.main.onRendered(function() {
  // Only find posts made after 00:00 of today
  var start = new Date();
  start.setHours(0,0,0,0);
  renderFeed('#myFeed', 'myFeed-container', {owner:Meteor.userId(), createdAt: {$gte:start}});
  renderFeed('#worldFeed', 'worldFeed-container', {owner:{$ne: Meteor.userId()}, createdAt: {$gte:start}});
});

function setupStage(containerDiv, canvas) {
  var container = $(containerDiv);
  var cwidth = parseInt(container.css('width')) - parseInt(container.css('padding-left')) - parseInt(container.css('padding-right'));
  var cheight = parseInt(container.css('height')) - parseInt(container.css('padding-top')) - parseInt(container.css('padding-bottom'));

  var stage = new Kinetic.Stage({
    container: canvas,
    width: cwidth,
    height: cheight
  });
  if (containerDiv === '#myFeed') {
    myStage = stage;
    return myStage;
  } else if (containerDiv === '#worldFeed') {
    worldStage = stage;
    return worldStage;
  } else {
    return stage;
  }
}

renderFeed = function(containerDiv, canvas, findHash) {
  // Get thoughts
  var thoughts = Thoughts.find(findHash, {sort: {createdAt: -1}}).fetch();
  console.log(thoughts);
  if (containerDiv === "#calFeed"){
    if (thoughts.length === 0 ){
      $("#noPostText").show();
    }
    else{
      $("#noPostText").hide();
    }
  }

  var stage = setupStage(containerDiv, canvas);
  addThoughtsToStage(thoughts, stage);
  console.log(stage.getChildren());

  // Add the blur background
  layer = new Kinetic.Layer();
  layer.add(new Kinetic.Rect({
    name: 'blurBG',
    width: stage.width(),
    height: stage.height(),
    fill: '#bbbbbb',
    opacity: 0.5,
    visible: false
  }));
  stage.add(layer);
    console.log(myStage);
}

addThoughtsToStage = function(thoughts, stage) {
  var x = 0, y = 0, radius = 0, sSize = 0, sIndex = 0, padding = 5, layer;
  for (var i = 0; i < thoughts.length; i++) {
    radius = 40*(thoughts[i].rank+1);
    // x position - random
    x = getRandomInt(radius+padding, stage.width()-radius-padding);

    // y position - most recent posts towards the top, canvas divided into four sections
    sSize = Math.floor(stage.height() / 4);
    sIndex = Math.floor(i / (thoughts.length/4));
    y = getRandomInt(radius+padding + sSize*sIndex, sSize*(sIndex+1) - radius-padding);

    // If bubbles collide just try again
    // Todo: find a more graceful solution
    if (stage.getIntersection({x:x, y:y})) {
      console.log('collision');
      i--; continue;
    }
    layer = createBubble(thoughts[i].text, x, y, radius, padding, '#EA4949');
    addClickHandler(layer, stage.width(), thoughts[i], 0.25, x, y, radius);
    addPopHandler(layer, stage);
    stage.add(layer);
  }
}

// Returns a new layer with bubble and text members
function createBubble(thought, x, y, radius, padding, fill) {
  var layer = new Kinetic.Layer({
    draggable: true,
    dragDistance: 5
  });

  var bubble = new Kinetic.Circle({
    x: x, y: y, radius: radius, fill: fill, opacity: 0.8
  });
  var text = new Kinetic.Text({
    fontFamily: 'GeosansLight',
    text: thought,
    align: 'center',
    x: x,
    y: y,
    width: bubble.getWidth(),
    padding: padding,
    fill: '#ffffff'
  });
  // Center text in bubble
  text.offsetX(text.getWidth()/2);
  text.offsetY(text.getHeight()/2);
  // Increase bubble size if needed
  if (text.getHeight() > bubble.getHeight()) {
    bubble.radius(text.getHeight()/2 + padding);
  }
  // TODO: ellipses for long posts. limit bubble size

  layer.add(bubble);
  layer.add(text);

  // Add pop indicators
  for (var ii = 0; ii < 8; ii++) {
    layer.add(new Kinetic.Path({
      name: 'popIndicator',
      x: 0,
      y: 0,
      data: describeArc(x, y, radius, 45*ii, 45*(ii+1)),
      stroke: '#0099FF',
      strokeWidth: 4,
      opacity: 0
    }));
  }
  
  animateBubble(layer);

  return layer;
}

function animateBubble(layer) {
  // Floating animation
  var amplitude = 3,
      periodX = getRandomInt(5000,10000),
      periodY = getRandomInt(5000,10000),
      baseX = layer.x(),
      baseY = layer.y();
  var anim = new Kinetic.Animation(function(frame) {
    layer.x(amplitude * Math.sin(frame.time * 2 * Math.PI / periodX) + baseX);
    layer.y(amplitude * Math.sin(frame.time * 2 * Math.PI / periodY) + baseY);
  }, layer);
  anim.start();
  layer.on('click dragstart', function() { anim.stop(); });
  layer.on('dragend', function() {
    baseX = layer.x();
    baseY = layer.y();
    anim.start();
  });
}

function addPopHandler(layer, stage) {
  var indicators = layer.find('.popIndicator');
  var index = 0;
  var step = 2000/8;
  var anim = new Kinetic.Animation(function (frame) {
    index = Math.floor(frame.time / step) % 8;
    if (indicators[index]) {
      if (indicators[index].opacity() < 1.0)
        indicators[index].opacity(indicators[index].opacity() + 0.045);
    }
  }, layer);
  // Pop bubble if mouse is held down for 2 seconds
  var pop;
  layer.on('mousedown', function() {
    anim.start();
    pop = window.setTimeout(function() {
      layer.destroyChildren();
      layer.destroy();
      stage.find('.blurBG').hide();
      stage.draw();
    }, 2000);
  });
  layer.on('mouseup dragstart', function() {
    anim.stop();
    anim.frame.time = 0;
    for (var ii = 0; ii < 8; ii++) {
      indicators[ii].opacity(0);
    }
    layer.draw();
    window.clearTimeout(pop);
  })
}

function addClickHandler(layer, cwidth, thought, duration, x, y, radius) {
  layer.on('click.expand', function(e) {
    expandBubble(e, layer, cwidth, thought, duration, x, y, radius);
  });
}

function expandBubble(e, layer, cwidth, thought, duration, x, y, radius) {
  var layerTween, bubbleTween, textTween, nodes, bubble, text;
  layer.draggable(false);
  layerTween = new Kinetic.Tween({
    node: layer,
    duration: duration,
    x: 0,
    y: 0
  });

  nodes = e.target.parent.getChildren();
  bubble = nodes[0];
  text = nodes[1];
  // Animate to fill the container
  var expandedRadius = cwidth/2;
  bubbleTween = new Kinetic.Tween({
    node: bubble,
    duration: duration,
    x: expandedRadius,
    y: expandedRadius,
    radius: expandedRadius,
    opacity: 1
  });

  // Add username & date
  var username = new Kinetic.Text({
    fontFamily: 'GeosansLight',
    text: Meteor.user().username == thought.username ? 'You:' : thought.username + ':',
    fill: '#ffffff',
    fontSize: 16
  });
  var date = new Kinetic.Text({
    fontFamily: 'GeosansLight',
    text: $.format.date(thought.createdAt, 'h:mmp'),
    fill: '#ffffff',
    fontSize: 16
  })

  textTween = new Kinetic.Tween({
    node: text,
    duration: duration,
    width: expandedRadius*2,
    offsetX: expandedRadius,
    x: expandedRadius,
    y: expandedRadius,
    fontSize: 18,
    padding: 20,
    onFinish: function () {
      username.x(expandedRadius - text.getTextWidth()/2);
      username.y(expandedRadius - text.getHeight()/2);
      layer.add(username);
      date.x(expandedRadius - text.getTextWidth()/2);
      date.y(expandedRadius + text.getHeight()/2);
      layer.add(date);
    }
  });
  // Adjust the pop indicators
  var indicators = layer.find('.popIndicator');
  for (var i = 0; i < 8; i++) {
    indicators[i].data(describeArc(expandedRadius, expandedRadius, expandedRadius, 45*i, 45*(i+1)));
  }
  // Show the blur background
  var background = layer.parent.find('.blurBG')[0];
  background.visible(true);
  background.draw();
  // Play tweens
  layer.moveToTop();
  layerTween.play();
  bubbleTween.play();
  textTween.play();
  // Set up condense animation
  layer.off('click.expand');
  background.on('click.condense', function(e) {
    condenseBubble(e, layer, cwidth, thought, duration, x, y, radius, [username, date], [textTween, bubbleTween, layerTween]);
  });
}

function condenseBubble(e, layer, cwidth, thought, duration, x, y, radius, toRemove, tweens) {
  // Hide background
  e.target.visible(false);
  e.target.parent.draw();
  // Remove username/date and reverse tweens
  for (var i = 0; i < toRemove.length; i++) {
    toRemove[i].remove();
  }
  for (var i = 0; i < tweens.length; i++) {
    tweens[i].reverse();
  }
  // Adjust the pop indicators
  var indicators = layer.find('.popIndicator');
  for (var i = 0; i < 8; i++) {
    indicators[i].data(describeArc(x, y, radius, 45*i, 45*(i+1)));
  }
  // Set up expand animation
  e.target.off('click.condense');
  layer.draggable(true);
  animateBubble(layer);
  addClickHandler(layer, cwidth, thought, duration, x, y, radius);
}

// Get random int in range (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
      "M", start.x, start.y, 
      "A", radius, radius, 0, arcSweep, 0, end.x, end.y
  ].join(" ");

  return d;
}