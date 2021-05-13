const db = require("../models");
const Sequelize = require("sequelize");

var bcrypt = require("bcryptjs");
var crypto = require("crypto");

const uuid = require('uuid/v4');
const mime = require('mime')
const { Storage }  = require('@google-cloud/storage');
const Multer = require('multer');
const {format} = require('util');

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

const User = db.user;
const Document = db.document

const redisConfig = require("../config/redis.config");
const gcsConfig = require("../config/gcs.config")

var redis = require('redis');

var redisClient = redis.createClient(process.env.REDIS_URL);

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.getUser = function(req,res){
  // Fetch the user by id 
  User.findOne({
   where: {
    id: req.userId
   }
  }).then(function(user){
    var authorities = [];
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        authorities.push(roles[i].name);
      }
      res.status(200).send({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: req.headers["x-access-token"]
      });
    });
  });
}

exports.uploadImage = async (req, res, next) => {
  const type = mime.lookup(req.file.originalname);
  console.log(type)
	const storage = new Storage({
		projectId: gcsConfig.google.projectId,
		keyFilename: "./spherical-bloom-283116-c3d2f8c13036.json",
	});

	const bucket = storage.bucket(gcsConfig.google.bucket);

  const blob = bucket.file(req.userId+'/'+req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', err => {
    next(err);
  });

  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
 
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
    Document.create({
      status: "pending",
      name: req.userId+'/'+req.file.originalname
    })
    .then(document => {
      document.setUser(req.userId).then(() => {
        res.status(200).send({ message: "File uploaded successfully", url: publicUrl, status:document.status });
      });
    });
  });
  blobStream.end(req.file.buffer);
}

exports.getImageUrl = async (req,res)=> {
  const storage = new Storage({
		projectId: gcsConfig.google.projectId,
		keyFilename: "./spherical-bloom-283116-c3d2f8c13036.json",
	});

  const bucket = storage.bucket(gcsConfig.google.bucket);

  Document.findOne({
    where: {
      userId: req.userId
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
}


exports.changePassword = async (req, res) => {
  var newPassword = bcrypt.hashSync(req.body.password, 8);

  await User.update({
    password: newPassword
  },{
  where: {
    id: req.userId
  }
  }).then(result =>
    res.status(200).json({ message: 'Password reset. Please login with your new password.'})
  )
  .catch(err =>
    res.status(400).json({message: err})
  )
}


exports.logout = function(req,res){
  let token = req.body.token || req.query.token || req.headers['authorization'] || req.headers['x-access-token'];
  redisClient.del(token, function(err, response) {
      if (response == 1) {
         console.log("Deleted Successfully!")
         res.status(200).send({"message": "User logged out successfully"});
      } else{
       console.log("Cannot delete")
       res.status(400).send({"success": false, "message": "Token not deleted"});
      }
   })
}

