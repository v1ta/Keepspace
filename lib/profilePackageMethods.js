Avatars = new FS.Collection("avatars", {
    filter: {
        maxSize: 10000000, // 10MB
        allow: {
            contentTypes: ['image/*'],
            extensions: ['png','jpg','gif']
        },
        onInvalid: function (message) {
          if (Meteor.isClient) {
            alert(message);
          } else {
            console.log(message);
          }
        }
    },
    stores: [new FS.Store.GridFS("avatars")]
})

if (Meteor.isServer){
    function isLoggedIn() {
        return Meteor.user() ? true : false
    }
    Avatars.allow({
        insert: isLoggedIn,
        update: isLoggedIn
    });
}