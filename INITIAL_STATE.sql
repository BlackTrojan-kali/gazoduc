-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2025 at 02:49 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gazoduc`
--

-- --------------------------------------------------------

--
-- Table structure for table `agencies`
--

CREATE TABLE `agencies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `entreprise_id` bigint(20) UNSIGNED NOT NULL,
  `licence_id` bigint(20) UNSIGNED NOT NULL,
  `region_id` bigint(20) UNSIGNED NOT NULL,
  `city_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `agencies`
--

INSERT INTO `agencies` (`id`, `entreprise_id`, `licence_id`, `region_id`, `city_id`, `name`, `address`, `archived`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1, 'central', NULL, 0, '2025-11-13 11:57:01', '2025-11-13 11:57:01'),
(2, 1, 1, 2, 2, 'site_douala', NULL, 0, '2025-11-13 11:57:36', '2025-11-13 11:57:36'),
(3, 1, 1, 3, 3, 'site_garoua', NULL, 0, '2025-11-13 11:58:04', '2025-11-13 11:58:04');

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `unit` varchar(255) NOT NULL,
  `article_id` bigint(20) UNSIGNED DEFAULT NULL,
  `entreprise_id` bigint(20) UNSIGNED NOT NULL,
  `weight_per_unit` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`id`, `code`, `name`, `type`, `unit`, `article_id`, `entreprise_id`, `weight_per_unit`, `created_at`, `updated_at`) VALUES
(1, '12KGV', '12KGVIDE', 'produit', 'kg', NULL, 1, '12.5', '2025-11-13 12:14:11', '2025-11-13 12:14:11'),
(2, '12KGP', '12KGPLEIN', 'produit_fini', 'kg', 1, 1, '12.5', '2025-11-13 12:14:57', '2025-11-13 12:14:57'),
(3, '50KGV', '50KGVIDE', 'produit', 'kg', NULL, 1, '50', '2025-11-13 12:15:18', '2025-11-13 12:15:18'),
(4, '50KGP', '50KGPLEIN', 'produit_fini', 'kg', 3, 1, '50', '2025-11-13 12:15:44', '2025-11-13 12:44:43'),
(5, 'VGAZ', 'GAZ VRAC', 'matiere_premiere', 'kg', NULL, 1, NULL, '2025-11-13 12:17:59', '2025-11-13 12:17:59');

-- --------------------------------------------------------

--
-- Table structure for table `article_bordereau_route`
--

CREATE TABLE `article_bordereau_route` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `bordereau_route_id` bigint(20) UNSIGNED NOT NULL,
  `article_id` bigint(20) UNSIGNED NOT NULL,
  `qty` decimal(14,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `article_category_prices`
--

CREATE TABLE `article_category_prices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `article_id` bigint(20) UNSIGNED NOT NULL,
  `client_category_id` bigint(20) UNSIGNED NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `consigne_price` decimal(8,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `article_category_prices`
--

INSERT INTO `article_category_prices` (`id`, `article_id`, `client_category_id`, `agency_id`, `price`, `consigne_price`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 3, 5500.00, 11000.00, '2025-11-13 12:38:26', '2025-11-13 12:38:26'),
(2, 2, 2, 3, 6000.00, 12000.00, '2025-11-13 12:38:56', '2025-11-13 12:38:56'),
(3, 4, 2, 3, 12000.00, 20000.00, '2025-11-13 12:40:02', '2025-11-13 12:40:02'),
(4, 4, 1, 3, 11000.00, 18000.00, '2025-11-13 12:40:19', '2025-11-13 12:40:19'),
(5, 2, 2, 2, 6100.00, 12600.00, '2025-11-13 12:40:38', '2025-11-13 12:40:38'),
(6, 2, 1, 2, 5600.00, 11500.00, '2025-11-13 12:41:13', '2025-11-13 12:41:13'),
(7, 4, 2, 2, 12300.00, 21000.00, '2025-11-13 12:42:50', '2025-11-13 12:42:50'),
(8, 4, 1, 2, 11100.00, 18200.00, '2025-11-13 12:45:30', '2025-11-13 12:45:30');

-- --------------------------------------------------------

--
-- Table structure for table `banks`
--

CREATE TABLE `banks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `account_number` varchar(255) DEFAULT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `banks`
--

INSERT INTO `banks` (`id`, `name`, `account_number`, `archived`, `created_at`, `updated_at`) VALUES
(1, 'CCA', '12345678', 0, '2025-11-13 12:22:09', '2025-11-13 12:28:23'),
(2, 'AFB', '12345678', 0, '2025-11-13 12:22:24', '2025-11-13 12:22:24');

-- --------------------------------------------------------

--
-- Table structure for table `bordereau_routes`
--

CREATE TABLE `bordereau_routes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `vehicule_id` bigint(20) UNSIGNED NOT NULL,
  `chauffeur_id` bigint(20) UNSIGNED NOT NULL,
  `co_chauffeur_id` bigint(20) UNSIGNED DEFAULT NULL,
  `departure_location_id` bigint(20) UNSIGNED NOT NULL,
  `arrival_location_id` bigint(20) UNSIGNED NOT NULL,
  `arrival_date` datetime DEFAULT NULL,
  `departure_date` datetime NOT NULL,
  `status` varchar(255) NOT NULL,
  `types` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chauffeurs`
--

CREATE TABLE `chauffeurs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `licence_number` varchar(255) NOT NULL,
  `licence_expiry` date DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `citernes`
--

CREATE TABLE `citernes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `product_type` varchar(255) NOT NULL,
  `capacity_liter` decimal(8,2) DEFAULT NULL,
  `capacity_kg` decimal(8,2) DEFAULT NULL,
  `current_product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `agency_id` bigint(20) UNSIGNED DEFAULT NULL,
  `entreprise_id` bigint(20) UNSIGNED DEFAULT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `citernes`
--

INSERT INTO `citernes` (`id`, `name`, `type`, `product_type`, `capacity_liter`, `capacity_kg`, `current_product_id`, `agency_id`, `entreprise_id`, `archived`, `created_at`, `updated_at`) VALUES
(1, 'citerne_fixe_1', 'fixed', 'gaz', 32000.00, 32000.00, 5, 1, 1, 0, '2025-11-13 12:19:08', '2025-11-13 12:19:08'),
(2, 'citerne_fixe_2', 'fixed', 'gaz', 32000.00, 32000.00, 5, 1, 1, 0, '2025-11-13 12:19:39', '2025-11-13 12:19:39');

-- --------------------------------------------------------

--
-- Table structure for table `citerne_readings`
--

CREATE TABLE `citerne_readings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `citerne_id` bigint(20) UNSIGNED NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `stock_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `theorical_quantity` decimal(8,2) NOT NULL,
  `measured_quantity` decimal(8,2) NOT NULL,
  `difference` decimal(8,2) NOT NULL,
  `reading_date` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `region_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cities`
--

INSERT INTO `cities` (`id`, `region_id`, `name`, `created_at`, `updated_at`) VALUES
(1, 1, 'yaounde', '2025-11-13 11:55:47', '2025-11-13 11:55:47'),
(2, 2, 'douala', '2025-11-13 11:55:59', '2025-11-13 11:55:59'),
(3, 3, 'garoua', '2025-11-13 11:56:13', '2025-11-13 11:56:13');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_category_id` bigint(20) UNSIGNED NOT NULL,
  `client_type` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `NUI` varchar(255) DEFAULT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `client_category_id`, `client_type`, `name`, `phone_number`, `email_address`, `address`, `NUI`, `archived`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'entreprise', 'SUPER GAZ', '12345678', 'SUPERGAZ@gmail.com', 'TOTAL MELEN', 'teste1234', 0, '2025-11-13 12:46:42', '2025-11-13 12:46:42', NULL),
(2, 2, 'entreprise', 'DETAIL GAZ', NULL, NULL, NULL, NULL, 0, '2025-11-13 12:48:13', '2025-11-13 12:48:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `client_categories`
--

CREATE TABLE `client_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `client_categories`
--

INSERT INTO `client_categories` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Grossistes', 'grossistes', '2025-11-13 12:37:09', '2025-11-13 12:37:09'),
(2, 'client divers', 'client divers', '2025-11-13 12:37:28', '2025-11-13 12:37:28');

-- --------------------------------------------------------

--
-- Table structure for table `closures`
--

CREATE TABLE `closures` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `starting_date` date NOT NULL,
  `ending_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `depotages`
--

CREATE TABLE `depotages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `citerne_mobile_id` bigint(20) UNSIGNED NOT NULL,
  `citerne_fixe_id` bigint(20) UNSIGNED NOT NULL,
  `article_id` bigint(20) UNSIGNED DEFAULT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `recorded_by_user_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(8,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `entreprises`
--

CREATE TABLE `entreprises` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `logo_path` varchar(255) DEFAULT NULL,
  `tax_number` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `entreprises`
--

INSERT INTO `entreprises` (`id`, `code`, `name`, `logo_path`, `tax_number`, `phone_number`, `email_address`, `address`, `archived`, `created_at`, `updated_at`) VALUES
(1, 'teste_gaz', 'teste_gaz', '1763038439.jpg', 'teste_gaz', '12345678', 'teste_gaz@gmail.com', NULL, 0, '2025-11-13 11:53:59', '2025-11-13 11:53:59');

-- --------------------------------------------------------

--
-- Table structure for table `factures`
--

CREATE TABLE `factures` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `total_amount` decimal(14,2) NOT NULL,
  `licence` varchar(255) DEFAULT NULL COMMENT 'carburant ou gaz',
  `currency` varchar(255) NOT NULL,
  `invoice_type` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `facture_items`
--

CREATE TABLE `facture_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `facture_id` bigint(20) UNSIGNED NOT NULL,
  `article_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(14,2) NOT NULL,
  `unit_price` decimal(14,2) NOT NULL,
  `subtotal` decimal(14,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `facture_payments`
--

CREATE TABLE `facture_payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` bigint(20) UNSIGNED NOT NULL,
  `facture_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(14,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fuel_sales`
--

CREATE TABLE `fuel_sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `article_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `total_price` decimal(14,2) NOT NULL,
  `sub_total` decimal(14,2) NOT NULL,
  `unitPrice` decimal(14,2) NOT NULL,
  `quantity` decimal(14,2) NOT NULL,
  `status` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `pompe_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fuel_sale_citernes`
--

CREATE TABLE `fuel_sale_citernes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `fuel_sale_id` bigint(20) UNSIGNED NOT NULL,
  `citerne_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `licences`
--

CREATE TABLE `licences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `licences`
--

INSERT INTO `licences` (`id`, `name`, `type`, `description`, `created_at`, `updated_at`) VALUES
(1, 'gaz', 'Annuel', 'Uniquement pour le gaz', '2025-11-13 11:41:12', '2025-11-13 11:41:12'),
(2, 'gaz et petrol', 'Annuel', 'pour le gaz et le carburant', '2025-11-13 11:41:12', '2025-11-13 11:41:12'),
(3, 'petrol', 'Annuel', 'Uniquement pour le petrol', '2025-11-13 11:41:12', '2025-11-13 11:41:12');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_07_06_151309_create_roles_table', 1),
(5, '2025_07_06_151603_add_roleid_to_users_table', 1),
(6, '2025_07_06_152039_create_regions_table', 1),
(7, '2025_07_06_152200_create_cities_table', 1),
(8, '2025_07_06_152906_create_entreprises_table', 1),
(9, '2025_07_06_153626_create_licences_table', 1),
(10, '2025_07_06_154450_create_agencies_table', 1),
(11, '2025_07_06_155328_create_subscriptions_table', 1),
(12, '2025_07_06_160205_add_agencyid_to_users_table', 1),
(13, '2025_07_06_160534_create_subscribe_histories_table', 1),
(14, '2025_07_06_161129_create_articles_table', 1),
(15, '2025_07_06_161804_create_stocks_table', 1),
(16, '2025_07_06_162603_create_mouvements_table', 1),
(17, '2025_07_06_164943_create_citernes_table', 1),
(18, '2025_07_06_170654_create_citerne_readings_table', 1),
(19, '2025_07_06_170658_create_vehicules_table', 1),
(20, '2025_07_06_172406_create_receptions_table', 1),
(21, '2025_07_06_180707_create_depotages_table', 1),
(22, '2025_07_06_181633_create_chauffeurs_table', 1),
(23, '2025_07_06_182421_create_bordereau_routes_table', 1),
(24, '2025_07_06_183739_create_production_histories_table', 1),
(25, '2025_07_06_184734_create_client_categories_table', 1),
(26, '2025_07_06_184854_create_clients_table', 1),
(27, '2025_07_06_185455_create_article_category_prices_table', 1),
(28, '2025_07_06_185940_create_factures_table', 1),
(29, '2025_07_06_191322_create_facture_items_table', 1),
(30, '2025_07_06_192437_create_banks_table', 1),
(31, '2025_07_06_195559_create_payments_table', 1),
(32, '2025_07_06_200529_create_facture_payments_table', 1),
(33, '2025_07_06_201937_add_related_document_id_to_mouvements_table', 1),
(34, '2025_07_06_233226_add_entrepriseid_to_users_table', 1),
(35, '2025_07_10_154140_add_citerne_id_to_stocks_table', 1),
(36, '2025_08_10_121859_create_article_bordereau_route_table', 1),
(37, '2025_08_21_164903_create_notifications_table', 1),
(38, '2025_09_28_175233_add_id_facture_to_mouvements_table', 1),
(39, '2025_09_29_082413_create_fuel_sales_table', 1),
(40, '2025_11_03_090211_create_closures_table', 1),
(41, '2025_11_11_093719_create_pompes_table', 1),
(42, '2025_11_11_095600_create_pompe_citernes_table', 1),
(43, '2025_11_12_113611_add_pompe_id_to_fuel_sales_table', 1),
(44, '2025_11_12_220724_create_fuel_sale_citernes_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `mouvements`
--

CREATE TABLE `mouvements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `article_id` bigint(20) UNSIGNED NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `entreprise_id` bigint(20) UNSIGNED NOT NULL,
  `recorded_by_user_id` bigint(20) UNSIGNED NOT NULL,
  `movement_type` varchar(255) NOT NULL,
  `quantity` decimal(8,2) NOT NULL,
  `stock` decimal(8,2) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `source_location` varchar(255) DEFAULT NULL,
  `destination_location` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `related_document_type` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `related_document_id` bigint(20) UNSIGNED DEFAULT NULL,
  `facture_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES
('04029884-8fe0-4372-bce4-11258ff1dc07', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('140e64d1-7b9d-43a0-91b9-4a2c689e2fb4', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('19ce1bbe-603b-465e-988d-7cac30401c7b', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('1fae0c28-f2cd-458f-b056-fc9fa5ea54c0', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 6, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('231d99c3-9855-4515-bf23-fbb300dfa30c', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 5, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('26306cbc-9280-4ac1-882f-cf24fb23ed36', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:35', '2025-11-13 12:16:35'),
('2adbf9dc-6c53-400f-aa7a-827f5dba192b', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('2cf40e0d-c91b-4a3f-bf17-20cc13d50c28', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('2e4078c9-763c-4a20-86b9-0faeff1dbc99', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('30d60081-acb6-4f15-a5bc-87fdaf3d7d2f', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('37ffd2b7-c27b-4629-82f0-4e582cdbcbc7', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 6, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('3e2e3b8a-9412-4504-b65b-46b80fab5b73', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('4234e309-a2f5-4270-9b6a-8400eef40760', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('43fb674c-16af-4628-bb13-d8e3d52e48ff', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('444d1d2b-5a73-4a7e-a383-f636707d065f', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('4622e2b1-0ebf-48ba-81af-51dd01426d9a', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 5, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('470c00cf-56fb-4fcc-8b8e-1d4390dc196e', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('471eea0d-5afd-413e-ba56-2232ce16ddad', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 7, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('49d8cda6-83c1-4f48-8f16-888a13b38afe', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 8, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('50d2b6be-83c6-4f57-810a-e179b0ac3cd5', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('546eae16-acaa-4dc9-9884-1d5fccd0bd51', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 10, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('5b423ca6-56e4-4b99-be45-fb124b0d573f', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('5bb2503b-fb15-48d0-8858-447c40ea50c5', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'GAZ VRAC\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":5,\"article_name\":\"GAZ VRAC\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:20:30', '2025-11-13 12:20:30'),
('5d2b1989-a165-4935-bb1f-ac68f2dea115', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 7, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('6960164a-5a9f-493b-90ee-8a3ba7cb062a', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('6aca473c-c990-42f3-a732-ca3d9a9cde7f', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('7237ef58-db3b-4014-9450-7e3b85247338', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('7321c430-8cfc-4489-92d1-c5ca444f55df', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('7474c132-aea9-4158-8538-37e1f5278574', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('7abd5604-4e27-45cb-a200-bc6ac8aa903e', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 5, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('7c1cfddc-50a8-411b-940c-6d9138dc904d', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('83accf5c-6a7e-4655-a51b-c8fdedeac471', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 9, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('851978f8-ab7a-4760-bac8-e5a3fdd8f3e2', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('8579dced-5f91-4fd9-a9d2-caa475943d38', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('87f5c3e4-273e-405d-af93-e9d8a7115e83', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 9, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:35', '2025-11-13 12:16:35'),
('88cf7965-f1e8-4f3b-8d04-ee55be734d71', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 7, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('8d0598de-ec3c-4539-a596-c80b1b2149ea', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('8d12c223-4723-4a83-9733-f9b0e457653b', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 8, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('8d3c536b-6120-4e11-bfee-f3e4af815ac4', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('91b2cff1-61ef-4106-974b-ca16b1b8e78e', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('939fa6b5-39ef-4063-b006-f9b379e1606b', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('94767147-0983-40c0-937e-27b7d792fbf9', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('95ee4c2f-58a6-4303-a8f5-14e06d42a186', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'GAZ VRAC\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":5,\"article_name\":\"GAZ VRAC\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:20:30', '2025-11-13 12:20:30'),
('9fb255c7-f8ad-407d-9acf-6bf03b86eb26', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('a29f06e0-85c3-4c2d-bc74-8f97cabff50f', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'GAZ VRAC\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":5,\"article_name\":\"GAZ VRAC\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:20:41', '2025-11-13 12:20:41'),
('a2c490bc-41f6-4018-ba99-42e8d84fdbce', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('a36eb937-d91f-480c-90df-084fec5f7df1', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('a4843fa2-2bb7-45db-9813-502bed2daec9', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('a6e59138-f4f6-4d23-a34b-5c504e29b8df', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('ae0fc2db-f60b-4703-98fb-e2488ab50a86', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('ae4255b4-b82e-4975-86b2-2065cdd83713', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 10, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('ae581d4f-1ed8-480f-8f3d-8f4213918735', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:35', '2025-11-13 12:16:35'),
('b4eec66f-5cdc-4163-92c2-69818142345c', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('b50f5f03-297d-4402-aa5a-f8b9a72f43e6', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 7, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('badaf654-0810-43ea-b8f9-d59c7a4db6ba', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('be3d42d5-e31c-48e1-ac05-3b8e987b2450', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 10, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('c33e2a77-84a6-4504-981d-1b3c9e7302f2', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('c6691c1d-7722-4884-a962-01e5f632bb78', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('c9dff57d-8f8e-4f24-96dd-04c915d022c0', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 5, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('ca506513-cc54-469d-89db-71057fdb6443', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 8, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('cf1f3d5b-84e8-4c13-a442-d93bd96e3ce6', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 6, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('cf89473c-9e7a-4f09-9134-54893c863920', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 4, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('d2213c76-2b04-465f-b111-80ceb62dc637', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'GAZ VRAC\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":5,\"article_name\":\"GAZ VRAC\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:20:41', '2025-11-13 12:20:41'),
('d43ab82c-d25e-4459-b730-58bcc42307ec', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('d65068a7-a07c-4bab-9697-3f4cb902e690', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('dbf4a402-2293-4af1-8eb2-4572e222c48b', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('e10efe03-cd97-49c5-96d9-21fe1617ec8d', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 10, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('e387eb56-2603-4c14-8613-98c2edb5c436', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('e52421c4-ebe6-4866-a181-71ee90861bed', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGP\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"4\",\"article_name\":\"50KGP\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31'),
('ed6888b3-a9a4-4750-9766-6ff858f7dc26', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('eebf8987-197c-42fe-af39-7b12512702be', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'50KGVIDE\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"3\",\"article_name\":\"50KGVIDE\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34'),
('f90cc814-5219-4e7c-bd0d-f6d0e6c03a12', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 6, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50'),
('fc4c0892-b65a-454a-92ec-5cf0f2e9e90c', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 3, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'site_douala\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":2,\"agency_name\":\"site_douala\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('fe12c93a-5737-49c3-a887-ea68fd092fe3', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 8, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'central\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":1,\"agency_name\":\"central\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('fe50e773-a0c0-4266-a43f-25a54ed56ea1', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 9, '{\"message\":\"Le stock de l\'article \'12KGPLEIN\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"2\",\"article_name\":\"12KGPLEIN\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36'),
('ff817d6a-6ddf-4ce3-8f9d-4e2505a954fb', 'App\\Notifications\\StockLevelNotification', 'App\\Models\\User', 9, '{\"message\":\"Le stock de l\'article \'12KGVIDE\' de l\'agence \'site_garoua\' est tomb\\u00e9 \\u00e0 0.\",\"article_id\":\"1\",\"article_name\":\"12KGVIDE\",\"agency_id\":3,\"agency_name\":\"site_garoua\",\"current_quantity\":0}', NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50');

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `bank_id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `amout` decimal(14,2) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `amout_notes` decimal(14,2) DEFAULT NULL,
  `bordereau` varchar(255) DEFAULT NULL,
  `is_fuel` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pompes`
--

CREATE TABLE `pompes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pompe_citernes`
--

CREATE TABLE `pompe_citernes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pompe_id` bigint(20) UNSIGNED NOT NULL,
  `citerne_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_histories`
--

CREATE TABLE `production_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `source_citerne_id` bigint(20) UNSIGNED NOT NULL,
  `article_id` bigint(20) UNSIGNED NOT NULL,
  `quantity_produced` decimal(8,2) NOT NULL,
  `total_weight_produced` decimal(8,2) DEFAULT NULL,
  `production_movement_id` bigint(20) UNSIGNED DEFAULT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `recorded_by_user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `receptions`
--

CREATE TABLE `receptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `citerne_mobile_id` bigint(20) UNSIGNED NOT NULL,
  `article_id` bigint(20) UNSIGNED DEFAULT NULL,
  `theorical_quantity` decimal(8,2) DEFAULT NULL,
  `received_quantity` decimal(8,2) NOT NULL,
  `destination_agency_id` bigint(20) UNSIGNED DEFAULT NULL,
  `recorded_id_user` bigint(20) UNSIGNED NOT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `regions`
--

CREATE TABLE `regions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `regions`
--

INSERT INTO `regions` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'centre', '2025-11-13 11:54:16', '2025-11-13 11:54:16'),
(2, 'littoral', '2025-11-13 11:54:44', '2025-11-13 11:54:44'),
(3, 'nord', '2025-11-13 11:54:53', '2025-11-13 11:54:53');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'super_administrateur', 'Accès complet au système', '2025-11-13 11:41:12', '2025-11-13 11:41:12'),
(2, 'administrateur', 'Gestion des utilisateurs, configurations générales', '2025-11-13 11:41:12', '2025-11-13 11:41:12'),
(3, 'pdg', 'Vue d\'ensemble et décisions stratégiques', '2025-11-13 11:41:12', '2025-11-13 11:41:12'),
(4, 'direction', 'Gestion de département, reporting', '2025-11-13 11:41:12', '2025-11-13 11:41:12'),
(5, 'controleur', 'Vérification et audit financier', '2025-11-13 11:41:12', '2025-11-13 11:41:12'),
(6, 'magasin', 'Gestion des stocks, entrées/sorties de marchandises', '2025-11-13 11:41:12', '2025-11-13 11:41:12'),
(7, 'production', 'Supervision et exécution des opérations de production', '2025-11-13 11:41:12', '2025-11-13 11:41:12'),
(8, 'commercial', 'Gestion des ventes, relations clients', '2025-11-13 11:41:12', '2025-11-13 11:41:12'),
(9, 'chauffeur', 'Gestion des livraisons et transports', '2025-11-13 11:41:12', '2025-11-13 11:41:12');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('C0NrNzddSDuEUhg0KbbabNSN0Kvs1f4GtAhKLoMq', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV2REMUhyTlJVV3pzak5PVDJtT2ZUREVpa3NndmJqWFU5WWRvbzZ4aCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9sb2dpbiI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1763041729),
('er02fyqsmNk9W7bLWJu8kcqz7CS2yIBVVAzlqFgS', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiNTdFN2xaeDhNbUxFbEpyUGZlZHg0MnFYeVlHQm9JY0pha2lyQ3RIcSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mzk6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9kaXJlY3Rvci9hcnRpY2xlcyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjM7fQ==', 1763041693);

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `article_id` bigint(20) UNSIGNED NOT NULL,
  `agency_id` bigint(20) UNSIGNED NOT NULL,
  `storage_type` varchar(255) NOT NULL,
  `quantity` decimal(8,2) NOT NULL,
  `theorical_quantity` decimal(8,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `citerne_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stocks`
--

INSERT INTO `stocks` (`id`, `article_id`, `agency_id`, `storage_type`, `quantity`, `theorical_quantity`, `created_at`, `updated_at`, `citerne_id`) VALUES
(1, 4, 1, 'magasin', 0.00, NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31', NULL),
(2, 4, 1, 'commercial', 0.00, NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31', NULL),
(3, 4, 1, 'production', 0.00, NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31', NULL),
(4, 4, 2, 'magasin', 0.00, NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31', NULL),
(5, 4, 2, 'commercial', 0.00, NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31', NULL),
(6, 4, 2, 'production', 0.00, NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31', NULL),
(7, 4, 3, 'magasin', 0.00, NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31', NULL),
(8, 4, 3, 'commercial', 0.00, NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31', NULL),
(9, 4, 3, 'production', 0.00, NULL, '2025-11-13 12:16:31', '2025-11-13 12:16:31', NULL),
(10, 3, 1, 'magasin', 0.00, NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34', NULL),
(11, 3, 1, 'commercial', 0.00, NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34', NULL),
(12, 3, 1, 'production', 0.00, NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34', NULL),
(13, 3, 2, 'magasin', 0.00, NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34', NULL),
(14, 3, 2, 'commercial', 0.00, NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34', NULL),
(15, 3, 2, 'production', 0.00, NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34', NULL),
(16, 3, 3, 'magasin', 0.00, NULL, '2025-11-13 12:16:34', '2025-11-13 12:16:34', NULL),
(17, 3, 3, 'commercial', 0.00, NULL, '2025-11-13 12:16:35', '2025-11-13 12:16:35', NULL),
(18, 3, 3, 'production', 0.00, NULL, '2025-11-13 12:16:35', '2025-11-13 12:16:35', NULL),
(19, 2, 1, 'magasin', 0.00, NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36', NULL),
(20, 2, 1, 'commercial', 0.00, NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36', NULL),
(21, 2, 1, 'production', 0.00, NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36', NULL),
(22, 2, 2, 'magasin', 0.00, NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36', NULL),
(23, 2, 2, 'commercial', 0.00, NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36', NULL),
(24, 2, 2, 'production', 0.00, NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36', NULL),
(25, 2, 3, 'magasin', 0.00, NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36', NULL),
(26, 2, 3, 'commercial', 0.00, NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36', NULL),
(27, 2, 3, 'production', 0.00, NULL, '2025-11-13 12:16:36', '2025-11-13 12:16:36', NULL),
(28, 1, 1, 'magasin', 0.00, NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50', NULL),
(29, 1, 1, 'commercial', 0.00, NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50', NULL),
(30, 1, 1, 'production', 0.00, NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50', NULL),
(31, 1, 2, 'magasin', 0.00, NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50', NULL),
(32, 1, 2, 'commercial', 0.00, NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50', NULL),
(33, 1, 2, 'production', 0.00, NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50', NULL),
(34, 1, 3, 'magasin', 0.00, NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50', NULL),
(35, 1, 3, 'commercial', 0.00, NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50', NULL),
(36, 1, 3, 'production', 0.00, NULL, '2025-11-13 12:16:50', '2025-11-13 12:16:50', NULL),
(37, 5, 1, 'gaz', 0.00, NULL, '2025-11-13 12:20:30', '2025-11-13 12:20:30', 1),
(38, 5, 1, 'gaz', 0.00, NULL, '2025-11-13 12:20:41', '2025-11-13 12:20:41', 2);

-- --------------------------------------------------------

--
-- Table structure for table `subscribe_histories`
--

CREATE TABLE `subscribe_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subs_id` bigint(20) UNSIGNED NOT NULL,
  `old_price` decimal(8,2) DEFAULT NULL,
  `new_price` decimal(8,2) DEFAULT NULL,
  `old_number_of_agencies` int(10) UNSIGNED DEFAULT NULL,
  `new_number_of_agencies` int(10) UNSIGNED DEFAULT NULL,
  `licence_name_at_time` varchar(255) NOT NULL,
  `action_type` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `entreprise_id` bigint(20) UNSIGNED NOT NULL,
  `licence_id` bigint(20) UNSIGNED NOT NULL,
  `price` decimal(8,2) NOT NULL,
  `nombre_agence` int(10) UNSIGNED DEFAULT NULL,
  `date_souscription` date NOT NULL,
  `date_expiration` date NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `entreprise_id`, `licence_id`, `price`, `nombre_agence`, `date_souscription`, `date_expiration`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 50000.00, 3, '2025-11-13', '2025-12-13', 1, '2025-11-13 11:59:18', '2025-11-13 11:59:18');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `modif_days` int(11) NOT NULL DEFAULT 2,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `agency_id` bigint(20) UNSIGNED DEFAULT NULL,
  `entreprise_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `email_verified_at`, `password`, `phone_number`, `code`, `archived`, `modif_days`, `remember_token`, `created_at`, `updated_at`, `deleted_at`, `role_id`, `agency_id`, `entreprise_id`) VALUES
(1, 'Super Admin', 'ikarooteam', 'super@example.com', NULL, '$2y$12$Eee/tuU3nPVUoXhqbvHzFOlyXpqcMKAduGjZLgnkgoR2fRyqk7O0m', NULL, '', 0, 2, NULL, '2025-11-13 11:41:12', '2025-11-13 11:41:12', NULL, 1, NULL, NULL),
(2, 'ceo', 'ceo', 'ceo@gmail.com', NULL, '$2y$12$7Blu9gEZS0UcopkImkf37uuJSg.m4BpwoDy6uCSFZj5YknJyEXcz2', '12345678', 'ceo1234', 0, 2, NULL, '2025-11-13 12:01:53', '2025-11-13 12:01:53', NULL, 3, NULL, 1),
(3, 'direction', 'direction', 'direction@gmail.com', NULL, '$2y$12$YG6p7Nm0PUC.NAFLvDFL8ONAPVzyOW/YAhjvCY7biRgnl34y82BX.', '12345678', 'direction', 0, 2, NULL, '2025-11-13 12:02:40', '2025-11-13 12:03:17', NULL, 4, NULL, 1),
(4, 'regional', 'regional', 'regional@gmail.com', NULL, '$2y$12$423pAGbkkDH0v6ko0s//memmSTDDT02EUIfTgntw7jrOqj.XdkUli', '12345678', 'regional', 0, 2, NULL, '2025-11-13 12:04:13', '2025-11-13 12:04:13', NULL, 5, 1, 1),
(5, 'central', 'magasin', 'magasincentral@gmail.com', NULL, '$2y$12$ihJPt51P/To8UijUgUuzqeqGabZ67tDM4GFqfaRiprlNfJCAMLFLS', '12345678', 'magasincentral', 0, 2, NULL, '2025-11-13 12:05:23', '2025-11-13 12:05:23', NULL, 6, 1, 1),
(6, 'nord', 'magasin', 'magasinnord@gmail.com', NULL, '$2y$12$XNtasKFMzmRI0wm.myrPweI/73XBQEJhKH1Fef1b3D5xS1jyMsS4u', '12345678', 'magasinnord', 0, 2, NULL, '2025-11-13 12:06:09', '2025-11-13 12:06:09', NULL, 6, 3, 1),
(7, 'littoral', 'magasin', 'magasinlittoral@gmail.com', NULL, '$2y$12$QS/Zj0q2I9d6pgK8.9kYcu./bzV0olAa2y2bioGji6nUX7vtgPXqO', '12345678', 'magasinlittoral', 0, 2, NULL, '2025-11-13 12:07:21', '2025-11-13 12:07:21', NULL, 6, 2, 1),
(8, 'central', 'production', 'productioncentral@gmail.com', NULL, '$2y$12$OBzVibaVAWM58pfXLQw4UOZe1kaMAQGDGQ/1H7QHy/E0Dw4yZfvg2', '12345678', 'productioncentral', 0, 2, NULL, '2025-11-13 12:08:21', '2025-11-13 12:08:21', NULL, 7, 1, 1),
(9, 'nord', 'commercial', 'commercialnord@gmail.com', NULL, '$2y$12$mEH.XzK.ljNGonyySECZjOTiM06/Jjip0aGkClRhuP1uDCZC2tfEW', '12345678', 'commercialnord', 0, 2, NULL, '2025-11-13 12:11:29', '2025-11-13 12:11:29', NULL, 8, 3, 1),
(10, 'littoral', 'commercial', 'commerciallittoral@gmail.com', NULL, '$2y$12$cSca7OEDPjSLKSqbI0P6jeU9knftTal5kyVObkTLNoSvTZy5meWAm', '12345678', 'commerciallittoral-----', 0, 2, NULL, '2025-11-13 12:12:31', '2025-11-13 12:12:31', NULL, 8, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `vehicules`
--

CREATE TABLE `vehicules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `licence_plate` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `capacity_liters` decimal(8,2) DEFAULT NULL,
  `owner_type` varchar(255) DEFAULT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicules`
--

INSERT INTO `vehicules` (`id`, `licence_plate`, `type`, `capacity_liters`, `owner_type`, `archived`, `created_at`, `updated_at`) VALUES
(1, 'CETR188AD', 'Camion-plateau', NULL, 'Propre', 0, '2025-11-13 12:31:03', '2025-11-13 12:31:03'),
(2, 'CETR189AD', 'Camion-citerne', 32000.00, 'Propre', 0, '2025-11-13 12:35:45', '2025-11-13 12:35:45'),
(3, 'CETR190AD', 'Camion-citerne', 32000.00, 'Propre', 0, '2025-11-13 12:36:07', '2025-11-13 12:36:07');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agencies`
--
ALTER TABLE `agencies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `agencies_name_unique` (`name`),
  ADD KEY `agencies_entreprise_id_foreign` (`entreprise_id`),
  ADD KEY `agencies_licence_id_foreign` (`licence_id`),
  ADD KEY `agencies_region_id_foreign` (`region_id`),
  ADD KEY `agencies_city_id_foreign` (`city_id`);

--
-- Indexes for table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `articles_code_unique` (`code`),
  ADD KEY `articles_article_id_foreign` (`article_id`),
  ADD KEY `articles_entreprise_id_foreign` (`entreprise_id`);

--
-- Indexes for table `article_bordereau_route`
--
ALTER TABLE `article_bordereau_route`
  ADD PRIMARY KEY (`id`),
  ADD KEY `article_bordereau_route_bordereau_route_id_foreign` (`bordereau_route_id`),
  ADD KEY `article_bordereau_route_article_id_foreign` (`article_id`);

--
-- Indexes for table `article_category_prices`
--
ALTER TABLE `article_category_prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `article_category_prices_agency_id_foreign` (`agency_id`),
  ADD KEY `article_category_prices_article_id_foreign` (`article_id`),
  ADD KEY `article_category_prices_client_category_id_foreign` (`client_category_id`);

--
-- Indexes for table `banks`
--
ALTER TABLE `banks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bordereau_routes`
--
ALTER TABLE `bordereau_routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bordereau_routes_vehicule_id_foreign` (`vehicule_id`),
  ADD KEY `bordereau_routes_chauffeur_id_foreign` (`chauffeur_id`),
  ADD KEY `bordereau_routes_co_chauffeur_id_foreign` (`co_chauffeur_id`),
  ADD KEY `bordereau_routes_departure_location_id_foreign` (`departure_location_id`),
  ADD KEY `bordereau_routes_arrival_location_id_foreign` (`arrival_location_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `chauffeurs`
--
ALTER TABLE `chauffeurs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `citernes`
--
ALTER TABLE `citernes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `citernes_name_unique` (`name`),
  ADD KEY `citernes_current_product_id_foreign` (`current_product_id`),
  ADD KEY `citernes_agency_id_foreign` (`agency_id`),
  ADD KEY `citernes_entreprise_id_foreign` (`entreprise_id`);

--
-- Indexes for table `citerne_readings`
--
ALTER TABLE `citerne_readings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `citerne_readings_stock_id_foreign` (`stock_id`),
  ADD KEY `citerne_readings_user_id_foreign` (`user_id`),
  ADD KEY `citerne_readings_citerne_id_foreign` (`citerne_id`),
  ADD KEY `citerne_readings_agency_id_foreign` (`agency_id`);

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cities_region_id_foreign` (`region_id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clients_nui_unique` (`NUI`),
  ADD KEY `clients_client_category_id_foreign` (`client_category_id`);

--
-- Indexes for table `client_categories`
--
ALTER TABLE `client_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `client_categories_name_unique` (`name`);

--
-- Indexes for table `closures`
--
ALTER TABLE `closures`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `closures_agency_id_unique` (`agency_id`);

--
-- Indexes for table `depotages`
--
ALTER TABLE `depotages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `depotages_citerne_mobile_id_foreign` (`citerne_mobile_id`),
  ADD KEY `depotages_citerne_fixe_id_foreign` (`citerne_fixe_id`),
  ADD KEY `depotages_article_id_foreign` (`article_id`),
  ADD KEY `depotages_recorded_by_user_id_foreign` (`recorded_by_user_id`);

--
-- Indexes for table `entreprises`
--
ALTER TABLE `entreprises`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `entreprises_code_unique` (`code`);

--
-- Indexes for table `factures`
--
ALTER TABLE `factures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `factures_client_id_foreign` (`client_id`),
  ADD KEY `factures_user_id_foreign` (`user_id`),
  ADD KEY `factures_agency_id_foreign` (`agency_id`);

--
-- Indexes for table `facture_items`
--
ALTER TABLE `facture_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `facture_items_facture_id_foreign` (`facture_id`),
  ADD KEY `facture_items_article_id_foreign` (`article_id`);

--
-- Indexes for table `facture_payments`
--
ALTER TABLE `facture_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `facture_payments_payment_id_foreign` (`payment_id`),
  ADD KEY `facture_payments_facture_id_foreign` (`facture_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `fuel_sales`
--
ALTER TABLE `fuel_sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fuel_sales_client_id_foreign` (`client_id`),
  ADD KEY `fuel_sales_user_id_foreign` (`user_id`),
  ADD KEY `fuel_sales_agency_id_foreign` (`agency_id`),
  ADD KEY `fuel_sales_article_id_foreign` (`article_id`),
  ADD KEY `fuel_sales_pompe_id_foreign` (`pompe_id`);

--
-- Indexes for table `fuel_sale_citernes`
--
ALTER TABLE `fuel_sale_citernes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fuel_sale_citernes_fuel_sale_id_foreign` (`fuel_sale_id`),
  ADD KEY `fuel_sale_citernes_citerne_id_foreign` (`citerne_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `licences`
--
ALTER TABLE `licences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `licences_name_unique` (`name`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mouvements`
--
ALTER TABLE `mouvements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mouvements_agency_id_foreign` (`agency_id`),
  ADD KEY `mouvements_entreprise_id_foreign` (`entreprise_id`),
  ADD KEY `mouvements_article_id_foreign` (`article_id`),
  ADD KEY `mouvements_recorded_by_user_id_foreign` (`recorded_by_user_id`),
  ADD KEY `mouvements_related_document_id_foreign` (`related_document_id`),
  ADD KEY `mouvements_facture_id_foreign` (`facture_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_user_id_foreign` (`user_id`),
  ADD KEY `payments_agency_id_foreign` (`agency_id`),
  ADD KEY `payments_bank_id_foreign` (`bank_id`),
  ADD KEY `payments_client_id_foreign` (`client_id`);

--
-- Indexes for table `pompes`
--
ALTER TABLE `pompes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pompes_agency_id_foreign` (`agency_id`);

--
-- Indexes for table `pompe_citernes`
--
ALTER TABLE `pompe_citernes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pompe_citernes_pompe_id_foreign` (`pompe_id`),
  ADD KEY `pompe_citernes_citerne_id_foreign` (`citerne_id`);

--
-- Indexes for table `production_histories`
--
ALTER TABLE `production_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `production_histories_source_citerne_id_foreign` (`source_citerne_id`),
  ADD KEY `production_histories_article_id_foreign` (`article_id`),
  ADD KEY `production_histories_production_movement_id_foreign` (`production_movement_id`),
  ADD KEY `production_histories_agency_id_foreign` (`agency_id`),
  ADD KEY `production_histories_recorded_by_user_id_foreign` (`recorded_by_user_id`);

--
-- Indexes for table `receptions`
--
ALTER TABLE `receptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receptions_citerne_mobile_id_foreign` (`citerne_mobile_id`),
  ADD KEY `receptions_article_id_foreign` (`article_id`),
  ADD KEY `receptions_destination_agency_id_foreign` (`destination_agency_id`),
  ADD KEY `receptions_recorded_id_user_foreign` (`recorded_id_user`);

--
-- Indexes for table `regions`
--
ALTER TABLE `regions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `regions_name_unique` (`name`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stocks_article_id_foreign` (`article_id`),
  ADD KEY `stocks_agency_id_foreign` (`agency_id`),
  ADD KEY `stocks_citerne_id_foreign` (`citerne_id`);

--
-- Indexes for table `subscribe_histories`
--
ALTER TABLE `subscribe_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscribe_histories_subs_id_foreign` (`subs_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscriptions_entreprise_id_foreign` (`entreprise_id`),
  ADD KEY `subscriptions_licence_id_foreign` (`licence_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_code_unique` (`code`),
  ADD KEY `users_role_id_foreign` (`role_id`),
  ADD KEY `users_agency_id_foreign` (`agency_id`),
  ADD KEY `users_entreprise_id_foreign` (`entreprise_id`);

--
-- Indexes for table `vehicules`
--
ALTER TABLE `vehicules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vehicules_licence_plate_unique` (`licence_plate`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `agencies`
--
ALTER TABLE `agencies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `article_bordereau_route`
--
ALTER TABLE `article_bordereau_route`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `article_category_prices`
--
ALTER TABLE `article_category_prices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `banks`
--
ALTER TABLE `banks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bordereau_routes`
--
ALTER TABLE `bordereau_routes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chauffeurs`
--
ALTER TABLE `chauffeurs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `citernes`
--
ALTER TABLE `citernes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `citerne_readings`
--
ALTER TABLE `citerne_readings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `client_categories`
--
ALTER TABLE `client_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `closures`
--
ALTER TABLE `closures`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `depotages`
--
ALTER TABLE `depotages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `entreprises`
--
ALTER TABLE `entreprises`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `factures`
--
ALTER TABLE `factures`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `facture_items`
--
ALTER TABLE `facture_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `facture_payments`
--
ALTER TABLE `facture_payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fuel_sales`
--
ALTER TABLE `fuel_sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fuel_sale_citernes`
--
ALTER TABLE `fuel_sale_citernes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `licences`
--
ALTER TABLE `licences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `mouvements`
--
ALTER TABLE `mouvements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pompes`
--
ALTER TABLE `pompes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pompe_citernes`
--
ALTER TABLE `pompe_citernes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_histories`
--
ALTER TABLE `production_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `receptions`
--
ALTER TABLE `receptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `regions`
--
ALTER TABLE `regions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `subscribe_histories`
--
ALTER TABLE `subscribe_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `vehicules`
--
ALTER TABLE `vehicules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `agencies`
--
ALTER TABLE `agencies`
  ADD CONSTRAINT `agencies_city_id_foreign` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `agencies_entreprise_id_foreign` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `agencies_licence_id_foreign` FOREIGN KEY (`licence_id`) REFERENCES `licences` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `agencies_region_id_foreign` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`),
  ADD CONSTRAINT `articles_entreprise_id_foreign` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `article_bordereau_route`
--
ALTER TABLE `article_bordereau_route`
  ADD CONSTRAINT `article_bordereau_route_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `article_bordereau_route_bordereau_route_id_foreign` FOREIGN KEY (`bordereau_route_id`) REFERENCES `bordereau_routes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `article_category_prices`
--
ALTER TABLE `article_category_prices`
  ADD CONSTRAINT `article_category_prices_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`),
  ADD CONSTRAINT `article_category_prices_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`),
  ADD CONSTRAINT `article_category_prices_client_category_id_foreign` FOREIGN KEY (`client_category_id`) REFERENCES `client_categories` (`id`);

--
-- Constraints for table `bordereau_routes`
--
ALTER TABLE `bordereau_routes`
  ADD CONSTRAINT `bordereau_routes_arrival_location_id_foreign` FOREIGN KEY (`arrival_location_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bordereau_routes_chauffeur_id_foreign` FOREIGN KEY (`chauffeur_id`) REFERENCES `chauffeurs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bordereau_routes_co_chauffeur_id_foreign` FOREIGN KEY (`co_chauffeur_id`) REFERENCES `chauffeurs` (`id`),
  ADD CONSTRAINT `bordereau_routes_departure_location_id_foreign` FOREIGN KEY (`departure_location_id`) REFERENCES `agencies` (`id`),
  ADD CONSTRAINT `bordereau_routes_vehicule_id_foreign` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `citernes`
--
ALTER TABLE `citernes`
  ADD CONSTRAINT `citernes_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`),
  ADD CONSTRAINT `citernes_current_product_id_foreign` FOREIGN KEY (`current_product_id`) REFERENCES `articles` (`id`),
  ADD CONSTRAINT `citernes_entreprise_id_foreign` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises` (`id`);

--
-- Constraints for table `citerne_readings`
--
ALTER TABLE `citerne_readings`
  ADD CONSTRAINT `citerne_readings_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `citerne_readings_citerne_id_foreign` FOREIGN KEY (`citerne_id`) REFERENCES `citernes` (`id`),
  ADD CONSTRAINT `citerne_readings_stock_id_foreign` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`),
  ADD CONSTRAINT `citerne_readings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `cities`
--
ALTER TABLE `cities`
  ADD CONSTRAINT `cities_region_id_foreign` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_client_category_id_foreign` FOREIGN KEY (`client_category_id`) REFERENCES `client_categories` (`id`);

--
-- Constraints for table `closures`
--
ALTER TABLE `closures`
  ADD CONSTRAINT `closures_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `depotages`
--
ALTER TABLE `depotages`
  ADD CONSTRAINT `depotages_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`),
  ADD CONSTRAINT `depotages_citerne_fixe_id_foreign` FOREIGN KEY (`citerne_fixe_id`) REFERENCES `citernes` (`id`),
  ADD CONSTRAINT `depotages_citerne_mobile_id_foreign` FOREIGN KEY (`citerne_mobile_id`) REFERENCES `vehicules` (`id`),
  ADD CONSTRAINT `depotages_recorded_by_user_id_foreign` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `factures`
--
ALTER TABLE `factures`
  ADD CONSTRAINT `factures_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`),
  ADD CONSTRAINT `factures_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `factures_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `facture_items`
--
ALTER TABLE `facture_items`
  ADD CONSTRAINT `facture_items_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `facture_items_facture_id_foreign` FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `facture_payments`
--
ALTER TABLE `facture_payments`
  ADD CONSTRAINT `facture_payments_facture_id_foreign` FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `facture_payments_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fuel_sales`
--
ALTER TABLE `fuel_sales`
  ADD CONSTRAINT `fuel_sales_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fuel_sales_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fuel_sales_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fuel_sales_pompe_id_foreign` FOREIGN KEY (`pompe_id`) REFERENCES `pompes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fuel_sales_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fuel_sale_citernes`
--
ALTER TABLE `fuel_sale_citernes`
  ADD CONSTRAINT `fuel_sale_citernes_citerne_id_foreign` FOREIGN KEY (`citerne_id`) REFERENCES `citernes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fuel_sale_citernes_fuel_sale_id_foreign` FOREIGN KEY (`fuel_sale_id`) REFERENCES `fuel_sales` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mouvements`
--
ALTER TABLE `mouvements`
  ADD CONSTRAINT `mouvements_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`),
  ADD CONSTRAINT `mouvements_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mouvements_entreprise_id_foreign` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises` (`id`),
  ADD CONSTRAINT `mouvements_facture_id_foreign` FOREIGN KEY (`facture_id`) REFERENCES `factures` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mouvements_recorded_by_user_id_foreign` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `mouvements_related_document_id_foreign` FOREIGN KEY (`related_document_id`) REFERENCES `bordereau_routes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_bank_id_foreign` FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pompes`
--
ALTER TABLE `pompes`
  ADD CONSTRAINT `pompes_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pompe_citernes`
--
ALTER TABLE `pompe_citernes`
  ADD CONSTRAINT `pompe_citernes_citerne_id_foreign` FOREIGN KEY (`citerne_id`) REFERENCES `citernes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pompe_citernes_pompe_id_foreign` FOREIGN KEY (`pompe_id`) REFERENCES `pompes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `production_histories`
--
ALTER TABLE `production_histories`
  ADD CONSTRAINT `production_histories_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`),
  ADD CONSTRAINT `production_histories_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`),
  ADD CONSTRAINT `production_histories_production_movement_id_foreign` FOREIGN KEY (`production_movement_id`) REFERENCES `mouvements` (`id`),
  ADD CONSTRAINT `production_histories_recorded_by_user_id_foreign` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `production_histories_source_citerne_id_foreign` FOREIGN KEY (`source_citerne_id`) REFERENCES `citernes` (`id`);

--
-- Constraints for table `receptions`
--
ALTER TABLE `receptions`
  ADD CONSTRAINT `receptions_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`),
  ADD CONSTRAINT `receptions_citerne_mobile_id_foreign` FOREIGN KEY (`citerne_mobile_id`) REFERENCES `vehicules` (`id`),
  ADD CONSTRAINT `receptions_destination_agency_id_foreign` FOREIGN KEY (`destination_agency_id`) REFERENCES `agencies` (`id`),
  ADD CONSTRAINT `receptions_recorded_id_user_foreign` FOREIGN KEY (`recorded_id_user`) REFERENCES `users` (`id`);

--
-- Constraints for table `stocks`
--
ALTER TABLE `stocks`
  ADD CONSTRAINT `stocks_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stocks_article_id_foreign` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stocks_citerne_id_foreign` FOREIGN KEY (`citerne_id`) REFERENCES `citernes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscribe_histories`
--
ALTER TABLE `subscribe_histories`
  ADD CONSTRAINT `subscribe_histories_subs_id_foreign` FOREIGN KEY (`subs_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_entreprise_id_foreign` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subscriptions_licence_id_foreign` FOREIGN KEY (`licence_id`) REFERENCES `licences` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_entreprise_id_foreign` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
