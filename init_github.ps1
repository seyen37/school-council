#requires -Version 5
<#
  init_github.ps1 - ONE-TIME setup: init this folder as a git repo and push to GitHub.

  事前準備（已完成 ✓）：GitHub 上已建立 seyen37/school-council 與 seyenbot/school-council 空 repo。

  Run（擇一）:
    Right-click this file -> "Run with PowerShell"
    或在此資料夾開終端機：powershell -ExecutionPolicy Bypass -File .\init_github.ps1

  全程輸出會寫入 init_github.log，方便事後檢視。
#>
param(
  [string]$Message = "feat: initial release of school-council (a tribute to Joanna8521/emperor)"
)

Set-Location -LiteralPath $PSScriptRoot
Start-Transcript -Path (Join-Path $PSScriptRoot "init_github.log") -Force | Out-Null
Write-Host "=== Repo: $PSScriptRoot ===" -ForegroundColor Cyan

# 0) git 是否可用
$gitOk = $false
try { $v = git --version 2>&1; if ($LASTEXITCODE -eq 0) { $gitOk = $true; Write-Host "git OK: $v" } } catch {}
if (-not $gitOk) {
  Write-Host "[ERROR] 找不到 git 指令。請先安裝 Git for Windows（https://git-scm.com/download/win），安裝後重開這個視窗再跑一次。" -ForegroundColor Red
  Stop-Transcript | Out-Null
  Read-Host "Press Enter to close"
  exit 1
}

if (Test-Path (Join-Path $PSScriptRoot ".git")) {
  Write-Host "[INFO] 這裡已經是 git repo，請改用 push.ps1 做日常更新。" -ForegroundColor Yellow
  git remote -v
  Stop-Transcript | Out-Null
  Read-Host "Press Enter to close"
  exit
}

# 1) Init on branch main
git init
git branch -M main

# 2) First commit
git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] commit 失敗。若訊息提到 user.name / user.email，請先執行：" -ForegroundColor Red
  Write-Host '  git config --global user.name  "seyen37"'
  Write-Host '  git config --global user.email "seyen37@gmail.com"'
  Write-Host "然後重跑本腳本。" -ForegroundColor Red
  Stop-Transcript | Out-Null
  Read-Host "Press Enter to close"
  exit 1
}

# 3) Remotes（照 personal-playbook 慣例：origin=seyen37、backup=seyenbot）
git remote add origin git@github.com:seyen37/school-council.git
git remote add backup git@github-backup:seyenbot/school-council.git

# 4) Push
Write-Host ""
Write-Host "=== Push origin (seyen37) ===" -ForegroundColor Cyan
git push -u origin main
if ($LASTEXITCODE -ne 0) { Write-Host "[WARN] push origin failed（commit 已在本機，安全）。請確認 SSH 金鑰可用（ssh -T git@github.com）。" -ForegroundColor Yellow }

Write-Host ""
Write-Host "=== Push backup (seyenbot) ===" -ForegroundColor Cyan
git push backup main
if ($LASTEXITCODE -ne 0) { Write-Host "[WARN] push backup failed（可稍後再補推：git push backup main）。" -ForegroundColor Yellow }

Write-Host ""
Write-Host "=== Recent commits ===" -ForegroundColor Cyan
git log --oneline -3

Stop-Transcript | Out-Null
Write-Host ""
Read-Host "Press Enter to close"
