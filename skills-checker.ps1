# Skills Self-Check Script v1.0
# Functions:
# 1. Check installed Skills integrity
# 2. Detect duplicates/conflicts
# 3. Suggest cleanup of irrelevant Skills
# 4. Check for marketplace updates

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       Skills Self-Check v1.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$installedPath = "$env:USERPROFILE\.workbuddy\skills"
$marketplacePath = "$env:USERPROFILE\.workbuddy\skills-marketplace\skills"

# 1. Get installed Skills
$installed = Get-ChildItem $installedPath -Directory | ForEach-Object {
    $skillPath = $_.FullName
    $hasSKILL = Test-Path "$skillPath\SKILL.md"
    [PSCustomObject]@{
        Name = $_.Name
        HasSKILL = $hasSKILL
        Path = $skillPath
    }
}

# 2. Get Marketplace Skills
$marketplace = Get-ChildItem $marketplacePath -Directory | Select-Object Name

Write-Host "[1] Status Summary" -ForegroundColor Yellow
Write-Host "----------------------------------------"
Write-Host "Installed: $($installed.Count)" -ForegroundColor White
Write-Host "Marketplace Available: $($marketplace.Count)" -ForegroundColor White
Write-Host ""

# 3. Check valid vs broken Skills
$validSkills = $installed | Where-Object { $_.HasSKILL }
$brokenSkills = $installed | Where-Object { !$_.HasSKILL }

Write-Host "[2] Integrity Check" -ForegroundColor Yellow
Write-Host "----------------------------------------"
Write-Host "Valid Skills (with SKILL.md): $($validSkills.Count)" -ForegroundColor Green
Write-Host "Broken Skills (no SKILL.md): $($brokenSkills.Count)" -ForegroundColor Red
Write-Host ""

# 4. List broken Skills
if ($brokenSkills.Count -gt 0) {
    Write-Host "Broken Skills (recommend delete):" -ForegroundColor Red
    $brokenSkills | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor Gray }
    Write-Host ""
}

# 5. Core project Skills
Write-Host "[3] Core Project Skills (Beauty APP + Xiaohongshu)" -ForegroundColor Yellow
Write-Host "----------------------------------------"
$coreSkills = @(
    'fullstack-dev', 'frontend-dev', 'ui-ux-pro-max',
    'tencentcloud-cos', 'wechatpay-product-coupon',
    'market-researcher', 'video-frames', 'github',
    'wechat-miniprogram', 'tdesign-miniprogram', 'find-skills'
)

$installedNames = $installed.Name
$missing = @()
foreach ($skill in $coreSkills) {
    if ($installedNames -notcontains $skill) {
        $missing += $skill
        Write-Host "  [X] Missing: $skill" -ForegroundColor Red
    } else {
        Write-Host "  [OK] $skill" -ForegroundColor Green
    }
}
Write-Host ""

# 6. Category Stats
Write-Host "[4] Skills by Category" -ForegroundColor Yellow
Write-Host "----------------------------------------"

$cat1 = @('fullstack-dev', 'frontend-dev', 'ui-ux-pro-max', 'wechat-miniprogram', 'tdesign-miniprogram', 'tencentcloud-cos', 'github')
$cat2 = @('wechatpay-product-coupon', 'wechatpay-basic-payment')
$cat3 = @('market-researcher', 'video-frames', 'ai-image-generation', 'ai-content-pipeline')
$cat4 = @('AI Trend Hunter Pro', 'xiaohongshu-image-auto')

Write-Host "Beauty APP Dev : $(($installedNames | Where-Object { $_ -in $cat1 }).Count) / $($cat1.Count)"
Write-Host "Payment        : $(($installedNames | Where-Object { $_ -in $cat2 }).Count) / $($cat2.Count)"
Write-Host "Content        : $(($installedNames | Where-Object { $_ -in $cat3 }).Count) / $($cat3.Count)"
Write-Host "Xiaohongshu    : $(($installedNames | Where-Object { $_ -in $cat4 }).Count) / $($cat4.Count)"
Write-Host ""

# 7. Suggest removing irrelevant Skills
Write-Host "[5] Suggest Remove (Not Relevant to Your Project)" -ForegroundColor Yellow
Write-Host "----------------------------------------"

$irrelevantPatterns = @(
    'android', 'angular', 'react-native', 'flutter', 'ios-',
    'wordpress', 'woocommerce', 'airflow', 'kubernetes',
    'aws-', 'azure-', 'gcp-', 'stripe'
)

$toRemove = @()
foreach ($skill in $installed) {
    $name = $skill.Name.ToLower()
    foreach ($pattern in $irrelevantPatterns) {
        if ($name -like "*$pattern*") {
            $toRemove += $skill.Name
            break
        }
    }
}

Write-Host "Found $($toRemove.Count) irrelevant Skills:"
$toRemove | Select-Object -First 30 | ForEach-Object { Write-Host "  - $_" -ForegroundColor DarkGray }
if ($toRemove.Count -gt 30) {
    Write-Host "  ... and $($toRemove.Count - 30) more" -ForegroundColor DarkGray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Check Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
