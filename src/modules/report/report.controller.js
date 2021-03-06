const httpStatus = require('http-status');

const Report = require('./report.model');

async function create(req, res) {
  const { hotWater, coldWater, heat } = req.body;

  let report = new Report({
    user: req.user.id,
    hotWater,
    coldWater,
    heat,
  });

  try {
    report = await report.save();
  } catch (err) {
    return res.status(httpStatus.BAD_REQUEST).json(err);
  }

  return res.status(httpStatus.CREATED).json(report.getPayload());
}

async function getAllOfMember(req, res) {
  let reports;

  try {
    reports = await Report
      .find({ user: req.member.id })
      .sort({ createdAt: -1 })
      .exec();
  } catch (err) {
    return res.status(httpStatus.BAD_REQUEST).json(err);
  }

  return res.json(reports.map(report => report.getPayload()));
}

module.exports = {
  create,
  getAllOfMember,
};
