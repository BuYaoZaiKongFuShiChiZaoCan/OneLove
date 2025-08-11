let youShi = false;
let anNiu = document.getElementById('mainButton');
let content = document.getElementById('content');
function change() {
    if (!anNiu || !content) return;
    
    if (youShi) {
        youShi = false;
        anNiu.innerText = '√';
        content.style.borderBlockColor = '#fff';
        // content.value = '';
        content.readOnly = false;
        content.focus();
        // 删除时删一下原来的事
        window.localStorage.removeItem('important');
    } else {
        youShi = true;
        anNiu.innerText = '×';
        content.style.borderBlockColor = 'transparent';
        content.readOnly = true;
        // 每次保存时设置一下保存值
        window.localStorage.setItem('important', content.value);
    }
}

// 每次打开查询是否有记录
let data = window.localStorage.getItem('important');
if (data && content) {
    content.value = data;
    change();
}