const AccessLog = require('../models/AccessLog');

// 记录访问日志
const logAccess = async (req, action, resource, details = {}, status = 'SUCCESS', errorMessage = null) => {
    try {
        if (!req.user) {
            return; // 未登录用户不记录
        }

        const logData = {
            userId: req.user._id,
            action: action,
            resource: resource,
            details: details,
            ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            status: status,
            errorMessage: errorMessage,
            timestamp: new Date()
        };

        await AccessLog.create(logData);
    } catch (error) {
        console.error('记录访问日志失败:', error);
    }
};

// 日志中间件
const loggerMiddleware = (action, resource) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(data) {
            const status = res.statusCode >= 400 ? 'FAILED' : 'SUCCESS';
            const errorMessage = res.statusCode >= 400 ? data : null;
            
            logAccess(req, action, resource, {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                responseSize: data ? data.length : 0
            }, status, errorMessage);
            
            originalSend.call(this, data);
        };
        
        next();
    };
};

// 安全审计中间件
const securityAudit = async (req, res, next) => {
    // 检查可疑活动
    const suspiciousPatterns = [
        /script/i,
        /javascript/i,
        /<.*>/i,
        /union.*select/i,
        /drop.*table/i
    ];
    
    const requestBody = JSON.stringify(req.body);
    const requestQuery = JSON.stringify(req.query);
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestBody) || pattern.test(requestQuery)) {
            await logAccess(req, 'SECURITY_ALERT', req.originalUrl, {
                pattern: pattern.toString(),
                body: requestBody,
                query: requestQuery
            }, 'ERROR', '检测到可疑活动');
            
            return res.status(403).json({
                success: false,
                message: '检测到可疑活动，请求被拒绝'
            });
        }
    }
    
    next();
};

// 获取用户访问统计
const getUserAccessStats = async (userId, days = 7) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const stats = await AccessLog.aggregate([
            {
                $match: {
                    userId: userId,
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        action: '$action',
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
                    },
                    count: { $sum: 1 },
                    successCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] }
                    },
                    failedCount: {
                        $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { '_id.date': -1, '_id.action': 1 }
            }
        ]);
        
        return stats;
    } catch (error) {
        console.error('获取访问统计失败:', error);
        return [];
    }
};

module.exports = {
    logAccess,
    loggerMiddleware,
    securityAudit,
    getUserAccessStats
}; 