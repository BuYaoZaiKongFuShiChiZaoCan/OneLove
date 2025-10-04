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
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.warn('日期格式化错误:', error);
        return '';
    }
}

// 生成文件夹树HTML
function generateFolderTree(structure, level = 0) {
    // 防御性检查
    if (!structure || typeof structure !== 'object') {
        console.error('无效的目录结构:', structure);
        return '<div class="empty-message">无效的目录结构</div>';
    }
    
    let html = '';
    const entries = Object.entries(structure);
    
    if (entries.length === 0) {
        return '<div class="empty-folder">空文件夹</div>';
    }
    
    for (const [name, content] of entries) {
        // 改进文件夹检测逻辑
        const isFolder = content && typeof content === 'object' && !content.type && !Array.isArray(content);
        
        // 改进文件检测逻辑 - 更灵活地识别文件
        const hasFileExtension = name.includes('.') && typeof name === 'string';
        const isFile = content && (content.type === 'file' || hasFileExtension);
        
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
            const icon = content && content.icon ? content.icon : 'fas fa-file';
            
            // 构建正确的文件路径
            let filePath = name;
            // 如果content中有path属性，优先使用
            if (content && content.path) {
                filePath = content.path;
            }
            
            // 确保路径始终以"Data/"开头
            if (!filePath.startsWith('Data/')) {
                filePath = `Data/${filePath}`;
            }
            
            const fileSize = content && content.size ? formatFileSize(content.size) : '';
            const modifiedDate = content && content.modified ? formatDate(content.modified) : '';
            
            // 安全转义文件路径
            const safeFilePath = filePath.replace(/'/g, "\\'");
            
            html += `
                <div class="file-item" style="margin-left: ${level * 20}px;">
                    <div class="file-content" onclick="openFile('${safeFilePath}')" title="大小: ${fileSize || '未知'} | 修改时间: ${modifiedDate || '未知'} | 路径: ${filePath}">
                        <i class="fas fa-file file-icon"></i>
                        <i class="${icon} file-type-icon"></i>
                        <span class="file-name">${name}</span>
                        <span class="file-info">
                            ${fileSize ? `<span class="file-size">${fileSize}</span>` : ''}
                        </span>
                    </div>
                </div>
            `;
        } else {
            // 处理未分类项目 - 检查是否有文件扩展名
            if (typeof name === 'string' && name.includes('.') && name.trim() !== '') {
                // 作为文件处理
                let filePath = name;
                
                // 确保路径始终以"Data/"开头
                if (!filePath.startsWith('Data/')) {
                    filePath = `Data/${filePath}`;
                }
                
                const safeFilePath = filePath.replace(/'/g, "\\'");
                
                html += `
                    <div class="file-item" style="margin-left: ${level * 20}px;">
                        <div class="file-content" onclick="openFile('${safeFilePath}')" title="路径: ${filePath}">
                            <i class="fas fa-file file-icon"></i>
                            <span class="file-name">${name}</span>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    return html;
}

// 获取文件路径
function getFilePath(fileName, level) {
    // 这里可以根据实际需要构建文件路径
    // 确保路径始终以"Data/"开头
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
    // 安全检查
    if (!filePath || typeof filePath !== 'string') {
        console.warn('⚠️ 无效的文件路径:', filePath);
        return;
    }
    
    try {
        console.log(`📂 打开文件: ${filePath}`);
        
        // 对文件路径进行安全处理
        let safePath = filePath.trim();
        
        // 确保路径始终以"Data/"开头
        if (!safePath.startsWith('Data/')) {
            console.log(`  - 路径缺少Data前缀，添加前缀`);
            safePath = `Data/${safePath}`;
        }
        
        console.log(`  - 修正后的路径: ${safePath}`);
        
        // 根据文件类型决定如何打开
        const extension = safePath.split('.').pop()?.toLowerCase();
        console.log(`  - 扩展名: ${extension}`);
        
        if (['html', 'htm', 'mhtml'].includes(extension)) {
            // HTML文件直接打开
            console.log(`  - 打开HTML文件`);
            window.open(safePath, '_blank');
        } else if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) {
            // 图片文件在新窗口打开
            console.log(`  - 打开图片文件`);
            window.open(safePath, '_blank');
        } else if (['md', 'txt'].includes(extension)) {
            // 文本文件尝试打开
            console.log(`  - 打开文本文件`);
            window.open(safePath, '_blank');
        } else {
            // 其他文件类型提示下载
            console.log(`  - 下载其他文件`);
            const link = document.createElement('a');
            link.href = safePath;
            link.download = safePath.split('/').pop() || 'download';
            document.body.appendChild(link);
            link.click();
            // 确保链接被移除
            setTimeout(() => {
                document.body.removeChild(link);
            }, 100);
        }
    } catch (error) {
        console.error('❌ 打开文件失败:', error);
        alert('打开文件失败，请重试');
    }
}

// 获取静态数据结构（模拟本地Data目录结构）
function getStaticDataStructure() {
    console.log('使用静态数据结构');
    // 基于实际文件结构创建更完整的静态数据
    return {
        "Resources": {
            "icons": {
                "icon1.png": { type: "file", icon: "fas fa-image", size: 2048, modified: new Date().toISOString() },
                "icon2.svg": { type: "file", icon: "fas fa-file-image", size: 512, modified: new Date().toISOString() }
            }
        },
        "music": {
            "playlist.json": { type: "file", icon: "fas fa-file-json", size: 2000, modified: new Date().toISOString() },
            "favorites.txt": { type: "file", icon: "fas fa-file-text", size: 300, modified: new Date().toISOString() }
        },
        "文档.html": { type: "file", icon: "fas fa-file-code", size: 3072, modified: new Date().toISOString() },
        "说明.md": { type: "file", icon: "fas fa-file-alt", size: 1500, modified: new Date().toISOString() }
    };
}

// 动态获取Data目录结构
async function fetchDataStructure() {
    try {
        // 尝试获取Data目录的API接口
        const response = await fetch('/api/data/structure');
        console.log('API响应状态:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('API返回数据:', result);
            
            if (result.success && result.data) {
                console.log('✅ 成功获取动态目录结构');
                console.log('📋 排除配置:', result.excludedFiles || '无');
                return result.data;
            } else {
                throw new Error(result.message || 'API返回失败');
            }
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.warn('⚠️ 无法获取动态目录结构，使用静态数据:', error.message);
        
        // 使用更完整的静态数据作为后备
        return getStaticDataStructure();
    }
}

// 初始化文件夹列表
async function initDataFolderList() {
    // 检测是否为生产环境
    const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.endsWith('.local');
    
    // 在生产环境中，直接禁用功能，不执行任何初始化
    if (isProduction) {
        console.log('🚫 生产环境：Data文件夹列表功能已禁用');
        const folderTree = document.getElementById('folderTree');
        if (folderTree) {
            folderTree.innerHTML = '<div class="disabled-message">此功能在生产环境中不可用</div>';
        }
        return;
    }
    
    console.log('🔄 开始初始化文件夹列表', new Date().toLocaleTimeString());
    const folderTree = document.getElementById('folderTree');
    
    if (!folderTree) {
        console.warn('❌ 未找到文件夹树容器元素');
        return;
    }
    
    try {
        // 显示加载状态
        console.log('⏳ 显示加载状态...');
        folderTree.innerHTML = '<div class="loading">正在加载文件夹结构...</div>';
        
        // 获取数据结构
        console.log('🔍 获取数据结构...');
        const startTime = performance.now();
        const structure = await fetchDataStructure();
        const fetchTime = performance.now() - startTime;
        
        // 验证数据结构
        console.log(`✅ 数据结构获取完成，耗时: ${fetchTime.toFixed(2)}ms`);
        if (!structure || typeof structure !== 'object') {
            console.error('❌ 无效的数据结构:', structure);
            throw new Error('获取的数据结构无效');
        }
        
        // 生成文件夹树
        console.log('📁 开始生成文件夹树...');
        console.log('📋 数据结构分析:', {
            type: typeof structure,
            entryCount: Object.keys(structure).length,
            entries: Object.keys(structure)
        });
        
        const treeHTML = generateFolderTree(structure);
        folderTree.innerHTML = treeHTML;
        console.log('✅ 文件夹树HTML生成完成');
        
        // 默认展开第一层文件夹
        console.log('🔓 展开第一层文件夹...');
        const firstLevelFolders = folderTree.querySelectorAll('.folder-content');
        console.log(`📂 找到 ${firstLevelFolders.length} 个顶级文件夹`);
        
        firstLevelFolders.forEach((folder, index) => {
            folder.style.display = 'block';
            const folderId = folder.id;
            const arrow = document.getElementById(`arrow-${folderId}`);
            if (arrow) {
                arrow.classList.remove('fa-chevron-right');
                arrow.classList.add('fa-chevron-down');
                console.log(`  - 展开文件夹 #${index}: ${folderId}`);
            }
        });
        
        // 检查是否有任何文件被渲染
        const fileItems = folderTree.querySelectorAll('.file-item');
        console.log(`📄 成功渲染 ${fileItems.length} 个文件项`);
        
        // 添加加载完成动画
        console.log('✨ 应用加载完成动画...');
        folderTree.style.opacity = '0';
        setTimeout(() => {
            folderTree.style.transition = 'opacity 0.3s ease';
            folderTree.style.opacity = '1';
            console.log('✅ 文件夹列表初始化完成', new Date().toLocaleTimeString());
        }, 100);
        
    } catch (error) {
        console.error('❌ 加载文件夹结构失败:', error);
        console.error('错误详情:', { message: error.message, stack: error.stack });
        folderTree.innerHTML = `<div class="error">加载失败: ${error.message || '未知错误'}，请刷新页面重试</div>`;
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
    // 检测是否为生产环境
    const isProduction = window.location.hostname !== 'localhost' && 
                       window.location.hostname !== '127.0.0.1' &&
                       !window.location.hostname.endsWith('.local');
    
    // 在生产环境中，隐藏配置按钮并禁用所有相关功能
    if (isProduction) {
        console.log('🚫 生产环境：禁用Data文件夹配置相关功能');
        const configBtn = document.getElementById('excludeConfigBtn');
        if (configBtn) {
            configBtn.style.display = 'none';
        }
        return;
    }
    
    // 仅在非生产环境初始化功能
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
