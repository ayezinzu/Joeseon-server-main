const env = process.env.NODE_ENV;

  const production = {
    host: "http://localhost:3000/auth/reset-password",//"https://joeseon-dev.herokuapp.com/auth/reset-password",
    SENGRID_KEY: "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"
  }

  const development =  {
    host: "http://localhost:3000/auth/reset-password",
    SENGRID_KEY: "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"
  }

  const appConfig = {
    production,
    development
  };

  module.exports = appConfig[env];
  