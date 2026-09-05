// Web PPT 便携服务器：把 dist/ 嵌入二进制，双击即演。
// 用法：
//   直接双击              → 随机端口 + 自动打开浏览器
//   -addr 127.0.0.1:8080  → 指定监听地址
//   -dir ./dist           → 服务磁盘目录（改前端后免重编 go，仅调试用）
//   -no-browser           → 不自动打开浏览器（脚本化验证用）
package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os/exec"
	"runtime"
	"time"
)

//go:embed all:dist
var embedded embed.FS

func main() {
	addr := flag.String("addr", "127.0.0.1:0", "listen address, :0 = random free port")
	dir := flag.String("dir", "", "serve this directory instead of embedded files")
	noBrowser := flag.Bool("no-browser", false, "do not open browser automatically")
	flag.Parse()

	var handler http.Handler
	if *dir != "" {
		handler = http.FileServer(http.Dir(*dir))
	} else {
		// embed.FS 的根目录下是 dist/，用 fs.Sub 把它映射为站点根路径
		sub, err := fs.Sub(embedded, "dist")
		if err != nil {
			log.Fatal(err)
		}
		handler = http.FileServer(http.FS(sub))
	}

	ln, err := net.Listen("tcp", *addr)
	if err != nil {
		log.Fatal(err)
	}
	url := fmt.Sprintf("http://%s", ln.Addr().String())
	fmt.Printf("VuePPT 已就绪: %s  （关闭此窗口即退出）\n", url)

	if !*noBrowser {
		go func() {
			time.Sleep(300 * time.Millisecond) // 等服务真正可访问再拉起浏览器
			openBrowser(url)
		}()
	}
	log.Fatal(http.Serve(ln, handler))
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	_ = cmd.Start()
}
