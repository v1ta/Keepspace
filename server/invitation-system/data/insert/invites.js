Meteor.methods({
    addToInvitesList: function (invitee) {
        var emailExists, inviteCount;
        check(invitee, {
            email: String,
            requested: Number,
            invited: Boolean
        });
        emailExists = Invites.findOne({
            "email": invitee.email
        });
        if (emailExists) {
            throw new Meteor.Error("email-exists", "It looks like you've already signed up for our beta. Thanks!");
        } else {
            inviteCount = Invites.find({}, {
                fields: {
                    "_id": 1
                }
            }).count();
            invitee.inviteNumber = inviteCount + 1;
            return Invites.insert(invitee, function (error) {
                if (error) {
                    return console.log(error);
                }
            });
        }
    },
    createTestUsers: function () {
        Accounts.createUser({
             username: faker.internet.userName(),
             email: faker.internet.email(),
             password: "blacksheep",
             profile: {
                dateOfBirth: faker.date.past(),
                picture: faker.image.avatar(),
                name: faker.name.findName(),
                testUser: true
             }
         });
    },
    deleteTestUser: function(id) {
        Meteor.users.remove({_id:id});
    }
});

