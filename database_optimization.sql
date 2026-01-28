-- Database Optimization Script for environment_dashboard
-- Based on schema analysis of ohm_sensor_2026-01-27.sql

-- 1. Optimize `grounding_logs` (CRITICAL)
-- Currently has no index on line_id/timestamp, causing full table scans during status checks.
ALTER TABLE `grounding_logs` ADD INDEX `idx_grounding_lookup` (`line_id`, `timestamp` DESC);

-- 2. Optimize `airpressure_data`
-- Currently looks up by devid and sorts by created_at, but has no index.
ALTER TABLE `airpressure_data` ADD INDEX `idx_pressure_lookup` (`devid`, `created_at` DESC);

-- 3. Optional: Convert `temphygro_data` to InnoDB
-- MyISAM is older and prone to corruption on crashes. InnoDB is the modern standard (and supports row-level locking).
-- WARNING: This operation might take time if the table is huge (GBs of data).
-- ALTER TABLE `temphygro_data` ENGINE=InnoDB;

-- 4. Verify Indexes
-- Run this to check if indexes were applied:
-- SHOW INDEX FROM grounding_logs;
-- SHOW INDEX FROM airpressure_data;
