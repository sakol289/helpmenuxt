CREATE TABLE `TopicEvaluation` (
	`id` int NOT NULL AUTO_INCREMENT,
	`code` varchar(30) NOT NULL,
	`name` varchar(255) NOT NULL,
	`year` varchar(4) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`description` text,
	`status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `CategoryEvaluation` (
	`id` int NOT NULL AUTO_INCREMENT,
	`code` varchar(30) NOT NULL,
	`name` varchar(255) NOT NULL, 
	`weight` int NOT NULL,
	`type` enum('score', 'yes_or_no','file_or_url') NOT NULL,
	`description` text,
	`status` enum('active', 'inactive') NOT NULL DEFAULT 'active',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`topic_evaluation_id` int NOT NULL,
	PRIMARY KEY (`id`),
	KEY `idx_category_topic` (`topic_evaluation_id`),
	CONSTRAINT `fk_category_topic`
		FOREIGN KEY (`topic_evaluation_id`) REFERENCES `TopicEvaluation`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `department` enum('เทคโนโลยีสารสนเทศ','โยธา','ไฟฟ้ากำลัง') NOT NULL,
  `role` enum('ผู้ดูแล','ผู้ประเมิน','ผู้ถูกประเมิน') NOT NULL,
  `status` enum('active','disabled') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `firstname`, `lastname`, `password`, `department`, `role`, `status`, `create_at`, `updated_at`) VALUES
(1, 'admin@admin.com', 'admin', 'admin', '12345678', 'ไฟฟ้ากำลัง', 'ผู้ดูแล', 'active', '2025-11-15 17:00:00', '2025-11-24 12:34:05');

CREATE TABLE `committee_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `evaluator_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `role` enum('ประธาน', 'กรรมการ') NOT NULL DEFAULT 'กรรมการ',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `evaluation_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `evaluator_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `total_score` int DEFAULT NULL,
  `summary` text,
  `status` enum('draft', 'final') NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `self_upload_port` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `topic_id` int NOT NULL,
  `category_id` int NOT NULL,
  `status` enum('draft', 'submitted') NOT NULL DEFAULT 'draft',
  `file_original_name` varchar(255),
  `file_stored_name` varchar(255),
  `file_mime` varchar(100),
  `file_size` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `evaluation_category_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `evaluator_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `category_id` int NOT NULL,
  `value_number` decimal(10,2) DEFAULT NULL,
  `value_boolean` tinyint(1) DEFAULT NULL,
  `value_text` text,
  `status` enum('draft', 'final') NOT NULL DEFAULT 'draft',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_eval_category` (`evaluator_id`, `evaluatee_id`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
