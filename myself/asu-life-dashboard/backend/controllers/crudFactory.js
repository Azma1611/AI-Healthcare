import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { normalizeItem, normalizeList } from '../utils/normalize.js';

export const makeCrudController = (Model, options = {}) => ({
  getAll: asyncHandler(async (req, res) => {
    const items = await Model.find({ owner: req.user._id }).sort(options.sort || { createdAt: -1 });
    res.json({ success: true, data: normalizeList(items) });
  }),

  create: asyncHandler(async (req, res) => {
    const item = await Model.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, data: normalizeItem(item) });
  }),

  getOne: asyncHandler(async (req, res) => {
    const item = await Model.findOne({ _id: req.params.id, owner: req.user._id });
    if (!item) throw new ApiError('Item not found', 404);
    res.json({ success: true, data: normalizeItem(item) });
  }),

  update: asyncHandler(async (req, res) => {
    const item = await Model.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) throw new ApiError('Item not found', 404);
    res.json({ success: true, data: normalizeItem(item) });
  }),

  remove: asyncHandler(async (req, res) => {
    const item = await Model.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!item) throw new ApiError('Item not found', 404);
    res.json({ success: true, data: { id: req.params.id } });
  }),
});
