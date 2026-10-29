Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\jay\.gemini\antigravity\brain\2f18bfcd-3486-40ef-a152-1c3151e1e52e\clipnote_app_icon_1793264870325.jpg"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$w = $src.Width
$h = $src.Height

# Create a 32bpp ARGB bitmap of the same size with background removed
$cleanBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Lock bits for fast processing
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$srcData = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$dstData = $cleanBmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$srcStride = $srcData.Stride
$dstStride = $dstData.Stride

$srcBytes = New-Object byte[] ($srcStride * $h)
$dstBytes = New-Object byte[] ($dstStride * $h)

[System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $srcBytes.Length)
$src.UnlockBits($srcData)

# Center of image
$cx = $w / 2
$cy = $h / 2

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $sIdx = $y * $srcStride + $x * 3
        $bVal = $srcBytes[$sIdx]
        $gVal = $srcBytes[$sIdx + 1]
        $rVal = $srcBytes[$sIdx + 2]

        $dIdx = $y * $dstStride + $x * 4

        # Check if this pixel is in the outer background (outside the squircle)
        # Distance from center
        $dist = [Math]::Sqrt(($x - $cx) * ($x - $cx) + ($y - $cy) * ($y - $cy))

        # The squircle is within distance ~ 480 from center
        # Outer background has R > 150, G > 150, B > 150 and dist > 350
        $isOuterBg = ($dist -gt 360) -and ($rVal -gt 150 -and $gVal -gt 150 -and $bVal -gt 150)

        if ($isOuterBg) {
            # Completely transparent outside corner
            $dstBytes[$dIdx] = 0     # B
            $dstBytes[$dIdx + 1] = 0 # G
            $dstBytes[$dIdx + 2] = 0 # R
            $dstBytes[$dIdx + 3] = 0 # Alpha = 0
        } elseif ($dist -gt 360 -and ($rVal -gt 60 -and $gVal -gt 60 -and $bVal -gt 60)) {
            # Smooth anti-aliased edge at squircle boundary
            $maxC = [Math]::Max($rVal, [Math]::Max($gVal, $bVal))
            if ($maxC -ge 240) {
                $alpha = 0
            } else {
                # Fade alpha between 60 and 240
                $t = ($maxC - 60) / (240 - 60)
                $alpha = [byte][Math]::Round((1.0 - $t) * 255)
            }
            $dstBytes[$dIdx] = $bVal
            $dstBytes[$dIdx + 1] = $gVal
            $dstBytes[$dIdx + 2] = $rVal
            $dstBytes[$dIdx + 3] = $alpha
        } else {
            # Inside squircle
            $dstBytes[$dIdx] = $bVal
            $dstBytes[$dIdx + 1] = $gVal
            $dstBytes[$dIdx + 2] = $rVal
            $dstBytes[$dIdx + 3] = 255
        }
    }
}

[System.Runtime.InteropServices.Marshal]::Copy($dstBytes, 0, $dstData.Scan0, $dstBytes.Length)
$cleanBmp.UnlockBits($dstData)
$src.Dispose()

# Now find the exact bounds of non-zero alpha pixels
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $dIdx = $y * $dstStride + $x * 4
        if ($dstBytes[$dIdx + 3] -gt 10) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Transparent squircle bounds: X=[$minX, $maxX], Y=[$minY, $maxY]"
$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1
$cropSize = [Math]::Max($cropW, $cropH)

# Center crop box
$cropX = [Math]::Max(0, [int]($minX - ($cropSize - $cropW) / 2))
$cropY = [Math]::Max(0, [int]($minY - ($cropSize - $cropH) / 2))
$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropSize, $cropSize)

$destDirs = @(
    "D:\project\note-ext\public\icons"
)

$sizes = @(16, 48, 128)

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

        $targetRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
        $g.DrawImage($cleanBmp, $targetRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()

        $outPath = Join-Path $dir "icon-$size.png"
        $destBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $destBmp.Dispose()
        Write-Host "Generated $outPath"
    }
}

# 256 preview
$previewSize = 256
$previewBmp = New-Object System.Drawing.Bitmap($previewSize, $previewSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$pg = [System.Drawing.Graphics]::FromImage($previewBmp)
$pg.Clear([System.Drawing.Color]::Transparent)
$pg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$pg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$pg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$pg.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$pRect = New-Object System.Drawing.Rectangle(0, 0, $previewSize, $previewSize)
$pg.DrawImage($cleanBmp, $pRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)

$previewOut = "C:\Users\jay\.gemini\antigravity\brain\2f18bfcd-3486-40ef-a152-1c3151e1e52e\preview-icon-noborder.png"
$previewBmp.Save($previewOut, [System.Drawing.Imaging.ImageFormat]::Png)

$pg.Dispose()
$previewBmp.Dispose()
$cleanBmp.Dispose()

Write-Host "Finished transparent corner extraction!"
