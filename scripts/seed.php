<?php
if (PHP_SAPI !== 'cli') {
  http_response_code(404);
  exit;
}

require_once __DIR__ . '/../db.php';
$seedPassword = getenv('SEED_PASSWORD');
if (!$seedPassword || strlen($seedPassword) < 12) {
  fwrite(STDERR, "Set SEED_PASSWORD to a value at least 12 characters long.\n");
  exit(1);
}

$hash = password_hash($seedPassword, PASSWORD_DEFAULT);
foreach ([['Ali Farmer', '03001111111', 'farmer', 'Sahiwal'], ['Bilal Farmer', '03001111112', 'farmer', 'Okara'],
  ['Staff Ahmed', '03003333333', 'staff', 'Karachi'], ['Inspector Sana', '03004444444', 'inspector', 'Karachi'], ['Admin Zara', '03005555555', 'admin', 'Karachi']] as $x) {
  q('INSERT INTO users (name,phone,password,role,location) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),password=VALUES(password),role=VALUES(role),location=VALUES(location)', [$x[0], $x[1], $hash, $x[2], $x[3]]);
}

fwrite(STDOUT, "Demo users created/updated. All use the configured SEED_PASSWORD.\n");
