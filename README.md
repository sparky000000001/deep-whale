# 深鲸线稿主题（deep-whale）

给 DeepSeek Harness 的 Web 界面加一层**线稿背景**，并把主题色、边框色、填充色、文字效果做成设置页里的可调控件。

> 本仓库不含任何背景图片。首次安装后，请在「设置 → 插件 → 深鲸线稿」里上传你自己的图片。

## 功能

| 区块 | 控件 |
|---|---|
| 主题色 | 颜色选择器 → 覆盖按钮 / 链接 / 高亮 / 焦点圈 / 滚动条 |
| 边框色 | 颜色选择器 → 覆盖边框与描边 |
| 填充色 | 颜色选择器 → 覆盖卡片 / 输入框 / 侧栏 / 气泡 / 代码块；可选“同时覆盖页面底” |
| 线稿背景 | 上传图片（可自动按线条处理：白底透明、线条原色）；亮/深色线条浓度；浅色/深色主题分别可反相 |
| 文字与缩放 | 界面缩放 0.85~1.25；文字柔光强度 0~1；文字加粗；文字描边 |
| 意见反馈 | 跳转到本仓库 Issues（修改 `lib/client.js` 里的 `FEEDBACK_URL`） |

所有设置保存在浏览器 `localStorage`，改动即时生效。

## 安装

前提：DeepSeek Harness ≥ 0.2.1（桌面版或 CLI Web 版均可）。

### 方式一：从本地目录安装

```bash
dsh plugin --profile desktop add /path/to/deep-whale
```

（桌面版的 profile 名通常是 `desktop`；CLI Web 版按你的实际 profile 改。）

### 方式二：在桌面版插件页安装

1. 侧栏「插件」→「添加插件」→ 填入本包的路径或 npm 包名
2. 安装后启用，**重启一次 DSH**
3. 打开「设置 → 插件 → 深鲸线稿」开始配置

## 目录结构

```
lib/index.js        Host 半边（空实现，仅注册插件行）
lib/client.js       浏览器半边：样式注入 + 设置页 UI（React）
cordis.patch.yml    插入插件行
locale/*.json       标题/描述
icon.svg            图标
```

## 自定义反馈地址

编辑 `lib/client.js`，把：

```js
var FEEDBACK_URL = 'https://github.com/sparky000000001/deep-whale/issues';
```

改成你自己的仓库 Issues 地址。

## 许可

MIT。背景图片由使用者自行提供，与本仓库无关。
