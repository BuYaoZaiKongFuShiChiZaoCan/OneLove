const crypto = require('crypto');

// 加密密钥（实际项目中应该从环境变量获取）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'onelove-secure-key-2025';
const ALGORITHM = 'aes-256-cbc';

class Encryption {
    // 生成加密密钥
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    // 加密数据
    static encrypt(text) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return {
                encrypted: encrypted,
                iv: iv.toString('hex')
            };
        } catch (error) {
            console.error('加密失败:', error);
            return null;
        }
    }

    // 解密数据
    static decrypt(encryptedData, iv) {
        try {
            const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            console.error('解密失败:', error);
            return null;
        }
    }

    // 加密对象
    static encryptObject(obj) {
        try {
            const jsonString = JSON.stringify(obj);
            return this.encrypt(jsonString);
        } catch (error) {
            console.error('对象加密失败:', error);
            return null;
        }
    }

    // 解密对象
    static decryptObject(encryptedData, iv) {
        try {
            const decryptedString = this.decrypt(encryptedData, iv);
            if (decryptedString) {
                return JSON.parse(decryptedString);
            }
            return null;
        } catch (error) {
            console.error('对象解密失败:', error);
            return null;
        }
    }

    // 生成哈希值
    static hash(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

    // 生成随机盐值
    static generateSalt() {
        return crypto.randomBytes(16).toString('hex');
    }

    // 使用盐值哈希
    static hashWithSalt(text, salt) {
        return crypto.createHash('sha256').update(text + salt).digest('hex');
    }
}

module.exports = Encryption; 