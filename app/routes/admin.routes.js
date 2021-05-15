const { authJwt } = require("../middleware");
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/admin.controller");
const multer = require('multer')

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/moderators",
    [authJwt.verifyToken,
    authJwt.isAdmin,
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted,
    verifySignUp.validatePassword
    ],
    controller.signupModerator
  )

  app.put(
    "/api/moderators/:id",
    [authJwt.verifyToken,
    authJwt.isAdmin,
    verifySignUp.checkDuplicateUsernameOrEmail
    ],
    controller.updateModerator
  )

  app.delete(
    "/api/moderators/:id",
    [authJwt.verifyToken,
    authJwt.isAdmin
    ],
    controller.deleteModerator
  )

  app.get(
    "/api/moderators",
    [authJwt.verifyToken,
    authJwt.isAdmin
    ],
    controller.getModerators
  )
}