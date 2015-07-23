Template.main.onRendered(function() {
  var container = $("#myFeed");
  var cwidth = parseInt(container.css("width")) - parseInt(container.css("padding-left")) - parseInt(container.css("padding-right"));
  var cheight = parseInt(container.css("height")) - parseInt(container.css("padding-top")) - parseInt(container.css("padding-bottom"));

  // Get thoughts
  var thoughts = Thoughts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}}).fetch();
  console.log(thoughts);

  var stage = new Kinetic.Stage({
    container: "myFeed-container",
    width: cwidth,
    height: cheight
  });

  var x = 0, y = 0, radius = 0, sSize = 0, sIndex = 0, padding = 5, layer;
  for (var i = 0; i < thoughts.length; i++) {
    radius = 40*(thoughts[i].rank+1);
    // x position - random
    x = getRandomInt(radius+padding, cwidth-radius-padding);

    // y position - most recent posts towards the top, canvas divided into four sections
    sSize = Math.floor(cheight / 4);
    sIndex = Math.floor(i / (thoughts.length/4));
    y = getRandomInt(radius+padding + sSize*sIndex, sSize*(sIndex+1) - radius-padding);

    // If bubbles collide just try again
    // Todo: find a more graceful solution
    if (stage.getIntersection({x:x, y:y})) {
      console.log('collision');
      i--; continue;
    }
    layer = createBubble(thoughts[i].text, x, y, radius, padding, "#F38286");
    addClickHandler(layer, cwidth, thoughts[i], 0.4);
    stage.add(layer);
  }
  console.log(stage.getChildren());
});


// Returns a new layer with bubble and text members
function createBubble(thought, x, y, radius, padding, fill) {
  var layer = new Kinetic.Layer({
    name: 'condensed',
    draggable: true
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
    fill: "#ffffff"
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
  return layer;
}

// Click bubble handler
function addClickHandler(layer, cwidth, thought, duration) {
  var layerTween, bubbleTween, textTween, nodes, bubble, text;
  layer.on('click.condensed', function(e) {
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
    text.width(expandedRadius*2);
    text.height(expandedRadius*2);
    text.offsetX(expandedRadius);
    textTween = new Kinetic.Tween({
      node: text,
      duration: duration,
      x: expandedRadius,
      y: expandedRadius,
      fontSize: 18,
      padding: 20
    })
    layer.moveToTop();
    layerTween.play();
    bubbleTween.play();
    textTween.play();

    layer.draggable(false);
    layer.name('expanded');

    // Add elements to expanded bubble

  });

  layer.on('click.expanded', function(e) {
    /* Have to redefine the tweens!
    layerTween.reverse();
    bubbleTween.reverse();
    textTween.reverse();*/
    console.log('this node is expanded.');
  });
}

// Get random int in range (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}