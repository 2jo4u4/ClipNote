Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\jay\.gemini\antigravity\brain\2f18bfcd-3486-40ef-a152-1c3151e1e52e\clipnote_app_icon_1793264870325.jpg"
$srcImg = [System.Drawing.Bitmap]::FromFile($srcPath)

$destDirs = @(
    "D:\project\note-ext\public\icons",
    "D:\project\note-ext\src\public\icons"
)

$sizes = @(16, 48, 128)

foreach ($dir in $destDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    foreach ($size in $sizes) {
        $destBmp = New-Object System.Drawing.Bitmap($size, $size)
        $g = [System.Drawing.Graphics]::FromImage($destBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $g.DrawImage($srcImg, 0, 0, $size, $size)
        $g.Dispose()

        $outPath = Join-Path $dir "icon-$size.png"
        $destBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $destBmp.Dispose()
        Write-Host "Generated $outPath"
    }
}

$srcImg.Dispose()
Write-Host "All icons converted successfully!"
