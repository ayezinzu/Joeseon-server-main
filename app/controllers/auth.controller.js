const db = require("../models");
const config = require("../config/auth.config");
const redisConfig = require("../config/redis.config");
const appConfig  = require("../config/app.config");
const Sequelize = require("sequelize");
const User = db.user;
const Role = db.role;
const ResetToken = db.token;

var redis = require('redis');

var redisClient = redis.createClient(process.env.REDIS_URL);

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var crypto = require("crypto");
const nodemailer = require('nodemailer');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(appConfig.SENGRID_KEY)

exports.signup = (req, res) => {
  // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    faction: req.body.faction
  })
    .then(user => {
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });


      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push(roles[i].name);
        }

        redisClient.hmset(token, {"id" :user.id, "username": user.username, "email": user.email});
        redisClient.hgetall(token,function(err,reply) {
            console.log(err);
            console.log(reply);
        });

        res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.forgotPassword = async (req, res) => {
//ensure that you have a user with this email
  var email = await User.findOne({where: { email: req.body.email }});
  console.log(email)
  if (email == null) {
    res.json({status: 'ok'});
  }
    await ResetToken.update({
      used: 1
    },
    {
      where: {
        email: req.body.email
      }
   });
 
  //Create a random reset token
  var token = crypto.randomBytes(64).toString('base64');
 
  //token expires after one hour
  var expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 1/24);
 
  //insert token data into DB
  await ResetToken.create({
    email: req.body.email,
    expiration: expireDate,
    token: token,
    used: 0
  });
 
  //create email
  const message = {
      from: 'krishna.uppili96@gmail.com',
      to: req.body.email,
      subject: 'Forgot Password',
      text: 'To reset your password, please click the link below.\n\n'+appConfig.host+'?token='+encodeURIComponent(token)
  };
 
  //send email
  sgMail
  .send(message)
  .then(() => {
    console.log('Email sent')
    return res.status(200).json({message: "Email Sent"})
  })
  .catch((error) => {
    console.error(error)
    return res.status(402).json({message: error})
  })
 
  //res.json({status: 'ok'});
};

exports.resetPassword = async (req, res) => {
  //compare passwords
  if (req.body.password !== req.body.confirm_password) {
    res.json({status: 'error', message: 'Passwords do not match. Please try again.'});
  }
 
  var record = await ResetToken.findOne({
    where: {
      expiration: { [Op.gt]: Sequelize.fn('CURDATE')},
      token: req.body.token,
      used: 0
    }
  });

  if (record == null) {
    res.json({status: 'error', message: 'Token not found. Please try the reset password process again.'});
  }
  else {

    await ResetToken.update({
      used: 1
    },
    {
      where: {
        email: record.email
      }
    });

    var newPassword = bcrypt.hashSync(req.body.password, 8);

    await User.update({
      password: newPassword
    },
    {
    where: {
      email: record.email
    }
    }).then(result =>
      res.status(200).json({ message: 'Password reset. Please login with your new password.'})
    )
    .catch(err =>
      res.status(400).json({message: err})
    );
  }

};
