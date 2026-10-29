Add-Type -AssemblyName System.Drawing

$src = 'C:\Users\surface\.qoder\vibe_images\medalog-app-icon_1793293241.png'
$root = 'D:\Build\tab-stash-extension\medalog-app\android\app\src\main\res'
$assets = 'D:\Build\tab-stash-extension\medalog-app\assets'
if (-not (Test-Path $assets)) { New-Item -ItemType Directory -Path $assets | Out-Null }

$bg = [System.Drawing.ColorTranslator]::FromHtml('#0f1117')
$original = [System.Drawing.Image]::FromFile($src)

function New-RoundedPath([int]$w, [int]$h, [int]$r) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = 2 * $r
    $p.AddArc(0, 0, $d, $d, 180, 90)
    $p.AddArc($w - $d, 0, $d, $d, 270, 90)
    $p.AddArc($w - $d, $h - $d, $d, $d, 0, 90)
    $p.AddArc(0, $h - $d, $d, $d, 90, 90)
    $p.CloseFigure()
    return $p
}

# --- master square: full-bleed dark, generated rounded corners clipped away ---
$square = New-Object System.Drawing.Bitmap 1024, 1024
$g = [System.Drawing.Graphics]::FromImage($square)
$g.SmoothingMode = 'AntiAlias'
$g.InterpolationMode = 'HighQualityBicubic'
$g.PixelOffsetMode = 'HighQuality'
$g.Clear($bg)
# The generated art has a thin light ring just inside its rounded frame; the clip
# radius and overscan below push that ring outside the canvas so the mask is clean.
$g.SetClip((New-RoundedPath 1024 1024 190))
$g.DrawImage($original, -40, -40, 1104, 1104)
$g.ResetClip()
$g.Dispose()

# --- master round: same art inside a circle, transparent outside ---
$roundMaster = New-Object System.Drawing.Bitmap 1024, 1024
$g = [System.Drawing.Graphics]::FromImage($roundMaster)
$g.SmoothingMode = 'AntiAlias'
$g.InterpolationMode = 'HighQualityBicubic'
$g.PixelOffsetMode = 'HighQuality'
$g.Clear([System.Drawing.Color]::Transparent)
$circle = New-Object System.Drawing.Drawing2D.GraphicsPath
$circle.AddEllipse(0, 0, 1024, 1024)
$g.SetClip($circle)
$g.DrawImage($square, 0, 0, 1024, 1024)
$g.ResetClip()
$g.Dispose()

$square.Save((Join-Path $assets 'icon-1024.png'), [System.Drawing.Imaging.ImageFormat]::Png)

$densities = [ordered]@{ 'mdpi' = 48; 'hdpi' = 72; 'xhdpi' = 96; 'xxhdpi' = 144; 'xxxhdpi' = 192 }

foreach ($name in $densities.Keys) {
    $size = $densities[$name]
    $dir = Join-Path $root "mipmap-$name"
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

    foreach ($variant in @(@{ file = 'ic_launcher.png'; image = $square }, @{ file = 'ic_launcher_round.png'; image = $roundMaster })) {
        $bmp = New-Object System.Drawing.Bitmap $size, $size
        $g2 = [System.Drawing.Graphics]::FromImage($bmp)
        $g2.CompositingMode = 'SourceCopy'
        $g2.CompositingQuality = 'HighQuality'
        $g2.InterpolationMode = 'HighQualityBicubic'
        $g2.PixelOffsetMode = 'HighQuality'
        $g2.SmoothingMode = 'AntiAlias'
        $g2.DrawImage($variant.image, 0, 0, $size, $size)
        $g2.Dispose()
        $bmp.Save((Join-Path $dir $variant.file), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        Write-Output ("wrote {0}/{1} ({2}px)" -f "mipmap-$name", $variant.file, $size)
    }
}

$original.Dispose()
$square.Dispose()
$roundMaster.Dispose()
Write-Output 'done'
