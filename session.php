<?php
final class DatabaseSessionHandler implements SessionHandlerInterface, SessionUpdateTimestampHandlerInterface {
  private PDO $pdo;
  private int $lifetime;

  public function __construct(PDO $pdo, int $lifetime) {
    $this->pdo = $pdo;
    $this->lifetime = $lifetime;
  }

  public function open(string $path, string $name): bool { return true; }
  public function close(): bool { return true; }

  public function read(string $id): string|false {
    $stmt = $this->pdo->prepare('SELECT session_data FROM app_sessions WHERE session_id=? AND expires_at>?');
    $stmt->execute([$id, time()]);
    $data = $stmt->fetchColumn();
    return $data === false ? '' : $data;
  }

  public function write(string $id, string $data): bool {
    $now = time();
    $stmt = $this->pdo->prepare(
      'INSERT INTO app_sessions (session_id,session_data,last_activity,expires_at) VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE session_data=VALUES(session_data),last_activity=VALUES(last_activity),expires_at=VALUES(expires_at)'
    );
    return $stmt->execute([$id, $data, $now, $now + $this->lifetime]);
  }

  public function destroy(string $id): bool {
    $stmt = $this->pdo->prepare('DELETE FROM app_sessions WHERE session_id=?');
    return $stmt->execute([$id]);
  }

  public function gc(int $max_lifetime): int|false {
    $stmt = $this->pdo->prepare('DELETE FROM app_sessions WHERE expires_at<=?');
    return $stmt->execute([time()]) ? $stmt->rowCount() : false;
  }

  public function validateId(string $id): bool {
    $stmt = $this->pdo->prepare('SELECT 1 FROM app_sessions WHERE session_id=? AND expires_at>?');
    $stmt->execute([$id, time()]);
    return (bool)$stmt->fetchColumn();
  }

  public function updateTimestamp(string $id, string $data): bool {
    $now = time();
    $stmt = $this->pdo->prepare('UPDATE app_sessions SET last_activity=?,expires_at=? WHERE session_id=?');
    $stmt->execute([$now, $now + $this->lifetime, $id]);
    return $stmt->rowCount() > 0 || $this->write($id, $data);
  }
}

function app_request_is_secure(): bool {
  return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

function start_app_session(PDO $pdo): void {
  $lifetime = 1209600;
  ini_set('session.use_strict_mode', '1');
  ini_set('session.gc_maxlifetime', (string)$lifetime);
  session_name('agriqueue_session');
  session_set_cookie_params([
    'lifetime' => $lifetime,
    'path' => '/',
    'secure' => app_request_is_secure(),
    'httponly' => true,
    'samesite' => 'Lax'
  ]);
  session_set_save_handler(new DatabaseSessionHandler($pdo, $lifetime), true);
  if (!session_start()) {
    throw new RuntimeException('Unable to start application session.');
  }
}
