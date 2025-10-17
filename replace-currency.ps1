$files = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.ts

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace currency references
    $content = $content -replace "en-NG", "en-US"
    $content = $content -replace "NGN", "USD"
    $content = $content -replace "₦", "`$"
    $content = $content -replace "Naira", "Dollars"
    $content = $content -replace "naira", "dollars"
    $content = $content -replace "kobo", "cents"
    
    # Remove copyright footers
    $content = $content -replace '<footer className="text-center text-xs text-gray-400 pt-2 pb-6">\s*Copyright © 2025 Relia Energy\. All Rights Reserved\s*</footer>', ''
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Replacements complete!"
