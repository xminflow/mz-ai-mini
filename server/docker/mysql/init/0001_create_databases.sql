CREATE DATABASE IF NOT EXISTS `mz_ai_backend_dev`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `mz_ai_backend_test`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON `mz_ai_backend_dev`.* TO 'mzai'@'%';
GRANT ALL PRIVILEGES ON `mz_ai_backend_test`.* TO 'mzai'@'%';
FLUSH PRIVILEGES;
