const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var redis = require('redis');
const multer = require('multer')

const redisConfig = require("./app/config/redis.config");

const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// database
const db = require("./app/models");
const Role = db.role;

db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

var redisClient = redis.createClient(redisConfig.REDIS_URL, {
  tls: {
    rejectUnauthorized: false
  }
});


redisClient.on('ready',function() {
  console.log("Redis is ready");
 });
 
 redisClient.on('error',function() {
  console.log("Error in Redis");
 });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Test application." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.create({
    id: 1,
    name: "user"
  });
 
  Role.create({
    id: 2,
    name: "moderator"
  });
 
  Role.create({
    id: 3,
    name: "admin"
  });
}