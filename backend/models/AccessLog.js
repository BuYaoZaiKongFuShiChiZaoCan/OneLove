const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN', 'LOGOUT', 'CREATE_PASSWORD', 'UPDATE_PASSWORD', 'DELETE_PASSWORD',
            'CREATE_PHONE', 'UPDATE_PHONE', 'DELETE_PHONE', 'EXPORT_DATA', 'IMPORT_DATA',
            'CREATE_BACKUP', 'RESTORE_BACKUP', 'DELETE_BACKUP', 'VIEW_STATS', 'VIEW_LOGS',
            'VIEW_BACKUPS', 'ADMIN_ACTION', 'SECURITY_ALERT'
        ]
    },
    resource: {
        type: String,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'ERROR'],
        default: 'SUCCESS'
    },
    errorMessage: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// 索引优化
accessLogSchema.index({ userId: 1, timestamp: -1 });
accessLogSchema.index({ action: 1, timestamp: -1 });
accessLogSchema.index({ status: 1, timestamp: -1 });

// 自动清理旧日志（保留30天）
accessLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('AccessLog', accessLogSchema); 