Meteor.startup(function() {

    var checkUser, i, id, len, results, user, users;

    users = [
     {
        name: "dashboard admin",
        email: "admin@thekeepspace.com",
        password: "password",
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

