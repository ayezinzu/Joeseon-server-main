const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const redisConfig = require("../config/redis.config");
const db = require("../models");
const User = db.user;

var redis = require('redis');

var redisClient = redis.createClient(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false
  }
});


//Token verification callback function


verifyToken = (req,res,next) => {
    console.log("Entered verify Token");
    let token = req.body.token || req.query.token || req.headers['authorization'] || req.params.token || req.headers['x-access-token'];
      if (token) {
        redisClient.exists(token,function(err,reply) {
            if(!err) {
             if(reply) {
              console.log("Key exists");
              // verifies secret and checks exp
              jwt.verify(token, config.secret, function(err, decoded) {
              if (err) { //failed verification.
                return res.status(401).send({"message": "Invalid Token"});
              }else{
                req.userId = decoded.id
                console.log("verified");
                next(); //no error, proceed
              } 
            });     
            }else {
              console.log("Token Expired or Invalid Token");
              res.status(401).send({"message": "Token Expired or Invalid Token"});
             }
            }             
          });
      } else {
          // forbidden without token
	    console.log("Token Missing");
          res.status(401).send({"message" : "Token Missing"});
      }
  }

isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Admin Role!"
      });
      return;
    });
  });
};

isModerator = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Moderator Role!"
      });
    });
  });
};

isModeratorOrAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "moderator") {
          next();
          return;
        }

        if (roles[i].name === "admin") {
          next();
          return;
        }
      }

      res.status(403).send({
        message: "Require Moderator or Admin Role!"
      });
    });
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isModerator: isModerator,
  isModeratorOrAdmin: isModeratorOrAdmin
};
module.exports = authJwt;
