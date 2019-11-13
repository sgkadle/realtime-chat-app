module.exports.allRoutes = function (app, models) {

  const users = require('./users')(app, models);

  app.route('/api/newUser')
     .post(users.newUser);

}