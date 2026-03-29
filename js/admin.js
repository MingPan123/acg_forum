// ============== 数据存储 ==============
const DB_KEY = 'acg_forum_db';
let currentUser = null;

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
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

function checkAuth() {
    const savedUser = localStorage.getItem('acg_forum_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        
        if (currentUser.role !== 'admin') {
            showToast('非管理员用户无法访问后台', 'error');
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            return;
        }
        
        updateUserArea();
        loadDashboard();
    } else {
        showAuthModal();
    }
}

function updateUserArea() {
    const userArea = document.getElementById('userArea');
    if (currentUser) {
        userArea.innerHTML = `
            <span style="color: var(--text-secondary); font-size: 0.9rem; margin-right: 12px;">管理员: ${currentUser.username}</span>
            <a href="index.html" class="btn-secondary btn-small" style="margin-right: 8px;">返回首页</a>
            <button class="btn-secondary btn-small" onclick="logout()">退出</button>
        `;
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('acg_forum_current_user');
    window.location.href = 'index.html';
}

// ============== 标签页切换 ==============
function switchAdminTab(tab, element) {
    document.querySelectorAll('.admin-nav-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    
    document.querySelectorAll('[id$="Tab"]').forEach(t => t.style.display = 'none');
    document.getElementById(tab + 'Tab').style.display = 'block';
    
    switch (tab) {
        case 'dashboard': loadDashboard(); break;
        case 'posts': loadAdminPosts(); break;
        case 'users': loadAdminUsers(); break;
    }
}

// ============== 数据概览 ==============
function loadDashboard() {
    const db = getDB();
    const users = db.users || [];
    const posts = (db.posts || []).filter(p => !p.deleted);
    const comments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
    
    document.getElementById('statUsers').textContent = users.length;
    document.getElementById('statPosts').textContent = db.posts?.length || 0;
    document.getElementById('statComments').textContent = comments;
    document.getElementById('statPostsActive').textContent = posts.length;
}

// ============== 帖子管理 ==============
function loadAdminPosts() {
    const db = getDB();
    const posts = db.posts || [];
    
    if (posts.length === 0) {
        document.getElementById('postsTableBody').innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-secondary);">暂无帖子</td></tr>';
        return;
    }
    
    document.getElementById('postsTableBody').innerHTML = posts.map(post => {
        const author = db.users.find(u => u.id === post.user_id) || { username: '未知' };
        return `
            <tr>
                <td>${post.id}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(post.title)}</td>
                <td>${post.category}</td>
                <td>${escapeHtml(author.username)}</td>
                <td>${post.views}</td>
                <td>${post.likes}</td>
                <td>${post.is_pinned ? '<span style="color: var(--accent-color);">是</span>' : '否'}</td>
                <td class="actions">
                    <button class="btn-secondary btn-small" onclick="togglePin(${post.id})">${post.is_pinned ? '取消置顶' : '置顶'}</button>
                    <button class="btn-danger btn-small" onclick="deleteAdminPost(${post.id})">删除</button>
                </td>
            </tr>
        `;
    }).join('');
}

function togglePin(postId) {
    const db = getDB();
    const post = db.posts.find(p => p.id === postId);
    if (post) {
        post.is_pinned = !post.is_pinned;
        saveDB(db);
        showToast(post.is_pinned ? '已置顶' : '已取消置顶');
        loadAdminPosts();
    }
}

function deleteAdminPost(postId) {
    if (!confirm('确定要删除这篇帖子吗？')) return;
    
    const db = getDB();
    const post = db.posts.find(p => p.id === postId);
    if (post) {
        post.deleted = true;
        saveDB(db);
        showToast('帖子已删除');
        loadAdminPosts();
        loadDashboard();
    }
}

// ============== 用户管理 ==============
function loadAdminUsers() {
    const db = getDB();
    const users = db.users || [];
    
    if (users.length === 0) {
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">暂无用户</td></tr>';
        return;
    }
    
    document.getElementById('usersTableBody').innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td><a href="user.html?id=${user.id}">${escapeHtml(user.username)}</a></td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${user.email || '-'}</td>
            <td>
                <select onchange="changeUserRole(${user.id}, this.value)" class="form-input" style="padding: 4px 8px; font-size: 0.8rem;">
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>普通用户</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>管理员</option>
                </select>
            </td>
            <td>${user.post_count || 0}</td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <button class="btn-secondary btn-small" onclick="window.open('user.html?id=${user.id}', '_blank')">查看</button>
            </td>
        </tr>
    `).join('');
}

function changeUserRole(userId, role) {
    const db = getDB();
    const user = db.users.find(u => u.id === userId);
    if (user) {
        user.role = role;
        saveDB(db);
        showToast('角色已更新');
        
        // 如果修改的是当前用户，更新当前用户信息
        if (userId === currentUser.id) {
            currentUser.role = role;
            localStorage.setItem('acg_forum_current_user', JSON.stringify(currentUser));
        }
    }
}

// ============== 认证模态框 ==============
function showAuthModal() {
    const modal = document.getElementById('authModal');
    const content = document.getElementById('authContent');
    
    content.innerHTML = `
        <div class="auth-tabs"><div class="auth-tab active">登录</div></div>
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
        <p style="margin-top: 16px; text-align: center; color: var(--text-secondary); font-size: 0.875rem;">管理员账号: admin / admin123</p>
    `;
    
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
        if (user.role !== 'admin') {
            document.getElementById('authError').textContent = '非管理员用户无法访问后台';
            document.getElementById('authError').style.display = 'block';
            return;
        }
        
        currentUser = { id: user.id, username: user.username, email: user.email, role: user.role, bio: user.bio };
        localStorage.setItem('acg_forum_current_user', JSON.stringify(currentUser));
        updateUserArea();
        closeAuthModal();
        showToast('登录成功');
        loadDashboard();
    } else {
        document.getElementById('authError').textContent = '用户名或密码错误';
        document.getElementById('authError').style.display = 'block';
    }
}
