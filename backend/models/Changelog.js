const mongoose = require('mongoose');

const changelogItemSchema = new mongoose.Schema({
	itemTime: {
		type: String,
		default: ''
	},
	itemContent: {
		type: String,
		required: true
	}
});

const changelogSchema = new mongoose.Schema({
	version: {
		type: String,
		required: true,
		unique: true
	},
	order: {
		type: Number,
		default: 0
	},
	time: {
		type: String,
		default: ''
	},
	content: [changelogItemSchema],
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	updatedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

// 在校验前进行容错处理，确保 order 为有效数字
changelogSchema.pre('validate', function (next) {
  try {
    const value = this.order;
    const num = Number(value);
    if (Number.isFinite(num)) {
      this.order = num;
    } else {
      this.order = 0;
    }
  } catch (_) {
    this.order = 0;
  }
  next();
});

// 更新时间戳
changelogSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});

module.exports = mongoose.model('Changelog', changelogSchema); 