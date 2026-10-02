CREATE TABLE IF NOT EXISTS centers (
  center_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  center_name VARCHAR(120) NOT NULL,
  location VARCHAR(120) NOT NULL,
  daily_capacity INT UNSIGNED NOT NULL,
  PRIMARY KEY (center_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('farmer','staff','inspector','admin') NOT NULL,
  location VARCHAR(120) NOT NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY users_phone_unique (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS time_slots (
  slot_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  center_id INT UNSIGNED NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity_tons INT UNSIGNED NOT NULL,
  booked_tons DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (slot_id),
  UNIQUE KEY time_slots_center_date_start_unique (center_id,slot_date,start_time),
  CONSTRAINT time_slots_center_fk FOREIGN KEY (center_id) REFERENCES centers(center_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  farmer_id INT UNSIGNED NOT NULL,
  center_id INT UNSIGNED NOT NULL,
  slot_id INT UNSIGNED NOT NULL,
  crop_type VARCHAR(40) NOT NULL,
  estimated_quantity DECIMAL(10,2) NOT NULL,
  token_number VARCHAR(32) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'Booked',
  PRIMARY KEY (booking_id),
  UNIQUE KEY bookings_token_unique (token_number),
  KEY bookings_farmer_slot_idx (farmer_id,slot_id),
  KEY bookings_center_idx (center_id),
  CONSTRAINT bookings_farmer_fk FOREIGN KEY (farmer_id) REFERENCES users(user_id),
  CONSTRAINT bookings_center_fk FOREIGN KEY (center_id) REFERENCES centers(center_id),
  CONSTRAINT bookings_slot_fk FOREIGN KEY (slot_id) REFERENCES time_slots(slot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS weighing_records (
  weigh_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id INT UNSIGNED NOT NULL,
  gross_weight INT UNSIGNED NOT NULL,
  empty_weight INT UNSIGNED NOT NULL,
  net_weight INT UNSIGNED NOT NULL,
  PRIMARY KEY (weigh_id),
  KEY weighing_booking_idx (booking_id),
  CONSTRAINT weighing_booking_fk FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS quality_checks (
  quality_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id INT UNSIGNED NOT NULL,
  grade ENUM('A','B','C') NOT NULL,
  moisture DECIMAL(5,2) NOT NULL,
  result ENUM('Accepted','Rejected') NOT NULL,
  PRIMARY KEY (quality_id),
  KEY quality_booking_idx (booking_id),
  CONSTRAINT quality_booking_fk FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS procurement_records (
  procurement_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id INT UNSIGNED NOT NULL,
  actual_weight INT UNSIGNED NOT NULL,
  quality_grade ENUM('A','B','C') NOT NULL,
  price_per_kg DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(14,2) NOT NULL,
  payment_status ENUM('Pending','Paid') NOT NULL DEFAULT 'Pending',
  completed_at DATETIME NULL,
  PRIMARY KEY (procurement_id),
  KEY procurement_booking_idx (booking_id),
  CONSTRAINT procurement_booking_fk FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_sessions (
  session_id VARCHAR(128) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  session_data MEDIUMBLOB NOT NULL,
  last_activity INT UNSIGNED NOT NULL,
  expires_at INT UNSIGNED NOT NULL,
  PRIMARY KEY (session_id),
  KEY app_sessions_expiry_idx (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO centers (center_id,center_name,location,daily_capacity)
VALUES (1,'Lahore Grain Center','Lahore',80),(2,'Multan Procurement Center','Multan',60)
ON DUPLICATE KEY UPDATE center_name=VALUES(center_name),location=VALUES(location),daily_capacity=VALUES(daily_capacity);
