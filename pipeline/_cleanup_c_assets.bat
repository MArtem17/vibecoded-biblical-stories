@echo off
REM Cleanup temp PNG assets on C: that already have WebP on D:
setlocal EnableDelayedExpansion
set A=C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-biblejskie-istorii\assets
set IMG=d:\OSPanel5\domains\biblejskie-istorii\img
set LOG=d:\OSPanel5\domains\biblejskie-istorii\pipeline\_cleanup_log.txt
echo === cleanup start === > "%LOG%"
fsutil volume diskfree c: >> "%LOG%" 2>&1
if not exist "%A%" (
  echo no assets dir >> "%LOG%"
  goto done
)
set DEL=0
for %%F in ("%A%\*.png" "%A%\*.jpg" "%A%\*.jpeg") do (
  if exist "%%F" (
    set NAME=%%~nF
    if exist "%IMG%\!NAME!.webp" (
      echo DEL %%~nxF >> "%LOG%"
      del /q "%%F"
      set /a DEL+=1
    ) else (
      echo KEEP %%~nxF >> "%LOG%"
    )
  )
)
for %%F in ("%A%\*") do (
  if exist "%%F" if %%~zF==0 (
    echo DEL empty %%~nxF >> "%LOG%"
    del /q "%%F"
  )
)
echo deleted_count=%DEL% >> "%LOG%"
dir /a-d "%A%" >> "%LOG%" 2>&1
:done
fsutil volume diskfree c: >> "%LOG%" 2>&1
echo === cleanup done === >> "%LOG%"
type "%LOG%"
