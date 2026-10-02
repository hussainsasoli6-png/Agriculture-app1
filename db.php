<?php
$dbHost = getenv('DB_HOST');
$dbName = getenv('DB_NAME');
$dbUser = getenv('DB_USER');
$dbPassword = getenv('DB_PASSWORD');
$dbPort = getenv('DB_PORT') ?: '3306';
if (!$dbHost || !$dbName || !$dbUser || !$dbPassword) {
  throw new RuntimeException('DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD must be configured.');
}

$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false,
  PDO::ATTR_TIMEOUT => 5
];
$dbSslCa = getenv('DB_SSL_CA');
$temporaryCaPath = null;
if ($dbSslCa) {
  $caPath = $dbSslCa;
  if (str_contains($dbSslCa, '-----BEGIN CERTIFICATE-----')) {
    $temporaryCaPath = tempnam(sys_get_temp_dir(), 'agriqueue-ca-');
    if ($temporaryCaPath === false) {
      throw new RuntimeException('Unable to prepare the database CA certificate.');
    }
    if (file_put_contents($temporaryCaPath, $dbSslCa) === false) {
      unlink($temporaryCaPath);
      throw new RuntimeException('Unable to prepare the database CA certificate.');
    }
    $caPath = $temporaryCaPath;
  }
  $options[PDO::MYSQL_ATTR_SSL_CA] = $caPath;
  if (defined('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')) {
    $options[constant('PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT')] = true;
  }
}

try {
  $pdo = new PDO(
    "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4",
    $dbUser,
    $dbPassword,
    $options
  );
} finally {
  if ($temporaryCaPath && file_exists($temporaryCaPath)) {
    unlink($temporaryCaPath);
  }
}
const SLOT_TIMES = [['08:00', '10:00'], ['10:00', '12:00'], ['12:00', '14:00'], ['14:00', '16:00']];
function q($sql, $p = []) { global $pdo; $s = $pdo->prepare($sql); $s->execute($p); return $s; }
function today() { return gmdate('Y-m-d'); } // JavaScript ki TODAY jaisi (UTC) tareekh
function ensure_slots($c, $d) {
  $cap = (int)(q('SELECT daily_capacity FROM centers WHERE center_id=?', [$c])->fetchColumn() / 4);
  foreach (SLOT_TIMES as $t)
    q('INSERT IGNORE INTO time_slots (center_id,slot_date,start_time,end_time,capacity_tons) VALUES (?,?,?,?,?)', [$c, $d, $t[0], $t[1], $cap]);
}
