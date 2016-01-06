![Keepspace](http://i.imgur.com/sYK8xa8.png)

#Thought API

This document aims to serve as a guide for the implementation of "Thoughts"
and the design principles which influenced them. 

##Feed Propagation
 
 Thoughts are currently filtered via the following DB schema(../lib/js/_namespace.js fields:
 
 * privacy
 * friendList
 * userID
 
##Sharing
 
 **Dragging** is facilitated via the *jQuery GUI* api calls:
 
 * $().draggable
 * $().droppable 
 
 Enclosed in droppable, an *.update()* is called on the server to change the privacy field of a thought contingent on which feed where the thought was dropped.
 
##Instantiation

A new thought is **constructed** in (../client/feed/js/home.js) via *submit .new-thought()*. The template(../client/thought/js/thought.js) also contains a reference to the JSON
 via the thought variable instantiated in *onRendered()* 

more to come...
