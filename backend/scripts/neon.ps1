# Utilise la base Neon au lieu de la base Docker locale.
#
#   cd backend
#   .\scripts\neon.ps1 -Setup     # 1re fois : tables + menu + 90 jours de démo + compte admin, puis API
#   .\scripts\neon.ps1            # ensuite : lance seulement l'API sur Neon
#
# Les adresses de la base sont lues dans ..\.env.local (créé par « neon deploy », jamais commité) :
#   DATABASE_URL           pooled  (« -pooler ») : l'application
#   DATABASE_URL_UNPOOLED  directe              : les migrations Alembic
param([switch]$Setup)

$ErrorActionPreference = "Stop"
$envFile = Join-Path $PSScriptRoot "..\..\.env.local"
if (-not (Test-Path $envFile)) { throw "Fichier .env.local introuvable : lance « neon deploy » à la racine du projet." }

# Charge KEY="valeur" dans les variables d'environnement de cette fenêtre seulement
foreach ($line in Get-Content $envFile) {
    if ($line -match '^\s*([A-Z_][A-Z0-9_]*)\s*=\s*"?(.*?)"?\s*$') {
        Set-Item -Path "Env:$($Matches[1])" -Value $Matches[2]
    }
}
$python = Join-Path $PSScriptRoot "..\.venv\Scripts\python.exe"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "Base : Neon (branche $env:NEON_BRANCH)" -ForegroundColor Yellow

if ($Setup) {
    Write-Host "1/4 Création des tables (Alembic, connexion directe)..." -ForegroundColor Cyan
    & $python -m alembic upgrade head;           if ($LASTEXITCODE) { exit 1 }
    Write-Host "2/4 Menu (6 catégories, 25 produits)..." -ForegroundColor Cyan
    & $python -m scripts.seed_menu;              if ($LASTEXITCODE) { exit 1 }
    Write-Host "3/4 Données de démo (90 jours, peut prendre quelques minutes)..." -ForegroundColor Cyan
    & $python -m scripts.seed_demo;              if ($LASTEXITCODE) { exit 1 }
    Write-Host "4/4 Compte admin (choisis un mot de passe)..." -ForegroundColor Cyan
    & $python -m scripts.create_admin admin@lepetitgrain.example; if ($LASTEXITCODE) { exit 1 }
}

Write-Host "API sur http://localhost:8000 (base Neon). Ctrl+C pour arrêter." -ForegroundColor Green
& $python -m uvicorn app.main:app
