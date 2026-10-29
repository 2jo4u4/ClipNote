Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\jay\.gemini\antigravity\brain\2f18bfcd-3486-40ef-a152-1c3151e1e52e\clipnote_app_icon_1793264870325.jpg"
$srcImg = [System.Drawing.Bitmap]::FromFile($srcPath)

# The squircle bounding box in 1024x1024 source
$cropX = 90
$cropY = 92
$cropW = 844
$cropH = 844
$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)

$destDirs = @(
    "D:\project\note-ext\public\icons"
)

$sizes = @(16, 48, 128)

# Helper function to create rounded squircle path
function CreateRoundedRectPath($rect, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2

    $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
    $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
    $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
    $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
    $path.CloseFigure()
    return $path
}

foreach ($dir in $destDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    foreach ($size in $sizes) {
        $destBmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $g = [System.Drawing.Graphics]::FromImage($destBmp)
        $g.Clear([System.Drawing.Color]::Transparent)

        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        # Rounded corner radius (~21% of icon size)
        $radius = [Math]::Round($size * 0.21)
        if ($radius -lt 2) { $radius = 2 }
        $targetRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
        $clipPath = CreateRoundedRectPath $targetRect $radius

        $g.SetClip($clipPath)
        $g.DrawImage($srcImg, $targetRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

        $clipPath.Dispose()
        $g.Dispose()

        $outPath = Join-Path $dir "icon-$size.png"
        $destBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $destBmp.Dispose()
        Write-Host "Generated $outPath"
    }
}

# Also generate a 256x256 preview image without white border in artifact dir
$previewSize = 256
$previewBmp = New-Object System.Drawing.Bitmap($previewSize, $previewSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$pg = [System.Drawing.Graphics]::FromImage($previewBmp)
$pg.Clear([System.Drawing.Color]::Transparent)
$pg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$pg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$pg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$pg.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$pRadius = [Math]::Round($previewSize * 0.21)
$pRect = New-Object System.Drawing.Rectangle(0, 0, $previewSize, $previewSize)
$pClipPath = CreateRoundedRectPath $pRect $pRadius
$pg.SetClip($pClipPath)
$pg.DrawImage($srcImg, $pRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

$previewOut = "C:\Users\jay\.gemini\antigravity\brain\2f18bfcd-3486-40ef-a152-1c3151e1e52e\preview-icon-noborder.png"
$previewBmp.Save($previewOut, [System.Drawing.Imaging.ImageFormat]::Png)

$pClipPath.Dispose()
$pg.Dispose()
$previewBmp.Dispose()
$srcImg.Dispose()

Write-Host "All icons converted without white border! Preview saved to $previewOut"
