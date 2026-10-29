param(
    [string]$Base = 'https://pdh9ryeacb.execute-api.ap-south-1.amazonaws.com/api/v1',
    [string]$Email = 'medalog.qa@example.com',
    [string]$Password = 'MediaLogQa#2026'
)

$ErrorActionPreference = 'Stop'
function Show($label, $value) { Write-Output ("{0,-28} {1}" -f $label, $value) }

$health = Invoke-RestMethod -Uri "$Base/health" -Method Get
Show 'health' $health.status

# sign in (register the throwaway QA account on first run)
try {
    $auth = Invoke-RestMethod -Uri "$Base/auth/login" -Method Post -ContentType 'application/json' -Body (@{
            email = $Email; password = $Password; deviceName = 'MediaLog QA'
        } | ConvertTo-Json)
} catch {
    $auth = Invoke-RestMethod -Uri "$Base/auth/register" -Method Post -ContentType 'application/json' -Body (@{
            email = $Email; password = $Password; name = 'MediaLog QA'; deviceName = 'MediaLog QA'
        } | ConvertTo-Json)
}
$token = $auth.data.accessToken
Show 'access token' ($token.Substring(0, 18) + '...')
$headers = @{ Authorization = "Bearer $token" }

# unauth guard
try {
    Invoke-RestMethod -Uri "$Base/quick-records" -Method Get | Out-Null
    Show 'unauth guard' 'FAILED - no token accepted!'
} catch {
    Show 'unauth guard' ("{0} (expected 401)" -f $_.Exception.Response.StatusCode.value__)
}

$recordId = [guid]::NewGuid().ToString()
$body = @{ id = $recordId; mediaType = 'series'; title = 'QA Sync Probe' } | ConvertTo-Json
Invoke-RestMethod -Uri "$Base/quick-records" -Method Post -Headers $headers -ContentType 'application/json' -Body $body | Out-Null
Show 'create record' $recordId

# replay the same id -> must be idempotent, not a 500
Invoke-RestMethod -Uri "$Base/quick-records" -Method Post -Headers $headers -ContentType 'application/json' -Body $body | Out-Null
Show 'idempotent create' 'ok (same id accepted twice)'

$logId = [guid]::NewGuid().ToString()
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$logBody = @{ id = $logId; note = 'finished ep 3'; stampedAt = $stamp } | ConvertTo-Json
Invoke-RestMethod -Uri "$Base/quick-records/$recordId/logs" -Method Post -Headers $headers -ContentType 'application/json' -Body $logBody | Out-Null
Invoke-RestMethod -Uri "$Base/quick-records/$recordId/logs" -Method Post -Headers $headers -ContentType 'application/json' -Body $logBody | Out-Null
Show 'add log (twice)' $logId

$list = Invoke-RestMethod -Uri "$Base/quick-records?withLogs=true&includeDissolved=true" -Method Get -Headers $headers
$found = $list.data | Where-Object { $_.id -eq $recordId }
Show 'list withLogs' ("records={0} logs={1}" -f $list.data.Count, $found.logs.Count)
Show 'stampedAt preserved' ($found.logs[0].stampedAt -eq $stamp)

Invoke-RestMethod -Uri "$Base/quick-records/$recordId" -Method Delete -Headers $headers | Out-Null
$after = Invoke-RestMethod -Uri "$Base/quick-records?withLogs=true&includeDissolved=true" -Method Get -Headers $headers
$dissolved = $after.data | Where-Object { $_.id -eq $recordId }
Show 'dissolve (soft)' $dissolved.status
Show 'log survives dissolve' ($dissolved.logs.Count -eq 1)
