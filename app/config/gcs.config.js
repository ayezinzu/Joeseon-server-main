const env = process.env.NODE_ENV;

  const production = {
	google: {
		projectId: 'spherical-bloom-283116',
		keyFilename: "../spherical-bloom-283116-c8a1521b6a20.json",
		bucket: 'remote-test',
	}
  }

  const development =  {
	google: {
		projectId: 'spherical-bloom-283116',
		keyFilename: "../spherical-bloom-283116-c8a1521b6a20.json",
		bucket: 'remote-test',
	}
  }

  const gcsConfig = {
    production,
    development
  };

module.exports = gcsConfig[env];