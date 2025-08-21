// 认证工具函数
// 用于处理登录、登出等认证相关功能

/**
 * 跳转到登录页面，并传递当前页面URL作为返回地址
 * @param {string} customReturnUrl - 自定义返回URL，如果不提供则使用当前页面URL
 */
function redirectToLogin(customReturnUrl = null) {
    const returnUrl = customReturnUrl || window.location.href;
    const loginUrl = `Pages/login.html?returnUrl=${encodeURIComponent(returnUrl)}`;
    window.location.href = loginUrl;
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
function isLoggedIn() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token;
}

/**
 * 获取当前用户的令牌
 * @returns {string|null} 用户令牌
 */
function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
}

/**
 * 获取当前用户信息
 * @returns {object|null} 用户信息
 */
function getUser() {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * 登出用户
 * @param {string} redirectUrl - 登出后跳转的URL，默认为登录页
 */
function logout(redirectUrl = null) {
    // 清除本地存储的认证信息
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // 跳转到指定页面或登录页
    if (redirectUrl) {
        window.location.href = redirectUrl;
    } else {
        redirectToLogin();
    }
}

/**
 * 验证令牌有效性
 * @returns {Promise<boolean>} 令牌是否有效
 */
async function validateToken() {
    const token = getToken();
    if (!token) {
        return false;
    }
    
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('令牌验证失败:', error);
        return false;
    }
}

/**
 * 检查用户权限
 * @param {string|Array} requiredRoles - 需要的角色，可以是单个角色或角色数组
 * @returns {boolean} 是否有权限
 */
function hasPermission(requiredRoles) {
    const user = getUser();
    if (!user) {
        return false;
    }
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
}

/**
 * 需要登录的页面保护函数
 * @param {string} redirectUrl - 未登录时跳转的URL
 */
function requireAuth(redirectUrl = null) {
    if (!isLoggedIn()) {
        redirectToLogin(redirectUrl);
        return false;
    }
    return true;
}

/**
 * 需要特定权限的页面保护函数
 * @param {string|Array} requiredRoles - 需要的角色
 * @param {string} redirectUrl - 无权限时跳转的URL
 */
function requireRole(requiredRoles, redirectUrl = null) {
    if (!requireAuth(redirectUrl)) {
        return false;
    }
    
    if (!hasPermission(requiredRoles)) {
        alert('您没有访问此页面的权限');
        if (redirectUrl) {
            window.location.href = redirectUrl;
        } else {
            window.history.back();
        }
        return false;
    }
    
    return true;
}

// 导出函数供其他页面使用
window.auth = {
    redirectToLogin,
    isLoggedIn,
    getToken,
    getUser,
    logout,
    validateToken,
    hasPermission,
    requireAuth,
    requireRole
};
