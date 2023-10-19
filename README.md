# Sync To Xlog

An Obsidian plugin that syncs notes to xlog.app.
一个 Obsidian 插件，可以把笔记同步到 xlog.app 上。

## 相关截图

上传弹窗

![](./assets/Snipaste_2023-10-16_23-17-44.png)

设置截图

![](./assets/Snipaste_2023-10-17_11-36-19.png)

## 使用方式

在官方插件审核通过之前，需要访问 https://github.com/Otto-J/sync-to-xlog/releases 下载最新 dist.zip 文件夹，放入插件目录

设置 - 第三方插件 - 已安装插件右侧有个文件夹图标。解压后放入即可。

![](./assets/20231019_114353.png)

首次使用，点击插件设置，按照提示填写 token 并点击连接测试。

如果你更习惯观看视频，我甚至还做了一个视频教程，放入了 B 站

[《介绍我开发的 Obsidian-sync-xlog 插件：轻松帮你同步 obsidian 内容到 xlog 上》](https://www.bilibili.com/video/BV1rQ4y1s7Fa/)

## 当前进展

等待官方插件上线。

项目背景和程序设计可以访问 https://blog.ijust.cc/play-xlog-03

目前已实现功能：

- [x] 完成设置面板
- [x] 完成上传提示
- [x] 完成新增和更新功能
- [x] 更新信息同步回填到 frontMatter 中
- [x] md 中的 图片处理为 ipfs

未来可能会和 xlog/CrossBell 官方建立联系，也说不定。

## 目前已知问题

主流程已通，目前存在以下问题，如果你有空闲可以提 PR 帮我修改，感谢。

- obsidian 内置的图片不会读取，也就是 `![[图片.jpg]]` 不知道如何读取，会导致读取失败
- 不确定图片里包含空格等关键字是否影响上传
- 打印的日志比较凌乱，不规整
- ~~页面正文不能包含 `![]()` 和 `![[]]` 脆弱的正则没有处理好~~
- 发包靠手打，不太会搞命令行

## 开发

目前还在早期阶段，欢迎参与。

```bash
git clone
pnpm i
# dev
npm run dev

# build
npm run build
```

## Copyright

MIT
