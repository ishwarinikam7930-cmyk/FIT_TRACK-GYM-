$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

try {
    $listener.Start()
    Write-Output "Server running at http://localhost:$port/"
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

$sessionsDbFile = Join-Path $root "sessions.json"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".pdf"  = "application/pdf"
}

function Get-RequestBody($req) {
    if (-not $req.HasEntityBody -or $req.ContentLength64 -le 0) { return "{}" }
    $len = [int]$req.ContentLength64
    $buffer = New-Object byte[] $len
    $bytesRead = 0
    while ($bytesRead -lt $len) {
        $read = $req.InputStream.Read($buffer, $bytesRead, $len - $bytesRead)
        if ($read -le 0) { break }
        $bytesRead += $read
    }
    return [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
}

function Send-JsonResponse($resp, $statusCode, $obj) {
    $json = ConvertTo-Json -InputObject $obj -Depth 10 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $resp.StatusCode = $statusCode
    $resp.ContentType = "application/json; charset=utf-8"
    $resp.AddHeader("Access-Control-Allow-Origin", "*")
    $resp.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT")
    $resp.AddHeader("Access-Control-Allow-Headers", "Content-Type")
    $resp.ContentLength64 = $bytes.Length
    $resp.KeepAlive = $false
    $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    $resp.OutputStream.Flush()
    $resp.Close()
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = $request.Url.LocalPath
        $httpMethod = $request.HttpMethod

        if ($httpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT")
            $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")
            $response.KeepAlive = $false
            $response.Close()
            continue
        }

        # ── API Routes ──
        if ($urlPath -eq "/api/sessions" -and $httpMethod -eq "GET") {
            if (Test-Path $sessionsDbFile) {
                $content = Get-Content -Path $sessionsDbFile -Raw -Encoding UTF8
                $respBytes = [System.Text.Encoding]::UTF8.GetBytes($content)
                $response.StatusCode = 200
                $response.ContentType = "application/json; charset=utf-8"
                $response.AddHeader("Access-Control-Allow-Origin", "*")
                $response.ContentLength64 = $respBytes.Length
                $response.KeepAlive = $false
                $response.OutputStream.Write($respBytes, 0, $respBytes.Length)
                $response.OutputStream.Flush()
                $response.Close()
            }
            else {
                Send-JsonResponse $response 200 @()
            }
            continue
        }

        if ($urlPath -eq "/api/sessions/complete" -and $httpMethod -eq "POST") {
            $bodyText = Get-RequestBody $request
            $body = ConvertFrom-Json $bodyText

            if (-not $body -or -not $body.sessionId) {
                Send-JsonResponse $response 400 @{ success = $false; error = "sessionId is required" }
                continue
            }

            if (Test-Path $sessionsDbFile) {
                $content = Get-Content -Path $sessionsDbFile -Raw -Encoding UTF8
                $sessions = @(ConvertFrom-Json $content)
                $target = $sessions | Where-Object { $_.id -eq $body.sessionId }
                if ($target) {
                    $target.status = "Completed"
                    $target.category = "completed"
                    $newJson = ConvertTo-Json -InputObject $sessions -Depth 10
                    [System.IO.File]::WriteAllText($sessionsDbFile, $newJson, [System.Text.Encoding]::UTF8)
                    Send-JsonResponse $response 200 @{ success = $true; message = "Session marked completed"; session = $target }
                }
                else {
                    Send-JsonResponse $response 404 @{ success = $false; error = "Session not found" }
                }
            }
            else {
                Send-JsonResponse $response 404 @{ success = $false; error = "Database not initialized" }
            }
            continue
        }

        if ($urlPath -eq "/api/sessions/start" -and $httpMethod -eq "POST") {
            $bodyText = Get-RequestBody $request
            $body = ConvertFrom-Json $bodyText

            if (Test-Path $sessionsDbFile -and $body -and $body.sessionId) {
                $content = Get-Content -Path $sessionsDbFile -Raw -Encoding UTF8
                $sessions = @(ConvertFrom-Json $content)
                $target = $sessions | Where-Object { $_.id -eq $body.sessionId }
                if ($target -and $target.status -eq "Completed") {
                    Send-JsonResponse $response 400 @{ success = $false; error = "Session $($body.sessionId) has already ended and is marked completed." }
                    continue
                }
            }
            Send-JsonResponse $response 200 @{ success = $true; message = "Session can be started" }
            continue
        }

        if ($urlPath -eq "/api/sessions/book" -and $httpMethod -eq "POST") {
            $bodyText = Get-RequestBody $request
            $body = ConvertFrom-Json $bodyText

            if (Test-Path $sessionsDbFile) {
                $content = Get-Content -Path $sessionsDbFile -Raw -Encoding UTF8
                $sessions = [System.Collections.ArrayList]@(ConvertFrom-Json $content)
                $sessions.Insert(0, $body)
                $newJson = ConvertTo-Json -InputObject $sessions -Depth 10
                [System.IO.File]::WriteAllText($sessionsDbFile, $newJson, [System.Text.Encoding]::UTF8)
                Send-JsonResponse $response 200 @{ success = $true; session = $body }
            }
            else {
                Send-JsonResponse $response 500 @{ success = $false; error = "Database error" }
            }
            continue
        }

        # ── Static File Server ──
        if ($urlPath -eq "/" -or $urlPath -eq "") {
            $urlPath = "/index.html"
        }

        $urlPath = $urlPath.TrimStart("/").Replace("/", "\")
        $filePath = Join-Path $root $urlPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $contentType
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.AddHeader("Pragma", "no-cache")
            $response.AddHeader("Expires", "0")
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.KeepAlive = $false
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.OutputStream.Flush()
        }
        else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
            $response.ContentLength64 = $notFound.Length
            $response.KeepAlive = $false
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
            $response.OutputStream.Flush()
        }
        $response.Close()
    }
    catch {
        # continue loop on client abort
    }
}
