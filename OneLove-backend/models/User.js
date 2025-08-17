// ========================================
// 用户数据模型 (User Model)
// ========================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 用户模式定义
const userSchema = new mongoose.Schema({
	// 基本信息
	username: {
		type: String,
		required: [true, '用户名是必需的'],
		unique: true,
		trim: true,
		minlength: [3, '用户名至少3个字符'],
		maxlength: [20, '用户名最多20个字符']
	},

	email: {
		type: String,
		required: [true, '邮箱是必需的'],
		unique: true,
		lowercase: true,
		trim: true,
		match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
	},

	password: {
		type: String,
		required: [true, '密码是必需的'],
		minlength: [6, '密码至少6个字符']
	},

	// 用户状态
	isActive: {
		type: Boolean,
		default: true
	},

	// 用户角色
	role: {
		type: String,
		enum: ['user', 'admin', 'developer'],
		default: 'user'
	},

	// 用户资料
	profile: {
		avatar: {
			type: String,
			default: ''
		},
		bio: {
			type: String,
			maxlength: [200, '个人简介最多200个字符']
		},
		phone: {
			type: String,
			match: [/^1[3-9]\d{9}$/, '请输入有效的手机号码']
		}
	},

	// 密码重置相关字段
	resetPasswordToken: {
		type: String,
		default: null
	},
	resetPasswordExpires: {
		type: Date,
		default: null
	},

	// 时间戳
	lastLogin: {
		type: Date,
		default: Date.now
	}
}, {
	timestamps: true, // 自动添加 createdAt 和 updatedAt
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// 虚拟字段：用户年龄（基于创建时间）
userSchema.virtual('age').get(function () {
	const now = new Date();
	const created = this.createdAt;
	return Math.floor((now - created) / (365.25 * 24 * 60 * 60 * 1000));
});

// 密码加密中间件（保存前执行）
userSchema.pre('save', async function (next) {
	// 只有在密码被修改时才重新加密
	if (!this.isModified('password')) {
		return next();
	}

	try {
		// 生成盐值并加密密码
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// 密码验证方法
userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// 获取用户公开信息（不包含密码）
userSchema.methods.toPublicJSON = function () {
	const user = this.toObject();
	delete user.password;
	return user;
};

// 更新最后登录时间
userSchema.methods.updateLastLogin = function () {
	this.lastLogin = new Date();
	return this.save();
};

// 创建用户模型
const User = mongoose.model('User', userSchema);

module.exports = User; 