
const gcsConfig = require("../config/gcs.config")
const { Storage }  = require('@google-cloud/storage');

module.exports = {
   async getGcsSignedUrl(document){
        const storage = new Storage({
            projectId: gcsConfig.google.projectId,
            keyFilename: "./spherical-bloom-283116-c3d2f8c13036.json",
        });
        const bucket = storage.bucket(gcsConfig.google.bucket);
        file = bucket.file(document)
        var url = new Object();
        await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 15 * 60 * 1000
                }).then(signedUrls => {
                    console.log(signedUrls[0]);
                    url.status = 200;
                    url.name = signedUrls[0];
                })
                .catch(error => {
                    url.status = 401;
                    url.name = error;
                })
        return url;
    }
}