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
        enum: ['myPast', 'health'],
        required: true
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
    videos: [String]
}, {
    timestamps: true
});

module.exports = mongoose.model('TimelineData', timelineDataSchema);