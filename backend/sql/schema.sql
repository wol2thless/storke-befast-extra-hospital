-- ==============================================================
--  Stroke-BeFast: Database Schema
--  สร้าง database ชื่อ "stroke" แล้ว import ไฟล์นี้
--  เช่น: mysql -u root -p stroke < schema.sql
-- ==============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- stk_adl_answers
-- ----------------------------
DROP TABLE IF EXISTS `stk_adl_answers`;
CREATE TABLE `stk_adl_answers` (
  `id`             int(11)      NOT NULL AUTO_INCREMENT,
  `assessment_id`  int(11)      NOT NULL,
  `question_key`   varchar(50)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer_value`   int(11)      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assessment_id` (`assessment_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- stk_adl_assessments
-- ----------------------------
DROP TABLE IF EXISTS `stk_adl_assessments`;
CREATE TABLE `stk_adl_assessments` (
  `id`               int(11)        NOT NULL AUTO_INCREMENT,
  `pid`              varchar(50)    COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_score`      int(11)        NOT NULL,
  `max_score`        int(11)        NOT NULL,
  `percent`          decimal(5,2)   NOT NULL,
  `interpretation`   varchar(255)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `dependency_level` varchar(255)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at`       timestamp      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       timestamp      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- stk_admin_users  (ต้อง DROP ก่อน sessions เพราะมี FK)
-- ----------------------------
DROP TABLE IF EXISTS `stk_admin_sessions`;
DROP TABLE IF EXISTS `stk_admin_users`;
CREATE TABLE `stk_admin_users` (
  `id`            int(11)      NOT NULL AUTO_INCREMENT,
  `provider_id`   varchar(50)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `name`          varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role`          enum('admin','staff','supervisor') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'staff',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active`     tinyint(1)   NOT NULL DEFAULT '1',
  `created_at`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `provider_id` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- stk_admin_sessions
-- ----------------------------
CREATE TABLE `stk_admin_sessions` (
  `id`         int(11)      NOT NULL AUTO_INCREMENT,
  `admin_id`   int(11)      NOT NULL,
  `token`      varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  UNIQUE KEY `admin_id` (`admin_id`),
  KEY `expires_at` (`expires_at`),
  CONSTRAINT `fk_admin_sessions_admin_id`
    FOREIGN KEY (`admin_id`) REFERENCES `stk_admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- stk_exercise_records
-- ----------------------------
DROP TABLE IF EXISTS `stk_exercise_records`;
CREATE TABLE `stk_exercise_records` (
  `id`         int(11)     NOT NULL AUTO_INCREMENT,
  `pid`        varchar(50) NOT NULL,
  `status`     varchar(20) NOT NULL,
  `note`       text,
  `created_at` timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- stk_health_behavior
-- ----------------------------
DROP TABLE IF EXISTS `stk_health_behavior`;
CREATE TABLE `stk_health_behavior` (
  `id`         int(11)     NOT NULL AUTO_INCREMENT COMMENT 'รหัสอัตโนมัติ',
  `pid`        varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'รหัสผู้ป่วย',
  `behaviors`  text        COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'พฤติกรรมสุขภาพในรูปแบบ JSON string',
  `note`       text        COLLATE utf8mb4_unicode_ci COMMENT 'รายละเอียดเพิ่มเติม',
  `created_at` timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้าง',
  `updated_at` timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันที่อัปเดต',
  PRIMARY KEY (`id`),
  KEY `idx_pid` (`pid`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางบันทึกพฤติกรรมสุขภาพ';

-- ----------------------------
-- stk_health_record (legacy — เก็บไว้สำหรับความเข้ากันได้)
-- ----------------------------
DROP TABLE IF EXISTS `stk_health_record`;
CREATE TABLE `stk_health_record` (
  `id`          int(11)     NOT NULL AUTO_INCREMENT,
  `pid`         varchar(13) NOT NULL,
  `record_date` datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `symptoms`    varchar(20) NOT NULL,
  `note`        text,
  PRIMARY KEY (`id`),
  KEY `pid_idx` (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- stk_health_record_befast
-- ----------------------------
DROP TABLE IF EXISTS `stk_health_record_befast`;
CREATE TABLE `stk_health_record_befast` (
  `id`          int(11)     NOT NULL AUTO_INCREMENT,
  `pid`         varchar(13) NOT NULL,
  `record_date` datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `symptoms`    varchar(20) NOT NULL,
  `note`        text,
  PRIMARY KEY (`id`),
  KEY `pid_idx` (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- stk_medication_records
-- ----------------------------
DROP TABLE IF EXISTS `stk_medication_records`;
CREATE TABLE `stk_medication_records` (
  `id`         int(11)     NOT NULL AUTO_INCREMENT,
  `pid`        varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'รหัสผู้ป่วย',
  `status`     varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'สถานะการรับประทานยา (taken, partial, missed, stopped)',
  `meal_times` text        COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ช่วงเวลาการรับประทานยา (before_meal,after_meal,before_bed)',
  `meals`      text        COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'มื้ออาหารในรูปแบบ JSON string',
  `note`       text        COLLATE utf8mb4_unicode_ci COMMENT 'รายละเอียดเพิ่มเติม',
  `created_at` timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้าง',
  `updated_at` timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันที่อัปเดต',
  PRIMARY KEY (`id`),
  KEY `idx_pid` (`pid`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางบันทึกการรับประทานยาอย่างต่อเนื่อง';

-- ----------------------------
-- stk_nutrition_records
-- ----------------------------
DROP TABLE IF EXISTS `stk_nutrition_records`;
CREATE TABLE `stk_nutrition_records` (
  `id`         int(11)     NOT NULL AUTO_INCREMENT,
  `pid`        varchar(32) NOT NULL,
  `status`     varchar(32) NOT NULL,
  `note`       text,
  `created_at` datetime    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- stk_personinfo
-- ----------------------------
DROP TABLE IF EXISTS `stk_personinfo`;
CREATE TABLE `stk_personinfo` (
  `id`              int(11)      NOT NULL AUTO_INCREMENT,
  `pid`             varchar(13)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_th`         varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en`         varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender`          enum('ชาย','หญิง','ไม่ระบุ') COLLATE utf8mb4_unicode_ci DEFAULT 'ไม่ระบุ',
  `birthdate`       date         DEFAULT NULL,
  `occupation`      varchar(50)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otherOccupation` varchar(50)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `education`       varchar(50)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone`           varchar(20)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address`         text         COLLATE utf8mb4_unicode_ci,
  `created_at`      datetime     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pid` (`pid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- stk_satisfaction_survey
-- ----------------------------
DROP TABLE IF EXISTS `stk_satisfaction_survey`;
CREATE TABLE `stk_satisfaction_survey` (
  `id`                  int(11)     NOT NULL AUTO_INCREMENT,
  `pid`                 varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'รหัสผู้ป่วย',
  `ratings`             text        COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'คะแนนการประเมินในรูปแบบ JSON string',
  `additional_comment`  text        COLLATE utf8mb4_unicode_ci COMMENT 'ความคิดเห็นเพิ่มเติม',
  `prevention_comment`  text        COLLATE utf8mb4_unicode_ci COMMENT 'ความคิดเห็นเกี่ยวกับการป้องกันการกลับมาเป็นซ้ำ',
  `created_at`          timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'วันที่สร้าง',
  `updated_at`          timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'วันที่อัปเดต',
  PRIMARY KEY (`id`),
  KEY `idx_pid` (`pid`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ตารางแบบสำรวจความพึงพอใจ';

-- ----------------------------
-- stk_video_view_log
-- ----------------------------
DROP TABLE IF EXISTS `stk_video_view_log`;
CREATE TABLE `stk_video_view_log` (
  `id`        int(11)     NOT NULL AUTO_INCREMENT,
  `pid`       varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_id`  int(11)     NOT NULL,
  `viewed_at` datetime    NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pid` (`pid`),
  KEY `video_id` (`video_id`),
  KEY `viewed_at` (`viewed_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
