CREATE DATABASE IF NOT EXISTS teletabis_salon
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE teletabis_salon;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone_enc TEXT NULL,
  pass_hash VARCHAR(100) NOT NULL,
  role ENUM('customer','kasir','admin') NOT NULL DEFAULT 'customer',
  failed TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until BIGINT UNSIGNED NOT NULL DEFAULT 0,
  pw_changed BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pw_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  hash VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pw_history_user (user_id,id),
  CONSTRAINT fk_pw_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash CHAR(64) NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  expires BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (token_hash),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expiry (expires),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  price INT UNSIGNED NOT NULL,
  discount_price INT UNSIGNED NULL,
  minutes SMALLINT UNSIGNED NOT NULL,
  image_path VARCHAR(255) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uq_services_name (name),
  KEY idx_services_active_sort (active,sort_order,id),
  CONSTRAINT chk_services_price CHECK (price > 0),
  CONSTRAINT chk_services_discount CHECK (discount_price IS NULL OR (discount_price > 0 AND discount_price < price)),
  CONSTRAINT chk_services_minutes CHECK (minutes > 0 AND minutes <= 1440)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  service_id BIGINT UNSIGNED NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status ENUM('menunggu','dikonfirmasi','selesai','batal') NOT NULL DEFAULT 'menunggu',
  created BIGINT UNSIGNED NOT NULL,
  price INT UNSIGNED NOT NULL,
  PRIMARY KEY (id),
  KEY idx_bookings_customer (user_id,booking_date,booking_time),
  KEY idx_bookings_slot (booking_date,booking_time,status),
  KEY idx_bookings_created (user_id,created),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ts DATETIME(3) NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  detail VARCHAR(200) NOT NULL DEFAULT '',
  ip VARCHAR(45) NOT NULL DEFAULT '',
  prev_hash CHAR(64) NOT NULL,
  hash CHAR(64) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_audit_timestamp (ts),
  KEY idx_audit_action_timestamp (action,ts),
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO users (id,name,email,phone_enc,pass_hash,role,pw_changed) VALUES
  (1,'Admin','admin@teletabis.id',NULL,'$2b$10$wPKqxikl5q1U6JOm7.f5juqsdfRz0sYdequAiSBQ6wcbvTybLv5rG','admin',CAST(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3))*1000 AS UNSIGNED)),
  (2,'Kasir','kasir@teletabis.id',NULL,'$2b$10$C5W7oRmx3lXo7K0OKb.wneViLswRYG/QGA8OfAJ2N3TTAX9ZqccIy','kasir',CAST(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(3))*1000 AS UNSIGNED));

INSERT INTO pw_history (user_id,hash)
SELECT id,pass_hash FROM users WHERE id IN (1,2)
  AND NOT EXISTS (SELECT 1 FROM pw_history history WHERE history.user_id=users.id);

INSERT IGNORE INTO services (name,price,discount_price,minutes,active,sort_order) VALUES
  ('Potong Rambut Wanita',75000,NULL,45,1,1),
  ('Potong Rambut Pria',50000,NULL,30,1,2),
  ('Hair Wash',35000,NULL,30,1,3),
  ('Creambath',120000,NULL,60,1,4),
  ('Hair Spa',150000,NULL,60,1,5),
  ('Hair Mask',130000,NULL,45,1,6),
  ('Hair Coloring Basic',350000,NULL,120,1,7),
  ('Hair Coloring Premium',550000,NULL,180,1,8),
  ('Highlight Rambut',450000,NULL,180,1,9),
  ('Bleaching',600000,NULL,180,1,10),
  ('Smoothing',450000,NULL,150,1,11),
  ('Rebonding',500000,NULL,180,1,12),
  ('Keratin Treatment',700000,NULL,180,1,13),
  ('Hair Extension',800000,NULL,180,1,14),
  ('Hair Styling',100000,NULL,60,1,15),
  ('Blow Dry',80000,NULL,45,1,16),
  ('Manicure',100000,NULL,45,1,17),
  ('Pedicure',100000,NULL,45,1,18),
  ('Manicure Pedicure Paket',180000,NULL,75,1,19),
  ('Nail Art Basic',150000,NULL,60,1,20),
  ('Nail Art Premium',300000,NULL,90,1,21),
  ('Eyebrow Shaping',75000,NULL,30,1,22),
  ('Eyelash Extension',250000,NULL,120,1,23),
  ('Facial Basic',150000,NULL,60,1,24),
  ('Facial Acne',250000,NULL,75,1,25),
  ('Facial Brightening',300000,NULL,75,1,26),
  ('Totok Wajah',175000,NULL,45,1,27),
  ('Body Scrub',250000,NULL,60,1,28),
  ('Body Spa',350000,NULL,90,1,29),
  ('Makeup Party',500000,NULL,120,1,30);

UPDATE services SET description=CASE name
  WHEN 'Potong Rambut Wanita' THEN 'Potongan rambut yang disesuaikan dengan bentuk wajah, tekstur rambut, dan gaya yang kamu inginkan.'
  WHEN 'Potong Rambut Pria' THEN 'Potong dan rapikan rambut dengan gaya pilihanmu, dilengkapi finishing agar tampak bersih dan rapi.'
  WHEN 'Hair Wash' THEN 'Keramas dan bilas rambut dengan pijatan lembut untuk membantu membersihkan kulit kepala dan menyegarkan rambut.'
  WHEN 'Creambath' THEN 'Perawatan rambut dengan krim bernutrisi dan pijatan kulit kepala untuk membantu rambut terasa lebih lembut dan rileks.'
  WHEN 'Hair Spa' THEN 'Perawatan intensif dengan masker rambut dan pijatan untuk membantu menjaga kelembapan serta kilau rambut.'
  WHEN 'Hair Mask' THEN 'Masker rambut bernutrisi untuk membantu merawat rambut kering atau kusam agar terasa lebih halus.'
  WHEN 'Hair Coloring Basic' THEN 'Pewarnaan rambut satu warna dengan pilihan warna yang dikonsultasikan terlebih dahulu bersama stylist.'
  WHEN 'Hair Coloring Premium' THEN 'Pewarnaan rambut premium dengan konsultasi warna dan aplikasi lebih detail untuk hasil yang lebih personal.'
  WHEN 'Highlight Rambut' THEN 'Teknik pewarnaan pada beberapa bagian rambut untuk memberi dimensi dan aksen warna.'
  WHEN 'Bleaching' THEN 'Proses mencerahkan warna rambut sebagai persiapan warna tertentu, dengan konsultasi kondisi rambut sebelumnya.'
  WHEN 'Smoothing' THEN 'Perawatan pelurusan untuk membantu rambut tampak lebih halus dan mudah diatur.'
  WHEN 'Rebonding' THEN 'Perawatan pelurusan rambut untuk hasil yang tampak lebih lurus, rapi, dan tahan lama.'
  WHEN 'Keratin Treatment' THEN 'Perawatan keratin untuk membantu menghaluskan tampilan rambut dan mengurangi kesan kusut.'
  WHEN 'Hair Extension' THEN 'Penambahan rambut untuk memberi panjang atau volume sesuai gaya dan warna yang dikonsultasikan.'
  WHEN 'Hair Styling' THEN 'Penataan rambut untuk acara atau aktivitas khusus sesuai inspirasi gaya pilihanmu.'
  WHEN 'Blow Dry' THEN 'Pengeringan sekaligus penataan dengan blow dryer untuk hasil rambut yang lebih bervolume dan rapi.'
  WHEN 'Manicure' THEN 'Perawatan kuku tangan meliputi merapikan bentuk kuku, membersihkan kutikula, dan merawat tangan.'
  WHEN 'Pedicure' THEN 'Perawatan kuku kaki meliputi merapikan kuku, membersihkan area kuku, dan perawatan kaki yang menenangkan.'
  WHEN 'Manicure Pedicure Paket' THEN 'Paket perawatan lengkap untuk kuku tangan dan kaki agar tampak rapi dan terawat.'
  WHEN 'Nail Art Basic' THEN 'Hiasan kuku dengan desain sederhana dan pilihan warna yang dapat disesuaikan.'
  WHEN 'Nail Art Premium' THEN 'Desain nail art lebih detail dengan pilihan dekorasi dan sentuhan artistik sesuai inspirasimu.'
  WHEN 'Eyebrow Shaping' THEN 'Merapikan bentuk alis agar terlihat seimbang dan sesuai dengan karakter wajah.'
  WHEN 'Eyelash Extension' THEN 'Aplikasi extension bulu mata untuk memberi tampilan lebih lentik dan bervolume.'
  WHEN 'Facial Basic' THEN 'Perawatan wajah dasar meliputi pembersihan dan perawatan kulit agar terasa lebih segar.'
  WHEN 'Facial Acne' THEN 'Perawatan wajah yang difokuskan untuk kulit berjerawat dengan tahapan yang disesuaikan kondisi kulit.'
  WHEN 'Facial Brightening' THEN 'Perawatan wajah untuk membantu kulit tampak lebih cerah dan terasa lebih segar.'
  WHEN 'Totok Wajah' THEN 'Pijatan lembut pada titik-titik wajah untuk membantu memberi sensasi rileks dan menyegarkan.'
  WHEN 'Body Scrub' THEN 'Eksfoliasi tubuh dengan scrub untuk membantu mengangkat sel kulit mati dan membuat kulit terasa lebih halus.'
  WHEN 'Body Spa' THEN 'Rangkaian perawatan tubuh yang menenangkan untuk membantu tubuh terasa rileks dan kulit terawat.'
  WHEN 'Makeup Party' THEN 'Riasan untuk pesta atau acara spesial, disesuaikan dengan tema acara dan gaya yang kamu inginkan.'
  ELSE COALESCE(description,'')
END
WHERE description IS NULL OR TRIM(description)='';
