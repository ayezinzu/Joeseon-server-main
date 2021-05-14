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

const redisConfig = require("../config/redis.config");
const gcsConfig = require("../config/gcs.config")

var redis = require('redis');
const { post } = require("../models");

var redisClient = redis.createClient(redisConfig.REDIS_URL);

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
 
  Document.findOne({
    where: {
      userId: req.userId
    }
  })
  .then(document => {
    if (!document) {
      return res.status(200).send({ message: "File not uploaded yet", status: "not_uploaded" });
    }else {
      (async function(){
        const imageUrl = await gcs.getGcsSignedUrl(document.name)
        console.log(imageUrl);
        res.status(imageUrl.status).send({ url: imageUrl.name  , status: document.status });
      })()
    };
  });
}

exports.getUsers = async (req, res) => {
  var response = []
  await User.findAll({
    include: [{
      model: Document
    }]
  }).then(users => {
    for(let i=0;i<users.length;i++){
      var user = {}
      user.email = users[i].email
      user.username = users[i].username
      user.userId = users[i].id
        if (users[i].document!=null){  
            user.document_status = users[i].document.status
            console.log(user)  
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
      userId: req.body.userId
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

exports.verifyUser = async (req,res) => {
  await Document.update({
    status: req.body.status
  },{
  where: {
    userId: req.body.userId
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
}

exports.updatePost = async (req,res) => {
  await Post.update({
    title: req.body.title,
    content: req.body.content
  },{
  where: {
    id: req.body.id
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
    id: req.body.Id
  }
  }).then(result =>
    res.status(200).json({ message: 'Post updated successfully', post: result})
  )
  .catch(err =>
    res.status(400).json({message: err})
  )
};

exports.viewPosts = async (req, res) => {
  var response = []
  await Post.findAll()
  .then(posts => {
        res.json(posts)
  })
  .catch(error => {
    res.status(400).send({ error: error})
  })
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

