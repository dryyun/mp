#
# SQL Export
# Created by Querious (201026)
# Created: 2018年6月1日 GMT+8 下午3:06:01
# Encoding: Unicode (UTF-8)
#


SET @PREVIOUS_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;


DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `notice_list`;
DROP TABLE IF EXISTS `notice`;
DROP TABLE IF EXISTS `meta`;
DROP TABLE IF EXISTS `location`;


CREATE TABLE `location` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(50) NOT NULL,
  `latitude` varchar(20) NOT NULL DEFAULT '' COMMENT '微信返回的纬度',
  `longitude` varchar(20) NOT NULL DEFAULT '' COMMENT '微信返回的经度',
  `precision` varchar(20) NOT NULL DEFAULT '' COMMENT '微信返回的地理位置精度',
  `county` varchar(128) DEFAULT NULL,
  `province` varchar(128) DEFAULT NULL,
  `city` varchar(128) DEFAULT NULL,
  `district` varchar(128) DEFAULT NULL,
  `source` varchar(30) DEFAULT NULL,
  `original_data` text,
  `status` tinyint(4) DEFAULT '0' COMMENT '0 - 有效\n1 - 无效',
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `openid` (`openid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户最近位置信息，一个用户一条记录，覆盖';


CREATE TABLE `meta` (
  `key` varchar(50) NOT NULL DEFAULT '',
  `openid` varchar(50) NOT NULL DEFAULT '' COMMENT 'root 代表全局配置',
  `value` text,
  `extra` text,
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`key`,`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `notice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `openid` varchar(50) NOT NULL,
  `title` varchar(50) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `notice_time` timestamp NULL DEFAULT NULL COMMENT '设置的提醒时间',
  `repeat_frequency` enum('day','week','month','year','never') DEFAULT 'never' COMMENT '重复频率',
  `repeat_end_options` enum('never','after_date') DEFAULT 'never' COMMENT '重复结束选项\nnever - 从不结束\nafter_times  - 提醒几次之后结束\nafter_date - 某个时间点之后结束',
  `repeat_end_setting` date DEFAULT NULL,
  `alert_time_options` enum('five_minutes_before','thirty_minutes_before','one_day_before','two_days_before') DEFAULT 'five_minutes_before' COMMENT '发出提醒，设置选项',
  `alert_time` timestamp NULL DEFAULT NULL COMMENT '发出提醒的时间，会有个 cron job  根据其余的参数设置，定时更新这个参数',
  `status` tinyint(4) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `openid` (`openid`) USING BTREE,
  KEY `repeat_frequency` (`repeat_frequency`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `notice_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `notice_id` int(11) DEFAULT '0',
  `notice_time` timestamp NULL DEFAULT '0000-00-00 00:00:00',
  `status` tinyint(4) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notice` (`notice_id`,`notice_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `user` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(50) NOT NULL,
  `nickname` varchar(128) DEFAULT NULL,
  `sex` tinyint(4) DEFAULT '0',
  `country` varchar(128) DEFAULT NULL,
  `province` varchar(128) DEFAULT NULL,
  `city` varchar(128) DEFAULT NULL,
  `original_data` text,
  `status` tinyint(4) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT NULL,
  `updatedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `openid` (`openid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




SET FOREIGN_KEY_CHECKS = @PREVIOUS_FOREIGN_KEY_CHECKS;


