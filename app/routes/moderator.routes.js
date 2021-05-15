const { authJwt } = require("../middleware");
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/moderator.controller");
const multer = require('multer')

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/users",
    [authJwt.verifyToken,
    authJwt.isModeratorOrAdmin],
    controller.getUsers)

  
  app.get(
    "/api/users/:id/document",
    [authJwt.verifyToken,
    authJwt.isModeratorOrAdmin],
    controller.viewDocument)

  app.post(
    "/api/users/:id/verify",
    [authJwt.verifyToken,
    authJwt.isModeratorOrAdmin],
    controller.verifyUser
  )

  app.post(
    "/api/posts",
    [authJwt.verifyToken,
    authJwt.isModeratorOrAdmin],
    controller.createPost
  )

  app.put(
    "/api/posts/:id",
    [authJwt.verifyToken,
    authJwt.isModeratorOrAdmin],
    controller.updatePost
  )
  
  app.delete(
    "/api/posts/:id",
    [authJwt.verifyToken,
    authJwt.isModeratorOrAdmin],
    controller.deletePost
  )

}
