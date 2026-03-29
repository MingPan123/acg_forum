// ============== 数据存储 ==============
const DB_KEY = 'acg_forum_db';
let currentUser = null;
let viewedUserId = null;
let viewedUser = null;

function getDB() {
    return JSON.parse(localStorage.getItem(DB_KEY) || '{}');
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getInitials(name) {
    return name ? name.substring(0, 1).toUpperCase() : 'U';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ============== 初始化 ==============
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    viewedUserId = urlParams.get('id') ? parseInt(urlParams.get('id')) : null;
    
    await checkAuth();
    
    if (viewedUserId) {
        loadUser(viewedUserId);
    } else if (currentUser) {
        viewedUserId = currentUser.id;
        viewedUser = currentUser;
        renderUserInfo();
        loadUserPosts();
    } else {
        showAuthModal('login');
    }
});

// ============== 用户认证 ==============
async function checkAuth() {
    const savedUser = localStorage.getItem('acg_forum_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    updateUserArea();
}

function updateUserArea() {
    const userArea = document.getElementById('userArea');
    if (currentUser) {
        const roleBadge = currentUser.role === 'admin' ? '<span class="role-badge admin">管理员</span>' : '';
        userArea.innerHTML = `
            <div class="user-dropdown">
                <button class="user-avatar-btn">${getInitials(currentUser.username)}</button>
                <div class="user-dropdown-menu">
                    <a href="user.html">👤 个人中心</a>
                    ${currentUser.role === 'admin' ? '<a href="admin.html">⚙️ 管理后台</a>' : ''}
                    <a href="#" onclick="logout()">🚪 退出登录</a>
                </div>
            </div>
            <span style="color: var(--text-secondary); font-size: 0.9rem;">${currentUser.username}${roleBadge}</span>
        `;
    } else {
        userArea.innerHTML = `
            <button class="btn-secondary btn-small" onclick="showAuthModal('login')">登录</button>
            <button class="btn-primary btn-small" onclick="showAuthModal('register')">注册</button>
        `;
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('acg_forum_current_user');
    showToast('已退出登录');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}

// ============== 加载用户信息 ==============
function loadUser(userId) {
    const db = getDB();
    const user = db.users?.find(u => u.id === userId);
    
    if (user) {
        viewedUser = user;
        viewedUserId = userId;
        renderUserInfo();
        loadUserPosts();
        document.title = `${user.username} - 个人中心 - ACG二次元游戏论坛`;
    } else {
        showToast('用户不存在', 'error');
        window.location.href = 'index.html';
    }
}

function renderUserInfo() {
    if (!viewedUser) return;
    
    document.getElementById('pageAvatar').textContent = getInitials(viewedUser.username);
    document.getElementById('pageUsername').innerHTML = escapeHtml(viewedUser.username);
    if (viewedUser.role === 'admin') {
        document.getElementById('pageUsername').innerHTML += '<span class="role-badge admin">管理员</span>';
    }
    document.getElementById('pageBio').textContent = viewedUser.bio || '这个人很懒，什么都没写~';
    document.getElementById('pagePostCount').textContent = viewedUser.post_count || 0;
    document.getElementById('pageCreatedAt').textContent = formatDate(viewedUser.created_at);
    
    document.getElementById('editEmail').value = viewedUser.email || '';
    document.getElementById('editBio').value = viewedUser.bio || '';
    
    const editBtn = document.getElementById('editProfileBtn');
    if (currentUser && currentUser.id === viewedUser.id) {
        editBtn.innerHTML = '<button class="btn-secondary" onclick="openEditModal()">编辑资料</button>';
    } else {
        editBtn.innerHTML = '';
    }
}

function loadUserPosts() {
    const db = getDB();
    const postsList = document.getElementById('myPostsList');
    postsList.innerHTML = '<div class="loading">加载中...</div>';
    
    const userPosts = (db.posts || []).filter(p => p.user_id === viewedUserId && !p.deleted);
    
    if (userPosts.length === 0) {
        postsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-title">暂无帖子</div>
                <div class="empty-state-text">还没有发布任何帖子</div>
            </div>
        `;
        return;
    }
    
    postsList.innerHTML = userPosts.map(post => `
        <div class="post-card" onclick="window.location.href='index.html#post=${post.id}'">
            <div class="post-card-header">
                <div><span class="post-category">${post.category}</span></div>
                <div class="post-meta">
                    <span>👁 ${post.views}</span>
                    <span>❤️ ${post.likes}</span>
                    <span>💬 ${(post.comments || []).length}</span>
                </div>
            </div>
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <p class="post-content">${escapeHtml(post.content.substring(0, 150))}${post.content.length > 150 ? '...' : ''}</p>
            <div class="post-footer">
                <span style="color: var(--text-secondary); font-size: 0.8rem;">${formatDate(post.created_at)}</span>
            </div>
        </div>
    `).join('');
}

// ============== 标签页切换 ==============
function switchTab(tab, element) {
    document.querySelectorAll('.page-tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    document.getElementById('postsTab').style.display = tab === 'posts' ? 'block' : 'none';
    document.getElementById('settingsTab').style.display = tab === 'settings' ? 'block' : 'none';
}

// ============== 修改资料 ==============
function openEditModal() {
    document.getElementById('editEmail').value = viewedUser.email || '';
    document.getElementById('editBio').value = viewedUser.bio || '';
    document.getElementById('settingsTab').style.display = 'block';
    document.querySelectorAll('.page-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.page-tab')[1].classList.add('active');
    document.getElementById('postsTab').style.display = 'none';
}

async function updateProfile(event) {
    event.preventDefault();
    
    const email = document.getElementById('editEmail').value;
    const bio = document.getElementById('editBio').value;
    
    const db = getDB();
    const user = db.users.find(u => u.id === currentUser.id);
    if (user) {
        user.email = email;
        user.bio = bio;
    }
    saveDB(db);
    
    currentUser.email = email;
    currentUser.bio = bio;
    localStorage.setItem('acg_forum_current_user', JSON.stringify(currentUser));
    
    if (viewedUser) {
        viewedUser.email = email;
        viewedUser.bio = bio;
    }
    
    renderUserInfo();
    showToast('资料更新成功');
}

async function changePassword(event) {
    event.preventDefault();
    
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('两次输入的密码不一致', 'error');
        return;
    }
    
    const db = getDB();
    const user = db.users.find(u => u.id === currentUser.id);
    
    if (user.password !== oldPassword) {
        showToast('原密码错误', 'error');
        return;
    }
    
    user.password = newPassword;
    saveDB(db);
    
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    showToast('密码修改成功');
}

// ============== 认证模态框 ==============
function showAuthModal(type = 'login') {
    const modal = document.getElementById('authModal');
    const content = document.getElementById('authContent');
    
    if (type === 'login') {
        content.innerHTML = `
            <div class="auth-tabs">
                <div class="auth-tab active">登录</div>
            </div>
            <div id="authError" class="auth-error"></div>
            <form onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label class="form-label">用户名</label>
                    <input type="text" id="loginUsername" class="form-input" placeholder="请输入用户名" required>
                </div>
                <div class="form-group">
                    <label class="form-label">密码</label>
                    <input type="password" id="loginPassword" class="form-input" placeholder="请输入密码" required>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">登录</button>
            </form>
        `;
    }
    modal.classList.add('show');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('show');
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const db = getDB();
    const user = db.users?.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = { id: user.id, username: user.username, email: user.email, role: user.role, bio: user.bio };
        localStorage.setItem('acg_forum_current_user', JSON.stringify(currentUser));
        updateUserArea();
        closeAuthModal();
        showToast('登录成功');
        viewedUserId = currentUser.id;
        viewedUser = currentUser;
        renderUserInfo();
        loadUserPosts();
    } else {
        document.getElementById('authError').textContent = '用户名或密码错误';
        document.getElementById('authError').style.display = 'block';
    }
}
