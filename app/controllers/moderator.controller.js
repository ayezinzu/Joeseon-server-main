const db = require("../models");
const Sequelize = require("sequelize");

var bcrypt = require("bcryptjs");
var crypto = require("crypto");

const uuid = require('uuid/v4');
const mime = require('mime')
const { Storage }  = require('@google-cloud/storage');
const Multer = require('multer');
const {format} = require('util');
const gcs  = require("../helpers/gcs")

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

const User = db.user;
const Document = db.document;
const Post = db.post;
const Role = db.role;

const redisConfig = require("../config/redis.config");
const gcsConfig = require("../config/gcs.config")

var redis = require('redis');
const { post } = require("../models");

var redisClient = redis.createClient(process.env.REDIS_URL);

exports.getUsers = async (req, res) => {
    var response = []
    await User.findAll({
      include: [{
        model: Role, 
        attributes: ['name'], where: { name: ['user'] }
      },
      {
        model: Document
      }
     ]
    }).then(users => {
      console.log(users)
      for(let i=0;i<users.length;i++){
        var user = {}
        user.email = users[i].email
        user.username = users[i].username
        user.id = users[i].id
        console.log(users[i].document)
        if (users[i].document!=null){  
            user.document_status = users[i].document.status
            console.log(users[i].document)  
          }
        else{
          user.document_status = "not_uploaded"      
        }
        response.push(user)
        if(users.length == response.length)
            res.json(response)
      }
    })
    .catch(error => {
      res.status(400).send({ error: error})
    })
  }
  
exports.viewDocument = async (req,res)=> {
    const storage = new Storage({
          projectId: gcsConfig.google.projectId,
          keyFilename: "./spherical-bloom-283116-c3d2f8c13036.json",
      });
  
    const bucket = storage.bucket(gcsConfig.google.bucket);
  
    Document.findOne({
      where: {
        userId: req.params.id
      }
    })
    .then(document => {
      if (!document) {
        return res.status(200).send({ message: "File not uploaded yet", status: "not_uploaded" });
      }else {
        file = bucket.file(document.name)
        return file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 15 * 60 * 1000
        }).then(signedUrls => {
          console.log(signedUrls[0]);
          res.status(200).send({ url:  signedUrls[0], status: document.status }); 
        });
      }
    });
};
  
exports.verifyUser = async (req,res) => {
    await Document.update({
      status: req.body.status
    },{
    where: {
      userId: req.params.id
    }
    }).then(result =>
      res.status(200).json({ message: 'Status updated successfully'})
    )
    .catch(err =>
      res.status(400).json({message: err})
    )
};

exports.createPost = async (req,res) => {
    await Post.create({
      title: req.body.title,
      content: req.body.content
    })
    .then(post => {
        res.status(200).json(post);
      })
    .catch(error => {
      res.status(400).send({message: error});
    });
};
  
exports.updatePost = async (req,res) => {
    await Post.update({
      title: req.body.title,
      content: req.body.content
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
  
exports.deletePost = async (req,res) => {
    await Post.destroy({
    where: {
      id: req.params.id
    }
    }).then(result =>
      res.status(200).json({ message: 'Post updated successfully', post: result})
    )
    .catch(err =>
      res.status(400).json({message: err})
    )
};