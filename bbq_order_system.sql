/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80035
 Source Host           : localhost:3306
 Source Schema         : bbq_order_system

 Target Server Type    : MySQL
 Target Server Version : 80035
 File Encoding         : 65001

 Date: 12/01/2025 13:33:32
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admins
-- ----------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `IDX_4ba6d0c734d53f8e1b2e24b6c5`(`username`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `IDX_8b0be371d28245da6e4f4b6187`(`name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, '肉类', '2025-01-12 12:52:51.054819', '2025-01-12 12:52:51.100076');
INSERT INTO `categories` VALUES (2, '海鲜', '2025-01-12 12:52:51.054819', '2025-01-12 12:52:51.100076');
INSERT INTO `categories` VALUES (3, '蔬菜', '2025-01-12 12:52:51.054819', '2025-01-12 12:52:51.100076');
INSERT INTO `categories` VALUES (4, '主食', '2025-01-12 12:52:51.054819', '2025-01-12 12:52:51.100076');

-- ----------------------------
-- Table structure for coupons
-- ----------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `discount_type` enum('percentage','fixed') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `discount_value` decimal(10, 2) NOT NULL,
  `min_order_amount` decimal(10, 2) NULL DEFAULT NULL,
  `start_date` date NULL DEFAULT NULL,
  `end_date` date NULL DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `IDX_e025109230e82925843f2a14c4`(`code`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for order_items
-- ----------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `order_id` int(0) NOT NULL,
  `product_id` int(0) NOT NULL,
  `quantity` int(0) NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_145532db85752b29c57d2b7b1f1`(`order_id`) USING BTREE,
  INDEX `FK_9263386c35b6b242540f9493b00`(`product_id`) USING BTREE,
  CONSTRAINT `FK_145532db85752b29c57d2b7b1f1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_9263386c35b6b242540f9493b00` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `user_id` int(0) NOT NULL,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `order_date` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_amount` decimal(10, 2) NOT NULL,
  `coupon_id` int(0) NULL DEFAULT NULL,
  `discount_amount` decimal(10, 2) NULL DEFAULT NULL,
  `final_amount` decimal(10, 2) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_a922b820eeef29ac1c6800e826a`(`user_id`) USING BTREE,
  INDEX `FK_6284f0f60e4cb96c12ff96f0f15`(`coupon_id`) USING BTREE,
  CONSTRAINT `FK_6284f0f60e4cb96c12ff96f0f15` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_a922b820eeef29ac1c6800e826a` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cost_price` decimal(10, 2) NOT NULL,
  `sale_price` decimal(10, 2) NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `quantity` int(0) NOT NULL DEFAULT 0,
  `category_id` int(0) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `sold_quantity` int(0) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_9a5f6868c96e0069e699f33e124`(`category_id`) USING BTREE,
  CONSTRAINT `FK_9a5f6868c96e0069e699f33e124` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, '烤羊肉串', 4.50, 9.00, 'https://cdn.pixabay.com/photo/2022/09/10/12/35/mutton-tikka-boti-7444981_1280.jpg', 100, 1, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (2, '烤牛肉串', 3.50, 7.00, 'https://cdn.pixabay.com/photo/2020/05/12/07/58/supper-5161710_1280.jpg', 100, 1, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (3, '烤鸡翅', 3.50, 7.00, 'https://cdn.pixabay.com/photo/2020/06/13/16/26/barbecue-5294861_960_720.jpg', 100, 1, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (4, '烤鸡腿', 5.00, 10.00, 'https://cdn.pixabay.com/photo/2018/06/01/20/25/chicken-3447081_960_720.jpg', 100, 1, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (5, '烤五花肉', 4.50, 9.00, 'https://cdn.pixabay.com/photo/2011/08/18/02/37/grill-flares-8959_960_720.jpg', 100, 1, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (6, '烤香肠', 2.50, 5.00, 'https://cdn.pixabay.com/photo/2018/05/20/17/39/roast-3416332_960_720.jpg', 100, 1, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (7, '烤鱿鱼', 6.00, 12.00, 'https://cdn.pixabay.com/photo/2015/03/25/19/38/squid-689385_960_720.jpg', 100, 2, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (8, '烤生蚝', 7.50, 15.00, 'https://cdn.pixabay.com/photo/2016/11/18/17/05/delicious-1835848_1280.jpg', 100, 2, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (9, '烤虾', 7.00, 14.00, 'https://cdn.pixabay.com/photo/2021/11/02/02/20/grilled-prawns-6762328_960_720.jpg', 100, 2, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (10, '烤茄子', 3.00, 6.00, 'https://cdn.pixabay.com/photo/2015/09/11/12/28/eggplant-935715_960_720.jpg', 100, 3, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (11, '烤韭菜', 2.50, 5.00, 'https://pic3.zhimg.com/v2-79ccefea3798c869b25ccc11ac48a20a_r.jpg', 100, 3, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (12, '烤玉米', 2.00, 4.00, 'https://th.bing.com/th/id/OIP.wWxsoNRoCA1IXq4rMu9DPwHaE8?rs=1&pid=ImgDetMain', 100, 3, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (13, '烤金针菇', 2.50, 5.00, 'https://th.bing.com/th/id/OIP.4uP4Cs7sNfsEzWTxEuh58gHaE8?rs=1&pid=ImgDetMain', 100, 3, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (14, '烤土豆片', 2.00, 4.00, 'https://img95.699pic.com/photo/50099/7139.jpg_wh860.jpg', 100, 3, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);
INSERT INTO `products` VALUES (15, '烤年糕', 2.00, 4.00, 'https://th.bing.com/th/id/OIP.3VCucJymYHtgai60NKA0QQHaE8?rs=1&pid=ImgDetMain', 100, 4, '2025-01-12 12:52:50.930457', '2025-01-12 12:52:50.969843', 0);

-- ----------------------------
-- Table structure for purchases
-- ----------------------------
DROP TABLE IF EXISTS `purchases`;
CREATE TABLE `purchases`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `product_id` int(0) NOT NULL,
  `quantity` int(0) NOT NULL,
  `purchase_price` decimal(10, 2) NOT NULL,
  `purchase_date` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_1ce91bd87ddfcecde930deeaab9`(`product_id`) USING BTREE,
  CONSTRAINT `FK_1ce91bd87ddfcecde930deeaab9` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for statistics
-- ----------------------------
DROP TABLE IF EXISTS `statistics`;
CREATE TABLE `statistics`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `report_date` date NOT NULL,
  `total_orders` int(0) NOT NULL,
  `min_order_amount` decimal(10, 2) NULL DEFAULT NULL,
  `max_order_amount` decimal(10, 2) NULL DEFAULT NULL,
  `avg_order_amount` decimal(10, 2) NULL DEFAULT NULL,
  `first_order_time` timestamp(0) NULL DEFAULT NULL,
  `last_order_time` timestamp(0) NULL DEFAULT NULL,
  `total_revenue` decimal(10, 2) NOT NULL,
  `total_cost` decimal(10, 2) NOT NULL,
  `total_profit` decimal(10, 2) NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `IDX_65b04ef820151b3b2d3088e59c`(`report_date`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(0) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `phone_number` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `IDX_17d1817f241f10a3dbafb169fd`(`phone_number`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
