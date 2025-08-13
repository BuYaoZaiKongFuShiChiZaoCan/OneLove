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
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

// 更新时间戳
changelogSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});

module.exports = mongoose.model('Changelog', changelogSchema); 