# 输出当前工作路径
Write-Host (Get-Location)

while ($true) {   
    # 请输入端口号
    $port = Read-Host "请输入端口号(1024-65535)"
    $port = $port.Trim() # 去除前后空格
    $port = $port -replace '\s+', '' # 去除所有空格
    $port = $port -replace '[^0-9]', '' # 去除非数字字符
    $port = $port -replace '^[0]+', '' # 去除前导零
    $port = [int]$port # 转换为整数

    # 判断是否为空
    if ($port -eq "") {
        $port = 8080 # 默认端口
        Write-Host "端口号为空，使用默认端口8080"
        live-server --port=$port
    }
    # 判断是不是数字端口
    elseif ($port -ge 1024 -and $port -le 65535) {
        live-server --port=$port
    }
    else {
        Write-Host "端口号非数字或不在范围1024-65535内，请重新输入！"
        continue
    }
}