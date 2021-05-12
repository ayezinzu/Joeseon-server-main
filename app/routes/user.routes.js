const { authJwt } = require("../middleware");
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

  app.route('/api/user/document').post(multer().single('file'),
  [authJwt.verifyToken],
  controller.uploadImage
  );

  app.get(
    "/api/user/document",
    [authJwt.verifyToken],
    controller.getImageUrl
  );

  app.post("/api/logout",
  [authJwt.verifyToken],
    controller.logout);

  app.put("/api/change_password",
  [authJwt.verifyToken],
    controller.changePassword);

};
