/* Global var for the feeds */
feedStage = {};

Template.main.onRendered(function() {
  // Only find posts made after 00:00 of today
  var start = new Date();
  start.setHours(0,0,0,0);
  feedStage = {};
  renderFeed('.feed-wrapper', 'fullFeed-canvas', 'left', {friendList:Meteor.userId(), createdAt: {$gte:start}});
  renderFeed('.feed-wrapper', 'fullFeed-canvas', 'center', {userId:Meteor.userId(), createdAt: {$gte:start}});
  renderFeed('.feed-wrapper', 'fullFeed-canvas', 'right', {userId:{$ne: Meteor.userId()}, createdAt: {$gte:start}});
});

function initStage(containerDiv, canvas, numCols) {
  var container = $(containerDiv);
  var cwidth =  parseInt(container.css('width')) - 1;
  var cheight = parseInt(container.css('height')) - 7;

  var stage = new Kinetic.Stage({
    container: canvas,
    width: cwidth,
    height: cheight
  });

  // Set up cols
  stage.cols = {}, colIndex = ['single', 'left', 'center', 'right'];
  var left = 0, right = stage.width(), top = 0;
  for (var i = 0; i < colIndex.length; i++) {
    var colName = colIndex[i];
    switch (colName) {
      case 'single':
        break; // initial values
      case 'left':
        left = 0;
        right = Math.ceil(stage.width()/3);
        top = 0;
        break;
      case 'center':
        left = Math.ceil(stage.width()/3);
        right = left*2 - 1;
        top = 65;
        break;
      case 'right':
        left = Math.ceil(stage.width()/3) * 2 - 1;
        right = stage.width() - 1;
        top = 0;
        break;
    }
    stage.cols[colName] = {
      left : left,
      right : right,
      top : top,
      colWidth : right - left,
      colHeight : stage.height()-1 - top
    }
  }

  var background = new Kinetic.Layer();
  if (numCols === 3) {
    // Add the borders for drag and drop targets
    for (var i = 1; i < colIndex.length; i++) {
      var col = stage.cols[colIndex[i]];
      background.add(new Kinetic.Rect({
        name: colIndex[i] + 'Border',
        x: col.left + 1,
        y: col.top + 1,
        width: col.colWidth - 1,
        height: col.colHeight - 1,
        stroke: '#333333',
        strokeWidth: 2,
        dash: [10, 5],
        visible: false
      }));
    }
  }
  // Add the blur background
  background.add(new Kinetic.Rect({
    name: 'blurBG',
    x: 0,
    y: 0,
    width: stage.width(),
    height: stage.height(),
    fill: '#bbbbbb',
    opacity: 0.5,
    visible: false
  }));
  stage.add(background);

  feedStage = stage;
  return feedStage;
}

renderFeed = function(containerDiv, canvas, colName, findHash) {
  // Get thoughts
  var thoughts = Thoughts.find(findHash, {sort: {createdAt: -1}}).fetch();
  //console.log(thoughts);
  if (containerDiv === "#calFeed"){
    if (thoughts.length === 0 ){
      $("#noPostText").show();
    }
    else{
      $("#noPostText").hide();
    }
  }

  var numCols = colName === 'single' ? 1 : 3;
  var stage = $.isEmptyObject(feedStage) ? initStage(containerDiv, canvas, numCols) : feedStage;
  var column = stage.cols[colName];

  addThoughtsToStage(thoughts, stage, colName);

  /* debug: col stats
  var colDebug = new Kinetic.Layer(); 
  colDebug.add(new Kinetic.Text({
    fill: '#333333',
    text: 'colWidth: '+column.colWidth+', colHeight: '+column.colHeight+', left: '+column.left+', top: '+column.top,
    x: column.left,
    y: column.top
  }));
  stage.add(colDebug);*/
}

addThoughtsToStage = function(thoughts, stage, colName) {
  var x = 0, y = 0, radius = 0, padding = 5, layer, col = stage.cols[colName];
  var bubbles = stage.get('.bubble'+colName), positions = [];
  for (var i = 0; i < bubbles.length; i++) {
    // Radius: add 3 to account for animation amplitude
    positions.push({ x: bubbles[i].x(), y: bubbles[i].y(), radius: bubbles[i].getChildren()[0].radius()+3 });
  }
  var xmin, xmax, ymin, ymax, nextPos;
  for (var i = 0; i < thoughts.length; i++) {
    radius = 70*(thoughts[i].rank+1);
    // min = left + radius of bubble + animation amplitude, similar for max
    xmin = col.left + radius + 3;
    xmax = col.right - radius - 3;
    ymin = col.top + radius + 3;
    ymax = stage.height() - radius - 3;

    nextPos = placeNextBubble(xmin, xmax, ymin, ymax, radius+3, positions);
    if (nextPos === null) {
      // No more room for bubbles
      console.log('filled');
      return;
    } else {
      x = nextPos.x;
      y = nextPos.y;
    }
    layer = createBubble(thoughts[i].text, colName, x, y, radius, padding, '#EA4949');
    anim = animateBubble(layer, colName, thoughts[i], 0.25);
    addClickHandler(layer, colName, thoughts[i], 0.25, anim);
    addPopHandler(layer, stage);
    positions.push({ x: layer.x(), y: layer.y(), radius: layer.getChildren()[0].radius()+3 });
    stage.add(layer);
  }
}

function placeNextBubble(xmin, xmax, ymin, ymax, radius, positions) {
  var newx, newy, currTop, currBot, bLeft, bRight, bTop, bBot, bubbles, retry;
  // Max 50 tries
  for (var i = 0; i < 50; i++) {
    retry = false;
    // Find a random x, scan down that x for any y collisions
    newx = getRandomInt(xmin, xmax);
    newy = ymin;
    bLeft = newx-radius;
    bRight = newx+radius;
    bubbles = findBubblesInXInt(positions, bLeft, bRight);
    for (var j = 0; j < bubbles.length; j++) {
      bTop = newy-radius, bBot = newy+radius;
      currTop = bubbles[j].y - bubbles[j].radius;
      currBot = bubbles[j].y + bubbles[j].radius;
      if (bTop < currBot && bBot > currTop) {
        // Bubble collision - update newy
        newy += radius*2;
      }
      if (newy > ymax) {
        // No more room in this x interval, try again
        retry = true;
        break;
      }
    }
    if (!retry)
      return { x: newx, y: newy }
  }
  // No room could be found
  return null;
}

function findBubblesInXInt(positions, xmin, xmax) {
  var result = [], bLeft, bRight;
  for (var i = 0; i < positions.length; i++) {
    bLeft = positions[i].x - positions[i].radius;
    bRight = positions[i].x + positions[i].radius;
    if (bLeft < xmax && bRight > xmin) {
      result.push(positions[i]);
    }
  }
  // Sort by y values
  return result.sort(function(a, b) {
    if (a.y < b.y) {
      return -1;
    } else if (a.y > b.y) {
      return 1;
    } else {
      return 0;
    }
  });
}

// Returns a new layer with bubble and text members
function createBubble(thought, colName, x, y, radius, padding, fill) {
  var layer = new Kinetic.Layer({
    name: 'bubble'+colName,
    x: x,
    y: y,
    draggable: true,
    dragDistance: 5
  });

  var bubble = new Kinetic.Circle({
    x: 0, y: 0, radius: radius, fill: fill, opacity: 0.8
  });
  var text = new Kinetic.Text({
    fontFamily: 'GeosansLight',
    text: thought,
    align: 'center',
    x: 0,
    y: 0,
    width: bubble.getWidth(),
    padding: padding,
    fill: '#ffffff'
  });
  // Increase bubble size if needed
  if (text.getHeight() > bubble.getHeight()) {
    var difference = (text.getHeight() - bubble.getHeight())/2;
    bubble.radius(bubble.radius() + difference/2);
    text.width(bubble.getWidth());
    //text.height(bubble.getHeight());
  }
  // Center text in bubble
  text.offsetX(text.getWidth()/2);
  text.offsetY(text.getHeight()/2);
  // TODO: ellipses for long posts. limit bubble size

  layer.add(bubble);
  layer.add(text);

  // Add pop indicators
  for (var ii = 0; ii < 8; ii++) {
    layer.add(new Kinetic.Path({
      name: 'popIndicator',
      x: 0,
      y: 0,
      data: describeArc(0, 0, radius-2, 45*ii, 45*(ii+1)),
      stroke: '#0099FF',
      strokeWidth: 4,
      opacity: 0
    }));
  }

  return layer;
}

function animateBubble(layer, colName, thought, duration) {
  // Floating animation
  var amplitude = 3,
      periodX = getRandomInt(3000,8000),
      periodY = getRandomInt(3000,8000),
      baseX = layer.x(),
      baseY = layer.y();
  var anim = new Kinetic.Animation(function(frame) {
    layer.x(amplitude * Math.sin(frame.time * 2 * Math.PI / periodX) + baseX);
    layer.y(amplitude * Math.sin(frame.time * 2 * Math.PI / periodY) + baseY);
  }, layer);
  anim.start();
  layer.on('click', function() { anim.stop(); });

  // Drag and drop handlers
  var initCoords = {}, pos = {}, cols = feedStage.cols,
      leftBorder = feedStage.find('.leftBorder')[0],
      centerBorder = feedStage.find('.centerBorder')[0],
      rightBorder = feedStage.find('.rightBorder')[0];
  var hasCols = leftBorder && centerBorder && rightBorder;
  layer.on('dragstart.anim', function(e) {
    anim.stop();
    initCoords = {x: e.target.x(), y: e.target.y()};
  });
  if (hasCols) {
    layer.on('dragmove.anim', function(e) {
      pos = this.parent.getPointerPosition().x;
      if (colName !== 'left' && pos < cols.left.right) {
        showBorders(leftBorder);
        hideBorders([centerBorder, rightBorder]);
      } else if (colName !== 'center' && pos >= cols.center.left && pos < cols.center.right) {
        showBorders(centerBorder);
        hideBorders([leftBorder, rightBorder]);
      } else if (colName !== 'right' && pos >= cols.right.left) {
        showBorders(rightBorder);
        hideBorders([leftBorder, centerBorder]);
      } else {
        hideBorders([leftBorder, centerBorder, rightBorder]);
      }
    });
  }
  layer.on('dragend.anim', function(e) {
    var tween = new Kinetic.Tween({
      node: layer,
      duration: 0.3,
      x: initCoords.x,
      y: initCoords.y,
      onFinish: function() { anim.start(); }
    });
    if (hasCols) {
      hideBorders([leftBorder, centerBorder, rightBorder]);
      pos = this.parent.getPointerPosition().x;
      if (colName !== 'left' && pos < cols.left.right) {
        if (isDragValid()) {
          relocateBubble(layer, 'left', thought, duration);
        }
      } else if (colName !== 'center' && pos >= cols.center.left && pos < cols.center.right) {
        if (isDragValid()) {
          relocateBubble(layer, 'center', thought, duration);
        }
      } else if (colName !== 'right' && pos >= cols.right.left) {
        if (isDragValid()) {
          relocateBubble(layer, 'right', thought, duration);
        }
      } else {
        tween.play();
      }
    } else {
      tween.play();
    }
  });
  return anim;
}

// TODO : logic for dragging posts
function isDragValid() { return true; }
function relocateBubble(layer, colName, thought, duration) {
  layer.off('click dragstart.anim dragmove.anim dragend.anim');
  var anim = animateBubble(layer, colName, thought, duration);
  addClickHandler(layer, colName, thought, duration, anim);
}

function showBorders(border) {
  if (!border.isVisible()) {
    border.visible(true);
    border.parent.draw();
  }
}
function hideBorders(borders) {
  for (var i = 0; i < borders.length; i++)
    if (borders[i].isVisible()) {
      borders[i].visible(false);
      borders[i].parent.draw();
    }
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
    pop = window.setTimeout(function() { popBubble(layer, stage); }, 2000);
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

function popBubble(layer, stage) {
  var background = stage.find('.blurBG');
  layer.destroyChildren();
  layer.destroy();
  background.off('click.condense');
  background.hide();
  stage.draw();
}

function addClickHandler(layer, colName, thought, duration, anim) {
  layer.on('click.expand', function(e) {
    expandBubble(e, layer, colName, thought, duration, anim);
  });
}

function expandBubble(e, layer, colName, thought, duration, anim) {
  var layerTween, bubbleTween, textTween, nodes, bubble, text, col = feedStage.cols[colName];
  var radius = layer.getChildren()[0].radius(), expandedRadius = col.colWidth/2;

  layer.draggable(false);
  layerTween = new Kinetic.Tween({
    node: layer,
    duration: duration,
    x: col.left + expandedRadius,
    y: col.top + expandedRadius
  })

  nodes = e.target.parent.getChildren();
  bubble = nodes[0];
  text = nodes[1];
  // Animate to fill the container
  bubbleTween = new Kinetic.Tween({
    node: bubble,
    duration: duration,
    radius: expandedRadius,
    opacity: 1
  });

  // Add username & date
  var username = new Kinetic.Text({
    fontFamily: 'GeosansLight',
    text: Meteor.userId() === thought.userId ? 'You:' : thought.username + ':',
    fill: '#ffffff',
    fontSize: 16
  });
  var date = new Kinetic.Text({
    fontFamily: 'GeosansLight',
    text: $.format.date(thought.createdAt, 'h:mmp'),
    fill: '#ffffff',
    fontSize: 16
  });
  if (Meteor.userId() === thought.userId) {
    var del = new Kinetic.Text({
      fontFamily: 'GeosansLight',
      text: 'Delete',
      fill: '#ffffff',
      fontSize: 16
    });
    del.offsetX(del.getWidth());
    del.on('click', function () {
      popBubble(layer, layer.parent);
      Meteor.call("deleteThought", thought._id);
    });
  }

  var oldHeight = text.getHeight();
  textTween = new Kinetic.Tween({
    node: text,
    duration: duration,
    width: expandedRadius*2,
    offsetX: expandedRadius,
    fontSize: 18,
    padding: 10,
    onFinish: function () {
      text.offsetY(text.getHeight()/2);
      var width = text.getTextWidth(), minWidth = 125;
      if (width < minWidth) {
        width = minWidth;
      }
      username.x(-width/2);
      username.y(-text.getHeight()/2 - 10);
      layer.add(username);
      date.x(-width/2);
      date.y(text.getHeight()/2);
      layer.add(date);
      if (del) {
        del.x(width/2);
        del.y(-text.getHeight()/2 - 10);
        layer.add(del);
      }
    }
  });
  // Adjust the pop indicators
  var indicators = layer.find('.popIndicator');
  for (var i = 0; i < 8; i++) {
    indicators[i].data(describeArc(0, 0, expandedRadius-5, 45*i, 45*(i+1)));
    indicators[i].strokeWidth(10);
  }
  // Show the blur background
  var background = layer.parent.find('.blurBG')[0];
  background.visible(true);
  background.parent.moveToTop();
  background.parent.draw();
  // Play tweens
  layer.moveToTop();
  layerTween.play();
  bubbleTween.play();
  textTween.play();
  // Set up condense animation
  layer.off('click.expand');
  var toRemove = del ? [username, date, del] : [username, date]
  background.on('click.condense', function(e) {
    condenseBubble(e, layer, colName, thought, duration, radius, anim, oldHeight, toRemove, [textTween, bubbleTween, layerTween]);
  });
}

function condenseBubble(e, layer, colName, thought, duration, radius, anim, oldHeight, toRemove, tweens) {
  // Hide background
  e.target.visible(false);
  e.target.parent.draw();
  // Remove username/date and reverse tweens
  for (var i = 0; i < toRemove.length; i++) {
    toRemove[i].destroy();
  }
  for (var i = 0; i < tweens.length; i++) {
    var t = tweens[i].reverse();
    // Resetting text offsetY
    if (i === 0) {
      t = t.node;
      t.offsetY(oldHeight/2);
    }
  }
  // Adjust the pop indicators
  var indicators = layer.find('.popIndicator');
  for (var i = 0; i < 8; i++) {
    indicators[i].data(describeArc(0, 0, radius-2, 45*i, 45*(i+1)));
    indicators[i].strokeWidth(4);
  }
  // Set up expand animation
  e.target.off('click.condense');
  layer.draggable(true);
  anim.start();
  addClickHandler(layer, colName, thought, duration, anim);
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