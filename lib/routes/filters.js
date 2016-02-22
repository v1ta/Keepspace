/*
 Route Filters NOT WORKING ATM
 Filters for managing user access to application routes.
 */

var checkUserLoggedIn, userAuthenticatedAdmin, userAuthenticatedBetaTester;
/*
 Filter: Check if a User is Logged In
 If a user is not logged in and attempts to go to an authenticated route,
 re-route them to the index/beta signup screen.
 */
checkUserLoggedIn = function () {
    if (!Meteor.loggingIn() && !Meteor.user()) {
        return Router.go('/');
    } else {
        return this.next();
    }
};

/*
 Filter: Check if a Beta Tester User Exists
 If a user is logged in and attempts to go to a public route, re-route
 them to the main dashboard screen.
 */
userAuthenticatedBetaTester = function () {
    var isBetaTester, loggedInUser;
    loggedInUser = Meteor.user();
    isBetaTester = Roles.userIsInRole(loggedInUser, ['tester']);
    if (!Meteor.loggingIn() && isBetaTester) {
        return Router.go('/');
    } else {
        return this.next();
    }
};

/*
 Filter: Check if an Admin User Exists
 If a user is logged in and attempts to go to a public route, re-route
 them to the main invites screen.
 */
userAuthenticatedAdmin = function () {
    var isAdmin, loggedInUser;
    loggedInUser = Meteor.user();
    isAdmin = Roles.userIsInRole(loggedInUser, ['admin']);
    if (!Meteor.loggingIn() && isAdmin) {
        return Router.go('/invites');
    } else {
        return this.next();
    }
};

/*
 //will fix names once it's fully functional
 Router.onBeforeAction(checkUserLoggedIn, {
 except: ['index', 'splash', 'loginPage']
 });

 Router.onBeforeAction(userAuthenticatedBetaTester, {
 except: ['invites']
 });

 Router.onBeforeAction(userAuthenticatedAdmin, {
 except: []
 });

 */