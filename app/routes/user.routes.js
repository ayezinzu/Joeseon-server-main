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
  
  app.get(
    "/api/user",
    [authJwt.verifyToken],
    controller.getUser
  );

  app.route(
    '/api/user/document'
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
