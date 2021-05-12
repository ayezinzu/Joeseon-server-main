module.exports = (sequelize, Sequelize) => {
  const ResetToken = sequelize.define("reset_token", {
    email: {
      type: Sequelize.STRING
    },
    token: {
      type: Sequelize.STRING
    },
    expiration: {
      type: Sequelize.DATE
    },
    used: {
      type: Sequelize.INTEGER
    }
  });

  return ResetToken;
};
