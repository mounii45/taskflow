const User = require('../models/user.model');
const Task = require('../models/task.model');
const { ApiError, ApiResponse } = require('../utils/apiResponse');

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(filter),
    ]);

    return ApiResponse.paginated(res, users, {
      page: parseInt(page), limit: parseInt(limit), total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ApiError(404, 'User not found'));
    return ApiResponse.success(res, user.toPublicJSON());
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const userId = req.params.id || req.user._id;

    // Non-admins can only update themselves
    if (req.user.role !== 'admin' && userId.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Access denied'));
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { name, email } },
      { new: true, runValidators: true }
    );
    if (!user) return next(new ApiError(404, 'User not found'));

    return ApiResponse.success(res, user.toPublicJSON(), 'User updated');
  } catch (error) {
    next(error);
  }
};

const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return next(new ApiError(404, 'User not found'));
    return ApiResponse.success(res, null, 'User deactivated');
  } catch (error) {
    next(error);
  }
};

const promoteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: 'admin' }, { new: true });
    if (!user) return next(new ApiError(404, 'User not found'));
    return ApiResponse.success(res, user.toPublicJSON(), 'User promoted to admin');
  } catch (error) {
    next(error);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    const [userStats, taskStats] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
    ]);
    return ApiResponse.success(res, { userStats, taskStats });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deactivateUser, promoteUser, getAdminStats };
