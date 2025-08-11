// 在窗口小于700px时header的js
var Hbutton = document.getElementById("menuButton");
var zbbq = document.getElementById('sideMenu') ? document.getElementById('sideMenu').style : null;

// 小屏幕时头部导航条
var display = 0;
function headers() {
    if (display == 0) {
        // 检查屏幕尺寸
        const isMobile = window.innerWidth <= 600;
        
        if (isMobile) {
            // 手机端：显示菜单按钮动画
            Hbutton.innerHTML = '<span id="hspanone"></span><span id="hspantwo"></span><span id="hspanthree"></span>';
            const hspanone = document.getElementById('hspanone');
            const hspantwo = document.getElementById('hspantwo');
            const hspanthree = document.getElementById('hspanthree');
            if (hspanone) hspanone.style.transform = 'rotateZ(-45deg) translateX(-5px) translateY(10px)';
            if (hspantwo) hspantwo.style.transform = 'rotateZ(45deg) translateX(-5px)translateY(-10px)';
            if (hspanthree) hspanthree.style.display = 'none';
        }
        
        const mainBody = document.getElementById('main-body');
        const footer = document.querySelector('footer');
        
        if (mainBody) mainBody.style.display = 'none';
        if (footer) footer.style.display = 'none';
        
        if (zbbq) {
            zbbq.transform = "translateX(-800px) matrix3d(3, -1, 30, 0, 0, 1, 10, 0, 1, 0, 10, 0, 0, 0, 0, 3)";
            zbbq.display = "flex";
            setTimeout(() => {
                if (zbbq) {
                    zbbq.display = "flex";
                    zbbq.transform = "translateX(0px)";
                }
                // 进入SideMenu时重新检查用户状态
                if (typeof checkUserAuth === 'function') {
                    checkUserAuth();
                }
            }, 500);
        }
        display = 1;
    } else {
        const mainBody = document.getElementById('main-body');
        if (mainBody) mainBody.style.display = 'flex';
        const footer = document.querySelector('footer');
        if (footer) footer.style.display = 'block';
        
        if (zbbq) {
            zbbq.transform = "translateX(520px) matrix3d(1, 20, 0, -1, -1, 2, 5, 0, 0, 0, 1, 0, 0, 0, 0, 2)";
            setTimeout(() => {
                // 只在手机端恢复菜单按钮
                const isMobile = window.innerWidth <= 600;
                if (isMobile) {
                    Hbutton.innerHTML = '<span></span><span></span><span></span>';
                }
                if (zbbq) {
                    zbbq.display = "none";
                    zbbq.transform = "translateX(-1000px)";
                }
            }, 500)
        }
        display = 0;
    }
}

// 点击头像后
function toXiang() {
    let qqh = document.getElementById('input').value;
    if (qqh == '' || qqh == null) {
        tanChuang('请先输入内容');
    } else {
        let url = 'http://q1.qlogo.cn/g?b=qq&nk=' + qqh + '&s=640';
        let toXiangSrc = document.getElementById('profilePicture');
        toXiangSrc.src = url;
        // 同步更新下拉菜单头像
        const dropdownAvatar = document.getElementById('dropdownAvatar');
        if (dropdownAvatar) {
            dropdownAvatar.src = url;
        }
        // 同步更新SideMenu头像
        const sideMenuAvatar = document.getElementById('sideMenuAvatar');
        if (sideMenuAvatar) {
            sideMenuAvatar.src = url;
        }
        window.localStorage.setItem('qqh', qqh);
    }
}
// 进入后加载
let qqh = +window.localStorage.getItem('qqh');
if (qqh) {
    const avatarUrl = 'http://q1.qlogo.cn/g?b=qq&nk=' + qqh + '&s=640';
    const profilePicture = document.getElementById('profilePicture');
    if (profilePicture) {
        profilePicture.src = avatarUrl;
    }
    // 同步更新下拉菜单头像
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    if (dropdownAvatar) {
        dropdownAvatar.src = avatarUrl;
    }
    // 同步更新SideMenu头像
    const sideMenuAvatar = document.getElementById('sideMenuAvatar');
    if (sideMenuAvatar) {
        sideMenuAvatar.src = avatarUrl;
    }
}