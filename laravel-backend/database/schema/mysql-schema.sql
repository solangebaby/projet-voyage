/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `agencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agencies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `destination_id` bigint(20) unsigned NOT NULL,
  `agency_name` varchar(255) NOT NULL,
  `neighborhood` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `is_main_station` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `agencies_destination_id_foreign` (`destination_id`),
  KEY `agencies_user_id_foreign` (`user_id`),
  CONSTRAINT `agencies_destination_id_foreign` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `agencies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `buses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `buses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `bus_name` varchar(255) NOT NULL,
  `internal_number` varchar(255) DEFAULT NULL COMMENT 'Numéro interne',
  `registration` varchar(255) DEFAULT NULL COMMENT 'Immatriculation',
  `brand` varchar(255) DEFAULT NULL COMMENT 'Marque',
  `year` int(11) DEFAULT NULL COMMENT 'Année',
  `matricule` varchar(255) NOT NULL,
  `type` enum('standard','vip') NOT NULL DEFAULT 'standard',
  `state` enum('actif','en_maintenance','hors_service') NOT NULL DEFAULT 'actif',
  `maintenance_note` text DEFAULT NULL COMMENT 'Note de maintenance',
  `total_seats` int(11) NOT NULL,
  `seat_configuration` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Configuration des sièges' CHECK (json_valid(`seat_configuration`)),
  `price` decimal(10,2) NOT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `buses_matricule_unique` (`matricule`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `trip_id` bigint(20) unsigned DEFAULT NULL,
  `content` text NOT NULL,
  `rating` int(11) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `comments_trip_id_foreign` (`trip_id`),
  KEY `comments_user_id_foreign` (`user_id`),
  CONSTRAINT `comments_trip_id_foreign` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `destinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `destinations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `city_name` varchar(255) NOT NULL,
  `region` varchar(255) DEFAULT NULL,
  `country` varchar(255) NOT NULL DEFAULT 'Cameroun',
  `status` enum('actif','inactif') NOT NULL DEFAULT 'actif',
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `disputes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `disputes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `agency_id` bigint(20) unsigned DEFAULT NULL,
  `reservation_id` bigint(20) unsigned DEFAULT NULL,
  `type` enum('cancellation','delay','overcharge','quality','lost_luggage','other') NOT NULL DEFAULT 'other',
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','in_review','resolved','closed','rejected') NOT NULL DEFAULT 'open',
  `resolution` text DEFAULT NULL,
  `resolved_by` bigint(20) unsigned DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `disputes_user_id_foreign` (`user_id`),
  KEY `disputes_agency_id_foreign` (`agency_id`),
  KEY `disputes_reservation_id_foreign` (`reservation_id`),
  KEY `disputes_resolved_by_foreign` (`resolved_by`),
  CONSTRAINT `disputes_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `disputes_reservation_id_foreign` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `disputes_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `disputes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `reservation_id` bigint(20) unsigned NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'XAF',
  `method` enum('MTN','Orange','Bancaire') NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `completed_at` timestamp NULL DEFAULT NULL,
  `refunded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_transaction_id_unique` (`transaction_id`),
  UNIQUE KEY `payments_reference_unique` (`reference`),
  KEY `payments_reservation_id_foreign` (`reservation_id`),
  CONSTRAINT `payments_reservation_id_foreign` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promotions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `agency_id` bigint(20) unsigned DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `discount_type` enum('percent','fixed') NOT NULL DEFAULT 'percent',
  `discount_value` decimal(10,2) NOT NULL,
  `min_amount` decimal(10,2) DEFAULT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `max_uses` int(10) unsigned DEFAULT NULL,
  `uses_count` int(10) unsigned NOT NULL DEFAULT 0,
  `valid_from` timestamp NULL DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `promotions_code_unique` (`code`),
  KEY `promotions_agency_id_foreign` (`agency_id`),
  CONSTRAINT `promotions_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reservations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `trip_id` bigint(20) unsigned NOT NULL,
  `departure_agency_id` bigint(20) unsigned DEFAULT NULL,
  `arrival_agency_id` bigint(20) unsigned DEFAULT NULL,
  `selected_seat` varchar(255) NOT NULL,
  `ticket_type` enum('standard','vip') NOT NULL DEFAULT 'standard',
  `passenger_first_name` varchar(255) DEFAULT NULL,
  `passenger_last_name` varchar(255) DEFAULT NULL,
  `passenger_name` varchar(255) DEFAULT NULL,
  `passenger_email` varchar(255) DEFAULT NULL,
  `passenger_gender` enum('M','F') DEFAULT NULL,
  `passenger_cni` varchar(20) DEFAULT NULL,
  `passenger_nationality` varchar(255) DEFAULT NULL,
  `passenger_phone` varchar(255) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','reserved_at_counter','expired') NOT NULL DEFAULT 'pending',
  `expires_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reservations_user_id_foreign` (`user_id`),
  KEY `reservations_departure_agency_id_foreign` (`departure_agency_id`),
  KEY `reservations_arrival_agency_id_foreign` (`arrival_agency_id`),
  KEY `idx_trip_seat` (`trip_id`,`selected_seat`),
  CONSTRAINT `reservations_arrival_agency_id_foreign` FOREIGN KEY (`arrival_agency_id`) REFERENCES `agencies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservations_departure_agency_id_foreign` FOREIGN KEY (`departure_agency_id`) REFERENCES `agencies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reservations_trip_id_foreign` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tarifs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tarifs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `departure_id` bigint(20) unsigned NOT NULL,
  `destination_id` bigint(20) unsigned NOT NULL,
  `ticket_type` enum('standard','vip') NOT NULL DEFAULT 'standard',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `duration_hours` decimal(5,2) DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `vip_price` decimal(10,2) DEFAULT NULL,
  `economy_price` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'XAF',
  `name` varchar(255) DEFAULT NULL,
  `price_student` decimal(10,2) DEFAULT NULL,
  `price_child` decimal(10,2) DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `valid_days` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`valid_days`)),
  `time_period` enum('all','day','night') NOT NULL DEFAULT 'all',
  `group_discount_percentage` decimal(5,2) DEFAULT NULL,
  `group_discount_min_passengers` int(11) DEFAULT NULL,
  `status` enum('actif','inactif') NOT NULL DEFAULT 'actif',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tarifs_destination_id_foreign` (`destination_id`),
  KEY `tarifs_departure_id_destination_id_status_index` (`departure_id`,`destination_id`,`status`),
  CONSTRAINT `tarifs_departure_id_foreign` FOREIGN KEY (`departure_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tarifs_destination_id_foreign` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `reservation_id` bigint(20) unsigned NOT NULL,
  `ticket_number` varchar(255) NOT NULL,
  `ticket_type` enum('standard','vip') NOT NULL DEFAULT 'standard',
  `qr_code` text DEFAULT NULL,
  `downloaded_at` timestamp NULL DEFAULT NULL,
  `status` enum('valid','used','cancelled') NOT NULL DEFAULT 'valid',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tickets_ticket_number_unique` (`ticket_number`),
  KEY `tickets_reservation_id_foreign` (`reservation_id`),
  CONSTRAINT `tickets_reservation_id_foreign` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trips` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `agency_id` bigint(20) unsigned DEFAULT NULL,
  `bus_id` bigint(20) unsigned NOT NULL,
  `departure_id` bigint(20) unsigned NOT NULL,
  `departure_agency_id` bigint(20) unsigned DEFAULT NULL,
  `destination_id` bigint(20) unsigned NOT NULL,
  `arrival_agency_id` bigint(20) unsigned DEFAULT NULL,
  `tarif_id` bigint(20) unsigned DEFAULT NULL,
  `departure_date` date NOT NULL,
  `departure_time` time NOT NULL,
  `arrival_date` date DEFAULT NULL,
  `arrival_time` time NOT NULL,
  `distance` decimal(8,2) DEFAULT NULL COMMENT 'Distance en km',
  `duration` varchar(255) DEFAULT NULL COMMENT 'Durée estimée HH:MM',
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `occupied_seats` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`occupied_seats`)),
  `distance_km` int(11) DEFAULT NULL,
  `status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
  `validation_status` enum('draft','pending_validation','active','rejected','completed','cancelled') NOT NULL DEFAULT 'draft',
  `rejection_reason` text DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `validated_at` timestamp NULL DEFAULT NULL,
  `validated_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `trips_bus_id_foreign` (`bus_id`),
  KEY `trips_departure_id_foreign` (`departure_id`),
  KEY `trips_destination_id_foreign` (`destination_id`),
  KEY `trips_tarif_id_foreign` (`tarif_id`),
  KEY `trips_departure_agency_id_foreign` (`departure_agency_id`),
  KEY `trips_arrival_agency_id_foreign` (`arrival_agency_id`),
  KEY `trips_agency_id_foreign` (`agency_id`),
  CONSTRAINT `trips_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `trips_arrival_agency_id_foreign` FOREIGN KEY (`arrival_agency_id`) REFERENCES `agencies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `trips_bus_id_foreign` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trips_departure_agency_id_foreign` FOREIGN KEY (`departure_agency_id`) REFERENCES `agencies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `trips_departure_id_foreign` FOREIGN KEY (`departure_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trips_destination_id_foreign` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `trips_tarif_id_foreign` FOREIGN KEY (`tarif_id`) REFERENCES `tarifs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `cni_number` varchar(255) DEFAULT NULL,
  `profession` varchar(255) DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `marital_status` enum('Single','Married','Divorced','Widowed') DEFAULT NULL,
  `civility` enum('Mr','Mrs','Miss') DEFAULT NULL,
  `role` enum('admin','voyageur','agence') NOT NULL DEFAULT 'voyageur',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1,'2014_10_12_000000_create_users_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2,'2014_10_12_100000_create_password_reset_tokens_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3,'2019_08_19_000000_create_failed_jobs_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (4,'2019_12_14_000001_create_personal_access_tokens_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5,'2026_01_18_125718_create_destinations_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6,'2026_01_18_125719_create_buses_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7,'2026_01_18_125719_create_trips_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8,'2026_01_18_125720_create_reservations_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9,'2026_01_18_125721_create_payments_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10,'2026_01_18_125721_create_tickets_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11,'2026_01_18_125722_create_comments_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (12,'2026_01_20_add_bus_management_fields',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13,'2026_01_20_add_routes_management_fields',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14,'2026_01_20_create_cities_management_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15,'2026_02_02_add_passenger_fields_to_reservations',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (16,'2026_02_02_create_tarifs_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (17,'2026_02_05_add_gender_and_cni_to_reservations',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (18,'2026_02_06_add_agencies_to_destinations',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (19,'2026_02_06_add_nationality_to_reservations',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (20,'2026_02_06_make_comments_guest_friendly',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (21,'2026_02_12_add_downloaded_at_to_tickets',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (22,'2026_02_13_add_ticket_type_to_reservations',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (23,'2026_02_17_023033_add_ticket_type_to_tarifs_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (24,'2026_03_01_000001_add_user_id_to_agencies_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (25,'2026_03_01_000002_add_agence_role_to_users',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (26,'2026_03_01_000003_add_counter_status_to_reservations',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (27,'2026_03_01_000010_add_agency_id_and_validation_to_trips',2);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (28,'2026_03_02_000001_create_disputes_table',2);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (29,'2026_03_02_000002_create_promotions_table',2);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (30,'2026_03_02_100000_add_unique_seat_reservation_index',3);
