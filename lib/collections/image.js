/*if (Meteor.isServer) {
    var imageStore = new FS.Store.S3("images", {
        /* REQUIRED 
        accessKeyId: Meteor.settings.private.AWSAccessKeyId,
        secretAccessKey: Meteor.settings.private.AWSSecretAccessKey,
        bucket: Meteor.settings.private.AWSBucket
    });

    Images = new FS.Collection("Images", {
        stores: [imageStore],
        filter: {
            allow: {
                contentTypes: ['image/*']
            }
        }
    });
}

if (Meteor.isClient) {
    var imageStore = new FS.Store.S3("images");
    Images = new FS.Collection("Images", {
        stores: [imageStore],
        filter: {
            allow: {
                contentTypes: ['image/*']
            },
            onInvalid: function(message) {
                toastr.error(message);
            }
        }
    });
}

Images.allow({
    insert: function(userId) { return userId != null; },
    update: function(userId, image) { return userId === image.userId; },
    remove: function(userId, image) { return userId === image.userId; },
    download: function() { return true; }
});
*/
