const householdService = require("../services/householdService");
const asyncHandler = require("../utils/asyncHandler");

exports.list = asyncHandler(async (req, res) => {
  res.status(200).json(await householdService.list(req.query.q));
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json(await householdService.create(req.body));
});