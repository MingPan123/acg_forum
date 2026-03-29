# ACG二次元游戏论坛

一个专注于二次元游戏内容讨论、同人创作和攻略分享的论坛网站。

## 功能特性

- **首页** - 帖子浏览、分类筛选、搜索功能
- **用户页面** - 个人资料管理、帖子查看
- **管理后台** - 数据统计、帖子管理、用户管理
- **评论系统** - 帖子评论和互动
- **点赞功能** - 帖子点赞支持

## 快速开始

### 前端版本（可直接使用）

`ash
# 克隆仓库
git clone https://github.com/MingPan123/acg_forum.git
cd acg_forum/dist
python -m http.server 5000
# 访问 http://localhost:5000
`

### Python后端版本

`ash
pip install -r requirements.txt
python app.py
# 访问 http://localhost:5000
`

## 登录账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 普通用户 | 原神萌新 | 123456 |
| 普通用户 | 崩坏老玩家 | 123456 |
| 普通用户 | 同人创作者 | 123456 |

## 技术栈

- 前端: HTML5, CSS3, JavaScript
- 后端: Python Flask, SQLAlchemy
- 数据库: SQLite

## 许可证

MIT License