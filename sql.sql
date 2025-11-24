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
	`score_min` int NOT NULL,
	`score_max` int NOT NULL,
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

CREATE TABLE `evaluation_rounds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `year` varchar(4) NOT NULL,
  `status` enum('draft', 'active', 'archived') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `committee_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `evaluation_id` int NOT NULL,
  `evaluator_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `role` enum('chair', 'member') NOT NULL DEFAULT 'member',
  `status` enum('not_started', 'in_progress', 'submitted') NOT NULL DEFAULT 'not_started',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_assignment` (`evaluation_id`, `evaluator_id`, `evaluatee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `evaluation_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `evaluation_id` int NOT NULL,
  `evaluator_id` int NOT NULL,
  `evaluatee_id` int NOT NULL,
  `total_score` int DEFAULT NULL,
  `summary` text,
  `status` enum('draft', 'final') NOT NULL DEFAULT 'draft',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
