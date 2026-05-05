-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 05, 2026 at 05:07 AM
-- Server version: 11.4.10-MariaDB-cll-lve-log
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `discdlfx_home_gold`
--

-- --------------------------------------------------------

--
-- Table structure for table `banks`
--

CREATE TABLE `banks` (
  `id` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `accountName` varchar(255) NOT NULL,
  `accountNo` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `openingBalance` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `banks`
--

INSERT INTO `banks` (`id`, `businessId`, `accountName`, `accountNo`, `address`, `isActive`, `createdAt`, `updatedAt`, `currency`, `openingBalance`) VALUES
(1, 1, 'Cash In Hand', '00001', 'BD', 1, '2026-03-18 09:00:36', '2026-03-18 09:00:36', 'BDT', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `businesses`
--

CREATE TABLE `businesses` (
  `id` int(11) NOT NULL,
  `businessName` varchar(255) NOT NULL,
  `businessLogo` varchar(255) DEFAULT NULL,
  `businessLicenseNo` varchar(255) DEFAULT NULL,
  `businessLicenseCopy` varchar(255) DEFAULT NULL,
  `ownerName` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `countryCode` varchar(255) DEFAULT NULL,
  `phoneCode` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `trnNo` varchar(255) DEFAULT NULL,
  `vatPercentage` float DEFAULT 0,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `postalCode` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `businessShortName` varchar(255) DEFAULT NULL,
  `baseCurrency` varchar(255) DEFAULT 'AED',
  `currencyRates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`currencyRates`))
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `businesses`
--

INSERT INTO `businesses` (`id`, `businessName`, `businessLogo`, `businessLicenseNo`, `businessLicenseCopy`, `ownerName`, `email`, `countryCode`, `phoneCode`, `phoneNumber`, `trnNo`, `vatPercentage`, `address`, `city`, `country`, `postalCode`, `isActive`, `createdAt`, `updatedAt`, `businessShortName`, `baseCurrency`, `currencyRates`) VALUES
(1, 'Home of Gold & Jewellery', '/uploads/logo/HomeGold-1772868265942.png', '', NULL, 'Mr. Abdul Hoque', 'mollahin3@gmail.com', 'AE', '+971', '569969296', '', 0, 'Deira Dubai', 'Dubai', 'UAE', '00000', 1, '2025-08-25 04:43:08', '2026-03-07 07:24:25', NULL, 'AED', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `businessId`, `name`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Gold', 1, '2025-08-31 10:13:02', '2025-08-31 10:13:02');

-- --------------------------------------------------------

--
-- Table structure for table `containers`
--

CREATE TABLE `containers` (
  `id` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `date` date NOT NULL,
  `blNo` varchar(255) NOT NULL,
  `soNo` varchar(255) DEFAULT NULL,
  `oceanVesselName` varchar(255) NOT NULL,
  `voyageNo` varchar(255) DEFAULT NULL,
  `agentDetails` varchar(255) DEFAULT NULL,
  `placeOfReceipt` varchar(255) DEFAULT NULL,
  `portOfLoading` varchar(255) DEFAULT NULL,
  `portOfDischarge` varchar(255) DEFAULT NULL,
  `placeOfDelivery` varchar(255) DEFAULT NULL,
  `containerNo` varchar(255) NOT NULL,
  `sealNo` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 0,
  `createdUserId` int(11) DEFAULT NULL,
  `updatedUserId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gold_price_ins`
--

CREATE TABLE `gold_price_ins` (
  `id` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `goldSpotRate` decimal(18,6) DEFAULT NULL,
  `dollarRate` decimal(18,6) DEFAULT NULL,
  `ounceRateDirham` decimal(18,6) DEFAULT NULL,
  `ounceGram` decimal(18,6) DEFAULT NULL,
  `999_rateGram` decimal(18,6) DEFAULT NULL,
  `995_rateGram` decimal(18,6) DEFAULT NULL,
  `992_rateGram` decimal(18,6) DEFAULT NULL,
  `buyRate` decimal(18,6) DEFAULT NULL,
  `sellRate` decimal(18,6) DEFAULT NULL,
  `carretRate` decimal(18,6) DEFAULT NULL,
  `buy_MC` decimal(18,6) DEFAULT NULL,
  `sell_MC` decimal(18,6) DEFAULT NULL,
  `carret_MC` decimal(18,6) DEFAULT NULL,
  `buy_CC` decimal(18,6) DEFAULT NULL,
  `sell_CC` decimal(18,6) DEFAULT NULL,
  `carret_CC` decimal(18,6) DEFAULT NULL,
  `buyAddProfit` decimal(18,6) DEFAULT NULL,
  `sellAddProfit` decimal(18,6) DEFAULT NULL,
  `carretAddProfit` decimal(18,6) DEFAULT NULL,
  `buyPricePerGram` decimal(18,6) DEFAULT NULL,
  `sellPricePerGram` decimal(18,6) DEFAULT NULL,
  `carretPricePerGram` decimal(18,6) DEFAULT NULL,
  `boriGram` decimal(18,6) DEFAULT NULL,
  `buyTotalDirham` decimal(18,6) DEFAULT NULL,
  `sellTotalDirham` decimal(18,6) DEFAULT NULL,
  `carretTotalDirham` decimal(18,6) DEFAULT NULL,
  `buyBdtRate` decimal(18,6) DEFAULT NULL,
  `sellBdtRate` decimal(18,6) DEFAULT NULL,
  `carretBdtRate` decimal(18,6) DEFAULT NULL,
  `buyTotalBdtBori` decimal(18,6) DEFAULT NULL,
  `sellTotalBdtBori` decimal(18,6) DEFAULT NULL,
  `carretTotalBdtBori` decimal(18,6) DEFAULT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `gold_price_ins`
--

INSERT INTO `gold_price_ins` (`id`, `businessId`, `goldSpotRate`, `dollarRate`, `ounceRateDirham`, `ounceGram`, `999_rateGram`, `995_rateGram`, `992_rateGram`, `buyRate`, `sellRate`, `carretRate`, `buy_MC`, `sell_MC`, `carret_MC`, `buy_CC`, `sell_CC`, `carret_CC`, `buyAddProfit`, `sellAddProfit`, `carretAddProfit`, `buyPricePerGram`, `sellPricePerGram`, `carretPricePerGram`, `boriGram`, `buyTotalDirham`, `sellTotalDirham`, `carretTotalDirham`, `buyBdtRate`, `sellBdtRate`, `carretBdtRate`, `buyTotalBdtBori`, `sellTotalBdtBori`, `carretTotalBdtBori`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`) VALUES
(1, 1, 4600.000000, 3.674000, 16900.400000, 31.103500, 543.360000, 540.643000, NULL, 499.891000, 499.891000, 499.891000, 12.000000, 18.000000, 0.000000, 7.000000, 8.000000, 7.000000, 0.000000, 3.000000, 0.000000, 518.891000, 528.891000, 506.891000, 11.664000, 6052.345000, 6168.985000, 5912.377000, 34.450000, 34.550000, 34.550000, 208503.285000, 213138.432000, 204272.625000, 11, 11, '2026-04-29 08:04:26', '2026-04-29 08:04:26'),
(2, 1, 4600.000000, 3.674000, 16900.400000, 31.103500, 543.360000, 540.643000, NULL, 499.891000, 499.891000, 499.891000, 12.000000, 18.000000, 0.000000, 7.000000, 8.000000, 7.000000, 0.000000, 3.000000, 0.000000, 518.891000, 528.891000, 506.891000, 11.664000, 6052.345000, 6168.985000, 5912.377000, 34.450000, 34.550000, 34.550000, 208503.285000, 213138.432000, 204272.625000, 11, 11, '2026-04-29 08:04:26', '2026-04-29 08:04:26'),
(3, 1, 4600.000000, 3.674000, 16900.400000, 31.103500, 543.360000, 540.643000, NULL, 499.891000, 499.891000, 499.891000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 499.891000, 499.891000, 499.891000, 11.664000, 5830.729000, 5830.729000, 5830.729000, NULL, NULL, NULL, NULL, NULL, NULL, 11, 11, '2026-05-03 14:39:18', '2026-05-03 14:39:18');

-- --------------------------------------------------------

--
-- Table structure for table `invoiceitems`
--

CREATE TABLE `invoiceitems` (
  `id` int(11) NOT NULL,
  `uniqueId` varchar(255) DEFAULT NULL,
  `invoiceId` int(11) NOT NULL,
  `itemId` int(11) NOT NULL,
  `containerId` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `quantity` float NOT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `price` float NOT NULL,
  `subTotal` float NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `itemVat` float DEFAULT NULL,
  `itemGrandTotal` float DEFAULT NULL,
  `warehouseId` int(11) DEFAULT NULL,
  `system` int(11) NOT NULL DEFAULT 1,
  `vatPercentage` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `invoiceitems`
--

INSERT INTO `invoiceitems` (`id`, `uniqueId`, `invoiceId`, `itemId`, `containerId`, `name`, `quantity`, `unit`, `price`, `subTotal`, `createdAt`, `updatedAt`, `itemVat`, `itemGrandTotal`, `warehouseId`, `system`, `vatPercentage`) VALUES
(1, '1777576808298', 2, 18, NULL, 'Gold-920', 5482.42, 'Gram', 607.67, 3331500, '2026-04-30 19:21:18', '2026-04-30 19:21:18', 0, 3331500, NULL, 1, 0),
(10, '1777655862998', 7, 18, NULL, 'Gold-920', 99.28, 'Gram', 500, 49640, '2026-05-01 17:18:39', '2026-05-01 17:18:39', 0, 49640, NULL, 1, 0),
(11, '1777655952762', 8, 18, NULL, 'Gold-920', 99.72, 'Gram', 509, 50757.5, '2026-05-01 17:19:43', '2026-05-01 17:19:43', 0, 50757.5, NULL, 1, 0),
(12, '1777656164083', 9, 18, NULL, 'Gold-920', 99.28, 'Gram', 18252.8, 1812130, '2026-05-01 17:23:49', '2026-05-01 17:23:49', 0, 1812130, NULL, 1, 0),
(13, '1777656242083', 10, 18, NULL, 'Gold-920', 99.72, 'Gram', 17901.2, 1785110, '2026-05-01 17:24:53', '2026-05-01 17:24:53', 0, 1785110, NULL, 1, 0),
(14, '1777656923814', 11, 18, NULL, 'Gold-920', 40.84, 'Gram', 600, 24504, '2026-05-01 17:36:01', '2026-05-01 17:36:01', 0, 24504, NULL, 1, 0),
(15, '1777656970739', 12, 18, NULL, 'Gold-920', 40.84, 'Gram', 17830.6, 728200, '2026-05-01 17:36:56', '2026-05-01 17:36:56', 0, 728200, NULL, 1, 0),
(18, '1777662777780', 15, 18, NULL, 'Gold-920', 202.4, 'Gram', 500, 101200, '2026-05-01 19:14:42', '2026-05-01 19:14:42', 0, 101200, NULL, 1, 0),
(19, '1777663076195', 16, 18, NULL, 'Gold-920', 111.86, 'Gram', 500, 55930, '2026-05-01 19:18:39', '2026-05-01 19:18:39', 0, 55930, NULL, 1, 0),
(22, '1777707002488', 18, 18, NULL, 'Gold-920', 0.5, 'Gram', 500, 250, '2026-05-02 07:30:35', '2026-05-02 07:30:35', 0, 250, NULL, 1, 0),
(23, '1777707518833', 19, 18, NULL, 'Gold-920', 0.5, 'Gram', 17150, 8575, '2026-05-02 07:40:55', '2026-05-02 07:40:55', 0, 8575, NULL, 1, 0),
(27, '1777660871187', 14, 18, NULL, 'Gold-920', 0, 'Gram', 499.99, 0, '2026-05-02 19:46:46', '2026-05-02 19:46:46', 0, 0, NULL, 1, 0),
(31, '1777752226835', 22, 18, NULL, 'Gold-920', 128.27, 'Gram', 500, 64135, '2026-05-02 20:29:04', '2026-05-02 20:29:04', 0, 64135, NULL, 1, 0),
(32, '1777753844687', 23, 18, NULL, 'Gold-920', 128.27, 'Gram', 500, 64135, '2026-05-02 20:31:31', '2026-05-02 20:31:31', 0, 64135, NULL, 1, 0),
(33, '1777751268774', 21, 18, NULL, 'Gold-920', 32.46, 'Gram', 499.99, 16229.7, '2026-05-03 18:44:58', '2026-05-03 18:44:58', 0, 16229.7, NULL, 1, 0),
(35, '1777660674725', 13, 18, NULL, 'Gold-920', 4528.06, 'Gram', 499.99, 2263980, '2026-05-03 18:53:49', '2026-05-03 18:53:49', 0, 2263980, NULL, 1, 0),
(38, '1777834554858', 24, 18, NULL, 'Gold-920', 98.3, 'Gram', 500, 49150, '2026-05-03 18:58:36', '2026-05-03 18:58:36', 0, 49150, NULL, 1, 0),
(39, '1777834621170', 25, 18, NULL, 'Gold-920', 94.81, 'Gram', 500, 47405, '2026-05-03 18:58:52', '2026-05-03 18:58:52', 0, 47405, NULL, 1, 0),
(40, '1777834878484', 26, 18, NULL, 'Gold-920', 100.7, 'Gram', 500, 50350, '2026-05-03 19:02:44', '2026-05-03 19:02:44', 0, 50350, NULL, 1, 0),
(43, '1777835495718', 28, 18, NULL, 'Gold-920', 159.21, 'Gram', 18038.4, 2871890, '2026-05-03 19:16:27', '2026-05-03 19:16:27', 0, 2871890, NULL, 1, 0),
(44, '1777834970411', 27, 18, NULL, 'Gold-920', 99.84, 'Gram', 500, 49920, '2026-05-03 20:00:01', '2026-05-03 20:00:01', 0, 49920, NULL, 1, 0),
(45, '1777665098795', 17, 18, NULL, 'Gold-920', 0, 'Gram', 600, 0, '2026-05-04 18:28:49', '2026-05-04 18:28:49', 0, 0, NULL, 1, 0),
(46, '1777750774798', 20, 18, NULL, 'Gold-920', 0, 'Gram', 500, 0, '2026-05-04 18:37:05', '2026-05-04 18:37:05', 0, 0, NULL, 1, 0),
(47, '1777919945841', 29, 18, NULL, 'Gold-920', 100.5, 'Gram', 500, 50250, '2026-05-04 18:40:15', '2026-05-04 18:40:15', 0, 50250, NULL, 1, 0),
(48, '1777920063402', 30, 18, NULL, 'Gold-920', 100.6, 'Gram', 500, 50300, '2026-05-04 18:41:51', '2026-05-04 18:41:51', 0, 50300, NULL, 1, 0),
(49, '1777920127113', 31, 18, NULL, 'Gold-920', 100.1, 'Gram', 500, 50050, '2026-05-04 18:43:14', '2026-05-04 18:43:14', 0, 50050, NULL, 1, 0),
(50, '1777920202032', 32, 18, NULL, 'Gold-920', 100.3, 'Gram', 500, 50150, '2026-05-04 18:43:58', '2026-05-04 18:43:58', 0, 50150, NULL, 1, 0),
(51, '1777920245776', 33, 18, NULL, 'Gold-920', 100.1, 'Gram', 500, 50050, '2026-05-04 18:45:09', '2026-05-04 18:45:09', 0, 50050, NULL, 1, 0),
(52, '1777920313225', 34, 18, NULL, 'Gold-920', 100.3, 'Gram', 500, 50150, '2026-05-04 18:45:53', '2026-05-04 18:45:53', 0, 50150, NULL, 1, 0),
(53, '1777920839702', 35, 18, NULL, 'Gold-920', 174.73, 'Gram', 18047, 3153350, '2026-05-04 18:58:08', '2026-05-04 18:58:08', 0, 3153350, NULL, 1, 0),
(54, '1777921181831', 36, 18, NULL, 'Gold-920', 100.23, 'Gram', 17704.1, 1774480, '2026-05-04 19:01:39', '2026-05-04 19:01:39', 0, 1774480, NULL, 1, 0),
(55, '1777922367833', 37, 18, NULL, 'Gold-920', 99.84, 'Gram', 18047, 1801810, '2026-05-04 19:22:16', '2026-05-04 19:22:16', 0, 1801810, NULL, 1, 0),
(57, '1777922542175', 38, 18, NULL, 'Gold-920', 100.7, 'Gram', 18304.2, 1843230, '2026-05-04 19:26:50', '2026-05-04 19:26:50', 0, 1843230, NULL, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `invoiceRefId` int(11) DEFAULT NULL,
  `containerId` int(11) DEFAULT NULL,
  `prefix` varchar(255) NOT NULL,
  `invoiceType` varchar(255) NOT NULL,
  `partyId` int(11) NOT NULL,
  `date` date NOT NULL,
  `totalAmount` float NOT NULL,
  `isVat` tinyint(1) NOT NULL DEFAULT 0,
  `vatPercentage` float NOT NULL DEFAULT 0,
  `discount` float DEFAULT 0,
  `grandTotal` float NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `currency` varchar(255) NOT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT 0,
  `deletedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `vatInvoiceNo` int(11) DEFAULT NULL,
  `system` int(11) NOT NULL DEFAULT 1,
  `vatAmount` float DEFAULT NULL,
  `ounceRate` float DEFAULT NULL,
  `ounceRateGram` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `businessId`, `categoryId`, `invoiceRefId`, `containerId`, `prefix`, `invoiceType`, `partyId`, `date`, `totalAmount`, `isVat`, `vatPercentage`, `discount`, `grandTotal`, `note`, `currency`, `createdBy`, `updatedBy`, `isDeleted`, `deletedBy`, `createdAt`, `updatedAt`, `vatInvoiceNo`, `system`, `vatAmount`, `ounceRate`, `ounceRateGram`) VALUES
(2, 1, 1, 0, NULL, 'UPC', 'unfix_purchase', 26, '2026-04-20', 3331500, 0, 0, NULL, 3331500, 'USD 5150 $', 'AED', 11, NULL, 0, NULL, '2026-04-30 19:21:18', '2026-04-30 19:21:18', NULL, 1, 0, 5150, 607.67),
(7, 1, 1, 0, NULL, 'USL', 'unfix_sale', 1, '2026-04-30', 49640, 0, 0, NULL, 49640, 'GOLD RECEIVED PKT 21\n', 'BDT', 11, NULL, 0, NULL, '2026-05-01 17:18:39', '2026-05-01 17:18:39', NULL, 1, 0, NULL, NULL),
(8, 1, 1, 0, NULL, 'USL', 'unfix_sale', 1, '2026-04-30', 50757.5, 0, 0, NULL, 50757.5, '', 'BDT', 11, NULL, 0, NULL, '2026-05-01 17:19:43', '2026-05-01 17:19:43', NULL, 1, 0, NULL, NULL),
(9, 1, 1, 0, NULL, 'FSL', 'fix_sale', 1, '2026-04-30', 1812130, 0, 0, NULL, 1812130, '@212900 BDT', 'BDT', 11, NULL, 0, NULL, '2026-05-01 17:23:49', '2026-05-01 17:23:49', NULL, 1, 0, NULL, NULL),
(10, 1, 1, 0, NULL, 'FSL', 'fix_sale', 1, '2026-04-30', 1785110, 0, 0, NULL, 1785110, '@ 208800 BDT', 'BDT', 11, NULL, 0, NULL, '2026-05-01 17:24:53', '2026-05-01 17:24:53', NULL, 1, 0, NULL, NULL),
(11, 1, 1, 0, NULL, 'USL', 'unfix_sale', 3, '2026-05-01', 24504, 0, 0, NULL, 24504, '40.84/208000\n', 'BDT', 11, NULL, 0, NULL, '2026-05-01 17:36:01', '2026-05-01 17:36:01', NULL, 1, 0, NULL, NULL),
(12, 1, 1, 0, NULL, 'FSL', 'fix_sale', 3, '2026-05-01', 728200, 0, 0, NULL, 728200, '40.84/208000\n', 'BDT', 11, NULL, 0, NULL, '2026-05-01 17:36:56', '2026-05-01 17:36:56', NULL, 1, 0, NULL, NULL),
(13, 1, 1, 0, NULL, 'USL', 'unfix_sale', 7, '2026-05-01', 2263980, 0, 0, NULL, 2263980, '', 'AED', 11, 11, 0, NULL, '2026-05-01 18:38:50', '2026-05-03 18:53:49', NULL, 1, 0, NULL, NULL),
(14, 1, 1, 0, NULL, 'USL', 'unfix_sale', 1, '2026-05-01', 0, 0, 0, NULL, 0, 'TRANSFER TO SHOBUJ 32.84', 'AED', 11, 11, 0, NULL, '2026-05-01 18:41:40', '2026-05-02 19:46:46', NULL, 1, 0, NULL, NULL),
(15, 1, 1, 0, NULL, 'UPC', 'unfix_purchase', 6, '2026-05-01', 101200, 0, 0, NULL, 101200, 'MC 2190', 'AED', 11, NULL, 0, NULL, '2026-05-01 19:14:42', '2026-05-01 19:14:42', NULL, 1, 0, NULL, NULL),
(16, 1, 1, 0, NULL, 'UPC', 'unfix_purchase', 27, '2026-05-01', 55930, 0, 0, NULL, 55930, 'MC 1245', 'AED', 11, NULL, 0, NULL, '2026-05-01 19:18:39', '2026-05-01 19:18:39', NULL, 1, 0, NULL, NULL),
(17, 1, 1, 0, NULL, 'USL', 'unfix_sale', 4, '2026-05-01', 0, 0, 0, NULL, 0, '', 'AED', 11, 11, 0, NULL, '2026-05-01 19:52:09', '2026-05-04 18:28:49', NULL, 1, 0, NULL, NULL),
(18, 1, 1, 0, NULL, 'USL', 'unfix_sale', 28, '2026-05-02', 250, 0, 0, NULL, 250, '', 'AED', 11, NULL, 0, NULL, '2026-05-02 07:30:35', '2026-05-02 07:30:35', NULL, 1, 0, NULL, NULL),
(19, 1, 1, 0, NULL, 'FSL', 'fix_sale', 28, '2026-05-02', 8575, 0, 0, NULL, 8575, '', 'BDT', 11, NULL, 0, NULL, '2026-05-02 07:40:55', '2026-05-02 07:40:55', NULL, 1, 0, NULL, NULL),
(20, 1, 1, 0, NULL, 'USL', 'unfix_sale', 29, '2026-05-02', 0, 0, 0, NULL, 0, '', 'BDT', 11, 11, 0, NULL, '2026-05-02 19:40:21', '2026-05-04 18:37:05', NULL, 1, 0, NULL, NULL),
(21, 1, 1, 0, NULL, 'USL', 'unfix_sale', 2, '2026-05-02', 16229.7, 0, 0, NULL, 16229.7, 'RECEIVED FROM SAHAZAD', 'BDT', 11, 11, 0, NULL, '2026-05-02 19:48:36', '2026-05-03 18:44:58', NULL, 1, 0, NULL, NULL),
(22, 1, 1, 0, NULL, 'UPC', 'unfix_purchase', 26, '2026-05-02', 64135, 0, 0, NULL, 64135, '11.61 + 11.65 + 64.74 + +8.94 + 31.33= 128.27  AV PUR 215471.73 TOTAL BDT 2,369,561.04\n\n', 'BDT', 11, 11, 0, NULL, '2026-05-02 20:04:51', '2026-05-02 20:29:04', NULL, 1, 0, NULL, NULL),
(23, 1, 1, 0, NULL, 'USL', 'unfix_sale', 30, '2026-05-03', 64135, 0, 0, NULL, 64135, 'Gold-920 x128.27 @500<br />Note: 11.61 + 11.65 + 64.74 + +8.94 + 31.33= 128.27 AV PUR 215471.73 TOTAL BDT 2,369,561.04\n', 'AED', 11, NULL, 0, NULL, '2026-05-02 20:31:31', '2026-05-02 20:31:31', NULL, 1, 0, NULL, NULL),
(24, 1, 1, 0, NULL, 'USL', 'unfix_sale', 1, '2026-05-03', 49150, 0, 0, NULL, 49150, 'PKT NO 77 CHAINE', 'BDT', 11, 11, 0, NULL, '2026-05-03 18:56:54', '2026-05-03 18:58:36', NULL, 1, 0, NULL, NULL),
(25, 1, 1, 0, NULL, 'USL', 'unfix_sale', 1, '2026-05-03', 47405, 0, 0, NULL, 47405, 'PKT NO 83 CHAINE SOECIAL', 'BDT', 11, 11, 0, NULL, '2026-05-03 18:57:46', '2026-05-03 18:58:52', NULL, 1, 0, NULL, NULL),
(26, 1, 1, 0, NULL, 'USL', 'unfix_sale', 2, '2026-05-03', 50350, 0, 0, NULL, 50350, 'PKT NO 42 JEWELLERY', 'BDT', 11, NULL, 0, NULL, '2026-05-03 19:02:44', '2026-05-03 19:02:44', NULL, 1, 0, NULL, NULL),
(27, 1, 1, 0, NULL, 'USL', 'unfix_sale', 2, '2026-05-03', 49920, 0, 0, NULL, 49920, 'PKT NO 76  CHAINE', 'BDT', 11, 11, 0, NULL, '2026-05-03 19:03:25', '2026-05-03 20:00:01', NULL, 1, 0, NULL, NULL),
(28, 1, 1, 0, NULL, 'FSL', 'fix_sale', 1, '2026-05-03', 2871890, 0, 0, NULL, 2871890, '@ 210400 ( 4615 - CHAINE )', 'BDT', 11, 11, 0, NULL, '2026-05-03 19:15:29', '2026-05-03 19:16:27', NULL, 1, 0, NULL, NULL),
(29, 1, 1, 0, NULL, 'USL', 'unfix_sale', 1, '2026-05-04', 50250, 0, 0, NULL, 50250, 'RECEIVED FROM SAMIM DHK PKT NO 43', 'AED', 11, NULL, 0, NULL, '2026-05-04 18:40:15', '2026-05-04 18:40:15', NULL, 1, 0, NULL, NULL),
(30, 1, 1, 0, NULL, 'USL', 'unfix_sale', 1, '2026-05-04', 50300, 0, 0, NULL, 50300, 'RECEIVED FROM MANNAN DHK PKT NO 48', 'AED', 11, NULL, 0, NULL, '2026-05-04 18:41:51', '2026-05-04 18:41:51', NULL, 1, 0, NULL, NULL),
(31, 1, 1, 0, NULL, 'USL', 'unfix_sale', 1, '2026-05-04', 50050, 0, 0, NULL, 50050, 'RECEIVED FROM AHAED PKT NO 47 CTG', 'AED', 11, NULL, 0, NULL, '2026-05-04 18:43:14', '2026-05-04 18:43:14', NULL, 1, 0, NULL, NULL),
(32, 1, 1, 0, NULL, 'USL', 'unfix_sale', 1, '2026-05-04', 50150, 0, 0, NULL, 50150, 'RECEIVED FROM AHAED PKT NO 82 CTG', 'AED', 11, NULL, 0, NULL, '2026-05-04 18:43:58', '2026-05-04 18:43:58', NULL, 1, 0, NULL, NULL),
(33, 1, 1, 0, NULL, 'USL', 'unfix_sale', 1, '2026-05-04', 50050, 0, 0, NULL, 50050, 'RECEIVED FROM AMINUL PKT NO 46 CTG', 'AED', 11, NULL, 0, NULL, '2026-05-04 18:45:09', '2026-05-04 18:45:09', NULL, 1, 0, NULL, NULL),
(34, 1, 1, 0, NULL, 'USL', 'unfix_sale', 1, '2026-05-04', 50150, 0, 0, NULL, 50150, 'RECEIVED FROM AMINUL PKT NO 45 CTG', 'AED', 11, NULL, 0, NULL, '2026-05-04 18:45:53', '2026-05-04 18:45:53', NULL, 1, 0, NULL, NULL),
(35, 1, 1, 0, NULL, 'FSL', 'fix_sale', 1, '2026-05-04', 3153350, 0, 0, NULL, 3153350, '= 24.96+23.98+117.81+7.98=174.73 FIXED 210500 BDT', 'BDT', 11, NULL, 0, NULL, '2026-05-04 18:58:08', '2026-05-04 18:58:08', NULL, 1, 0, NULL, NULL),
(36, 1, 1, 0, NULL, 'FSL', 'fix_sale', 1, '2026-05-04', 1774480, 0, 0, NULL, 1774480, '= FIXED 206500 CHAINE\n', 'BDT', 11, NULL, 0, NULL, '2026-05-04 19:01:39', '2026-05-04 19:01:39', NULL, 1, 0, NULL, NULL),
(37, 1, 1, 0, NULL, 'FSL', 'fix_sale', 2, '2026-05-04', 1801810, 0, 0, NULL, 1801810, '= FIXED 210500 CHAINE', 'BDT', 11, NULL, 0, NULL, '2026-05-04 19:22:16', '2026-05-04 19:22:16', NULL, 1, 0, NULL, NULL),
(38, 1, 1, 0, NULL, 'FSL', 'fix_sale', 2, '2026-05-04', 1843230, 0, 0, NULL, 1843230, '= FIXED 213500 BDT JEWELLERY', 'BDT', 11, 11, 0, NULL, '2026-05-04 19:25:13', '2026-05-04 19:26:50', NULL, 1, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `vatPercentage` float DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `itemType` varchar(255) DEFAULT NULL,
  `purity` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `businessId`, `code`, `name`, `categoryId`, `isActive`, `createdAt`, `updatedAt`, `vatPercentage`, `unit`, `itemType`, `purity`) VALUES
(14, 1, NULL, 'Gold-999', 1, 1, '2026-04-03 13:42:04', '2026-04-03 13:42:04', 0, 'Gram', NULL, NULL),
(17, 1, NULL, 'Gold-995', 1, 1, '2026-04-28 05:26:49', '2026-04-28 05:26:49', 0, 'Gram', NULL, NULL),
(18, 1, NULL, 'Gold-920', 1, 1, '2026-04-28 05:27:04', '2026-04-28 05:27:04', 0, 'Gram', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ledgers`
--

CREATE TABLE `ledgers` (
  `id` int(11) NOT NULL,
  `businessId` int(11) DEFAULT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `transactionType` varchar(50) NOT NULL,
  `partyId` int(11) NOT NULL,
  `date` date NOT NULL,
  `invoiceId` int(11) DEFAULT NULL,
  `paymentId` int(11) DEFAULT NULL,
  `stockId` int(11) DEFAULT NULL,
  `bankId` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `debit` decimal(12,2) DEFAULT 0.00,
  `credit` decimal(12,2) DEFAULT 0.00,
  `debitQty` float DEFAULT 0,
  `creditQty` float DEFAULT 0,
  `balance` decimal(12,2) DEFAULT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT 0,
  `deletedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `system` int(11) NOT NULL DEFAULT 1,
  `stockCurrency` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `ledgers`
--

INSERT INTO `ledgers` (`id`, `businessId`, `categoryId`, `transactionType`, `partyId`, `date`, `invoiceId`, `paymentId`, `stockId`, `bankId`, `description`, `currency`, `debit`, `credit`, `debitQty`, `creditQty`, `balance`, `createdBy`, `updatedBy`, `isDeleted`, `deletedBy`, `createdAt`, `updatedAt`, `system`, `stockCurrency`) VALUES
(1, 1, NULL, 'receivable', 2, '2026-04-27', NULL, 1, NULL, NULL, 'OPENING BALANCE', 'BDT', 9561265.00, 0.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-04-29 07:04:05', '2026-04-29 07:04:05', 1, NULL),
(2, 1, NULL, 'payable', 2, '2026-04-28', NULL, 2, NULL, NULL, 'PAID SAHAZAD 20 LAC 28/04', 'BDT', 0.00, 2000000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-04-30 19:03:00', '2026-04-30 19:03:00', 1, NULL),
(3, 1, NULL, 'payable', 2, '2026-04-30', NULL, 3, NULL, NULL, 'PAID SAHAZAD 11 LAC 30/04', 'BDT', 0.00, 1100000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-04-30 19:06:14', '2026-04-30 19:06:14', 1, NULL),
(4, 1, NULL, 'payable', 1, '2026-04-26', NULL, 4, NULL, NULL, 'OPENING BALANCE', 'BDT', 0.00, 156115.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-04-30 19:09:15', '2026-04-30 19:09:15', 1, NULL),
(5, 1, NULL, 'receivable', 1, '2026-04-28', NULL, 5, NULL, NULL, 'RECEIVED FROM SHOBUJ  20 LAC', 'BDT', 2000000.00, 0.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-04-30 19:10:41', '2026-04-30 19:10:41', 1, NULL),
(6, 1, 1, 'unfix_purchase', 26, '2026-04-20', 2, NULL, NULL, NULL, 'Gold-920 x5482.42 @607.67<br />Note: USD 5150 $', 'AED', 0.00, 0.00, 5482.42, 0, NULL, 11, NULL, 0, NULL, '2026-04-30 19:21:18', '2026-04-30 19:21:18', 1, 'Gold-920'),
(15, 1, NULL, 'receivable', 1, '2026-04-30', NULL, 6, NULL, NULL, 'RECEIVED FROM SHOBUJ 11 LAC 30.04', 'BDT', 1100000.00, 0.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-04-30 20:34:35', '2026-04-30 20:34:35', 1, NULL),
(16, 1, 1, 'unfix_sale', 1, '2026-04-30', 7, NULL, NULL, NULL, 'Gold-920 x99.28 @500<br />Note: GOLD RECEIVED PKT 21\n', 'BDT', 0.00, 0.00, 99.28, 0, NULL, 11, NULL, 0, NULL, '2026-05-01 17:18:39', '2026-05-01 17:18:39', 1, 'Gold-920'),
(17, 1, 1, 'unfix_sale', 1, '2026-04-30', 8, NULL, NULL, NULL, 'Gold-920 x99.72 @509', 'BDT', 0.00, 0.00, 99.72, 0, NULL, 11, NULL, 0, NULL, '2026-05-01 17:19:43', '2026-05-01 17:19:43', 1, 'Gold-920'),
(18, 1, 1, 'fix_sale', 1, '2026-04-30', 9, NULL, NULL, NULL, 'Gold-920 x99.28 @18252.75<br />Note: @212900 BDT', 'BDT', 1812133.02, 0.00, 0, 99.28, NULL, 11, NULL, 0, NULL, '2026-05-01 17:23:49', '2026-05-01 17:23:49', 1, 'Gold-920'),
(19, 1, 1, 'fix_sale', 1, '2026-04-30', 10, NULL, NULL, NULL, 'Gold-920 x99.72 @17901.2<br />Note: @ 208800 BDT', 'BDT', 1785107.66, 0.00, 0, 99.72, NULL, 11, NULL, 0, NULL, '2026-05-01 17:24:53', '2026-05-01 17:24:53', 1, 'Gold-920'),
(20, 1, NULL, 'receivable', 3, '2026-05-01', NULL, 7, NULL, NULL, 'OPENING BALANCE', 'BDT', 57200.00, 0.00, 0, 0, NULL, 11, 11, 0, NULL, '2026-05-01 17:34:59', '2026-05-01 17:37:49', 1, NULL),
(21, 1, 1, 'unfix_sale', 3, '2026-05-01', 11, NULL, NULL, NULL, 'Gold-920 x40.84 @600<br />Note: 40.84/208000\n', 'BDT', 0.00, 0.00, 40.84, 0, NULL, 11, NULL, 0, NULL, '2026-05-01 17:36:01', '2026-05-01 17:36:01', 1, 'Gold-920'),
(22, 1, 1, 'fix_sale', 3, '2026-05-01', 12, NULL, NULL, NULL, 'Gold-920 x40.84 @17830.56<br />Note: 40.84/208000\n', 'BDT', 728200.07, 0.00, 0, 40.84, NULL, 11, NULL, 0, NULL, '2026-05-01 17:36:56', '2026-05-01 17:36:56', 1, 'Gold-920'),
(23, 1, NULL, 'payable', 3, '2026-05-01', NULL, 8, NULL, NULL, 'PAID TO AHAED CASH', 'BDT', 0.00, 100000.00, 0, 0, NULL, 11, 11, 0, NULL, '2026-05-01 17:42:33', '2026-05-01 17:43:24', 1, NULL),
(24, 1, NULL, 'receivable', 11, '2026-05-01', NULL, 9, NULL, NULL, 'RECEIVED FROM RUDRO', 'BDT', 100000.00, 0.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-01 17:44:30', '2026-05-01 17:44:30', 1, NULL),
(25, 1, NULL, 'payable', 11, '2026-05-01', NULL, 10, NULL, NULL, 'AS MONTHLY RENT', 'BDT', 0.00, 15000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-01 18:03:30', '2026-05-01 18:03:30', 1, NULL),
(26, 1, NULL, 'payable', 1, '2026-05-01', NULL, 11, NULL, NULL, 'DH 100000 R-34.50 = 34,5500  N 671 30/04', 'BDT', 0.00, 3450000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-01 18:21:51', '2026-05-01 18:21:51', 1, NULL),
(27, 1, NULL, 'payable', 1, '2026-05-01', NULL, 12, NULL, NULL, 'COMMISSION PKT NO 21 ND 34', 'BDT', 0.00, 1600.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-01 18:22:45', '2026-05-01 18:22:45', 1, NULL),
(28, 1, NULL, 'payable', 1, '2026-05-01', NULL, 13, NULL, NULL, 'DH 100000 R-34.45 = 34,45000  N 208 01/05 ', 'BDT', 0.00, 3445000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-01 18:27:50', '2026-05-01 18:27:50', 1, NULL),
(29, 1, NULL, 'payable', 1, '2026-05-01', NULL, 14, NULL, NULL, 'DH 150000 R-34.50 = 51.75000 N 421 01/05 ', 'BDT', 0.00, 5175000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-01 18:29:13', '2026-05-01 18:29:13', 1, NULL),
(32, 1, 1, 'unfix_purchase', 6, '2026-05-01', 15, NULL, NULL, NULL, 'Gold-920 x202.4 @500<br />Note: MC 2190', 'AED', 0.00, 0.00, 202.4, 0, NULL, 11, NULL, 0, NULL, '2026-05-01 19:14:42', '2026-05-01 19:14:42', 1, 'Gold-920'),
(33, 1, 1, 'unfix_purchase', 27, '2026-05-01', 16, NULL, NULL, NULL, 'Gold-920 x111.86 @500<br />Note: MC 1245', 'AED', 0.00, 0.00, 111.86, 0, NULL, 11, NULL, 0, NULL, '2026-05-01 19:18:39', '2026-05-01 19:18:39', 1, 'Gold-920'),
(36, 1, 1, 'unfix_sale', 28, '2026-05-02', 18, NULL, NULL, NULL, 'Gold-920 x0.5 @500', 'AED', 0.00, 0.00, 0.5, 0, NULL, 11, NULL, 0, NULL, '2026-05-02 07:30:35', '2026-05-02 07:30:35', 1, 'Gold-920'),
(37, 1, 1, 'fix_sale', 28, '2026-05-02', 19, NULL, NULL, NULL, 'Gold-920 x0.5 @17150', 'BDT', 8575.00, 0.00, 0, 0.5, NULL, 11, NULL, 0, NULL, '2026-05-02 07:40:55', '2026-05-02 07:40:55', 1, 'Gold-920'),
(38, 1, NULL, 'payable', 1, '2026-05-02', NULL, 15, NULL, NULL, 'DH 200000 R-34.45 = 68,90000 N 370 02/05 ', 'BDT', 0.00, 6890000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-02 19:16:10', '2026-05-02 19:16:10', 1, NULL),
(42, 1, 1, 'unfix_sale', 1, '2026-05-01', 14, NULL, NULL, NULL, 'Gold-920 x0 @499.99<br />Note: TRANSFER TO SHOBUJ 32.84', 'AED', 0.00, 0.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-02 19:46:46', '2026-05-02 19:46:46', 1, 'Gold-920'),
(46, 1, NULL, 'receivable', 17, '2026-05-03', NULL, 16, NULL, NULL, 'RIFAT 19.75/220000', 'BDT', 375900.00, 0.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-02 20:17:46', '2026-05-02 20:17:46', 1, NULL),
(47, 1, NULL, 'payable', 17, '2026-05-03', NULL, 17, NULL, NULL, 'RECEIVED FROM RIFAT', 'BDT', 0.00, 200000.00, 0, 0, NULL, 11, 11, 0, NULL, '2026-05-02 20:18:45', '2026-05-02 20:25:46', 1, NULL),
(48, 1, NULL, 'payable', 17, '2026-05-03', NULL, 18, NULL, NULL, 'RECEIVED FROM RIFAT', 'BDT', 0.00, 100000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-02 20:19:14', '2026-05-02 20:19:14', 1, NULL),
(49, 1, 1, 'unfix_purchase', 26, '2026-05-02', 22, NULL, NULL, NULL, 'Gold-920 x128.27 @500<br />Note: 11.61 + 11.65 + 64.74 + +8.94 + 31.33= 128.27  AV PUR 215471.73 TOTAL BDT 2,369,561.04\n\n', 'BDT', 0.00, 0.00, 128.27, 0, NULL, 11, NULL, 0, NULL, '2026-05-02 20:29:04', '2026-05-02 20:29:04', 1, 'Gold-920'),
(50, 1, 1, 'unfix_sale', 30, '2026-05-03', 23, NULL, NULL, NULL, 'Gold-920 x128.27 @500<br />Note: Gold-920 x128.27 @500<br />Note: 11.61 + 11.65 + 64.74 + +8.94 + 31.33= 128.27 AV PUR 215471.73 TOTAL BDT 2,369,561.04\n', 'AED', 0.00, 0.00, 128.27, 0, NULL, 11, NULL, 0, NULL, '2026-05-02 20:31:31', '2026-05-02 20:31:31', 1, 'Gold-920'),
(51, 1, 1, 'unfix_sale', 2, '2026-05-02', 21, NULL, NULL, NULL, 'Gold-920 x32.46 @499.99<br />Note: RECEIVED FROM SAHAZAD', 'BDT', 0.00, 0.00, 32.46, 0, NULL, 11, NULL, 0, NULL, '2026-05-03 18:44:58', '2026-05-03 18:44:58', 1, 'Gold-920'),
(53, 1, 1, 'unfix_sale', 7, '2026-05-01', 13, NULL, NULL, NULL, 'Gold-920 x4528.06 @499.99', 'AED', 0.00, 0.00, 4528.06, 0, NULL, 11, NULL, 0, NULL, '2026-05-03 18:53:49', '2026-05-03 18:53:49', 1, 'Gold-920'),
(56, 1, 1, 'unfix_sale', 1, '2026-05-03', 24, NULL, NULL, NULL, 'Gold-920 x98.3 @500<br />Note: PKT NO 77 CHAINE', 'BDT', 0.00, 0.00, 98.3, 0, NULL, 11, NULL, 0, NULL, '2026-05-03 18:58:36', '2026-05-03 18:58:36', 1, 'Gold-920'),
(57, 1, 1, 'unfix_sale', 1, '2026-05-03', 25, NULL, NULL, NULL, 'Gold-920 x94.81 @500<br />Note: PKT NO 83 CHAINE SOECIAL', 'BDT', 0.00, 0.00, 94.81, 0, NULL, 11, NULL, 0, NULL, '2026-05-03 18:58:52', '2026-05-03 18:58:52', 1, 'Gold-920'),
(58, 1, 1, 'unfix_sale', 2, '2026-05-03', 26, NULL, NULL, NULL, 'Gold-920 x100.7 @500<br />Note: PKT NO 42 JEWELLERY', 'BDT', 0.00, 0.00, 100.7, 0, NULL, 11, NULL, 0, NULL, '2026-05-03 19:02:44', '2026-05-03 19:02:44', 1, 'Gold-920'),
(61, 1, 1, 'fix_sale', 1, '2026-05-03', 28, NULL, NULL, NULL, 'Gold-920 x159.21 @18038.4<br />Note: @ 210400 ( 4615 - CHAINE )', 'BDT', 2871890.00, 0.00, 0, 159.21, NULL, 11, NULL, 0, NULL, '2026-05-03 19:16:27', '2026-05-03 19:16:27', 1, 'Gold-920'),
(62, 1, NULL, 'payable', 1, '2026-05-03', NULL, 19, NULL, NULL, 'COMMISSION PKT NO 42 SHOBUJ/PKT NO 77/PKT NO 83', 'BDT', 0.00, 2400.00, 0, 0, NULL, 11, 11, 0, NULL, '2026-05-03 19:18:32', '2026-05-03 19:21:24', 1, NULL),
(63, 1, NULL, 'payable', 2, '2026-05-03', NULL, 20, NULL, NULL, 'PAID TO SAHAZAD 20 LAC', 'BDT', 0.00, 2000000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-03 19:33:59', '2026-05-03 19:33:59', 1, NULL),
(65, 1, NULL, 'receivable', 1, '2026-05-03', NULL, 22, NULL, NULL, 'REC FROM SHOBUJ 20 LAC 03/05/26', 'BDT', 2000000.00, 0.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-03 19:44:17', '2026-05-03 19:44:17', 1, NULL),
(66, 1, NULL, 'payable', 1, '2026-05-03', NULL, 23, NULL, NULL, 'PAID AZAD BHI', 'BDT', 0.00, 723800.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-03 19:45:18', '2026-05-03 19:45:18', 1, NULL),
(67, 1, 1, 'unfix_sale', 2, '2026-05-03', 27, NULL, NULL, NULL, 'Gold-920 x99.84 @500<br />Note: PKT NO 76  CHAINE', 'BDT', 0.00, 0.00, 99.84, 0, NULL, 11, NULL, 0, NULL, '2026-05-03 20:00:01', '2026-05-03 20:00:01', 1, 'Gold-920'),
(68, 1, NULL, 'payable', 31, '2026-05-04', NULL, 24, NULL, NULL, 'OPENING BALANCE (100000 x 34.50)', 'BDT', 0.00, 3450000.00, 0, 0, NULL, 11, 11, 0, NULL, '2026-05-04 15:57:01', '2026-05-04 16:00:48', 1, NULL),
(69, 1, NULL, 'deposit', 31, '2026-05-04', NULL, 25, NULL, 1, 'ADVANCE PAYMENT FOR GOLD', 'AED', 0.00, 7000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 16:00:03', '2026-05-04 16:00:03', 1, NULL),
(70, 1, 1, 'unfix_sale', 4, '2026-05-01', 17, NULL, NULL, NULL, 'Gold-920 x0 @600', 'AED', 0.00, 0.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 18:28:49', '2026-05-04 18:28:49', 1, 'Gold-920'),
(71, 1, 1, 'unfix_sale', 29, '2026-05-02', 20, NULL, NULL, NULL, 'Gold-920 x0 @500', 'BDT', 0.00, 0.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 18:37:05', '2026-05-04 18:37:05', 1, 'Gold-920'),
(72, 1, 1, 'unfix_sale', 1, '2026-05-04', 29, NULL, NULL, NULL, 'Gold-920 x100.5 @500<br />Note: RECEIVED FROM SAMIM DHK PKT NO 43', 'AED', 0.00, 0.00, 100.5, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 18:40:15', '2026-05-04 18:40:15', 1, 'Gold-920'),
(73, 1, 1, 'unfix_sale', 1, '2026-05-04', 30, NULL, NULL, NULL, 'Gold-920 x100.6 @500<br />Note: RECEIVED FROM MANNAN DHK PKT NO 48', 'AED', 0.00, 0.00, 100.6, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 18:41:51', '2026-05-04 18:41:51', 1, 'Gold-920'),
(74, 1, 1, 'unfix_sale', 1, '2026-05-04', 31, NULL, NULL, NULL, 'Gold-920 x100.1 @500<br />Note: RECEIVED FROM AHAED PKT NO 47 CTG', 'AED', 0.00, 0.00, 100.1, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 18:43:14', '2026-05-04 18:43:14', 1, 'Gold-920'),
(75, 1, 1, 'unfix_sale', 1, '2026-05-04', 32, NULL, NULL, NULL, 'Gold-920 x100.3 @500<br />Note: RECEIVED FROM AHAED PKT NO 82 CTG', 'AED', 0.00, 0.00, 100.3, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 18:43:58', '2026-05-04 18:43:58', 1, 'Gold-920'),
(76, 1, 1, 'unfix_sale', 1, '2026-05-04', 33, NULL, NULL, NULL, 'Gold-920 x100.1 @500<br />Note: RECEIVED FROM AMINUL PKT NO 46 CTG', 'AED', 0.00, 0.00, 100.1, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 18:45:09', '2026-05-04 18:45:09', 1, 'Gold-920'),
(77, 1, 1, 'unfix_sale', 1, '2026-05-04', 34, NULL, NULL, NULL, 'Gold-920 x100.3 @500<br />Note: RECEIVED FROM AMINUL PKT NO 45 CTG', 'AED', 0.00, 0.00, 100.3, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 18:45:53', '2026-05-04 18:45:53', 1, 'Gold-920'),
(78, 1, NULL, 'payable', 1, '2026-05-04', NULL, 26, NULL, NULL, 'PACKET COMMISSION 34/48/47/82/46/45', 'BDT', 0.00, 4800.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 18:47:46', '2026-05-04 18:47:46', 1, NULL),
(79, 1, 1, 'fix_sale', 1, '2026-05-04', 35, NULL, NULL, NULL, 'Gold-920 x174.73 @18046.98<br />Note: = 24.96+23.98+117.81+7.98=174.73 FIXED 210500 BDT', 'BDT', 3153348.82, 0.00, 0, 174.73, NULL, 11, NULL, 0, NULL, '2026-05-04 18:58:08', '2026-05-04 18:58:08', 1, 'Gold-920'),
(80, 1, 1, 'fix_sale', 1, '2026-05-04', 36, NULL, NULL, NULL, 'Gold-920 x100.23 @17704.05<br />Note: = FIXED 206500 CHAINE\n', 'BDT', 1774476.93, 0.00, 0, 100.23, NULL, 11, NULL, 0, NULL, '2026-05-04 19:01:39', '2026-05-04 19:01:39', 1, 'Gold-920'),
(81, 1, NULL, 'receivable', 1, '2026-05-04', NULL, 27, NULL, NULL, 'PAID 5 LAC TO SAGOR BHI UCB AHAED', 'BDT', 500000.00, 0.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:04:01', '2026-05-04 19:04:01', 1, NULL),
(82, 1, NULL, 'payable', 1, '2026-05-04', NULL, 28, NULL, NULL, 'PRICE ADJUST 59.94/500=2500 BDT', 'BDT', 0.00, 2500.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:06:58', '2026-05-04 19:06:58', 1, NULL),
(83, 1, 1, 'fix_sale', 2, '2026-05-04', 37, NULL, NULL, NULL, 'Gold-920 x99.84 @18046.98<br />Note: = FIXED 210500 CHAINE', 'BDT', 1801810.48, 0.00, 0, 99.84, NULL, 11, NULL, 0, NULL, '2026-05-04 19:22:16', '2026-05-04 19:22:16', 1, 'Gold-920'),
(85, 1, 1, 'fix_sale', 2, '2026-05-04', 38, NULL, NULL, NULL, 'Gold-920 x100.7 @18304.18<br />Note: = FIXED 213500 BDT JEWELLERY', 'BDT', 1843230.93, 0.00, 0, 100.7, NULL, 11, NULL, 0, NULL, '2026-05-04 19:26:50', '2026-05-04 19:26:50', 1, 'Gold-920'),
(86, 1, NULL, 'payable', 3, '2026-05-04', NULL, 29, NULL, NULL, 'PAYMENT TO AHAED - CASH ', 'BDT', 0.00, 450000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:35:33', '2026-05-04 19:35:33', 1, NULL),
(88, 1, NULL, 'receivable', 11, '2026-05-04', NULL, 31, NULL, NULL, 'RECEIVED FROM RUDRO', 'BDT', 450000.00, 0.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:39:30', '2026-05-04 19:39:30', 1, NULL),
(89, 1, NULL, 'payable', 11, '2026-05-04', NULL, 32, NULL, NULL, 'PAY TO SORNA FOR JAVED', 'BDT', 0.00, 20000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:41:16', '2026-05-04 19:41:16', 1, NULL),
(90, 1, NULL, 'payable', 11, '2026-05-04', NULL, 33, NULL, NULL, 'PAY TO SORNA', 'BDT', 0.00, 5000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:41:58', '2026-05-04 19:41:58', 1, NULL),
(91, 1, NULL, 'payable', 11, '2026-05-04', NULL, 34, NULL, NULL, 'PAY SAGOR BHI UCB', 'BDT', 0.00, 500000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:42:25', '2026-05-04 19:42:25', 1, NULL),
(92, 1, NULL, 'payable', 32, '2026-04-28', NULL, 35, NULL, NULL, 'CTG TO COMILLA', 'BDT', 0.00, 3000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:47:31', '2026-05-04 19:47:31', 1, NULL),
(93, 1, NULL, 'payable', 32, '2026-04-28', NULL, 36, NULL, NULL, 'CTG TO COMILLA', 'BDT', 0.00, 3000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:48:13', '2026-05-04 19:48:13', 1, NULL),
(94, 1, NULL, 'payable', 32, '2026-04-29', NULL, 37, NULL, NULL, 'FENI TO COMILLA', 'BDT', 0.00, 1200.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:48:43', '2026-05-04 19:48:43', 1, NULL),
(95, 1, NULL, 'payable', 32, '2026-05-02', NULL, 38, NULL, NULL, 'FENI TO COMILLA', 'BDT', 0.00, 1200.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:49:15', '2026-05-04 19:49:15', 1, NULL),
(96, 1, NULL, 'payable', 32, '2026-05-03', NULL, 39, NULL, NULL, 'FENI TO COMILLA', 'BDT', 0.00, 1200.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:50:07', '2026-05-04 19:50:07', 1, NULL),
(97, 1, NULL, 'payable', 32, '2026-05-04', NULL, 40, NULL, NULL, 'DHK TO COMILLA', 'BDT', 0.00, 3000.00, 0, 0, NULL, 11, NULL, 0, NULL, '2026-05-04 19:50:39', '2026-05-04 19:50:39', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `parties`
--

CREATE TABLE `parties` (
  `id` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `countryCode` varchar(255) DEFAULT NULL,
  `phoneCode` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `nationalId` varchar(255) DEFAULT NULL,
  `tradeLicense` varchar(255) DEFAULT NULL,
  `trnNo` varchar(255) DEFAULT NULL,
  `openingBalance` float NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `parties`
--

INSERT INTO `parties` (`id`, `businessId`, `type`, `name`, `company`, `email`, `countryCode`, `phoneCode`, `phoneNumber`, `address`, `city`, `country`, `nationalId`, `tradeLicense`, `trnNo`, `openingBalance`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'party', 'Mr. Sahazada', NULL, 'nazim.sedarglobal@yahoo.com', 'BD', '+880', '172 272 2615', 'COMILLA', 'COMILLA', 'BANGLADESH', '', 'N/A', 'N/A', 0, 1, '2026-03-07 19:00:20', '2026-03-07 19:00:20'),
(2, 1, 'party', 'Mr.Shobuj', NULL, 'nazim.sedarglobal@yahoo.com', 'BD', '+880', '185 983 4468', 'COMILLA', 'COMILLA', 'BANGLADESH', '', 'N/A', 'N/A', 0, 1, '2026-03-07 19:02:32', '2026-03-07 19:02:32'),
(3, 1, 'party', 'KHOKO JEWELLERY', NULL, 'nazim.sedarglobal@yahoo.com', 'BD', '+880', '162 163 4050', 'FENI', 'FENI', 'BANGLADESH', '', 'N/A', 'N/A', 0, 1, '2026-03-07 19:09:16', '2026-03-07 19:09:16'),
(4, 1, 'party', 'Mr.Junaid (GOLD)', NULL, 'nazim.sedarglobal@yahoo.com', 'BD', '+971', '50 843 6840', 'CHITTAGONG', 'CHITTAGONG', 'BANGLADESH', '', 'N/A', 'N/A', 0, 1, '2026-03-07 19:13:11', '2026-05-02 19:39:21'),
(5, 1, 'party', 'Mr Sahin ', NULL, 'nazim.sedarglobal@yahoo.com', 'BD', '+880', '182 464 1842', 'FENI', 'FENI', 'BANGLADESH', '', 'N/A', 'N/A', 0, 1, '2026-03-07 19:16:43', '2026-03-07 19:16:43'),
(6, 1, 'party', 'DIAMOND SWISS JEWELLERY', NULL, 'nazim.sedarglobal@yahoo.com', 'AE', '+971', '52 392 2323', 'DUBAI ,GOLD SOUQ', 'DUBAI', 'UNITED ARAB EMIRATES', '', 'N/A', 'N/A', 0, 1, '2026-03-07 19:21:01', '2026-03-07 19:21:01'),
(7, 1, 'party', 'NRI JEWELLERY', NULL, '', 'AE', '+971', '56 162 2555', 'DUBAI GOLD SOUQ', 'DUBAI', 'UNITED ARAB EMIRATES', '', 'N/A', 'N/A', 0, 1, '2026-03-07 19:22:36', '2026-03-07 19:22:36'),
(8, 1, 'party', 'A/C NO. N330 FIX - GRAMEEN JEWELLERY', NULL, 'nazim.sedarglobal@yahoo.com', 'AE', '+971', '52 683 4095', 'DUBAI ,GOLD SOUQ', 'DUBAI', 'UNITED ARAB EMIRATES', '', 'N/A', 'N/A', 0, 1, '2026-03-07 19:24:59', '2026-03-07 19:34:35'),
(9, 1, 'party', 'APAN JEWELLEY', NULL, 'nazim.sedarglobal@yahoo.com', 'AE', '+971', '50 288 7957', 'DUBAI ,GOLD SOUQ', 'DUBAI', 'UNITED ARAB EMIRATES', '', 'N/A', 'N/A', 0, 1, '2026-03-07 19:26:00', '2026-03-07 19:26:00'),
(10, 1, 'party', 'A/C NO. N331 UNFIX - GRAMEEN JEWELLERY', NULL, 'nazim.sedarglobal@yahoo.com', 'AE', '+971', '52 683 4095', 'DUBAI ,GOLD SOUQ', 'DUBAI', 'UNITED ARAB EMIRATES', '', 'N/A', 'N/A', 0, 1, '2026-03-07 19:37:20', '2026-03-07 19:37:20'),
(11, 1, 'party', 'Mr. Ahaed', NULL, '', 'BD', '+880', '1322-306752', 'FENI', 'FENI', 'BANGLADESH', '', '', '', 0, 1, '2026-03-20 16:29:39', '2026-03-20 16:29:39'),
(12, 1, 'party', 'Mr khalil', NULL, '', 'AE', '+971', '50 460 1714', 'DUBAI', 'DUBAI', 'UAE', '', '', '', 171000, 1, '2026-03-20 16:43:54', '2026-03-20 16:43:54'),
(13, 1, 'party', 'Mr Aminul', NULL, '', 'BD', '+880', '0 1634-644845', 'FENI', 'FENI', 'Bangladesh', '', '', '', 0, 1, '2026-03-20 16:47:51', '2026-03-20 16:47:51'),
(14, 1, 'party', 'BANK : ADCB', NULL, '', 'AE', '+971', '0551464220', 'FENI', 'FENI', 'Bangladesh', '', '', '', 0, 1, '2026-03-20 17:05:07', '2026-03-20 17:05:07'),
(15, 1, 'party', 'Mr.Arafath', NULL, '', 'AE', '+971', '50 750 4538', 'DUBAI', 'DUBAI', 'United Arab Emirates', '', '', '', 68400, 1, '2026-03-21 19:57:00', '2026-03-21 19:57:00'),
(16, 1, 'party', 'BANK : MERCANTILE', NULL, '', 'BD', '+880', '01851557244', 'FENI', 'FENI', 'Bangladesh', '', '', '', 0, 1, '2026-03-21 20:01:57', '2026-03-21 20:01:57'),
(17, 1, 'party', 'Ms. Sorna ', NULL, '', 'BD', '+880', '1860-793739', 'FENI', 'FENI', 'Bangladesh', '', '', '', 0, 1, '2026-03-21 20:07:29', '2026-03-21 20:07:29'),
(18, 1, 'party', 'BANK : AIBL', NULL, '', 'BD', '+880', '01851557244', 'FENI', 'FENI', 'Bangladesh', '', '', '', 0, 1, '2026-03-21 20:11:00', '2026-03-21 20:11:00'),
(19, 1, 'party', 'MAKING CHARGE', NULL, '', 'AE', '+971', '551464220', 'DUBAI', 'DUBAI', 'United Arab Emirates', '', '', '', 0, 1, '2026-03-21 20:15:25', '2026-03-21 20:15:25'),
(20, 1, 'party', 'CARRING', NULL, '', 'AE', '+971', '551464220', 'DUBAI', 'D', 'United Arab Emirates', '', '', '', 0, 1, '2026-03-21 20:16:11', '2026-03-21 20:16:11'),
(21, 1, 'party', 'Mr. Suhin', NULL, '', 'AE', '+971', '050 361 5303', 'RAS AL KHAMAH', 'RAK', 'United Arab Emirates', '', '', '', 0, 1, '2026-03-21 20:17:46', '2026-03-21 20:17:46'),
(22, 1, 'party', 'SHM JEWELLEY (HAQUE)', NULL, '', 'AE', '+971', '55 762 3234', 'DUBAI', 'DUBAI', 'United Arab Emirates', '', '', '', 0, 1, '2026-03-21 20:18:54', '2026-03-21 20:19:43'),
(23, 1, 'party', 'GOLD 22 K (920)', NULL, '', 'AE', '+971', '551464220', 'DUBAI', 'DUBAI', 'United Arab Emirates', '', '', '', 0, 1, '2026-03-22 09:33:26', '2026-03-22 09:33:26'),
(24, 1, 'party', 'Mr. Kaium', NULL, '', 'AE', '+971', '555279411', 'DUBAI', 'DUBAI', 'United Arab Emirates', '', '', '', 0, 1, '2026-03-29 20:06:28', '2026-03-29 20:06:28'),
(25, 1, 'party', 'Mr OMAIR', NULL, '', 'AE', '+971', '50 363 2245', 'FENI', 'FENI', 'Bangladesh', '', '', '', 0, 1, '2026-04-03 14:24:29', '2026-04-03 14:24:29'),
(26, 1, 'party', 'HOME OF GOLD', NULL, '', 'AE', '+971', '551464220', '', '', '', '', '', '', 0, 1, '2026-04-30 19:20:01', '2026-04-30 19:20:01'),
(27, 1, 'party', 'RICH RING GOLD', NULL, '', 'AE', '+971', '052 962 9599', 'Corner of Delma and Karama Str. (13th and 24th)', '', 'United Arab Emirates', '', '', '', 0, 1, '2026-05-01 19:11:09', '2026-05-01 19:11:09'),
(28, 1, 'party', 'GOLD ADJUST', NULL, '', 'AE', '+971', '551464220', 'FENI', 'FENI', 'Bangladesh', '', '', '', 0, 1, '2026-05-02 07:25:08', '2026-05-02 07:25:08'),
(29, 1, 'party', 'MR.ERSHAD - CHITTAGONG (GOLD)', NULL, '', 'AE', '+971', '50 816 9495', 'Corner of Delma and Karama Str. (13th and 24th)', '', 'United Arab Emirates', '', '', '', 0, 1, '2026-05-02 19:38:40', '2026-05-02 19:38:58'),
(30, 1, 'party', 'CARAT - SCRAP 22K', NULL, '', 'BD', '+880', '01860793739', 'Corner of Delma and Karama Str. (13th and 24th)', '', 'United Arab Emirates', '', '', '', 0, 1, '2026-05-02 19:56:12', '2026-05-02 19:56:12'),
(31, 1, 'party', 'Mr. Sahadat Hossein (Khalu)', NULL, '', 'AE', '+971', '0503735327', 'FENI', 'FENI', 'Bangladesh', '', '', '', 0, 1, '2026-05-04 15:55:20', '2026-05-04 15:55:20'),
(32, 1, 'party', 'MR MANNAN', NULL, '', 'BD', '+880', '01812421448', 'FENI', 'FENI', 'Bangladesh', '', '', '', 0, 1, '2026-05-04 19:45:50', '2026-05-04 19:45:50');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `businessId` int(11) DEFAULT NULL,
  `partyId` int(11) DEFAULT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `containerId` int(11) DEFAULT NULL,
  `prefix` varchar(255) NOT NULL,
  `paymentType` text NOT NULL,
  `invoiceId` int(11) DEFAULT NULL,
  `paymentDate` date DEFAULT NULL,
  `note` text DEFAULT NULL,
  `currency` varchar(255) NOT NULL,
  `amountPaid` decimal(12,2) NOT NULL,
  `paymentMethod` varchar(255) DEFAULT NULL,
  `paymentDetails` text DEFAULT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT 0,
  `deletedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `bankId` int(11) DEFAULT NULL,
  `system` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `businessId`, `partyId`, `categoryId`, `containerId`, `prefix`, `paymentType`, `invoiceId`, `paymentDate`, `note`, `currency`, `amountPaid`, `paymentMethod`, `paymentDetails`, `createdBy`, `updatedBy`, `isDeleted`, `deletedBy`, `createdAt`, `updatedAt`, `bankId`, `system`) VALUES
(1, 1, 2, NULL, NULL, 'REV', 'receivable', NULL, '2026-04-27', 'OPENING BALANCE', 'BDT', 9561265.00, '', NULL, 11, NULL, 0, NULL, '2026-04-29 07:04:05', '2026-04-29 07:04:05', NULL, 1),
(2, 1, 2, NULL, NULL, 'PAY', 'payable', NULL, '2026-04-28', 'PAID SAHAZAD 20 LAC 28/04', 'BDT', 2000000.00, '', NULL, 11, NULL, 0, NULL, '2026-04-30 19:03:00', '2026-04-30 19:03:00', NULL, 1),
(3, 1, 2, NULL, NULL, 'PAY', 'payable', NULL, '2026-04-30', 'PAID SAHAZAD 11 LAC 30/04', 'BDT', 1100000.00, '', NULL, 11, NULL, 0, NULL, '2026-04-30 19:06:14', '2026-04-30 19:06:14', NULL, 1),
(4, 1, 1, NULL, NULL, 'PAY', 'payable', NULL, '2026-04-26', 'OPENING BALANCE', 'BDT', 156115.00, '', NULL, 11, NULL, 0, NULL, '2026-04-30 19:09:15', '2026-04-30 19:09:15', NULL, 1),
(5, 1, 1, NULL, NULL, 'REV', 'receivable', NULL, '2026-04-28', 'RECEIVED FROM SHOBUJ  20 LAC', 'BDT', 2000000.00, '', NULL, 11, NULL, 0, NULL, '2026-04-30 19:10:41', '2026-04-30 19:10:41', NULL, 1),
(6, 1, 1, NULL, NULL, 'REV', 'receivable', NULL, '2026-04-30', 'RECEIVED FROM SHOBUJ 11 LAC 30.04', 'BDT', 1100000.00, '', NULL, 11, NULL, 0, NULL, '2026-04-30 20:34:35', '2026-04-30 20:34:35', NULL, 1),
(7, 1, 3, NULL, NULL, 'REV', 'receivable', NULL, '2026-05-01', 'OPENING BALANCE', 'BDT', 57200.00, '', NULL, 11, 11, 0, NULL, '2026-05-01 17:34:59', '2026-05-01 17:37:49', NULL, 1),
(8, 1, 3, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-01', 'PAID TO AHAED CASH', 'BDT', 100000.00, '', NULL, 11, 11, 0, NULL, '2026-05-01 17:42:33', '2026-05-01 17:43:24', NULL, 1),
(9, 1, 11, NULL, NULL, 'REV', 'receivable', NULL, '2026-05-01', 'RECEIVED FROM RUDRO', 'BDT', 100000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-01 17:44:30', '2026-05-01 17:44:30', NULL, 1),
(10, 1, 11, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-01', 'AS MONTHLY RENT', 'BDT', 15000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-01 18:03:30', '2026-05-01 18:03:30', NULL, 1),
(11, 1, 1, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-01', 'DH 100000 R-34.50 = 34,5500  N 671 30/04', 'BDT', 3450000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-01 18:21:51', '2026-05-01 18:21:51', NULL, 1),
(12, 1, 1, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-01', 'COMMISSION PKT NO 21 ND 34', 'BDT', 1600.00, '', NULL, 11, NULL, 0, NULL, '2026-05-01 18:22:45', '2026-05-01 18:22:45', NULL, 1),
(13, 1, 1, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-01', 'DH 100000 R-34.45 = 34,45000  N 208 01/05 ', 'BDT', 3445000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-01 18:27:50', '2026-05-01 18:27:50', NULL, 1),
(14, 1, 1, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-01', 'DH 150000 R-34.50 = 51.75000 N 421 01/05 ', 'BDT', 5175000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-01 18:29:13', '2026-05-01 18:29:13', NULL, 1),
(15, 1, 1, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-02', 'DH 200000 R-34.45 = 68,90000 N 370 02/05 ', 'BDT', 6890000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-02 19:16:10', '2026-05-02 19:16:10', NULL, 1),
(16, 1, 17, NULL, NULL, 'REV', 'receivable', NULL, '2026-05-03', 'RIFAT 19.75/220000', 'BDT', 375900.00, '', NULL, 11, NULL, 0, NULL, '2026-05-02 20:17:46', '2026-05-02 20:17:46', NULL, 1),
(17, 1, 17, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-03', 'RECEIVED FROM RIFAT', 'BDT', 200000.00, '', NULL, 11, 11, 0, NULL, '2026-05-02 20:18:45', '2026-05-02 20:21:00', NULL, 1),
(18, 1, 17, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-03', 'RECEIVED FROM RIFAT', 'BDT', 100000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-02 20:19:14', '2026-05-02 20:19:14', NULL, 1),
(19, 1, 1, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-03', 'COMMISSION PKT NO 42 SHOBUJ/PKT NO 77/PKT NO 83', 'BDT', 2400.00, '', NULL, 11, 11, 0, NULL, '2026-05-03 19:18:32', '2026-05-03 19:21:24', NULL, 1),
(20, 1, 2, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-03', 'PAID TO SAHAZAD 20 LAC', 'BDT', 2000000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-03 19:33:59', '2026-05-03 19:33:59', NULL, 1),
(22, 1, 1, NULL, NULL, 'REV', 'receivable', NULL, '2026-05-03', 'REC FROM SHOBUJ 20 LAC 03/05/26', 'BDT', 2000000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-03 19:44:17', '2026-05-03 19:44:17', NULL, 1),
(23, 1, 1, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-03', 'PAID AZAD BHI', 'BDT', 723800.00, '', NULL, 11, NULL, 0, NULL, '2026-05-03 19:45:18', '2026-05-03 19:45:18', NULL, 1),
(24, 1, 31, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-04', 'OPENING BALANCE (100000 x 34.50)', 'BDT', 3450000.00, '', '(100000 x 34.50)', 11, 11, 0, NULL, '2026-05-04 15:57:01', '2026-05-04 16:00:48', NULL, 1),
(25, 1, 31, NULL, NULL, 'DEP', 'deposit', NULL, '2026-05-04', 'ADVANCE PAYMENT FOR GOLD', 'AED', 7000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 16:00:03', '2026-05-04 16:00:03', 1, 1),
(26, 1, 1, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-04', 'PACKET COMMISSION 34/48/47/82/46/45', 'BDT', 4800.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 18:47:46', '2026-05-04 18:47:46', NULL, 1),
(27, 1, 1, NULL, NULL, 'REV', 'receivable', NULL, '2026-05-04', 'PAID 5 LAC TO SAGOR BHI UCB AHAED', 'BDT', 500000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:04:01', '2026-05-04 19:04:01', NULL, 1),
(28, 1, 1, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-04', 'PRICE ADJUST 59.94/500=2500 BDT', 'BDT', 2500.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:06:58', '2026-05-04 19:06:58', NULL, 1),
(29, 1, 3, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-04', 'PAYMENT TO AHAED - CASH ', 'BDT', 450000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:35:33', '2026-05-04 19:35:33', NULL, 1),
(31, 1, 11, NULL, NULL, 'REV', 'receivable', NULL, '2026-05-04', 'RECEIVED FROM RUDRO', 'BDT', 450000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:39:30', '2026-05-04 19:39:30', NULL, 1),
(32, 1, 11, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-04', 'PAY TO SORNA FOR JAVED', 'BDT', 20000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:41:16', '2026-05-04 19:41:16', NULL, 1),
(33, 1, 11, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-04', 'PAY TO SORNA', 'BDT', 5000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:41:58', '2026-05-04 19:41:58', NULL, 1),
(34, 1, 11, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-04', 'PAY SAGOR BHI UCB', 'BDT', 500000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:42:25', '2026-05-04 19:42:25', NULL, 1),
(35, 1, 32, NULL, NULL, 'PAY', 'payable', NULL, '2026-04-28', 'CTG TO COMILLA', 'BDT', 3000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:47:31', '2026-05-04 19:47:31', NULL, 1),
(36, 1, 32, NULL, NULL, 'PAY', 'payable', NULL, '2026-04-28', 'CTG TO COMILLA', 'BDT', 3000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:48:13', '2026-05-04 19:48:13', NULL, 1),
(37, 1, 32, NULL, NULL, 'PAY', 'payable', NULL, '2026-04-29', 'FENI TO COMILLA', 'BDT', 1200.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:48:43', '2026-05-04 19:48:43', NULL, 1),
(38, 1, 32, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-02', 'FENI TO COMILLA', 'BDT', 1200.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:49:15', '2026-05-04 19:49:15', NULL, 1),
(39, 1, 32, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-03', 'FENI TO COMILLA', 'BDT', 1200.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:50:07', '2026-05-04 19:50:07', NULL, 1),
(40, 1, 32, NULL, NULL, 'PAY', 'payable', NULL, '2026-05-04', 'DHK TO COMILLA', 'BDT', 3000.00, '', NULL, 11, NULL, 0, NULL, '2026-05-04 19:50:39', '2026-05-04 19:50:39', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `group` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `group`, `name`, `action`, `createdAt`, `updatedAt`) VALUES
(1, 'Dashboard', 'Dashboard Manage', 'manage_dashboard', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(2, 'Role', 'Role Manage', 'manage_roles', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(3, 'Permission', 'Permission Manage', 'manage_permissions', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(4, 'Business', 'Business Manage', 'manage_business', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(5, 'Business', 'Business Create', 'create_business', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(6, 'Business', 'Business Edit', 'edit_business', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(7, 'Business', 'Business View', 'view_business', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(8, 'Business', 'Business Delete', 'delete_business', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(9, 'Category', 'Category Manage', 'manage_category', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(10, 'Category', 'Category Create', 'create_category', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(11, 'Category', 'Category Edit', 'edit_category', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(12, 'Category', 'Category View', 'view_category', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(13, 'Category', 'Category Delete', 'delete_category', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(14, 'Item', 'Item Manage', 'manage_item', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(15, 'Item', 'Item Create', 'create_item', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(16, 'Item', 'Item Edit', 'edit_item', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(17, 'Item', 'Item View', 'view_item', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(18, 'Item', 'Item Delete', 'delete_item', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(19, 'Unit', 'Unit Manage', 'manage_unit', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(20, 'Unit', 'Unit Create', 'create_unit', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(21, 'Unit', 'Unit Edit', 'edit_unit', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(22, 'Unit', 'Unit View', 'view_unit', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(23, 'Unit', 'Unit Delete', 'delete_unit', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(24, 'Account', 'Account Manage', 'manage_account', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(25, 'Account', 'Account Create', 'create_account', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(26, 'Account', 'Account Edit', 'edit_account', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(27, 'Account', 'Account View', 'view_account', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(28, 'Account', 'Account Delete', 'delete_account', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(29, 'Warehouse', 'Warehouse Manage', 'manage_warehouse', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(30, 'Warehouse', 'Warehouse Create', 'create_warehouse', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(31, 'Warehouse', 'Warehouse Edit', 'edit_warehouse', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(32, 'Warehouse', 'Warehouse View', 'view_warehouse', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(33, 'Warehouse', 'Warehouse Delete', 'delete_warehouse', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(34, 'Container', 'Container Manage', 'manage_container', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(35, 'Container', 'Container Create', 'create_container', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(36, 'Container', 'Container Edit', 'edit_container', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(37, 'Container', 'Container View', 'view_container', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(38, 'Container', 'Container Delete', 'delete_container', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(39, 'User', 'User Manage', 'manage_users', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(40, 'User', 'User Create', 'create_users', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(41, 'User', 'User Edit', 'edit_users', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(42, 'User', 'User View', 'view_users', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(43, 'User', 'User Delete', 'delete_users', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(44, 'Profile', 'Profile Manage', 'manage_profile', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(45, 'Profile', 'Profile Edit', 'edit_profile', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(46, 'Profile', 'Profile View', 'view_profile', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(47, 'Party', 'Party Manage', 'manage_party', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(48, 'Party', 'Party Create', 'create_party', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(49, 'Party', 'Party Edit', 'edit_party', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(50, 'Party', 'Party View', 'view_party', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(51, 'Party', 'Party Delete', 'delete_party', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(52, 'Supplier', 'Supplier Manage', 'manage_supplier', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(53, 'Supplier', 'Supplier Create', 'create_supplier', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(54, 'Supplier', 'Supplier Edit', 'edit_supplier', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(55, 'Supplier', 'Supplier View', 'view_supplier', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(56, 'Supplier', 'Supplier Delete', 'delete_supplier', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(57, 'Customer', 'Customer Manage', 'manage_customer', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(58, 'Customer', 'Customer Create', 'create_customer', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(59, 'Customer', 'Customer Edit', 'edit_customer', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(60, 'Customer', 'Customer View', 'view_customer', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(61, 'Customer', 'Customer Delete', 'delete_customer', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(62, 'Invoice', 'Invoice Manage', 'manage_invoice', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(63, 'Invoice', 'Invoice Create', 'create_invoice', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(64, 'Invoice', 'Invoice Edit', 'edit_invoice', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(65, 'Invoice', 'Invoice View', 'view_invoice', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(66, 'Invoice', 'Invoice Delete', 'delete_invoice', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(67, 'Purchase', 'Purchase Manage', 'manage_purchase', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(68, 'Purchase', 'Purchase Create', 'create_purchase', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(69, 'Purchase', 'Purchase Edit', 'edit_purchase', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(70, 'Purchase', 'Purchase View', 'view_purchase', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(71, 'Purchase', 'Purchase Delete', 'delete_purchase', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(72, 'Sale', 'Sale Manage', 'manage_sale', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(73, 'Sale', 'Sale Create', 'create_sale', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(74, 'Sale', 'Sale Edit', 'edit_sale', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(75, 'Sale', 'Sale View', 'view_sale', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(76, 'Sale', 'Sale Delete', 'delete_sale', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(77, 'Payment', 'Payment Manage', 'manage_payment', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(78, 'Payment', 'Payment Create', 'create_payment', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(79, 'Payment', 'Payment Edit', 'edit_payment', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(80, 'Payment', 'Payment View', 'view_payment', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(81, 'Payment', 'Payment Delete', 'delete_payment', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(82, 'Expense', 'Expense Manage', 'manage_expense', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(83, 'Expense', 'Expense Create', 'create_expense', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(84, 'Expense', 'Expense Edit', 'edit_expense', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(85, 'Expense', 'Expense View', 'view_expense', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(86, 'Expense', 'Expense Delete', 'delete_expense', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(87, 'Stock', 'Stock Manage', 'manage_stock', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(88, 'Stock', 'Stock Create', 'create_stock', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(89, 'Stock', 'Stock Edit', 'edit_stock', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(90, 'Stock', 'Stock View', 'view_stock', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(91, 'Stock', 'Stock Delete', 'delete_stock', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(92, 'Ledger', 'Ledger Currency', 'currency_ledger', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(93, 'Ledger', 'Ledger Manage', 'manage_ledger', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(94, 'Ledger', 'Ledger Purchase', 'purchase_ledger', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(95, 'Ledger', 'Ledger Sale', 'sale_ledger', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(96, 'Ledger', 'Ledger Create', 'create_ledger', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(97, 'Ledger', 'Ledger Edit', 'edit_ledger', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(98, 'Ledger', 'Ledger View', 'view_ledger', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(99, 'Ledger', 'Ledger Delete', 'delete_ledger', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(100, 'Report', 'Report Manage', 'manage_report', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(101, 'Report', 'Report Stock', 'report_stock', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(102, 'Report', 'Report Sale', 'report_sale', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(103, 'Report', 'Report Payment', 'report_payment', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(104, 'Report', 'Report Expense (Container)', 'report_container_expense', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(105, 'Report', 'Report Expense', 'report_expense', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(106, 'Report', 'Report Profit', 'report_profit', '2025-08-22 08:25:46', '2025-08-22 08:25:46'),
(107, 'Status', 'Status Manage', 'manage_status', '2025-08-23 06:02:09', '2025-08-23 06:02:09'),
(108, 'Status', 'Status Create', 'create_status', '2025-08-23 06:02:09', '2025-08-23 06:02:09'),
(109, 'Status', 'Status Edit', 'edit_status', '2025-08-23 06:02:09', '2025-08-23 06:02:09'),
(110, 'Status', 'Status View', 'view_status', '2025-08-23 06:02:09', '2025-08-23 06:02:09'),
(111, 'Status', 'Status Delete', 'delete_status', '2025-08-23 06:02:09', '2025-08-23 06:02:09'),
(112, 'Report', 'Report Bill', 'report_bill', '2025-08-30 06:00:27', '2025-08-30 06:00:27'),
(113, 'Report', 'Report Balance', 'report_balance', '2025-08-30 06:00:27', '2025-08-30 06:00:27'),
(114, 'Bill', 'Bill Manage', 'manage_bill', '2025-08-30 06:07:40', '2025-08-30 06:07:40'),
(115, 'Bill', 'Bill Create', 'create_bill', '2025-08-30 06:07:40', '2025-08-30 06:07:40'),
(116, 'Bill', 'Bill View', 'view_bill', '2025-08-30 06:07:40', '2025-08-30 06:07:40'),
(117, 'Bill', 'Bill Edit', 'edit_bill', '2025-08-30 06:07:40', '2025-08-30 06:07:40'),
(118, 'Bill', 'Bill Delete', 'delete_bill', '2025-08-30 06:07:40', '2025-08-30 06:07:40'),
(119, 'Account', 'Account Manage', 'manage_account', '2025-08-30 06:44:30', '2025-08-30 06:44:30'),
(120, 'Party', 'Party Statement Summary', 'statement_summary_party', '2025-09-05 05:00:09', '2025-09-05 05:00:09'),
(121, 'Customer', 'Customer Statement Summary', 'statement_summary_customer', '2025-09-05 05:00:09', '2025-09-05 05:00:09'),
(122, 'Supplier', 'Supplier Statement Summary', 'statement_summary_supplier', '2025-09-05 05:00:09', '2025-09-05 05:00:09'),
(123, 'Report', 'Sale Cash Collection', 'report_sale_cash_collection', '2025-09-05 05:00:09', '2025-09-05 05:00:09'),
(124, 'Report', 'Sale Cash', 'report_sale_cash', '2025-09-05 05:00:09', '2025-09-05 05:00:09'),
(125, 'Report', 'Sale Outstanding', 'report_sale_outstanding', '2025-09-05 05:00:09', '2025-09-05 05:00:09'),
(126, 'Invoice', 'Invoice Print', 'print_invoice', '2025-09-05 05:06:44', '2025-09-05 05:06:44'),
(127, 'Purchase', 'Print Purchase Invoice', 'print_purchase_invoice', '2025-09-05 05:49:16', '2025-09-05 05:49:16'),
(128, 'Sale', 'Print Sale Invoice', 'print_sale_invoice', '2025-09-05 05:49:16', '2025-09-05 05:49:16'),
(129, 'Report', 'Report Capital', 'report_capital', '2025-09-15 05:03:58', '2025-09-15 05:03:58'),
(130, 'Report', 'Report Receivable', 'report_receivable', '2025-09-15 05:03:58', '2025-09-15 05:03:58'),
(131, 'Report', 'Report Payable', 'report_payable', '2025-09-15 05:03:58', '2025-09-15 05:03:58'),
(132, 'Report', 'Report Daily Profit', 'report_daily_profit', '2025-09-15 05:03:58', '2025-09-15 05:03:58'),
(133, 'Report', 'Report Sale (Container)', 'report_sale_container', '2025-09-15 11:56:33', '2025-09-15 11:56:33'),
(134, 'Report', 'Report Purchase', 'report_purchase', '2025-09-19 03:38:51', '2025-09-19 03:38:51'),
(135, 'Dashboard', 'Dashboard Data', 'dashboard_data', '2025-09-20 09:52:46', '2025-09-20 09:52:46'),
(136, 'System 2', 'Sell Delete', 'delete_sale_2', '2025-09-20 09:52:46', '2025-09-20 09:52:46'),
(137, 'System 2', 'Sell Delete', 'delete_sale_2', '2025-09-20 09:52:46', '2025-09-20 09:52:46'),
(138, 'System 2', 'Report Sell', 'report_sale_2', '2025-09-20 09:52:46', '2025-09-20 09:52:46'),
(139, 'System 2', 'Sell Manage', 'manage_sale_2', '2025-09-20 09:52:46', '2025-09-20 09:52:46'),
(140, 'System 2', 'Sell Create', 'create_sale_2', '2025-09-20 09:52:46', '2025-09-20 09:52:46'),
(141, 'System 2', 'Sell Edit', 'edit_sale_2', '2025-09-20 09:52:46', '2025-09-20 09:52:46'),
(142, 'System 2', 'Payment Manage', 'manage_payment_2', '2025-09-20 09:52:46', '2025-09-20 09:52:46'),
(143, 'System 2', 'Payment Create', 'create_payment_2', '2025-09-20 09:52:46', '2025-09-20 09:52:46'),
(144, 'System 2', 'Payment Edit', 'edit_payment_2', '2025-09-20 09:52:46', '2025-09-20 09:52:46'),
(145, 'Report', 'Report Sale Statement', 'report_sale_statement', '2025-09-25 04:41:42', '2025-09-25 04:41:42'),
(146, 'Report', 'Report Purchase Cash Payment', 'report_purchase_cash_payment', '2025-09-25 04:42:19', '2025-09-25 04:42:19');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` int(11) NOT NULL,
  `fullName` varchar(255) DEFAULT NULL,
  `birthDate` datetime DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `contactEmail` varchar(255) DEFAULT NULL,
  `countryCode` varchar(255) DEFAULT NULL,
  `phoneCode` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `postalCode` varchar(255) DEFAULT NULL,
  `profilePicture` varchar(255) DEFAULT NULL,
  `userId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rolepermissions`
--

CREATE TABLE `rolepermissions` (
  `roleId` int(11) NOT NULL,
  `permissionId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `rolepermissions`
--

INSERT INTO `rolepermissions` (`roleId`, `permissionId`) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(6, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(2, 7),
(3, 7),
(4, 7),
(5, 7),
(6, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(2, 24),
(3, 24),
(1, 25),
(2, 25),
(3, 25),
(1, 26),
(2, 26),
(3, 26),
(1, 27),
(2, 27),
(3, 27),
(1, 28),
(2, 28),
(3, 28),
(1, 29),
(1, 30),
(1, 31),
(1, 32),
(1, 33),
(1, 34),
(1, 35),
(1, 36),
(1, 37),
(1, 38),
(1, 39),
(1, 40),
(1, 41),
(1, 42),
(2, 42),
(3, 42),
(4, 42),
(5, 42),
(6, 42),
(1, 43),
(1, 44),
(2, 44),
(3, 44),
(4, 44),
(1, 45),
(2, 45),
(3, 45),
(4, 45),
(1, 46),
(2, 46),
(3, 46),
(4, 46),
(1, 47),
(2, 47),
(3, 47),
(4, 47),
(5, 47),
(6, 47),
(1, 48),
(2, 48),
(3, 48),
(4, 48),
(5, 48),
(6, 48),
(1, 49),
(2, 49),
(3, 49),
(4, 49),
(5, 49),
(6, 49),
(1, 50),
(2, 50),
(3, 50),
(4, 50),
(5, 50),
(6, 50),
(1, 51),
(2, 51),
(3, 51),
(4, 51),
(6, 51),
(1, 52),
(1, 53),
(1, 54),
(1, 55),
(1, 56),
(1, 57),
(1, 58),
(1, 59),
(1, 60),
(1, 61),
(1, 62),
(1, 63),
(1, 64),
(1, 65),
(1, 66),
(1, 67),
(2, 67),
(3, 67),
(4, 67),
(5, 67),
(6, 67),
(1, 68),
(2, 68),
(3, 68),
(4, 68),
(6, 68),
(1, 69),
(2, 69),
(3, 69),
(4, 69),
(1, 70),
(2, 70),
(3, 70),
(4, 70),
(5, 70),
(6, 70),
(1, 71),
(2, 71),
(3, 71),
(4, 71),
(1, 72),
(2, 72),
(3, 72),
(4, 72),
(5, 72),
(6, 72),
(1, 73),
(2, 73),
(3, 73),
(4, 73),
(6, 73),
(1, 74),
(2, 74),
(3, 74),
(4, 74),
(1, 75),
(2, 75),
(3, 75),
(4, 75),
(5, 75),
(6, 75),
(1, 76),
(2, 76),
(3, 76),
(4, 76),
(1, 77),
(2, 77),
(3, 77),
(4, 77),
(5, 77),
(1, 78),
(2, 78),
(3, 78),
(4, 78),
(5, 78),
(1, 79),
(2, 79),
(3, 79),
(4, 79),
(5, 79),
(1, 80),
(2, 80),
(3, 80),
(4, 80),
(5, 80),
(1, 81),
(2, 81),
(3, 81),
(4, 81),
(5, 81),
(1, 82),
(2, 82),
(3, 82),
(4, 82),
(5, 82),
(1, 83),
(2, 83),
(3, 83),
(4, 83),
(5, 83),
(1, 84),
(2, 84),
(3, 84),
(4, 84),
(5, 84),
(1, 85),
(2, 85),
(3, 85),
(4, 85),
(5, 85),
(1, 86),
(2, 86),
(3, 86),
(4, 86),
(5, 86),
(1, 87),
(2, 87),
(3, 87),
(4, 87),
(6, 87),
(1, 88),
(2, 88),
(3, 88),
(4, 88),
(6, 88),
(1, 89),
(2, 89),
(3, 89),
(4, 89),
(6, 89),
(1, 90),
(2, 90),
(3, 90),
(4, 90),
(6, 90),
(1, 91),
(2, 91),
(3, 91),
(4, 91),
(6, 91),
(1, 92),
(2, 92),
(1, 93),
(2, 93),
(3, 93),
(5, 93),
(6, 93),
(1, 94),
(2, 94),
(5, 94),
(6, 94),
(1, 95),
(2, 95),
(5, 95),
(6, 95),
(1, 96),
(2, 96),
(1, 97),
(2, 97),
(1, 98),
(2, 98),
(3, 98),
(5, 98),
(1, 99),
(2, 99),
(1, 100),
(2, 100),
(3, 100),
(4, 100),
(5, 100),
(1, 101),
(2, 101),
(3, 101),
(4, 101),
(1, 102),
(2, 102),
(3, 102),
(4, 102),
(5, 102),
(1, 103),
(2, 103),
(3, 103),
(4, 103),
(5, 103),
(1, 104),
(1, 105),
(2, 105),
(3, 105),
(4, 105),
(5, 105),
(1, 106),
(4, 106),
(1, 107),
(1, 108),
(1, 109),
(1, 110),
(1, 111),
(1, 113),
(2, 113),
(3, 113),
(5, 113),
(1, 114),
(1, 115),
(1, 116),
(1, 117),
(1, 118),
(1, 119),
(2, 119),
(3, 119),
(1, 120),
(2, 120),
(1, 121),
(1, 122),
(1, 123),
(2, 123),
(3, 123),
(1, 124),
(1, 125),
(1, 126),
(1, 127),
(2, 127),
(1, 128),
(2, 128),
(1, 129),
(2, 129),
(3, 129),
(5, 129),
(1, 130),
(2, 130),
(3, 130),
(5, 130),
(1, 131),
(2, 131),
(3, 131),
(5, 131),
(1, 132),
(2, 132),
(3, 132),
(5, 132),
(1, 133),
(1, 134),
(2, 134),
(3, 134),
(1, 135),
(1, 136),
(1, 137),
(1, 138),
(1, 139),
(1, 140),
(1, 141),
(1, 142),
(1, 143),
(1, 144),
(1, 145),
(1, 146),
(2, 146),
(3, 146);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `action` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `businessId`, `name`, `action`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Root', 'root', 1, '2025-08-25 04:43:08', '2025-08-25 04:43:08'),
(2, 1, 'Manager', 'manager', 1, '2025-08-25 04:43:08', '2025-08-25 04:43:08'),
(3, 1, 'Admin', 'admin', 1, '2025-08-25 04:43:08', '2025-08-25 04:43:08'),
(4, 1, 'Sale Person', 'sale', 1, '2025-08-25 04:43:08', '2025-08-25 04:43:08'),
(5, 1, 'BD User', 'bduser', 1, '2025-08-28 02:28:48', '2025-08-28 02:28:48'),
(6, 1, 'Dubai User', 'dubaiuser', 1, '2025-08-28 02:47:43', '2025-08-28 02:47:43');

-- --------------------------------------------------------

--
-- Table structure for table `statustypes`
--

CREATE TABLE `statustypes` (
  `id` int(11) NOT NULL,
  `businessId` int(11) DEFAULT NULL,
  `group` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `statustypes`
--

INSERT INTO `statustypes` (`id`, `businessId`, `group`, `name`, `value`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'purchase', 'Purchase', 'purchase', 1, '2025-08-25 13:12:18', '2025-08-25 13:12:18'),
(2, 1, 'sale', 'Sale', 'sale', 1, '2025-08-25 13:12:30', '2025-08-25 13:12:30'),
(3, 1, 'expense', 'Office Expense', 'office_expense', 1, '2025-09-16 07:42:29', '2025-09-16 07:42:29'),
(4, 1, 'sale', 'Sale Fix', 'fix_sale', 1, '2025-09-25 07:34:14', '2025-09-25 07:34:14'),
(5, 1, 'sale', 'Sale Unfix', 'unfix_sale', 1, '2025-09-25 07:34:28', '2025-09-25 07:34:28'),
(6, 1, 'sale', 'Sale Wholesale', 'wholesale_sale', 1, '2025-09-25 07:34:46', '2025-09-25 07:34:46'),
(7, 1, 'purchase', 'Purchase Fix', 'fix_purchase', 1, '2025-09-25 07:35:00', '2025-09-25 07:35:00'),
(8, 1, 'purchase', 'Purchase Unfix', 'unfix_purchase', 1, '2025-09-25 07:35:31', '2025-09-25 07:35:31'),
(9, 1, 'purchase', 'Purchase Wholesale', 'wholesale_purchase', 1, '2025-09-25 07:35:57', '2025-09-25 07:35:57');

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `id` int(11) NOT NULL,
  `businessId` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `invoiceType` varchar(50) DEFAULT NULL,
  `invoiceId` int(11) DEFAULT NULL,
  `partyId` int(11) DEFAULT NULL,
  `movementType` enum('stock_in','stock_out','stock_transfer','stock_transfer_return','damaged') NOT NULL,
  `prefix` varchar(255) DEFAULT NULL,
  `quantity` float NOT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `warehouseId` int(11) DEFAULT NULL,
  `bankId` int(11) DEFAULT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `containerId` int(11) DEFAULT NULL,
  `itemId` int(11) NOT NULL,
  `createdBy` int(11) DEFAULT NULL,
  `updatedBy` int(11) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT 0,
  `deletedBy` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `system` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `stocks`
--

INSERT INTO `stocks` (`id`, `businessId`, `date`, `invoiceType`, `invoiceId`, `partyId`, `movementType`, `prefix`, `quantity`, `unit`, `warehouseId`, `bankId`, `categoryId`, `containerId`, `itemId`, `createdBy`, `updatedBy`, `isDeleted`, `deletedBy`, `createdAt`, `updatedAt`, `system`) VALUES
(1, 1, '2026-04-20', 'unfix_purchase', 2, 26, 'stock_in', 'STI', 5482.42, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-04-30 19:21:19', '2026-04-30 19:21:19', 1),
(10, 1, '2026-04-30', 'unfix_sale', 7, 1, 'stock_out', 'STO', 99.28, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-01 17:18:39', '2026-05-01 17:18:39', 1),
(11, 1, '2026-04-30', 'unfix_sale', 8, 1, 'stock_out', 'STO', 99.72, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-01 17:19:43', '2026-05-01 17:19:43', 1),
(12, 1, '2026-04-30', 'fix_sale', 9, 1, 'stock_out', 'STO', 99.28, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-01 17:23:49', '2026-05-01 17:23:49', 1),
(13, 1, '2026-04-30', 'fix_sale', 10, 1, 'stock_out', 'STO', 99.72, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-01 17:24:53', '2026-05-01 17:24:53', 1),
(14, 1, '2026-05-01', 'unfix_sale', 11, 3, 'stock_out', 'STO', 40.84, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-01 17:36:01', '2026-05-01 17:36:01', 1),
(15, 1, '2026-05-01', 'fix_sale', 12, 3, 'stock_out', 'STO', 40.84, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-01 17:36:56', '2026-05-01 17:36:56', 1),
(18, 1, '2026-05-01', 'unfix_purchase', 15, 6, 'stock_in', 'STI', 202.4, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-01 19:14:42', '2026-05-01 19:14:42', 1),
(19, 1, '2026-05-01', 'unfix_purchase', 16, 27, 'stock_in', 'STI', 111.86, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-01 19:18:39', '2026-05-01 19:18:39', 1),
(22, 1, '2026-05-02', 'unfix_sale', 18, 28, 'stock_out', 'STO', 0.5, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-02 07:30:35', '2026-05-02 07:30:35', 1),
(23, 1, '2026-05-02', 'fix_sale', 19, 28, 'stock_out', 'STO', 0.5, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-02 07:40:55', '2026-05-02 07:40:55', 1),
(27, 1, '2026-05-01', 'unfix_sale', 14, 1, 'stock_out', 'STO', 0, 'Gram', NULL, NULL, 1, NULL, 18, 11, 11, 0, NULL, '2026-05-02 19:46:46', '2026-05-02 19:46:46', 1),
(31, 1, '2026-05-02', 'unfix_purchase', 22, 26, 'stock_in', 'STI', 128.27, 'Gram', NULL, NULL, 1, NULL, 18, 11, 11, 0, NULL, '2026-05-02 20:29:04', '2026-05-02 20:29:04', 1),
(32, 1, '2026-05-03', 'unfix_sale', 23, 30, 'stock_out', 'STO', 128.27, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-02 20:31:31', '2026-05-02 20:31:31', 1),
(33, 1, '2026-05-02', 'unfix_sale', 21, 2, 'stock_out', 'STO', 32.46, 'Gram', NULL, NULL, 1, NULL, 18, 11, 11, 0, NULL, '2026-05-03 18:44:58', '2026-05-03 18:44:58', 1),
(35, 1, '2026-05-01', 'unfix_sale', 13, 7, 'stock_out', 'STO', 4528.06, 'Gram', NULL, NULL, 1, NULL, 18, 11, 11, 0, NULL, '2026-05-03 18:53:49', '2026-05-03 18:53:49', 1),
(38, 1, '2026-05-03', 'unfix_sale', 24, 1, 'stock_out', 'STO', 98.3, 'Gram', NULL, NULL, 1, NULL, 18, 11, 11, 0, NULL, '2026-05-03 18:58:36', '2026-05-03 18:58:36', 1),
(39, 1, '2026-05-03', 'unfix_sale', 25, 1, 'stock_out', 'STO', 94.81, 'Gram', NULL, NULL, 1, NULL, 18, 11, 11, 0, NULL, '2026-05-03 18:58:52', '2026-05-03 18:58:52', 1),
(40, 1, '2026-05-03', 'unfix_sale', 26, 2, 'stock_out', 'STO', 100.7, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-03 19:02:44', '2026-05-03 19:02:44', 1),
(43, 1, '2026-05-03', 'fix_sale', 28, 1, 'stock_out', 'STO', 159.21, 'Gram', NULL, NULL, 1, NULL, 18, 11, 11, 0, NULL, '2026-05-03 19:16:27', '2026-05-03 19:16:27', 1),
(44, 1, '2026-05-03', 'unfix_sale', 27, 2, 'stock_out', 'STO', 99.84, 'Gram', NULL, NULL, 1, NULL, 18, 11, 11, 0, NULL, '2026-05-03 20:00:01', '2026-05-03 20:00:01', 1),
(45, 1, '2026-05-01', 'unfix_sale', 17, 4, 'stock_out', 'STO', 0, 'Gram', NULL, NULL, 1, NULL, 18, 11, 11, 0, NULL, '2026-05-04 18:28:49', '2026-05-04 18:28:49', 1),
(46, 1, '2026-05-02', 'unfix_sale', 20, 29, 'stock_out', 'STO', 0, 'Gram', NULL, NULL, 1, NULL, 18, 11, 11, 0, NULL, '2026-05-04 18:37:05', '2026-05-04 18:37:05', 1),
(47, 1, '2026-05-04', 'unfix_sale', 29, 1, 'stock_out', 'STO', 100.5, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-04 18:40:15', '2026-05-04 18:40:15', 1),
(48, 1, '2026-05-04', 'unfix_sale', 30, 1, 'stock_out', 'STO', 100.6, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-04 18:41:52', '2026-05-04 18:41:52', 1),
(49, 1, '2026-05-04', 'unfix_sale', 31, 1, 'stock_out', 'STO', 100.1, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-04 18:43:14', '2026-05-04 18:43:14', 1),
(50, 1, '2026-05-04', 'unfix_sale', 32, 1, 'stock_out', 'STO', 100.3, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-04 18:43:58', '2026-05-04 18:43:58', 1),
(51, 1, '2026-05-04', 'unfix_sale', 33, 1, 'stock_out', 'STO', 100.1, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-04 18:45:09', '2026-05-04 18:45:09', 1),
(52, 1, '2026-05-04', 'unfix_sale', 34, 1, 'stock_out', 'STO', 100.3, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-04 18:45:53', '2026-05-04 18:45:53', 1),
(53, 1, '2026-05-04', 'fix_sale', 35, 1, 'stock_out', 'STO', 174.73, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-04 18:58:08', '2026-05-04 18:58:08', 1),
(54, 1, '2026-05-04', 'fix_sale', 36, 1, 'stock_out', 'STO', 100.23, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-04 19:01:39', '2026-05-04 19:01:39', 1),
(55, 1, '2026-05-04', 'fix_sale', 37, 2, 'stock_out', 'STO', 99.84, 'Gram', NULL, NULL, 1, NULL, 18, 11, NULL, 0, NULL, '2026-05-04 19:22:16', '2026-05-04 19:22:16', 1),
(57, 1, '2026-05-04', 'fix_sale', 38, 2, 'stock_out', 'STO', 100.7, 'Gram', NULL, NULL, 1, NULL, 18, 11, 11, 0, NULL, '2026-05-04 19:26:50', '2026-05-04 19:26:50', 1);

-- --------------------------------------------------------

--
-- Table structure for table `tokenstores`
--

CREATE TABLE `tokenstores` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tokenstores`
--

INSERT INTO `tokenstores` (`id`, `userId`, `token`, `expiresAt`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3MjkwNTQ1OCwiZXhwIjoxNzczNTEwMjU4fQ.xw0Kqoxb47f8ZT5o-R45rQ7L3PG1IDB3MeIvjFjF1FI', '2026-03-08 17:44:18', '2026-03-07 17:44:18', '2026-03-07 17:44:18'),
(2, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzI5MDk1OTAsImV4cCI6MTc3MzUxNDM5MH0.MSSljO_88nNCYIavvpR-eV_gXe60fWGqebeFDP_cOSQ', '2026-03-08 18:53:10', '2026-03-07 18:53:10', '2026-03-07 18:53:10'),
(3, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzI5MTcxMTQsImV4cCI6MTc3MzUyMTkxNH0.ehn3X1P9YHFai-_TMfL0wal1CnhM8JtwCRcIp2v8tyE', '2026-03-08 20:58:34', '2026-03-07 20:58:34', '2026-03-07 20:58:34'),
(4, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzI5NzI4NzgsImV4cCI6MTc3MzU3NzY3OH0.UFBneuIKwd6p23gN0gXU_2xnoWi7iWPT0xQO0uu0uAY', '2026-03-09 12:27:58', '2026-03-08 12:27:58', '2026-03-08 12:27:58'),
(5, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzMxNDk4NDQsImV4cCI6MTc3Mzc1NDY0NH0.qmH48lMRqdm59Y9I1k65sW7Gc_4QHcERt6-Ih1X-pEU', '2026-03-11 13:37:24', '2026-03-10 13:37:24', '2026-03-10 13:37:24'),
(6, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzMxNDk4NDQsImV4cCI6MTc3Mzc1NDY0NH0.qmH48lMRqdm59Y9I1k65sW7Gc_4QHcERt6-Ih1X-pEU', '2026-03-11 13:37:24', '2026-03-10 13:37:24', '2026-03-10 13:37:24'),
(7, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzMxNDk4NDQsImV4cCI6MTc3Mzc1NDY0NH0.qmH48lMRqdm59Y9I1k65sW7Gc_4QHcERt6-Ih1X-pEU', '2026-03-11 13:37:24', '2026-03-10 13:37:24', '2026-03-10 13:37:24'),
(8, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzMxNDk4NDQsImV4cCI6MTc3Mzc1NDY0NH0.qmH48lMRqdm59Y9I1k65sW7Gc_4QHcERt6-Ih1X-pEU', '2026-03-11 13:37:24', '2026-03-10 13:37:24', '2026-03-10 13:37:24'),
(9, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzMxODE1MzAsImV4cCI6MTc3Mzc4NjMzMH0.SVFy6ufPuJOSwpgmPTRkEvhonjiPb8sQICnEayTXdwI', '2026-03-11 22:25:30', '2026-03-10 22:25:30', '2026-03-10 22:25:30'),
(10, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzMzMTIxMDEsImV4cCI6MTc3MzkxNjkwMX0.0L26mzakVgueFoTOC69As82TS3e79rV6iW1eIR0yxZE', '2026-03-13 10:41:41', '2026-03-12 10:41:41', '2026-03-12 10:41:41'),
(11, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzMzMTIxMDEsImV4cCI6MTc3MzkxNjkwMX0.0L26mzakVgueFoTOC69As82TS3e79rV6iW1eIR0yxZE', '2026-03-13 10:41:41', '2026-03-12 10:41:41', '2026-03-12 10:41:41'),
(12, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzMzMTIxMDEsImV4cCI6MTc3MzkxNjkwMX0.0L26mzakVgueFoTOC69As82TS3e79rV6iW1eIR0yxZE', '2026-03-13 10:41:41', '2026-03-12 10:41:41', '2026-03-12 10:41:41'),
(13, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzMzMTIxMDEsImV4cCI6MTc3MzkxNjkwMX0.0L26mzakVgueFoTOC69As82TS3e79rV6iW1eIR0yxZE', '2026-03-13 10:41:41', '2026-03-12 10:41:41', '2026-03-12 10:41:41'),
(14, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzMzMTIxMDIsImV4cCI6MTc3MzkxNjkwMn0.Eph3Wi4Ti0he1iNw9RizyJeQoWQfNJ5fDulWhnKFaUk', '2026-03-13 10:41:42', '2026-03-12 10:41:42', '2026-03-12 10:41:42'),
(15, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3MzQ3Mjk3MywiZXhwIjoxNzc0MDc3NzczfQ.0wUIn1Vq0g3SxrcME8WatcVtTbDY69waQJ9gDGZAdZw', '2026-03-15 07:22:53', '2026-03-14 07:22:53', '2026-03-14 07:22:53'),
(16, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM0Nzg3NTAsImV4cCI6MTc3NDA4MzU1MH0.1bksS6mCP0u3U66y27AVMLWGvWhDW_K1IOuuqfIOcf4', '2026-03-15 08:59:10', '2026-03-14 08:59:10', '2026-03-14 08:59:10'),
(17, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3MzQ3ODc5OCwiZXhwIjoxNzc0MDgzNTk4fQ.bvK_nYb8CuuVEHPFP6aBJGGMB8G3PHdWRxTNhveEJR8', '2026-03-15 08:59:58', '2026-03-14 08:59:58', '2026-03-14 08:59:58'),
(18, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM0Nzg5MDcsImV4cCI6MTc3NDA4MzcwN30.BMmIQKNt7nMyYbaMdJFgtb9T7VS2dzdNoJI5GmH37oU', '2026-03-15 09:01:47', '2026-03-14 09:01:47', '2026-03-14 09:01:47'),
(19, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3MzQ3ODkzMCwiZXhwIjoxNzc0MDgzNzMwfQ.opOmgAdVmNJBOATz0BRQ0QdWprLcbxCFwCZJ2AQtM00', '2026-03-15 09:02:10', '2026-03-14 09:02:10', '2026-03-14 09:02:10'),
(20, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM0Nzg5NzcsImV4cCI6MTc3NDA4Mzc3N30.-GLhfCYz9I-YDXrTWGUbWUS2e7ajIyEWVwdEC8qfhAo', '2026-03-15 09:02:57', '2026-03-14 09:02:57', '2026-03-14 09:02:57'),
(21, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM2OTM3MTAsImV4cCI6MTc3NDI5ODUxMH0.rFYcP9gqzsc9fe5FTEjvgpHYQBIzEgDoQql_DPNFFTk', '2026-03-17 20:41:50', '2026-03-16 20:41:50', '2026-03-16 20:41:50'),
(22, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM2OTM3MTAsImV4cCI6MTc3NDI5ODUxMH0.rFYcP9gqzsc9fe5FTEjvgpHYQBIzEgDoQql_DPNFFTk', '2026-03-17 20:41:50', '2026-03-16 20:41:50', '2026-03-16 20:41:50'),
(23, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM2OTM3MTAsImV4cCI6MTc3NDI5ODUxMH0.rFYcP9gqzsc9fe5FTEjvgpHYQBIzEgDoQql_DPNFFTk', '2026-03-17 20:41:50', '2026-03-16 20:41:50', '2026-03-16 20:41:50'),
(24, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM2OTM3MTAsImV4cCI6MTc3NDI5ODUxMH0.rFYcP9gqzsc9fe5FTEjvgpHYQBIzEgDoQql_DPNFFTk', '2026-03-17 20:41:50', '2026-03-16 20:41:50', '2026-03-16 20:41:50'),
(25, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM2OTM3MTAsImV4cCI6MTc3NDI5ODUxMH0.rFYcP9gqzsc9fe5FTEjvgpHYQBIzEgDoQql_DPNFFTk', '2026-03-17 20:41:50', '2026-03-16 20:41:50', '2026-03-16 20:41:50'),
(26, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM3Mzg1NTIsImV4cCI6MTc3NDM0MzM1Mn0.wi_QcAZxtKQzJLiT3hI4wxg19TDk4scpaUDIo5ep_CI', '2026-03-18 09:09:12', '2026-03-17 09:09:12', '2026-03-17 09:09:12'),
(27, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM3ODA0MzUsImV4cCI6MTc3NDM4NTIzNX0.fU_xBmJUiTBFb6a1SIFEm8Fz5K_LYe5VB91BstflzV4', '2026-03-18 20:47:15', '2026-03-17 20:47:15', '2026-03-17 20:47:15'),
(28, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM4ODM2MDQsImV4cCI6MTc3NDQ4ODQwNH0.jIxBzypD5rePpQcUBe6rvVlxj70QtJPB_fbIy0ax_Jk', '2026-03-20 01:26:44', '2026-03-19 01:26:44', '2026-03-19 01:26:44'),
(29, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3Mzg4Mzg1MCwiZXhwIjoxNzc0NDg4NjUwfQ.amM1fIQ4dpHW3i0smEovoio8ik3D4vsRqw2ozDXXxxA', '2026-03-20 01:30:50', '2026-03-19 01:30:50', '2026-03-19 01:30:50'),
(30, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM4ODM5OTQsImV4cCI6MTc3NDQ4ODc5NH0.TVfhbBVm1o2Mn64gCm4tcisDs313W-8b9QVa3aO9Muo', '2026-03-20 01:33:15', '2026-03-19 01:33:15', '2026-03-19 01:33:15'),
(31, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzM5MzkwMzQsImV4cCI6MTc3NDU0MzgzNH0.yVYCVF9LAMKTEfYxCda01_4VbSrLF7UJO1KXSZlR3Bo', '2026-03-20 16:50:34', '2026-03-19 16:50:34', '2026-03-19 16:50:34'),
(32, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQwMTUyNjUsImV4cCI6MTc3NDYyMDA2NX0.N1sZwCIrvWhqS5M54nwKbC0oJO1AwgHvgZGnXLkLTv8', '2026-03-21 14:01:05', '2026-03-20 14:01:05', '2026-03-20 14:01:05'),
(33, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQwMTUyNjUsImV4cCI6MTc3NDYyMDA2NX0.N1sZwCIrvWhqS5M54nwKbC0oJO1AwgHvgZGnXLkLTv8', '2026-03-21 14:01:05', '2026-03-20 14:01:05', '2026-03-20 14:01:05'),
(34, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQwMTUyNjYsImV4cCI6MTc3NDYyMDA2Nn0.byzu7KX_3a5eiLykYZfky6cN_7McVVZScCR2DoN_ou8', '2026-03-21 14:01:06', '2026-03-20 14:01:06', '2026-03-20 14:01:06'),
(35, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQwMTUyNjYsImV4cCI6MTc3NDYyMDA2Nn0.byzu7KX_3a5eiLykYZfky6cN_7McVVZScCR2DoN_ou8', '2026-03-21 14:01:06', '2026-03-20 14:01:06', '2026-03-20 14:01:06'),
(36, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQwMTUyNjYsImV4cCI6MTc3NDYyMDA2Nn0.byzu7KX_3a5eiLykYZfky6cN_7McVVZScCR2DoN_ou8', '2026-03-21 14:01:06', '2026-03-20 14:01:06', '2026-03-20 14:01:06'),
(37, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQwMTUyNjYsImV4cCI6MTc3NDYyMDA2Nn0.byzu7KX_3a5eiLykYZfky6cN_7McVVZScCR2DoN_ou8', '2026-03-21 14:01:06', '2026-03-20 14:01:06', '2026-03-20 14:01:06'),
(38, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQwMTUyNjYsImV4cCI6MTc3NDYyMDA2Nn0.byzu7KX_3a5eiLykYZfky6cN_7McVVZScCR2DoN_ou8', '2026-03-21 14:01:06', '2026-03-20 14:01:06', '2026-03-20 14:01:06'),
(39, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQwMTUyNjYsImV4cCI6MTc3NDYyMDA2Nn0.byzu7KX_3a5eiLykYZfky6cN_7McVVZScCR2DoN_ou8', '2026-03-21 14:01:06', '2026-03-20 14:01:06', '2026-03-20 14:01:06'),
(40, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQwMTUyNjYsImV4cCI6MTc3NDYyMDA2Nn0.byzu7KX_3a5eiLykYZfky6cN_7McVVZScCR2DoN_ou8', '2026-03-21 14:01:06', '2026-03-20 14:01:06', '2026-03-20 14:01:06'),
(41, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQwMTUyNjYsImV4cCI6MTc3NDYyMDA2Nn0.byzu7KX_3a5eiLykYZfky6cN_7McVVZScCR2DoN_ou8', '2026-03-21 14:01:06', '2026-03-20 14:01:06', '2026-03-20 14:01:06'),
(42, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQwMTUyNjYsImV4cCI6MTc3NDYyMDA2Nn0.byzu7KX_3a5eiLykYZfky6cN_7McVVZScCR2DoN_ou8', '2026-03-21 14:01:06', '2026-03-20 14:01:06', '2026-03-20 14:01:06'),
(43, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQxMjI4MzIsImV4cCI6MTc3NDcyNzYzMn0.R6eUVZc5tqdtvvB4JIxniIEYGjV-ML72Q44gp6gJ7fs', '2026-03-22 19:53:52', '2026-03-21 19:53:52', '2026-03-21 19:53:52'),
(44, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQxMjI4MzIsImV4cCI6MTc3NDcyNzYzMn0.R6eUVZc5tqdtvvB4JIxniIEYGjV-ML72Q44gp6gJ7fs', '2026-03-22 19:53:52', '2026-03-21 19:53:52', '2026-03-21 19:53:52'),
(45, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQxMjMwMzAsImV4cCI6MTc3NDcyNzgzMH0.cwSqSHfZlE3CaoqY7xNHFI2NVvbUjJsImqbVSP8ov6I', '2026-03-22 19:57:10', '2026-03-21 19:57:10', '2026-03-21 19:57:10'),
(46, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQxNzE4NDQsImV4cCI6MTc3NDc3NjY0NH0.uWEKdDLG08HghPLwvngJGOQp36bXV_6z5_jyXDTobYU', '2026-03-23 09:30:44', '2026-03-22 09:30:44', '2026-03-22 09:30:44'),
(47, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQzNzg1NTYsImV4cCI6MTc3NDk4MzM1Nn0.TkvrGUJb2xXrA6KpPuaTBoI5vmab41JBWC1TUMcRwsk', '2026-03-25 18:55:56', '2026-03-24 18:55:56', '2026-03-24 18:55:56'),
(48, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQzNzg1NTYsImV4cCI6MTc3NDk4MzM1Nn0.TkvrGUJb2xXrA6KpPuaTBoI5vmab41JBWC1TUMcRwsk', '2026-03-25 18:55:56', '2026-03-24 18:55:56', '2026-03-24 18:55:56'),
(49, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQzNzg1NTYsImV4cCI6MTc3NDk4MzM1Nn0.TkvrGUJb2xXrA6KpPuaTBoI5vmab41JBWC1TUMcRwsk', '2026-03-25 18:55:56', '2026-03-24 18:55:56', '2026-03-24 18:55:56'),
(50, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQzNzg1NTYsImV4cCI6MTc3NDk4MzM1Nn0.TkvrGUJb2xXrA6KpPuaTBoI5vmab41JBWC1TUMcRwsk', '2026-03-25 18:55:56', '2026-03-24 18:55:56', '2026-03-24 18:55:56'),
(51, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQzNzg1NTYsImV4cCI6MTc3NDk4MzM1Nn0.TkvrGUJb2xXrA6KpPuaTBoI5vmab41JBWC1TUMcRwsk', '2026-03-25 18:55:56', '2026-03-24 18:55:56', '2026-03-24 18:55:56'),
(52, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQzNzg2OTAsImV4cCI6MTc3NDk4MzQ5MH0.9UbCWoAQHqoU33xAFLSNBhMPgnQjn7rpRmwmk7lMT_Q', '2026-03-25 18:58:10', '2026-03-24 18:58:10', '2026-03-24 18:58:10'),
(53, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQzNzg2OTAsImV4cCI6MTc3NDk4MzQ5MH0.9UbCWoAQHqoU33xAFLSNBhMPgnQjn7rpRmwmk7lMT_Q', '2026-03-25 18:58:10', '2026-03-24 18:58:10', '2026-03-24 18:58:10'),
(54, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQzNzg2OTAsImV4cCI6MTc3NDk4MzQ5MH0.9UbCWoAQHqoU33xAFLSNBhMPgnQjn7rpRmwmk7lMT_Q', '2026-03-25 18:58:10', '2026-03-24 18:58:10', '2026-03-24 18:58:10'),
(55, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQzODIyMDQsImV4cCI6MTc3NDk4NzAwNH0.YJXkXmaM1Gpjh0-ygioNnfAjBvNb270zD2rltJSWhgE', '2026-03-25 19:56:44', '2026-03-24 19:56:44', '2026-03-24 19:56:44'),
(56, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQzODIyMDQsImV4cCI6MTc3NDk4NzAwNH0.YJXkXmaM1Gpjh0-ygioNnfAjBvNb270zD2rltJSWhgE', '2026-03-25 19:56:44', '2026-03-24 19:56:44', '2026-03-24 19:56:44'),
(57, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQzODIyMDQsImV4cCI6MTc3NDk4NzAwNH0.YJXkXmaM1Gpjh0-ygioNnfAjBvNb270zD2rltJSWhgE', '2026-03-25 19:56:44', '2026-03-24 19:56:44', '2026-03-24 19:56:44'),
(58, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ0MjU5MDIsImV4cCI6MTc3NTAzMDcwMn0.K2hiARKuQnuEAK_I0hdgolCK3Lu4eG6G4b56oqAII2Y', '2026-03-26 08:05:02', '2026-03-25 08:05:02', '2026-03-25 08:05:02'),
(59, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3NDQ1OTE3NSwiZXhwIjoxNzc1MDYzOTc1fQ.ZbWGl7L5aZUZaQoSnDib2aQxYK0aLIu9hT9OE0aem4Q', '2026-03-26 17:19:35', '2026-03-25 17:19:35', '2026-03-25 17:19:35'),
(60, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ1NTAzNzUsImV4cCI6MTc3NTE1NTE3NX0.CXwvKSzqOgkpW5Wys1c8m0VhJlGxt5Xvlsa7E0t48n0', '2026-03-27 18:39:35', '2026-03-26 18:39:35', '2026-03-26 18:39:35'),
(61, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ1NTAzNzUsImV4cCI6MTc3NTE1NTE3NX0.CXwvKSzqOgkpW5Wys1c8m0VhJlGxt5Xvlsa7E0t48n0', '2026-03-27 18:39:35', '2026-03-26 18:39:35', '2026-03-26 18:39:35'),
(62, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ1NTAzNzUsImV4cCI6MTc3NTE1NTE3NX0.CXwvKSzqOgkpW5Wys1c8m0VhJlGxt5Xvlsa7E0t48n0', '2026-03-27 18:39:35', '2026-03-26 18:39:35', '2026-03-26 18:39:35'),
(63, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ1NTAzNzUsImV4cCI6MTc3NTE1NTE3NX0.CXwvKSzqOgkpW5Wys1c8m0VhJlGxt5Xvlsa7E0t48n0', '2026-03-27 18:39:35', '2026-03-26 18:39:35', '2026-03-26 18:39:35'),
(64, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ1NTAzNzUsImV4cCI6MTc3NTE1NTE3NX0.CXwvKSzqOgkpW5Wys1c8m0VhJlGxt5Xvlsa7E0t48n0', '2026-03-27 18:39:35', '2026-03-26 18:39:35', '2026-03-26 18:39:35'),
(65, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ1NTAzNzUsImV4cCI6MTc3NTE1NTE3NX0.CXwvKSzqOgkpW5Wys1c8m0VhJlGxt5Xvlsa7E0t48n0', '2026-03-27 18:39:35', '2026-03-26 18:39:35', '2026-03-26 18:39:35'),
(66, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ1NTA1MDMsImV4cCI6MTc3NTE1NTMwM30.6WdHzWvlRQBZwEf4bhpHpvatK-8Qib8WQ6nxGn2GKMs', '2026-03-27 18:41:43', '2026-03-26 18:41:43', '2026-03-26 18:41:43'),
(67, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ2MDQ3NjcsImV4cCI6MTc3NTIwOTU2N30.gaSNQFkegYfg6xPjm9KW6x2xA_EHxvEwESx_gQ-qOzw', '2026-03-28 09:46:07', '2026-03-27 09:46:07', '2026-03-27 09:46:07'),
(68, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ2MDQ3NjcsImV4cCI6MTc3NTIwOTU2N30.gaSNQFkegYfg6xPjm9KW6x2xA_EHxvEwESx_gQ-qOzw', '2026-03-28 09:46:07', '2026-03-27 09:46:07', '2026-03-27 09:46:07'),
(69, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ2MDQ3NjcsImV4cCI6MTc3NTIwOTU2N30.gaSNQFkegYfg6xPjm9KW6x2xA_EHxvEwESx_gQ-qOzw', '2026-03-28 09:46:07', '2026-03-27 09:46:07', '2026-03-27 09:46:07'),
(70, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3MjUxMzQsImV4cCI6MTc3NTMyOTkzNH0.Gv1IcwFvfN7Wrj5Grmznp-IbZGTvxOQPglDHQBlidJc', '2026-03-29 19:12:14', '2026-03-28 19:12:14', '2026-03-28 19:12:14'),
(71, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3MjUxMzQsImV4cCI6MTc3NTMyOTkzNH0.Gv1IcwFvfN7Wrj5Grmznp-IbZGTvxOQPglDHQBlidJc', '2026-03-29 19:12:14', '2026-03-28 19:12:14', '2026-03-28 19:12:14'),
(72, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3MjUxMzQsImV4cCI6MTc3NTMyOTkzNH0.Gv1IcwFvfN7Wrj5Grmznp-IbZGTvxOQPglDHQBlidJc', '2026-03-29 19:12:14', '2026-03-28 19:12:14', '2026-03-28 19:12:14'),
(73, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3MjUxMzQsImV4cCI6MTc3NTMyOTkzNH0.Gv1IcwFvfN7Wrj5Grmznp-IbZGTvxOQPglDHQBlidJc', '2026-03-29 19:12:14', '2026-03-28 19:12:14', '2026-03-28 19:12:14'),
(74, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3MjUxOTIsImV4cCI6MTc3NTMyOTk5Mn0.9XBAiTaQI-_G9HmI1jw3rm30BRRx2BSrFYSCS9b2ugc', '2026-03-29 19:13:12', '2026-03-28 19:13:12', '2026-03-28 19:13:12'),
(75, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3NDc3MjUzMSwiZXhwIjoxNzc1Mzc3MzMxfQ.QsTAutFQQ7GMhZHqc7Hixexkrh9DabnB-3FVr7IjO2c', '2026-03-30 08:22:11', '2026-03-29 08:22:11', '2026-03-29 08:22:11'),
(76, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3ODYwOTYsImV4cCI6MTc3NTM5MDg5Nn0.z1kSCFF3NFtCRA5LZOJDoa2zVQr9AW-FFmKkVZuq2Zc', '2026-03-30 12:08:16', '2026-03-29 12:08:16', '2026-03-29 12:08:16'),
(77, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3ODYwOTYsImV4cCI6MTc3NTM5MDg5Nn0.z1kSCFF3NFtCRA5LZOJDoa2zVQr9AW-FFmKkVZuq2Zc', '2026-03-30 12:08:16', '2026-03-29 12:08:16', '2026-03-29 12:08:16'),
(78, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3ODYwOTYsImV4cCI6MTc3NTM5MDg5Nn0.z1kSCFF3NFtCRA5LZOJDoa2zVQr9AW-FFmKkVZuq2Zc', '2026-03-30 12:08:16', '2026-03-29 12:08:16', '2026-03-29 12:08:16'),
(79, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3ODYwOTYsImV4cCI6MTc3NTM5MDg5Nn0.z1kSCFF3NFtCRA5LZOJDoa2zVQr9AW-FFmKkVZuq2Zc', '2026-03-30 12:08:16', '2026-03-29 12:08:16', '2026-03-29 12:08:16'),
(80, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3ODcwNTIsImV4cCI6MTc3NTM5MTg1Mn0.5wxsMbl4glkuo0TiAwbXisWFPsbTlC3w-lCP830m0Ls', '2026-03-30 12:24:12', '2026-03-29 12:24:12', '2026-03-29 12:24:12'),
(81, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3ODcwNTIsImV4cCI6MTc3NTM5MTg1Mn0.5wxsMbl4glkuo0TiAwbXisWFPsbTlC3w-lCP830m0Ls', '2026-03-30 12:24:12', '2026-03-29 12:24:12', '2026-03-29 12:24:12'),
(82, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3ODcwNTIsImV4cCI6MTc3NTM5MTg1Mn0.5wxsMbl4glkuo0TiAwbXisWFPsbTlC3w-lCP830m0Ls', '2026-03-30 12:24:12', '2026-03-29 12:24:12', '2026-03-29 12:24:12'),
(83, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ3ODcwNTIsImV4cCI6MTc3NTM5MTg1Mn0.5wxsMbl4glkuo0TiAwbXisWFPsbTlC3w-lCP830m0Ls', '2026-03-30 12:24:12', '2026-03-29 12:24:12', '2026-03-29 12:24:12'),
(84, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzQ4MTQyNzEsImV4cCI6MTc3NTQxOTA3MX0._ZfW-JG1ucd9sgfnmO0UL0YLgkLr7VEnGLVeY_6Fygc', '2026-03-30 19:57:51', '2026-03-29 19:57:51', '2026-03-29 19:57:51'),
(85, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUwNzg5ODYsImV4cCI6MTc3NTY4Mzc4Nn0.tjFNTpczuPAdAkfcMRcyQg_XeotpFOnTQ4GAWCYHu0w', '2026-04-02 21:29:46', '2026-04-01 21:29:46', '2026-04-01 21:29:46'),
(86, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUwNzg5ODYsImV4cCI6MTc3NTY4Mzc4Nn0.tjFNTpczuPAdAkfcMRcyQg_XeotpFOnTQ4GAWCYHu0w', '2026-04-02 21:29:46', '2026-04-01 21:29:46', '2026-04-01 21:29:46'),
(87, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUwNzg5ODcsImV4cCI6MTc3NTY4Mzc4N30.8ZArU1rPao6xQuJ4eFfCK_mEkcE8dBPZzUeGRq1JePQ', '2026-04-02 21:29:47', '2026-04-01 21:29:47', '2026-04-01 21:29:47'),
(88, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjQsImV4cCI6MTc3NTcxNjEyNH0._de1Vcqi3dnkTKRnXjMQja-qR5gLxCMddnAjRKzE5C4', '2026-04-03 06:28:44', '2026-04-02 06:28:44', '2026-04-02 06:28:44'),
(89, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjQsImV4cCI6MTc3NTcxNjEyNH0._de1Vcqi3dnkTKRnXjMQja-qR5gLxCMddnAjRKzE5C4', '2026-04-03 06:28:44', '2026-04-02 06:28:44', '2026-04-02 06:28:44'),
(90, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjQsImV4cCI6MTc3NTcxNjEyNH0._de1Vcqi3dnkTKRnXjMQja-qR5gLxCMddnAjRKzE5C4', '2026-04-03 06:28:44', '2026-04-02 06:28:44', '2026-04-02 06:28:44'),
(91, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjQsImV4cCI6MTc3NTcxNjEyNH0._de1Vcqi3dnkTKRnXjMQja-qR5gLxCMddnAjRKzE5C4', '2026-04-03 06:28:44', '2026-04-02 06:28:44', '2026-04-02 06:28:44'),
(92, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjQsImV4cCI6MTc3NTcxNjEyNH0._de1Vcqi3dnkTKRnXjMQja-qR5gLxCMddnAjRKzE5C4', '2026-04-03 06:28:44', '2026-04-02 06:28:44', '2026-04-02 06:28:44'),
(93, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjQsImV4cCI6MTc3NTcxNjEyNH0._de1Vcqi3dnkTKRnXjMQja-qR5gLxCMddnAjRKzE5C4', '2026-04-03 06:28:44', '2026-04-02 06:28:44', '2026-04-02 06:28:44'),
(94, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjUsImV4cCI6MTc3NTcxNjEyNX0.ynARnA5iByCtf5bhqhmrNsfTjyQrQvdVLnyjbnGJOTM', '2026-04-03 06:28:45', '2026-04-02 06:28:45', '2026-04-02 06:28:45'),
(95, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjUsImV4cCI6MTc3NTcxNjEyNX0.ynARnA5iByCtf5bhqhmrNsfTjyQrQvdVLnyjbnGJOTM', '2026-04-03 06:28:45', '2026-04-02 06:28:45', '2026-04-02 06:28:45'),
(96, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjUsImV4cCI6MTc3NTcxNjEyNX0.ynARnA5iByCtf5bhqhmrNsfTjyQrQvdVLnyjbnGJOTM', '2026-04-03 06:28:45', '2026-04-02 06:28:45', '2026-04-02 06:28:45'),
(97, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjUsImV4cCI6MTc3NTcxNjEyNX0.ynARnA5iByCtf5bhqhmrNsfTjyQrQvdVLnyjbnGJOTM', '2026-04-03 06:28:45', '2026-04-02 06:28:45', '2026-04-02 06:28:45'),
(98, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjUsImV4cCI6MTc3NTcxNjEyNX0.ynARnA5iByCtf5bhqhmrNsfTjyQrQvdVLnyjbnGJOTM', '2026-04-03 06:28:45', '2026-04-02 06:28:45', '2026-04-02 06:28:45'),
(99, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjUsImV4cCI6MTc3NTcxNjEyNX0.ynARnA5iByCtf5bhqhmrNsfTjyQrQvdVLnyjbnGJOTM', '2026-04-03 06:28:45', '2026-04-02 06:28:45', '2026-04-02 06:28:45'),
(100, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTEzMjUsImV4cCI6MTc3NTcxNjEyNX0.ynARnA5iByCtf5bhqhmrNsfTjyQrQvdVLnyjbnGJOTM', '2026-04-03 06:28:45', '2026-04-02 06:28:45', '2026-04-02 06:28:45'),
(101, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTU5NDUsImV4cCI6MTc3NTcyMDc0NX0.oFdOiMq5u57NiWXm9BrxwrGJtRsfcbfeNTyaY6tj9OQ', '2026-04-03 07:45:45', '2026-04-02 07:45:45', '2026-04-02 07:45:45'),
(102, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTU5NDUsImV4cCI6MTc3NTcyMDc0NX0.oFdOiMq5u57NiWXm9BrxwrGJtRsfcbfeNTyaY6tj9OQ', '2026-04-03 07:45:45', '2026-04-02 07:45:45', '2026-04-02 07:45:45'),
(103, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTU5NDUsImV4cCI6MTc3NTcyMDc0NX0.oFdOiMq5u57NiWXm9BrxwrGJtRsfcbfeNTyaY6tj9OQ', '2026-04-03 07:45:45', '2026-04-02 07:45:45', '2026-04-02 07:45:45'),
(104, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTU5NDUsImV4cCI6MTc3NTcyMDc0NX0.oFdOiMq5u57NiWXm9BrxwrGJtRsfcbfeNTyaY6tj9OQ', '2026-04-03 07:45:45', '2026-04-02 07:45:45', '2026-04-02 07:45:45'),
(105, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTU5NDUsImV4cCI6MTc3NTcyMDc0NX0.oFdOiMq5u57NiWXm9BrxwrGJtRsfcbfeNTyaY6tj9OQ', '2026-04-03 07:45:45', '2026-04-02 07:45:45', '2026-04-02 07:45:45'),
(106, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTU5NDUsImV4cCI6MTc3NTcyMDc0NX0.oFdOiMq5u57NiWXm9BrxwrGJtRsfcbfeNTyaY6tj9OQ', '2026-04-03 07:45:45', '2026-04-02 07:45:45', '2026-04-02 07:45:45'),
(107, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTU5NDUsImV4cCI6MTc3NTcyMDc0NX0.oFdOiMq5u57NiWXm9BrxwrGJtRsfcbfeNTyaY6tj9OQ', '2026-04-03 07:45:45', '2026-04-02 07:45:45', '2026-04-02 07:45:45'),
(108, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTU5NDUsImV4cCI6MTc3NTcyMDc0NX0.oFdOiMq5u57NiWXm9BrxwrGJtRsfcbfeNTyaY6tj9OQ', '2026-04-03 07:45:45', '2026-04-02 07:45:45', '2026-04-02 07:45:45'),
(109, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTU5NDUsImV4cCI6MTc3NTcyMDc0NX0.oFdOiMq5u57NiWXm9BrxwrGJtRsfcbfeNTyaY6tj9OQ', '2026-04-03 07:45:45', '2026-04-02 07:45:45', '2026-04-02 07:45:45'),
(110, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUxMTU5NDUsImV4cCI6MTc3NTcyMDc0NX0.oFdOiMq5u57NiWXm9BrxwrGJtRsfcbfeNTyaY6tj9OQ', '2026-04-03 07:45:45', '2026-04-02 07:45:45', '2026-04-02 07:45:45'),
(111, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyMDI3MzUsImV4cCI6MTc3NTgwNzUzNX0.ocZ-fB64ubHSKmNSZ4N416cVRM85pYUbBB1CIxp2ZpE', '2026-04-04 07:52:15', '2026-04-03 07:52:15', '2026-04-03 07:52:15'),
(112, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyMDI3MzUsImV4cCI6MTc3NTgwNzUzNX0.ocZ-fB64ubHSKmNSZ4N416cVRM85pYUbBB1CIxp2ZpE', '2026-04-04 07:52:15', '2026-04-03 07:52:15', '2026-04-03 07:52:15'),
(113, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyMDI3MzUsImV4cCI6MTc3NTgwNzUzNX0.ocZ-fB64ubHSKmNSZ4N416cVRM85pYUbBB1CIxp2ZpE', '2026-04-04 07:52:15', '2026-04-03 07:52:15', '2026-04-03 07:52:15'),
(114, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3NTIyMTY5NiwiZXhwIjoxNzc1ODI2NDk2fQ.sEy-SjeQcdp8pQwF1YFr6DhoFrYj3SPA77hjLrfq2vM', '2026-04-04 13:08:16', '2026-04-03 13:08:16', '2026-04-03 13:08:16'),
(115, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyMjIxMjAsImV4cCI6MTc3NTgyNjkyMH0.j9FIMyDe6KybZejfFNTd2Ge5qbcqOPF7rzjTwW6fl9k', '2026-04-04 13:15:20', '2026-04-03 13:15:20', '2026-04-03 13:15:20'),
(116, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyODgyNzAsImV4cCI6MTc3NTg5MzA3MH0.en3lTbNas8g3_lHPiE58Wq5-Bse-Sq7iDNbcvOpjo_k', '2026-04-05 07:37:50', '2026-04-04 07:37:50', '2026-04-04 07:37:50'),
(117, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyODgyNzAsImV4cCI6MTc3NTg5MzA3MH0.en3lTbNas8g3_lHPiE58Wq5-Bse-Sq7iDNbcvOpjo_k', '2026-04-05 07:37:50', '2026-04-04 07:37:50', '2026-04-04 07:37:50'),
(118, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyODgyNzAsImV4cCI6MTc3NTg5MzA3MH0.en3lTbNas8g3_lHPiE58Wq5-Bse-Sq7iDNbcvOpjo_k', '2026-04-05 07:37:50', '2026-04-04 07:37:50', '2026-04-04 07:37:50'),
(119, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyODgyNzAsImV4cCI6MTc3NTg5MzA3MH0.en3lTbNas8g3_lHPiE58Wq5-Bse-Sq7iDNbcvOpjo_k', '2026-04-05 07:37:50', '2026-04-04 07:37:50', '2026-04-04 07:37:50'),
(120, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyODgyNzAsImV4cCI6MTc3NTg5MzA3MH0.en3lTbNas8g3_lHPiE58Wq5-Bse-Sq7iDNbcvOpjo_k', '2026-04-05 07:37:50', '2026-04-04 07:37:50', '2026-04-04 07:37:50'),
(121, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyODgyNzAsImV4cCI6MTc3NTg5MzA3MH0.en3lTbNas8g3_lHPiE58Wq5-Bse-Sq7iDNbcvOpjo_k', '2026-04-05 07:37:50', '2026-04-04 07:37:50', '2026-04-04 07:37:50'),
(122, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyODgyNzAsImV4cCI6MTc3NTg5MzA3MH0.en3lTbNas8g3_lHPiE58Wq5-Bse-Sq7iDNbcvOpjo_k', '2026-04-05 07:37:50', '2026-04-04 07:37:50', '2026-04-04 07:37:50'),
(123, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyODgyNzAsImV4cCI6MTc3NTg5MzA3MH0.en3lTbNas8g3_lHPiE58Wq5-Bse-Sq7iDNbcvOpjo_k', '2026-04-05 07:37:50', '2026-04-04 07:37:50', '2026-04-04 07:37:50'),
(124, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyODgyNzAsImV4cCI6MTc3NTg5MzA3MH0.en3lTbNas8g3_lHPiE58Wq5-Bse-Sq7iDNbcvOpjo_k', '2026-04-05 07:37:50', '2026-04-04 07:37:50', '2026-04-04 07:37:50'),
(125, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUyODgzNTcsImV4cCI6MTc3NTg5MzE1N30.GA1J91cBXwcM3MMvvFGEBT1k6Wh7-7qGf9_Ty4UP4u8', '2026-04-05 07:39:17', '2026-04-04 07:39:17', '2026-04-04 07:39:17'),
(126, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUzNDUyMTcsImV4cCI6MTc3NTk1MDAxN30.7OdDBxo2qlPjHFpOTLghdfMlLc7ZyV0xt6gYpZsDqbQ', '2026-04-05 23:26:57', '2026-04-04 23:26:57', '2026-04-04 23:26:57'),
(127, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUzNDUyMTcsImV4cCI6MTc3NTk1MDAxN30.7OdDBxo2qlPjHFpOTLghdfMlLc7ZyV0xt6gYpZsDqbQ', '2026-04-05 23:26:57', '2026-04-04 23:26:57', '2026-04-04 23:26:57'),
(128, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUzNDUyMjAsImV4cCI6MTc3NTk1MDAyMH0.P_D7jUNKGTunv9EhpA4IDgEdzi923D76AAW08n9FAQg', '2026-04-05 23:27:00', '2026-04-04 23:27:00', '2026-04-04 23:27:00'),
(129, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzUzNDUyMjAsImV4cCI6MTc3NTk1MDAyMH0.P_D7jUNKGTunv9EhpA4IDgEdzi923D76AAW08n9FAQg', '2026-04-05 23:27:00', '2026-04-04 23:27:00', '2026-04-04 23:27:00'),
(130, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU0MTg4NjQsImV4cCI6MTc3NjAyMzY2NH0.S2qmUWK2A9v_G1zytPsP-eIjICUcAGRUXGWBjEy2T6Q', '2026-04-06 19:54:24', '2026-04-05 19:54:24', '2026-04-05 19:54:24'),
(131, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU0OTg0MjEsImV4cCI6MTc3NjEwMzIyMX0.r4xZeqe94WW_Qqd2CzlrcMo5_SWmihYaDesyduw75ug', '2026-04-07 18:00:21', '2026-04-06 18:00:21', '2026-04-06 18:00:21'),
(132, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU0OTg0MjEsImV4cCI6MTc3NjEwMzIyMX0.r4xZeqe94WW_Qqd2CzlrcMo5_SWmihYaDesyduw75ug', '2026-04-07 18:00:21', '2026-04-06 18:00:21', '2026-04-06 18:00:21'),
(133, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU0OTg0MjEsImV4cCI6MTc3NjEwMzIyMX0.r4xZeqe94WW_Qqd2CzlrcMo5_SWmihYaDesyduw75ug', '2026-04-07 18:00:21', '2026-04-06 18:00:21', '2026-04-06 18:00:21'),
(134, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU0OTg0MjEsImV4cCI6MTc3NjEwMzIyMX0.r4xZeqe94WW_Qqd2CzlrcMo5_SWmihYaDesyduw75ug', '2026-04-07 18:00:21', '2026-04-06 18:00:21', '2026-04-06 18:00:21'),
(135, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU0OTg0MjEsImV4cCI6MTc3NjEwMzIyMX0.r4xZeqe94WW_Qqd2CzlrcMo5_SWmihYaDesyduw75ug', '2026-04-07 18:00:21', '2026-04-06 18:00:21', '2026-04-06 18:00:21'),
(136, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU0OTg0MjEsImV4cCI6MTc3NjEwMzIyMX0.r4xZeqe94WW_Qqd2CzlrcMo5_SWmihYaDesyduw75ug', '2026-04-07 18:00:21', '2026-04-06 18:00:21', '2026-04-06 18:00:21'),
(137, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU0OTg0MjEsImV4cCI6MTc3NjEwMzIyMX0.r4xZeqe94WW_Qqd2CzlrcMo5_SWmihYaDesyduw75ug', '2026-04-07 18:00:21', '2026-04-06 18:00:21', '2026-04-06 18:00:21'),
(138, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU1MDQ5MDcsImV4cCI6MTc3NjEwOTcwN30.lUX2_kKS0U-X_a6z7m3ynZAEc-HDzVhq_KNk9pgHpq4', '2026-04-07 19:48:27', '2026-04-06 19:48:27', '2026-04-06 19:48:27'),
(139, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU1MDczMjMsImV4cCI6MTc3NjExMjEyM30.W4Xk4ofOe_gVNV_igUeU0s9mqpFUeHv47jLFaLeu0Lg', '2026-04-07 20:28:43', '2026-04-06 20:28:43', '2026-04-06 20:28:43'),
(140, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU1MDczMjMsImV4cCI6MTc3NjExMjEyM30.W4Xk4ofOe_gVNV_igUeU0s9mqpFUeHv47jLFaLeu0Lg', '2026-04-07 20:28:43', '2026-04-06 20:28:43', '2026-04-06 20:28:43'),
(141, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU3NjQ3MTcsImV4cCI6MTc3NjM2OTUxN30.wWf5Tx2IfpD2a0rkKjFiaUrok_un2FtqSjCmC2oprKE', '2026-04-10 19:58:37', '2026-04-09 19:58:37', '2026-04-09 19:58:37'),
(142, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzU3NjQ3MTcsImV4cCI6MTc3NjM2OTUxN30.wWf5Tx2IfpD2a0rkKjFiaUrok_un2FtqSjCmC2oprKE', '2026-04-10 19:58:37', '2026-04-09 19:58:37', '2026-04-09 19:58:37'),
(143, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzYzNzE5NzksImV4cCI6MTc3Njk3Njc3OX0.htEQq2hptGvNwdT_LctQZXNbfbgOR21OJFaSDu8M1aE', '2026-04-17 20:39:39', '2026-04-16 20:39:39', '2026-04-16 20:39:39'),
(144, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzYzNzE5NzksImV4cCI6MTc3Njk3Njc3OX0.htEQq2hptGvNwdT_LctQZXNbfbgOR21OJFaSDu8M1aE', '2026-04-17 20:39:39', '2026-04-16 20:39:39', '2026-04-16 20:39:39'),
(145, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzYzNzE5NzksImV4cCI6MTc3Njk3Njc3OX0.htEQq2hptGvNwdT_LctQZXNbfbgOR21OJFaSDu8M1aE', '2026-04-17 20:39:39', '2026-04-16 20:39:39', '2026-04-16 20:39:39'),
(146, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzYzNzE5ODAsImV4cCI6MTc3Njk3Njc4MH0.jx6ImRJpOkb__UqlM8vRFgQW2-0iEHBJazkF3B_5pXc', '2026-04-17 20:39:40', '2026-04-16 20:39:40', '2026-04-16 20:39:40'),
(147, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzYzNzE5ODAsImV4cCI6MTc3Njk3Njc4MH0.jx6ImRJpOkb__UqlM8vRFgQW2-0iEHBJazkF3B_5pXc', '2026-04-17 20:39:40', '2026-04-16 20:39:40', '2026-04-16 20:39:40'),
(148, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzYzNzE5ODAsImV4cCI6MTc3Njk3Njc4MH0.jx6ImRJpOkb__UqlM8vRFgQW2-0iEHBJazkF3B_5pXc', '2026-04-17 20:39:40', '2026-04-16 20:39:40', '2026-04-16 20:39:40'),
(149, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzYzNzE5OTQsImV4cCI6MTc3Njk3Njc5NH0.KHOzo6mDsNep1LJM090vd-XeAYRWcF-kCgvaX5qFtqQ', '2026-04-17 20:39:54', '2026-04-16 20:39:54', '2026-04-16 20:39:54'),
(150, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzczMTMzMjgsImV4cCI6MTc3NzkxODEyOH0.svavoEi0lVZw6OIRkJaYj-dwyIA_q-DqlbYCnOQvc5c', '2026-04-28 18:08:48', '2026-04-27 18:08:48', '2026-04-27 18:08:48'),
(151, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzczMTMzMjgsImV4cCI6MTc3NzkxODEyOH0.svavoEi0lVZw6OIRkJaYj-dwyIA_q-DqlbYCnOQvc5c', '2026-04-28 18:08:48', '2026-04-27 18:08:48', '2026-04-27 18:08:48'),
(152, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZUlkIjozLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NzczMTMzMjgsImV4cCI6MTc3NzkxODEyOH0.svavoEi0lVZw6OIRkJaYj-dwyIA_q-DqlbYCnOQvc5c', '2026-04-28 18:08:48', '2026-04-27 18:08:48', '2026-04-27 18:08:48'),
(153, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3NzM1MzgzMiwiZXhwIjoxNzc3OTU4NjMyfQ.-WGDQ2Pa7Rn_F-nrJzbXfa0KncXupXWpy7OdfEeTxak', '2026-04-29 05:23:52', '2026-04-28 05:23:52', '2026-04-28 05:23:52'),
(154, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3NzczOTIyOTAsImV4cCI6MTc3Nzk5NzA5MH0.WH6wmvy5K3b_2lRVTPKh8hpyOsOv5iR7QIEd9VBUF2c', '2026-04-29 16:04:50', '2026-04-28 16:04:50', '2026-04-28 16:04:50'),
(155, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0MDUxNTQsImV4cCI6MTc3ODAwOTk1NH0.ZbByJw50HLHOEES_L6GyRIdo-AKAFLryAeGMeAQl92s', '2026-04-29 19:39:14', '2026-04-28 19:39:14', '2026-04-28 19:39:14'),
(156, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0MDUxNTUsImV4cCI6MTc3ODAwOTk1NX0.zVF775PAjiKcfH599LD5dNHutxcF0UO5LLgXndWybJc', '2026-04-29 19:39:15', '2026-04-28 19:39:15', '2026-04-28 19:39:15'),
(157, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0NDM2MzgsImV4cCI6MTc3ODA0ODQzOH0.Lp1Hfqjc3xAqbFS3ehWMdzyH8socjFeklrofNGK8Mmo', '2026-04-30 06:20:38', '2026-04-29 06:20:38', '2026-04-29 06:20:38'),
(158, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0NDM2MzgsImV4cCI6MTc3ODA0ODQzOH0.Lp1Hfqjc3xAqbFS3ehWMdzyH8socjFeklrofNGK8Mmo', '2026-04-30 06:20:38', '2026-04-29 06:20:38', '2026-04-29 06:20:38'),
(159, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0NDYyNTQsImV4cCI6MTc3ODA1MTA1NH0.Dw3YrujLR886ipygwnnk5z5JEQvpxNvDZzToWvpMdDo', '2026-04-30 07:04:14', '2026-04-29 07:04:14', '2026-04-29 07:04:14'),
(160, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0NDYyNTQsImV4cCI6MTc3ODA1MTA1NH0.Dw3YrujLR886ipygwnnk5z5JEQvpxNvDZzToWvpMdDo', '2026-04-30 07:04:14', '2026-04-29 07:04:14', '2026-04-29 07:04:14'),
(161, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0NDg1NzMsImV4cCI6MTc3ODA1MzM3M30.CY8eByMPgKR3tRqYG0MycxnDVD24NUMvQjMaVOZSE4w', '2026-04-30 07:42:53', '2026-04-29 07:42:53', '2026-04-29 07:42:53'),
(162, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3NzQ0ODU5OSwiZXhwIjoxNzc4MDUzMzk5fQ.j5pTSv8xQsSN76NpCx8lK5tnVOvq_Zr3b006PUfgNzs', '2026-04-30 07:43:19', '2026-04-29 07:43:19', '2026-04-29 07:43:19'),
(163, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0NDg3NzUsImV4cCI6MTc3ODA1MzU3NX0.M8fZbaWiaqykVHdlXjCCFeXgazZ72WjL9C1PeBz0aIo', '2026-04-30 07:46:15', '2026-04-29 07:46:15', '2026-04-29 07:46:15'),
(164, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0NDk1MTAsImV4cCI6MTc3ODA1NDMxMH0.QCPMW8c994R5XGe-kwuPTcncc1rLanazNwQCfEUd2zs', '2026-04-30 07:58:30', '2026-04-29 07:58:30', '2026-04-29 07:58:30'),
(165, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0NDk3MDcsImV4cCI6MTc3ODA1NDUwN30.soFnyXw6tZeOEjtwSuZyyhFcRjacxSjd84F7AzEw4fc', '2026-04-30 08:01:47', '2026-04-29 08:01:47', '2026-04-29 08:01:47'),
(166, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0OTE1NzEsImV4cCI6MTc3ODA5NjM3MX0.YUOK681y2O6gIdotgl4UxLY8awDf_STAejgynGpIr0w', '2026-04-30 19:39:31', '2026-04-29 19:39:31', '2026-04-29 19:39:31'),
(167, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0OTE1NzEsImV4cCI6MTc3ODA5NjM3MX0.YUOK681y2O6gIdotgl4UxLY8awDf_STAejgynGpIr0w', '2026-04-30 19:39:31', '2026-04-29 19:39:31', '2026-04-29 19:39:31'),
(168, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0OTE1NzEsImV4cCI6MTc3ODA5NjM3MX0.YUOK681y2O6gIdotgl4UxLY8awDf_STAejgynGpIr0w', '2026-04-30 19:39:31', '2026-04-29 19:39:31', '2026-04-29 19:39:31'),
(169, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0OTE4NTksImV4cCI6MTc3ODA5NjY1OX0.vk6qk38tBUOEsjvhYBFGsw086yuQyMEq_CmtRDlFxjQ', '2026-04-30 19:44:19', '2026-04-29 19:44:19', '2026-04-29 19:44:19'),
(170, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0OTE4NTksImV4cCI6MTc3ODA5NjY1OX0.vk6qk38tBUOEsjvhYBFGsw086yuQyMEq_CmtRDlFxjQ', '2026-04-30 19:44:19', '2026-04-29 19:44:19', '2026-04-29 19:44:19'),
(171, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc0OTE4NTksImV4cCI6MTc3ODA5NjY1OX0.vk6qk38tBUOEsjvhYBFGsw086yuQyMEq_CmtRDlFxjQ', '2026-04-30 19:44:19', '2026-04-29 19:44:19', '2026-04-29 19:44:19'),
(172, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc1NzU1NDgsImV4cCI6MTc3ODE4MDM0OH0.U3gFrIzdrzGQLVUgm0obT3VEzAdXkO4YwEGPVv1XZe4', '2026-05-01 18:59:08', '2026-04-30 18:59:08', '2026-04-30 18:59:08'),
(173, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc1NzU1NTYsImV4cCI6MTc3ODE4MDM1Nn0.Ow_eBcSFTklc8X34IhurFesTWr_GFDKLggIvFDBLZWw', '2026-05-01 18:59:16', '2026-04-30 18:59:16', '2026-04-30 18:59:16'),
(174, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2MjI5MTksImV4cCI6MTc3ODIyNzcxOX0.bT70xLA8Iayx7qOK7ae_yezQrZedBbFPj92-g4PXu0Q', '2026-05-02 08:08:39', '2026-05-01 08:08:39', '2026-05-01 08:08:39'),
(175, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2MjI5MTksImV4cCI6MTc3ODIyNzcxOX0.bT70xLA8Iayx7qOK7ae_yezQrZedBbFPj92-g4PXu0Q', '2026-05-02 08:08:39', '2026-05-01 08:08:39', '2026-05-01 08:08:39'),
(176, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2MjI5MTksImV4cCI6MTc3ODIyNzcxOX0.bT70xLA8Iayx7qOK7ae_yezQrZedBbFPj92-g4PXu0Q', '2026-05-02 08:08:39', '2026-05-01 08:08:39', '2026-05-01 08:08:39'),
(177, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2MjI5MTksImV4cCI6MTc3ODIyNzcxOX0.bT70xLA8Iayx7qOK7ae_yezQrZedBbFPj92-g4PXu0Q', '2026-05-02 08:08:39', '2026-05-01 08:08:39', '2026-05-01 08:08:39'),
(178, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2MjI5MTksImV4cCI6MTc3ODIyNzcxOX0.bT70xLA8Iayx7qOK7ae_yezQrZedBbFPj92-g4PXu0Q', '2026-05-02 08:08:39', '2026-05-01 08:08:39', '2026-05-01 08:08:39'),
(179, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2MjI5MTksImV4cCI6MTc3ODIyNzcxOX0.bT70xLA8Iayx7qOK7ae_yezQrZedBbFPj92-g4PXu0Q', '2026-05-02 08:08:39', '2026-05-01 08:08:39', '2026-05-01 08:08:39'),
(180, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2MjI5MTksImV4cCI6MTc3ODIyNzcxOX0.bT70xLA8Iayx7qOK7ae_yezQrZedBbFPj92-g4PXu0Q', '2026-05-02 08:08:39', '2026-05-01 08:08:39', '2026-05-01 08:08:39'),
(181, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2MjI5MjAsImV4cCI6MTc3ODIyNzcyMH0.cNSn5rNe-IpQGvA3o3ynnJhrIcexbtHtNjtBM2P_Qdw', '2026-05-02 08:08:40', '2026-05-01 08:08:40', '2026-05-01 08:08:40'),
(182, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3NzYzODU3MSwiZXhwIjoxNzc4MjQzMzcxfQ.kXhFkc4cbXFhkz-9psiB3ABCsfg9cAHMv_yP5jY5gaA', '2026-05-02 12:29:31', '2026-05-01 12:29:31', '2026-05-01 12:29:31'),
(183, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NTQ4NDIsImV4cCI6MTc3ODI1OTY0Mn0.rNMwl2Nf6aOxyZU2bi5qVTRTpE0S-8Zb578Fy0ueb28', '2026-05-02 17:00:42', '2026-05-01 17:00:42', '2026-05-01 17:00:42'),
(184, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDEsImV4cCI6MTc3ODI2NTM0MX0.DRCQtIIfvLIlNzf5sY94fQQ-yPoAv3r8KB9aBS4x3FI', '2026-05-02 18:35:41', '2026-05-01 18:35:41', '2026-05-01 18:35:41'),
(185, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDEsImV4cCI6MTc3ODI2NTM0MX0.DRCQtIIfvLIlNzf5sY94fQQ-yPoAv3r8KB9aBS4x3FI', '2026-05-02 18:35:41', '2026-05-01 18:35:41', '2026-05-01 18:35:41'),
(186, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDEsImV4cCI6MTc3ODI2NTM0MX0.DRCQtIIfvLIlNzf5sY94fQQ-yPoAv3r8KB9aBS4x3FI', '2026-05-02 18:35:41', '2026-05-01 18:35:41', '2026-05-01 18:35:41'),
(187, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDEsImV4cCI6MTc3ODI2NTM0MX0.DRCQtIIfvLIlNzf5sY94fQQ-yPoAv3r8KB9aBS4x3FI', '2026-05-02 18:35:41', '2026-05-01 18:35:41', '2026-05-01 18:35:41'),
(188, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDIsImV4cCI6MTc3ODI2NTM0Mn0.sWf7rUYkgask2pz7-QE3FdnJ6Di2mTAT-jWuMBexi6w', '2026-05-02 18:35:42', '2026-05-01 18:35:42', '2026-05-01 18:35:42'),
(189, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDIsImV4cCI6MTc3ODI2NTM0Mn0.sWf7rUYkgask2pz7-QE3FdnJ6Di2mTAT-jWuMBexi6w', '2026-05-02 18:35:42', '2026-05-01 18:35:42', '2026-05-01 18:35:42'),
(190, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDIsImV4cCI6MTc3ODI2NTM0Mn0.sWf7rUYkgask2pz7-QE3FdnJ6Di2mTAT-jWuMBexi6w', '2026-05-02 18:35:42', '2026-05-01 18:35:42', '2026-05-01 18:35:42'),
(191, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDIsImV4cCI6MTc3ODI2NTM0Mn0.sWf7rUYkgask2pz7-QE3FdnJ6Di2mTAT-jWuMBexi6w', '2026-05-02 18:35:42', '2026-05-01 18:35:42', '2026-05-01 18:35:42'),
(192, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDIsImV4cCI6MTc3ODI2NTM0Mn0.sWf7rUYkgask2pz7-QE3FdnJ6Di2mTAT-jWuMBexi6w', '2026-05-02 18:35:42', '2026-05-01 18:35:42', '2026-05-01 18:35:42'),
(193, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDMsImV4cCI6MTc3ODI2NTM0M30.zSBk_YbqW-qbK2TeeGXqHXN6wKeTBfmcDpwnHqGPSPg', '2026-05-02 18:35:43', '2026-05-01 18:35:43', '2026-05-01 18:35:43'),
(194, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDMsImV4cCI6MTc3ODI2NTM0M30.zSBk_YbqW-qbK2TeeGXqHXN6wKeTBfmcDpwnHqGPSPg', '2026-05-02 18:35:43', '2026-05-01 18:35:43', '2026-05-01 18:35:43'),
(195, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDMsImV4cCI6MTc3ODI2NTM0M30.zSBk_YbqW-qbK2TeeGXqHXN6wKeTBfmcDpwnHqGPSPg', '2026-05-02 18:35:43', '2026-05-01 18:35:43', '2026-05-01 18:35:43'),
(196, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc2NjA1NDMsImV4cCI6MTc3ODI2NTM0M30.zSBk_YbqW-qbK2TeeGXqHXN6wKeTBfmcDpwnHqGPSPg', '2026-05-02 18:35:43', '2026-05-01 18:35:43', '2026-05-01 18:35:43');
INSERT INTO `tokenstores` (`id`, `userId`, `token`, `expiresAt`, `createdAt`, `updatedAt`) VALUES
(197, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc3MDYzNjgsImV4cCI6MTc3ODMxMTE2OH0.WPCTK3wytYbCLn8J06a1yH1uRCZeJDLnNVejJ2Zjy1o', '2026-05-03 07:19:28', '2026-05-02 07:19:28', '2026-05-02 07:19:28'),
(198, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc3MDY1NDksImV4cCI6MTc3ODMxMTM0OX0.f3TxRloHndEq-I0F8B0z5xZ9rV1gErXyOonDe5AFt8E', '2026-05-03 07:22:29', '2026-05-02 07:22:29', '2026-05-02 07:22:29'),
(199, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc3MDcwNzQsImV4cCI6MTc3ODMxMTg3NH0.MIdOB6ClXmiX3ElQyJef2Aa40-y8mCFcgR-DK-dmVaY', '2026-05-03 07:31:14', '2026-05-02 07:31:14', '2026-05-02 07:31:14'),
(200, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc3NDkzMjQsImV4cCI6MTc3ODM1NDEyNH0.e_vUu4fTqbUxQZSt69_mg_RJ37_93B_aBHs-28jx8z4', '2026-05-03 19:15:24', '2026-05-02 19:15:24', '2026-05-02 19:15:24'),
(201, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc3NDkzMjQsImV4cCI6MTc3ODM1NDEyNH0.e_vUu4fTqbUxQZSt69_mg_RJ37_93B_aBHs-28jx8z4', '2026-05-03 19:15:24', '2026-05-02 19:15:24', '2026-05-02 19:15:24'),
(202, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc3NDkzMjQsImV4cCI6MTc3ODM1NDEyNH0.e_vUu4fTqbUxQZSt69_mg_RJ37_93B_aBHs-28jx8z4', '2026-05-03 19:15:24', '2026-05-02 19:15:24', '2026-05-02 19:15:24'),
(203, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc3NDkzMjQsImV4cCI6MTc3ODM1NDEyNH0.e_vUu4fTqbUxQZSt69_mg_RJ37_93B_aBHs-28jx8z4', '2026-05-03 19:15:24', '2026-05-02 19:15:24', '2026-05-02 19:15:24'),
(204, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc3NDkzMjQsImV4cCI6MTc3ODM1NDEyNH0.e_vUu4fTqbUxQZSt69_mg_RJ37_93B_aBHs-28jx8z4', '2026-05-03 19:15:24', '2026-05-02 19:15:24', '2026-05-02 19:15:24'),
(205, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc3NDkzMjQsImV4cCI6MTc3ODM1NDEyNH0.e_vUu4fTqbUxQZSt69_mg_RJ37_93B_aBHs-28jx8z4', '2026-05-03 19:15:24', '2026-05-02 19:15:24', '2026-05-02 19:15:24'),
(206, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc4MTkwNzIsImV4cCI6MTc3ODQyMzg3Mn0.bp_iDrXXiriuVdzl18UvXl9IlXrXMQkf9w3oLfOQiVk', '2026-05-04 14:37:52', '2026-05-03 14:37:52', '2026-05-03 14:37:52'),
(207, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc4MTkwNzIsImV4cCI6MTc3ODQyMzg3Mn0.bp_iDrXXiriuVdzl18UvXl9IlXrXMQkf9w3oLfOQiVk', '2026-05-04 14:37:52', '2026-05-03 14:37:52', '2026-05-03 14:37:52'),
(208, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc4MTkwNzIsImV4cCI6MTc3ODQyMzg3Mn0.bp_iDrXXiriuVdzl18UvXl9IlXrXMQkf9w3oLfOQiVk', '2026-05-04 14:37:52', '2026-05-03 14:37:52', '2026-05-03 14:37:52'),
(209, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc4MTkwNzIsImV4cCI6MTc3ODQyMzg3Mn0.bp_iDrXXiriuVdzl18UvXl9IlXrXMQkf9w3oLfOQiVk', '2026-05-04 14:37:52', '2026-05-03 14:37:52', '2026-05-03 14:37:52'),
(210, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc4MzM2NzYsImV4cCI6MTc3ODQzODQ3Nn0.8qTzk00mq8pe-n82hOrR8jTHQQ5QYvbEmuWKpRba2NY', '2026-05-04 18:41:16', '2026-05-03 18:41:16', '2026-05-03 18:41:16'),
(211, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc4MzM2NzYsImV4cCI6MTc3ODQzODQ3Nn0.8qTzk00mq8pe-n82hOrR8jTHQQ5QYvbEmuWKpRba2NY', '2026-05-04 18:41:16', '2026-05-03 18:41:16', '2026-05-03 18:41:16'),
(212, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc4MzM2NzYsImV4cCI6MTc3ODQzODQ3Nn0.8qTzk00mq8pe-n82hOrR8jTHQQ5QYvbEmuWKpRba2NY', '2026-05-04 18:41:16', '2026-05-03 18:41:16', '2026-05-03 18:41:16'),
(213, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc4MzM2NzYsImV4cCI6MTc3ODQzODQ3Nn0.8qTzk00mq8pe-n82hOrR8jTHQQ5QYvbEmuWKpRba2NY', '2026-05-04 18:41:16', '2026-05-03 18:41:16', '2026-05-03 18:41:16'),
(214, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc4MzM2ODMsImV4cCI6MTc3ODQzODQ4M30.5xavDfTj_ZzofxAApkmzZBEKNI41-E3w7hcw4ogUFug', '2026-05-04 18:41:23', '2026-05-03 18:41:23', '2026-05-03 18:41:23'),
(215, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc4MzM2ODksImV4cCI6MTc3ODQzODQ4OX0.uCsIIik4gx0bOhRwiSuiMWIw3Fa07g_J-JL6cXeJIvM', '2026-05-04 18:41:29', '2026-05-03 18:41:29', '2026-05-03 18:41:29'),
(216, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc5MDkzMTAsImV4cCI6MTc3ODUxNDExMH0.CzoBhAP02Ng5AvKLbgXLj7QxkMw4rZO51k9gUdpO7eg', '2026-05-05 15:41:50', '2026-05-04 15:41:50', '2026-05-04 15:41:50'),
(217, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc5MDkzMjksImV4cCI6MTc3ODUxNDEyOX0.1BgSGT2nXqWFqkATWwP2c1tvWpwzYKuE67wli3dAkYU', '2026-05-05 15:42:09', '2026-05-04 15:42:09', '2026-05-04 15:42:09'),
(218, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc5MDkzMzUsImV4cCI6MTc3ODUxNDEzNX0.LoP7r0NcN-hpE45hhxQlYEIP586UUeq1_1u8E1naYuQ', '2026-05-05 15:42:15', '2026-05-04 15:42:15', '2026-05-04 15:42:15'),
(219, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc5MTg4NzMsImV4cCI6MTc3ODUyMzY3M30.cbwdEBftaaKpNHADHovz_XPf38mqLg1woG1T7StwjwI', '2026-05-05 18:21:13', '2026-05-04 18:21:13', '2026-05-04 18:21:13'),
(220, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc5MTg4NzMsImV4cCI6MTc3ODUyMzY3M30.cbwdEBftaaKpNHADHovz_XPf38mqLg1woG1T7StwjwI', '2026-05-05 18:21:13', '2026-05-04 18:21:13', '2026-05-04 18:21:13'),
(221, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc5MTg4NzMsImV4cCI6MTc3ODUyMzY3M30.cbwdEBftaaKpNHADHovz_XPf38mqLg1woG1T7StwjwI', '2026-05-05 18:21:13', '2026-05-04 18:21:13', '2026-05-04 18:21:13'),
(222, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInJvbGVJZCI6Miwicm9sZSI6Ik1hbmFnZXIiLCJpYXQiOjE3Nzc5MTg4ODgsImV4cCI6MTc3ODUyMzY4OH0.6ABBnj8xP-4Ino88FXTnJ6JzWY0qvad7AqQXn0xIyEI', '2026-05-05 18:21:28', '2026-05-04 18:21:28', '2026-05-04 18:21:28'),
(223, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZUlkIjoxLCJyb2xlIjoiUm9vdCIsImlhdCI6MTc3Nzk3MTk5MiwiZXhwIjoxNzc4NTc2NzkyfQ.zZN-VMruVv-trr9ZUW7HOSfZcMgGu1LfRBNbZDQXURk', '2026-05-06 09:06:32', '2026-05-05 09:06:32', '2026-05-05 09:06:32');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `businessId`, `name`, `isActive`, `createdAt`, `updatedAt`) VALUES
(2, 1, 'Gram', 1, '2025-09-25 07:40:24', '2025-09-25 07:40:24'),
(3, 1, 'NoS', 1, '2025-09-25 07:40:31', '2025-09-25 07:40:31');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `roleId` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `countryCode` varchar(255) DEFAULT NULL,
  `phoneCode` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `businessId`, `roleId`, `name`, `email`, `countryCode`, `phoneCode`, `phoneNumber`, `password`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 'Root Admin', 'root@gmail.com', NULL, NULL, NULL, '$2b$10$AYH0K77rR4ImxqitIWLHcObk0EXyCR.aJMrJog4Xo0JXxS4r5wTe2', 1, '2025-08-25 04:43:09', '2025-08-25 04:43:09'),
(2, 1, 3, 'Admin', 'admin@gmail.com', 'AE', '+971', '562531105', '$2b$10$FrxVILY5V66oSzLbQDO9pOE4PisvYB8QCDn1qc/KwAvVnENf8gRw.', 1, '2025-08-25 04:43:09', '2026-03-07 07:14:51'),
(11, 1, 2, 'Manager', 'nazim.sedarglobal@yahoo.com', 'AE', '+971', '551464220', '$2b$10$.944lNBO7iW7tuxiuyKf7OafdkMopYrTwTWBry6PFr.KjfxcY6Txe', 1, '2025-08-31 15:42:46', '2026-04-28 16:04:34');

-- --------------------------------------------------------

--
-- Table structure for table `warehouses`
--

CREATE TABLE `warehouses` (
  `id` int(11) NOT NULL,
  `businessId` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `details` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `warehouses`
--

INSERT INTO `warehouses` (`id`, `businessId`, `name`, `details`, `location`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'SHM Store', 'SHM Store', 'Dubai', 1, '2025-09-28 10:45:33', '2025-09-28 10:45:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `banks`
--
ALTER TABLE `banks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`);

--
-- Indexes for table `businesses`
--
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`);

--
-- Indexes for table `containers`
--
ALTER TABLE `containers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`),
  ADD KEY `createdUserId` (`createdUserId`),
  ADD KEY `updatedUserId` (`updatedUserId`);

--
-- Indexes for table `gold_price_ins`
--
ALTER TABLE `gold_price_ins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`),
  ADD KEY `createdBy` (`createdBy`),
  ADD KEY `updatedBy` (`updatedBy`);

--
-- Indexes for table `invoiceitems`
--
ALTER TABLE `invoiceitems`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoiceId` (`invoiceId`),
  ADD KEY `itemId` (`itemId`),
  ADD KEY `containerId` (`containerId`),
  ADD KEY `warehouseId` (`warehouseId`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`),
  ADD KEY `categoryId` (`categoryId`),
  ADD KEY `containerId` (`containerId`),
  ADD KEY `partyId` (`partyId`),
  ADD KEY `createdBy` (`createdBy`),
  ADD KEY `updatedBy` (`updatedBy`),
  ADD KEY `deletedBy` (`deletedBy`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`),
  ADD KEY `categoryId` (`categoryId`);

--
-- Indexes for table `ledgers`
--
ALTER TABLE `ledgers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`),
  ADD KEY `categoryId` (`categoryId`),
  ADD KEY `partyId` (`partyId`),
  ADD KEY `invoiceId` (`invoiceId`),
  ADD KEY `paymentId` (`paymentId`),
  ADD KEY `stockId` (`stockId`),
  ADD KEY `bankId` (`bankId`),
  ADD KEY `createdBy` (`createdBy`),
  ADD KEY `updatedBy` (`updatedBy`),
  ADD KEY `deletedBy` (`deletedBy`);

--
-- Indexes for table `parties`
--
ALTER TABLE `parties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`),
  ADD KEY `partyId` (`partyId`),
  ADD KEY `categoryId` (`categoryId`),
  ADD KEY `containerId` (`containerId`),
  ADD KEY `invoiceId` (`invoiceId`),
  ADD KEY `createdBy` (`createdBy`),
  ADD KEY `updatedBy` (`updatedBy`),
  ADD KEY `deletedBy` (`deletedBy`),
  ADD KEY `bankId` (`bankId`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userId` (`userId`);

--
-- Indexes for table `rolepermissions`
--
ALTER TABLE `rolepermissions`
  ADD PRIMARY KEY (`roleId`,`permissionId`),
  ADD UNIQUE KEY `rolepermissions_permissionId_roleId_unique` (`roleId`,`permissionId`),
  ADD UNIQUE KEY `rolepermissions_role_id_permission_id` (`roleId`,`permissionId`),
  ADD KEY `permissionId` (`permissionId`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`);

--
-- Indexes for table `statustypes`
--
ALTER TABLE `statustypes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`),
  ADD KEY `invoiceId` (`invoiceId`),
  ADD KEY `warehouseId` (`warehouseId`),
  ADD KEY `bankId` (`bankId`),
  ADD KEY `containerId` (`containerId`),
  ADD KEY `itemId` (`itemId`),
  ADD KEY `createdBy` (`createdBy`),
  ADD KEY `updatedBy` (`updatedBy`),
  ADD KEY `deletedBy` (`deletedBy`),
  ADD KEY `partyId` (`partyId`);

--
-- Indexes for table `tokenstores`
--
ALTER TABLE `tokenstores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`),
  ADD KEY `roleId` (`roleId`);

--
-- Indexes for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businessId` (`businessId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `banks`
--
ALTER TABLE `banks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `businesses`
--
ALTER TABLE `businesses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `containers`
--
ALTER TABLE `containers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gold_price_ins`
--
ALTER TABLE `gold_price_ins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `invoiceitems`
--
ALTER TABLE `invoiceitems`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `ledgers`
--
ALTER TABLE `ledgers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT for table `parties`
--
ALTER TABLE `parties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `statustypes`
--
ALTER TABLE `statustypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `tokenstores`
--
ALTER TABLE `tokenstores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=224;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `warehouses`
--
ALTER TABLE `warehouses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `banks`
--
ALTER TABLE `banks`
  ADD CONSTRAINT `banks_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `containers`
--
ALTER TABLE `containers`
  ADD CONSTRAINT `containers_ibfk_1111` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `containers_ibfk_1112` FOREIGN KEY (`createdUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `containers_ibfk_1113` FOREIGN KEY (`updatedUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `gold_price_ins`
--
ALTER TABLE `gold_price_ins`
  ADD CONSTRAINT `gold_price_ins_ibfk_85` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `gold_price_ins_ibfk_86` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `gold_price_ins_ibfk_87` FOREIGN KEY (`updatedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoiceitems`
--
ALTER TABLE `invoiceitems`
  ADD CONSTRAINT `invoiceitems_ibfk_1342` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoiceitems_ibfk_1343` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `invoiceitems_ibfk_1344` FOREIGN KEY (`containerId`) REFERENCES `containers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoiceitems_ibfk_1345` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_2368` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2369` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2370` FOREIGN KEY (`containerId`) REFERENCES `containers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2371` FOREIGN KEY (`partyId`) REFERENCES `parties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2372` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2373` FOREIGN KEY (`updatedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2374` FOREIGN KEY (`deletedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_745` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `items_ibfk_746` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ledgers`
--
ALTER TABLE `ledgers`
  ADD CONSTRAINT `ledgers_ibfk_3351` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ledgers_ibfk_3352` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ledgers_ibfk_3353` FOREIGN KEY (`partyId`) REFERENCES `parties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ledgers_ibfk_3354` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ledgers_ibfk_3355` FOREIGN KEY (`paymentId`) REFERENCES `payments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ledgers_ibfk_3356` FOREIGN KEY (`stockId`) REFERENCES `stocks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ledgers_ibfk_3357` FOREIGN KEY (`bankId`) REFERENCES `banks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ledgers_ibfk_3358` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ledgers_ibfk_3359` FOREIGN KEY (`updatedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ledgers_ibfk_3360` FOREIGN KEY (`deletedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `parties`
--
ALTER TABLE `parties`
  ADD CONSTRAINT `parties_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_3028` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3029` FOREIGN KEY (`partyId`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3030` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3031` FOREIGN KEY (`containerId`) REFERENCES `containers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3032` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3033` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3034` FOREIGN KEY (`updatedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3035` FOREIGN KEY (`deletedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_ibfk_3036` FOREIGN KEY (`bankId`) REFERENCES `banks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rolepermissions`
--
ALTER TABLE `rolepermissions`
  ADD CONSTRAINT `rolepermissions_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rolepermissions_ibfk_2` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `roles`
--
ALTER TABLE `roles`
  ADD CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `statustypes`
--
ALTER TABLE `statustypes`
  ADD CONSTRAINT `statustypes_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `stocks`
--
ALTER TABLE `stocks`
  ADD CONSTRAINT `stocks_ibfk_3294` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_3295` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_3296` FOREIGN KEY (`partyId`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_3297` FOREIGN KEY (`warehouseId`) REFERENCES `warehouses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_3298` FOREIGN KEY (`bankId`) REFERENCES `banks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_3299` FOREIGN KEY (`containerId`) REFERENCES `containers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_3300` FOREIGN KEY (`itemId`) REFERENCES `items` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_3301` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_3302` FOREIGN KEY (`updatedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `stocks_ibfk_3303` FOREIGN KEY (`deletedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `tokenstores`
--
ALTER TABLE `tokenstores`
  ADD CONSTRAINT `tokenstores_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `units`
--
ALTER TABLE `units`
  ADD CONSTRAINT `units_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_741` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_742` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `warehouses`
--
ALTER TABLE `warehouses`
  ADD CONSTRAINT `warehouses_ibfk_1` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
