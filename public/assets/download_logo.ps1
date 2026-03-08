$url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Logo_Minangkabau_International_Airport.png/816px-Logo_Minangkabau_International_Airport.png"
$dest = "logo-minangkabau.png"
Write-Host "Downloading $url to $dest"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $url -OutFile $dest -ErrorAction Stop
if (Test-Path $dest) {
    Write-Host "Download SUCCESSFUL"
} else {
    Write-Host "Download FAILED"
}
