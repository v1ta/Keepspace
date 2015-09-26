/* Global var for the feeds */
feedStage = {};
KSColors = {
  'blue'  : '#32c0d2',
  'red'   : '#f15f5a',
  'orange': '#faa43a'
}

resetAllFeeds = function() {
  // Reset Session variables for feeds
  delete Session.keys['leftfeed'];
  delete Session.keys['centerfeed'];
  delete Session.keys['rightfeed'];
  delete Session.keys['leftqueue'];
  delete Session.keys['centerqueue'];
  delete Session.keys['rightqueue'];
}

Template.mainPage.onRendered(function() {
  feedStage = {};
  if (!Session.get('leftfeed')) {
    resetFeed('leftfeed');
  }
  if (!Session.get('centerfeed')) {
    resetFeed('centerfeed');
  }
  if (!Session.get('rightfeed')) {
    resetFeed('rightfeed');
  }
  renderFeed('.feed-wrapper', 'fullFeed-canvas', 'left', Session.get('leftfeed'));
  renderFeed('.feed-wrapper', 'fullFeed-canvas', 'center', Session.get('centerfeed'));
  renderFeed('.feed-wrapper', 'fullFeed-canvas', 'right', Session.get('rightfeed'));
});

Template.mainPage.onDestroyed(function() {
  // Cleanup canvas
  feedStage.destroyChildren();
  feedStage.destroy();
})

function getFriendsAsUsers() {
  var friends = Meteor.friends.find();
  var friendsAsUsers = [];
  friends.forEach(function (friend) {
      friendsAsUsers.push(friend.user());
  });
  return friendsAsUsers;
}
function getFriendIds() {
  var friends = getFriendsAsUsers();
  var friendIds = [];
  for (var i = 0; i < friends.length; i++) {
    friendIds.push(friends[i]._id);
  }
  return friendIds;
}

function resetFeed(feed) {
  // Only find posts made after 00:00 of today
  var start = new Date();
  start.setHours(0,0,0,0);
  if (feed === 'leftfeed') {
    // TODO: Do better than O(n)?
    var friends = getFriendsAsUsers();
    var thought, thoughts = [];
    // Get user's last shared thought from today, if it exists
    if (Meteor.user().profile.lastShared.date >= start) {
      thought = Thoughts.findOne(Meteor.user().profile.lastShared.thoughtId);
      if (thought && thought.privacy === 'friends') {
        thoughts.push(thought);
      }
    }
    for (var i = 0; i < friends.length; i++) {
      thought = Thoughts.findOne(friends[i].profile.lastShared.thoughtId);
      if (thought && thought.collectedBy.indexOf(Meteor.userId()) === -1) {
        thoughts.push(thought);
      };
    }
    Session.set('leftfeed', thoughts);
    Session.set('leftqueue', []);
  }
  if (feed === 'centerfeed') {
    // Get user's posts and collected posts
    Session.set('centerfeed', Thoughts.find({
      $and: [
        {_id: {$not: Meteor.user().profile.lastShared.thoughtId}},
        {createdAt: {$gte:start}},
        {$or: [
          {userId: Meteor.userId()},
          {collectedBy: Meteor.userId()}
        ]}
      ]}, { sort: {createdAt: -1} }).fetch());
    Session.set('centerqueue', []);
  }
  if (feed === 'rightfeed') {
    var thought, thoughts = [];
    // Get user's last shared thought from today, if it exists
    if (Meteor.user().profile.lastShared.date >= start) {
      thought = Thoughts.findOne(Meteor.user().profile.lastShared.thoughtId);
      if (thought && thought.privacy === 'public') {
        thoughts.push(thought);
      }
    }
    var friendIds = getFriendIds();
    thoughts = thoughts.concat(Thoughts.find({
      $and: [
        {createdAt: {$gte:start}},
        {privacy: 'public'},
        {$nor: [
          {userId: Meteor.userId()},
          {userId: {$in: friendIds}},
          {collectedBy: Meteor.userId()}
        ]}
      ]},
      { sort: {createdAt: -1} }).fetch());
    Session.set('rightfeed', thoughts);
    Session.set('rightqueue', []);
  }
}

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

  var length, extraHeight, top, left, tolerance = 25;
  var background = new Kinetic.Layer();
  var col, outline;
  if (numCols === 3) {
    // Add the borders for drag and drop targets
    for (var i = 1; i < colIndex.length; i++) {
      col = stage.cols[colIndex[i]];
      outline = new Kinetic.Rect({
        name: colIndex[i] + 'Border',
        x: col.left + 1,
        y: col.top + 1,
        width: col.colWidth - 1,
        height: col.colHeight - 1,
        strokeWidth: 2,
        dash: [10, 5],
        visible: false
      });
      switch (i) {
        case 1: outline.stroke(KSColors['blue']); break;
        case 2: outline.stroke(KSColors['red']); break;
        case 3: outline.stroke(KSColors['orange']); break;
      }
      background.add(outline);
    }
    // Length of a side of a square inscribed in a circle
    length = stage.cols['center'].colWidth/2 * Math.sqrt(2);
    extraHeight = (stage.cols['center'].colWidth - length) / 2;
    top = parseInt($('#tempForm').css('height')) + parseInt($('#time').css('height'));
    left = parseInt($('#myFeed').css('width'));
  } else {
    length = stage.cols['single'].colWidth/2 * Math.sqrt(2);
    extraHeight = (stage.cols['single'].colWidth - length) / 2;
    top = 0;
    left = parseInt($('#calendarFeed').css('width'));
  }
  // Set up long post view box  
  $('#expandedThoughtContent').css({
    'width': length - tolerance,
    'height': length - tolerance,
    'top': top + extraHeight,
    'left': (left - length + tolerance) / 2
  });
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

renderFeed = function(containerDiv, canvas, colName, thoughts) {
  //console.log(thoughts);
  if (containerDiv === '#calFeed'){
    if (thoughts.length === 0 ){
      $('#noPostText').show();
    }
    else{
      $('#noPostText').hide();
    }
  }

  var numCols = colName === 'single' ? 1 : 3;
  var stage = $.isEmptyObject(feedStage) ? initStage(containerDiv, canvas, numCols) : feedStage;
  var column = stage.cols[colName];

  addThoughtsToStage(thoughts, colName);

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

addThoughtsToStage = function(thoughts, colName) {
  var x = 0, y = 0, radius = 0, padding = 5, layer, anim, col = feedStage.cols[colName];
  var bubbles = feedStage.get('.bubble'+colName), positions = [];
  for (var i = 0; i < bubbles.length; i++) {
    // Radius: add 3 to account for animation amplitude
    positions.push({ x: bubbles[i].x(), y: bubbles[i].y(), radius: bubbles[i].getChildren()[0].radius(), text:bubbles[i].getChildren()[1].text() });
  }
  var xmin, xmax, ymin, ymax, nextPos, fill;
  var queue = Session.get(colName+'queue');
  var friendIds = getFriendIds();
  for (var i = 0; i < thoughts.length; i++) {
    radius = 70*(thoughts[i].rank+1);
    // min = left + radius of bubble + animation amplitude, similar for max
    xmin = col.left + radius + 3;
    xmax = col.right - radius - 3;
    ymin = col.top + radius + 3;
    ymax = feedStage.height() - radius - 3;

    nextPos = placeNextBubble(xmin, xmax, ymin, ymax, radius+3, positions);
    if (nextPos === null) {
      // No more room for bubbles, add the rest of the thoughts to queue
      Session.set(colName+'queue', thoughts.slice(i));
      return;
    } else {
      x = nextPos.x;
      y = nextPos.y;
    }
    if (thoughts[i].userId === Meteor.userId()) {
      fill = KSColors['red'];
    } else if (friendIds.indexOf(thoughts[i].userId) !== -1) {
      fill = KSColors['blue'];
    } else {
      fill = KSColors['orange'];
    }
    layer = createBubble(thoughts[i].text, colName, x, y, radius, padding, fill);
    anim = animateBubble(layer, colName, thoughts[i], 0.25);
    addClickHandler(layer, colName, thoughts[i], 0.25, anim);
    addPopHandler(layer, colName, thoughts[i]);
    positions.push({ x: layer.x(), y: layer.y(), radius: layer.getChildren()[0].radius() });
    feedStage.add(layer);
    if (queue && queue.length > 0)
      queue.shift();
  }
  Session.set(colName+'queue', queue);
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
    fontFamily: 'Roboto',
    text: thought.length > 175 ? thought.substr(0, 172) + '...' : thought,
    align: 'center',
    x: 0,
    y: 0,
    width: bubble.getWidth() - 5,
    padding: padding,
    fill: '#ffffff'
  });

  // Center text in bubble
  text.offsetX(text.getWidth()/2);
  text.offsetY(text.getHeight()/2);

  layer.add(bubble);
  layer.add(text);

  // Add pop indicators
  for (var ii = 0; ii < 8; ii++) {
    layer.add(new Kinetic.Path({
      name: 'popIndicator',
      x: 0,
      y: 0,
      data: describeArc(0, 0, bubble.radius()-2, 45*ii, 45*(ii+1)),
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
  layer.on('dragstart.anim', function(event) {
    anim.stop();
    initCoords = {x: event.target.x(), y: event.target.y()};
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
  layer.on('dragend.anim', function(event) {
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
        if ( !relocateBubble(layer, colName, 'left', thought, duration) ) {
          tween.play();
        }
      } else if (colName !== 'center' && pos >= cols.center.left && pos < cols.center.right) {
        if ( !relocateBubble(layer, colName, 'center', thought, duration) ) {
          tween.play();
        }
      } else if (colName !== 'right' && pos >= cols.right.left) {
        if ( !relocateBubble(layer, colName, 'right', thought, duration) ) {
          tween.play();
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

function relocateBubble(layer, src, dest, thought, duration) {
  // Users can only post 1 thought per day
  var start = new Date();
  start.setHours(0,0,0,0);
  var profile = Meteor.user().profile;
  var isOwner = thought.userId === Meteor.userId();
  var firstPostOfToday = profile.lastShared.date <= start || profile.lastShared.thoughtId === thought._id;

  if (dest === 'center') {
    if (isOwner) {
      // Recall post
      Meteor.call('shareThought', thought, 'private');
    } else {
      // Collecting a post
      Meteor.call('addToMyCollection', thought._id);
    }
  } else if (dest === 'left') {
    if (isOwner) {
      if (firstPostOfToday) {
        // Share to friends
        Meteor.call('shareThought', thought, 'friends');
      } else {
        sAlert.error('You\'ve already shared a thought today!', {position: 'bottom'});
        return false;
      }
    } else {
      return false;
    }
  } else if (dest === 'right') {
    if (isOwner) {
      if (firstPostOfToday) {
        // Share to world
        Meteor.call('shareThought', thought, 'public');
      } else {
        sAlert.error('You\'ve already shared a thought today!', {position: 'bottom'});
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }

  // Add thought to dest list
  var thoughtList = Session.get(dest+'feed');
  thoughtList.push(thought);
  Session.set(dest+'feed', thoughtList);
  // Remove thought from src list
  removeFromSession(thought, src);

  layer.off('click dragstart.anim dragmove.anim dragend.anim');
  layer.name('bubble'+dest);
  var anim = animateBubble(layer, dest, thought, duration);
  addClickHandler(layer, dest, thought, duration, anim);
  return true;
}

function removeFromSession(thought, colName) {
  // Deletes from calendar page affect personal feed on main page
  if (colName === 'single') colName = 'center';
  // Remove thought from src list
  var thoughtList = Session.get(colName+'feed');
  for (var i = 0; i < thoughtList.length; i++) {
    if (thoughtList[i]._id === thought._id) {
      thoughtList.splice(i, 1);
      break;
    }
  }
  Session.set(colName+'feed', thoughtList);
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

function addPopHandler(layer, colName, thought) {
  var indicators = layer.find('.popIndicator');
  var index = 0;
  var step = 1000/8;
  var anim = new Kinetic.Animation(function (frame) {
    index = Math.floor(frame.time / step) % 8;
    if (indicators[index]) {
      if (indicators[index].opacity() < 1.0)
        indicators[index].opacity(indicators[index].opacity() + 0.2);
    }
  }, layer);
  // Pop bubble if mouse is held down for 2 seconds
  var pop;
  layer.on('mousedown', function() {
    anim.start();
    pop = window.setTimeout(function() { popBubble(layer, colName, thought); }, 1000);
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

function popBubble(layer, colName, thought) {
  var background = feedStage.find('.blurBG');
  layer.destroyChildren();
  layer.destroy();
  $('#expandedThoughtContent').hide();
  background.off('click.condense');
  background.hide();
  feedStage.draw();
  // Add the next thought in the queue
  removeFromSession(thought, colName);
  var thoughts = Session.get(colName+'queue');
  addThoughtsToStage(thoughts, colName);
}

function addClickHandler(layer, colName, thought, duration, anim) {
  layer.on('click.expand', function(e) {
    expandBubble(e, layer, colName, thought, duration, anim);
  });
}

function expandBubble(event, layer, colName, thought, duration, anim) {
  var layerTween, bubbleTween, textTween, nodes, bubble, text;
  // In main feed, always expand to center column
  var col = colName === 'single' ? feedStage.cols['single'] : feedStage.cols['center'];
  var radius = layer.getChildren()[0].radius(), expandedRadius = Math.min(col.colWidth, col.colHeight)/2;

  layer.draggable(false);
  layerTween = new Kinetic.Tween({
    node: layer,
    duration: duration,
    x: col.left + col.colWidth/2,
    y: col.top + expandedRadius
  })

  nodes = event.target.parent.getChildren();
  bubble = nodes[0];
  text = nodes[1];
  // Animate to fill the container
  bubbleTween = new Kinetic.Tween({
    node: bubble,
    duration: duration,
    radius: expandedRadius,
    opacity: 1
  });

  var isOwner = Meteor.userId() === thought.userId;
  var collected = colName === 'single' || colName === 'center';

  // Add username & date
  var username = new Kinetic.Text({
    fontFamily: 'Roboto',
    text: Meteor.userId() === thought.userId ? 'You:' : thought.username + ':',
    fill: '#ffffff',
    fontSize: 16
  });
  var date = new Kinetic.Text({
    fontFamily: 'Roboto',
    text: $.format.date(thought.createdAt, 'h:mmp'),
    fill: '#ffffff',
    fontSize: 16
  });
  if (isOwner) {
    var del = new Kinetic.Text({
      fontFamily: 'Roboto',
      text: 'Delete',
      fill: '#ffffff',
      fontSize: 16
    });
    del.offsetX(del.getWidth());
    del.on('click', function () { 
      popBubble(layer, colName, thought);
      removeFromSession(thought, colName);
      Meteor.call('deleteThought', thought._id);
    });
    var delOutline = new Kinetic.Rect({
      width: del.getWidth() + 4,
      height: del.getHeight() + 4,
      cornerRadius: 5,
      stroke: '#ffffff'
    });
    delOutline.offsetX(del.getWidth() + 2);
    delOutline.offsetY(2);
  } else if (!collected) {
    var collect = new Kinetic.Text({
      fontFamily: 'Roboto',
      text: 'Collect',
      fill: '#ffffff',
      fontSize: 16
    });
    collect.offsetX(collect.getWidth());
    var collectOutline = new Kinetic.Rect({
      width: collect.getWidth() + 4,
      height: collect.getHeight() + 4,
      cornerRadius: 5,
      stroke: '#ffffff'
    });
    collectOutline.offsetX(collect.getWidth() + 2);
    collectOutline.offsetY(2);
  }

  var oldHeight = text.getHeight();
  textTween = new Kinetic.Tween({
    node: text,
    duration: duration,
    width: expandedRadius*Math.sqrt(2),
    offsetX: expandedRadius*Math.sqrt(2)/2,
    fontSize: 18,
    padding: 10,
    onFinish: function () {
      if (text.text() !== thought.text) {
        text.height(expandedRadius*Math.sqrt(2));
        text.hide();
        $('#expandedThoughtContent').text(thought.text);
        $('#expandedThoughtContent').show();
        date.offsetY(date.offsetY()+10);
        if (isOwner) {
          del.offsetY(del.offsetY()+10);
          delOutline.offsetY(delOutline.offsetY()+10);
        } else {
          collect.offsetY(collect.offsetY()+10);
          collectOutline.offsetY(collectOutline.offsetY()+10);
        }
      }
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
      if (isOwner) {
        del.x(width/2);
        del.y(text.getHeight()/2);
        delOutline.x(del.x());
        delOutline.y(del.y());
        layer.add(delOutline);
        layer.add(del);
      } else if (!collected) {
        collect.x(width/2);
        collect.y(text.getHeight()/2);
        collectOutline.x(collect.x());
        collectOutline.y(collect.y());
        layer.add(collectOutline);
        layer.add(collect);
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
  var toRemove = [];
  if (isOwner) {
    toRemove = [username, date, del, delOutline];
  } else if (!collected) {
    toRemove = [username, date, collect, collectOutline];
    collect.on('click', function (event) {
      background.off('click.condense');
      condenseBubble(event, layer, colName, thought, duration, radius, anim, oldHeight, toRemove, [textTween, bubbleTween, layerTween], true);
    });
  } else {
    toRemove = [username, date];
  }
  background.on('click.condense', function(event) {
    condenseBubble(event, layer, colName, thought, duration, radius, anim, oldHeight, toRemove, [textTween, bubbleTween, layerTween], false);
  });
}

function condenseBubble(event, layer, colName, thought, duration, radius, anim, oldHeight, toRemove, tweens, collecting) {
  // Hide background
  var background = layer.parent.find('.blurBG')[0];
  background.visible(false);
  background.parent.draw();
  // Remove username/date and reverse tweens
  for (var i = 0; i < toRemove.length; i++) {
    toRemove[i].destroy();
  }
  var t;
  for (var i = 0; i < tweens.length; i++) {
    if (collecting && i === 2) {
      // Redefine layer tween
      // Get the new position
      var bubbles = feedStage.get('.bubblecenter'), positions = [];
      for (var j = 0; j < bubbles.length; j++) {
        positions.push({ x: bubbles[j].x(), y: bubbles[j].y(), radius: bubbles[j].getChildren()[0].radius() });
      }
      var col = feedStage.cols['center'];
      var xmin = col.left + radius + 3;
      var xmax = col.right - radius - 3;
      var ymin = col.top + radius + 3;
      var ymax = feedStage.height() - radius - 3;
      nextPos = placeNextBubble(xmin, xmax, ymin, ymax, radius+3, positions);
      if (nextPos) {
        var layerTween = new Kinetic.Tween({
          node: layer,
          duration: duration,
          x: nextPos.x,
          y: nextPos.y,
          onFinish: function() {
            relocateBubble(layer, colName, 'center', thought, duration);
          }
        });
        layerTween.play();
      } else {
        // Add the thought to queue
        var queue = Session.get('centerqueue');
        Session.set('centerqueue', queue.concat(thought));
        //TODO: refactor with relocateBubble()
        Meteor.call('addToMyCollection', thought._id);
        // Hide bubble
        layer.destroyChildren();
        layer.destroy();
      }
    } else {
      t = tweens[i].reverse();
      // Resetting text offsetY
      if (i === 0) {
        t = t.node;
        if ($('#expandedThoughtContent').css('display') === 'block') {
          t.height(oldHeight);
          t.show();
          $('#expandedThoughtContent').hide();
        }
        t.offsetY(oldHeight/2);
      }
    }
  }
  // Adjust the pop indicators
  var indicators = layer.find('.popIndicator');
  for (var i = 0; i < 8; i++) {
    indicators[i].data(describeArc(0, 0, radius-2, 45*i, 45*(i+1)));
    indicators[i].strokeWidth(4);
  }

  if (!collecting) {
    Meteor.setTimeout(function() { anim.start(); }, duration*1000);
    // Set up expand animation
    background.off('click.condense');
    layer.draggable(true);
    addClickHandler(layer, colName, thought, duration, anim);
  }
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

  var arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

  var d = [
      'M', start.x, start.y, 
      'A', radius, radius, 0, arcSweep, 0, end.x, end.y
  ].join(' ');

  return d;
}