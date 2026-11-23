CREATE DATABASE IF NOT EXISTS bluemoon_sprint1
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE bluemoon_sprint1;

CREATE TABLE IF NOT EXISTS households (
    id CHAR(36) PRIMARY KEY,
    apartment_number VARCHAR(50) NOT NULL UNIQUE,
    area DECIMAL(10,2) NOT NULL,
    head_name VARCHAR(150) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CHECK (area > 0)
);

CREATE TABLE IF NOT EXISTS residents (
    id CHAR(36) PRIMARY KEY,
    household_id CHAR(36) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    birth_date DATE NOT NULL,
    national_id VARCHAR(12) NULL,
    relationship ENUM('Chủ hộ', 'Vợ/chồng', 'Con', 'Cha/mẹ', 'Khác') NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_resident_household
        FOREIGN KEY (household_id) REFERENCES households(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CHECK (
        national_id IS NULL
        OR national_id = ''
        OR national_id REGEXP '^[0-9]{12}$'
    )
);

CREATE TABLE IF NOT EXISTS accounts (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);