# Skills Cleanup Script - 清理不相关 Skills
# 功能：删除与当前项目无关的 Skills，避免冲突

$installedPath = "$env:USERPROFILE\.workbuddy\skills"
$marketplacePath = "$env:USERPROFILE\.workbuddy\skills-marketplace\skills"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Skills Cleanup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 定义要清理的模式（与项目无关的技术栈）
$irrelevantPatterns = @(
    # 移动端开发（你不需要）
    'android', 'ios-', 'flutter', 'react-native',
    # 前端框架（不需要）
    'angular', 'gatsby', 'nextjs', 'nuxt', 'sveltekit', 'remix-', 'astro-',
    # 云服务（不需要AWS/GCP/Azure）
    'aws-', 'azure-', 'gcp-',
    # 其他不相关
    'wordpress', 'woocommerce', 'airflow', 'kubernetes',
    'stripe', 'supabase', 'firebase',
    'nestjs', 'fastify', 'prisma', 'drizzle',
    'deno', 'bun-', 'rust-', 'go-', 'java-', 'kotlin-',
    'swift-', 'objective-c', 'dart-', 'elixir', 'crystal',
    'hasura', 'directus', 'strapi', 'sanity', 'contentful',
    'shopify', 'magento', 'bigcommerce', 'wix', 'squarespace',
    'storybook', 'chromatic', 'playwright', 'cypress', 'selenium',
    'puppeteer', 'jmeter', 'k6', 'locust-', 'gatling'
)

# 获取所有已安装的Skills
$installed = Get-ChildItem $installedPath -Directory

# 找出要删除的
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

Write-Host "Found $($toRemove.Count) Skills to remove" -ForegroundColor Yellow
Write-Host ""

# 删除这些Skills
$removed = 0
foreach ($skillName in $toRemove) {
    $skillPath = Join-Path $installedPath $skillName
    try {
        Remove-Item -Path $skillPath -Recurse -Force
        $removed++
        Write-Host "  [OK] Removed: $skillName" -ForegroundColor Green
    } catch {
        Write-Host "  [X] Failed: $skillName" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Cyan
Write-Host "Removed: $removed Skills" -ForegroundColor Green
Write-Host "Remaining: $((Get-ChildItem $installedPath -Directory).Count) Skills" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
