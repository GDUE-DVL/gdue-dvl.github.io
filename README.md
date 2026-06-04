# 广东第二师范学院深度视觉实验室官网

This repository hosts the static website for the Deep Vision Lab at Guangdong University of Education.

站点地址：<https://gdue-dvl.github.io/>

## 项目概览

这是一个面向实验室展示和信息维护的纯静态网站，使用 HTML、CSS 和少量 JavaScript 构建，可直接通过 GitHub Pages 部署。网站内容覆盖实验室简介、研究方向、团队成员、科研成果、新闻动态和联系方式。

当前版本采用克制的黑白灰视觉系统，并使用深绿 `#19433C` 作为小面积强调色。页面中的图片和成员照片保留原始色彩，不做灰度或滤镜处理。

## 页面结构

| 文件 | 页面 | 内容 |
| --- | --- | --- |
| `index.html` | 主页 | 实验室简介、核心方向、精选论文、最新动态 |
| `research.html` | 研究方向 | 视频质量评估、农业识别、教师质量评估、扩散模型应用、人群计数 |
| `people.html` | 团队成员 | 教师团队、学生团队、可翻转成员卡片、加入我们 |
| `publications.html` | 科研成果 | 论文统计、按类型筛选、奖项荣誉、科研项目 |
| `news.html` | 新闻动态 | 新闻搜索、年份筛选、类别筛选、新闻卡片 |

## 目录说明

```text
.
├── index.html
├── research.html
├── people.html
├── publications.html
├── news.html
├── generate_team.py
├── css/
│   ├── common.css
│   ├── style.css
│   ├── bootstrap.min.css
│   └── viewer.css
├── js/
│   ├── common.js
│   ├── jquery.min.js
│   ├── bootstrap.min.js
│   ├── bootstrap-hover-dropdown.js
│   ├── viewer.js
│   └── menus.js
├── images/
│   ├── black logo.png
│   ├── white logo.png
│   ├── t-*.png
│   └── s-*.jpg
└── people/
    ├── people.md
    ├── t/
    └── s/
```

## 视觉与交互

主要样式集中在 `css/common.css`：

- 黑白灰基础界面：白色页面背景、黑灰文字、细分割线。
- 深绿强调色：导航当前项、主按钮、筛选激活态、论文链接按钮、卡片左侧强调线。
- 页脚：深绿背景，配合滚动透明度渐变，减少底部大色块的突兀感。
- Logo：页脚使用 `images/white logo.png` 原图显示，不再叠加反色滤镜或透明度压暗。

公共交互集中在 `js/common.js`：

- `initFooterReveal()` 根据页脚进入视口的比例更新 `--footer-progress`。
- 页脚背景透明度、内容透明度和位移由 CSS 变量驱动，滚动到底部时逐步变实。

各页面也包含少量局部脚本：

- 移动端导航展开/收起。
- `news.html` 的搜索、年份筛选和类别筛选。
- `publications.html` 的成果类型筛选。
- `people.html` 的成员卡片点击翻转。

## 内容维护

### 修改团队成员

成员数据主要维护在 `people/people.md` 中。修改后运行：

```bash
python generate_team.py
```

脚本会读取 `people/people.md`，并替换 `people.html` 中 `AUTO_TEACHERS` 和 `AUTO_STUDENTS` 标记之间的成员卡片。

成员图片放在 `images/` 目录下，命名建议保持：

- 教师：`t-姓名缩写.png`
- 学生：`s-姓名缩写.jpg`

### 修改研究方向

直接编辑 `research.html` 中的对应研究块。每个方向一般包含：

- 中文标题和英文副标题
- 方向说明
- 关键研究点
- 项目标签

### 修改科研成果

直接编辑 `publications.html`。论文卡片使用 `data-tags` 控制筛选类型，例如：

```html
<div class="publication-card" data-tags="SCI">
```

筛选按钮位于页面顶部的 `.filter-section`。

### 修改新闻动态

直接编辑 `news.html`。每条新闻使用 `article.news-card`，并通过 `data-year` 和 `data-type` 支持筛选：

```html
<article class="news-card" data-year="2026" data-type="paper">
```

可用类别包括 `award`、`paper` 和 `event`，如需新增类别，需要同步修改筛选按钮。

## 本地预览

本项目是静态网站，可使用任意静态服务器预览。例如：

```bash
python -m http.server 8000
```

然后访问：

```text
http://127.0.0.1:8000/
```

如果本机没有可用 Python，也可以使用 Node.js 或 VS Code Live Server。

## 部署

仓库名为 `GDUE-DVL/gdue-dvl.github.io`，默认通过 GitHub Pages 从 `main` 分支发布。将修改提交并推送到 `main` 后，GitHub Pages 会自动更新。

常规发布流程：

```bash
git add .
git commit -m "Update website"
git push origin main
```

如果页面没有立即刷新，通常是 GitHub Pages 构建或浏览器缓存导致，等待一两分钟后强制刷新即可。

## 维护注意事项

- 不要删除 `.nojekyll`，它用于避免 GitHub Pages 按 Jekyll 规则处理静态文件。
- 页面脚本依赖顺序应保持 `jquery.min.js` 在 `bootstrap.min.js` 之前。
- 公共颜色优先在 `css/common.css` 的 `:root` 变量中修改，避免在页面内分散硬编码。
- 页脚滚动效果依赖每个页面引用 `js/common.js?v=footer-reveal`。
- 添加新页面时应复用 `main-header`、`main-footer` 和 `css/common.css` 中的公共样式。
