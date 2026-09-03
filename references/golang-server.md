# Go 服务端：构建、验证与交付

脚手架根目录的 `main.go` 是唯一后端代码：把 `dist/` 嵌入二进制、监听 `127.0.0.1` 随机端口、自动打开浏览器。约 70 行、零第三方依赖、产物约 10MB。

## 命令行参数

| 参数 | 默认 | 说明 |
|---|---|---|
| `-addr` | `127.0.0.1:0` | 监听地址；`:0` = 系统分配空闲端口（避免冲突与防火墙弹窗） |
| `-dir 路径` | 无 | 服务磁盘目录而非内嵌文件。**改完前端后免重编 Go 快速预览**：`go run . -dir dist` |
| `-no-browser` | false | 不自动开浏览器（脚本化验证用） |

## 构建流程与陷阱

```
npm run build                                 # 1. 前端产物 → dist/
go build -ldflags "-s -w" -o 名称.exe .      # 2. 嵌入 dist 并产出单文件
```

**核心陷阱：`go:embed` 是编译期嵌入。**

- `dist/` 不存在时 `go build` 直接报错——必须先 `npm run build`
- 任何前端改动后，旧 exe 不会热更新，必须重跑上面两步（或调试期用 `go run . -dir dist`）
- Windows 下一键脚本：`build.bat`；Linux/macOS：`./build.sh`

## 交叉编译（目标设备无运行时的关键）

Go 交叉编译只改环境变量，产出完全静态的二进制：

| 目标 | 命令 |
|---|---|
| Windows x64 | `go build -ldflags "-s -w" -o app.exe .` |
| Linux x64 | `CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" -o app .` |
| macOS Apple Silicon | `CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -ldflags "-s -w" -o app .` |

Linux 必须 `CGO_ENABLED=0` 才是完全静态、无 libc 依赖的产物。跨平台 exe 名称去掉 `.exe`。

## 验证（交付前必做）

```bash
./名称.exe -no-browser -addr 127.0.0.1:18080 &
sleep 1
curl -sf -o /dev/null -w "%{http_code}" http://127.0.0.1:18080/   # 期望 200
# Windows 停止： taskkill /IM 名称.exe /F
```

有界面的机器上直接双击 exe，人工过一遍：每页动画、分步、`ESC` 总览、`B` 静态模式、键盘 → ← Home End。

## 交付注意

- **Windows SmartScreen**：未签名 exe 首次运行可能提示"已保护你的电脑"→ 点"更多信息"→"仍要运行"。交付时提前告知用户，避免现场慌张
- exe 直接发微信/邮件可能被压缩拦截，建议 zip 打包传输
- 交付话术：双击运行 → 自动打开浏览器；`→`/`空格` 翻页，`ESC` 总览，`B` 静态模式，`Home/End` 首末页
- 需要展示设备联网的场景（如扫码互动）才考虑绑定 `0.0.0.0`，且要处理防火墙授权弹窗

## 特殊情况

**构建机没有 Go 环境**：退化为"静态文件 + 通用单文件服务器"形态——交付 `dist/` 目录加 Caddy（`caddy file-server --root dist --listen 127.0.0.1:8080`）或 miniserve（`miniserve dist -p 8080`），但交付物从 1 个文件变成 2 项，优先想办法装 Go。

**npm 网络不畅**（国内常见）：`npm install --registry=https://registry.npmmirror.com`。
