# ACG二次元游戏论坛

一个专注于二次元游戏内容讨论、同人创作和攻略分享的论坛网站。

## 功能特性

- 🏠 **首页** - 帖子浏览、分类筛选、搜索功能
- 👤 **用户页面** - 个人资料管理、帖子查看
- ⚙️ **管理后台** - 数据统计、帖子管理、用户管理
- 💬 **评论系统** - 帖子评论和互动
- ❤️ **点赞功能** - 帖子点赞支持

## 快速开始

### 前端版本（可直接使用）

1. 克隆仓库
```bash
git clone https://github.com/yourusername/acg_forum.git
```

2. 进入目录
```bash
cd acg_forum
cd dist
```

3. 使用Python启动静态服务器
```bash
python -m http.server 5000
```

4. 打开浏览器访问 http://localhost:5000

### Python后端版本

1. 安装依赖
```bash
pip install -r requirements.txt
```

2. 启动服务器
```bash
python app.py
```

3. 打开浏览器访问 http://localhost:5000

## 登录账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 普通用户 | 原神萌新 | 123456 |
| 普通用户 | 崩坏老玩家 | 123456 |
| 普通用户 | 同人创作者 | 123456 |

## 项目结构

```
acg_forum/
├── dist/                    # 前端部署版本
│   ├── index.html          # 首页
│   ├── user.html           # 用户页面
│   ├── admin.html          # 管理后台
│   ├── css/
│   │   └── style.css       # 样式文件
│   ├── js/
│   │   ├── app.js          # 首页逻辑
│   │   ├── user.js         # 用户页逻辑
│   │   └── admin.js        # 管理后台逻辑
│   └── images/
├── static/                  # 后端静态文件
├── app.py                   # Flask后端主文件
└── requirements.txt         # Python依赖
```

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Python Flask, SQLAlchemy
- **数据库**: SQLite
- **样式**: 自定义CSS（暗色主题）

## 许可证

MIT License
