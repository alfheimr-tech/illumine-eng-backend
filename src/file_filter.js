const multer = require('multer');
const AWS = require('aws-sdk');

exports.upload_pic = multer({
  limits: {
    fileSize: 2000000
  },

  fileFilter(req, file, callback) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      return callback(new Error('Please upload either a png or jpg file'));
    }

    callback(undefined, true);
  }
});

exports.upload_docs = () => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  });

  return s3;
};
