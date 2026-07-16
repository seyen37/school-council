#requires -Version 5
<#
  pull.ps1 - Pull latest 'main' from origin into THIS repo.

  Run:
    Right-click this file -> "Run with PowerShell"
    or:  powershell -ExecutionPolicy Bypass -File .\pull.ps1
#>
Set-Location -LiteralPath $PSScriptRoot
Write-Host "=== Repo: $PSScriptRoot ===" -ForegroundColor Cyan

# Remove stale git lock (Cowork mount can leave one behind)
$lock = Join-Path $PSScriptRoot ".git\index.lock"
if (Test-Path $lock) { Remove-Item -Force $lock; Write-Host "Removed stale index.lock" }

git pull origin main
if ($LASTEXITCODE -ne 0) { Write-Host "[WARN] pull failed. 檢查網路或先處理本機未提交的變更。" -ForegroundColor Yellow }

Write-Host ""
Write-Host "=== Recent commits ===" -ForegroundColor Cyan
git log --oneline -3

Write-Host ""
Read-Host "Press Enter to close"
