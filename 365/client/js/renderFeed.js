/* Global var for the feeds */
feedStage = {};

Template.main.onRendered(function() {
  // Only find posts made after 00:00 of today
  var start = new Date();
  start.setHours(0,0,0,0);
  feedStage = {};
  renderFeed('.feed-wrapper', 'fullFeed-canvas', 'center', {owner:Meteor.userId(), createdAt: {$gte:start}});
  renderFeed('.feed-wrapper', 'fullFeed-canvas', 'right', {owner:{$ne: Meteor.userId()}, createdAt: {$gte:start}});
});

function initStage(containerDiv, canvas, numCols) {
  var container = $(containerDiv);
  var cwidth =  parseInt(container.css('width')) - 3;
  var cheight = parseInt(container.css('height')) - 5;

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
        right = left*2;
        top = 65;
        break;
      case 'right':
        left = Math.ceil(stage.width()/3) * 2;
        right = stage.width();
        top = 0;
        break;
    }
    stage.cols[colName] = {
      left : left,
      right : right,
      top : top,
      colWidth : right - left,
      colHeight : stage.height() - top
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
  console.log(thoughts);
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

  // debug: col stats
  var colDebug = new Kinetic.Layer(); 
  colDebug.add(new Kinetic.Text({
    fill: '#333333',
    text: 'colWidth: '+column.colWidth+', colHeight: '+column.colHeight+', left: '+column.left+', top: '+column.top,
    x: column.left,
    y: column.top
  }));
  stage.add(colDebug);
}

addThoughtsToStage = function(thoughts, stage, colName) {
  var x = 0, y = 0, radius = 0, sSize = 0, sIndex = 0, padding = 5, layer, col = stage.cols[colName];
  for (var i = 0; i < thoughts.length; i++) {
    radius = 70*(thoughts[i].rank+1);
    // x position - random
    // min = left + radius of bubble + animation amplitude, similar for max
    x = getRandomInt(col.left + radius + 3, col.right - radius - 3);

    // y position - most recent posts towards the top, canvas divided into four sections
    /*sSize = Math.floor(stage.height() / 4);
    sIndex = Math.floor(i / (thoughts.length/4));
    y = getRandomInt(radius+padding + sSize*sIndex, sSize*(sIndex+1) - radius-padding);*/
    y = getRandomInt(col.top + radius + 3, stage.height() - radius - 3);

    // If bubbles collide just try again
    // Todo: find a more graceful solution
    /*if (stage.getIntersection({x:x, y:y})) {
      console.log('collision');
      i--; continue;
    }*/
    layer = createBubble(thoughts[i].text, x, y, radius, padding, '#EA4949');
    animateBubble(layer, colName);
    addClickHandler(layer, colName, thoughts[i], 0.25, x, y, radius);
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
      data: describeArc(x, y, radius-2, 45*ii, 45*(ii+1)),
      stroke: '#0099FF',
      strokeWidth: 4,
      opacity: 0
    }));
  }

  return layer;
}

function animateBubble(layer, colName) {
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
  layer.on('dragstart', function(e) {
    anim.stop();
    initCoords = {x: e.target.x(), y: e.target.y()};
  });
  if (hasCols) {
    layer.on('dragmove', function(e) {
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
  layer.on('dragend', function(e) {
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

      } else if (colName !== 'center' && pos >= cols.center.left && pos < cols.center.right) {
      } else if (colName !== 'right' && pos >= cols.right.left) {
      } else {
        tween.play();
      }
    } else {
      tween.play();
    }
  });
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

function addClickHandler(layer, colName, thought, duration, x, y, radius) {
  layer.on('click.expand', function(e) {
    expandBubble(e, layer, colName, thought, duration, x, y, radius);
  });
}

function expandBubble(e, layer, colName, thought, duration, x, y, radius) {
  var bubbleTween, textTween, nodes, bubble, text, col = feedStage.cols[colName];
  layer.draggable(false);

  nodes = e.target.parent.getChildren();
  bubble = nodes[0];
  text = nodes[1];
  // Animate to fill the container
  var expandedRadius = col.colWidth/2;
  bubbleTween = new Kinetic.Tween({
    node: bubble,
    duration: duration,
    x: col.left + expandedRadius,
    y: col.top + expandedRadius,
    radius: expandedRadius,
    opacity: 1
  });

  // Add username & date
  var username = new Kinetic.Text({
    fontFamily: 'GeosansLight',
    text: Meteor.userId() === thought.owner ? 'You:' : thought.username + ':',
    fill: '#ffffff',
    fontSize: 16
  });
  var date = new Kinetic.Text({
    fontFamily: 'GeosansLight',
    text: $.format.date(thought.createdAt, 'h:mmp'),
    fill: '#ffffff',
    fontSize: 16
  });
  if (Meteor.userId() === thought.owner) {
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
    x: col.left + expandedRadius,
    y: col.top + expandedRadius,
    fontSize: 18,
    padding: 10,
    onFinish: function () {
      text.offsetY(text.getHeight()/2);
      var width = text.getTextWidth(), minWidth = 125;
      if (width < minWidth) {
        width = minWidth;
      }
      username.x(col.left + expandedRadius - width/2);
      username.y(col.top + expandedRadius - text.getHeight()/2 - 10);
      layer.add(username);
      date.x(col.left + expandedRadius - width/2);
      date.y(col.top + expandedRadius + text.getHeight()/2);
      layer.add(date);
      if (del) {
        del.x(col.left + expandedRadius + width/2);
        del.y(col.top + expandedRadius - text.getHeight()/2 - 10);
        layer.add(del);
      }
    }
  });
  // Adjust the pop indicators
  var indicators = layer.find('.popIndicator');
  for (var i = 0; i < 8; i++) {
    indicators[i].data(describeArc(col.left+expandedRadius, col.top+expandedRadius, expandedRadius-5, 45*i, 45*(i+1)));
    indicators[i].strokeWidth(10);
  }
  // Show the blur background
  var background = layer.parent.find('.blurBG')[0];
  background.visible(true);
  background.parent.moveToTop();
  background.parent.draw();
  // Play tweens
  layer.moveToTop();
  bubbleTween.play();
  textTween.play();
  // Set up condense animation
  layer.off('click.expand');
  var toRemove = del ? [username, date, del] : [username, date]
  background.on('click.condense', function(e) {
    condenseBubble(e, layer, colName, thought, duration, x, y, radius, oldHeight, toRemove, [textTween, bubbleTween]);
  });
}

function condenseBubble(e, layer, colName, thought, duration, x, y, radius, oldHeight, toRemove, tweens) {
  // Hide background
  e.target.visible(false);
  e.target.parent.moveToTop();
  e.target.parent.draw();
  // Remove username/date and reverse tweens
  for (var i = 0; i < toRemove.length; i++) {
    toRemove[i].remove();
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
    indicators[i].data(describeArc(x, y, radius-2, 45*i, 45*(i+1)));
    indicators[i].strokeWidth(4);
  }
  // Set up expand animation
  e.target.off('click.condense');
  layer.draggable(true);
  animateBubble(layer);
  addClickHandler(layer, colName, thought, duration, x, y, radius);
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