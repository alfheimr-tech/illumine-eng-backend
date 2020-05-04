const jwt = require('jsonwebtoken');
const Engineer = require('../models/engineer_model');

const auth = async function(req, res, next) {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const engnr = await Engineer.findOne({
      _id: decoded._id,
      tokens: { $in: [token] }
    }).orFail(new Error('no user found'));

    req.engnr = engnr;
    req.profession = req.engnr.profession;
    req.token = token;

    next();
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

module.exports = auth;
