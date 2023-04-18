/* Replace with your SQL commands */
CREATE TABLE `players` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT "プレイヤーID",
  `name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_general_ci' COMMENT "プレイヤー名",
  `hp` INT(11) UNSIGNED NOT NULL COMMENT "体力",
  `mp` INT(11) UNSIGNED NOT NULL COMMENT "気力",
  `money` INT(11) UNSIGNED NOT NULL COMMENT "所持金",
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
