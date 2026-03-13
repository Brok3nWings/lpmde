# ============================================================
# setup-docker-db.ps1
# Configure et démarre le conteneur PostgreSQL local,
# exécute les migrations Doctrine et insère les données initiales.
#
# Usage :
#   .\setup-docker-db.ps1              # setup complet
#   .\setup-docker-db.ps1 -SeedOnly    # réinsère uniquement les données
# ============================================================

param(
    [switch]$SeedOnly
)

$NETWORK     = "lpmde-net"
$PG_NAME     = "lpmde_db_prod"
$PG_IMAGE    = "postgres:16-alpine"
$PG_DB       = "app_db"
$PG_USER     = "app_user"
$PG_PASS     = "app_password"
$PG_VOLUME   = "lpmde_pg_data"
$DATABASE_URL = "postgresql://${PG_USER}:${PG_PASS}@${PG_NAME}:5432/${PG_DB}?serverVersion=16&charset=utf8"

$APP_CONTAINER = "lpmde_prod"

# ── Réseau ──────────────────────────────────────────────────
Write-Host "--- Réseau Docker ---" -ForegroundColor Cyan
$netExists = docker network ls --format "{{.Name}}" | Where-Object { $_ -eq $NETWORK }
if (-not $netExists) {
    docker network create $NETWORK | Out-Null
    Write-Host "  Réseau '$NETWORK' créé." -ForegroundColor Green
} else {
    Write-Host "  Réseau '$NETWORK' déjà présent." -ForegroundColor Gray
}

if (-not $SeedOnly) {
    # ── Conteneur PostgreSQL ─────────────────────────────────
    Write-Host ""
    Write-Host "--- Conteneur PostgreSQL ---" -ForegroundColor Cyan

    $running = docker inspect --format "{{.State.Running}}" $PG_NAME 2>&1
    if ($running -eq "true") {
        Write-Host "  '$PG_NAME' tourne déjà." -ForegroundColor Gray
        # S'assurer qu'il est sur le bon réseau
        docker network connect $NETWORK $PG_NAME 2>&1 | Out-Null
    } else {
        $exists = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $PG_NAME }
        if ($exists) {
            Write-Host "  Suppression de l'ancien conteneur '$PG_NAME'..."
            docker rm $PG_NAME | Out-Null
        }
        Write-Host "  Démarrage de PostgreSQL 16..."
        docker run -d `
            --restart=unless-stopped `
            --network $NETWORK `
            --name $PG_NAME `
            -e POSTGRES_DB=$PG_DB `
            -e POSTGRES_USER=$PG_USER `
            -e POSTGRES_PASSWORD=$PG_PASS `
            -v "${PG_VOLUME}:/var/lib/postgresql/data" `
            -p 5432:5432 `
            $PG_IMAGE | Out-Null

        Write-Host "  Attente de la disponibilité PostgreSQL..."
        $ready = $false
        for ($i = 0; $i -lt 20; $i++) {
            Start-Sleep -Seconds 3
            $check = docker exec $PG_NAME pg_isready -U $PG_USER -d $PG_DB 2>&1
            if ($LASTEXITCODE -eq 0) { $ready = $true; break }
            Write-Host "  ... tentative $($i+1)/20"
        }
        if (-not $ready) {
            Write-Host "  PostgreSQL n'a pas démarré à temps." -ForegroundColor Red
            exit 1
        }
        Write-Host "  PostgreSQL prêt." -ForegroundColor Green
    }

    # ── Reconnecter le conteneur app ─────────────────────────
    Write-Host ""
    Write-Host "--- Connexion du conteneur app au réseau ---" -ForegroundColor Cyan
    $appRunning = docker inspect --format "{{.State.Running}}" $APP_CONTAINER 2>&1
    if ($appRunning -eq "true") {
        docker network connect $NETWORK $APP_CONTAINER 2>&1 | Out-Null
        Write-Host "  '$APP_CONTAINER' connecté à '$NETWORK'." -ForegroundColor Green
    } else {
        Write-Host "  '$APP_CONTAINER' n'est pas en cours d'exécution — ignoré." -ForegroundColor Yellow
    }

    # ── Migrations ───────────────────────────────────────────
    Write-Host ""
    Write-Host "--- Migrations Doctrine ---" -ForegroundColor Cyan
    $appRunning = docker inspect --format "{{.State.Running}}" $APP_CONTAINER 2>&1
    if ($appRunning -eq "true") {
        docker exec -e "DATABASE_URL=$DATABASE_URL" $APP_CONTAINER `
            bash -c "cd /var/www/html && php bin/console doctrine:migrations:migrate --no-interaction"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Migrations exécutées avec succès." -ForegroundColor Green
        } else {
            Write-Host "  Erreur lors des migrations." -ForegroundColor Red
        }
    } else {
        Write-Host "  Conteneur app non disponible — migrations ignorées." -ForegroundColor Yellow
        Write-Host "  Relancez le script après avoir démarré '$APP_CONTAINER'." -ForegroundColor Yellow
    }
}

# ── Fixture (seed) ───────────────────────────────────────────
Write-Host ""
Write-Host "--- Insertion des données initiales ---" -ForegroundColor Cyan

$seedScript = @'
<?php
$pdo = new PDO(
    "pgsql:host=lpmde_db_prod;port=5432;dbname=app_db",
    "app_user",
    "app_password"
);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$products = [
    ["Potion de l'Epouvante",   "Breuvage mysterieux qui donne des frissons garantis",       12.99],
    ["Grimoire des Ombres",      "Recueil de sorts anciens pour invoquer les esprits",        34.50],
    ["Chandelle Maudite",        "Bougie noire qui brule sans jamais se consumer",             8.00],
    ["Masque du Spectre",        "Masque traditionnel porte lors des rituels d Halloween",    22.90],
    ["Fiole de Sang de Dragon",  "Liquide rouge sang a l odeur envoutante",                  15.00],
    ["Toile d Araignee Eternelle","Decoration tissee par les araignees des cryptes",           6.50],
    ["Cape du Vampyr",           "Cape en velours noir portee par le comte lui-meme",         89.00],
    ["Dent de Loup-Garou",       "Amulette de protection contre les creatures de la nuit",   19.99],
];

$stmt = $pdo->prepare(
    "INSERT INTO product (name, description, price)
     VALUES (:name, :description, :price)
     ON CONFLICT DO NOTHING"
);

$inserted = 0;
foreach ($products as [$name, $desc, $price]) {
    $stmt->execute([":name" => $name, ":description" => $desc, ":price" => $price]);
    $inserted += $stmt->rowCount();
}

$total = $pdo->query("SELECT COUNT(*) FROM product")->fetchColumn();
echo "OK — $inserted produits inseres, $total produits en base au total\n";
'@

$appRunning = docker inspect --format "{{.State.Running}}" $APP_CONTAINER 2>&1
if ($appRunning -eq "true") {
    $seedScript | docker exec -i $APP_CONTAINER bash -c "cat > /tmp/seed.php && php /tmp/seed.php"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Données insérées avec succès." -ForegroundColor Green
    } else {
        Write-Host "  Erreur lors de l'insertion des données." -ForegroundColor Red
    }
} else {
    # Seed direct via le conteneur PostgreSQL
    Write-Host "  Seed direct via le conteneur PostgreSQL..."
    $pgSeed = @"
INSERT INTO product (name, description, price)
VALUES
  ('Potion de l Epouvante',    'Breuvage mysterieux qui donne des frissons',    12.99),
  ('Grimoire des Ombres',       'Recueil de sorts anciens',                     34.50),
  ('Chandelle Maudite',         'Bougie noire qui brule sans se consumer',       8.00),
  ('Masque du Spectre',         'Masque pour rituels d Halloween',              22.90),
  ('Fiole de Sang de Dragon',   'Liquide rouge sang envoutant',                 15.00),
  ('Toile d Araignee Eternelle','Decoration des cryptes',                        6.50),
  ('Cape du Vampyr',            'Cape en velours noir du comte',                89.00),
  ('Dent de Loup-Garou',        'Amulette de protection',                       19.99)
ON CONFLICT DO NOTHING;
SELECT COUNT(*) AS total FROM product;
"@
    $pgSeed | docker exec -i $PG_NAME psql -U $PG_USER -d $PG_DB
}

# ── Vérification finale ──────────────────────────────────────
Write-Host ""
Write-Host "--- Vérification /healthy ---" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri http://localhost:8088/healthy -UseBasicParsing -ErrorAction Stop
    $json = $response.Content | ConvertFrom-Json
    Write-Host "  Status : $($json.status)" -ForegroundColor Green
    Write-Host "  DB     : $($json.database)" -ForegroundColor Green
    Write-Host "  Produits en base : $($json.products.total)" -ForegroundColor Green
} catch {
    Write-Host "  /healthy inaccessible : $_" -ForegroundColor Yellow
    Write-Host "  Démarrez le conteneur app puis relancez : .\setup-docker-db.ps1 -SeedOnly" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup terminé ===" -ForegroundColor Green
