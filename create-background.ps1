Add-Type -AssemblyName System.Drawing

$width = 1920
$height = 1080
$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(8, 11, 22)), ([System.Drawing.Color]::FromArgb(18, 23, 42)), 25
$graphics.FillRectangle($bgBrush, $rect)

$rand = New-Object System.Random 42

for ($i = 0; $i -lt 180; $i++) {
  $x = $rand.Next(0, $width)
  $y = $rand.Next(0, $height)
  $w = $rand.Next(1, 4)
  $alpha = $rand.Next(14, 46)
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, 160, 170, 255))
  $graphics.FillEllipse($brush, $x, $y, $w, $w)
  $brush.Dispose()
}

$gridPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(22, 160, 168, 255)), 1
for ($x = 0; $x -lt $width; $x += 96) {
  $graphics.DrawLine($gridPen, $x, 0, $x + 420, $height)
}
for ($y = 0; $y -lt $height; $y += 92) {
  $graphics.DrawLine($gridPen, 0, $y, $width, $y + 160)
}

$accentPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(96, 88, 101, 242)), 2
$softPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(46, 101, 230, 178)), 1
for ($i = 0; $i -lt 11; $i++) {
  $x1 = 1080 + ($i * 64)
  $y1 = 230 + ($i * 36)
  $graphics.DrawLine($accentPen, $x1, $y1, $x1 + 420, $y1 - 110)
  $graphics.DrawLine($softPen, $x1 - 220, $y1 + 120, $x1 + 210, $y1 + 16)
}

for ($i = 0; $i -lt 9; $i++) {
  $panelRect = New-Object System.Drawing.Rectangle (1050 + ($i * 42)), (210 + ($i * 54)), 420, 72
  $panelBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(32, 255, 255, 255))
  $graphics.FillRectangle($panelBrush, $panelRect)
  $graphics.DrawRectangle($accentPen, $panelRect)
  $panelBrush.Dispose()
}

for ($i = 0; $i -lt 18; $i++) {
  $alpha = [Math]::Max(2, 54 - ($i * 3))
  $size = 190 + ($i * 52)
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, 88, 101, 242))
  $graphics.FillEllipse($brush, 1330 - ($size / 2), 360 - ($size / 2), $size, [int]($size * 0.72))
  $brush.Dispose()
}

for ($i = 0; $i -lt 14; $i++) {
  $alpha = [Math]::Max(2, 34 - ($i * 2))
  $size = 160 + ($i * 52)
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, 101, 230, 178))
  $graphics.FillEllipse($brush, 430 - ($size / 2), 800 - ($size / 2), $size, [int]($size * 0.58))
  $brush.Dispose()
}

for ($i = 0; $i -lt 18; $i++) {
  $alpha = 10
  $insetX = $i * 28
  $insetY = $i * 16
  $vignettePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb($alpha, 0, 0, 0)), 36
  $graphics.DrawRectangle($vignettePen, $insetX, $insetY, $width - ($insetX * 2), $height - ($insetY * 2))
  $vignettePen.Dispose()
}

$assets = Join-Path $PSScriptRoot "assets"
if (!(Test-Path $assets)) {
  New-Item -ItemType Directory -Path $assets | Out-Null
}

$out = Join-Path $assets "ryn-tech-background.png"
$bitmap.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)

$gridPen.Dispose()
$accentPen.Dispose()
$softPen.Dispose()
$bgBrush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
