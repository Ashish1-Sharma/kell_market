-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 30, 2026 at 04:36 PM
-- Server version: 11.8.8-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u633472649_ramdev`
--

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `desktop_banner` varchar(200) NOT NULL,
  `mombile_banner` varchar(200) DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_inquery`
--

CREATE TABLE `cart_inquery` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone_no` varchar(50) NOT NULL,
  `city` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `inquery_date` date NOT NULL,
  `status` varchar(20) DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companyprofile`
--

CREATE TABLE `companyprofile` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `your_name` varchar(100) NOT NULL,
  `companyaddress` varchar(200) NOT NULL,
  `email_id` varchar(200) NOT NULL,
  `phone_number` varchar(30) NOT NULL,
  `alt_phone_number` varchar(30) NOT NULL,
  `website_link` varchar(500) NOT NULL,
  `gst_tax_id` varchar(100) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `about_short_des` varchar(500) DEFAULT NULL,
  `banner_img` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `currency_type`
--

CREATE TABLE `currency_type` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `country_name` varchar(50) NOT NULL,
  `currency_name` varchar(50) NOT NULL,
  `currency_symbol` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `shop_name` varchar(255) DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `shop_address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `admin_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `featured_products`
--

CREATE TABLE `featured_products` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `item_master`
--

CREATE TABLE `item_master` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_name` varchar(500) NOT NULL,
  `item_desc` varchar(1000) NOT NULL,
  `item_price` varchar(100) NOT NULL,
  `item_dis_price` varchar(100) DEFAULT NULL,
  `item_quantity` varchar(100) NOT NULL,
  `item_category` varchar(200) NOT NULL,
  `product_status` varchar(100) NOT NULL DEFAULT 'Active',
  `item_image` varchar(1000) NOT NULL,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `master_user`
--

CREATE TABLE `master_user` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(320) DEFAULT NULL,
  `country_code` varchar(10) DEFAULT NULL,
  `phone_number` varchar(30) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `registered_date` date DEFAULT NULL,
  `purchase_flag` int(11) NOT NULL DEFAULT 0,
  `account_status` varchar(1) NOT NULL DEFAULT 'A',
  `password` text DEFAULT NULL,
  `subscription_plan_id` int(11) DEFAULT 1,
  `product_count` int(11) DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ordered_products`
--

CREATE TABLE `ordered_products` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `inquiry_customer` int(11) NOT NULL,
  `quantity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_category`
--

CREATE TABLE `product_category` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_name` varchar(200) NOT NULL,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_info`
--

CREATE TABLE `subscription_info` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `validity` datetime DEFAULT NULL,
  `purchase_date` datetime DEFAULT NULL,
  `purchase_id` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plan`
--

CREATE TABLE `subscription_plan` (
  `id` int(11) NOT NULL,
  `plan_name` varchar(50) NOT NULL,
  `plan_validity` int(11) NOT NULL,
  `plan_price` int(11) NOT NULL,
  `plan_product_count` varchar(10) NOT NULL,
  `pay_key` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_user`
--

CREATE TABLE `sub_user` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` text DEFAULT NULL,
  `number` int(11) DEFAULT NULL,
  `account_status` text DEFAULT NULL,
  `created_date` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wishlist_products`
--

CREATE TABLE `wishlist_products` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `cart_inquery`
--
ALTER TABLE `cart_inquery`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `companyprofile`
--
ALTER TABLE `companyprofile`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_company_profile` (`user_id`);

--
-- Indexes for table `currency_type`
--
ALTER TABLE `currency_type`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `token` (`token`);

--
-- Indexes for table `featured_products`
--
ALTER TABLE `featured_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `item_master`
--
ALTER TABLE `item_master`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_master_fk` (`user_id`);

--
-- Indexes for table `master_user`
--
ALTER TABLE `master_user`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `subscription_plan_id` (`subscription_plan_id`);

--
-- Indexes for table `ordered_products`
--
ALTER TABLE `ordered_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inquiry_customer` (`inquiry_customer`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `product_category`
--
ALTER TABLE `product_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category` (`user_id`);

--
-- Indexes for table `subscription_info`
--
ALTER TABLE `subscription_info`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subscription_info` (`user_id`);

--
-- Indexes for table `subscription_plan`
--
ALTER TABLE `subscription_plan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sub_user`
--
ALTER TABLE `sub_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sub_user` (`user_id`);

--
-- Indexes for table `wishlist_products`
--
ALTER TABLE `wishlist_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cart_inquery`
--
ALTER TABLE `cart_inquery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companyprofile`
--
ALTER TABLE `companyprofile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `currency_type`
--
ALTER TABLE `currency_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `featured_products`
--
ALTER TABLE `featured_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `item_master`
--
ALTER TABLE `item_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `master_user`
--
ALTER TABLE `master_user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ordered_products`
--
ALTER TABLE `ordered_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_category`
--
ALTER TABLE `product_category`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_info`
--
ALTER TABLE `subscription_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_plan`
--
ALTER TABLE `subscription_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sub_user`
--
ALTER TABLE `sub_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wishlist_products`
--
ALTER TABLE `wishlist_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `banners`
--
ALTER TABLE `banners`
  ADD CONSTRAINT `banners_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `master_user` (`user_id`);

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `item_master` (`id`),
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `master_user` (`user_id`);

--
-- Constraints for table `cart_inquery`
--
ALTER TABLE `cart_inquery`
  ADD CONSTRAINT `cart_inquery_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `master_user` (`user_id`);

--
-- Constraints for table `companyprofile`
--
ALTER TABLE `companyprofile`
  ADD CONSTRAINT `fk_company_profile` FOREIGN KEY (`user_id`) REFERENCES `master_user` (`user_id`);

--
-- Constraints for table `currency_type`
--
ALTER TABLE `currency_type`
  ADD CONSTRAINT `currency_type_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `master_user` (`user_id`);

--
-- Constraints for table `featured_products`
--
ALTER TABLE `featured_products`
  ADD CONSTRAINT `featured_products_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `item_master` (`id`),
  ADD CONSTRAINT `featured_products_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `master_user` (`user_id`);

--
-- Constraints for table `item_master`
--
ALTER TABLE `item_master`
  ADD CONSTRAINT `item_master_fk` FOREIGN KEY (`user_id`) REFERENCES `master_user` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
