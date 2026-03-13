const Task = require('../models/task.model');
const { ApiError, ApiResponse } = require('../utils/apiResponse');

const getTasks = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 10, status, priority,
      sortBy = 'createdAt', order = 'desc', search,
    } = req.query;

    const filter = {};

    // Admins can see all tasks, users see only their own
    if (req.user.role !== 'admin') {
      filter.owner = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('owner', 'name email')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Task.countDocuments(filter),
    ]);

    return ApiResponse.paginated(res, tasks, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('owner', 'name email');
    if (!task) return next(new ApiError(404, 'Task not found'));

    // Only owner or admin can view
    if (req.user.role !== 'admin' && task.owner._id.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Access denied'));
    }

    return ApiResponse.success(res, task);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, owner: req.user._id });
    return ApiResponse.success(res, task, 'Task created', 201);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(new ApiError(404, 'Task not found'));

    if (req.user.role !== 'admin' && task.owner.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Access denied'));
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    return ApiResponse.success(res, updated, 'Task updated');
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(new ApiError(404, 'Task not found'));

    if (req.user.role !== 'admin' && task.owner.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Access denied'));
    }

    await task.deleteOne();
    return ApiResponse.success(res, null, 'Task deleted');
  } catch (error) {
    next(error);
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const matchStage = req.user.role === 'admin' ? {} : { owner: req.user._id };

    const stats = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
        },
      },
    ]);

    return ApiResponse.success(res, stats[0] || { total: 0, todo: 0, inProgress: 0, done: 0 });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getTaskStats };
