D:
cd D:/VSLHR/学习笔记/项目/My/H5/Q爱记
write-host "已进入项目目录"
# powershell用户输入内容
$content = Read-Host "请输入端口号（默认8080）"
if (!$content) {
    $content = 8080
    write-host "未输入内容，已设置为默认端口：$content"
} elseif ($content -match "^\d+(\.\d+)?$") {
    write-host "已设置端口：$content"
} else {
    $content = 8080
    write-host "输入内容无效，已设置为默认端口：$content"
}
write-host "服务正在启动..."
http-server -p $content