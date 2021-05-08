const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    where: {
      username: req.body.username
    }
  }).then(user => {
    if (user) {
      res.status(400).send({
        message: "Failed! Username is already in use!"
      });
      return;
    }

    // Email
    User.findOne({
      where: {
        email: req.body.email
      }
    }).then(user => {
      if (user) {
        res.status(400).send({
          message: "Failed! Email is already in use!"
        });
        return;
      }

      next();
    });
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i]
        });
        return;
      }
    }
  }
  
  next();
};

validatePassword = (req, res, next) => {
  console.log(req.body.password)
  var strongPasswordRegex = new RegExp("^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  if(!strongPasswordRegex.test(req.body.password)) {
    res.status(400).send({ message: 'The password must contain at least 8 characters including at least one number and one special character.'});
    return;
  }
  next();
};

const verifySignUp = {
checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
checkRolesExisted: checkRolesExisted,
validatePassword: validatePassword
};

module.exports = verifySignUp;
