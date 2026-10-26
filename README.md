# 鲸鱼娘开场 · dsh-whale-startup

DeepSeek Harness 桌面端的独立开场动画插件：鲸鱼娘在原生加载页等候，工作台就绪后拍走加载提示、放大欢呼“开工！”，然后淡出消失。

![鲸鱼娘放大欢呼与漫画气泡](docs/preview.png)

[观看 4.2 秒演示](docs/preview.mp4)。图和视频为设计样片；安装后的底层界面是正在运行的真实工作台。

## 功能

- 保留原生 `HARNESS`、旋转圆环与加载状态，同步真实插件进度。
- 通过工作台 `shell.overlay` 的 React layout effect 确认提交完成，再播放退场。
- 原生失败提示保持可见；素材或就绪桥不可用时回退到原生界面。
- 独立运行，无需 `dsh-whale-widget` 等挂件插件。放大到画面中央欢呼后，自行清理并退出。
- 对白采用漫画气泡；“开工！”使用大号粗描边字和放射线。
- 不读取、隐藏、移动或修改其他挂件；它们继续按自己的设置运行。
- 遵循系统“减少动态”偏好，改为淡入淡出；默认无声音。
- 通过 dsh 原生插件机制加载，不修改应用包或签名，不增加模型提示或工具。

角色采用七个关键姿势的有限动画。演示视频的 60 fps 是输出采样帧率。

1.1.0 的结尾为：**拍走加载提示 → 居中放大 → 举手欢呼“开工！” → 淡出消失**。[更新记录](CHANGELOG.md)

## 安装

当前发布版本为 **1.1.2**，声明兼容官方桌面端 **DSH 0.2.1-rc.2 / 0.2.1-rc.3**。安装包已包含 JavaScript 构建产物与全部角色素材，无需 Python、构建步骤或依赖脚本授权。

### 桌面端：预构建安装包（推荐）

1. 打开 **插件 → 添加插件 → 安装第三方插件**。
2. 粘贴下面的 Release 安装包地址，按界面提示完成安装并启用。
3. **完全退出 DeepSeek Harness，再重新打开**，使启动注入生效。

```text
https://github.com/chencujinlin/dsh-whale-startup/releases/download/v1.1.2/dsh-whale-startup-1.1.2.tgz
```

也可以从 [v1.1.2 Release](https://github.com/chencujinlin/dsh-whale-startup/releases/tag/v1.1.2) 下载 `.tgz`，在安装框中填写该文件的本机绝对路径，**无需解压**。附件中的 `SHA256SUMS.txt` 可用于核对文件完整性。

### 桌面端：从 GitHub 固定版本安装

在同一个安装框中输入：

```text
github:chencujinlin/dsh-whale-startup#v1.1.2
```

仓库已提交 `lib/`，因此 GitHub 安装也无需现场构建。需要不可变提交引用时，在对应 Release 页面复制其目标提交的完整 SHA，将 `#v1.1.2` 替换为 `#<完整提交 SHA>`。安装后同样需要完全退出并重新打开应用。

### 使用桌面端自带的 dsh 命令

先通过应用菜单 **管理 dsh 命令…** 安装或修复命令，并确认终端使用的是 Desktop 自带版本。完全退出应用后执行：

```sh
dsh plugin --profile desktop add 'https://github.com/chencujinlin/dsh-whale-startup/releases/download/v1.1.2/dsh-whale-startup-1.1.2.tgz'
dsh plugin --profile desktop list --depth 0
```

完成后重新打开应用。普通 npm 安装的 `dsh` 无权管理 `desktop` profile；遇到 `managed exclusively by the Electron application` 时，使用应用内安装入口，或修复命令来源与 PATH 优先级。无需手工修改 profile 的依赖或锁文件。官方依据见 [Desktop 终端命令](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/desktop/README.zh.md#终端命令)。

### 本地开发安装

```sh
gh repo clone chencujinlin/dsh-whale-startup
```

在桌面端安装框中输入克隆目录的绝对路径。目录安装可能使用链接，请保留该目录；源码改动后执行 `python3 build.py` 并完全重启应用。

### Web 与其他 profile

本插件以桌面原生启动页为目标。`dsh plugin --profile web add <spec>` 只安装到 Web profile，不会影响桌面窗口；本项目当前不承诺 Web 启动演出效果。

## 检查安装、升级与卸载

- **检查安装**：在插件页确认名称为 `dsh-whale-startup`、版本为 **1.1.2**，并且已启用。重启后应依次看到等候、拍走加载提示、放大欢呼和消失。
- **升级**：先记录插件页显示的来源与版本。使用宿主提供的更新入口；若该版本的界面要求卸载后重新安装，先卸载本插件，再使用新 Release 的固定版本地址安装并启用，最后完全重启。本插件没有需要迁移的个人配置或持久化数据。
- **停用**：关闭本插件并完全重启，下次启动恢复原生加载页。
- **卸载**：在插件页卸载本插件并完全重启，清除桌面壳缓存的启动注入。使用桌面自带 CLI 时，也可完全退出应用后执行 `dsh plugin --profile desktop remove dsh-whale-startup`。
- **未出现或安装失败**：查看安装详情与实际版本，确认当前宿主为 **0.2.1-rc.2 / 0.2.1-rc.3**。本地链接安装还需确认源目录存在。素材或接入点缺失时插件会保留原生启动页。

发布与安装机制遵循官方 [打包与安装插件](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.zh.md) 和 [插件管理界面](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-plugin-manager/README.zh.md) 说明。

## 兼容性与验证

已在 macOS 的 DeepSeek Harness **0.2.1-rc.2** 上验证原生启动接入。2026-10-26 使用桌面端 **0.2.1-rc.3** 运行现有宿主自动化测试并通过，`engines.dsh` 声明 rc.2 与 rc.3；rc.3 的启动动画仍需重启后目视确认。Windows 和 Linux 未做实机验证。

插件使用 dsh 内部的 `webserver/index-inject`、`shell.overlay` 和 `[data-dsh-boot]` 接口，不使用其他挂件的 DOM。未来 dsh 版本改变这些接口时，需要重新验证。未检测到接入点时保留原生启动。

自动检查覆盖无挂件独立完成、居中放大、淡出清理、有无其他挂件时画布一致、其他挂件保持原样，以及持续加载、失败、工作台提交、就绪桥缺失、停用、减少动态和损坏素材回退；宿主检查覆盖注入去重、路由访问校验、GET/HEAD 与清理。

## 开发

构建使用 Python 3 标准库；宿主测试使用 Node.js 22 或更高版本。浏览器检查使用 Playwright 1.63.0。

```sh
python3 build.py
node --test tests/host.test.mjs
uv run --with 'playwright==1.63.0' playwright install chromium
uv run --with 'playwright==1.63.0' python tests/check_browser.py
# 导出演示，需要 ffmpeg 位于 PATH。
uv run --with 'playwright==1.63.0' python tools/render_preview.py --out qa/preview.mp4
```

| 文件 | 用途 |
| --- | --- |
| `src/bootstrap.js` | 动画运行时 |
| `lib/client.js` | 工作台提交信号桥 |
| `lib/index.js` | 启动注入与受宿主访问校验保护的只读素材路由 |
| `build.py` | 将七张角色 PNG 内嵌到 `lib/bootstrap.js` |
| `tools/render_preview.py` | 用同一生产绘制代码导出离线预览与演示视频 |
| `cordis.patch.yml` | 原生插件挂载声明 |

角色素材随包提供，运行时不访问外网。构建与安装不依赖本仓库之外的样片工程。检查产生的本机截图、安装记录和配置备份不属于仓库内容。

## 形象参考

造型与配色依据用户指定的两份参考，七姿势素材保存在 `assets/`。新增欢呼姿势由内置图像生成工具基于原角色生成，文件为 [`assets/cheer.png`](assets/cheer.png)，完整提示词为 [`docs/cheer-prompt.txt`](docs/cheer-prompt.txt)。

- [鲸鱼娘造型参考](https://xn--pssy23gqgbz2d718b.com/works/deepseek202610080017.html)
- [深蓝配色参考](https://xn--pssy23gqgbz2d718b.com/works/deepseek202610090006.html)
