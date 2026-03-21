-- Admin-level aggregation for card view stats (avoids Supabase default 1000-row limit)

-- Per-tutor aggregated stats
CREATE OR REPLACE FUNCTION get_admin_card_view_stats()
RETURNS TABLE(
  tutor_id uuid,
  total_views bigint,
  unique_visitors bigint,
  views_this_week bigint,
  views_last_week bigint
) AS $$
  SELECT
    cv.tutor_id,
    COUNT(*)::bigint AS total_views,
    COUNT(DISTINCT cv.visitor_hash)::bigint AS unique_visitors,
    COUNT(*) FILTER (WHERE cv.created_at >= now() - interval '7 days')::bigint AS views_this_week,
    COUNT(*) FILTER (WHERE cv.created_at >= now() - interval '14 days' AND cv.created_at < now() - interval '7 days')::bigint AS views_last_week
  FROM card_views cv
  GROUP BY cv.tutor_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Global aggregated stats (unique_viewers must be computed globally, not summed per-tutor)
CREATE OR REPLACE FUNCTION get_admin_card_view_global_stats()
RETURNS TABLE(
  total_views bigint,
  unique_viewers bigint,
  views_this_week bigint,
  views_last_week bigint
) AS $$
  SELECT
    COUNT(*)::bigint,
    COUNT(DISTINCT visitor_hash)::bigint,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::bigint,
    COUNT(*) FILTER (WHERE created_at >= now() - interval '14 days' AND created_at < now() - interval '7 days')::bigint
  FROM card_views;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
