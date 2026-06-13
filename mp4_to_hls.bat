@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: mp4_to_hls.bat
:: Convert MP4 to HLS (.ts + .m3u8) with ffmpeg
:: Usage: Drag & drop MP4 onto this script
::        Or run: mp4_to_hls "C:\path\to\video.mp4"
:: ============================================================

set "FFMPEG=G:\ffmpeg-master-latest-win64-gpl-shared\bin\ffmpeg.exe"

:: --- Check args ---
set "INFILE=%~1"
if "%INFILE%"=="" (
    echo.
    echo [ERROR] No file specified.
    echo Drag an MP4 file onto this script.
    echo.
    pause
    exit /b 1
)
if not exist "%INFILE%" (
    echo.
    echo [ERROR] File not found: %INFILE%
    echo.
    pause
    exit /b 1
)

:: --- Check ffmpeg ---
if not exist "%FFMPEG%" (
    echo.
    echo [ERROR] ffmpeg not found at: %FFMPEG%
    echo.
    pause
    exit /b 1
)

:: --- Setup output ---
set "BASENAME=%~n1"
set "OUTDIR=%~dp1%BASENAME%_hls"
if not exist "%OUTDIR%" mkdir "%OUTDIR%"

:: --- Convert ---
echo.
echo Input: %INFILE%
echo Output: %OUTDIR%
echo.
echo Converting...

%FFMPEG% -i "%INFILE%" ^
    -c:v libx264 -preset medium -crf 23 ^
    -c:a aac -b:a 128k ^
    -hls_time 6 ^
    -hls_list_size 0 ^
    -hls_segment_filename "%OUTDIR%\segment_%%03d.ts" ^
    -hls_playlist_type vod ^
    "%OUTDIR%\index.m3u8"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Conversion failed.
    pause
    exit /b 1
)

:: --- Done ---
echo.
echo ============================================================
echo  DONE!
echo  Output: %OUTDIR%
echo  Files:
echo    index.m3u8  - Playlist
echo    segment_*.ts - Video segments
echo ============================================================
echo.
pause
exit /b 0
