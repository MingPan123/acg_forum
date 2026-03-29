"""
ACG二次元游戏论坛 - 后端API服务
"""
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__, static_folder='static')
CORS(app)

# 数据库配置
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///acg_forum.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'acg_forum_secret_key_2024'

db = SQLAlchemy(app)


# ============== 数据库模型 ==============

class User(db.Model):
    """用户模型"""
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(100))
    avatar = db.Column(db.String(200), default='/static/images/default_avatar.png')
    bio = db.Column(db.String(500))
    role = db.Column(db.String(20), default='user')  # user, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    posts = db.relationship('Post', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='author', lazy=True)


class Post(db.Model):
    """帖子模型"""
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # 攻略, 同人创作, 游戏讨论, 综合
    tags = db.Column(db.String(200))  # 逗号分隔的标签
    views = db.Column(db.Integer, default=0)
    likes = db.Column(db.Integer, default=0)
    is_pinned = db.Column(db.Boolean, default=False)
    is_deleted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    comments = db.relationship('Comment', backref='post', lazy=True)


class Comment(db.Model):
    """评论模型"""
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    likes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)


class Like(db.Model):
    """点赞模型"""
    __tablename__ = 'likes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id'),)


# ============== 辅助函数 ==============

def get_current_user():
    """获取当前登录用户"""
    user_id = request.headers.get('X-User-Id')
    if user_id:
        return User.query.get(int(user_id))
    return None


# ============== API路由 ==============

@app.route('/')
def index():
    """返回前端页面"""
    return send_from_directory('static', 'index.html')


@app.route('/user/<path:path>')
def user_page(path):
    """用户页面路由"""
    if path == '' or path == '/':
        return send_from_directory('static', 'user.html')
    return send_from_directory('static', path)


@app.route('/admin/<path:path>')
def admin_page(path):
    """管理员页面路由"""
    if path == '' or path == '/':
        return send_from_directory('static', 'admin.html')
    return send_from_directory('static', path)


@app.route('/static/<path:path>')
def static_files(path):
    """静态文件路由"""
    return send_from_directory('static', path)


# ---- 认证API ----

@app.route('/api/auth/register', methods=['POST'])
def register():
    """用户注册"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    
    if not username or not password:
        return jsonify({'success': False, 'message': '用户名和密码不能为空'}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': '用户名已存在'}), 400
    
    user = User(
        username=username,
        password_hash=generate_password_hash(password),
        email=email,
        role='user'
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'success': True, 
        'message': '注册成功',
        'user': {'id': user.id, 'username': user.username, 'role': user.role}
    })


@app.route('/api/auth/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'success': False, 'message': '用户名或密码错误'}), 401
    
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '登录成功',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'avatar': user.avatar,
            'bio': user.bio,
            'role': user.role
        }
    })


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """用户登出"""
    return jsonify({'success': True, 'message': '已退出登录'})


@app.route('/api/auth/current', methods=['GET'])
def get_current():
    """获取当前用户信息"""
    user = get_current_user()
    if not user:
        return jsonify({'success': False, 'message': '未登录'}), 401
    
    return jsonify({
        'success': True,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'avatar': user.avatar,
            'bio': user.bio,
            'role': user.role,
            'created_at': user.created_at.isoformat() if user.created_at else None
        }
    })


# ---- 用户API ----

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """获取用户信息"""
    user = User.query.get_or_404(user_id)
    return jsonify({
        'success': True,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'avatar': user.avatar,
            'bio': user.bio,
            'role': user.role,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'post_count': len(user.posts),
            'comment_count': len(user.comments)
        }
    })


@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """更新用户信息"""
    current = get_current_user()
    if not current or current.id != user_id:
        return jsonify({'success': False, 'message': '无权限'}), 403
    
    data = request.json
    if 'email' in data:
        current.email = data['email']
    if 'bio' in data:
        current.bio = data['bio']
    if 'avatar' in data:
        current.avatar = data['avatar']
    
    db.session.commit()
    return jsonify({'success': True, 'message': '更新成功'})


@app.route('/api/users/password', methods=['PUT'])
def change_password():
    """修改密码"""
    current = get_current_user()
    if not current:
        return jsonify({'success': False, 'message': '未登录'}), 401
    
    data = request.json
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    if not check_password_hash(current.password_hash, old_password):
        return jsonify({'success': False, 'message': '原密码错误'}), 400
    
    current.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({'success': True, 'message': '密码修改成功'})


@app.route('/api/users/<int:user_id>/posts', methods=['GET'])
def get_user_posts(user_id):
    """获取用户发布的帖子"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    posts = Post.query.filter_by(user_id=user_id, is_deleted=False)\
        .order_by(Post.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'success': True,
        'posts': [{
            'id': p.id,
            'title': p.title,
            'content': p.content[:200] + '...' if len(p.content) > 200 else p.content,
            'category': p.category,
            'tags': p.tags,
            'views': p.views,
            'likes': p.likes,
            'comment_count': len(p.comments),
            'created_at': p.created_at.isoformat() if p.created_at else None,
            'author': {'id': p.author.id, 'username': p.author.username, 'avatar': p.author.avatar}
        } for p in posts.items],
        'total': posts.total,
        'pages': posts.pages,
        'current_page': page
    })


# ---- 帖子API ----

@app.route('/api/posts', methods=['GET'])
def get_posts():
    """获取帖子列表"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    category = request.args.get('category')
    search = request.args.get('search')
    sort = request.args.get('sort', 'latest')  # latest, hot, pinned
    
    query = Post.query.filter_by(is_deleted=False)
    
    if category:
        query = query.filter_by(category=category)
    if search:
        query = query.filter(
            db.or_(
                Post.title.contains(search),
                Post.content.contains(search)
            )
        )
    
    if sort == 'hot':
        query = query.order_by(Post.views.desc())
    elif sort == 'pinned':
        query = query.order_by(Post.is_pinned.desc(), Post.created_at.desc())
    else:
        query = query.order_by(Post.is_pinned.desc(), Post.created_at.desc())
    
    posts = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'success': True,
        'posts': [{
            'id': p.id,
            'title': p.title,
            'content': p.content[:200] + '...' if len(p.content) > 200 else p.content,
            'category': p.category,
            'tags': p.tags,
            'views': p.views,
            'likes': p.likes,
            'comment_count': len(p.comments),
            'is_pinned': p.is_pinned,
            'created_at': p.created_at.isoformat() if p.created_at else None,
            'author': {'id': p.author.id, 'username': p.author.username, 'avatar': p.author.avatar}
        } for p in posts.items],
        'total': posts.total,
        'pages': posts.pages,
        'current_page': page
    })


@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """获取帖子详情"""
    post = Post.query.get_or_404(post_id)
    post.views += 1
    db.session.commit()
    
    current_user = get_current_user()
    is_liked = False
    if current_user:
        like = Like.query.filter_by(user_id=current_user.id, post_id=post_id).first()
        is_liked = like is not None
    
    return jsonify({
        'success': True,
        'post': {
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'category': post.category,
            'tags': post.tags,
            'views': post.views,
            'likes': post.likes,
            'is_pinned': post.is_pinned,
            'is_liked': is_liked,
            'created_at': post.created_at.isoformat() if post.created_at else None,
            'updated_at': post.updated_at.isoformat() if post.updated_at else None,
            'author': {
                'id': post.author.id,
                'username': post.author.username,
                'avatar': post.author.avatar,
                'bio': post.author.bio
            },
            'comments': [{
                'id': c.id,
                'content': c.content,
                'likes': c.likes,
                'created_at': c.created_at.isoformat() if c.created_at else None,
                'author': {'id': c.author.id, 'username': c.author.username, 'avatar': c.author.avatar}
            } for c in post.comments]
        }
    })


@app.route('/api/posts', methods=['POST'])
def create_post():
    """创建帖子"""
    current = get_current_user()
    if not current:
        return jsonify({'success': False, 'message': '请先登录'}), 401
    
    data = request.json
    title = data.get('title')
    content = data.get('content')
    category = data.get('category', '综合')
    tags = data.get('tags', '')
    
    if not title or not content:
        return jsonify({'success': False, 'message': '标题和内容不能为空'}), 400
    
    post = Post(
        title=title,
        content=content,
        category=category,
        tags=tags,
        user_id=current.id
    )
    db.session.add(post)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '发布成功',
        'post': {
            'id': post.id,
            'title': post.title,
            'category': post.category
        }
    })


@app.route('/api/posts/<int:post_id>', methods=['PUT'])
def update_post(post_id):
    """更新帖子"""
    current = get_current_user()
    if not current:
        return jsonify({'success': False, 'message': '请先登录'}), 401
    
    post = Post.query.get_or_404(post_id)
    if post.user_id != current.id and current.role != 'admin':
        return jsonify({'success': False, 'message': '无权限'}), 403
    
    data = request.json
    if 'title' in data:
        post.title = data['title']
    if 'content' in data:
        post.content = data['content']
    if 'category' in data:
        post.category = data['category']
    if 'tags' in data:
        post.tags = data['tags']
    
    db.session.commit()
    return jsonify({'success': True, 'message': '更新成功'})


@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post(post_id):
    """删除帖子"""
    current = get_current_user()
    if not current:
        return jsonify({'success': False, 'message': '请先登录'}), 401
    
    post = Post.query.get_or_404(post_id)
    if post.user_id != current.id and current.role != 'admin':
        return jsonify({'success': False, 'message': '无权限'}), 403
    
    post.is_deleted = True
    db.session.commit()
    return jsonify({'success': True, 'message': '删除成功'})


@app.route('/api/posts/<int:post_id>/like', methods=['POST'])
def like_post(post_id):
    """点赞/取消点赞"""
    current = get_current_user()
    if not current:
        return jsonify({'success': False, 'message': '请先登录'}), 401
    
    post = Post.query.get_or_404(post_id)
    like = Like.query.filter_by(user_id=current.id, post_id=post_id).first()
    
    if like:
        db.session.delete(like)
        post.likes -= 1
        action = 'unliked'
    else:
        like = Like(user_id=current.id, post_id=post_id)
        db.session.add(like)
        post.likes += 1
        action = 'liked'
    
    db.session.commit()
    return jsonify({'success': True, 'action': action, 'likes': post.likes})


# ---- 评论API ----

@app.route('/api/posts/<int:post_id>/comments', methods=['POST'])
def create_comment(post_id):
    """添加评论"""
    current = get_current_user()
    if not current:
        return jsonify({'success': False, 'message': '请先登录'}), 401
    
    data = request.json
    content = data.get('content')
    
    if not content:
        return jsonify({'success': False, 'message': '评论内容不能为空'}), 400
    
    post = Post.query.get_or_404(post_id)
    comment = Comment(
        content=content,
        user_id=current.id,
        post_id=post_id
    )
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': '评论成功',
        'comment': {
            'id': comment.id,
            'content': comment.content,
            'created_at': comment.created_at.isoformat(),
            'author': {'id': current.id, 'username': current.username, 'avatar': current.avatar}
        }
    })


@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    """删除评论"""
    current = get_current_user()
    if not current:
        return jsonify({'success': False, 'message': '请先登录'}), 401
    
    comment = Comment.query.get_or_404(comment_id)
    if comment.user_id != current.id and current.role != 'admin':
        return jsonify({'success': False, 'message': '无权限'}), 403
    
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'success': True, 'message': '删除成功'})


# ---- 管理API ----

@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    """获取所有用户（管理员）"""
    current = get_current_user()
    if not current or current.role != 'admin':
        return jsonify({'success': False, 'message': '无权限'}), 403
    
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({
        'success': True,
        'users': [{
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'role': u.role,
            'created_at': u.created_at.isoformat() if u.created_at else None,
            'post_count': len(u.posts),
            'last_login': u.last_login.isoformat() if u.last_login else None
        } for u in users]
    })


@app.route('/api/admin/posts', methods=['GET'])
def admin_get_posts():
    """获取所有帖子（管理员）"""
    current = get_current_user()
    if not current or current.role != 'admin':
        return jsonify({'success': False, 'message': '无权限'}), 403
    
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return jsonify({
        'success': True,
        'posts': [{
            'id': p.id,
            'title': p.title,
            'category': p.category,
            'views': p.views,
            'likes': p.likes,
            'is_pinned': p.is_pinned,
            'is_deleted': p.is_deleted,
            'created_at': p.created_at.isoformat() if p.created_at else None,
            'author': {'id': p.author.id, 'username': p.author.username}
        } for p in posts]
    })


@app.route('/api/admin/posts/<int:post_id>/pin', methods=['POST'])
def admin_pin_post(post_id):
    """置顶/取消置顶帖子"""
    current = get_current_user()
    if not current or current.role != 'admin':
        return jsonify({'success': False, 'message': '无权限'}), 403
    
    post = Post.query.get_or_404(post_id)
    post.is_pinned = not post.is_pinned
    db.session.commit()
    return jsonify({'success': True, 'is_pinned': post.is_pinned})


@app.route('/api/admin/users/<int:user_id>/role', methods=['PUT'])
def admin_update_user_role(user_id):
    """更新用户角色"""
    current = get_current_user()
    if not current or current.role != 'admin':
        return jsonify({'success': False, 'message': '无权限'}), 403
    
    data = request.json
    role = data.get('role')
    
    if role not in ['user', 'admin']:
        return jsonify({'success': False, 'message': '无效的角色'}), 400
    
    user = User.query.get_or_404(user_id)
    user.role = role
    db.session.commit()
    return jsonify({'success': True, 'message': '角色更新成功'})


@app.route('/api/admin/stats', methods=['GET'])
def admin_get_stats():
    """获取统计数据"""
    current = get_current_user()
    if not current or current.role != 'admin':
        return jsonify({'success': False, 'message': '无权限'}), 403
    
    total_users = User.query.count()
    total_posts = Post.query.filter_by(is_deleted=False).count()
    total_comments = Comment.query.count()
    
    # 获取今日数据
    today = datetime.utcnow().date()
    today_posts = Post.query.filter(
        db.func.date(Post.created_at) == today
    ).count()
    today_users = User.query.filter(
        db.func.date(User.created_at) == today
    ).count()
    
    return jsonify({
        'success': True,
        'stats': {
            'total_users': total_users,
            'total_posts': total_posts,
            'total_comments': total_comments,
            'today_posts': today_posts,
            'today_users': today_users
        }
    })


# ============== 初始化数据库 ==============

def init_db():
    """初始化数据库和示例数据"""
    with app.app_context():
        db.create_all()
        
        # 检查是否已有数据
        if User.query.count() == 0:
            # 创建管理员账户
            admin = User(
                username='admin',
                password_hash=generate_password_hash('admin123'),
                email='admin@acgforum.com',
                role='admin',
                bio='论坛管理员'
            )
            db.session.add(admin)
            
            # 创建示例用户
            users_data = [
                {'username': '原神萌新', 'email': 'genshin@acg.com', 'bio': '提瓦特冒险者，正在探索提瓦特大陆的奥秘'},
                {'username': '崩坏老玩家', 'email': 'honkai@acg.com', 'bio': '从崩坏2开始的老舰长，见证崩坏的成长'},
                {'username': '同人创作者', 'email': 'artist@acg.com', 'bio': '专注二次创作的画师，欢迎交流~'},
            ]
            
            for udata in users_data:
                user = User(
                    username=udata['username'],
                    password_hash=generate_password_hash('123456'),
                    email=udata['email'],
                    bio=udata['bio']
                )
                db.session.add(user)
            
            db.session.commit()
            
            # 创建示例帖子
            posts_data = [
                {
                    'title': '【原神】4.8版本新角色养成攻略',
                    'content': '''# 新角色养成指南

## 角色简介
本次更新推出的新角色是一个五星雷元素角色，拥有独特的技能机制。

## 天赋加点
优先升级元素战技，其次是元素爆发，普通攻击可以最后升级。

## 圣遗物搭配
推荐使用「绝缘之旗印」四件套，优先堆叠元素充能效率。

## 武器推荐
1. 五星：专武「薙草之永劫」
2. 四星：钓鱼兑换的「渔获」
3. 三星：充能向可选「吃虎鱼刀」

## 配队建议
最佳阵容：雷电将军 + 纳西妲 + 行秋 + 久岐忍

希望这份攻略对大家有帮助！''',
                    'category': '攻略',
                    'tags': '原神,养成,雷电将军',
                    'user_id': 1,
                    'views': 1234,
                    'likes': 256
                },
                {
                    'title': '【同人创作】甘雨-璃月风情',
                    'content': '''# 甘雨同人图分享

这是一幅我画的甘雨同人图，灵感来源于璃月的山水风景。

## 创作说明
- 画风：厚涂
- 尺寸：1920x2560
- 耗时：约8小时

## 使用的工具
- Photoshop
- 数位板：Wacom Intuos Pro

欢迎大家交流绘画心得！''',
                    'category': '同人创作',
                    'tags': '甘雨,同人,绘画',
                    'user_id': 4
                },
                {
                    'title': '崩坏星穹铁道：虚构叙事引擎C位攻略',
                    'content': '''# 虚构叙事引擎C位角色推荐

## 简介
虚构叙事是星穹铁道的常驻玩法，需要多核输出角色。

## T0角色推荐
1. **黄泉** - 版本答案，几乎所有虚构都适用
2. **真理医生** - 智识一哥，对单伤害爆炸

## 配队思路
虚构叙事需要尽可能覆盖多种伤害类型和弱点。

## 细节要点
- 注意保留终结技对付精英怪
- 利用增益角色最大化输出
- 合理安排行动顺序''',
                    'category': '攻略',
                    'tags': '星穹铁道,虚构叙事,角色推荐',
                    'user_id': 2
                },
                {
                    'title': '【游戏讨论】你们觉得什么是好游戏？',
                    'content': '''作为一个玩了很多年游戏的老玩家，我想和大家聊聊什么才是好游戏。

## 我的看法
1. **剧情优秀** - 哪怕玩法一般，好的剧情也能让人沉浸
2. **美术风格独特** - 让人一眼就能记住
3. **音乐好听** - 好的BGM能让游戏升华
4. **玩法创新** - 带来新鲜感

## 大家觉得呢？
欢迎在评论区分享你们的看法！''',
                    'category': '游戏讨论',
                    'tags': '游戏,讨论,闲聊',
                    'user_id': 1
                },
                {
                    'title': '【同人创作】艾尔海森-学者风COS',
                    'content': '''分享一组艾尔海森的COS正片！

## 拍摄信息
- 地点：须弥雨林实景拍摄
- 后期：调色参考游戏内色调

## 道具准备
- 服装：定制款学者袍
- 眼镜：银色细框眼镜
- 书本：须弥相关书籍道具

这是我的第一组原神COS，还请大家多多指教！''',
                    'category': '同人创作',
                    'tags': '艾尔海森,COS,原神',
                    'user_id': 4
                },
                {
                    'title': '【综合】新人报道，请多关照！',
                    'content': '''大家好！我是刚入坑的新人玩家。

## 入坑契机
看了朋友的介绍视频，决定入坑原神，结果一发不可收拾...

## 目前进度
- 冒险等级45
- 刚完成稻妻主线
- 正在练雷神国家队

## 求助
有什么新手建议吗？求大佬们带带！

感谢大家！''',
                    'category': '综合',
                    'tags': '新人,求助,原神',
                    'user_id': 3
                }
            ]
            
            for i, pdata in enumerate(posts_data):
                post = Post(**pdata)
                db.session.add(post)
            
            db.session.commit()
            
            # 为部分帖子添加评论
            comments_data = [
                {'content': '写得真详细，感谢分享！', 'user_id': 3, 'post_id': 1},
                {'content': '配队很实用，测试过了', 'user_id': 2, 'post_id': 1},
                {'content': '画得太好看了！求原图', 'user_id': 2, 'post_id': 2},
                {'content': '黄泉确实强，我也用她过的', 'user_id': 1, 'post_id': 3},
                {'content': '同感！剧情是游戏的灵魂', 'user_id': 4, 'post_id': 4},
                {'content': '欢迎新人！有什么问题尽管问', 'user_id': 1, 'post_id': 6},
            ]
            
            for cdata in comments_data:
                comment = Comment(**cdata)
                db.session.add(comment)
            
            db.session.commit()
            print('数据库初始化完成！示例数据已添加。')


# ============== 启动应用 ==============

if __name__ == '__main__':
    # 确保静态目录存在
    os.makedirs('static/images', exist_ok=True)
    
    # 初始化数据库
    init_db()
    
    # 启动服务器
    print('=' * 50)
    print('ACG二次元游戏论坛 已启动！')
    print('=' * 50)
    print('论坛地址: http://localhost:5000')
    print('管理员账号: admin')
    print('管理员密码: admin123')
    print('=' * 50)
    app.run(host='0.0.0.0', port=5000, debug=True)
