// 用户认证和个人信息管理

// 全局变量
let currentUser = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentUser();
    bindAuthEvents();
    updateNavigation();
    renderProfile();
});

// 加载当前用户
function loadCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
}

// 保存当前用户
function saveCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // 保存用户到用户列表
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUserIndex = users.findIndex(u => u.phone === user.phone);
    
    if (existingUserIndex > -1) {
        // 更新现有用户
        users[existingUserIndex] = user;
    } else {
        // 添加新用户
        users.push(user);
    }
    
    localStorage.setItem('users', JSON.stringify(users));
}

// 绑定认证相关事件
function bindAuthEvents() {
    // 注册表单
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // 登录表单
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 个人主页事件
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditModal);
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditModal);
    }
    
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditProfile);
    }
    
    const showInfoCheckbox = document.getElementById('show-info');
    if (showInfoCheckbox) {
        showInfoCheckbox.addEventListener('change', handleShowInfoChange);
    }
}

// 处理注册
function handleRegister(e) {
    e.preventDefault();
    
    const userId = document.getElementById('user-id').value.trim();
    const userPhone = document.getElementById('user-phone').value.trim();
    const userTitle = document.getElementById('user-title').value;
    const userGender = document.querySelector('input[name="gender"]:checked');
    const userAge = document.getElementById('user-age').value;
    const userEmail = document.getElementById('user-email').value.trim();
    const userBio = document.getElementById('user-bio').value.trim();
    
    if (!userId) {
        alert('请输入ID');
        return;
    }
    
    if (!userPhone) {
        alert('请输入手机号');
        return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(userPhone)) {
        alert('请输入正确的手机号');
        return;
    }
    
    if (!userTitle) {
        alert('请选择称号');
        return;
    }
    
    if (!userGender) {
        alert('请选择性别');
        return;
    }
    
    if (!userAge) {
        alert('请输入年龄');
        return;
    }
    
    const newUser = {
        id: userId,
        phone: userPhone,
        title: userTitle,
        gender: userGender.value,
        age: userAge,
        email: userEmail,
        bio: userBio,
        showInfo: true,
        avatar: userId.charAt(0).toUpperCase()
    };
    
    saveCurrentUser(newUser);
    updateNavigation();
    
    alert('注册成功！');
    window.location.href = 'profile.html';
}

// 处理编辑个人资料
function handleEditProfile(e) {
    e.preventDefault();
    
    const userId = document.getElementById('edit-id').value.trim();
    const userTitle = document.getElementById('edit-title').value;
    const userGender = document.querySelector('input[name="edit-gender"]:checked');
    const userAge = document.getElementById('edit-age').value;
    const userEmail = document.getElementById('edit-email').value.trim();
    const userBio = document.getElementById('edit-bio').value.trim();
    
    if (!userId) {
        alert('请输入ID');
        return;
    }
    
    if (!userTitle) {
        alert('请选择称号');
        return;
    }
    
    if (!userGender) {
        alert('请选择性别');
        return;
    }
    
    if (!userAge) {
        alert('请输入年龄');
        return;
    }
    
    const updatedUser = {
        ...currentUser,
        id: userId,
        title: userTitle,
        gender: userGender.value,
        age: userAge,
        email: userEmail,
        bio: userBio,
        avatar: userId.charAt(0).toUpperCase()
    };
    
    saveCurrentUser(updatedUser);
    closeEditModal();
    renderProfile();
    
    alert('资料更新成功！');
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const phone = document.getElementById('login-phone').value.trim();
    
    if (!phone) {
        alert('请输入手机号');
        return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
        alert('请输入正确的手机号');
        return;
    }
    
    // 从用户列表中查找用户
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.phone === phone);
    
    if (user) {
        // 登录成功
        saveCurrentUser(user);
        updateNavigation();
        alert('登录成功！');
        window.location.href = 'profile.html';
    } else {
        // 登录失败
        alert('该手机号未注册，请先注册');
        window.location.href = 'register.html';
    }
}

// 处理退出登录
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        updateNavigation();
        renderProfile();
        window.location.href = 'index.html';
    }
}

// 处理显示/隐藏个人信息
function handleShowInfoChange() {
    if (!currentUser) return;
    
    const showInfo = document.getElementById('show-info').checked;
    currentUser.showInfo = showInfo;
    saveCurrentUser(currentUser);
    renderProfile();
}

// 打开编辑模态框
function openEditModal() {
    if (!currentUser) {
        alert('请先注册或登录');
        return;
    }
    
    document.getElementById('edit-id').value = currentUser.id || '';
    document.getElementById('edit-title').value = currentUser.title || '';
    
    // 选中性别
    const genderRadios = document.querySelectorAll('input[name="edit-gender"]');
    genderRadios.forEach(radio => {
        radio.checked = radio.value === currentUser.gender;
    });
    
    document.getElementById('edit-age').value = currentUser.age || '';
    document.getElementById('edit-email').value = currentUser.email || '';
    document.getElementById('edit-bio').value = currentUser.bio || '';
    
    document.getElementById('edit-profile-modal').style.display = 'flex';
}

// 关闭编辑模态框
function closeEditModal() {
    document.getElementById('edit-profile-modal').style.display = 'none';
}

// 渲染个人主页
function renderProfile() {
    if (!currentUser) {
        // 未登录状态
        document.getElementById('user-avatar').textContent = '?';
        document.getElementById('user-id').textContent = '未登录';
        document.getElementById('personal-info').style.display = 'none';
        document.getElementById('empty-profile').style.display = 'none';
        document.getElementById('edit-profile-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';
        return;
    }
    
    // 已登录状态
    document.getElementById('user-avatar').textContent = currentUser.avatar || '?';
    document.getElementById('user-id').textContent = currentUser.id;
    const userTitleEl = document.getElementById('user-title');
    userTitleEl.innerHTML = currentUser.title;
    document.getElementById('show-info').checked = currentUser.showInfo || false;
    
    if (currentUser.showInfo) {
        document.getElementById('personal-info').style.display = 'block';
        document.getElementById('empty-profile').style.display = 'none';
        
        // 填充个人信息
        document.getElementById('user-gender').textContent = currentUser.gender || '未设置';
        document.getElementById('user-age').textContent = currentUser.age || '未设置';
        document.getElementById('user-email').textContent = currentUser.email || '未设置';
        document.getElementById('user-bio').textContent = currentUser.bio || '未设置';
    } else {
        document.getElementById('personal-info').style.display = 'none';
        document.getElementById('empty-profile').style.display = 'block';
    }
    
    // 显示用户帖子
    renderUserPosts();
}

// 渲染用户帖子
function renderUserPosts() {
    const userPostsContainer = document.getElementById('user-posts');
    if (!userPostsContainer) return;
    
    const posts = JSON.parse(localStorage.getItem('hikingPosts') || '[]');
    const userPosts = posts.filter(post => post.author === currentUser.id);
    
    if (userPosts.length === 0) {
        userPostsContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">你还没有发布过帖子</div>';
        return;
    }
    
    userPostsContainer.innerHTML = '';
    userPosts.forEach(post => {
        const postCard = createUserPostCard(post);
        userPostsContainer.appendChild(postCard);
    });
}

// 创建用户帖子卡片
function createUserPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card fade-in';
    
    const timeString = formatTime(post.timestamp);
    const likeClass = post.liked ? 'liked' : '';
    
    let imageHTML = '';
    if (post.image) {
        imageHTML = `<img src="${post.image}" alt="帖子图片" class="post-image">`;
    }
    
    card.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <div class="post-avatar">${currentUser.avatar}</div>
                <div class="post-author-info">
                    <h4>${currentUser.id}</h4>
                    <span>${timeString}</span>
                </div>
            </div>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <div class="post-content">${post.content}</div>
        ${imageHTML}
        <div class="post-actions">
            <button class="post-action-btn like-btn ${likeClass}" onclick="handleLike(${post.id})">
                <span>❤️</span>
                <span class="like-count">${post.likes}</span>
            </button>
            <button class="post-action-btn">
                <span>💬</span>
                <span>${post.comments.length}</span>
            </button>
            <button class="post-action-btn delete-btn" onclick="handleDelete(${post.id})">
                <span>🗑️</span>
                <span>删除</span>
            </button>
        </div>
    `;
    
    return card;
}

// 格式化时间
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    
    if (diff < minute) {
        return '刚刚';
    } else if (diff < hour) {
        return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
        return Math.floor(diff / hour) + '小时前';
    } else if (diff < month) {
        return Math.floor(diff / day) + '天前';
    } else {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
}

// 更新导航栏
function updateNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === 'register.html' || link.getAttribute('href') === 'profile.html') {
            if (currentUser) {
                if (link.getAttribute('href') === 'register.html') {
                    link.textContent = '个人主页';
                    link.setAttribute('href', 'profile.html');
                }
            }
        }
    });
}

// 处理删除帖子
function handleDelete(postId) {
    if (confirm('确定要删除这篇帖子吗？')) {
        // 从localStorage中获取帖子数据
        let posts = JSON.parse(localStorage.getItem('hikingPosts') || '[]');
        // 过滤掉要删除的帖子
        posts = posts.filter(post => post.id !== postId);
        // 保存回localStorage
        localStorage.setItem('hikingPosts', JSON.stringify(posts));
        // 重新渲染用户帖子
        renderUserPosts();
        alert('帖子已删除！');
    }
}

// 获取当前用户信息（供其他文件使用）
function getCurrentUser() {
    return currentUser;
}