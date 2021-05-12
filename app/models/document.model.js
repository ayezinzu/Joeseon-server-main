module.exports = (sequelize, Sequelize) => {
    const Document = sequelize.define("documents", {
      status: {
        type: Sequelize.ENUM,
        values: ["pending", "verified", "rejected"]
      },
      name: {
        type: Sequelize.STRING
      }
    });
  
    return Document;
  };