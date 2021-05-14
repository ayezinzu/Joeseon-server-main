const { authJwt } = require("../middleware");
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/user.controller");
const multer = require('multer')

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/test/all", controller.allAccess);

  app.get(
    "/api/test/user",
    [authJwt.verifyToken],
    controller.userBoard
  );

  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );
  
  app.get(
    "/api/user",
    [authJwt.verifyToken],
    controller.getUser
  );

  app.route(
    '/api/users/document'
  ).post(
    multer().single('file'),
    [authJwt.verifyToken],
    controller.uploadImage
  );

  app.get(
    "/api/user/document",
    [authJwt.verifyToken],
    controller.getImageUrl
  );

  app.delete(
    "/api/auth/signout",
    [authJwt.verifyToken],
    controller.logout
  );

  app.put(
    "/api/change_password",
    [authJwt.verifyToken,
    verifySignUp.validatePassword],
    controller.changePassword
  );

  app.get(
    "/api/users/:id/document",
    [authJwt.verifyToken,
    authJwt.isModeratorOrAdmin],
    controller.viewDocument)

  app.get(
    "/api/users",
 //   [authJwt.verifyToken,
 //   authJwt.isModeratorOrAdmin],
    controller.getUsers)

  app.post(
    "/api/users/:id/verify",
    [authJwt.verifyToken,
    authJwt.isModerator],
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

  app.get(
    "/api/posts",
    [authJwt.verifyToken],
    controller.viewPosts
  )

  app.get(
    "/api/posts/:id",
    [authJwt.verifyToken],
    controller.getPost
  )



};
