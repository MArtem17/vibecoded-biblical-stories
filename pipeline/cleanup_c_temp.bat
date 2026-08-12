@echo off
REM Run this if agent shell is blocked: frees C: temp used by image gen
setlocal
echo Cleaning Cursor assets PNGs that already have WebP...
set A=C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-biblejskie-istorii\assets
set IMG=d:\OSPanel5\domains\biblejskie-istorii\img
if exist "%A%" (
  for %%F in ("%A%\*.png" "%A%\*.jpg" "%A%\*.jpeg") do (
    if exist "%%F" if exist "%IMG%\%%~nF.webp" del /q "%%F"
  )
)
echo Cleaning %%TEMP%% ps-script leftovers...
del /q "%TEMP%\ps-script-*.ps1" 2>nul
echo Cleaning cursor-sandbox-cache...
if exist "%TEMP%\cursor-sandbox-cache" rd /s /q "%TEMP%\cursor-sandbox-cache"
echo Done. Free space:
fsutil volume diskfree c:
pause
