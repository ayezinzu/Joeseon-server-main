const env = process.env.NODE_ENV;
console.log(env)

  const production = {
    HOST: "us-cdbr-east-03.cleardb.com",
    USER: "bb22fb02aebba2",
    PASSWORD: "425615b4",
    DB: "heroku_3fd00724f0d0307",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }

  const development =  {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "mysql",
    DB: "testdb",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }

  const dbConfig = {
    production,
    development
  };

module.exports = dbConfig[env];