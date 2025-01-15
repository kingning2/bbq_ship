-- 创建数据库
CREATE DATABASE IF NOT EXISTS bbq_order_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bbq_order_system;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `role` enum('customer','business') NOT NULL DEFAULT 'customer' COMMENT '角色：customer-顾客，business-商家',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 商品分类表
CREATE TABLE IF NOT EXISTS category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 商品表
CREATE TABLE IF NOT EXISTS product (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(255) DEFAULT NULL,
  status ENUM('on', 'off') NOT NULL DEFAULT 'on',
  sold_quantity INT NOT NULL DEFAULT 0,
  is_hot BOOLEAN NOT NULL DEFAULT false,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 优惠券表
CREATE TABLE IF NOT EXISTS `coupon` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL COMMENT '优惠券码',
  `name` varchar(50) NOT NULL COMMENT '优惠券名称',
  `type` enum('amount','percentage') NOT NULL COMMENT '优惠券类型：固定金额或百分比',
  `value` decimal(10,2) NOT NULL COMMENT '优惠值',
  `min_amount` decimal(10,2) DEFAULT NULL COMMENT '最低使用金额',
  `probability` decimal(5,2) NOT NULL DEFAULT '100.00' COMMENT '抽奖概率',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否有效',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表'; 

-- 用户优惠券关联表
CREATE TABLE IF NOT EXISTS `user_coupon` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `coupon_id` int NOT NULL COMMENT '优惠券ID',
  `is_used` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已使用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_coupon_id` (`coupon_id`),
  CONSTRAINT `fk_user_coupon_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_user_coupon_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupon` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户优惠券关联表';

-- 订单表
CREATE TABLE IF NOT EXISTS `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `user_id` int NOT NULL COMMENT '用户ID',
  `status` enum('pending','processing','completed','cancelled') NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  `original_amount` decimal(10,2) NOT NULL COMMENT '原始金额',
  `discount_amount` decimal(10,2) DEFAULT '0.00' COMMENT '优惠金额',
  `final_amount` decimal(10,2) NOT NULL COMMENT '最终支付金额',
  `coupon_id` int DEFAULT NULL COMMENT '优惠券ID',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `delivery_type` varchar(20) NOT NULL COMMENT '配送方式',
  `address` varchar(255) DEFAULT NULL COMMENT '配送地址',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_coupon_id` (`coupon_id`),
  CONSTRAINT `fk_order_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupon` (`id`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 订单项表
CREATE TABLE IF NOT EXISTS `order_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL COMMENT '订单ID',
  `product_id` int NOT NULL COMMENT '商品ID',
  `quantity` int NOT NULL COMMENT '数量',
  `price` decimal(10,2) NOT NULL COMMENT '单价',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_product_id` (`product_id`),
  CONSTRAINT `fk_order_item_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`),
  CONSTRAINT `fk_order_item_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单项表';

-- 创建采购表
CREATE TABLE IF NOT EXISTS purchase (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  supplier VARCHAR(100) NOT NULL,
  remark TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES product(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入初始管理员账号 -- 密码：159476
INSERT INTO user (username, password, role) VALUES ('admin', '1e1692bf525d88abf663ece93fe486c8', 'business');

-- 插入初始分类数据
INSERT INTO category (name, description) VALUES 
('烤肉', '各种美味的烤肉'),
('海鲜', '新鲜的海鲜烧烤'),
('蔬菜', '健康的烤蔬菜'),
('主食', '美味的主食');

-- 插入初始商品数据
INSERT INTO product (name, description, price, stock, image, status, is_hot, category_id) VALUES 
('烤羊肉串', '新鲜羊肉串，调味均匀', 9.00, 0, 'https://cdn.pixabay.com/photo/2022/09/10/12/35/mutton-tikka-boti-7444981_1280.jpg', DEFAULT, true, 1),
('烤牛肉串', '精选牛肉，鲜嫩多汁', 7.00, 0, 'https://cdn.pixabay.com/photo/2020/05/12/07/58/supper-5161710_1280.jpg', DEFAULT, true, 1),
('烤鸡翅', '鸡翅外焦里嫩，香气四溢', 7.00, 0, 'https://cdn.pixabay.com/photo/2020/06/13/16/26/barbecue-5294861_960_720.jpg', DEFAULT, DEFAULT, 1),
('烤鸡腿', '精选鸡腿，肉质鲜美', 10.00, 0, 'https://cdn.pixabay.com/photo/2018/06/01/20/25/chicken-3447081_960_720.jpg', DEFAULT, DEFAULT, 1),
('烤五花肉', '五花肉肥瘦均匀，口感绝佳', 9.00, 0, 'https://cdn.pixabay.com/photo/2011/08/18/02/37/grill-flares-8959_960_720.jpg', DEFAULT, true, 1),
('烤香肠', '美味香肠，外焦里嫩', 5.00, 0, 'https://cdn.pixabay.com/photo/2018/05/20/17/39/roast-3416332_960_720.jpg', DEFAULT, DEFAULT, 1),
('烤鱿鱼', '新鲜鱿鱼，嫩滑可口', 12.00, 0, 'https://cdn.pixabay.com/photo/2015/03/25/19/38/squid-689385_960_720.jpg', DEFAULT, true, 2),
('烤生蚝', '新鲜生蚝，个大肥美', 15.00, 0, 'https://cdn.pixabay.com/photo/2016/11/18/17/05/delicious-1835848_1280.jpg', DEFAULT, true, 2),
('烤虾', '鲜虾刷油烤制，外焦里嫩', 14.00, 0, 'https://cdn.pixabay.com/photo/2021/11/02/02/20/grilled-prawns-6762328_960_720.jpg', DEFAULT, true, 2),
('烤茄子', '农家茄子，外焦内软', 6.00, 0, 'https://cdn.pixabay.com/photo/2015/09/11/12/28/eggplant-935715_960_720.jpg', DEFAULT, DEFAULT, 3),
('烤韭菜', '新鲜韭菜，清香可口', 5.00, 0, 'https://pic3.zhimg.com/v2-79ccefea3798c869b25ccc11ac48a20a_r.jpg', DEFAULT, DEFAULT, 3),
('烤玉米', '甜糯玉米，香甜可口', 4.00, 0, 'https://th.bing.com/th/id/OIP.wWxsoNRoCA1IXq4rMu9DPwHaE8?rs=1&pid=ImgDetMain', DEFAULT, DEFAULT, 3),
('烤金针菇', '新鲜金针菇，口感爽滑', 5.00, 0, 'https://th.bing.com/th/id/OIP.4uP4Cs7sNfsEzWTxEuh58gHaE8?rs=1&pid=ImgDetMain', DEFAULT, DEFAULT, 3),
('烤土豆片', '土豆片外酥内软', 4.00, 0, 'https://img95.699pic.com/photo/50099/7139.jpg_wh860.jpg', DEFAULT, DEFAULT, 3),
('烤年糕', '韩式年糕，香甜软糯', 4.00, 0, 'https://th.bing.com/th/id/OIP.3VCucJymYHtgai60NKA0QQHaE8?rs=1&pid=ImgDetMain', DEFAULT, DEFAULT, 4); 

-- 插入初始优惠券数据
INSERT INTO `coupon` VALUES (1, 'COUPON1736841634347486', '7折', 'percentage', 7.00, 10.00, 15.00, 1, '2025-01-14 16:00:34', '2025-01-14 16:00:34');
INSERT INTO `coupon` VALUES (2, 'COUPON1736841649191534', '8折', 'percentage', 8.00, 20.00, 20.00, 1, '2025-01-14 16:00:49', '2025-01-14 16:00:49');
INSERT INTO `coupon` VALUES (3, 'COUPON1736841671356512', '9折', 'percentage', 9.00, 20.00, 25.00, 1, '2025-01-14 16:01:11', '2025-01-14 16:01:11');
INSERT INTO `coupon` VALUES (4, 'COUPON1736841688710706', '免单', 'percentage', 0.00, 0.00, 5.00, 1, '2025-01-14 16:01:28', '2025-01-14 16:01:28');
INSERT INTO `coupon` VALUES (5, 'COUPON1736841706678328', '立减30', 'amount', 30.00, 30.00, 10.00, 1, '2025-01-14 16:01:46', '2025-01-14 16:01:46');
INSERT INTO `coupon` VALUES (6, 'COUPON1736841721876531', '立减20', 'amount', 20.00, 20.00, 15.00, 1, '2025-01-14 16:02:01', '2025-01-14 16:02:01');
INSERT INTO `coupon` VALUES (7, 'COUPON1736841743979239', '立减50', 'amount', 50.00, 50.00, 10.00, 1, '2025-01-14 16:02:23', '2025-01-14 16:02:23');
