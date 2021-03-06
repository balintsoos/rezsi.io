const httpStatus = require('http-status');
const debug = require('debug')('API:auth.controller');

const auth = require('./auth');
const User = require('../../modules/user/user.model');

async function generateToken(req, res) {
  if (!req.body.email || !req.body.password) {
    debug('PAYLOAD_VALIDATION_FAILED');
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  let user;

  try {
    user = await User
      .findOne({
        email: req.body.email,
        disabled: false,
        confirmed: true,
      })
      .populate('group')
      .exec();
  } catch (err) {
    debug('DB_FIND_FAILED %O', err);
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  if (!user) {
    debug('CANNOT_FIND_USER');
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  const result = await user.comparePassword(req.body.password);

  if (result === false) {
    debug('PASSWORD_NOT_MATCH');
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  return res.json({
    user: user.isLeader() ? user.getPayload() : user.getLargePayload(),
    token: auth.createToken(user.getPayload()),
  });
}

function getUser(req, res) {
  if (!req.user) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  const payload = req.user.isLeader()
    ? req.user.getPayload()
    : req.user.getLargePayload();

  return res.json(payload);
}

module.exports = {
  generateToken,
  getUser,
};
