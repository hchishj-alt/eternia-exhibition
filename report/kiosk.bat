@echo off
rem ETERNIA mission report - Chrome kiosk (fullscreen). Exit: Alt+F4
set URL=https://hchishj-alt.github.io/eternia-exhibition/report/
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME% set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
start "" %CHROME% --kiosk --user-data-dir="%LOCALAPPDATA%\EterniaKiosk" --no-first-run %URL%
