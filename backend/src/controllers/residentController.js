const residentService = require("../services/residentService");
const asyncHandler = require("../utils/asyncHandler");

exports.list = asyncHandler(async (req, res) => {
  res.status(200).json(await residentService.list(req.query.householdId));
});

exports.create = asyncHandler(async (req, res) => {
  res.status(201).json(await residentService.create(req.body));
});

exports.update = asyncHandler(async (req, res) => {
  res.status(200).json(await residentService.update(req.params.id, req.body));
});
