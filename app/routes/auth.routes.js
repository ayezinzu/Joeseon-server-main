const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
      verifySignUp.validatePassword
    ],
    controller.signup
  );

  app.post("/api/auth/signin", controller.signin);

  app.post("/api/auth/forgot_password",
    controller.forgotPassword
  );

  app.get("/api/reset_password",
    controller.getResetPassword
  );

  app.post("/api/auth/reset_password",
    [verifySignUp.validatePassword],
     controller.resetPassword
  );

  

};
