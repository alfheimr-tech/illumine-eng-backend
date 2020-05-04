const multer = require('multer');

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
