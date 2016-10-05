@echo OFF
set myfolder=%date:~-4%%date:~4,2%%date:~7,2%%time:~0,2%%time:~3,2%%time:~6,2%
call pybot -e test --outputdir "%~dp0\Report" "E:\4.GitHub\QA-Neeah\Cofiddle - Smoke Test Web Client"

