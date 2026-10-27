@echo off
REM Chay BE (nhanh main) va FE (nhanh Khang) cung luc
set ROOT=%~dp0
set ROOT=%ROOT:~0,-1%
set MAINDIR=%ROOT%-main

cd /d "%ROOT%"
git fetch origin

REM Backend: tao worktree rieng cho nhanh main (khong dung vao nhanh Khang dang checkout)
if not exist "%MAINDIR%\BE" (
  git worktree add "%MAINDIR%" main
)
git -C "%MAINDIR%" checkout main
git -C "%MAINDIR%" pull origin main

start "VeggieAI BE (main)" cmd /k "cd /d "%MAINDIR%\BE\VeggieAI.API" && dotnet run --launch-profile http"
start "VeggieAI FE (Khang)" cmd /k "cd /d "%ROOT%\FE" && git branch --show-current && npm install && npm run dev"
