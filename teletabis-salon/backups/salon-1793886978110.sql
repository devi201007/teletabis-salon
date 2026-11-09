SET FOREIGN_KEY_CHECKS=0;
-- users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(190) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_enc` text COLLATE utf8mb4_unicode_ci,
  `pass_hash` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('customer','kasir','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'customer',
  `failed` tinyint unsigned NOT NULL DEFAULT '0',
  `locked_until` bigint unsigned NOT NULL DEFAULT '0',
  `pw_changed` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `users` (`id`,`name`,`email`,`phone_enc`,`pass_hash`,`role`,`failed`,`locked_until`,`pw_changed`) VALUES (1,'Bilqis','admin@teletabis.id',NULL,'$2b$10$wPKqxikl5q1U6JOm7.f5juqsdfRz0sYdequAiSBQ6wcbvTybLv5rG','admin',0,0,1793884433103);
INSERT INTO `users` (`id`,`name`,`email`,`phone_enc`,`pass_hash`,`role`,`failed`,`locked_until`,`pw_changed`) VALUES (2,'Kasir','kasir@teletabis.id',NULL,'$2b$10$C5W7oRmx3lXo7K0OKb.wneViLswRYG/QGA8OfAJ2N3TTAX9ZqccIy','kasir',0,0,1793884433103);
-- pw_history
CREATE TABLE IF NOT EXISTS `pw_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `hash` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pw_history_user` (`user_id`,`id`),
  CONSTRAINT `fk_pw_history_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `pw_history` (`id`,`user_id`,`hash`,`created_at`) VALUES (1,1,'$2b$10$wPKqxikl5q1U6JOm7.f5juqsdfRz0sYdequAiSBQ6wcbvTybLv5rG','2026-11-05 20:13:53');
INSERT INTO `pw_history` (`id`,`user_id`,`hash`,`created_at`) VALUES (2,2,'$2b$10$C5W7oRmx3lXo7K0OKb.wneViLswRYG/QGA8OfAJ2N3TTAX9ZqccIy','2026-11-05 20:13:53');
-- sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `token_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `expires` bigint unsigned NOT NULL,
  PRIMARY KEY (`token_hash`),
  KEY `idx_sessions_user` (`user_id`),
  KEY `idx_sessions_expiry` (`expires`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('527d01a168e7f618983d576c0e9c36d766c5632194d37966a1aedc93278e0485',1,1793892968376);
-- services
CREATE TABLE IF NOT EXISTS `services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` int unsigned NOT NULL,
  `discount_price` int unsigned DEFAULT NULL,
  `minutes` smallint unsigned NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_services_name` (`name`),
  KEY `idx_services_active_sort` (`active`,`sort_order`,`id`),
  CONSTRAINT `chk_services_discount` CHECK (((`discount_price` is null) or ((`discount_price` > 0) and (`discount_price` < `price`)))),
  CONSTRAINT `chk_services_minutes` CHECK (((`minutes` > 0) and (`minutes` <= 1440))),
  CONSTRAINT `chk_services_price` CHECK ((`price` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (1,'Potong Rambut Wanita',75000,NULL,45,NULL,1,1);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (2,'Potong Rambut Pria',50000,NULL,30,NULL,1,2);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (3,'Hair Wash',35000,NULL,30,NULL,1,3);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (4,'Creambath',120000,NULL,60,NULL,1,4);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (5,'Hair Spa',150000,NULL,60,NULL,1,5);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (6,'Hair Mask',130000,NULL,45,NULL,1,6);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (7,'Hair Coloring Basic',350000,NULL,120,NULL,1,7);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (8,'Hair Coloring Premium',550000,NULL,180,NULL,1,8);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (9,'Highlight Rambut',450000,NULL,180,NULL,1,9);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (10,'Bleaching',600000,NULL,180,NULL,1,10);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (11,'Smoothing',450000,NULL,150,NULL,1,11);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (12,'Rebonding',500000,NULL,180,NULL,1,12);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (13,'Keratin Treatment',700000,NULL,180,NULL,1,13);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (14,'Hair Extension',800000,NULL,180,NULL,1,14);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (15,'Hair Styling',100000,NULL,60,NULL,1,15);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (16,'Blow Dry',80000,NULL,45,NULL,1,16);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (17,'Manicure',100000,NULL,45,NULL,1,17);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (18,'Pedicure',100000,NULL,45,NULL,1,18);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (19,'Manicure Pedicure Paket',180000,NULL,75,NULL,1,19);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (20,'Nail Art Basic',150000,NULL,60,NULL,1,20);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (21,'Nail Art Premium',300000,NULL,90,NULL,1,21);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (22,'Eyebrow Shaping',75000,NULL,30,NULL,1,22);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (23,'Eyelash Extension',250000,NULL,120,NULL,1,23);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (24,'Facial Basic',150000,NULL,60,NULL,1,24);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (25,'Facial Acne',250000,NULL,75,NULL,1,25);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (26,'Facial Brightening',300000,NULL,75,NULL,1,26);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (27,'Totok Wajah',175000,NULL,45,NULL,1,27);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (28,'Body Scrub',250000,NULL,60,NULL,1,28);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (29,'Body Spa',350000,NULL,90,NULL,1,29);
INSERT INTO `services` (`id`,`name`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (30,'Makeup Party',500000,NULL,120,NULL,1,30);
-- bookings
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `service_id` bigint unsigned NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `status` enum('menunggu','dikonfirmasi','selesai','batal') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'menunggu',
  `created` bigint unsigned NOT NULL,
  `price` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_bookings_customer` (`user_id`,`booking_date`,`booking_time`),
  KEY `idx_bookings_slot` (`booking_date`,`booking_time`,`status`),
  KEY `idx_bookings_created` (`user_id`,`created`),
  KEY `fk_bookings_service` (`service_id`),
  CONSTRAINT `fk_bookings_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- audit_log
CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ts` datetime(3) NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `ip` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `prev_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_audit_timestamp` (`ts`),
  KEY `idx_audit_action_timestamp` (`action`,`ts`),
  KEY `fk_audit_user` (`user_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (1,'2026-11-05 13:36:08.399',1,'LOGIN_BERHASIL','','::1','GENESIS','19110fa290dcd054c5cd31d86d0f82b25a51f9ae33b6c40e1a419aec35960758');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (2,'2026-11-05 13:56:15.099',1,'BACKUP_DIBUAT','salon-1793886975038.sql','::1','19110fa290dcd054c5cd31d86d0f82b25a51f9ae33b6c40e1a419aec35960758','689757bd93305d66f2e28609d23281b812bb226c22f18ef0947cd23f08517e97');
SET FOREIGN_KEY_CHECKS=1;
