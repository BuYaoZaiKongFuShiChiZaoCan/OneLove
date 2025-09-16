/**
 * Data文件夹列表生成器
 * 动态生成Data目录下的文件和文件夹列表
 */

// 文件大小格式化函数
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 生成文件夹树HTML
function generateFolderTree(structure, level = 0) {
    let html = '';
    
    for (const [name, content] of Object.entries(structure)) {
        const isFolder = typeof content === 'object' && !content.type;
        const isFile = content && content.type === 'file';
        
        if (isFolder) {
            // 文件夹
            const hasChildren = Object.keys(content).length > 0;
            const folderId = `folder-${name.replace(/[^a-zA-Z0-9]/g, '-')}`;
            
            html += `
                <div class="folder-item" style="margin-left: ${level * 20}px;">
                    <div class="folder-header" onclick="toggleFolder('${folderId}')">
                        <i class="fas fa-chevron-right folder-arrow" id="arrow-${folderId}"></i>
                        <i class="fas fa-folder folder-icon"></i>
                        <span class="folder-name">${name}</span>
                        <span class="item-count">(${Object.keys(content).length})</span>
                    </div>
                    <div class="folder-content" id="${folderId}" style="display: none;">
                        ${hasChildren ? generateFolderTree(content, level + 1) : '<div class="empty-folder">空文件夹</div>'}
                    </div>
                </div>
            `;
        } else if (isFile) {
            // 文件
            const icon = content.icon || 'fas fa-file';
            const filePath = content.path || `Data/${name}`;
            const fileSize = content.size ? formatFileSize(content.size) : '';
            const modifiedDate = content.modified ? formatDate(content.modified) : '';
            
            html += `
                <div class="file-item" style="margin-left: ${level * 20}px;">
                    <div class="file-content" onclick="openFile('${filePath}')" title="大小: ${fileSize} | 修改时间: ${modifiedDate}">
                        <i class="fas fa-file file-icon"></i>
                        <i class="${icon} file-type-icon"></i>
                        <span class="file-name">${name}</span>
                        <span class="file-info">
                            ${fileSize ? `<span class="file-size">${fileSize}</span>` : ''}
                        </span>
                    </div>
                </div>
            `;
        }
    }
    
    return html;
}

// 获取文件路径
function getFilePath(fileName, level) {
    // 这里可以根据实际需要构建文件路径
    return `Data/biJi/${fileName}`;
}

// 切换文件夹展开/收起
function toggleFolder(folderId) {
    const folder = document.getElementById(folderId);
    const arrow = document.getElementById(`arrow-${folderId}`);
    
    if (folder.style.display === 'none') {
        folder.style.display = 'block';
        arrow.classList.remove('fa-chevron-right');
        arrow.classList.add('fa-chevron-down');
    } else {
        folder.style.display = 'none';
        arrow.classList.remove('fa-chevron-down');
        arrow.classList.add('fa-chevron-right');
    }
}

// 打开文件
function openFile(filePath) {
    // 根据文件类型决定如何打开
    const extension = filePath.split('.').pop().toLowerCase();
    
    if (['html', 'htm', 'mhtml'].includes(extension)) {
        // HTML文件直接打开
        window.open(filePath, '_blank');
    } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) {
        // 图片文件在新窗口打开
        window.open(filePath, '_blank');
    } else if (['md', 'txt'].includes(extension)) {
        // 文本文件尝试打开
        window.open(filePath, '_blank');
    } else {
        // 其他文件类型提示下载
        const link = document.createElement('a');
        link.href = filePath;
        link.download = filePath.split('/').pop();
        link.click();
    }
}

// 动态获取Data目录结构
async function fetchDataStructure() {
    try {
        // 尝试获取Data目录的API接口
        const response = await fetch('/api/data/structure');
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                console.log('✅ 成功获取动态目录结构');
                console.log('📋 排除配置:', result.excludedFiles);
                return result.data;
            } else {
                throw new Error(result.message || 'API返回失败');
            }
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.warn('⚠️ 无法获取动态目录结构，使用静态数据:', error.message);
        
        // 如果API不可用，使用静态数据作为后备
        return {
            "biJi": {
                "api小白使用教程.html": { type: "file", icon: "fas fa-file-code" },
                "本地数据.html": { type: "file", icon: "fas fa-file-code" },
                "JavaScript实现搜索功能.html": { type: "file", icon: "fas fa-file-code" },
                "SEO优化设置.html": { type: "file", icon: "fas fa-file-code" },
                "信息提交模板.docx": { type: "file", icon: "fas fa-file-word" },
                "喜羊羊与灰太狼之星座分析.jpg": { type: "file", icon: "fas fa-file-image" },
                "摆钟的工作原理.mhtml": { type: "file", icon: "fas fa-file-code" },
                "杀毒软件测评-EPIC病毒.md": { type: "file", icon: "fas fa-file-alt" },
                "编程学习经历阶段.html": { type: "file", icon: "fas fa-file-code" },
                "网站历史.html": { type: "file", icon: "fas fa-file-code" },
                "羊历3010年.txt": { type: "file", icon: "fas fa-file-alt" },
                "音乐api.html": { type: "file", icon: "fas fa-file-code" }
            },
            "Resources": {}
        };
    }
}

// 初始化文件夹列表
async function initDataFolderList() {
    const folderTree = document.getElementById('folderTree');
    if (folderTree) {
        try {
            // 显示加载状态
            folderTree.innerHTML = '<div class="loading">正在加载文件夹结构...</div>';
            
            // 获取数据结构
            const structure = await fetchDataStructure();
            
            // 生成文件夹树
            console.log('📁 生成文件夹树，数据结构:', structure);
            const treeHTML = generateFolderTree(structure);
            folderTree.innerHTML = treeHTML;
            
            // 默认展开第一层文件夹
            const firstLevelFolders = folderTree.querySelectorAll('.folder-content');
            firstLevelFolders.forEach(folder => {
                folder.style.display = 'block';
                const folderId = folder.id;
                const arrow = document.getElementById(`arrow-${folderId}`);
                if (arrow) {
                    arrow.classList.remove('fa-chevron-right');
                    arrow.classList.add('fa-chevron-down');
                }
            });
            
            // 添加加载完成动画
            folderTree.style.opacity = '0';
            setTimeout(() => {
                folderTree.style.transition = 'opacity 0.3s ease';
                folderTree.style.opacity = '1';
            }, 100);
            
        } catch (error) {
            console.error('加载文件夹结构失败:', error);
            folderTree.innerHTML = '<div class="error">加载失败，请刷新页面重试</div>';
        }
    }
}

// 排除文件配置相关功能
let currentExcludeConfig = {
    extensions: [],
    patterns: [],
    directories: []
};

// 打开排除文件配置模态框
function openExcludeConfig() {
    const modal = document.getElementById('excludeConfigModal');
    if (modal) {
        loadExcludeConfig();
        modal.showModal();
    }
}

// 关闭排除文件配置模态框
function closeExcludeConfig() {
    const modal = document.getElementById('excludeConfigModal');
    if (modal) {
        modal.close();
    }
}

// 加载排除文件配置
async function loadExcludeConfig() {
    try {
        const response = await fetch('/api/data/excluded-files');
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                currentExcludeConfig = result.data;
                renderExcludeConfig();
            }
        }
    } catch (error) {
        console.error('加载排除配置失败:', error);
    }
}

// 渲染排除文件配置
function renderExcludeConfig() {
    renderExcludeList('extensions', currentExcludeConfig.extensions);
    renderExcludeList('patterns', currentExcludeConfig.patterns);
    renderExcludeList('directories', currentExcludeConfig.directories);
}

// 渲染排除列表
function renderExcludeList(type, items) {
    const container = document.getElementById(`${type}List`);
    if (!container) return;
    
    container.innerHTML = '';
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'config-item';
        itemDiv.innerHTML = `
            <span class="item-text">${item}</span>
            <button class="remove-btn" onclick="removeExcludeItem('${type}', ${index})">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(itemDiv);
    });
}

// 添加排除项
function addExcludeItem(type) {
    const inputId = type === 'extensions' ? 'newExtension' : 
                   type === 'patterns' ? 'newPattern' : 'newDirectory';
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    
    if (value && !currentExcludeConfig[type].includes(value)) {
        currentExcludeConfig[type].push(value);
        renderExcludeList(type, currentExcludeConfig[type]);
        input.value = '';
    }
}

// 移除排除项
function removeExcludeItem(type, index) {
    currentExcludeConfig[type].splice(index, 1);
    renderExcludeList(type, currentExcludeConfig[type]);
}

// 保存排除文件配置
async function saveExcludeConfig() {
    try {
        const response = await fetch('/api/data/excluded-files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
            },
            body: JSON.stringify(currentExcludeConfig)
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert('排除文件配置保存成功！');
                closeExcludeConfig();
                // 重新加载文件夹列表
                initDataFolderList();
            } else {
                alert('保存失败：' + result.message);
            }
        } else {
            alert('保存失败：HTTP ' + response.status);
        }
    } catch (error) {
        console.error('保存排除配置失败:', error);
        alert('保存失败：' + error.message);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initDataFolderList();
    
    // 添加配置按钮事件监听器
    const configBtn = document.getElementById('excludeConfigBtn');
    if (configBtn) {
        configBtn.addEventListener('click', openExcludeConfig);
    }
});

// 如果DOM已经加载完成，立即初始化（避免重复调用）
if (document.readyState !== 'loading') {
    initDataFolderList();
    
    // 添加配置按钮事件监听器
    const configBtn = document.getElementById('excludeConfigBtn');
    if (configBtn) {
        configBtn.addEventListener('click', openExcludeConfig);
    }
}
