ALTER TABLE `users`
    ADD COLUMN `nickname` VARCHAR(128) NULL AFTER `union_id`,
    ADD COLUMN `avatar_url` VARCHAR(512) NULL AFTER `nickname`;
