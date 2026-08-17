# Safer cleanup: only project assets PNGs + list free space
# Run: cmd /c d:\OSPanel5\domains\biblejskie-istorii\pipeline\_free_disk_safe.bat
@echo off
set ASSETS=C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-biblejskie-istorii\assets
fsutil volume diskfree C: > d:\OSPanel5\domains\biblejskie-istorii\pipeline\_disk_before.txt
if exist "%ASSETS%\*.png" del /q "%ASSETS%\*.png"
fsutil volume diskfree C: > d:\OSPanel5\domains\biblejskie-istorii\pipeline\_disk_after.txt
echo done > d:\OSPanel5\domains\biblejskie-istorii\pipeline\_disk_done.txt
