// ============== 数据存储 (使用localStorage模拟后端) ==============
const DB_KEY = 'acg_forum_db';
let currentUser = null;
let currentPage = 1;
let currentCategory = '';
let currentSearch = '';

function getDB() {
    let db = localStorage.getItem(DB_KEY);
    if (!db) {
        db = initDB();
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
    return JSON.parse(db);
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function initDB() {
    return {
        users: [
            { id: 1, username: 'admin', password: 'admin123', email: 'admin@acgforum.com', role: 'admin', bio: '论坛管理员', created_at: '2024-01-01T00:00:00Z', post_count: 2, comment_count: 2 },
            { id: 2, username: '原神萌新', password: '123456', email: 'genshin@acg.com', role: 'user', bio: '提瓦特冒险者，正在探索提瓦特大陆的奥秘', created_at: '2024-01-15T00:00:00Z', post_count: 2, comment_count: 2 },
            { id: 3, username: '崩坏老玩家', password: '123456', email: 'honkai@acg.com', role: 'user', bio: '从崩坏2开始的老舰长，见证崩坏的成长', created_at: '2024-02-01T00:00:00Z', post_count: 1, comment_count: 1 },
            { id: 4, username: '同人创作者', password: '123456', email: 'artist@acg.com', role: 'user', bio: '专注二次创作的画师，欢迎交流~', created_at: '2024-02-10T00:00:00Z', post_count: 2, comment_count: 1 }
        ],
        posts: [
            { id: 1, title: '【原神】4.8版本新角色养成攻略', content: '# 新角色养成指南\n\n## 角色简介\n本次更新推出的新角色是一个五星雷元素角色，拥有独特的技能机制。\n\n## 天赋加点\n优先升级元素战技，其次是元素爆发，普通攻击可以最后升级。\n\n## 圣遗物搭配\n推荐使用「绝缘之旗印」四件套，优先堆叠元素充能效率。\n\n## 武器推荐\n1. 五星：专武「薙草之永劫」\n2. 四星：钓鱼兑换的「渔获」\n3. 三星：充能向可选「吃虎鱼刀」\n\n## 配队建议\n最佳阵容：雷电将军 + 纳西妲 + 行秋 + 久岐忍\n\n希望这份攻略对大家有帮助！', category: '攻略', tags: '原神,养成,雷电将军', views: 1234, likes: 256, is_pinned: true, user_id: 1, created_at: '2024-03-01T10:00:00Z', comments: [] },
            { id: 2, title: '【同人创作】甘雨-璃月风情', content: '# 甘雨同人图分享\n\n这是一幅我画的甘雨同人图，灵感来源于璃月的山水风景。\n\n## 创作说明\n- 画风：厚涂\n- 尺寸：1920x2560\n- 耗时：约8小时\n\n## 使用的工具\n- Photoshop\n- 数位板：Wacom Intuos Pro\n\n欢迎大家交流绘画心得！', category: '同人创作', tags: '甘雨,同人,绘画', views: 856, likes: 189, is_pinned: false, user_id: 4, created_at: '2024-03-05T14:30:00Z', comments: [] },
            { id: 3, title: '崩坏星穹铁道：虚构叙事引擎C位攻略', content: '# 虚构叙事C位角色推荐\n\n## 简介\n虚构叙事是星穹铁道的常驻玩法，需要多核输出角色。\n\n## T0角色推荐\n1. **黄泉** - 版本答案，几乎所有虚构都适用\n2. **真理医生** - 智识一哥，对单伤害爆炸\n\n## 配队思路\n虚构叙事需要尽可能覆盖多种伤害类型和弱点。\n\n## 细节要点\n- 注意保留终结技对付精英怪\n- 利用增益角色最大化输出\n- 合理安排行动顺序', category: '攻略', tags: '星穹铁道,虚构叙事,角色推荐', views: 654, likes: 145, is_pinned: false, user_id: 2, created_at: '2024-03-10T09:15:00Z', comments: [] },
            { id: 4, title: '【游戏讨论】你们觉得什么是好游戏？', content: '作为一个玩了很多年游戏的老玩家，我想和大家聊聊什么才是好游戏。\n\n## 我的看法\n1. **剧情优秀** - 哪怕玩法一般，好的剧情也能让人沉浸\n2. **美术风格独特** - 让人一眼就能记住\n3. **音乐好听** - 好的BGM能让游戏升华\n4. **玩法创新** - 带来新鲜感\n\n## 大家觉得呢？\n欢迎在评论区分享你们的看法！', category: '游戏讨论', tags: '游戏,讨论,闲聊', views: 432, likes: 98, is_pinned: false, user_id: 1, created_at: '2024-03-12T16:45:00Z', comments: [] },
            { id: 5, title: '【同人创作】艾尔海森-学者风COS', content: '分享一组艾尔海森的COS正片！\n\n## 拍摄信息\n- 地点：须弥雨林实景拍摄\n- 后期：调色参考游戏内色调\n\n## 道具准备\n- 服装：定制款学者袍\n- 眼镜：银色细框眼镜\n- 书本：须弥相关书籍道具\n\n这是我的第一组原神COS，还请大家多多指教！', category: '同人创作', tags: '艾尔海森,COS,原神', views: 523, likes: 112, is_pinned: false, user_id: 4, created_at: '2024-03-15T11:20:00Z', comments: [] },
            { id: 6, title: '【综合】新人报道，请多关照！', content: '大家好！我是刚入坑的新人玩家。\n\n## 入坑契机\n看了朋友的介绍视频，决定入坑原神，结果一发不可收拾...\n\n## 目前进度\n- 冒险等级45\n- 刚完成稻妻主线\n- 正在练雷神国家队\n\n## 求助\n有什么新手建议吗？求大佬们带带！\n\n感谢大家！', category: '综合', tags: '新人,求助,原神', views: 287, likes: 67, is_pinned: false, user_id: 3, created_at: '2024-03-18T08:30:00Z', comments: [] }
        ],
        likes: [],
        nextId: { user: 5, post: 7, comment: 1 }
    };
}

// ============== Toast 通知 ==============
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ============== 用户认证 ==============
function checkAuth() {
    const savedUser = localStorage.getItem('acg_forum_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    updateUserArea();
    document.getElementById('newPostBtn').style.display = currentUser ? 'block' : 'none';
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
    updateUserArea();
    document.getElementById('newPostBtn').style.display = 'none';
    showToast('已退出登录');
}

// ============== 认证模态框 ==============
function showAuthModal(type = 'login') {
    const modal = document.getElementById('authModal');
    const content = document.getElementById('authContent');
    
    if (type === 'login') {
        content.innerHTML = `
            <div class="auth-tabs">
                <div class="auth-tab active" onclick="showAuthModal('login')">登录</div>
                <div class="auth-tab" onclick="showAuthModal('register')">注册</div>
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
            <p style="margin-top: 16px; text-align: center; color: var(--text-secondary); font-size: 0.875rem;">演示账号: admin / admin123</p>
        `;
    } else {
        content.innerHTML = `
            <div class="auth-tabs">
                <div class="auth-tab" onclick="showAuthModal('login')">登录</div>
                <div class="auth-tab active" onclick="showAuthModal('register')">注册</div>
            </div>
            <div id="authError" class="auth-error"></div>
            <form onsubmit="handleRegister(event)">
                <div class="form-group">
                    <label class="form-label">用户名</label>
                    <input type="text" id="regUsername" class="form-input" placeholder="请输入用户名" required minlength="3">
                </div>
                <div class="form-group">
                    <label class="form-label">邮箱</label>
                    <input type="email" id="regEmail" class="form-input" placeholder="请输入邮箱">
                </div>
                <div class="form-group">
                    <label class="form-label">密码</label>
                    <input type="password" id="regPassword" class="form-input" placeholder="请输入密码" required minlength="6">
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">注册</button>
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
    const user = db.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = { id: user.id, username: user.username, email: user.email, role: user.role, bio: user.bio };
        localStorage.setItem('acg_forum_current_user', JSON.stringify(currentUser));
        updateUserArea();
        closeAuthModal();
        showToast('登录成功');
        document.getElementById('newPostBtn').style.display = 'block';
        loadPosts(1);
    } else {
        document.getElementById('authError').textContent = '用户名或密码错误';
        document.getElementById('authError').style.display = 'block';
    }
}

function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    const db = getDB();
    if (db.users.find(u => u.username === username)) {
        document.getElementById('authError').textContent = '用户名已存在';
        document.getElementById('authError').style.display = 'block';
        return;
    }
    
    const newUser = {
        id: db.nextId.user++,
        username,
        password,
        email,
        role: 'user',
        bio: '',
        created_at: new Date().toISOString(),
        post_count: 0,
        comment_count: 0
    };
    
    db.users.push(newUser);
    saveDB(db);
    
    showToast('注册成功，请登录');
    showAuthModal('login');
}

function getInitials(name) {
    return name ? name.substring(0, 1).toUpperCase() : 'U';
}

// ============== 帖子列表 ==============
function loadPosts(page = 1) {
    currentPage = page;
    const db = getDB();
    let posts = [...db.posts].filter(p => !p.deleted);
    
    if (currentCategory) {
        posts = posts.filter(p => p.category === currentCategory);
    }
    if (currentSearch) {
        const s = currentSearch.toLowerCase();
        posts = posts.filter(p => p.title.toLowerCase().includes(s) || p.content.toLowerCase().includes(s));
    }
    
    posts.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return b.is_pinned - a.is_pinned;
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    const perPage = 10;
    const total = posts.length;
    const pages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const pagePosts = posts.slice(start, start + perPage);
    
    renderPosts(pagePosts, total, pages, page);
}

function renderPosts(posts, total, pages, page) {
    const postsList = document.getElementById('postsList');
    const postsCount = document.getElementById('postsCount');
    const db = getDB();
    
    postsCount.textContent = `共 ${total} 个帖子`;
    
    if (posts.length === 0) {
        postsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-title">暂无帖子</div>
                <div class="empty-state-text">成为第一个发帖的人吧！</div>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    postsList.innerHTML = posts.map(post => {
        const author = db.users.find(u => u.id === post.user_id) || { username: '未知用户', avatar: '' };
        const commentCount = post.comments ? post.comments.length : 0;
        
        return `
            <div class="post-card ${post.is_pinned ? 'pinned' : ''}" onclick="viewPost(${post.id})">
                <div class="post-card-header">
                    <div>
                        ${post.is_pinned ? '<span class="post-pinned-badge">置顶</span>' : ''}
                        <span class="post-category">${post.category}</span>
                    </div>
                    <div class="post-meta">
                        <span>👁 ${post.views}</span>
                        <span>❤️ ${post.likes}</span>
                        <span>💬 ${commentCount}</span>
                    </div>
                </div>
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <p class="post-content">${escapeHtml(post.content.substring(0, 200))}${post.content.length > 200 ? '...' : ''}</p>
                ${post.tags ? `
                    <div class="post-tags">
                        ${post.tags.split(',').map(tag => `<span class="post-tag">${escapeHtml(tag.trim())}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="post-footer">
                    <div class="post-author">
                        <div class="author-avatar">${getInitials(author.username)}</div>
                        <span class="author-name">${escapeHtml(author.username)}</span>
                    </div>
                    <span style="color: var(--text-secondary); font-size: 0.8rem;">${formatDate(post.created_at)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    renderPagination(pages, page);
}

function renderPagination(pages, current) {
    const pagination = document.getElementById('pagination');
    if (pages <= 1) { pagination.innerHTML = ''; return; }
    
    let html = `<button class="page-btn" onclick="loadPosts(${current - 1})" ${current === 1 ? 'disabled' : ''}>上一页</button>`;
    for (let i = 1; i <= pages; i++) {
        if (i === 1 || i === pages || (i >= current - 2 && i <= current + 2)) {
            html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="loadPosts(${i})">${i}</button>`;
        } else if (i === current - 3 || i === current + 3) {
            html += '<span style="color: var(--text-secondary);">...</span>';
        }
    }
    html += `<button class="page-btn" onclick="loadPosts(${current + 1})" ${current === pages ? 'disabled' : ''}>下一页</button>`;
    pagination.innerHTML = html;
}

// ============== 帖子详情 ==============
function viewPost(postId) {
    const modal = document.getElementById('postModal');
    modal.classList.add('show');
    loadPostDetail(postId);
}

function loadPostDetail(postId) {
    const db = getDB();
    const post = db.posts.find(p => p.id === postId);
    
    if (!post) {
        document.getElementById('postDetail').innerHTML = '<div class="loading">帖子不存在</div>';
        return;
    }
    
    post.views++;
    saveDB(db);
    
    const db2 = getDB();
    const postUpdated = db2.posts.find(p => p.id === postId);
    const author = db2.users.find(u => u.id === postUpdated.user_id) || { username: '未知用户' };
    const isLiked = db2.likes.includes(`${currentUser?.id}_${postId}`);
    const canDelete = currentUser && (currentUser.id === postUpdated.user_id || currentUser.role === 'admin');
    const canEdit = currentUser && currentUser.id === postUpdated.user_id;
    const comments = postUpdated.comments || [];
    
    document.getElementById('postDetail').innerHTML = `
        <div class="post-detail">
            <div class="post-detail-header">
                <h1 class="post-detail-title">${escapeHtml(postUpdated.title)}</h1>
                <div class="post-detail-meta">
                    <span>分类：${postUpdated.category}</span>
                    <span>浏览：${postUpdated.views}</span>
                    <span>点赞：${postUpdated.likes}</span>
                    <span>发布时间：${formatDate(postUpdated.created_at)}</span>
                </div>
            </div>
            <div class="post-detail-content">${escapeHtml(postUpdated.content)}</div>
            <div class="post-detail-actions">
                <button class="btn-secondary btn-small" onclick="toggleLike(${postId}, ${isLiked})">
                    ${isLiked ? '❤️ 已点赞' : '🤍 点赞'}
                </button>
                ${canEdit ? `<button class="btn-secondary btn-small" onclick="editPost(${postId})">✏️ 编辑</button>` : ''}
                ${canDelete ? `<button class="btn-danger btn-small" onclick="deletePost(${postId})">🗑 删除</button>` : ''}
            </div>
            <div class="comments-section">
                <h3 class="comments-title">💬 评论区 (${comments.length})</h3>
                ${currentUser ? `
                    <div class="comment-form">
                        <textarea id="commentContent" placeholder="发表你的看法..."></textarea>
                        <button class="btn-primary btn-small" onclick="submitComment(${postId})">发表评论</button>
                    </div>
                ` : `
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">
                        请先 <a href="#" onclick="event.preventDefault(); showAuthModal('login');">登录</a> 后发表评论
                    </p>
                `}
                <div id="commentsList">
                    ${comments.map(c => {
                        const commentAuthor = db2.users.find(u => u.id === c.user_id) || { username: '未知用户' };
                        return `
                            <div class="comment">
                                <div class="comment-header">
                                    <div class="comment-author">
                                        <div class="comment-author-avatar">${getInitials(commentAuthor.username)}</div>
                                        <span class="comment-author-name">${escapeHtml(commentAuthor.username)}</span>
                                    </div>
                                    <span class="comment-time">${formatDate(c.created_at)}</span>
                                </div>
                                <p class="comment-content">${escapeHtml(c.content)}</p>
                                ${currentUser && (currentUser.id === c.user_id || currentUser.role === 'admin') ? `
                                    <div class="comment-footer">
                                        <span class="comment-action" onclick="deleteComment(${c.id}, ${postId})">删除</span>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function closePostModal() {
    document.getElementById('postModal').classList.remove('show');
}

function toggleLike(postId, isLiked) {
    if (!currentUser) { showAuthModal('login'); return; }
    
    const db = getDB();
    const likeKey = `${currentUser.id}_${postId}`;
    const idx = db.likes.indexOf(likeKey);
    const post = db.posts.find(p => p.id === postId);
    
    if (idx === -1) {
        db.likes.push(likeKey);
        post.likes++;
    } else {
        db.likes.splice(idx, 1);
        post.likes--;
    }
    
    saveDB(db);
    loadPostDetail(postId);
    loadPosts(currentPage);
    showToast(idx === -1 ? '点赞成功' : '取消点赞');
}

function submitComment(postId) {
    if (!currentUser) { showAuthModal('login'); return; }
    
    const content = document.getElementById('commentContent').value.trim();
    if (!content) { showToast('评论内容不能为空', 'error'); return; }
    
    const db = getDB();
    const post = db.posts.find(p => p.id === postId);
    if (!post.comments) post.comments = [];
    
    post.comments.push({
        id: db.nextId.comment++,
        content,
        user_id: currentUser.id,
        created_at: new Date().toISOString()
    });
    
    saveDB(db);
    showToast('评论成功');
    loadPostDetail(postId);
}

function deleteComment(commentId, postId) {
    if (!confirm('确定要删除这条评论吗？')) return;
    
    const db = getDB();
    const post = db.posts.find(p => p.id === postId);
    if (post.comments) {
        post.comments = post.comments.filter(c => c.id !== commentId);
    }
    saveDB(db);
    showToast('评论已删除');
    loadPostDetail(postId);
}

function deletePost(postId) {
    if (!confirm('确定要删除这篇帖子吗？')) return;
    
    const db = getDB();
    const post = db.posts.find(p => p.id === postId);
    if (post) {
        post.deleted = true;
        const user = db.users.find(u => u.id === post.user_id);
        if (user) user.post_count--;
    }
    saveDB(db);
    showToast('帖子已删除');
    closePostModal();
    loadPosts(currentPage);
}

// ============== 发帖 ==============
function openPostModal() {
    if (!currentUser) { showAuthModal('login'); return; }
    document.getElementById('createPostModal').classList.add('show');
}

function closeCreatePostModal() {
    document.getElementById('createPostModal').classList.remove('show');
    document.getElementById('createPostForm').reset();
}

function createPost(event) {
    event.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const category = document.getElementById('postCategory').value;
    const tags = document.getElementById('postTags').value;
    
    const db = getDB();
    const newPost = {
        id: db.nextId.post++,
        title,
        content,
        category,
        tags,
        views: 0,
        likes: 0,
        is_pinned: false,
        user_id: currentUser.id,
        created_at: new Date().toISOString(),
        comments: []
    };
    
    db.posts.push(newPost);
    const user = db.users.find(u => u.id === currentUser.id);
    if (user) user.post_count++;
    saveDB(db);
    
    showToast('发布成功');
    closeCreatePostModal();
    loadPosts(1);
}

// ============== 筛选和搜索 ==============
function showCategory(category) {
    currentCategory = category;
    currentPage = 1;
    document.getElementById('categoryFilter').value = category;
    document.getElementById('currentCategory').textContent = category;
    loadPosts(1);
}

function filterPosts() {
    currentCategory = document.getElementById('categoryFilter').value;
    currentPage = 1;
    document.getElementById('currentCategory').textContent = currentCategory || '全部帖子';
    loadPosts(1);
}

function searchPosts() {
    currentSearch = document.getElementById('searchInput').value.trim();
    currentPage = 1;
    document.getElementById('currentCategory').textContent = currentSearch ? `搜索: ${currentSearch}` : '全部帖子';
    loadPosts(1);
}

function searchByTag(tag) {
    document.getElementById('searchInput').value = tag;
    searchPosts();
}

// ============== 工具函数 ==============
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// ============== 初始化 ==============
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadPosts(1);
    
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchPosts();
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    });
});
