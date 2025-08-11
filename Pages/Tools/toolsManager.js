// 工具数据管理脚本
// 支持自动化更新工具数据，包括开发状态、使用统计、版本信息等

class ToolsManager {
    constructor() {
        this.toolsData = null;
        this.toolsListPath = './Tools list.json';
        this.categoryListPath = './categoryList.json';
    }

    // 加载工具数据
    async loadToolsData() {
        try {
            const response = await fetch(this.toolsListPath);
            this.toolsData = await response.json();
            return this.toolsData;
        } catch (error) {
            console.error('加载工具数据失败:', error);
            return null;
        }
    }

    // 保存工具数据
    async saveToolsData() {
        try {
            // 更新元数据
            this.toolsData.metadata.lastUpdated = new Date().toISOString().split('T')[0];
            this.toolsData.metadata.totalTools = this.toolsData.Tools.length;
            
            // 计算统计数据
            this.updateStatistics();
            
            // 在实际环境中，这里会保存到文件
            console.log('工具数据已更新:', this.toolsData);
            return true;
        } catch (error) {
            console.error('保存工具数据失败:', error);
            return false;
        }
    }

    // 更新工具使用统计
    updateToolUsage(toolId) {
        if (!this.toolsData) return false;
        
        const tool = this.toolsData.Tools.find(t => t.id === toolId);
        if (tool) {
            tool.statistics.usageCount++;
            tool.statistics.lastUsed = new Date().toISOString();
            this.saveToolsData();
            return true;
        }
        return false;
    }

    // 更新工具评分
    updateToolRating(toolId, rating) {
        if (!this.toolsData) return false;
        
        const tool = this.toolsData.Tools.find(t => t.id === toolId);
        if (tool) {
            tool.statistics.rating = rating;
            this.saveToolsData();
            return true;
        }
        return false;
    }

    // 更新工具开发状态
    updateToolStatus(toolId, status) {
        if (!this.toolsData) return false;
        
        const tool = this.toolsData.Tools.find(t => t.id === toolId);
        if (tool) {
            tool.status = { ...tool.status, ...status };
            tool.status.lastUpdated = new Date().toISOString().split('T')[0];
            this.saveToolsData();
            return true;
        }
        return false;
    }

    // 添加新工具
    addTool(toolData) {
        if (!this.toolsData) return false;
        
        const newId = Math.max(...this.toolsData.Tools.map(t => t.id)) + 1;
        const newTool = {
            id: newId,
            ...toolData,
            status: {
                development: "development",
                lastUpdated: new Date().toISOString().split('T')[0],
                version: "0.1.0",
                maintenance: "active"
            },
            statistics: {
                usageCount: 0,
                lastUsed: null,
                rating: 0,
                downloads: 0
            },
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        
        this.toolsData.Tools.push(newTool);
        this.saveToolsData();
        return newId;
    }

    // 删除工具
    removeTool(toolId) {
        if (!this.toolsData) return false;
        
        const index = this.toolsData.Tools.findIndex(t => t.id === toolId);
        if (index !== -1) {
            this.toolsData.Tools.splice(index, 1);
            this.saveToolsData();
            return true;
        }
        return false;
    }

    // 更新统计信息
    updateStatistics() {
        if (!this.toolsData) return;
        
        const stats = this.toolsData.metadata.statistics;
        stats.totalUsage = this.toolsData.Tools.reduce((sum, tool) => sum + tool.statistics.usageCount, 0);
        stats.averageRating = this.toolsData.Tools.reduce((sum, tool) => sum + tool.statistics.rating, 0) / this.toolsData.Tools.length;
        
        // 找到最受欢迎的工具
        const mostPopular = this.toolsData.Tools.reduce((max, tool) => 
            tool.statistics.usageCount > max.statistics.usageCount ? tool : max
        );
        stats.mostPopular = mostPopular ? mostPopular.name : null;
        
        // 最近使用的工具
        stats.recentlyUsed = this.toolsData.Tools
            .filter(tool => tool.statistics.lastUsed)
            .sort((a, b) => new Date(b.statistics.lastUsed) - new Date(a.statistics.lastUsed))
            .slice(0, 5)
            .map(tool => tool.name);
    }

    // 获取工具列表
    getToolsList() {
        return this.toolsData ? this.toolsData.Tools : [];
    }

    // 根据分类获取工具
    getToolsByCategory(categoryName) {
        if (!this.toolsData) return [];
        return this.toolsData.Tools.filter(tool => 
            tool.category.name === categoryName
        );
    }

    // 搜索工具
    searchTools(keyword) {
        if (!this.toolsData) return [];
        const lowerKeyword = keyword.toLowerCase();
        return this.toolsData.Tools.filter(tool => 
            tool.name.toLowerCase().includes(lowerKeyword) ||
            tool.description.toLowerCase().includes(lowerKeyword) ||
            tool.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
        );
    }

    // 获取工具详情
    getToolDetails(toolId) {
        if (!this.toolsData) return null;
        return this.toolsData.Tools.find(t => t.id === toolId);
    }

    // 自动检查工具状态
    async checkToolsStatus() {
        if (!this.toolsData) return;
        
        for (const tool of this.toolsData.Tools) {
            try {
                // 检查工具页面是否存在
                const response = await fetch(tool.url);
                if (!response.ok) {
                    tool.status.maintenance = "error";
                    tool.status.lastUpdated = new Date().toISOString().split('T')[0];
                }
            } catch (error) {
                tool.status.maintenance = "error";
                tool.status.lastUpdated = new Date().toISOString().split('T')[0];
            }
        }
        
        this.saveToolsData();
    }

    // 导出工具数据
    exportToolsData() {
        if (!this.toolsData) return null;
        return JSON.stringify(this.toolsData, null, 2);
    }

    // 导入工具数据
    importToolsData(data) {
        try {
            this.toolsData = JSON.parse(data);
            this.saveToolsData();
            return true;
        } catch (error) {
            console.error('导入工具数据失败:', error);
            return false;
        }
    }
}

// 创建全局实例
window.toolsManager = new ToolsManager();

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    await window.toolsManager.loadToolsData();
    console.log('工具管理器已初始化');
});

// 导出工具管理器类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolsManager;
} 