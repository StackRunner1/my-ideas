-- Analytics Views for Dashboard
-- Session 3, Unit 11: Recharts Integration
-- Created: 2025-12-02

-- View: items_by_date
-- Aggregates idea count by creation date (last 30 days)
CREATE OR REPLACE VIEW items_by_date AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as count
FROM ideas
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View: items_by_status
-- Aggregates idea count by status
CREATE OR REPLACE VIEW items_by_status AS
SELECT
  status,
  COUNT(*) as count
FROM ideas
GROUP BY status
ORDER BY count DESC;

-- View: tags_usage
-- Aggregates tag usage from ideas.tags array (top 10 most used tags)
CREATE OR REPLACE VIEW tags_usage AS
SELECT
  unnest(tags) as label,
  COUNT(*) as usage_count
FROM ideas
WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
GROUP BY unnest(tags)
ORDER BY usage_count DESC
LIMIT 10;

-- View: user_activity
-- Aggregates user actions over time (ideas created per day, last 90 days)
CREATE OR REPLACE VIEW user_activity AS
SELECT
  DATE(created_at) as activity_date,
  user_id,
  COUNT(*) as items_created
FROM ideas
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at), user_id
ORDER BY activity_date DESC, user_id;

-- Grant permissions (views inherit RLS from underlying tables)
-- No additional grants needed as RLS policies on ideas table will apply
