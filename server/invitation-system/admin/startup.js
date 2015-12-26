Meteor.startup(function () {

    Accounts.emailTemplates.from = 'admin@thekeepspace.com';
    Accounts.emailTemplates.siteName = 'thekeepspace';

    var checkUser, i, id, len, results, user, users;

    users = [
        {
            name: "Keepspace  Administrator",
            email: "admin@thekeepspace.com",
            password: "rashdoggystyle",
            roles: ['admin']
        }
    ];
    results = [];
    for (i = 0, len = users.length; i < len; i++) {
        user = users[i];
        checkUser = Meteor.users.findOne({
            "emails.address": user.email
        });
        if (!checkUser) {
            id = Accounts.createUser({
                email: user.email,
                password: user.password,
                profile: {
                    name: user.name
                }
            });
            if (user.roles.length > 0) {
                results.push(Roles.addUsersToRoles(id, user.roles));
            } else {
                results.push(void 0);
            }
        } else {
            results.push(void 0);
        }
    }
    return results;
});

