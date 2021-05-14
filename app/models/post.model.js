module.exports = (sequelize, Sequelize) => {
    const Post = sequelize.define("posts", {
        title: {
            type: Sequelize.TEXT,
            allowNull: false
          }, 
        content: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });
  
    return Post;
  };