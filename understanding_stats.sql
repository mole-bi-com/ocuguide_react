-- Function to get understanding level statistics
CREATE OR REPLACE FUNCTION get_understanding_level_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Calculate understanding statistics by step
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'step_id', step_info.step_id,
        'step_name', step_info.step_name,
        'total_count', step_info.total_count,
        'level_1_count', COALESCE(ul.level_1_count, 0),
        'level_2_count', COALESCE(ul.level_2_count, 0),
        'level_3_count', COALESCE(ul.level_3_count, 0),
        'level_4_count', COALESCE(ul.level_4_count, 0),
        'understanding_rate', CASE 
          WHEN step_info.total_count > 0 THEN 
            ROUND((COALESCE(ul.level_3_count, 0) + COALESCE(ul.level_4_count, 0))::numeric / step_info.total_count * 100)
          ELSE 0
        END
      )
    ) INTO result
  FROM (
    -- Get step info and total counts
    SELECT 
      step_id,
      step_name,
      COUNT(*) as total_count
    FROM steps
    GROUP BY step_id, step_name
  ) step_info
  LEFT JOIN LATERAL (
    -- Calculate counts for each understanding level
    SELECT
      COUNT(*) FILTER (WHERE understanding_level = 1) as level_1_count,
      COUNT(*) FILTER (WHERE understanding_level = 2) as level_2_count,
      COUNT(*) FILTER (WHERE understanding_level = 3) as level_3_count,
      COUNT(*) FILTER (WHERE understanding_level = 4) as level_4_count
    FROM steps s
    WHERE s.step_id = step_info.step_id
  ) ul ON true
  ORDER BY step_info.step_id;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_understanding_level_stats() TO authenticated, anon;

-- Example of how to call the function from SQL
-- SELECT get_understanding_level_stats();

-- Example of how to call the function from Supabase client
-- const { data, error } = await supabase.rpc('get_understanding_level_stats'); 