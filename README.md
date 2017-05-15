# Keepspace


## Meteor Packages
| Package                         | Version | Description |
|---------------------------------|:-------:|:----------------------------------------------------------------------------------------------|
|accounts-facebook                |1.0.4    |Login service for Facebook accounts|
|accounts-password                |1.1.1    |Password support for accounts|
|accounts-ui                      |1.1.5    |Simple templates to add login widgets to an app|
|alanning:roles                   |1.2.13   |Role-based authorization|
|aldeed:collection2               |2.3.3    |Automatic validation of insert and update operations on the client and server.|
|blaze                            |2.1.2    |Meteor Reactive Templating library|
|cfs:gridfs                       |0.0.33   |  GridFS storage adapter for CollectionFS|
|cfs:standard-packages            |0.5.9    |  Filesystem for Meteor, collectionFS|
|check                            |1.0.5    |Check whether a value matches a pattern|
|cmather:handlebars-server        |2.0.0    |  Allows handlebars templates to be defined on the server in .handlebars files|
|coffeescript                     |1.0.6    |Javascript dialect with fewer braces and semicolons|
|email                            |1.0.6    |Send email messages|
|http                             |1.1.0    |Make HTTP calls to remote servers|
|insecure                         |1.0.3    |Allow all database writes by default|
|iron:router                      |1.0.9    |Routing specifically designed for Meteor|
|jquery                           |1.11.3_2 |Manipulate the DOM using CSS selectors|
|juliancwirko:s-alert             |3.0.0    |Simple and fancy notifications / alerts / errors for Meteor|
|juliancwirko:s-alert-flip        |3.0.0    |Flip effect for s-alert - simple and fancy notifications / alerts for Meteor.|
|juliancwirko:s-alert-genie       |3.0.0    |Genie effect for s-alert - simple and fancy notifications / alerts for Meteor.|
|matb33:collection-hooks          |0.7.14   |Extends Mongo.Collection with before/after hooks for insert/update/remove/find/findOne| 
|meteor-platform                  |1.2.2    |Include a standard set of Meteor packages in your app |
|meteorhacks:kadira               |2.23.0   |Performance Monitoring for Meteor |
|meteorhacks:kadira-profiler      |1.2.0    |CPU Profiler for Meteor (used with Kadira) |
|meteorhacks:npm                  |1.4.0    |Use npm modules with your Meteor App |
|meteorhacks:search-source        |1.4.0    |Reactive Data Source for Search|
|meteorhacks:unblock              |1.1.0    |a way to use this.unblock inside publications|
|mizzao:bootstrap-3               |3.3.1_1  |HTML, CSS, and JS framework for developing responsive, mobile first projects on the web.|
|mongo                            |1.1.0    |Adaptor for using MongoDB and Minimongo over DDP |
|mrt:moment                       |2.8.1    |Moment.js, a JavaScript date library for dates, packaged for Meteor. See http://momentjs.com.|
|npm                              |0.0.0+   |complete npm integration/support for Meteor|
|npm-container                    |1.1.0+   |Contains all your npm dependencies|
|particle4dev:sass                |0.3.0    |SASS for meteor|
|random                           |1.0.3    |Random number generator and utilities|
|socialize:base-model             |0.3.0    |A model for all other models to inherit from| 
|socialize:friendships            |0.4.1    |A social friendship package|
|socialize:server-time            |0.1.2    |Package to compensate for client/server time difference|
|socialize:user-model             |0.1.4    |A social user package|
|templating                       |1.1.1    |Allows templates to be defined in .html files|
|themeteorchef:jquery-validation  |1.14.0   |jQuery Validation by jzaefferer, repackaged for Meteor.|
|tmeasday:publish-counts          |0.7.2    |Publish the count of a cursor, in real time|
|tmeasday:publish-with-relations  |0.2.0    |Publish associated collections at once.|
|underscore                       |1.0.3    |Collection of small helpers: _.map, _.each, ... |


##Configuring facebook for localhost:
```
add {{>loginButtons}} in splash .html 
hit sign in
hit configure facebook
put in the appid and secret 
```

##Deploying w/Meteor up a.k.a mup:

###First time setup: 
```
$ mup setup
$ mup deploy
```

###Update from Repository
```
$ git pull 
$ mup stop
$ mup deploy
```
