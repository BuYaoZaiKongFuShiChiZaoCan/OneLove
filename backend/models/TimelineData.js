const mongoose = require('mongoose');

// TimelineData模型定义
const timelineDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['myPast', 'health', 'myPastData', 'healthData'],
        required: true
    },
    // 直接存储模式（兼容旧版本）
    title: {
        type: String,
        required: false // 改为非必需，因为可能存储在data数组中
    },
    time: {
        type: String,
        required: false
    },
    content: [{
        itemContent: {
            type: String,
            required: false
        }
    }],
    images: [String],
    videos: [String],
    
    // 数组存储模式（新版本）
    data: [{
        _id: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString()
        },
        title: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        content: [{
            itemContent: {
                type: String,
                required: true
            }
        }],
        images: [String],
        videos: [String],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false // 改为非必需，避免验证错误
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // 文档级别的发布者信息
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // 改为非必需
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TimelineData', timelineDataSchema);