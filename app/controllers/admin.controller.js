const db = require("../models");
const Sequelize = require("sequelize");

var bcrypt = require("bcryptjs");
var crypto = require("crypto");
const User = db.user;
const Document = db.document;
const Post = db.post;
const Role = db.role;

const redisConfig = require("../config/redis.config");
const gcsConfig = require("../config/gcs.config")

var redis = require('redis');
const { post } = require("../models");

const Op = db.Sequelize.Op;

exports.signupModerator = (req, res) => {
    // Save Moderator to Database
    User.create({
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
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
              res.send({ message: "Moderator registered successfully!" });
            });
          });
        } else {
          // user role = 1
          user.setRoles([1]).then(() => {
            res.send({ message: "Moderator registered successfully!" });
          });
        }
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };
  
  
exports.updateModerator = async (req,res) => {
    await User.update({
      username: req.body.username,
      email: req.body.email
    },{
    where: {
      id: req.params.id
    }
    }).then(result =>
      res.status(200).json(result)
    )
    .catch(err =>
      res.status(400).json({message: err})
    )
};
  
exports.deleteModerator = async (req,res) => {
    await User.destroy({
    where: {
      id: req.params.id
    }
    }).then(result =>
      res.status(200).json({ message: 'Moderator deleted successfully', post: result})
    )
    .catch(err =>
      res.status(400).json({message: err})
    )
};
  
exports.getModerators = async (req, res) => {
    var response = []
    await User.findAll({
      include: [{
        model: Role, 
        attributes: ['name'], where: { name: ['moderator'] }
      }
     ]
    }).then(users => {
        for(let i=0;i<users.length;i++){
          var user = {}
          user.email = users[i].email
          user.username = users[i].username
          user.id = users[i].id
          user.roles = ['moderator']
          response.push(user)
          if(users.length == response.length)
              res.json(response)
        }
      })
    .catch(error => {
      res.status(400).send({ error: error})
    })
}