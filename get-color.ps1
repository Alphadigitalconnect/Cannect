Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap("C:\Users\susha\.gemini\antigravity-ide\scratch\cannect\public\logo-dark.png")
$pixel = $bmp.GetPixel(0, 0)
Write-Output ("#" + $pixel.R.ToString("X2") + $pixel.G.ToString("X2") + $pixel.B.ToString("X2"))
