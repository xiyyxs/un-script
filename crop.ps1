Add-Type -AssemblyName System.Drawing

$inputPath = "C:\Users\User\Desktop\un&script-site\logo.png"
$outputPath = "C:\Users\User\Desktop\un&script-site\favicon.png"

$img = [System.Drawing.Image]::FromFile($inputPath)

$w = [int][math]::Round($img.Width / 1.8)
$h = [int][math]::Round($img.Height / 1.8)
$x = [int][math]::Round(($img.Width - $w) / 2)
$y = [int][math]::Round(($img.Height - $h) / 2)

$rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)), $rect, [System.Drawing.GraphicsUnit]::Pixel)

$img.Dispose()

$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()

Write-Host "Favicon cropped successfully to $w x $h"
