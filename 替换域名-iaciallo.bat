@echo off
chcp 65001 >nul
REM ============================================================
REM 域名替换脚本 - 手动开关
REM 功能：将 91vip.xn--32v.ink 替换为 iaciallo.com
REM 使用方法：双击运行此脚本，或在命令行执行
REM ============================================================

echo.
echo ============================================================
echo   域名替换脚本
echo   将 91vip.xn--32v.ink 替换为 iaciallo.com
echo ============================================================
echo.

REM 检查是否确认执行
set /p CONFIRM="确定要执行域名替换吗？(输入 YES 确认，其他取消): "
if not "%CONFIRM%"=="YES" (
    echo 已取消操作。
    pause
    exit /b
)

echo.
echo 开始替换域名...
echo.

REM 设置要替换的字符串
set "OLD_DOMAIN=91vip.xn--32v.ink"
set "NEW_DOMAIN=iaciallo.com"

REM 获取当前目录
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo 项目目录: %PROJECT_DIR%
echo.

REM 统计替换数量
echo 正在统计需要替换的文件...
for /f "delims=" %%i in ('dir /s /b "%PROJECT_DIR%\*.html" "%PROJECT_DIR%\*.js" "%PROJECT_DIR%\*.md" 2^>nul') do (
    findstr /C:"%OLD_DOMAIN%" "%%i" >nul 2>&1 && (
        echo 发现文件: %%i
    )
)

echo.
set /p CONFIRM2="确认要替换以上文件中所有出现的 %OLD_DOMAIN% 为 %NEW_DOMAIN% 吗？(输入 YES 确认): "
if not "%CONFIRM2%"=="YES" (
    echo 已取消操作。
    pause
    exit /b
)

echo.
echo 正在替换，请稍候...
echo.

REM 执行替换
for /r "%PROJECT_DIR%" %%F in (*.html *.js *.md) do (
    findstr /C:"%OLD_DOMAIN%" "%%F" >nul 2>&1 && (
        echo 替换: %%F
        powershell -Command "(Get-Content '%%F') -replace '%OLD_DOMAIN%', '%NEW_DOMAIN%' | Set-Content '%%F'"
    )
)

echo.
echo ============================================================
echo   域名替换完成！
echo   已将所有 %OLD_DOMAIN% 替换为 %NEW_DOMAIN%
echo ============================================================
echo.
pause
