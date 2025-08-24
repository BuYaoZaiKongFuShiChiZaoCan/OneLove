// ========================================
// 用户数据模型 (UserData Model)
// 用于存储用户的密码、手机号、笔记等数据
// ========================================

const mongoose = require('mongoose');

// 用户数据模式定义
const userDataSchema = new mongoose.Schema({
  // 关联用户
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必需的']
  },
  
  // 数据类型
  dataType: {
    type: String,
    required: [true, '数据类型是必需的'],
    enum: ['passwords', 'phones', 'notes', 'changelog', 'other'],
    default: 'other'
  },
  
   name: {
    type: String,
    required: [true, '数据名称是必需的'],
    trim: true
  },
  
  // 数据内容（灵活存储）
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, '数据内容是必需的']
  },
  
  // 数据描述
  description: {
    type: String,
    maxlength: [500, '描述最多500个字符']
  },
  
  // 数据状态
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  
  // 数据标签
  tags: [{
    type: String,
    trim: true
  }],
  
  // 数据优先级
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // 是否加密存储
  isEncrypted: {
    type: Boolean,
    default: false
  },
  
  // 访问权限
  accessLevel: {
    type: String,
    enum: ['private', 'shared', 'public'],
    default: 'private'
  }
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段：数据年龄
userDataSchema.virtual('age').get(function() {
  const now = new Date();
  const created = this.createdAt;
  return Math.floor((now - created) / (24 * 60 * 60 * 1000)); // 天数
});

// 索引优化查询性能
userDataSchema.index({ userId: 1, dataType: 1 });
userDataSchema.index({ userId: 1, status: 1 });
userDataSchema.index({ tags: 1 });

// 数据验证中间件
userDataSchema.pre('save', function(next) {
  // 确保数据名称不为空
  if (!this.name || this.name.trim() === '') {
    return next(new Error('数据名称不能为空'));
  }
  
  // 确保内容不为空
  if (!this.content || (typeof this.content === 'object' && Object.keys(this.content).length === 0)) {
    return next(new Error('数据内容不能为空'));
  }
  
  next();
});

// 获取用户数据的方法
userDataSchema.statics.findByUserAndType = function(userId, dataType) {
  return this.find({ userId, dataType, status: 'active' }).sort({ priority: -1, createdAt: -1 });
};

// 获取用户所有数据的方法
userDataSchema.statics.findByUser = function(userId) {
  return this.find({ userId, status: 'active' }).sort({ dataType: 1, priority: -1, createdAt: -1 });
};

// 搜索用户数据的方法
userDataSchema.statics.searchUserData = function(userId, searchTerm) {
  return this.find({
    userId,
    status: 'active',
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  }).sort({ priority: -1, createdAt: -1 });
};

// 创建用户数据模型
const UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData; 