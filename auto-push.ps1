# WNews Auto Push
param([string]$LogFile = "auto-push-$(Get-Date -Format 'yyyyMMdd-HHmm').log")

function Log($Msg, $Lvl="INFO") {
    $Line = "[$(Get-Date -Format 'HH:mm:ss')] [$Lvl] $Msg"
    Write-Host $Line
    $Line | Out-File $LogFile -Append
}

Log "=== Start ==="

# Git operations
Log "Check status..."
$Status = git status --porcelain

if ($Status) {
    $Date = Get-Date -Format "yyyy-MM-dd HH:mm"
    Log "Committing: $Date"
    git add -A
    git commit -m "Auto: $Date"
    git remote set-url origin https://github.com/xttey001/wnews.git 2>$null
    git push origin main
    if ($?) { Log "Pushed OK" } else { Log "Push failed" "ERR" }
} else {
    Log "No changes"
}

Log "=== Done ==="
