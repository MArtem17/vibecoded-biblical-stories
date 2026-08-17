@echo off
echo === FREE BEFORE ===
fsutil volume diskfree C:
echo === CLEAN TEMP PS SCRIPTS ===
del /q "C:\Users\egoro\AppData\Local\Temp\ps-script-*.ps1" 2>nul
echo === CLEAN SANDBOX CACHE ===
rmdir /s /q "C:\Users\egoro\AppData\Local\Temp\cursor-sandbox-cache" 2>nul
echo === CLEAN ASSETS PNG (already have webp) ===
del /q "C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-biblejskie-istorii\assets\*.png" 2>nul
echo === CLEAN CURSOR PROJECT TMP ===
del /q "C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-biblejskie-istorii\agent-tools\*" 2>nul
echo === FREE AFTER ===
fsutil volume diskfree C:
echo DONE
