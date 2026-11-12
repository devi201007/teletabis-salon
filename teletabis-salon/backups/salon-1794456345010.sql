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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `users` (`id`,`name`,`email`,`phone_enc`,`pass_hash`,`role`,`failed`,`locked_until`,`pw_changed`) VALUES (1,'Admin','admin@teletabis.id',NULL,'$2b$10$wPKqxikl5q1U6JOm7.f5juqsdfRz0sYdequAiSBQ6wcbvTybLv5rG','admin',0,0,1794220480725);
INSERT INTO `users` (`id`,`name`,`email`,`phone_enc`,`pass_hash`,`role`,`failed`,`locked_until`,`pw_changed`) VALUES (2,'Kasir','kasir@teletabis.id',NULL,'$2b$10$C5W7oRmx3lXo7K0OKb.wneViLswRYG/QGA8OfAJ2N3TTAX9ZqccIy','kasir',0,0,1794220480725);
INSERT INTO `users` (`id`,`name`,`email`,`phone_enc`,`pass_hash`,`role`,`failed`,`locked_until`,`pw_changed`) VALUES (3,'customer','customer@teletabis.com','8MHPxG+RxKw+Re7O.vS0rrPWvZYprKslWVawoNQ==.118xqNsMewJbP5k=','$2b$10$M3bWsQpBz0N2DxfozAXKCOSfQmxRLajAdgpLW3YNKUW2f4Do6Ib0C','customer',0,0,1794230466270);
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
INSERT INTO `pw_history` (`id`,`user_id`,`hash`,`created_at`) VALUES (1,1,'$2b$10$wPKqxikl5q1U6JOm7.f5juqsdfRz0sYdequAiSBQ6wcbvTybLv5rG','2026-11-09 17:34:40');
INSERT INTO `pw_history` (`id`,`user_id`,`hash`,`created_at`) VALUES (2,2,'$2b$10$C5W7oRmx3lXo7K0OKb.wneViLswRYG/QGA8OfAJ2N3TTAX9ZqccIy','2026-11-09 17:34:40');
INSERT INTO `pw_history` (`id`,`user_id`,`hash`,`created_at`) VALUES (3,3,'$2b$10$M3bWsQpBz0N2DxfozAXKCOSfQmxRLajAdgpLW3YNKUW2f4Do6Ib0C','2026-11-09 20:21:06');
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
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('14bba871dda462749253e5e1f3e1357cb8e566cbe2f544ff32990deb7641a1ed',2,1794236943912);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('294acf8cec842348cba7fce68136365ffe05d3ac0aa696c31567020555999bd4',2,1794237007237);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('2a1451e0a5f73258f6433474842dff5c8121ba0ee9363615d3791a91af66fe3b',1,1794236491505);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('2eb6d0f122ceee068e7d246dfccf29fd9c9816378dc8784aa8721b0e58e195d0',2,1794237219471);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('3bb5dce65216432fa227b8da63f22640adf376e255069279818ed4d95f08a5f9',1,1794234932143);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('4803dc60161cffd79a27e0e929863eba7a046f5a87bd6aabe56dd30528b9d064',2,1794235467611);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('5eb40bcb18ac473363f4def32080fefa15927b815e9a183acea58d2fca603963',1,1794235754671);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('69f4eeb6ec6dd1a490ae057cdfd2cd17b77dfacb50b1ef74cc2eb04ff6ea8cd1',2,1794462643965);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('82c0122372fd7517a5f19a0a2f5e82e3b937843d2781d4610cd2f3e4b2eb1809',1,1794237167563);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('8b33bb0a1d835396ad355da5735591807a2071040a7245ed5ed3bdc3e1f2b1c1',1,1794236941581);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('8f359ba361b06ba9856284810a6bc4bcdecf1eb59ea2b14c5ec88700f93a8f8c',1,1794235002933);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('98ad8bd9edf102064c6a54b2ce68a0e9b74c40125f01419464368995bb7bc8e1',1,1794236694588);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('ad39055d723c50d0179be906deb737c0355d12e936645f63b261cce5fae4b9de',1,1794236663890);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('ae507d7669a3d0e850e72777c2e9941e1e18f44148361de165fcfe96f6ea931c',1,1794462430295);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('b49f41fe724989b2cda7edf4e9e22ee3ab9228602d12f677eae45d717e821980',1,1794236523810);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('ba70d815905c47e218dc9d8cd4b16996c93e7e714858494e9f304b918906ce48',3,1794237682320);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('bc70896562d4ca691e900fc71dd020da3270636f39b8535866988b609402dc65',1,1794236685369);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('d5b1dcac46fdd1ada7c1567ae9963fa7549d115ac74dee5e0dace9f78a4edd4b',1,1794236734112);
INSERT INTO `sessions` (`token_hash`,`user_id`,`expires`) VALUES ('eb6f8e65546f0915ea56b6473f2928adf5e235032878ccb965385739ee61ab56',1,1794236444490);
-- services
CREATE TABLE IF NOT EXISTS `services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
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
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (1,'Potong Rambut Wanita','Potongan rambut yang disesuaikan dengan bentuk wajah, tekstur rambut, dan gaya yang kamu inginkan.',75000,NULL,45,'/images/services/potong-rambut-wanita-1.jpg',1,1);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (2,'Potong Rambut Pria','Potong dan rapikan rambut dengan gaya pilihanmu, dilengkapi finishing agar tampak bersih dan rapi.',50000,NULL,30,'/images/services/potong-rambut-pria-2.jpg',1,2);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (3,'Hair Wash','Keramas dan bilas rambut dengan pijatan lembut untuk membantu membersihkan kulit kepala dan menyegarkan rambut.',35000,NULL,30,'/images/services/hair-wash-3.jpg',1,3);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (4,'Creambath','Perawatan rambut dengan krim bernutrisi dan pijatan kulit kepala untuk membantu rambut terasa lebih lembut dan rileks.',120000,NULL,60,'/images/services/creambath-4.jpg',1,4);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (5,'Hair Spa','Perawatan intensif dengan masker rambut dan pijatan untuk membantu menjaga kelembapan serta kilau rambut.',150000,NULL,60,'/images/services/hair-spa-5.jpg',1,5);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (6,'Hair Mask','Masker rambut bernutrisi untuk membantu merawat rambut kering atau kusam agar terasa lebih halus.',130000,NULL,45,'/images/services/hair-mask-6.jpg',1,6);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (7,'Hair Coloring Basic','Pewarnaan rambut satu warna dengan pilihan warna yang dikonsultasikan terlebih dahulu bersama stylist.',350000,NULL,120,'/images/services/hair-coloring-basic-7.jpg',1,7);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (8,'Hair Coloring Premium','Pewarnaan rambut premium dengan konsultasi warna dan aplikasi lebih detail untuk hasil yang lebih personal.',550000,NULL,180,'/images/services/hair-coloring-premium-8.jpg',1,8);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (9,'Highlight Rambut','Teknik pewarnaan pada beberapa bagian rambut untuk memberi dimensi dan aksen warna.',450000,NULL,180,'/images/services/highlight-rambut-9.jpg',1,9);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (10,'Bleaching','Proses mencerahkan warna rambut sebagai persiapan warna tertentu, dengan konsultasi kondisi rambut sebelumnya.',600000,NULL,180,'/images/services/bleaching-10.jpg',1,10);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (11,'Smoothing','Perawatan pelurusan untuk membantu rambut tampak lebih halus dan mudah diatur.',450000,NULL,150,'/images/services/smoothing-11.jpg',1,11);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (12,'Rebonding','Perawatan pelurusan rambut untuk hasil yang tampak lebih lurus, rapi, dan tahan lama.',500000,NULL,180,'/images/services/rebonding-12.jpg',1,12);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (13,'Keratin Treatment','Perawatan keratin untuk membantu menghaluskan tampilan rambut dan mengurangi kesan kusut.',700000,NULL,180,'/images/services/keratin-treatment-13.jpg',1,13);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (14,'Hair Extension','Penambahan rambut untuk memberi panjang atau volume sesuai gaya dan warna yang dikonsultasikan.',800000,NULL,180,'/images/services/hair-extension-14.jpg',1,14);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (15,'Hair Styling','Penataan rambut untuk acara atau aktivitas khusus sesuai inspirasi gaya pilihanmu.',100000,NULL,60,'/images/services/hair-styling-15.jpg',1,15);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (16,'Blow Dry','Pengeringan sekaligus penataan dengan blow dryer untuk hasil rambut yang lebih bervolume dan rapi.',80000,NULL,45,'/images/services/blow-dry-16.jpg',1,16);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (17,'Manicure','Perawatan kuku tangan meliputi merapikan bentuk kuku, membersihkan kutikula, dan merawat tangan.',100000,NULL,45,'/images/services/manicure-17.jpg',1,17);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (18,'Pedicure','Perawatan kuku kaki meliputi merapikan kuku, membersihkan area kuku, dan perawatan kaki yang menenangkan.',100000,NULL,45,'/images/services/pedicure-18.jpg',1,18);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (19,'Manicure Pedicure Paket','Paket perawatan lengkap untuk kuku tangan dan kaki agar tampak rapi dan terawat.',180000,NULL,75,'/images/services/manicure-pedicure-paket-19.jpg',1,19);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (20,'Nail Art Basic','Hiasan kuku dengan desain sederhana dan pilihan warna yang dapat disesuaikan.',150000,NULL,60,'/images/services/nail-art-basic-20.jpg',1,20);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (21,'Nail Art Premium','Desain nail art lebih detail dengan pilihan dekorasi dan sentuhan artistik sesuai inspirasimu.',300000,NULL,90,'/images/services/nail-art-premium-21.jpg',1,21);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (22,'Eyebrow Shaping','Merapikan bentuk alis agar terlihat seimbang dan sesuai dengan karakter wajah.',75000,NULL,30,'/images/services/eyebrow-shaping-22.jpg',1,22);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (23,'Eyelash Extension','Aplikasi extension bulu mata untuk memberi tampilan lebih lentik dan bervolume.',250000,NULL,120,'/images/services/eyelash-extension-23.jpg',1,23);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (24,'Facial Basic','Perawatan wajah dasar meliputi pembersihan dan perawatan kulit agar terasa lebih segar.',150000,NULL,60,'/images/services/facial-basic-24.jpg',1,24);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (25,'Facial Acne','Perawatan wajah yang difokuskan untuk kulit berjerawat dengan tahapan yang disesuaikan kondisi kulit.',250000,NULL,75,'/images/services/facial-acne-25.jpg',1,25);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (26,'Facial Brightening','Perawatan wajah untuk membantu kulit tampak lebih cerah dan terasa lebih segar.',300000,NULL,75,'/images/services/facial-brightening-26.jpg',1,26);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (27,'Totok Wajah','Pijatan lembut pada titik-titik wajah untuk membantu memberi sensasi rileks dan menyegarkan.',175000,NULL,45,'/images/services/totok-wajah-27.jpg',1,27);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (28,'Body Scrub','Eksfoliasi tubuh dengan scrub untuk membantu mengangkat sel kulit mati dan membuat kulit terasa lebih halus.',250000,NULL,60,'/images/services/body-scrub-28.jpg',1,28);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (29,'Body Spa','Rangkaian perawatan tubuh yang menenangkan untuk membantu tubuh terasa rileks dan kulit terawat.',350000,NULL,90,'/images/services/body-spa-29.jpg',1,29);
INSERT INTO `services` (`id`,`name`,`description`,`price`,`discount_price`,`minutes`,`image_path`,`active`,`sort_order`) VALUES (30,'Makeup Party','Riasan untuk pesta atau acara spesial, disesuaikan dengan tema acara dan gaya yang kamu inginkan.',500000,NULL,120,'/images/services/makeup-party-30.jpg',1,30);
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `bookings` (`id`,`user_id`,`service_id`,`booking_date`,`booking_time`,`status`,`created`,`price`) VALUES (1,3,21,'2026-12-02','10:00:00','selesai',1794230580048,300000);
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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (1,'2026-11-09 12:35:32.204',1,'LOGIN_BERHASIL','','::1','GENESIS','cce347b66436b3658e8cf01952404a9b26fc19c6e0c8085c770e52f6a28507e4');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (2,'2026-11-09 12:36:42.953',1,'LOGIN_BERHASIL','','::1','cce347b66436b3658e8cf01952404a9b26fc19c6e0c8085c770e52f6a28507e4','e832e3e973e63143ae0d3d33a527e1e81e3510c7ec9c2c638e98b49b6384e340');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (3,'2026-11-09 12:43:44.395',NULL,'CAPTCHA_GAGAL','','::1','e832e3e973e63143ae0d3d33a527e1e81e3510c7ec9c2c638e98b49b6384e340','441f75e2614c963593223b13ce14ee5710e6f2487e283347403c8a341e5d131f');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (4,'2026-11-09 12:44:27.624',2,'LOGIN_BERHASIL','','::1','441f75e2614c963593223b13ce14ee5710e6f2487e283347403c8a341e5d131f','2d0d4dcbd93641a91b2fb512d3f09003b95546dfe120d97c9c49b80fcfe833da');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (5,'2026-11-09 12:48:22.546',1,'LOGIN_BERHASIL','','::ffff:127.0.0.1','2d0d4dcbd93641a91b2fb512d3f09003b95546dfe120d97c9c49b80fcfe833da','04cb5e7f4d9d4e9513ac072003debf0656682f670cc33e57f271cbd5cf027344');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (6,'2026-11-09 12:48:22.612',1,'LOGOUT','','::ffff:127.0.0.1','04cb5e7f4d9d4e9513ac072003debf0656682f670cc33e57f271cbd5cf027344','75c59657b9329d70842f8cb1334c4d67847c4e7f99926fe0c5ebbbf930027d03');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (7,'2026-11-09 12:48:39.666',1,'LOGIN_BERHASIL','','::ffff:127.0.0.1','75c59657b9329d70842f8cb1334c4d67847c4e7f99926fe0c5ebbbf930027d03','a9b866cea45bf7ea2d8496835064feb9d72a8cb940a1e954c78bc9d1abd81c62');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (8,'2026-11-09 12:48:39.711',1,'LOGOUT','','::ffff:127.0.0.1','a9b866cea45bf7ea2d8496835064feb9d72a8cb940a1e954c78bc9d1abd81c62','1a30a0ac3d8df5d96ad1e3852f1a6cbb23fe0367a5fcd061be08ab60fcb36361');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (9,'2026-11-09 12:48:39.888',2,'LOGIN_BERHASIL','','::ffff:127.0.0.1','1a30a0ac3d8df5d96ad1e3852f1a6cbb23fe0367a5fcd061be08ab60fcb36361','d9ad3254734639e3dc68dc3bef30b1a40c01d17d3ac9672c9991325f3bb8cac2');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (10,'2026-11-09 12:48:39.915',2,'LOGOUT','','::ffff:127.0.0.1','d9ad3254734639e3dc68dc3bef30b1a40c01d17d3ac9672c9991325f3bb8cac2','c1ec3d1df75473854d4d64b6ba6c4dda88d7859773cf92c88eccf2162b4cfa93');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (11,'2026-11-09 12:49:08.692',NULL,'CAPTCHA_GAGAL','','::1','c1ec3d1df75473854d4d64b6ba6c4dda88d7859773cf92c88eccf2162b4cfa93','8c144d08066cb258aa9d79aa93d3523944bae50ae2826b5800a34ac773f70bbd');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (12,'2026-11-09 12:49:14.685',1,'LOGIN_BERHASIL','','::1','8c144d08066cb258aa9d79aa93d3523944bae50ae2826b5800a34ac773f70bbd','c83b0dac2f4559d476d3a84c8d4c030d49e3fef94014737bb16fe6355a5b6d9f');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (13,'2026-11-09 12:51:06.771',1,'LOGIN_BERHASIL','','::1','c83b0dac2f4559d476d3a84c8d4c030d49e3fef94014737bb16fe6355a5b6d9f','a37e44743c22fab4440df9a8f30bd41a8f775d9abc74d46fbe97f34fe03d15cb');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (14,'2026-11-09 12:52:58.863',1,'LOGOUT','','::1','a37e44743c22fab4440df9a8f30bd41a8f775d9abc74d46fbe97f34fe03d15cb','22e154a2cab57dba98d9e926443cbd4696d83047850a16ef5093948d85f3c366');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (15,'2026-11-09 12:53:21.785',2,'LOGIN_BERHASIL','','::1','22e154a2cab57dba98d9e926443cbd4696d83047850a16ef5093948d85f3c366','4bfc7cf5d5ac953a67080b6c39f115a7fb0d0fa94be38811498ea8f916054f0b');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (16,'2026-11-09 12:59:54.639',1,'LOGIN_BERHASIL','','::ffff:127.0.0.1','4bfc7cf5d5ac953a67080b6c39f115a7fb0d0fa94be38811498ea8f916054f0b','2b3342f9f05bce442a8029a7b2ba80deb4d90eba07a48603f43ba342f0d30684');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (17,'2026-11-09 12:59:54.862',2,'LOGIN_BERHASIL','','::ffff:127.0.0.1','2b3342f9f05bce442a8029a7b2ba80deb4d90eba07a48603f43ba342f0d30684','c0d0a0426b83fd1ee68d44f76a2bdd67c85fa956c302cb7d55276da698129382');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (18,'2026-11-09 12:59:54.915',1,'LOGOUT','','::ffff:127.0.0.1','c0d0a0426b83fd1ee68d44f76a2bdd67c85fa956c302cb7d55276da698129382','67c47a0d2ac701b1850c7d4809c81d73f332904aa84421f8a58f45358c6d38f4');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (19,'2026-11-09 12:59:54.978',2,'LOGOUT','','::ffff:127.0.0.1','67c47a0d2ac701b1850c7d4809c81d73f332904aa84421f8a58f45358c6d38f4','3af79d4280f3cda0bed049093ed3dba0d246ac7e8a50b4be4db8b419e418bfa6');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (20,'2026-11-09 13:00:12.556',2,'LOGOUT','','::1','3af79d4280f3cda0bed049093ed3dba0d246ac7e8a50b4be4db8b419e418bfa6','67ce887f0e7ece098c2bb501ef49172eaac6da8bba8c5a1b7ff868929688373d');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (21,'2026-11-09 13:00:44.501',1,'LOGIN_BERHASIL','','::1','67ce887f0e7ece098c2bb501ef49172eaac6da8bba8c5a1b7ff868929688373d','15a84972e88fe8bf4da7b5bde2e354efca2b4af3eee55c822c4c44dbe50fd6d9');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (22,'2026-11-09 13:01:31.518',1,'LOGIN_BERHASIL','','::1','15a84972e88fe8bf4da7b5bde2e354efca2b4af3eee55c822c4c44dbe50fd6d9','2968855bda5abafa7afcb78a7c8d089bfb6cf5204a9cfc85ee88c41f620269b9');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (23,'2026-11-09 13:02:03.823',1,'LOGIN_BERHASIL','','::1','2968855bda5abafa7afcb78a7c8d089bfb6cf5204a9cfc85ee88c41f620269b9','c570be0e83996803af9d25307787db37ce5752c8608648c5e5ea77c833e5328b');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (24,'2026-11-09 13:03:50.301',1,'LOGIN_BERHASIL','','::ffff:127.0.0.1','c570be0e83996803af9d25307787db37ce5752c8608648c5e5ea77c833e5328b','8bd170c87755971996949576419ee62c84166300cfefd57c1cb347ac0c4cab5d');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (25,'2026-11-09 13:03:50.349',1,'LOGOUT','','::ffff:127.0.0.1','8bd170c87755971996949576419ee62c84166300cfefd57c1cb347ac0c4cab5d','d2f25bfdabb294572b02e790f1a9fdcaaf7dbba77c58867b54887d36eb84d922');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (26,'2026-11-09 13:03:50.564',2,'LOGIN_BERHASIL','','::ffff:127.0.0.1','d2f25bfdabb294572b02e790f1a9fdcaaf7dbba77c58867b54887d36eb84d922','05aec7fb0de552f1ed6aab24e2ebb4e36744efdee9efd44d03b65d0be110a784');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (27,'2026-11-09 13:03:50.599',2,'LOGOUT','','::ffff:127.0.0.1','05aec7fb0de552f1ed6aab24e2ebb4e36744efdee9efd44d03b65d0be110a784','331f99cbadd9e0a6be38ccf8585c04a6c0c1c630bc99d01b1bffd80ba3922f1c');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (28,'2026-11-09 13:04:23.910',1,'LOGIN_BERHASIL','','::1','331f99cbadd9e0a6be38ccf8585c04a6c0c1c630bc99d01b1bffd80ba3922f1c','34cdaecd8328a1ef6d2e0380951e4079a9b0435d65da33dccc8f866843acf5c5');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (29,'2026-11-09 13:04:45.383',1,'LOGIN_BERHASIL','','::1','34cdaecd8328a1ef6d2e0380951e4079a9b0435d65da33dccc8f866843acf5c5','6951e902d77a1c0d896eae772cb7d8ca1936caa499b1a95efdb192f542cfb5f8');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (30,'2026-11-09 13:04:54.598',1,'LOGIN_BERHASIL','','::1','6951e902d77a1c0d896eae772cb7d8ca1936caa499b1a95efdb192f542cfb5f8','1204ff61a916e06d4b2059675e566af43576830f99d65bb71dc45fc1f572d12e');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (31,'2026-11-09 13:05:34.123',1,'LOGIN_BERHASIL','','::1','1204ff61a916e06d4b2059675e566af43576830f99d65bb71dc45fc1f572d12e','266476fe58738e651186493cb6aa8639ba358d80c0301c750f130a09c9ec7a04');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (32,'2026-11-09 13:09:01.618',1,'LOGIN_BERHASIL','','::1','266476fe58738e651186493cb6aa8639ba358d80c0301c750f130a09c9ec7a04','382b9085dc6a6d83e3390d4ee31f65a1c06c147e1e7d70f28a5d1815a68bc6cd');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (33,'2026-11-09 13:09:03.924',2,'LOGIN_BERHASIL','','::1','382b9085dc6a6d83e3390d4ee31f65a1c06c147e1e7d70f28a5d1815a68bc6cd','59ed8ff0f0650afaf410268386df28224f76e594bc3709f0d257febd0c53fc30');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (34,'2026-11-09 13:10:07.273',2,'LOGIN_BERHASIL','','::1','59ed8ff0f0650afaf410268386df28224f76e594bc3709f0d257febd0c53fc30','34b5adfef05bca6ec597db79bd5c244b6e6c4cb24825747cebdc39c2fbd62197');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (35,'2026-11-09 13:12:47.595',1,'LOGIN_BERHASIL','','::1','34b5adfef05bca6ec597db79bd5c244b6e6c4cb24825747cebdc39c2fbd62197','3703a994816f4f27167b478e13f1aaffb68ec22a1191f1a8012e97f745ee2e1b');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (36,'2026-11-09 13:13:39.490',2,'LOGIN_BERHASIL','','::1','3703a994816f4f27167b478e13f1aaffb68ec22a1191f1a8012e97f745ee2e1b','0572dd5e30c1382308a839adf6d742dabafd81a4ea32a828121bb90f5936cb82');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (37,'2026-11-09 13:21:06.326',3,'REGISTRASI','customer@teletabis.com','::1','0572dd5e30c1382308a839adf6d742dabafd81a4ea32a828121bb90f5936cb82','c2ec7d8947f79700b11cc4a78dd357bcd5ca404f00e9e315a2cb25c04208670b');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (38,'2026-11-09 13:21:22.350',3,'LOGIN_BERHASIL','','::1','c2ec7d8947f79700b11cc4a78dd357bcd5ca404f00e9e315a2cb25c04208670b','369722e93dab4284ecad84376da75ba7720b3352a8687d24418a766fb4713988');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (39,'2026-11-09 13:23:00.069',3,'BOOKING_DIBUAT','#1','::1','369722e93dab4284ecad84376da75ba7720b3352a8687d24418a766fb4713988','86f643646f7b5bb29d2c6de6922061cc2b0cc0642b9d934ce07870685b5d129f');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (40,'2026-11-09 13:26:53.382',2,'BOOKING_STATUS','#1 -> selesai','::1','86f643646f7b5bb29d2c6de6922061cc2b0cc0642b9d934ce07870685b5d129f','de127566db6cb211e9f8116b691bbedeeb4f838dc0876e77efce0745a84ba517');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (41,'2026-11-12 03:47:10.334',1,'LOGIN_BERHASIL','','::1','de127566db6cb211e9f8116b691bbedeeb4f838dc0876e77efce0745a84ba517','533b75fc2fdcbc3935dd6146600f659380e0b29d565198e20c7040237a867c0f');
INSERT INTO `audit_log` (`id`,`ts`,`user_id`,`action`,`detail`,`ip`,`prev_hash`,`hash`) VALUES (42,'2026-11-12 03:50:43.979',2,'LOGIN_BERHASIL','','::1','533b75fc2fdcbc3935dd6146600f659380e0b29d565198e20c7040237a867c0f','1bab10bb2bedd0029ffa13240d6385e9043e11afd08c87db44ed666a2954d796');
SET FOREIGN_KEY_CHECKS=1;
